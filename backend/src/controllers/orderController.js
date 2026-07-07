const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, coupon, couponDiscount, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ success: false, message: 'No order items' });

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'razorpay',
    coupon,
    couponDiscount: couponDiscount || 0,
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    taxPrice: taxPrice || 0,
    totalPrice,
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, order });
};

exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('items.product', 'name images'),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, orders, total });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name images');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  res.json({ success: true, order });
};

exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });
  if (!['pending', 'confirmed'].includes(order.status))
    return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, order });
};

exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('user', 'name email'),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total });
};

exports.updateOrderStatus = async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = new Date(); }
  await order.save();
  res.json({ success: true, order });
};
