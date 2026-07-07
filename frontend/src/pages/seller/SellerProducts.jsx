import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiPackage,
  FiChevronDown, FiChevronUp, FiImage, FiMove, FiStar, FiCheck
} from 'react-icons/fi';
import { sellerAPI, categoryAPI } from '../../services/api';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', subCategory: '', productType: '', brand: '',
  images: '', sizes: '', colors: '', stock: '', sku: '', tags: '',
  isFeatured: false, isFlashSale: false, flashSalePrice: '',
};

const emptyVariantForm = {
  colorName: '', colorCode: '#000000', price: '', originalPrice: '',
  stock: '', sku: '', sizes: '', isActive: true, isDefault: false,
};

// ─── Color Variant Form Modal ─────────────────────────────────────────────────
function VariantModal({ productId, variant, onClose, onSaved }) {
  const [form, setForm] = useState(
    variant ? { ...variant, sizes: variant.sizes?.join(', ') || '' } : emptyVariantForm
  );
  const [saving, setSaving] = useState(false);
  const [imageList, setImageList] = useState(variant?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const set = (key) => (e) =>
    setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setImageList(p => [...p, url]);
    setNewImageUrl('');
  };

  const removeImage = (idx) => setImageList(p => p.filter((_, i) => i !== idx));

  const dragStart = (idx) => { dragItem.current = idx; };
  const dragEnter = (idx) => { dragOverItem.current = idx; };
  const dragEnd = () => {
    const list = [...imageList];
    const dragged = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null; dragOverItem.current = null;
    setImageList(list);
  };

  const setDefault = (idx) => {
    const list = [...imageList];
    const [item] = list.splice(idx, 1);
    list.unshift(item);
    setImageList(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.colorName.trim()) { toast.error('Color name required'); return; }
    if (!form.price) { toast.error('Price required'); return; }
    setSaving(true);
    try {
      const payload = {
        colorName: form.colorName.trim(),
        colorCode: form.colorCode,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock) || 0,
        sku: form.sku?.trim() || undefined,
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images: imageList,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };
      if (variant) {
        await sellerAPI.updateVariant(productId, variant._id, payload);
        toast.success('Variant update ho gaya!');
      } else {
        await sellerAPI.addVariant(productId, payload);
        toast.success('Color variant add ho gaya!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {variant ? 'Color Variant Edit Karo' : 'Naya Color Variant Add Karo'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Har color ke liye alag images, price, aur stock set karo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Color Name + Color Picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Color Name *</label>
              <input
                value={form.colorName}
                onChange={set('colorName')}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Midnight Black"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Color Code</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.colorCode}
                  onChange={set('colorCode')}
                  className="w-12 h-10 border border-gray-200 rounded-xl cursor-pointer flex-shrink-0"
                />
                <input
                  value={form.colorCode}
                  onChange={set('colorCode')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={set('price')}
                required
                min={0}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="999"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Original Price (₹)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={set('originalPrice')}
                min={0}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="1499"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={set('stock')}
                min={0}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">SKU</label>
              <input
                value={form.sku}
                onChange={set('sku')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="LXF-BLK-001"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Sizes (comma separated)</label>
            <input
              value={form.sizes}
              onChange={set('sizes')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="S, M, L, XL, XXL"
            />
          </div>

          {/* Image Album */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block flex items-center gap-2">
              <FiImage className="w-3.5 h-3.5" /> Images Album ({imageList.length} images)
            </label>
            <p className="text-xs text-gray-400 mb-3">Drag karke reorder karo. Pehli image main image hogi.</p>

            {imageList.length > 0 && (
              <div className="space-y-2 mb-3">
                {imageList.map((url, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => dragStart(idx)}
                    onDragEnter={() => dragEnter(idx)}
                    onDragEnd={dragEnd}
                    onDragOver={e => e.preventDefault()}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 cursor-move"
                  >
                    <FiMove className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <img
                      src={url}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                      onError={e => { e.target.src = 'https://placehold.co/56x56?text=?'; }}
                    />
                    <span className="text-xs text-gray-500 flex-1 truncate">{url}</span>
                    {idx === 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Main
                      </span>
                    )}
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setDefault(idx)}
                        title="Main image banao"
                        className="text-gray-300 hover:text-amber-500 flex-shrink-0"
                      >
                        <FiStar className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-gray-300 hover:text-red-500 flex-shrink-0"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                placeholder="Image URL paste karo aur Enter dabao ya Add click karo"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium flex items-center gap-1.5 flex-shrink-0"
              >
                <FiImage className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Active + Default checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-gray-700">Default color</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 text-sm"
            >
              {saving ? 'Saving...' : variant ? 'Update Variant' : 'Add Color Variant'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Variant Manager Row ──────────────────────────────────────────────────────
function VariantManager({ product, onProductUpdated }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const variants = product.variants || [];

  const handleDelete = async (variantId) => {
    if (!window.confirm('Ye color variant delete karna chahte ho?')) return;
    setDeletingId(variantId);
    try {
      await sellerAPI.deleteVariant(product._id, variantId);
      toast.success('Variant deleted!');
      onProductUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
          Color Variants
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{variants.length} colors</span>
        </h4>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="w-3.5 h-3.5" /> Add Color
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400 mb-3">Abhi koi color variant nahi hai</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
          >
            + Pehla color add karo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {variants.map(v => (
            <div key={v._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              {/* Color swatch or first image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                {v.images?.[0] ? (
                  <img src={v.images[0]} alt={v.colorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: v.colorCode || '#ccc' }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: v.colorCode }}
                  />
                  <span className="font-semibold text-gray-800 text-sm">{v.colorName}</span>
                  {v.isDefault && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Default</span>
                  )}
                  {!v.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-600">₹{v.price}</span>
                  {v.originalPrice && <span className="text-xs text-gray-400 line-through">₹{v.originalPrice}</span>}
                  <span className="text-xs text-gray-500">Stock: {v.stock}</span>
                  {v.images?.length > 0 && (
                    <span className="text-xs text-indigo-500">{v.images.length} photos</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingVariant(v)}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  disabled={deletingId === v._id}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Variant Modal */}
      {showAdd && (
        <VariantModal
          productId={product._id}
          onClose={() => setShowAdd(false)}
          onSaved={onProductUpdated}
        />
      )}

      {/* Edit Variant Modal */}
      {editingVariant && (
        <VariantModal
          productId={product._id}
          variant={editingVariant}
          onClose={() => setEditingVariant(null)}
          onSaved={onProductUpdated}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const selectedCat = categories.find(c => c.slug === form.category);
  const availableSubcats = selectedCat?.types || [];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await sellerAPI.getProducts({ search: search || undefined, limit: 20 });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  useEffect(() => {
    categoryAPI.getAll()
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const set = (key) => (e) =>
    setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0]?.slug || '' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      images: p.images?.join(', ') || '',
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      tags: p.tags?.join(', ') || '',
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editId) {
        await sellerAPI.updateProduct(editId, payload);
        toast.success('Product update ho gaya!');
      } else {
        const res = await sellerAPI.createProduct(payload);
        toast.success('Product add ho gaya! Ab color variants add karo ▼');
        // Auto-expand the new product for variant adding
        if (res?.product?._id) {
          setExpandedId(res.product._id);
        }
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ye product delete karna chahte ho?')) return;
    try {
      await sellerAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const InputField = ({ label, field, type = 'text', placeholder, required, className = '' }) => (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={set(field)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
      />
    </div>
  );

  return (
    <SellerLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-500 text-sm mt-1">{total} total products</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            <FiPlus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Product search karo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Tip */}
        <div className="mb-5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
          💡 <strong>Tip:</strong> Product add karne ke baad ▼ (expand) button dabao aur har color ke liye alag images, price, stock add karo — bilkul admin jaisa!
        </div>

        {/* Products List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Abhi koi product nahi hai</p>
            <button onClick={openAdd} className="mt-4 text-indigo-600 hover:underline text-sm font-medium">
              + Pehla product add karo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Product Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {(product.images?.[0] || product.variants?.[0]?.images?.[0]) ? (
                      <img
                        src={product.images?.[0] || product.variants[0].images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        product.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        product.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {product.approvalStatus || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category} · ₹{product.price}</p>

                    {/* Color dots */}
                    {product.variants?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-gray-400">{product.variants.length} colors:</span>
                        {product.variants.filter(v => v.isActive).slice(0, 6).map(v => (
                          <div
                            key={v._id}
                            title={v.colorName}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: v.colorCode || '#ccc' }}
                          />
                        ))}
                        {product.variants.length > 6 && (
                          <span className="text-xs text-gray-400">+{product.variants.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-400">Stock</p>
                    <p className="text-sm font-bold text-gray-800">{product.stock}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Edit product */}
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    {/* Delete product */}
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    {/* Expand/Collapse variants */}
                    <button
                      onClick={() => setExpandedId(expandedId === product._id ? null : product._id)}
                      className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Color variants manage karo"
                    >
                      {expandedId === product._id ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Variant Manager (Expandable) */}
                <AnimatePresence>
                  {expandedId === product._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <VariantManager
                          product={product}
                          onProductUpdated={fetchProducts}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {editId ? 'Product Edit Karo' : 'Naya Product Add Karo'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Product Name *" field="name" required placeholder="e.g. Silk Saree" className="sm:col-span-2" />

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={set('description')}
                      required
                      rows={3}
                      placeholder="Product ke baare mein likho..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Category *</label>
                    <select
                      value={form.category}
                      onChange={set('category')}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                    >
                      <option value="">-- Category Select Karo --</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Sub Category</label>
                    {availableSubcats.length > 0 ? (
                      <select
                        value={form.subCategory}
                        onChange={set('subCategory')}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                      >
                        <option value="">-- Select --</option>
                        {availableSubcats.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <input
                        value={form.subCategory}
                        onChange={set('subCategory')}
                        placeholder="Sub Category"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                      />
                    )}
                  </div>

                  <InputField label="Price (₹) *" field="price" type="number" required placeholder="999" />
                  <InputField label="Original Price (₹)" field="originalPrice" type="number" placeholder="1499" />
                  <InputField label="Stock *" field="stock" type="number" required placeholder="50" />
                  <InputField label="Brand" field="brand" placeholder="TECAISHOP" />
                  <InputField label="SKU" field="sku" placeholder="LXF-001" />
                  <InputField label="Product Type" field="productType" placeholder="e.g. Kurta" />
                  <InputField label="Default Images (comma separated URLs)" field="images" className="sm:col-span-2" placeholder="https://..." />
                  <InputField label="Default Sizes (comma separated)" field="sizes" placeholder="S, M, L, XL" />
                  <InputField label="Default Colors (comma separated)" field="colors" placeholder="Black, Red, Blue" />
                  <InputField label="Tags" field="tags" placeholder="silk, festive, women" className="sm:col-span-2" />

                  <div className="flex items-center gap-4 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFlashSale} onChange={set('isFlashSale')} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">Flash Sale</span>
                    </label>
                  </div>
                  {form.isFlashSale && (
                    <InputField label="Flash Sale Price" field="flashSalePrice" type="number" placeholder="699" />
                  )}
                </div>

                {!editId && (
                  <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                    <p className="text-xs text-indigo-700 font-medium">
                      💡 Product banane ke baad ▼ button dabao aur alag alag colors add karo — har color ke liye alag images (album), price, stock set kar sakte ho!
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 text-sm"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SellerLayout>
  );
}
