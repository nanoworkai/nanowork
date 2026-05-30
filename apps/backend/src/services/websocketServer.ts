import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { IncomingMessage } from 'http';
import { getOrchestrator } from './agentOrchestrator';
import { getSupabase } from './supabase';

interface WebSocketClient extends WebSocket {
  buildId?: string;
  userId?: string;
  isAlive?: boolean;
  isAuthenticated?: boolean;
}

export class WebSocketServer {
  private wss: WebSocket.Server;

  constructor(server: HTTPServer) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
    });

    this.initialize();
  }

  private initialize() {
    // Heartbeat to detect dead connections
    const heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(heartbeatInterval);
    });

    this.wss.on('connection', async (ws: WebSocketClient, req: IncomingMessage) => {
      ws.isAlive = true;
      ws.isAuthenticated = false;

      // Extract token from query string or headers
      const token = this.extractToken(req);

      if (token) {
        // Verify token and authenticate connection
        const userId = await this.authenticateConnection(token);
        if (userId) {
          ws.userId = userId;
          ws.isAuthenticated = true;
          console.log(`WebSocket authenticated for user: ${userId}`);
        }
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format',
          }));
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        authenticated: ws.isAuthenticated,
      }));
    });
  }

  private handleMessage(ws: WebSocketClient, data: any) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscribe(ws, data.buildId);
        break;

      case 'unsubscribe':
        this.handleUnsubscribe(ws);
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Unknown message type',
        }));
    }
  }

  private async handleSubscribe(ws: WebSocketClient, buildId: string) {
    // CRITICAL SECURITY CHECK: Verify authentication
    if (!ws.isAuthenticated || !ws.userId) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Authentication required to subscribe to builds',
      }));
      ws.close(1008, 'Authentication required');
      return;
    }

    if (!buildId) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Build ID is required',
      }));
      return;
    }

    // CRITICAL SECURITY CHECK: Verify build ownership
    const ownsBuilds = await this.verifyBuildOwnership(ws.userId, buildId);
    if (!ownsBuilds) {
      console.warn(`User ${ws.userId} attempted to subscribe to unauthorized build ${buildId}`);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'You do not have permission to access this build',
      }));

      // Log security event
      await this.logSecurityEvent({
        event_type: 'unauthorized_build_access',
        user_id: ws.userId,
        resource_type: 'build',
        resource_id: buildId,
        action: 'subscribe_attempt',
      });

      return;
    }

    ws.buildId = buildId;

    // Register with orchestrator
    const orchestrator = getOrchestrator();
    orchestrator.registerClient(buildId, ws);

    // Record subscription in database
    try {
      await getSupabase()
        .from('websocket_subscriptions')
        .insert({
          user_id: ws.userId,
          build_id: buildId,
          session_id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
    } catch (error) {
      console.error('Failed to record WebSocket subscription:', error);
      // Non-blocking - continue with subscription
    }

    ws.send(JSON.stringify({
      type: 'subscribed',
      buildId,
    }));
  }

  private handleUnsubscribe(ws: WebSocketClient) {
    const buildId = ws.buildId;
    ws.buildId = undefined;

    // Remove subscription from database
    if (ws.userId && buildId) {
      getSupabase()
        .from('websocket_subscriptions')
        .delete()
        .eq('user_id', ws.userId)
        .eq('build_id', buildId)
        .then(() => {
          console.log(`Removed subscription for user ${ws.userId} from build ${buildId}`);
        })
        .catch(error => {
          console.error('Failed to remove WebSocket subscription:', error);
        });
    }

    ws.send(JSON.stringify({
      type: 'unsubscribed',
    }));
  }

  /**
   * Extract JWT token from WebSocket request
   */
  private extractToken(req: IncomingMessage): string | null {
    // Try query parameter first (for browser WebSocket connections)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const tokenFromQuery = url.searchParams.get('token');
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Try authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Authenticate WebSocket connection using Supabase JWT
   */
  private async authenticateConnection(token: string): Promise<string | null> {
    try {
      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error('WebSocket authentication failed:', error?.message);
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      return null;
    }
  }

  /**
   * Verify that a user owns a build
   */
  private async verifyBuildOwnership(userId: string, buildId: string): Promise<boolean> {
    try {
      const supabase = getSupabase();

      // Use the database function for consistent ownership checks
      const { data, error } = await supabase.rpc('verify_build_ownership', {
        p_user_id: userId,
        p_build_id: buildId,
      });

      if (error) {
        console.error('Build ownership verification error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Build ownership verification failed:', error);
      return false;
    }
  }

  /**
   * Log security events to audit log
   */
  private async logSecurityEvent(event: {
    event_type: string;
    user_id: string;
    resource_type: string;
    resource_id: string;
    action: string;
  }): Promise<void> {
    try {
      await getSupabase()
        .from('security_audit_log')
        .insert({
          ...event,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(server: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
    console.log('✅ WebSocket server initialized at /ws');
  }
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer;
}
