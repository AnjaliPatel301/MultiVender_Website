import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { AdminPageWrapper } from './AdminDashboard';

const tabs = ['General', 'Payment', 'Shipping', 'Tax', 'SEO', 'Email'];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.get().then(d => setSettings(d.settings || {})).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setSettings(s => ({...s, [key]: val}));

  const renderField = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <input type={type} value={settings[key] || ''} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
    </div>
  );

  const renderToggle = (label, key, description) => (
    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button onClick={() => set(key, !settings[key])} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[key] ? 'bg-gray-900' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <AdminPageWrapper title="Website Settings" subtitle="Manage site-wide settings from one place.">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage site-wide settings from one place.</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
            <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
            <div className="w-full xl:w-48 xl:shrink-0">
              <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:gap-1">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors xl:w-full ${activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              {activeTab === 'General' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">General Settings</h2>
                  {renderField('Website Name', 'siteName', 'text', 'TECAISHOP')}
                  {renderField('Logo URL', 'logo', 'url', 'https://...')}
                  {renderField('Favicon URL', 'favicon', 'url', 'https://...')}
                  {renderField('Contact Email', 'contactEmail', 'email', 'admin@example.com')}
                  {renderField('Contact Phone', 'contactPhone', 'text', '+91 9999999999')}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Business Address</label>
                    <textarea value={settings.address || ''} onChange={e => set('address', e.target.value)} rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              {activeTab === 'Payment' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">Payment Settings</h2>
                  {renderToggle('Cash on Delivery (COD)', 'codEnabled', 'Allow customers to pay on delivery')}
                  {renderField('Razorpay Key ID', 'razorpayKeyId', 'text', 'rzp_...')}
                  {renderField('Razorpay Key Secret', 'razorpayKeySecret', 'password', '***')}
                  {renderField('UPI ID', 'upiId', 'text', 'yourname@upi')}
                </div>
              )}
              {activeTab === 'Shipping' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">Shipping Settings</h2>
                  {renderField('Default Shipping Charge (₹)', 'defaultShippingCharge', 'number', '50')}
                  {renderField('Free Shipping Threshold (₹)', 'freeShippingThreshold', 'number', '499')}
                </div>
              )}
              {activeTab === 'Tax' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">Tax Settings</h2>
                  {renderField('GST Percentage (%)', 'gstPercentage', 'number', '18')}
                  <p className="text-sm text-gray-500">Category-specific taxes can be configured per category in the Category Management section.</p>
                </div>
              )}
              {activeTab === 'SEO' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">SEO Settings</h2>
                  {renderField('Meta Title', 'metaTitle', 'text', 'TECAISHOP - Premium Fashion')}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
                    <textarea value={settings.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} rows={3}
                      placeholder="Website description for search engines..."
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              {activeTab === 'Email' && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold">Email (SMTP) Settings</h2>
                  {renderField('SMTP Host', 'smtpHost', 'text', 'smtp.gmail.com')}
                  {renderField('SMTP Port', 'smtpPort', 'number', '587')}
                  {renderField('SMTP Username', 'smtpUser', 'email', 'your@email.com')}
                  {renderField('SMTP Password', 'smtpPass', 'password', '***')}
                </div>
              )}
            </div>
          </div>
        )}
    </AdminPageWrapper>
  );
}
