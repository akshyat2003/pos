import { request } from './client.js';

export const orderApi = {
  create: (orderData) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  getAll: () => request('/orders'),
};
