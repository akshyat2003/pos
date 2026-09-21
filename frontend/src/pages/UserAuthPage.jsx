import { useState } from 'react';
import { authApi } from '../api/authApi';

const FIELDS = [
  { name: 'name', label: 'Full Name *', type: 'text', placeholder: 'e.g. John Doe', signup: true },
  { name: 'email', label: 'Email Address *', type: 'email', placeholder: 'e.g. john@example.com' },
  { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: 'e.g. +1 555-0199', signup: true },
  { name: 'password', label: 'Password *', type: 'password', placeholder: 'Enter password' },
  { name: 'address', label: 'Delivery Address *', type: 'text', placeholder: 'e.g. 742 Evergreen Terrace', signup: true },
];

export default function UserAuthPage({ onLoginSuccess, onCancel }) {
  const [isLogin, setIsLogin] = useState(true);
  const [msg, setMsg] = useState({ err: '', ok: '' });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });

  const switchTab = (val) => { setIsLogin(val); setMsg({ err: '', ok: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ err: '', ok: '' }); setLoading(true);
    try {
      if (isLogin) {
        onLoginSuccess(await authApi.login({ email: form.email.trim(), password: form.password }));
      } else {
        await authApi.register(form);
        setMsg({ err: '', ok: 'User added! Please enter your password to sign in.' });
        setIsLogin(true);
        setForm(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setMsg({ err: err.message || 'Authentication failed', ok: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">👤</div>
          <h2>{isLogin ? 'User Login' : 'User Registration'}</h2>
          <p className="auth-subtitle">{isLogin ? 'Please sign in to browse products and place orders' : 'Create an account to browse products and place orders'}</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={`auth-tab-btn ${isLogin ? 'active' : ''}`} onClick={() => switchTab(true)}>Sign In</button>
          <button type="button" className={`auth-tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => switchTab(false)}>Sign Up</button>
        </div>

        {msg.ok && <div className="auth-success-banner">✓ {msg.ok}</div>}
        {msg.err && <div className="auth-error-banner">{msg.err}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {FIELDS.filter(f => !isLogin || !f.signup).map(f => (
            <div key={f.name} className="auth-field">
              <label>{f.label}</label>
              <input
                name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} required
                onChange={e => { setMsg({ err: '', ok: '' }); setForm({ ...form, [f.name]: e.target.value }); }}
              />
            </div>
          ))}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
            <button type="button" className="auth-link-btn" onClick={() => switchTab(!isLogin)}>{isLogin ? 'Sign Up' : 'Sign In'}</button>
          </p>
          {onCancel && <button type="button" className="auth-back-btn" onClick={onCancel}>← Continue as Guest to Store</button>}
        </div>
      </div>
    </div>
  );
}
