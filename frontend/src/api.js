import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

function authHeader() {
  const token = localStorage.getItem('dharan_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Public
export const getProducts = (category) =>
  api.get('/api/products', { params: category ? { category } : {} }).then(r => r.data);

export const placeOrder = (data) =>
  api.post('/api/orders', data).then(r => r.data);

export const getOrder = (id) =>
  api.get(`/api/orders/${id}`).then(r => r.data);

export const getOrdersByPhone = (phone) =>
  api.get(`/api/orders/by-phone/${phone}`).then(r => r.data);

export const submitBooking = (data) =>
  api.post('/api/bookings', data).then(r => r.data);

// Auth
export const adminLogin = (email, password) =>
  api.post('/api/auth/login', { email, password }).then(r => r.data);

// Admin
export const adminGetOrders = (filters = {}) =>
  api.get('/api/admin/orders', { params: filters, headers: authHeader() }).then(r => r.data);

export const adminUpdateOrder = (id, status) =>
  api.patch(`/api/admin/orders/${id}`, { status }, { headers: authHeader() }).then(r => r.data);

export const adminGetRevenue = () =>
  api.get('/api/admin/revenue', { headers: authHeader() }).then(r => r.data);

export const adminGetBookings = () =>
  api.get('/api/admin/bookings', { headers: authHeader() }).then(r => r.data);

export const adminUpdateBooking = (id, status) =>
  api.patch(`/api/admin/bookings/${id}`, { status }, { headers: authHeader() }).then(r => r.data);

export const adminUpdateProduct = (id, data) =>
  api.patch(`/api/products/${id}`, data, { headers: authHeader() }).then(r => r.data);

export const adminGetAllProducts = () =>
  api.get('/api/products/all', { headers: authHeader() }).then(r => r.data);
