import { request } from './client';

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  sendRegisterOTP: (data) => request('/auth/send-register-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyRegisterOTP: (data) => request('/auth/verify-register-otp', { method: 'POST', body: JSON.stringify(data) }),
  sendUpdateOTP: (data) => request('/auth/send-update-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyUpdateOTP: (data) => request('/auth/verify-update-otp', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (credentials) => request('/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getSessions: () => request('/auth/sessions'),
  revokeSession: (id) => request(`/auth/sessions/${id}`, { method: 'DELETE' }),
};
