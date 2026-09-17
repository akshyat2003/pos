import { request } from './client.js';

export const statsApi = {
  getStats: () => request('/stats'),
};
