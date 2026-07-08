import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck,
  FiChevronDown, FiChevronUp, FiEye, FiEyeOff, FiImage,
  FiMove, FiStar
} from 'react-icons/fi';
import { productAPI, categoryAPI } from '../../services/api';
import { AdminPageWrapper } from './AdminDashboard';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', productType: '', subCategory: '',
  brand: 'TECAISHOP', images: '', sizes: '', colors: '', stock: '', sku: '',
  tags: '', isFeatured: false, isFlashSale: false, flashSalePrice: '',
};

const emptyVariantForm = {
  colorName: '', colorCode: '#000000', price: '', originalPrice: '',
  stock: '', sku: '', sizes: '', isActive: true, isDefault: false,
};

// ─── Variant Form Modal ───────────────────────────────────────────────────────
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
        await productAPI.updateVariant(productId, variant._id, payload);
        toast.success('Variant updated!');
      } else {
        await productAPI.addVariant(productId, payload);
        toast.success('Color variant added!');
      }
      onSaved(); onClose();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl my-4 sm:my-8 shadow-2xl">
        <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
          <h2 className="font-semibold text-gray-800 text-base sm:text-lg truncate">{variant ? 'Edit Color Variant' : 'Add Color Variant'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Color Name *</label>
              <input value={form.colorName} onChange={set('colorName')} required className="input-field text-sm w-full" placeholder="e.g. Midnight Black" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Color Code (HEX)</label>
              <div className="flex gap-2">
                <input type="color" value={form.colorCode} onChange={set('colorCode')} className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer flex-shrink-0" />
                <input value={form.colorCode} onChange={set('colorCode')} className="input-field text-sm flex-1 min-w-0" placeholder="#000000" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Price (₹) *</label><input type="number" value={form.price} onChange={set('price')} required min={0} className="input-field text-sm w-full" /></div>
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Original Price</label><input type="number" value={form.originalPrice} onChange={set('originalPrice')} min={0} className="input-field text-sm w-full" /></div>
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Stock</label><input type="number" value={form.stock} onChange={set('stock')} min={0} className="input-field text-sm w-full" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">SKU</label><input value={form.sku} onChange={set('sku')} className="input-field text-sm w-full" /></div>
            <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Sizes (comma separated)</label><input value={form.sizes} onChange={set('sizes')} className="input-field text-sm w-full" placeholder="S, M, L, XL" /></div>
          </div>

          {/* Images */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
              Images <span className="normal-case text-gray-400 font-normal">(drag to reorder · ★ to set as main)</span>
            </label>
            {imageList.length > 0 && (
              <div className="space-y-2 mb-3">
                {imageList.map((url, idx) => (
                  <div key={idx} draggable onDragStart={() => dragStart(idx)} onDragEnter={() => dragEnter(idx)} onDragEnd={dragEnd} onDragOver={e => e.preventDefault()}
                    className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 cursor-move">
                    <FiMove className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <img src={url} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0 bg-gray-200" onError={e => { e.target.src = 'https://via.placeholder.com/48?text=?'; }} />
                    <span className="text-xs text-gray-500 flex-1 truncate min-w-0">{url}</span>
                    {idx === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Main</span>}
                    {idx !== 0 && <button type="button" onClick={() => setDefault(idx)} title="Set as main" className="text-gray-300 hover:text-amber-500 flex-shrink-0"><FiStar className="w-4 h-4" /></button>}
                    <button type="button" onClick={() => removeImage(idx)} className="text-gray-300 hover:text-red-500 flex-shrink-0"><FiX className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col xs:flex-row gap-2">
              <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                placeholder="Image URL paste karo aur Enter dabao"
                className="input-field text-sm flex-1 min-w-0" />
              <button type="button" onClick={addImage} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 shrink-0">
                <FiImage className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 text-red-600 rounded" /><span className="text-sm text-gray-700">Active</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} className="w-4 h-4 text-red-600 rounded" /><span className="text-sm text-gray-700">Default color</span></label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} fullWidth>{variant ? 'Update' : 'Add Color Variant'}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Variant Manager ───────────────────────────────────────────────────────────
function VariantManager({ product, onProductUpdated }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const variants = product.variants || [];

  const handleDelete = async (variantId) => {
    if (!window.confirm('Delete this color variant?')) return;
    setDeletingId(variantId);
    try {
      const data = await productAPI.deleteVariant(product._id, variantId);
      toast.success('Variant deleted');
      onProductUpdated(data.product);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (variant) => {
    try {
      const data = await productAPI.updateVariant(product._id, variant._id, { isActive: !variant.isActive });
      toast.success(variant.isActive ? 'Disabled' : 'Enabled');
      onProductUpdated(data.product);
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleRefresh = async () => {
    try { const data = await productAPI.getOne(product._id); onProductUpdated(data.product); } catch {}
  };

  return (
    <div className="mt-4 border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">
          Color Variants <span className="ml-1.5 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{variants.length} colors</span>
        </p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors shrink-0">
          <FiPlus className="w-3.5 h-3.5" /> Add Color
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">
          <p className="text-2xl mb-1">🎨</p>
          <p>Koi color variant nahi — "Add Color" pe click karo</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {variants.map(v => (
            <div key={v._id} className={`flex flex-col xs:flex-row xs:items-center gap-3 px-3 sm:px-4 py-3 hover:bg-gray-50 ${!v.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                  {v.images?.length > 0
                    ? <img src={v.images[0]} alt={v.colorName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ backgroundColor: v.colorCode || '#ccc' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm truncate">{v.colorName}</span>
                    <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: v.colorCode }} />
                    {v.isDefault && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Default</span>}
                    {!v.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                    <span>{formatPrice(v.price)}</span>
                    <span>·</span><span>{v.stock} stock</span>
                    {v.images?.length > 0 && <><span>·</span><span>{v.images.length} images</span></>}
                    {v.sizes?.length > 0 && <><span>·</span><span className="truncate">{v.sizes.join(', ')}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 self-end xs:self-auto">
                <button onClick={() => handleToggle(v)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  {v.isActive ? <FiEye className="w-4 h-4 text-green-500" /> : <FiEyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditingVariant(v)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(v._id)} disabled={deletingId === v._id} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-50"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && <VariantModal productId={product._id} variant={null} onClose={() => setShowAdd(false)} onSaved={handleRefresh} />}
        {editingVariant && <VariantModal productId={product._id} variant={editingVariant} onClose={() => setEditingVariant(null)} onSaved={handleRefresh} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main AdminProducts ────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Derived: subcategories list for selected category (category stored as slug)
  const selectedCatObj = categories.find(c => c.slug === form.category);
  const availableSubcategories = selectedCatObj?.types || [];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll({ page, limit: 15, search: search || undefined });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      setCategories(data.categories || []);
    } catch {}
  };

  useEffect(() => { fetchProducts(); }, [page, search]);
  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    const defaultCat = categories[0]?.slug || '';
    setForm({ ...emptyForm, category: defaultCat });
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
      productType: p.productType || '',
      subCategory: p.subCategory || '',
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
      let savedId = editId;
      if (editId) {
        await productAPI.update(editId, payload);
        toast.success('Product updated!');
      } else {
        const data = await productAPI.create(payload);
        toast.success('Product created! Ab color variants add karo ▼');
        savedId = data.product?._id;
        setExpandedProductId(savedId);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.delete(id); toast.success('Deleted'); fetchProducts(); }
    catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleProductVariantUpdated = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  const set = (key) => (e) =>
    setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // When category changes, reset subCategory and productType
  const handleCategoryChange = (e) => {
    setForm(p => ({ ...p, category: e.target.value, subCategory: '', productType: '' }));
  };

  return (
    <AdminPageWrapper
      title="Products"
      subtitle={`${total} total products`}
      actions={
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {categories.length === 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-2 rounded-xl whitespace-nowrap">
              ⚠️ Pehle Category banao
            </span>
          )}
          <Button variant="primary" onClick={openAdd}><FiPlus className="w-4 h-4" /> <span className="hidden xs:inline">Add Product</span><span className="xs:hidden">Add</span></Button>
        </div>
      }
    >
      {/* Search */}
      <div className="relative mb-6 w-full sm:max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FiX className="w-4 h-4" /></button>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Product', 'Category / Type', 'Price', 'Stock', 'Colors', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-3 sm:px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded-lg" /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No products found</td></tr>
              ) : products.map(product => (
                <>
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-3 max-w-[220px]">
                        <img src={product.images?.[0] || product.variants?.[0]?.images?.[0]} alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-100" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400 truncate">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className="badge bg-blue-50 text-blue-700 capitalize">{product.category}</span>
                      {product.productType && (
                        <span className="ml-1 badge bg-purple-50 text-purple-700">{product.productType}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-gray-900 text-sm">{formatPrice(product.price)}</p>
                      {product.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`badge whitespace-nowrap ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} left
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {product.variants?.length > 0 ? (
                        <div className="flex gap-1 flex-wrap max-w-[110px]">
                          {product.variants.filter(v => v.isActive).slice(0, 4).map(v => (
                            <div key={v._id} title={v.colorName}
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: v.colorCode || '#ccc' }} />
                          ))}
                          {product.variants.length > 4 && <span className="text-xs text-gray-400">+{product.variants.length - 4}</span>}
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {product.isFeatured ? <FiCheck className="w-5 h-5 text-green-500" /> : <FiX className="w-5 h-5 text-gray-300" />}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <button onClick={() => openEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                        <button
                          onClick={() => setExpandedProductId(id => id === product._id ? null : product._id)}
                          title="Manage color variants"
                          className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"
                        >
                          {expandedProductId === product._id ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedProductId === product._id && (
                    <tr key={`${product._id}-variants`}>
                      <td colSpan={7} className="px-3 sm:px-4 pb-4 bg-purple-50/30">
                        <VariantManager product={product} onProductUpdated={handleProductVariantUpdated} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <span className="px-2 sm:px-4 py-2 text-sm text-gray-500 whitespace-nowrap">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl my-4 sm:my-8 shadow-2xl">
              <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
                <h2 className="font-semibold text-gray-800 text-base sm:text-lg truncate">{editId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><FiX className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Product Name *</label>
                    <input value={form.name} onChange={set('name')} required className="input-field text-sm w-full" placeholder="e.g. Banarasi Silk Saree" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Description *</label>
                    <textarea value={form.description} onChange={set('description')} required rows={3} className="input-field text-sm resize-none w-full" />
                  </div>

                  {/* Category - dynamic from DB */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Category *</label>
                    <select value={form.category} onChange={handleCategoryChange} required className="input-field text-sm w-full">
                      <option value="">-- Select Category --</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory - dynamic from selected category (from DB) */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                      Subcategory *
                      {selectedCatObj && <span className="text-gray-400 font-normal ml-1">(required)</span>}
                    </label>
                    {availableSubcategories.length > 0 ? (
                      <select value={form.subCategory} onChange={set('subCategory')} required className="input-field text-sm w-full">
                        <option value="">-- Select Subcategory --</option>
                        {availableSubcategories.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <input value={form.subCategory} onChange={set('subCategory')} className="input-field text-sm w-full"
                        placeholder={form.category ? 'Subcategory type karo' : 'Pehle category select karo'} />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Base Price (₹) *</label>
                    <input type="number" value={form.price} onChange={set('price')} required min={0} className="input-field text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Original Price (₹)</label>
                    <input type="number" value={form.originalPrice} onChange={set('originalPrice')} min={0} className="input-field text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Base Stock *</label>
                    <input type="number" value={form.stock} onChange={set('stock')} required min={0} className="input-field text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Brand</label>
                    <input value={form.brand} onChange={set('brand')} className="input-field text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">SKU</label>
                    <input value={form.sku} onChange={set('sku')} className="input-field text-sm w-full" placeholder="LXF-SAR-001" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Default Images (comma separated URLs)</label>
                    <input value={form.images} onChange={set('images')} className="input-field text-sm w-full" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Default Sizes</label>
                    <input value={form.sizes} onChange={set('sizes')} className="input-field text-sm w-full" placeholder="S, M, L, XL" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Tags</label>
                    <input value={form.tags} onChange={set('tags')} className="input-field text-sm w-full" placeholder="saree, silk, festive" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 text-red-600" /><span className="text-sm text-gray-700">Featured</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFlashSale} onChange={set('isFlashSale')} className="w-4 h-4 text-red-600" /><span className="text-sm text-gray-700">Flash Sale</span></label>
                  </div>
                  {form.isFlashSale && (
                    <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Flash Sale Price</label><input type="number" value={form.flashSalePrice} onChange={set('flashSalePrice')} min={0} className="input-field text-sm w-full" /></div>
                  )}
                </div>

                {!editId && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-xs text-purple-700 font-medium">💡 Product banane ke baad ▼ button dabao aur alag alag colors add karo — har color ke liye alag images, price, stock.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving} fullWidth>{editId ? 'Update Product' : 'Create Product'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageWrapper>
  );
}