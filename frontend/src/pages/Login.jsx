import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShoppingBag,
  FiZap, FiRefreshCcw, FiShield, FiTruck, FiHome
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: FiShoppingBag, text: 'Exclusive fashion collections' },
  { icon: FiZap, text: 'Fast & free delivery over ₹999' },
  { icon: FiRefreshCcw, text: 'Hassle-free 30-day returns' },
  { icon: FiShield, text: '100% secure checkout' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-rose-500 via-red-500 to-fuchsia-600 flex-col justify-between p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />
        <div className="absolute top-1/2 right-10 w-40 h-40 bg-fuchsia-400/30 rounded-full blur-xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
           <Link to="/" className="inline-flex items-center gap-2">
            <img src="/footer.png" className='h-16' alt="" />
             </Link>
          </div>

        {/* Main copy */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
              Dress the <br />
              <span className="text-yellow-200">best version</span> <br />
              of yourself.
            </h2>
            <p className="text-rose-100 text-base mb-8">
              Discover premium fashion for men, women &amp; kids — delivered right to your door.
            </p>
            <div className="space-y-3">
              {PERKS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <p.icon className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-rose-100 text-sm">{p.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'].map((c, i) => (
              <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-white/30`} />
            ))}
          </div>
          <p className="text-rose-100 text-xs">
            <span className="text-white font-bold">50,000+</span> happy shoppers
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 mt-5 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
            <img src="/tecai.png" className='h-16' alt="" />
             </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to continue shopping</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-rose-500 hover:text-rose-700 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  required
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-60 transition-all active:scale-[0.98] mt-2"
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Quick links for sellers/admins */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Link to="/seller/login"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <FiHome className="w-3.5 h-3.5" /> Seller Portal
            </Link>
            <Link to="/courier/login"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <FiTruck className="w-3.5 h-3.5" /> Courier Portal
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500">
            New to TECAISHOP?{' '}
            <Link to="/register" className="text-rose-500 font-semibold hover:text-rose-700">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}