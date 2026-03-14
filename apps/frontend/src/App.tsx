import { useState } from 'react'
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import {
  dashboardPath,
  handleCtaRedirection,
  oauthSuccessPath,
} from './OAuthSuccess.js'

import OAuthSuccess from './OAuthSuccess.js'
const profilePath = '/profile'
const walletPath = '/wallet'
const reportBugsPath = '/reportbugs'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <main className="dashboard-page">
      <button
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        type="button"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Nanowork</span>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Your Businesses</div>
          <button className="sidebar-item active" type="button">
            Today
          </button>
          <button className="sidebar-item" type="button">
            AI consulting workspace
          </button>
          <button className="sidebar-item" type="button">
            E-commerce automation
          </button>
          <button className="sidebar-item" type="button">
            Creator monetization plan
          </button>
        </nav>
        <div className="sidebar-footer">
          <a
            className="sidebar-icon-button profile-link"
            href={profilePath}
            aria-label="Profile"
          >
            <span className="profile-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </a>
          <a
            className="sidebar-icon-button"
            href={walletPath}
            aria-label="Connect wallet"
          >
            <span className="wallet-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </a>
          <a
            className="sidebar-icon-button"
            href="mailto:founders@nanowork.ai"
            aria-label="Email founders@nanowork.ai"
          >
            <span className="mail-icon" aria-hidden="true">
              <span />
            </span>
          </a>
          <a
            className="sidebar-icon-button"
            href={reportBugsPath}
            aria-label="Bug reports"
          >
            <span className="bug-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </a>
        </div>
      </aside>

      <section className="dashboard-shell">
        <header className="dashboard-topbar">
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="dashboard-title">Nanowork</span>
        </header>

        <div className="chat-layout">
          <div className="chat-thread">
            <article className="message message-assistant">
              <p>What would you like Nanowork to build today?</p>
            </article>
            <article className="message message-user">
              <p>Create an AI-first business from a single prompt.</p>
            </article>
            <article className="message message-assistant">
              <p>
                I can help shape the business, workflows, tooling, and launch
                plan. Start with your idea and constraints.
              </p>
            </article>
          </div>

          <form className="chat-composer">
            <input
              className="chat-input"
              placeholder="Describe the business you want to launch..."
            />
            <button className="chat-send" type="submit">
              ↑
            </button>
          </form>

          <footer className="dashboard-footer">
            <p>
              <span className="dashboard-copyright-icon" aria-hidden="true">©</span>
              <span>All rights reserved</span>
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path={dashboardPath} element={<DashboardPage />} />
      <Route path={profilePath} element={<main className="profile-page" />} />
      <Route path={walletPath} element={<main className="profile-page" />} />
      <Route path={reportBugsPath} element={<main className="profile-page" />} />
      <Route path={oauthSuccessPath} element={<OAuthSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
