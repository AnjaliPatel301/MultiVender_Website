import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiArrowRight, FiPlus, FiBox, FiStar, FiBell } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import { useSellerStore } from '../../store/sellerStore';
import SellerLayout from './SellerLayout';

const QUICK_LINKS = [
  { to: '/seller/inventory', label: 'Inventory', icon: FiBox },
  { to: '/seller/reviews', label: 'Reviews', icon: FiStar },
  { to: '/seller/analytics', label: 'Analytics', icon: FiTrendingUp },
  { to: '/seller/notifications', label: 'Notifications', icon: FiBell },
];

const StatCard = ({ title, value, icon: Icon, color, subtext, linkTo }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
          View <FiArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
    <p className="text-red-500 text-sm">{title}</p>
    <p className="text-xl sm:text-2xl font-bold text-red-900 mt-1">{value}</p>
    {subtext && <p className="text-xs text-red-400 mt-1">{subtext}</p>}
  </motion.div>
);

export default function SellerDashboard() {
  const { seller } = useSellerStore();
  const [earnings, setEarnings] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [earningsData, productsData, ordersData] = await Promise.all([
          sellerAPI.getEarnings(),
          sellerAPI.getProducts({ limit: 5 }),
          sellerAPI.getOrders({ limit: 5 }),
        ]);
        setEarnings(earningsData.earnings);
        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900">
            Welcome back, {seller?.shopName}! 👋
          </h1>
          <p className="text-red-500 mt-1 text-sm">Here's what's happening in your shop today.</p>
        </div>
        <Link to="/seller/products?add=1"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md w-full sm:w-auto">
          <FiPlus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-3 text-sm font-medium text-red-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all">
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Sales" icon={FiDollarSign} color="bg-green-100 text-green-600"
              value={fmt(earnings?.totalSales)} subtext={`Net: ${fmt(earnings?.netEarnings)}`}
              linkTo="/seller/earnings"
            />
            <StatCard
              title="Total Orders" icon={FiShoppingBag} color="bg-blue-100 text-blue-600"
              value={earnings?.totalOrders || 0} subtext="Delivered orders"
              linkTo="/seller/orders"
            />
            <StatCard
              title="Available Balance" icon={FiDollarSign} color="bg-indigo-100 text-indigo-600"
              value={fmt(earnings?.availableBalance)} subtext="Ready to withdraw"
              linkTo="/seller/earnings"
            />
            <StatCard
              title="This Month" icon={FiTrendingUp} color="bg-purple-100 text-purple-600"
              value={fmt(earnings?.monthSales)} subtext={`Net: ${fmt(earnings?.monthNet)}`}
              linkTo="/seller/earnings"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-red-100">
                <h3 className="font-semibold text-red-800">My Products</h3>
                <Link to="/seller/products" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-red-50">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-red-400">
                    <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products yet</p>
                    <Link to="/seller/products?add=1" className="text-indigo-600 text-sm font-medium mt-2 inline-block">Add your first product →</Link>
                  </div>
                ) : products.map(p => (
                  <div key={p._id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-3">
                    <img src={p.images?.[0] || p.variants?.[0]?.images?.[0]} alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover bg-red-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 truncate">{p.name}</p>
                      <p className="text-xs text-red-400 capitalize">{p.category} · {p.subCategory || p.productType || '—'}</p>
                    </div>
                    <div className="sm:text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-red-900">₹{p.price}</p>
                      <p className="text-xs text-red-400">{p.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-red-100">
                <h3 className="font-semibold text-red-800">Recent Orders</h3>
                <Link to="/seller/orders" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-red-50">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-red-400">
                    <FiShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No orders yet</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-red-800">{order.orderNumber}</p>
                      <p className="text-xs text-red-400">{order.user?.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-red-100 text-red-600'}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-red-900 mt-1">₹{order.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SellerLayout>
  );
}
