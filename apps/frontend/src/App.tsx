import { useEffect, useState } from 'react'
import './App.css'

const googleAuthUrl = 'https://accounts.google.com/signin'
const homePath = '/home'

function getIsSignedIn() {
  const authKeys = [
    'nanowork-auth',
    'nanowork-user',
    'google-auth-token',
    'authToken',
  ]

  return authKeys.some((key) => window.localStorage.getItem(key))
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleTryNow = () => {
    if (getIsSignedIn()) {
      window.history.pushState({}, '', homePath)
      setPathname(homePath)
      return
    }

    window.location.href = googleAuthUrl
  }

  if (pathname === homePath) {
    return <main className="home-page" />
  }

  return (
    <main className="landing-page">
      <header className="topbar">
        <a className="navbar" href={googleAuthUrl}>
          <span className="brand">Nanowork</span>
        </a>
      </header>

      <section className="hero">
        <h1>
          We build AI that launches and runs self-sustaining businesses from a
          single prompt.
        </h1>

        <div className="actions">
          <button className="cta-button" type="button" onClick={handleTryNow}>
            Try now
          </button>
        </div>
      </section>

      <footer className="footer">
        <p>Copyright 2026 Nanowork. All rights reserved.</p>
        <a href="mailto:founders@nanowork.ai">Contact us at founders@nanowork.ai</a>
      </footer>
    </main>
  )
}

export default App
