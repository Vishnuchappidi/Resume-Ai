import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InputField = ({ label, type, name, placeholder, value, onChange, autoComplete }) => (
  <div className="mb-3">
    <label className="form-label-custom">{label}</label>
    <input
      type={type}
      name={name}
      className="form-control form-control-dark"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      autoComplete={autoComplete}
    />
  </div>
);

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" style={{ top: '-200px', left: '-200px' }} />
      <div className="auth-glow" style={{ bottom: '-200px', right: '-200px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)' }} />

      <div className="auth-card fade-in-up">

        {/* Logo */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{
              width: 56, height: 56,
              background: 'var(--gradient-primary)',
              fontSize: '1.5rem',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
            }}
          >
            <i className="bi bi-file-earmark-text-fill text-white"></i>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Sign in to your ResumeAI Pro account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert-dark mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label-custom">Email address</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-dark"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-dark"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 justify-content-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16 }}></div>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right-circle-fill"></i>
                Sign in
              </>
            )}
          </button>
        </form>

        <hr className="divider" />

        <p className="text-center" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
