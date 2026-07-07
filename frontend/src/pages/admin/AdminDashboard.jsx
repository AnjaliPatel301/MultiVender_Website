import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers, FiTruck, FiTag,
  FiPercent, FiDollarSign, FiRefreshCw, FiStar, FiBell, FiSettings,
  FiLogOut, FiChevronRight, FiTrendingUp, FiTrendingDown,
  FiArrowRight, FiAlertCircle, FiCheckCircle, FiClock, FiBarChart2,
  FiHome, FiMessageSquare, FiFileText, FiImage, FiMenu, FiX
} from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

// ─── Sidebar Nav Config ───────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
      { to: '/admin/orders', icon: FiPackage, label: 'Orders' },
      { to: '/admin/products', icon: FiShoppingBag, label: 'Products' },
      { to: '/admin/users', icon: FiUsers, label: 'Users' },
    ],
  },
  {
    label: 'Sellers & Couriers',
    items: [
      { to: '/admin/sellers', icon: FiBarChart2, label: 'Sellers' },
      { to: '/admin/couriers', icon: FiTruck, label: 'Couriers' },
      { to: '/admin/withdrawals', icon: FiDollarSign, label: 'Withdrawals' },
      { to: '/admin/commission', icon: FiPercent, label: 'Commission' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/categories', icon: FiTag, label: 'Categories' },
      { to: '/admin/coupons', icon: FiPercent, label: 'Coupons' },
      { to: '/admin/banners', icon: FiImage, label: 'Banners' },
      { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/admin/returns', icon: FiRefreshCw, label: 'Returns' },
      { to: '/admin/complaints', icon: FiMessageSquare, label: 'Complaints' },
      { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
      { to: '/admin/reports', icon: FiFileText, label: 'Reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
      { to: '/', icon: FiHome, label: 'View Store' },
    ],
  },
];

// ─── Shared AdminNav ──────────────────────────────────────────────────────────
export const AdminNav = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <FiShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">TECAISHOP</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname === item.to ||
                    (item.to !== '/admin' && item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return Sidebar;
};

// ─── Page Wrapper (use in every admin page) ───────────────────────────────────
export const AdminPageWrapper = ({ children, title, subtitle, actions }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminNav />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 z-40 lg:hidden"
            >
              <AdminNav mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, change, color, prefix = '', suffix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
        }`}>
          {change >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}{suffix}
    </p>
    <p className="text-sm text-gray-500 mt-1 font-medium">{title}</p>
  </motion.div>
);

// ─── Mini SVG Bar Chart ───────────────────────────────────────────────────────
const MiniBarChart = ({ data = [] }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.slice(-12).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-violet-500 opacity-80 hover:opacity-100 transition-opacity cursor-default"
            style={{ height: `${Math.max(4, (d.value / max) * 56)}px` }}
            title={`${d.label}: ₹${d.value?.toLocaleString('en-IN')}`}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const revenueChart = (data?.revenueByMonth || []).map(m => ({
    label: `${m._id?.year}-${m._id?.month}`,
    value: m.revenue || 0,
  }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      <main className="lg:ml-64 flex-1 p-6">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Revenue" value={stats.totalRevenue} prefix="₹"
                icon={FiDollarSign} change={stats.revenueGrowth}
                color="bg-violet-100 text-violet-600" />
              <StatCard title="Total Orders" value={stats.totalOrders}
                icon={FiPackage} change={stats.orderGrowth}
                color="bg-blue-100 text-blue-600" />
              <StatCard title="Total Customers" value={stats.totalUsers}
                icon={FiUsers} change={stats.userGrowth}
                color="bg-emerald-100 text-emerald-600" />
              <StatCard title="Total Products" value={stats.totalProducts}
                icon={FiShoppingBag}
                color="bg-amber-100 text-amber-600" />
              <StatCard title="Pending Orders" value={stats.pendingOrders}
                icon={FiClock}
                color="bg-orange-100 text-orange-600" />
              <StatCard title="Pending Sellers" value={stats.pendingSellers}
                icon={FiAlertCircle}
                color="bg-red-100 text-red-600" />
              <StatCard title="Delivered Today" value={stats.deliveredToday}
                icon={FiCheckCircle}
                color="bg-teal-100 text-teal-600" />
              <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals}
                icon={FiDollarSign}
                color="bg-indigo-100 text-indigo-600" />
            </div>

            {/* Revenue chart + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-gray-900">Revenue Overview</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
                  </div>
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                    ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')} total
                  </span>
                </div>
                {revenueChart.length > 0 ? (
                  <MiniBarChart data={revenueChart} />
                ) : (
                  <div className="h-16 flex items-center justify-center text-sm text-gray-400">No revenue data yet</div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { to: '/admin/orders?status=pending', label: 'Pending Orders', count: stats.pendingOrders, color: 'text-orange-600 bg-orange-50' },
                    { to: '/admin/sellers?status=pending', label: 'Seller Requests', count: stats.pendingSellers, color: 'text-red-600 bg-red-50' },
                    { to: '/admin/withdrawals?status=pending', label: 'Withdrawal Requests', count: stats.pendingWithdrawals, color: 'text-indigo-600 bg-indigo-50' },
                    { to: '/admin/returns?status=pending', label: 'Return Requests', count: stats.pendingReturns, color: 'text-amber-600 bg-amber-50' },
                    { to: '/admin/couriers?status=pending', label: 'Courier Approvals', count: stats.pendingCouriers, color: 'text-blue-600 bg-blue-50' },
                  ].map(qa => (
                    <Link key={qa.to} to={qa.to}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                      <span className="text-sm text-gray-700 font-medium">{qa.label}</span>
                      <div className="flex items-center gap-2">
                        {qa.count > 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qa.color}`}>
                            {qa.count}
                          </span>
                        )}
                        <FiChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <Link to="/admin/orders" className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 font-medium">
                    View all <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {(data?.recentOrders || []).length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No orders yet</div>
                  ) : (data?.recentOrders || []).map(order => (
                    <div key={order._id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Top Products</h2>
                  <Link to="/admin/products" className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 font-medium">
                    View all <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {(data?.topProducts || []).length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No data yet</div>
                  ) : (data?.topProducts || []).map((tp, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                      {tp.product?.images?.[0] && (
                        <img src={tp.product.images[0]} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tp.product?.name}</p>
                        <p className="text-xs text-gray-400">{tp.totalSold} sold</p>
                      </div>
                      <p className="text-sm font-bold text-violet-700">₹{tp.revenue?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
