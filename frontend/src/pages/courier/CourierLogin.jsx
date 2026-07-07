import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiTruck, FiMapPin, FiClock, FiPackage } from 'react-icons/fi';
import { useCourierStore } from '../../store/courierStore';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: FiMapPin, title: 'Live Tracking', desc: 'Route optimization & live map' },
  { icon: FiClock, title: 'Flexible Hours', desc: 'Work on your own schedule' },
  { icon: FiPackage, title: 'Daily Deliveries', desc: 'Consistent order flow every day' },
];

export default function CourierLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { courierLogin, isLoading } = useCourierStore(); // ✅ matches store's actual function name
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await courierLogin(form.email, form.password); // ✅ passes email & password separately
    if (result.success) {
      toast.success('Welcome back, delivery partner!');
      navigate('/courier/dashboard');
    } else {
      setError(result.message || result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <FiTruck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-white">TECAISHOP</span>
            <span className="text-sky-300 text-xs block -mt-0.5">Courier Partner</span>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-3">
              Deliver with <br />
              <span className="text-yellow-300">confidence</span> <br />
              &amp; ease.
            </h2>
            <p className="text-sky-200 text-sm mb-8">
              Access all your delivery assignments, track earnings &amp; navigate routes — from one dashboard.
            </p>
            <div className="space-y-4">
              {PERKS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <p.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{p.title}</p>
                    <p className="text-sky-300 text-xs">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <p className="text-yellow-300 text-xs font-semibold mb-1">🚀 Fast payments</p>
          <p className="text-sky-200 text-xs">Earnings processed weekly, directly to your bank account.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiTruck className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-gray-900">TECAISHOP</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-xs font-semibold mb-4">
              <FiTruck className="w-3 h-3" /> Courier Partner
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="text-gray-400 text-sm mt-1">View &amp; manage your delivery assignments</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="courier@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-sky-200 disabled:opacity-60 transition-all active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Sign In <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link
            to="/courier/register"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-sky-200 text-sky-700 rounded-2xl text-sm font-semibold hover:bg-sky-50 transition-colors"
          >
            🚚 Apply as Courier Partner
          </Link>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-6">
            <Link to="/login" className="hover:text-gray-600">← User Login</Link>
            <span>•</span>
            <Link to="/" className="hover:text-gray-600">Back to Store</Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}