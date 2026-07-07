import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiChevronDown, FiPackage } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', badge: '🕐' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',    badge: '⚙️' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700', badge: '🚚' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',   badge: '✅' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',       badge: '❌' },
};

const SELLER_ACTIONS = {
  pending:    ['processing'],
  processing: ['shipped'],
  shipped:    ['delivered'],
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await sellerAPI.getOrders({ status: statusFilter || undefined });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await sellerAPI.updateOrderStatus(orderId, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{total} orders for your products</p>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none">
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
        )) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <FiPackage className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Orders for your products will appear here</p>
          </div>
        ) : orders.map(order => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const nextStatuses = SELLER_ACTIONS[order.status] || [];
          const itemsTotal = order.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;

          return (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cfg.badge}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{fmt(itemsTotal)}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Order items (seller's products only) */}
              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />}
                      <div>
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity} · {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping info */}
                {order.shippingAddress && (
                  <p className="text-xs text-gray-400 mb-3">
                    📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                )}

                {/* Actions */}
                {nextStatuses.length > 0 && (
                  <div className="flex gap-2">
                    {nextStatuses.map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(order._id, s)}
                        disabled={updatingId === order._id}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {updatingId === order._id ? 'Updating...' : `Mark as ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}
