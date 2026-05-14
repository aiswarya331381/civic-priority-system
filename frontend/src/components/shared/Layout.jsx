import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { addNotif } = useNotif();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    addNotif('info', 'Signed out successfully');
    navigate('/login');
  };

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

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🏛️</span>
          <div>
            <div className="sidebar-logo-text">Civic Priority</div>
            {/* <div className="sidebar-logo-sub">Palasa MC</div> */}
          </div>
        </div>

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
          <div className="gov-header-emblem">🏛️</div>
          <div className="gov-header-text">
            <h1>Smart Civic Issue Reporting & Prioritization System</h1>
            <p>Government of India</p>
          </div>
          <div className="gov-header-right">
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
