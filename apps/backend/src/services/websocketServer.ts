import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { getOrchestrator } from './agentOrchestrator';

interface WebSocketClient extends WebSocket {
  buildId?: string;
  isAlive?: boolean;
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

    this.wss.on('connection', (ws: WebSocketClient) => {
      ws.isAlive = true;

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

  private handleSubscribe(ws: WebSocketClient, buildId: string) {
    if (!buildId) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Build ID is required',
      }));
      return;
    }

    ws.buildId = buildId;

    // Register with orchestrator
    const orchestrator = getOrchestrator();
    orchestrator.registerClient(buildId, ws);

    ws.send(JSON.stringify({
      type: 'subscribed',
      buildId,
    }));
  }

  private handleUnsubscribe(ws: WebSocketClient) {
    ws.buildId = undefined;

    ws.send(JSON.stringify({
      type: 'unsubscribed',
    }));
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
