// Base API client with credentials for HTTP-only cookies
const API_BASE = '/api';

export const request = async (endpoint, options = {}) => {
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `HTTP error! status: ${response.status}`;
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/admin-login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/me')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message } }));
    }
    throw new Error(message);
  }
  return response.json();
};
