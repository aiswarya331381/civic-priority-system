import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import { useTheme } from '../../context/ThemeContext';


export default function Layout() {
  const { user, logout } = useAuth();
  const { addNotif } = useNotif();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addNotif('info', 'Signed out successfully');
    navigate('/login');
  };

  // Close the mobile off-canvas menu whenever the route changes
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const navItems = isAdmin
    ? [
        { to: '/dashboard',  icon: '⊞', label: 'Dashboard' },
        { to: '/admin',      icon: '📊', label: 'Analytics' },
        { to: '/complaints', icon: '📋', label: 'All Complaints' },
        { to: '/users',      icon: '👥', label: 'User Management' },
      ]
    : [
        { to: '/dashboard',      icon: '⊞', label: 'My Dashboard' },
        { to: '/complaints',     icon: '📋', label: 'All Complaints' },
        { to: '/complaints/new', icon: '+',  label: 'Report an Issue' },
      ];

  return (
    <div className="app-layout">

      {/* Overlay behind the off-canvas mobile sidebar */}
      <div
        className={`sidebar-overlay${mobileMenuOpen ? ' mobile-open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar${mobileMenuOpen ? ' mobile-open' : ''}`}>
       <NavLink
  to="/"
  className="sidebar-logo"
  style={{
    textDecoration: 'none',
    color: 'inherit'
  }}
>
  <span className="sidebar-logo-icon">🏛️</span>
  <div>
    <div className="sidebar-logo-text">Civic Priority</div>
  </div>
</NavLink>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(n => (
            <NavLink
              key={n.to} to={n.to}
              end={n.to === '/dashboard' || n.to === '/admin'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="theme-toggle theme-toggle-sidebar"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <span className="icon">{isDark ? '☀️' : '🌙'}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">
              {(user?.avatar || user?.name?.slice(0, 2) || 'U').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={handleLogout}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* Government Top Header */}
        <header className="gov-header">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <div className="gov-header-emblem">🏛️</div>
          <div className="gov-header-text">
            <h1>Smart Civic Issue Reporting & Prioritization System</h1>
            <p>Government of Andhra Pradesh</p>
          </div>
          <div className="gov-header-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="icon">{isDark ? '☀️' : '🌙'}</span>
              <span className="label">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <div className="header-user">
              <div className="header-avatar">
                {(user?.avatar || user?.name?.slice(0, 2) || 'U').toUpperCase()}
              </div>
              <span>{user?.name}</span>
              <span style={{ opacity: 0.55, fontSize: '0.7rem' }}>[{user?.role?.toUpperCase()}]</span>
            </div>
            <div className="header-divider" />
            <button className="header-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </div>

    </div>
  );
}
