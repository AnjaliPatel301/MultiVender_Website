import { useState, useEffect } from 'react';
import { FiTruck, FiCheck, FiX, FiPause } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AdminPageWrapper } from './AdminDashboard';

const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use(c => { const t = localStorage.getItem('TECAISHOP_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r.data, e => Promise.reject(new Error(e.response?.data?.message || e.message)));

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/courier/admin/all', { params: { status: statusFilter || undefined } });
      setCouriers(data.couriers || []);
    } catch { toast.error('Failed to load couriers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCouriers(); }, [statusFilter]);

  const updateStatus = async (id, status, rejectionReason = '') => {
    setUpdatingId(id);
    try {
      await api.put(`/courier/admin/${id}/status`, { status, rejectionReason });
      toast.success(`Courier ${status}!`);
      fetchCouriers();
    } catch (err) { toast.error(err.message); }
    finally { setUpdatingId(null); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', suspended: 'bg-orange-100 text-orange-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <AdminPageWrapper title="Courier Partner Management" subtitle="Review courier requests and manage partner status.">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courier Partner Management</h1>
            <p className="mt-1 text-sm text-gray-500">Review courier requests and manage partner status.</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {['', 'pending', 'approved', 'suspended', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${statusFilter === s ? 'bg-violet-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : couriers.length === 0 ? (
            <div className="py-12 text-center">
              <FiTruck className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No courier partners found</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Courier', 'Company', 'Mobile', 'Vehicle', 'Service Areas', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {couriers.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 text-xs font-bold text-white">
                              {c.deliveryPersonName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{c.deliveryPersonName}</p>
                              <p className="text-xs text-gray-500">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.companyName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.vehicleNumber || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{c.serviceAreas?.slice(0, 2).join(', ') || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {c.status !== 'approved' && (
                              <button onClick={() => updateStatus(c._id, 'approved')} disabled={updatingId === c._id}
                                title="Approve" className="rounded-lg bg-green-50 p-1.5 text-green-600 transition-colors hover:bg-green-100">
                                <FiCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {c.status === 'approved' && (
                              <button onClick={() => updateStatus(c._id, 'suspended')} disabled={updatingId === c._id}
                                title="Suspend" className="rounded-lg bg-orange-50 p-1.5 text-orange-600 transition-colors hover:bg-orange-100">
                                <FiPause className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {c.status !== 'rejected' && (
                              <button onClick={() => updateStatus(c._id, 'rejected')} disabled={updatingId === c._id}
                                title="Reject" className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100">
                                <FiX className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {couriers.map(c => (
                  <div key={c._id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 text-sm font-bold text-white">
                          {c.deliveryPersonName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.deliveryPersonName}</p>
                          <p className="text-xs text-gray-500">{c.companyName}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium text-gray-700">Email:</span> {c.email}</p>
                      <p><span className="font-medium text-gray-700">Mobile:</span> {c.mobile}</p>
                      <p><span className="font-medium text-gray-700">Vehicle:</span> {c.vehicleNumber || '-'}</p>
                      <p><span className="font-medium text-gray-700">Areas:</span> {c.serviceAreas?.slice(0, 2).join(', ') || '-'}</p>
                      <p><span className="font-medium text-gray-700">Joined:</span> {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.status !== 'approved' && (
                        <button onClick={() => updateStatus(c._id, 'approved')} disabled={updatingId === c._id}
                          className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100 disabled:opacity-60">
                          Approve
                        </button>
                      )}
                      {c.status === 'approved' && (
                        <button onClick={() => updateStatus(c._id, 'suspended')} disabled={updatingId === c._id}
                          className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-60">
                          Suspend
                        </button>
                      )}
                      {c.status !== 'rejected' && (
                        <button onClick={() => updateStatus(c._id, 'rejected')} disabled={updatingId === c._id}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
    </AdminPageWrapper>
  );
}
