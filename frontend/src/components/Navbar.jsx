export default function Navbar({ currentView, setCurrentView, currentUser, onUserLogout, adminUser, onAdminLogout, onOpenProfile }) {
  const isLoggedIn = !!(currentUser || adminUser);

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setCurrentView(currentUser ? 'store' : (adminUser ? 'admin' : 'user-auth'))} style={{ cursor: 'pointer' }}>
        <div>
          <h1 className="brand-title">POS Flow</h1>
          <span className="brand-sub">Point of Sale & Management</span>
        </div>
      </div>

      <div className="nav-actions">
        {!isLoggedIn && (
          <nav className="nav-mode-switcher">
            <button className={`nav-mode-btn ${currentView === 'store' || currentView === 'user-auth' ? 'active' : ''}`} onClick={() => setCurrentView('user-auth')}>
              🔒 Store Catalog
            </button>
            <button className={`nav-mode-btn ${currentView === 'admin' || currentView === 'admin-login' ? 'active' : ''}`} onClick={() => setCurrentView('admin-login')}>
              🔒 Admin Panel
            </button>
          </nav>
        )}

        <div className="nav-user-section">
          {currentView === 'admin' && adminUser ? (
            <div className="nav-auth-pill admin-pill">
              <span className="pill-label">Admin: {adminUser.email}</span>
              <button type="button" className="pill-action-btn" onClick={onAdminLogout}>Exit Admin</button>
            </div>
          ) : currentUser ? (
            <div className="nav-auth-pill user-pill">
              <span className="pill-avatar" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>👤</span>
              <span className="pill-label" title={currentUser.email} onClick={onOpenProfile} style={{ cursor: 'pointer' }}>{currentUser.name}</span>
              <button type="button" className="pill-action-btn" onClick={onUserLogout}>Sign Out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
