import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiPackage, FiMapPin, FiStar, FiRefreshCw, FiHeart, FiHelpCircle,
  FiBell, FiShield, FiChevronRight, FiLogOut, FiHome, FiTruck, FiMenu, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { orderAPI } from '../../services/api';
import MyOrders from './MyOrders';
import MyProfile from './MyProfile';
import OrderTracking from './OrderTracking';
import MyReviews from './MyReviews';
import MyReturns from './MyReturns';
import MyNotifications from './MyNotifications';
import HelpCenter from './HelpCenter';
import SecuritySettings from './SecuritySettings';

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome },
  { key: 'orders', label: 'My Orders', icon: FiPackage },
  { key: 'tracking', label: 'Order Tracking', icon: FiTruck },
  { key: 'reviews', label: 'My Reviews', icon: FiStar },
  { key: 'returns', label: 'Returns & Refunds', icon: FiRefreshCw },
  { key: 'profile', label: 'My Profile', icon: FiUser },
  { key: 'notifications', label: 'Notifications', icon: FiBell },
  { key: 'help', label: 'Help Center', icon: FiHelpCircle },
  { key: 'security', label: 'Security', icon: FiShield },
];

const BOTTOM_TABS = [
  { key: 'dashboard', label: 'Home', icon: FiHome },
  { key: 'orders', label: 'Orders', icon: FiPackage },
  { key: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { key: 'profile', label: 'Profile', icon: FiUser },
];

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    orderAPI.getMyOrders({ limit: 100 }).then(d => {
      const orders = d.orders || [];
      setStats({
        total: orders.length,
        pending: orders.filter(o => ['pending', 'confirmed', 'packed'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        returned: orders.filter(o => ['returned', 'refunded'].includes(o.status)).length,
        recent: orders.slice(0, 3),
      });
    }).catch(() => {});
  }, []);

  const quickLinks = [
    { key: 'orders', label: 'My Orders', icon: FiPackage, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
    { key: 'tracking', label: 'Track Order', icon: FiTruck, color: 'bg-sky-50 text-sky-600', border: 'border-sky-100' },
    { key: 'returns', label: 'Returns', icon: FiRefreshCw, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
    { key: 'wishlist', label: 'Wishlist', icon: FiHeart, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Profile Card */}
      <div className="relative  rounded-3xl overflow-hidden bg-gradient-to-r from-red-500 via-red-500 to-fuchsia-500 p-6 text-white shadow-lg shadow-red-200">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-8" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/25 border-2 border-white/40 overflow-hidden flex items-center justify-center text-2xl font-bold shadow-lg">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg leading-tight truncate">{user?.name}</p>
            <p className="text-white/75 text-sm truncate">{user?.email}</p>
            <p className="text-white/60 text-xs mt-1">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-4 grid grid-cols-4 gap-2">
          {stats && [
            { label: 'Total', value: stats.total },
            { label: 'Active', value: stats.pending },
            { label: 'Done', value: stats.delivered },
            { label: 'Returns', value: stats.returned },
          ].map(s => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map(q => (
            <button key={q.key} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${q.border} ${q.color} transition-all hover:scale-105 active:scale-95`}>
              <q.icon className="w-5 h-5" />
              <span className="text-xs font-semibold text-center leading-tight">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recent?.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button className="text-xs text-red-500 font-semibold flex items-center gap-1">
              View All <FiChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recent.map(order => (
              <div key={order._id} className="px-5 py-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {order.items?.[0]?.image
                    ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                    : <FiPackage className="w-5 h-5 text-gray-400 m-auto mt-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 font-mono">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.items?.[0]?.name}{order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{order.totalPrice}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
          <FiHelpCircle className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Need Help?</p>
          <p className="text-xs text-gray-500 mt-0.5">Visit our Help Center for quick answers</p>
        </div>
        <button className="text-xs font-semibold text-violet-600 bg-white border border-violet-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
          Get Help
        </button>
      </div>
    </div>
  );
}

export default function MyAccount() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [active, setActive] = useState(tab || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (tab) setActive(tab);
  }, [tab]);

  const handleNav = (key) => {
    setActive(key);
    setMobileMenuOpen(false);
    navigate(`/my-account/${key}`, { replace: true });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderContent = () => {
    switch (active) {
      case 'orders': return <MyOrders />;
      case 'tracking': return <OrderTracking />;
      case 'reviews': return <MyReviews />;
      case 'returns': return <MyReturns />;
      case 'profile': return <MyProfile />;
      case 'notifications': return <MyNotifications />;
      case 'help': return <HelpCenter />;
      case 'security': return <SecuritySettings />;
      case 'wishlist': return <MyWishlist />;
      default: return <Dashboard user={user} />;
    }
  };

  const activeItem = MENU_ITEMS.find(m => m.key === active);

  return (
    <div className="w-full  bg-gray-50">
      {/* Top Header - Mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <FiMenu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-base">{activeItem?.label || 'My Account'}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 overflow-y-auto flex-1">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button key={item.key} onClick={() => handleNav(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all mb-1 text-left ${
                        isActive ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && <FiChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-gray-100">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 pt-8 lg:pt-40 pb-4 lg:pb-8">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              {/* Sidebar Header */}
              <div className="p-5 bg-gradient-to-br bg-red-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/25 border-2 border-white/40 overflow-hidden flex items-center justify-center font-bold text-white text-lg">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-white/70 text-xs truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-3">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button key={item.key} onClick={() => handleNav(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 text-left group ${
                        isActive
                          ? 'bg-red-500 text-white shadow-md shadow-red-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span>{item.label}</span>
                      {isActive && <FiChevronRight className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  );
                })}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <FiLogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-30 shadow-lg">
        <div className="flex">
          {BOTTOM_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button key={tab.key} onClick={() => handleNav(tab.key)}
                className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all">
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-red-500' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-red-500' : 'text-gray-400'}`}>{tab.label}</span>
              </button>
            );
          })}
          <button onClick={() => setMobileMenuOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all">
            <div className="p-1.5 rounded-xl bg-transparent">
              <FiMenu className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}