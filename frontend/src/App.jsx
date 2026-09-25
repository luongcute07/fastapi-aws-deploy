import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <div className="app-wrapper">
      {/* Top Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">👥</div>
          <div className="header-text">
            <h1>User Management System</h1>
            <p>Final DevOps – CI/CD with SonarQube &amp; GitLab</p>
          </div>
        </div>
        <div className="header-status">
          <span className="status-indicator"></span>
          <span className="header-badge">FastAPI Connected</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        <UsersPage />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Final DevOps • React 18 + Vite • FastAPI • Docker • SonarQube • GitLab CI/CD</p>
      </footer>
    </div>
  )
}
