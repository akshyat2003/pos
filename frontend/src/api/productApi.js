import { request } from './client.js';

export const productApi = {
  getAll: (category) => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/products${query}`);
  },
  getCategories: () => request('/products/categories'),
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: (image, fileName) => request('/upload/image', { method: 'POST', body: JSON.stringify({ image, fileName }) }),
};
