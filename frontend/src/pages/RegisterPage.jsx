import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }
    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') {
        setFieldErrors(data.data);
      } else {
        setError(data?.message || err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 8) return { level: 1, label: 'Too short', color: 'var(--color-danger)' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) {
      return { level: 2, label: 'Fair', color: 'var(--color-warning)' };
    }
    return { level: 3, label: 'Strong', color: 'var(--color-accent)' };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-glow" style={{ top: '-200px', right: '-200px' }} />
      <div className="auth-glow" style={{ bottom: '-200px', left: '-200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' }} />

      <div className="auth-card fade-in-up" style={{ maxWidth: 480 }}>
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
            <i className="bi bi-person-plus-fill text-white"></i>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create account</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Start analyzing resumes with AI today
          </p>
        </div>

        {error && (
          <div className="alert-dark mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Full name</label>
            <input
              type="text"
              name="fullName"
              className="form-control form-control-dark"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            {fieldErrors.fullName && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: 4 }}>
                {fieldErrors.fullName}
              </div>
            )}
          </div>

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
            />
            {fieldErrors.email && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: 4 }}>
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-dark"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
            {strength && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <div className="d-flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 40, height: 4, borderRadius: 2,
                        background: i <= strength.level ? strength.color : 'var(--bg-elevated)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {fieldErrors.password && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: 4 }}>
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control form-control-dark"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {fieldErrors.confirmPassword && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: 4 }}>
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 justify-content-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16 }}></div>
                Creating account...
              </>
            ) : (
              <>
                <i className="bi bi-person-check-fill"></i>
                Create account
              </>
            )}
          </button>
        </form>

        <hr className="divider" />

        <p className="text-center" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
