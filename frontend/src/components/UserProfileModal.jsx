import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export default function UserProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState('view'); // 'view', 'edit', 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: ''
  });

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: ''
      });
      setError('');
      setSuccess('');
      setIsEditing(false);
      setStep('view');
      setOtpCode('');
      setPendingPayload(null);
    }
  }, [isOpen]);

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: ''
      });
    }
    setError('');
    setSuccess('');
    setIsEditing(true);
    setStep('edit');
    setOtpCode('');
  };

  const handleCancelEdit = () => {
    setError('');
    setIsEditing(false);
    setStep('view');
    setOtpCode('');
  };

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && !formData.currentPassword) {
      setError('Please enter your current password to set a new password.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await authApi.sendUpdateOTP(payload);
      setPendingPayload(payload);
      setStep('otp');
      setSuccess(res.message || `OTP verification code sent to ${payload.email}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return setError('Please enter the 6-digit OTP code');

    setLoading(true);
    setError('');

    try {
      const updatedUser = await authApi.verifyUpdateOTP({ otp: otpCode.trim() });

      // Update parent state in App.jsx
      onUpdateUser(updatedUser);

      setSuccess('Profile updated successfully in database!');
      setIsEditing(false);
      setStep('view');
      setOtpCode('');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingPayload) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.sendUpdateOTP(pendingPayload);
      setSuccess(res.message || 'New OTP code sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const initials = (user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="profile-header-title">
            <span className="profile-avatar-badge">{initials}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                {step === 'otp' ? 'Email OTP Verification' : 'User Profile'}
              </h3>
              <span className="profile-role-tag">{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} title="Close">✕</button>
        </div>

        {/* View Mode */}
        {step === 'view' && (
          <>
            <div className="profile-modal-body">
              {error && <div className="profile-alert profile-alert-error">⚠️ {error}</div>}
              {success && <div className="profile-alert profile-alert-success">✅ {success}</div>}

              <div className="profile-view-body">
                <div className="profile-detail-card">
                  <div className="detail-item">
                    <span className="detail-label">👤 Full Name</span>
                    <span className="detail-value">{user.name || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📧 Email Address</span>
                    <span className="detail-value">{user.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📱 Contact Number</span>
                    <span className="detail-value">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📍 Delivery Address</span>
                    <span className="detail-value address-value">{user.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions" style={{ margin: 0 }}>
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                <button type="button" className="btn-primary" onClick={handleStartEdit}>
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </>
        )}

        {/* Edit Mode */}
        {step === 'edit' && (
          <form onSubmit={handleRequestOTP} className="modal-form profile-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="profile-modal-body">
              {error && <div className="profile-alert profile-alert-error">⚠️ {error}</div>}
              {success && <div className="profile-alert profile-alert-success">✅ {success}</div>}

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0199"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Flat 4B, 123 Market Street"
                  required
                />
              </div>

              <div className="password-change-section">
                <h4 className="password-section-title">Change Password (Optional)</h4>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Required if setting new password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions" style={{ margin: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending OTP...' : '🔑 Send OTP to Save'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* OTP Verification Mode */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="modal-form profile-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="profile-modal-body">
              {error && <div className="profile-alert profile-alert-error">⚠️ {error}</div>}
              {success && <div className="profile-alert profile-alert-success">✅ {success}</div>}

              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                An OTP verification code has been sent via email to <strong>{pendingPayload?.email || user.email}</strong>.
                Enter the 6-digit code below to confirm and update your profile:
              </p>

              <div className="form-group" style={{ marginTop: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button type="button" className="auth-link-btn" onClick={handleResendOTP} disabled={loading}>
                  🔄 Resend OTP Code
                </button>
                <button type="button" className="auth-link-btn" onClick={() => setStep('edit')} disabled={loading}>
                  ← Back to Edit Details
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions" style={{ margin: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Verifying...' : '✅ Verify & Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
