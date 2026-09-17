import { request } from './client.js';

export const userApi = {
  getAll: () => request('/users'),
  create: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  update: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  delete: (id) => request(`/users/${id}`, {
    method: 'DELETE'
  }),
};
