import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiEye, FiEdit2, FiTruck } from 'react-icons/fi';
import { orderAPI, courierAPI } from '../../services/api';
import { AdminPageWrapper } from './AdminDashboard';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 'ready_for_pickup',
  'picked_up', 'shipped', 'in_transit', 'out_for_delivery', 'delivered',
  'cancelled', 'refunded', 'failed_delivery'
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Assign Courier Modal
  const [assignOrder, setAssignOrder] = useState(null);
  const [approvedCouriers, setApprovedCouriers] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [assignTrackingId, setAssignTrackingId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderAPI.getAll({ page, limit: 20, status: statusFilter || undefined });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await orderAPI.updateStatus(selectedOrder._id, { status: newStatus, trackingNumber });
      toast.success('Order status updated!');
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
      setSelectedOrder(null);
    } catch (err) { toast.error(err.message || 'Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  // Open Assign Courier modal and load approved couriers
  const openAssignModal = async (order) => {
    setAssignOrder(order);
    setSelectedCourierId('');
    setAssignTrackingId('');
    setLoadingCouriers(true);
    try {
      const data = await courierAPI.adminGetApproved();
      setApprovedCouriers(data.couriers || []);
    } catch (err) { toast.error('Could not load couriers: ' + err.message); }
    finally { setLoadingCouriers(false); }
  };

  const handleAssignCourier = async () => {
    if (!selectedCourierId) { toast.error('Please select a courier'); return; }
    setAssigning(true);
    try {
      await courierAPI.adminAssignToOrder(assignOrder._id, {
        courierId: selectedCourierId,
        trackingId: assignTrackingId.trim() || undefined,
      });
      toast.success('Courier assigned successfully! 🚚');
      setAssignOrder(null);
      fetchOrders();
    } catch (err) { toast.error(err.message || 'Failed to assign courier'); }
    finally { setAssigning(false); }
  };

  return (
    <AdminPageWrapper title="Orders" subtitle={`${total} total orders`}>
      {/* Filters — horizontally scrollable on mobile instead of wrapping into a huge block */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible scrollbar-thin">
        <button
          onClick={() => setStatusFilter('')}
          className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${!statusFilter ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}
        >
          All
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium capitalize transition-all whitespace-nowrap ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}
          >
            {getOrderStatusLabel(s)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table — horizontal scroll on small/medium screens, min-width keeps columns readable */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Courier', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-3 sm:px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3"><p className="font-mono text-sm font-semibold text-gray-800">#{order.orderNumber}</p></td>
                  <td className="px-3 sm:px-4 py-3 max-w-[180px]">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-400 truncate">{order.user?.email}</p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateShort(order.createdAt)}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{order.items?.length} items</td>
                  <td className="px-3 sm:px-4 py-3"><span className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatPrice(order.totalPrice)}</span></td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`badge text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`badge text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    {order.assignedCourier ? (
                      <div>
                        <p className="text-xs font-medium text-green-700 whitespace-nowrap">✓ Assigned</p>
                        {order.trackingNumber && <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{order.trackingNumber}</p>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Edit status button */}
                      <button
                        onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setTrackingNumber(order.trackingNumber || ''); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Update status"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      {/* Assign Courier button — show when ready_for_pickup and not yet assigned */}
                      {order.status === 'ready_for_pickup' && !order.assignedCourier && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Assign Courier"
                        >
                          <FiTruck className="w-4 h-4" />
                        </button>
                      )}
                      {/* Re-assign button if already assigned */}
                      {order.assignedCourier && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Re-assign Courier"
                        >
                          <FiTruck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2 justify-center sm:justify-end">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 gap-2">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">Update Order #{selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field text-sm w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tracking Number (optional)</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. IND123456789" className="input-field text-sm w-full" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                <Button variant="primary" fullWidth loading={updatingStatus} onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Courier Modal */}
      {assignOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5 gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <FiTruck className="w-5 h-5 text-indigo-600 shrink-0" /> Assign Courier
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">Order #{assignOrder.orderNumber}</p>
              </div>
              <button onClick={() => setAssignOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><FiX className="w-5 h-5" /></button>
            </div>

            {/* Order info */}
            <div className="bg-indigo-50 rounded-2xl p-4 mb-5 space-y-1.5">
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-gray-600 shrink-0">Customer:</span>
                <span className="font-medium text-gray-800 text-right truncate">{assignOrder.user?.name}</span>
              </div>
              <div className="flex items-start justify-between text-sm gap-2">
                <span className="text-gray-600 shrink-0">Delivery Address:</span>
                <span className="font-medium text-gray-800 text-right">
                  {assignOrder.shippingAddress?.city}, {assignOrder.shippingAddress?.state} - {assignOrder.shippingAddress?.pincode}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-gray-600 shrink-0">Order Total:</span>
                <span className="font-bold text-indigo-700">{formatPrice(assignOrder.totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Courier Partner *</label>
                {loadingCouriers ? (
                  <div className="input-field text-sm text-gray-400 animate-pulse">Loading approved couriers...</div>
                ) : approvedCouriers.length === 0 ? (
                  <div className="p-4 bg-red-50 rounded-xl text-sm text-red-600">
                    ⚠️ Koi approved courier nahi hai. Pehle <a href="/admin/couriers" className="underline font-medium">Admin → Couriers</a> mein courier approve karein.
                  </div>
                ) : (
                  <select
                    value={selectedCourierId}
                    onChange={e => setSelectedCourierId(e.target.value)}
                    className="input-field text-sm w-full"
                  >
                    <option value="">-- Courier select karein --</option>
                    {approvedCouriers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.deliveryPersonName} — {c.companyName} ({c.mobile})
                        {c.serviceAreas?.length ? ` | Areas: ${c.serviceAreas.slice(0, 2).join(', ')}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Tracking ID <span className="text-gray-400 font-normal">(optional — khali chhodo to auto-generate hoga)</span>
                </label>
                <input
                  value={assignTrackingId}
                  onChange={e => setAssignTrackingId(e.target.value)}
                  placeholder="e.g. IND123456789 (ya khali chhodo)"
                  className="input-field text-sm w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="ghost" onClick={() => setAssignOrder(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={assigning}
                  onClick={handleAssignCourier}
                  disabled={approvedCouriers.length === 0}
                >
                  🚚 Assign Courier
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminPageWrapper>
  );
}