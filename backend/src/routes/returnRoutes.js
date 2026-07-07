const express = require('express');
const router = express.Router();
const {
  createReturn, getMyReturns, getAllReturns, updateReturnStatus, getReturnStats, getSellerReturns
} = require('../controllers/returnController');
const { protect, admin, protectSeller } = require('../middleware/auth');

// User routes
router.post('/', protect, createReturn);
router.get('/my-returns', protect, getMyReturns);

// Admin routes
router.get('/', protect, admin, getAllReturns);
router.get('/stats', protect, admin, getReturnStats);
router.put('/:id', protect, admin, updateReturnStatus);

// Seller routes
router.get('/seller/returns', protectSeller, getSellerReturns);

module.exports = router;
