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

function StandardFooter({ className = 'dashboard-footer' }: { className?: string }) {
  return (
    <footer className={className}>
      <p>
        <span className="dashboard-copyright-icon" aria-hidden="true">©</span>
        <span>All rights reserved</span>
      </p>
    </footer>
  )
}

function AppHeader() {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <header className="dashboard-topbar app-page-header">
      <button className="app-back-button" type="button" onClick={handleBack}>
        ↩
      </button>
      <button className="dashboard-home-button" type="button" onClick={() => navigate('/')}>
        <span className="dashboard-title">Nanowork</span>
      </button>
    </header>
  )
}

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

      <StandardFooter className="dashboard-footer" />
    </main>
  )
}

function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

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
          <button
            className="sidebar-home-button"
            type="button"
            onClick={() => navigate('/')}
          >
            <span>Nanowork</span>
          </button>
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
          <button
            className="dashboard-home-button"
            type="button"
            onClick={() => navigate('/')}
          >
            <span className="dashboard-title">Nanowork</span>
          </button>
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
          <StandardFooter className="dashboard-footer" />
        </div>
      </section>
    </main>
  )
}

function ProfilePage() {
  const businesses = [
    { id: 'consulting', name: 'AI consulting workspace', revenue: 18760, profit: 8240, share: 44, customers: 482 },
    { id: 'commerce', name: 'E-commerce automation', revenue: 13240, profit: 5810, share: 31, customers: 391 },
    { id: 'creator', name: 'Creator monetization plan', revenue: 10780, profit: 4380, share: 25, customers: 411 },
  ]
  const [selectedBusinessId, setSelectedBusinessId] = useState(businesses[0].id)
  const selectedBusiness =
    businesses.find((business) => business.id === selectedBusinessId) ?? businesses[0]

  return (
    <main className="profile-page">
      <AppHeader />
      <section className="profile-shell">
        <header className="profile-header">
          <p className="profile-kicker">Business Analytics</p>
          <h1>Performance snapshot</h1>
          <p className="profile-subtitle">
            Track how your autonomous business is performing across revenue,
            efficiency, and operating quality.
          </p>
        </header>

        <section className="profile-metrics-grid">
          <article className="metric-card">
            <span className="metric-label">Businesses Running</span>
            <strong className="metric-value">{businesses.length}</strong>
            <p className="metric-note">Live autonomous businesses under management</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Profit / Loss</span>
            <strong className="metric-value">+$18,430</strong>
            <p className="metric-note">Net movement this month</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Money Made</span>
            <strong className="metric-value">$42,780</strong>
            <p className="metric-note">Tap a business below to inspect who made what</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Active Customers</span>
            <strong className="metric-value">1,284</strong>
            <p className="metric-note">Paying customers across products</p>
          </article>
        </section>

        <section className="profile-breakdown profile-breakdown-focus">
          <article className="breakdown-panel revenue-panel">
            <div className="panel-heading">
              <h2>Revenue by business</h2>
              <span>Click to inspect</span>
            </div>
            <div className="revenue-tiles">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  className={`revenue-tile ${
                    business.id === selectedBusinessId ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => setSelectedBusinessId(business.id)}
                >
                  <span className="revenue-tile-name">{business.name}</span>
                  <strong>${business.revenue.toLocaleString()}</strong>
                </button>
              ))}
            </div>
          </article>

          <article className="breakdown-panel pie-panel">
            <div className="panel-heading">
              <h2>Business mix</h2>
              <span>{selectedBusiness.name}</span>
            </div>
            <div className="pie-panel-body">
              <div
                className="business-pie-chart"
                style={
                  {
                    '--segment-one': `${businesses[0].share}%`,
                    '--segment-two': `${businesses[0].share + businesses[1].share}%`,
                  } as React.CSSProperties
                }
              >
                <div className="business-pie-hole">
                  <strong>{selectedBusiness.share}%</strong>
                  <span>share</span>
                </div>
              </div>
              <div className="selected-business-card">
                <h3>{selectedBusiness.name}</h3>
                <div className="selected-business-row">
                  <span>Revenue</span>
                  <strong>${selectedBusiness.revenue.toLocaleString()}</strong>
                </div>
                <div className="selected-business-row">
                  <span>Profit</span>
                  <strong>${selectedBusiness.profit.toLocaleString()}</strong>
                </div>
                <div className="selected-business-row">
                  <span>Active Users</span>
                  <strong>{selectedBusiness.customers}</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="profile-breakdown">
          <article className="breakdown-panel">
            <div className="panel-heading">
              <h2>Operational health</h2>
              <span>This week</span>
            </div>
            <div className="breakdown-row">
              <span>Fulfilment speed</span>
              <strong>2.4 hrs</strong>
            </div>
            <div className="breakdown-row">
              <span>Customer retention</span>
              <strong>88%</strong>
            </div>
            <div className="breakdown-row">
              <span>Automation uptime</span>
              <strong>99.1%</strong>
            </div>
          </article>

          <article className="breakdown-panel">
            <div className="panel-heading">
              <h2>Financial flow</h2>
              <span>Live</span>
            </div>
            <div className="breakdown-row">
              <span>Spend</span>
              <strong>$9,320</strong>
            </div>
            <div className="breakdown-row">
              <span>Cash runway</span>
              <strong>14 months</strong>
            </div>
            <div className="breakdown-row">
              <span>Growth rate</span>
              <strong>+12.6%</strong>
            </div>
          </article>
        </section>
      </section>
      <StandardFooter className="profile-footer" />
    </main>
  )
}

function EmptyPage() {
  return (
    <main className="profile-page">
      <AppHeader />
      <StandardFooter className="profile-footer" />
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path={dashboardPath} element={<DashboardPage />} />
      <Route path={profilePath} element={<ProfilePage />} />
      <Route path={walletPath} element={<EmptyPage />} />
      <Route path={reportBugsPath} element={<EmptyPage />} />
      <Route path={oauthSuccessPath} element={<OAuthSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
