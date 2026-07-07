import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('TECAISHOP_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Seller API uses seller token
const sellerApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});
sellerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('TECAISHOP_seller_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
sellerApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Courier API uses courier token
const courierApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});
courierApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('TECAISHOP_courier_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
courierApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getFlashSale: () => api.get('/products/flash-sale'),
  search: (q) => api.get('/products/search', { params: { q } }),
  // Admin product management
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  // Variant management (admin)
  addVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) => api.put(`/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) => api.delete(`/products/${productId}/variants/${variantId}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getAll: (params) => api.get('/orders', { params }),
  getAllAdmin: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyRazorpay: (data) => api.post('/payments/verify', data),
  getKey: () => api.get('/payments/key'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
  clear: () => api.delete('/wishlist/clear'),
};

export const reviewAPI = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  adminGetAll: (params) => api.get('/reviews', { params }),
  adminDelete: (id) => api.delete(`/reviews/admin/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  getSubcategories: (slug) => api.get(`/categories/${slug}/subcategories`),
  addType: (catId, type) => api.post(`/categories/${catId}/types`, { type }),
  removeType: (catId, type) => api.delete(`/categories/${catId}/types/${type}`),
  renameType: (catId, oldType, newType) => api.put(`/categories/${catId}/types/rename`, { oldType, newType }),
};

export const couponAPI = {
  validate: (code) => api.post('/coupons/validate', { code }),
  adminGetAll: () => api.get('/coupons'),
  adminCreate: (data) => api.post('/coupons', data),
  adminUpdate: (id, data) => api.put(`/coupons/${id}`, data),
  adminDelete: (id) => api.delete(`/coupons/${id}`),
};

export const bannerAPI = {
  getAll: () => api.get('/banners'),
  adminCreate: (data) => api.post('/banners', data),
  adminUpdate: (id, data) => api.put(`/banners/${id}`, data),
  adminDelete: (id) => api.delete(`/banners/${id}`),
};

export const returnAPI = {
  create: (data) => api.post('/returns', data),
  getMy: () => api.get('/returns/my'),
  adminGetAll: (params) => api.get('/returns', { params }),
  adminUpdate: (id, data) => api.put(`/returns/${id}`, data),
};

export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getMy: () => api.get('/complaints/my'),
  adminGetAll: (params) => api.get('/complaints', { params }),
  adminUpdate: (id, data) => api.put(`/complaints/${id}`, data),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const notificationAPI = {
  getMy: () => api.get('/notifications/my'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  adminCreate: (data) => api.post('/notifications', data),
};

export const trackingAPI = {
  getOrderTracking: (orderId) => api.get(`/courier/orders/${orderId}/tracking`),
};

export const locationAPI = {
  checkPincode: (pincode) => api.get(`/locations/check/${pincode}`),
};

export const commissionAPI = {
  getAll: () => api.get('/commissions'),
  setGlobal: (data) => api.post('/commissions/global', data),
  setCategory: (data) => api.post('/commissions/category', data),
  setSeller: (data) => api.post('/commissions/seller', data),
  delete: (id) => api.delete(`/commissions/${id}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getSellers: (params) => api.get('/admin/sellers', { params }),
  getAllSellers: (params) => api.get('/admin/sellers', { params }),
  getSellerAnalytics: () => api.get('/admin/sellers/analytics'),
  updateSellerStatus: (id, data) => api.put(`/admin/sellers/${id}/status`, data),
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  getAllWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  updateWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
  processWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
};

// Seller portal API
export const sellerAPI = {
  register: (data) => sellerApi.post('/seller/register', data),
  login: (data) => sellerApi.post('/seller/login', data),
  getMe: () => sellerApi.get('/seller/me'),
  updateShop: (data) => sellerApi.put('/seller/shop', data),
  getDashboardStats: () => sellerApi.get('/seller/dashboard'),
  getProducts: (params) => sellerApi.get('/seller/products', { params }),
  createProduct: (data) => sellerApi.post('/seller/products', data),
  updateProduct: (id, data) => sellerApi.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => sellerApi.delete(`/seller/products/${id}`),
  // Seller product variant management (same as admin)
  addVariant: (productId, data) => sellerApi.post(`/seller/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) => sellerApi.put(`/seller/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) => sellerApi.delete(`/seller/products/${productId}/variants/${variantId}`),
  getOrders: (params) => sellerApi.get('/seller/orders', { params }),
  updateOrderStatus: (id, data) => sellerApi.put(`/seller/orders/${id}/status`, data),
  getEarnings: () => sellerApi.get('/seller/earnings'),
  requestWithdrawal: (data) => sellerApi.post('/seller/withdrawals', data),
  getWithdrawals: () => sellerApi.get('/seller/withdrawals'),
  getPublicShop: (slug) => sellerApi.get(`/seller/shop/${slug}`),
  getReviews: () => sellerApi.get('/reviews/seller/reviews'),
  replyToReview: (id, data) => sellerApi.put(`/reviews/${id}/reply`, data),
  getReturns: () => sellerApi.get('/returns/seller/returns'),
  getNotifications: () => sellerApi.get('/notifications/my'),
};

// Courier portal API
export const courierAPI = {
  register: (data) => courierApi.post('/courier/register', data),
  login: (data) => courierApi.post('/courier/login', data),
  getMe: () => courierApi.get('/courier/me'),
  getOrders: (params) => courierApi.get('/courier/orders', { params }),
  getStats: () => courierApi.get('/courier/stats'),
  updateTracking: (orderId, data) => courierApi.post(`/courier/orders/${orderId}/tracking`, data),
  // Admin courier management (uses admin token)
  adminGetAll: (params) => api.get('/courier/admin/all', { params }),
  adminUpdateStatus: (id, data) => api.put(`/courier/admin/${id}/status`, data),
  adminAssignToOrder: (orderId, data) => api.post(`/courier/admin/orders/${orderId}/assign`, data),
  adminGetApproved: () => api.get('/courier/admin/all', { params: { status: 'approved' } }),
};

export default api;
