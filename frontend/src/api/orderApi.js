import { request } from './client.js';

export const orderApi = {
  getAll: () => request('/orders'),
  create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
};
