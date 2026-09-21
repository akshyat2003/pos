import { useState } from 'react';
import { authApi } from '../api/authApi';

export default function AdminLoginPage({ onLoginSuccess, onCancel }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!form.email.trim() || !form.password) throw new Error('Enter admin email and password');
      onLoginSuccess(await authApi.adminLogin({ email: form.email.trim(), password: form.password }));
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-bg">
      <div className="auth-card admin-card">
        <div className="auth-header">
          <div className="auth-icon-badge admin-badge">🛡️</div>
          <h2>Admin Portal</h2>
          <p className="auth-subtitle">Sign in with administrator credentials to manage products, inventory, orders, and users.</p>
        </div>
        {error && <div className="auth-error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field"><label>Admin Email</label><input type="email" placeholder="Enter admin email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="off" /></div>
          <div className="auth-field"><label>Admin Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="off" /></div>
          <button type="submit" className="auth-submit-btn admin-submit-btn" disabled={loading}>{loading ? 'Authenticating...' : 'Unlock Admin Panel'}</button>
        </form>
        {onCancel && <div className="auth-footer"><button type="button" className="auth-back-btn" onClick={onCancel}>← Back to Store</button></div>}
      </div>
    </div>
  );
}
