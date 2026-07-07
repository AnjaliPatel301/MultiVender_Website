const CourierPartner = require('../models/CourierPartner');
const Order = require('../models/Order');
const TrackingUpdate = require('../models/TrackingUpdate');
const Notification = require('../models/Notification');

const sendCourierToken = (courier, statusCode, res) => {
  const token = courier.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    courier: {
      _id: courier._id,
      companyName: courier.companyName,
      deliveryPersonName: courier.deliveryPersonName,
      email: courier.email,
      mobile: courier.mobile,
      status: courier.status,
    },
  });
};

// Generate a unique tracking number
const generateTrackingNumber = () => {
  const prefix = 'LXF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// COURIER: Register
exports.registerCourier = async (req, res) => {
  const { companyName, deliveryPersonName, email, password, mobile, vehicleNumber, serviceAreas } = req.body;
  const existing = await CourierPartner.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const courier = await CourierPartner.create({
    companyName, deliveryPersonName, email, password, mobile,
    vehicleNumber, serviceAreas: serviceAreas || [],
  });
  res.status(201).json({ success: true, message: 'Registration submitted. Await admin approval.' });
};

// COURIER: Login
exports.loginCourier = async (req, res) => {
  const { email, password } = req.body;
  const courier = await CourierPartner.findOne({ email }).select('+password');
  if (!courier || !(await courier.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (courier.status !== 'approved')
    return res.status(403).json({ success: false, message: `Account ${courier.status}. Await admin approval.`, status: courier.status });
  courier.lastLogin = new Date();
  await courier.save({ validateBeforeSave: false });
  sendCourierToken(courier, 200, res);
};

// COURIER: Get me
exports.getCourierMe = async (req, res) => {
  const courier = await CourierPartner.findById(req.courier._id);
  res.json({ success: true, courier });
};

// COURIER: Get assigned orders
exports.getCourierOrders = async (req, res) => {
  const { status } = req.query;
  const query = { assignedCourier: req.courier._id };
  if (status) query.status = status;
  const orders = await Order.find(query)
    .sort('-createdAt')
    .populate('user', 'name phone')
    .populate('items.product', 'name images');
  res.json({ success: true, orders });
};

// COURIER: Update tracking status
exports.updateTracking = async (req, res) => {
  const { status, location, note, deliveryPhoto, failureReason } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.assignedCourier?.toString() !== req.courier._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  // Create tracking entry
  const tracking = await TrackingUpdate.create({
    order: req.params.orderId,
    courier: req.courier._id,
    status, location, note, deliveryPhoto, failureReason,
  });

  // Update order status
  const orderStatusMap = {
    picked_up: 'picked_up',
    shipped: 'shipped',
    in_transit: 'in_transit',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    failed_delivery: 'failed_delivery',
  };
  if (orderStatusMap[status]) {
    order.status = orderStatusMap[status];
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
  }

  // Notify user
  await Notification.create({
    title: 'Order Update',
    message: `Your order #${order.orderNumber} is now: ${status.replace(/_/g, ' ')}${location ? ' — ' + location : ''}`,
    type: 'push',
    targetUser: order.user,
    relatedOrder: order._id,
  });

  res.json({ success: true, tracking });
};

// COURIER: Get tracking history for an order
exports.getOrderTracking = async (req, res) => {
  const trackingHistory = await TrackingUpdate.find({ order: req.params.orderId })
    .sort('createdAt')
    .populate('courier', 'companyName deliveryPersonName');
  res.json({ success: true, trackingHistory });
};

// COURIER: Dashboard stats
exports.getCourierStats = async (req, res) => {
  const [assigned, pending, inTransit, outForDelivery, delivered, failed] = await Promise.all([
    Order.countDocuments({ assignedCourier: req.courier._id }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'ready_for_pickup' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: { $in: ['picked_up', 'shipped', 'in_transit', 'reached_sorting_center', 'reached_destination_city'] } }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'out_for_delivery' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'delivered' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'failed_delivery' }),
  ]);
  res.json({ success: true, stats: { assigned, pending, inTransit, outForDelivery, delivered, failed } });
};

// ========== ADMIN COURIER MANAGEMENT ==========

// ADMIN: Get all couriers
exports.getAllCouriers = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const couriers = await CourierPartner.find(query).sort('-createdAt');
  res.json({ success: true, couriers });
};

// ADMIN: Update courier status
exports.updateCourierStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const courier = await CourierPartner.findByIdAndUpdate(
    req.params.id,
    { status, rejectionReason },
    { new: true }
  );
  if (!courier) return res.status(404).json({ success: false, message: 'Courier not found' });
  res.json({ success: true, courier });
};

// ADMIN: Assign courier to order
exports.assignCourier = async (req, res) => {
  const { courierId, trackingId } = req.body;

  if (!courierId) {
    return res.status(400).json({ success: false, message: 'courierId is required' });
  }

  // Validate courier exists and is approved
  const courier = await CourierPartner.findById(courierId);
  if (!courier) {
    return res.status(404).json({ success: false, message: 'Courier not found' });
  }
  if (courier.status !== 'approved') {
    return res.status(400).json({ success: false, message: `Courier is ${courier.status}. Sirf approved courier ko assign kar sakte hain.` });
  }

  // Validate order exists
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Auto-generate tracking number if not provided
  const finalTrackingId = trackingId && trackingId.trim() ? trackingId.trim() : generateTrackingNumber();

  // Assign courier and update order
  order.assignedCourier = courierId;
  order.trackingNumber = finalTrackingId;
  order.courierCompany = courier.companyName;
  await order.save();

  // Create tracking entry
  await TrackingUpdate.create({
    order: order._id,
    courier: courierId,
    status: 'ready_for_pickup',
    note: `Courier assigned by admin. Tracking ID: ${finalTrackingId}`,
  });

  // Notify user about courier assignment
  await Notification.create({
    title: 'Courier Assigned',
    message: `Your order #${order.orderNumber} has been assigned to ${courier.companyName} (${courier.deliveryPersonName}). Tracking ID: ${finalTrackingId}`,
    type: 'push',
    targetUser: order.user,
    relatedOrder: order._id,
  });

  res.json({
    success: true,
    message: 'Courier assigned successfully',
    order: {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      assignedCourier: order.assignedCourier,
      courierCompany: order.courierCompany,
    },
  });
};
