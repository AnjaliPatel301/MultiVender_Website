const express = require('express');
const router = express.Router();
const {
  registerSeller, loginSeller, getSellerMe,
  updateShopSettings,
  getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct,
  addSellerProductVariant, updateSellerProductVariant, deleteSellerProductVariant,
  getSellerOrders, updateSellerOrderStatus,
  getSellerEarnings, requestWithdrawal, getSellerWithdrawals,
  getPublicShop,
  getSellerDashboardStats,
} = require('../controllers/sellerController');
const { protectSeller } = require('../middleware/auth');

// Public
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.get('/shop/:slug', getPublicShop);

// Protected (approved sellers only)
router.get('/me', protectSeller, getSellerMe);
router.put('/shop', protectSeller, updateShopSettings);
router.get('/dashboard', protectSeller, getSellerDashboardStats);

// Products
router.get('/products', protectSeller, getSellerProducts);
router.post('/products', protectSeller, createSellerProduct);
router.put('/products/:id', protectSeller, updateSellerProduct);
router.delete('/products/:id', protectSeller, deleteSellerProduct);

// Product Color Variants (same as admin)
router.post('/products/:id/variants', protectSeller, addSellerProductVariant);
router.put('/products/:id/variants/:variantId', protectSeller, updateSellerProductVariant);
router.delete('/products/:id/variants/:variantId', protectSeller, deleteSellerProductVariant);

// Orders
router.get('/orders', protectSeller, getSellerOrders);
router.put('/orders/:id/status', protectSeller, updateSellerOrderStatus);

// Earnings & Withdrawals
router.get('/earnings', protectSeller, getSellerEarnings);
router.post('/withdrawals', protectSeller, requestWithdrawal);
router.get('/withdrawals', protectSeller, getSellerWithdrawals);

module.exports = router;
