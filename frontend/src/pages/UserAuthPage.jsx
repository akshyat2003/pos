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
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [msg, setMsg] = useState({ err: '', ok: '' });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });

  const switchTab = (val) => {
    setIsLogin(val);
    setStep('form');
    setMsg({ err: '', ok: '' });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setMsg({ err: '', ok: '' });
    setLoading(true);

    try {
      if (isLogin) {
        // Direct Login with credentials in DB
        const user = await authApi.login({ email: form.email.trim(), password: form.password });
        onLoginSuccess(user);
      } else {
        // Send OTP via Nodemailer SMTP for registration
        const res = await authApi.sendRegisterOTP(form);
        setStep('otp');
        setMsg({ err: '', ok: res.message || `OTP sent to ${form.email}` });
      }
    } catch (err) {
      setMsg({ err: err.message || 'Authentication failed', ok: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return setMsg({ err: 'Please enter the 6-digit OTP code', ok: '' });

    setMsg({ err: '', ok: '' });
    setLoading(true);

    try {
      const user = await authApi.verifyRegisterOTP({ email: form.email.trim(), otp: otpCode.trim() });
      setMsg({ err: '', ok: 'Account created and verified successfully!' });
      onLoginSuccess(user);
    } catch (err) {
      setMsg({ err: err.message || 'OTP Verification failed', ok: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMsg({ err: '', ok: '' });
    try {
      const res = await authApi.sendRegisterOTP(form);
      setMsg({ err: '', ok: res.message || 'New OTP sent to your email.' });
    } catch (err) {
      setMsg({ err: err.message || 'Failed to resend OTP', ok: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">👤</div>
          <h2>{isLogin ? 'User Login' : (step === 'otp' ? 'Email OTP Verification' : 'User Registration')}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in with your credentials to access your account'
              : (step === 'otp'
                ? `Enter the 6-digit OTP code sent to ${form.email}`
                : 'Create an account to browse products and place orders')}
          </p>
        </div>

        {step === 'form' && (
          <div className="auth-tabs">
            <button type="button" className={`auth-tab-btn ${isLogin ? 'active' : ''}`} onClick={() => switchTab(true)}>Sign In</button>
            <button type="button" className={`auth-tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => switchTab(false)}>Sign Up</button>
          </div>
        )}

        {msg.ok && <div className="auth-success-banner">✓ {msg.ok}</div>}
        {msg.err && <div className="auth-error-banner">⚠️ {msg.err}</div>}

        {step === 'form' ? (
          <form onSubmit={handleInitialSubmit} className="auth-form">
            {FIELDS.filter((f) => !isLogin || !f.signup).map((f) => (
              <div key={f.name} className="auth-field">
                <label>{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  required
                  onChange={(e) => {
                    setMsg({ err: '', ok: '' });
                    setForm({ ...form, [f.name]: e.target.value });
                  }}
                />
              </div>
            ))}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Send Registration OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="auth-field">
              <label>Enter 6-Digit OTP Code *</label>
              <input
                type="text"
                maxLength="6"
                placeholder="e.g. 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: 'bold' }}
                autoFocus
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : '✅ Verify & Create Account'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <button type="button" className="auth-link-btn" onClick={handleResendOtp} disabled={loading}>
                🔄 Resend OTP
              </button>
              <button type="button" className="auth-link-btn" onClick={() => setStep('form')} disabled={loading}>
                ← Back to Edit Info
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          {step === 'form' && (
            <p>
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <button type="button" className="auth-link-btn" onClick={() => switchTab(!isLogin)}>{isLogin ? 'Sign Up' : 'Sign In'}</button>
            </p>
          )}
          {onCancel && <button type="button" className="auth-back-btn" onClick={onCancel}>← Continue as Guest to Store</button>}
        </div>
      </div>
    </div>
  );
}
