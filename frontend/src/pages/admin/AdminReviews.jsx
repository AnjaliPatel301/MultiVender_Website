import { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiEyeOff, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reviewAPI } from '../../services/api';
import { AdminPageWrapper } from './AdminDashboard';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <FiStar key={s} className={`w-3 h-3 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewAPI.adminGetAll({ page, limit: 20 });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await reviewAPI.adminDelete(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) { toast.error(err.message); }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await reviewAPI.adminToggleVisibility(id);
      toast.success('Review visibility toggled');
      fetchReviews();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <AdminPageWrapper title="Review Management" subtitle={`Total: ${total} reviews`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No reviews found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Customer', 'Product', 'Rating', 'Review', 'Verified', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map(r => (
                  <tr key={r._id} className={`hover:bg-gray-50 ${r.isHidden ? 'opacity-50' : ''}`}>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{r.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">{r.product?.name}</td>
                    <td className="px-3 sm:px-4 py-3"><StarRating rating={r.rating} /></td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                      <p className="font-medium truncate">{r.title}</p>
                      <p className="text-gray-500 text-xs line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {r.isVerifiedPurchase && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">✓ Verified</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleVisibility(r._id)} title={r.isHidden ? 'Show' : 'Hide'}
                          className={`${r.isHidden ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}>
                          {r.isHidden ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(r._id)} title="Delete" className="text-red-600 hover:text-red-800">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
}