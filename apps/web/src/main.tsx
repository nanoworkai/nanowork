// @ts-nocheck
import React from 'react'
import ReactDOM from 'react-dom/client'

// BULLETPROOF MAIN.TSX FOR DEPLOYMENT DEBUGGING
// This file progressively adds features with error boundaries at each layer.
// If anything fails, you'll see exactly which layer failed, not a blank page.

// ============================================================================
// LAYER 1: Error Boundary Component
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: (error: Error) => React.ReactNode
  name: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.name}] Error caught:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error)
    }
    return this.props.children
  }
}

// ============================================================================
// LAYER 2: Minimum Viable Render (Fallback)
// ============================================================================

function MinimumViableApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#fafaf9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: '16px',
      }}>
        Nanowork
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#64748b',
        marginBottom: '24px',
      }}>
        App is initializing...
      </p>
      <div style={{
        fontSize: '14px',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        <p>If you're seeing this for more than a few seconds, check the console for errors.</p>
      </div>
    </div>
  )
}

// ============================================================================
// LAYER 3: Environment Check
// ============================================================================

function EnvironmentStatus() {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
  }

  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  const hasSupabase = !!(envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#fafaf9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: '16px',
      }}>
        Nanowork
      </h1>

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '16px',
        }}>
          Environment Status
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: hasSupabase ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${hasSupabase ? '#86efac' : '#fca5a5'}`,
            borderRadius: '6px',
            marginBottom: '8px',
          }}>
            <strong style={{ color: hasSupabase ? '#166534' : '#991b1b' }}>
              {hasSupabase ? '✓ Supabase Configured' : '✗ Supabase Missing'}
            </strong>
          </div>
        </div>

        {missingVars.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '8px',
            }}>
              Missing Environment Variables:
            </p>
            <ul style={{
              fontSize: '13px',
              color: '#64748b',
              paddingLeft: '20px',
              margin: 0,
            }}>
              {missingVars.map(v => (
                <li key={v} style={{ marginBottom: '4px' }}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{
          fontSize: '13px',
          color: '#94a3b8',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
        }}>
          <p style={{ margin: 0 }}>
            <strong>Debug Info:</strong><br/>
            The app attempted to load but encountered configuration issues.
            Check the browser console for detailed logs.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// LAYER 4: Lazy Load Main App Components
// ============================================================================

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafaf9',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function ComponentError({ error, componentName }: { error: Error; componentName: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#fafaf9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: '16px',
      }}>
        Nanowork
      </h1>

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#dc2626',
          marginBottom: '16px',
        }}>
          {componentName} Failed to Load
        </h2>

        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: 0,
            fontFamily: 'monospace',
          }}>
            {error.message}
          </p>
        </div>

        <details style={{ marginBottom: '16px' }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
          }}>
            Stack Trace
          </summary>
          <pre style={{
            fontSize: '12px',
            color: '#475569',
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            margin: 0,
          }}>
            {error.stack}
          </pre>
        </details>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// LAYER 5: Progressive App Loader
// ============================================================================

function AppLoader() {
  const [loadStatus, setLoadStatus] = React.useState<{
    stage: 'styles' | 'router' | 'auth' | 'app' | 'complete'
    error: Error | null
  }>({ stage: 'styles', error: null })

  React.useEffect(() => {
    async function loadApp() {
      try {
        // Stage 1: Load styles
        console.log('[AppLoader] Loading styles...')
        await import('./index.css').catch(err => {
          console.warn('[AppLoader] Failed to load index.css:', err)
          // Non-critical - continue anyway
        })
        setLoadStatus({ stage: 'router', error: null })

        // Stage 2: Load Router
        console.log('[AppLoader] Loading router...')
        const { BrowserRouter } = await import('react-router-dom')
        setLoadStatus({ stage: 'auth', error: null })

        // Stage 3: Load Auth Context
        console.log('[AppLoader] Loading auth context...')
        const { AuthProvider } = await import('./context/AuthContext')
        setLoadStatus({ stage: 'app', error: null })

        // Stage 4: Load App
        console.log('[AppLoader] Loading app...')
        const { default: App } = await import('./App')
        setLoadStatus({ stage: 'complete', error: null })

        // Render the full app
        console.log('[AppLoader] All components loaded successfully')

        // Mount the full app
        const root = document.getElementById('root')
        if (!root) {
          throw new Error('Root element not found')
        }

        ReactDOM.createRoot(root).render(
          <React.StrictMode>
            <ErrorBoundary
              name="RouterBoundary"
              fallback={(error) => <ComponentError error={error} componentName="Router" />}
            >
              <BrowserRouter>
                <ErrorBoundary
                  name="AuthBoundary"
                  fallback={(error) => <ComponentError error={error} componentName="AuthProvider" />}
                >
                  <AuthProvider>
                    <ErrorBoundary
                      name="AppBoundary"
                      fallback={(error) => <ComponentError error={error} componentName="App" />}
                    >
                      <App />
                    </ErrorBoundary>
                  </AuthProvider>
                </ErrorBoundary>
              </BrowserRouter>
            </ErrorBoundary>
          </React.StrictMode>
        )
      } catch (error) {
        console.error('[AppLoader] Failed to load app:', error)
        setLoadStatus({
          stage: loadStatus.stage,
          error: error instanceof Error ? error : new Error(String(error))
        })
      }
    }

    loadApp()
  }, [])

  if (loadStatus.error) {
    return <ComponentError error={loadStatus.error} componentName={`Stage: ${loadStatus.stage}`} />
  }

  if (loadStatus.stage !== 'complete') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#fafaf9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '16px',
        }}>
          Nanowork
        </h1>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }} />
        <p style={{
          fontSize: '14px',
          color: '#64748b',
        }}>
          Loading {loadStatus.stage}...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return null
}

// ============================================================================
// LAYER 6: Initial Bootstrap
// ============================================================================

function bootstrap() {
  console.log('[Bootstrap] Starting Nanowork app...')
  console.log('[Bootstrap] Environment:', {
    NODE_ENV: import.meta.env.MODE,
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  })

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('[Bootstrap] Root element not found!')
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Nanowork</h1><p>Error: Root element not found in HTML.</p></div>'
    return
  }

  try {
    const root = ReactDOM.createRoot(rootElement)

    root.render(
      <React.StrictMode>
        <ErrorBoundary
          name="TopLevelBoundary"
          fallback={(error) => {
            console.error('[TopLevelBoundary] Critical error:', error)
            return (
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                backgroundColor: '#fafaf9',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '20px',
              }}>
                <h1 style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}>
                  Nanowork
                </h1>
                <ComponentError error={error} componentName="Application Bootstrap" />
              </div>
            )
          }}
        >
          <AppLoader />
        </ErrorBoundary>
      </React.StrictMode>
    )

    console.log('[Bootstrap] React root created successfully')
  } catch (error) {
    console.error('[Bootstrap] Failed to create React root:', error)
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
        <h1 style="font-size: 48px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">Nanowork</h1>
        <div style="background-color: white; border: 1px solid #fca5a5; border-radius: 8px; padding: 24px; max-width: 600px; width: 100%;">
          <h2 style="font-size: 20px; font-weight: 600; color: #dc2626; margin-bottom: 16px;">Critical Bootstrap Error</h2>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">The application failed to initialize.</p>
          <pre style="font-size: 12px; color: #475569; background-color: #f8fafc; padding: 12px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
          <button onclick="window.location.reload()" style="width: 100%; padding: 12px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 16px;">Reload Page</button>
        </div>
      </div>
    `
  }
}

// ============================================================================
// START THE APP
// ============================================================================

bootstrap()
