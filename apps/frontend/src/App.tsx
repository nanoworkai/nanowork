import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import {
  dashboardPath,
  handleCtaRedirection,
  oauthSuccessPath,
} from './OAuthSuccess.js'

import OAuthSuccess from './OAuthSuccess.js'

function LandingPage() {
  const navigate = useNavigate()

  const handleTryNow = () => {
    handleCtaRedirection(navigate)
  }

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigate('/')
  }

  return (
    <main className="landing-page">
      <header className="topbar">
        <a className="navbar" href="/" onClick={handleNavClick}>
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

function DashboardPage() {
  return <main className="dashboard-page" />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path={dashboardPath} element={<DashboardPage />} />
      <Route path={oauthSuccessPath} element={<OAuthSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
