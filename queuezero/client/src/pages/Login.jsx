import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TicketPercent, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';

const Login = () => {
  const { login } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(form.email, form.password);
      notify(`Welcome back, ${profile.name.split(' ')[0]}!`, 'success');
      const redirectTo = location.state?.from || (profile.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">
            <TicketPercent size={18} />
          </span>
          <span className="brand-name">QueueZero</span>
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to track your queue or manage services.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email address</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={17} /> Log in
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-hint">
          <strong>Demo admin:</strong> admin@queuezero.com / Admin@123 (after running the seed script)
        </div>
      </div>
    </div>
  );
};

export default Login;
