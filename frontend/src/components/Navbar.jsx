export default function Navbar({ currentView, setCurrentView, currentUser, onUserLogout, adminUser, onAdminLogout }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setCurrentView(currentUser ? 'store' : 'user-auth')} style={{ cursor: 'pointer' }}>
        <div>
          <h1 className="brand-title">POS Flow</h1>
          <span className="brand-sub">Point of Sale & Management</span>
        </div>
      </div>

      <div className="nav-actions">
        <nav className="nav-mode-switcher">
          <button className={`nav-mode-btn ${currentView === 'store' ? 'active' : ''}`} onClick={() => setCurrentView(currentUser ? 'store' : 'user-auth')}>
            {currentUser ? 'Store Catalog' : '🔒 Store Catalog'}
          </button>
          <button className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}>
            {adminUser ? '🛡️ Admin Panel' : '🔒 Admin Panel'}
          </button>
        </nav>

        <div className="nav-user-section">
          {currentView === 'admin' && adminUser ? (
            <div className="nav-auth-pill admin-pill">
              <span className="pill-label">Admin: {adminUser.email}</span>
              <button type="button" className="pill-action-btn" onClick={onAdminLogout}>Exit Admin</button>
            </div>
          ) : currentUser ? (
            <div className="nav-auth-pill user-pill">
              <span className="pill-avatar">👤</span>
              <span className="pill-label" title={currentUser.email}>{currentUser.name}</span>
              <button type="button" className="pill-action-btn" onClick={onUserLogout}>Sign Out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
