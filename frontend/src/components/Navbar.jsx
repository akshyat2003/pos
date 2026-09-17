export default function Navbar({ currentView, setCurrentView }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div>
          <h1 className="brand-title">POS Flow</h1>
          <span className="brand-sub">Point of Sale</span>
        </div>
      </div>

      <nav className="nav-mode-switcher">
        <button
          className={`nav-mode-btn ${currentView === 'store' ? 'active' : ''}`}
          onClick={() => setCurrentView('store')}
        >
          Store Catalog
        </button>
        <button
          className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentView('admin')}
        >
          Admin Panel
        </button>
      </nav>
    </header>
  );
}
