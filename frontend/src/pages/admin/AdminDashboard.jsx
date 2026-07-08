import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers, FiTruck, FiTag,
  FiPercent, FiDollarSign, FiRefreshCw, FiStar, FiBell, FiSettings,
  FiLogOut, FiChevronRight, FiChevronLeft, FiTrendingUp, FiTrendingDown,
  FiArrowRight, FiAlertCircle, FiCheckCircle, FiClock, FiBarChart2,
  FiHome, FiMessageSquare, FiFileText, FiImage, FiMenu, FiX
} from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

// ─── Layout constants (keep these in sync!) ───────────────────────────────────
// Sidebar width and the main content's left margin MUST match, or you'll get
// either an overlap or an empty gap on large screens.
const SIDEBAR_WIDTH = 'w-[85vw] sm:w-72';       // responsive mobile drawer width + desktop width
const CONTENT_MARGIN = 'lg:ml-72';  // must equal SIDEBAR_WIDTH
const SIDEBAR_WIDTH_COLLAPSED = 'w-20';       // 5rem / 80px, icon-only rail
const CONTENT_MARGIN_COLLAPSED = 'lg:ml-20';  // must equal SIDEBAR_WIDTH_COLLAPSED

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
export const AdminNav = ({ onMobileClose, collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside
      className={`${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH} max-w-[85vw] h-[100dvh] bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 shadow-sm overflow-hidden transition-[width] duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className={`px-3 sm:px-4 py-4 sm:py-5 border-b border-gray-100 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
         
          {!collapsed && (
            <div className="min-w-0">
              <img src="/footer.png" className='h-16' alt="" />
               <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile close (X) */}
            {onMobileClose && (
              <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close menu">
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {/* Collapse toggle — sits to the right of the X */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="flex p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <FiChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center mx-auto mt-2 mb-1 w-8 h-8 rounded-lg hover:bg-gray-100 shrink-0"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <FiChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 min-h-0">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
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
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && active && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-gray-100 shrink-0">
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <FiLogOut className="w-4 h-4" /> {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

// ─── Mobile drawer wrapper (shared by every admin page) ──────────────────────
const MobileSidebar = ({ open, onClose, collapsed, onToggleCollapse }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
        <motion.div
          initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed left-0 top-0 z-40 lg:hidden"
        >
          <AdminNav onMobileClose={onClose} collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── Page Wrapper (use in every admin page) ───────────────────────────────────
export const AdminPageWrapper = ({ children, title, subtitle, actions }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(c => !c);

  return (
    <div className="flex min-h-[100dvh] bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminNav collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <main className={`${collapsed ? CONTENT_MARGIN_COLLAPSED : CONTENT_MARGIN} transition-[margin] duration-300 ease-in-out flex-1 flex flex-col min-h-[100dvh] w-full min-w-0 overflow-x-hidden`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 shrink-0"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <FiX className="w-5 h-5 text-gray-600" /> : <FiMenu className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 min-w-0">
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
    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0"
  >
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
          change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
        }`}>
          {change >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 truncate">
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}{suffix}
    </p>
    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium truncate">{title}</p>
  </motion.div>
);

// ─── Mini SVG Bar Chart ───────────────────────────────────────────────────────
const MiniBarChart = ({ data = [] }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16 w-full overflow-hidden">
      {data.slice(-12).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-[6px]">
          <div
            className="w-full rounded-sm bg-red-500 opacity-80 hover:opacity-100 transition-opacity cursor-default"
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
    <AdminPageWrapper title="Dashboard" subtitle="Welcome back! Here's what's happening.">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard title="Total Revenue" value={stats.totalRevenue} prefix="₹"
              icon={FiDollarSign} change={stats.revenueGrowth}
              color="bg-red-100 text-red-600" />
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 mb-5">
            {/* Revenue chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Revenue Overview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit">
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
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm min-w-0">
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
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group gap-2">
                    <span className="text-sm text-gray-700 font-medium truncate">{qa.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              <div className="px-4 sm:px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-2">
                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                <Link to="/admin/orders" className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium shrink-0">
                  View all <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.recentOrders || []).length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No orders yet</div>
                ) : (data?.recentOrders || []).map(order => (
                  <div key={order._id} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{order.user?.name}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              <div className="px-4 sm:px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-2">
                <h2 className="font-bold text-gray-900">Top Products</h2>
                <Link to="/admin/products" className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium shrink-0">
                  View all <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.topProducts || []).length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No data yet</div>
                ) : (data?.topProducts || []).map((tp, i) => (
                  <div key={i} className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                    {tp.product?.images?.[0] && (
                      <img src={tp.product.images[0]} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tp.product?.name}</p>
                      <p className="text-xs text-gray-400">{tp.totalSold} sold</p>
                    </div>
                    <p className="text-sm font-bold text-red-700 shrink-0">₹{tp.revenue?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminPageWrapper>
  );
}