import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { to: '/upload', icon: 'bi-cloud-upload-fill', label: 'Analyze Resume' },
    { to: '/history', icon: 'bi-clock-history', label: 'History' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar-dark-custom">
        <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
          <span className="navbar-brand-custom">
            <i className="bi bi-file-earmark-text-fill me-2" style={{ color: 'var(--color-primary)' }}></i>
            ResumeAI Pro
          </span>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 36,
                  height: 36,
                  background: 'var(--gradient-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'white'
                }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="d-none d-md-block">
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              className="btn-ghost d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="sidebar d-none d-md-flex flex-column">
          <div className="mb-4">
            <div className="section-title px-2">Navigation</div>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${link.icon}`}></i>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto">
            <div
              className="card-dark p-3"
              style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-robot" style={{ color: 'var(--color-primary-light)', fontSize: '1.1rem' }}></i>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  AI-Powered
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                Powered by Google Gemini for deep resume insights
              </p>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
