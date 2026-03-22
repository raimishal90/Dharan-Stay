import { useState, useEffect, useCallback } from 'react';
import {
  adminLogin,
  adminGetOrders,
  adminUpdateOrder,
  adminGetRevenue,
  adminGetBookings,
  adminUpdateBooking,
  adminGetAllProducts,
  adminUpdateProduct,
  adminCreateProduct,
  adminDeleteProduct,
} from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatNPR(amount) {
  return (amount || 0).toLocaleString('en-NP');
}

// ─── Login ───────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(email, password);
      localStorage.setItem('dharan_admin_token', data.token);
      onLogin();
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Dharan Stays Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@dharanstays.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (dateFilter) params.date = dateFilter;
      const data = await adminGetOrders(params);
      setOrders(data);
    } catch {}
  }, [filter, dateFilter]);

  const fetchSummary = async () => {
    try {
      const data = await adminGetRevenue();
      setSummary(data.today);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchSummary()]).finally(() => setLoading(false));
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await adminUpdateOrder(id, status);
      fetchOrders();
    } catch {}
  };

  const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total orders', value: summary.orders_today, icon: '📦' },
            { label: 'Pending', value: summary.pending, icon: '⏳' },
            { label: 'Delivered today', value: summary.delivered_today, icon: '✅' },
            { label: 'Revenue today', value: `NPR ${formatNPR(summary.revenue_today)}`, icon: '💰' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {['', 'placed', 'preparing', 'ready', 'delivered'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === s
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-field ml-auto !w-auto !py-2 text-xs"
        />
      </div>

      {/* Order cards */}
      {orders.length === 0 && <p className="text-center text-gray-400 py-12">No orders found.</p>}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} statusColors={statusColors} />
      ))}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, statusColors }) {
  const [showWA, setShowWA] = useState(false);

  const waMessage = `NEW ORDER — ${order.id}\n\nGuest : ${order.guest_name}\nPhone : ${order.guest_phone}\nRoom  : ${order.room_number || 'N/A'}\nPay   : ${order.payment_method}\n\nItems:\n${order.items.map(i => `  ${i.name} x${i.quantity} = NPR ${i.subtotal}`).join('\n')}\n\nTOTAL : NPR ${order.total_amount}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card space-y-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-gray-900">{order.id}</span>
          <span className={`badge ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
        <span className="font-display font-bold text-gray-900">NPR {formatNPR(order.total_amount)}</span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-semibold text-gray-900">{order.guest_name}</span>
        <a href={`https://wa.me/${order.guest_phone}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          {order.guest_phone}
        </a>
        {order.room_number && <span className="text-gray-500">Room {order.room_number}</span>}
        <span className="badge bg-gray-100 text-gray-600">{order.payment_method}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(order.created_at).toLocaleString()}
        </span>
      </div>

      <div className="text-xs text-gray-500">
        {order.items.map((i) => `${i.name} x${i.quantity}`).join(' · ')}
      </div>

      {/* Status buttons */}
      <div className="flex gap-2 flex-wrap">
        {['placed', 'preparing', 'ready', 'delivered'].map((s) => (
          <button
            key={s}
            onClick={() => onUpdateStatus(order.id, s)}
            disabled={order.status === s}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              order.status === s
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <button onClick={() => setShowWA(!showWA)} className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
        {showWA ? 'Hide' : 'Show'} WhatsApp message
      </button>
      {showWA && (
        <div className="relative">
          <pre className="bg-gray-50 rounded-xl p-4 text-xs whitespace-pre-wrap text-gray-600 border border-gray-100">{waMessage}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(waMessage)}
            className="absolute top-3 right-3 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inventory Tab ───────────────────────────────────
const VALID_CATEGORIES = ['Staples', 'Fresh', 'Spices', 'Drinks', 'Snacks', 'Meal Kit'];
const COMMON_ICONS = ['🍚','🥬','🌶️','🥤','🍿','🍛','🥕','🍅','🧅','🥚','🍌','🥩','🐟','🧈','🥛','🍞','🥘','🍲','🍜','🫘','🌿','🧄','🍋','🫑','🥒','🍳','🫙','🥜','🍪','🧃'];

function ProductForm({ onSave, onCancel, isMealKit = false }) {
  const [form, setForm] = useState({
    name: '',
    category: isMealKit ? 'Meal Kit' : 'Staples',
    price: '',
    icon: isMealKit ? '🍛' : '🍚',
    badge: '',
    description: '',
    ingredients: '',
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      setError('Name and price are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        name: form.name.trim(),
        category: form.category,
        price: parseInt(form.price),
        icon: form.icon || null,
        badge: form.badge || null,
        description: form.description || null,
        ingredients: form.ingredients
          ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        sort_order: parseInt(form.sort_order) || 0,
      };
      await onSave(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-gray-900 text-lg">
          {isMealKit ? 'Create Meal Kit' : 'Add Grocery Item'}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder={isMealKit ? 'e.g. Dal Bhat Meal Kit' : 'e.g. Basmati Rice 1 kg'}
            required
          />
        </div>

        {/* Category */}
        {!isMealKit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {VALID_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (NPR) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input-field"
            placeholder="e.g. 160"
            min="1"
            required
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">{form.icon}</span>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {COMMON_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, icon: emoji })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-gray-100 transition-colors ${
                      form.icon === emoji ? 'bg-primary-50 ring-2 ring-primary' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge (optional)</label>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="input-field"
            placeholder="e.g. Popular, New, Best Seller"
          />
        </div>

        {/* Sort order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            className="input-field"
            placeholder="0"
          />
        </div>

        {/* Description (for meal kits or optional for all) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description {isMealKit ? '*' : '(optional)'}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field resize-none"
            rows={2}
            placeholder={isMealKit ? 'e.g. Complete dal bhat set with rice, lentils, and sides' : 'Short product description'}
          />
        </div>

        {/* Ingredients (meal kits) */}
        {(isMealKit || form.category === 'Meal Kit') && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ingredients (comma-separated) *</label>
            <textarea
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="e.g. Basmati Rice 500g, Red Lentils 250g, Turmeric, Cumin, Ghee"
            />
            {form.ingredients && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.ingredients.split(',').map((ing, i) => ing.trim() && (
                  <span key={i} className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded-full">{ing.trim()}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : isMealKit ? 'Create Meal Kit' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function InventoryTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState('');
  const [showForm, setShowForm] = useState(null); // null | 'grocery' | 'mealkit'
  const [filterCategory, setFilterCategory] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await adminGetAllProducts();
      setProducts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleStock = async (id, currentStock) => {
    try {
      await adminUpdateProduct(id, { in_stock: !currentStock });
      fetchProducts();
    } catch {}
  };

  const savePrice = async (id) => {
    const price = parseInt(priceValue);
    if (!price || price <= 0) return;
    try {
      await adminUpdateProduct(id, { price });
      setEditingPrice(null);
      fetchProducts();
    } catch {}
  };

  const handleCreate = async (data) => {
    await adminCreateProduct(data);
    setShowForm(null);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProduct(id);
      fetchProducts();
    } catch {}
  };

  const filteredProducts = filterCategory
    ? products.filter(p => p.category === filterCategory)
    : products;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      {!showForm && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowForm('grocery')}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Grocery Item
          </button>
          <button
            onClick={() => setShowForm('mealkit')}
            className="flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Meal Kit
          </button>
        </div>
      )}

      {/* Product form */}
      {showForm && (
        <ProductForm
          isMealKit={showForm === 'mealkit'}
          onSave={handleCreate}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            !filterCategory ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          All ({products.length})
        </button>
        {VALID_CATEGORIES.map((cat) => {
          const count = products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filterCategory === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Product table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Product</th>
              <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Category</th>
              <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Price (NPR)</th>
              <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Stock</th>
              <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">{p.icon}</span>
                    <div>
                      <span className="font-medium text-gray-900 block">{p.name}</span>
                      {p.description && (
                        <span className="text-xs text-gray-400 block truncate max-w-[200px]">{p.description}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge bg-gray-100 text-gray-600">{p.category}</span>
                </td>
                <td className="py-3 px-4">
                  {editingPrice === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePrice(p.id);
                          if (e.key === 'Escape') setEditingPrice(null);
                        }}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        autoFocus
                      />
                      <button onClick={() => savePrice(p.id)} className="text-xs text-primary font-medium hover:underline">Save</button>
                      <button onClick={() => setEditingPrice(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPrice(p.id); setPriceValue(String(p.price)); }}
                      className="font-medium text-gray-900 hover:text-primary transition-colors cursor-pointer"
                    >
                      {formatNPR(p.price)}
                    </button>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      p.in_stock
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {p.in_stock ? 'In stock' : 'Out of stock'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete product"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-400">No products in this category.</div>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Tab ─────────────────────────────────────
function RevenueTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetRevenue()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data?.daily?.length) return;
    const headers = 'Date,Orders,Gross Revenue,Est Restock,Est Net Profit\n';
    const rows = data.daily.map(d => `${d.date},${d.total_orders},${d.gross_revenue},${d.est_restock_cost},${d.est_net_profit}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dharan-stays-revenue.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="py-12 text-center text-gray-400">Failed to load revenue data.</div>;

  const today = data.today || {};
  const weekly = data.daily?.slice(0, 7) || [];
  const monthly = data.daily || [];
  const weekGross = weekly.reduce((s, d) => s + (d.gross_revenue || 0), 0);
  const monthGross = monthly.reduce((s, d) => s + (d.gross_revenue || 0), 0);

  const chartData = [...(data.daily || [])].reverse().map(d => ({
    date: d.date?.slice(5) || '',
    revenue: d.gross_revenue || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Today summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Orders today', value: today.orders_today || 0 },
          { label: 'Pending', value: today.pending || 0 },
          { label: 'Delivered', value: today.delivered_today || 0 },
          { label: 'Revenue today', value: `NPR ${formatNPR(today.revenue_today)}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Week / Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">This Week</h3>
          <p className="font-display text-xl font-bold text-gray-900">NPR {formatNPR(weekGross)}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-gray-500">Restock: NPR {formatNPR(Math.round(weekGross * 0.5))}</span>
            <span className="text-emerald-600 font-medium">Net: NPR {formatNPR(Math.round(weekGross * 0.5))}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">This Month</h3>
          <p className="font-display text-xl font-bold text-gray-900">NPR {formatNPR(monthGross)}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-gray-500">Restock: NPR {formatNPR(Math.round(monthGross * 0.5))}</span>
            <span className="text-emerald-600 font-medium">Net: NPR {formatNPR(Math.round(monthGross * 0.5))}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                formatter={(v) => [`NPR ${formatNPR(v)}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="revenue" fill="#111827" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top products */}
      {data.topProducts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 5 Items by Revenue</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Product</th>
                <th className="py-2 text-xs text-gray-500 font-medium text-right uppercase tracking-wide">Qty Sold</th>
                <th className="py-2 text-xs text-gray-500 font-medium text-right uppercase tracking-wide">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 text-right text-gray-500">{p.total_qty}</td>
                  <td className="py-3 text-right font-semibold text-gray-900">NPR {formatNPR(p.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={exportCSV} className="btn-outline">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </span>
      </button>
    </div>
  );
}

// ─── Bookings Tab ────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await adminGetBookings();
      setBookings(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminUpdateBooking(id, status);
      fetchBookings();
    } catch {}
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <LoadingSpinner />;

  if (bookings.length === 0) return <p className="text-center text-gray-400 py-12">No booking requests yet.</p>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Guest</th>
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Phone</th>
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Dates</th>
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Purpose</th>
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Requests</th>
            <th className="py-3 px-4 text-xs text-gray-500 font-medium text-left uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">{b.guest_name}</td>
              <td className="py-3 px-4">
                <a href={`https://wa.me/${b.guest_phone}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {b.guest_phone}
                </a>
              </td>
              <td className="py-3 px-4 text-xs text-gray-600">
                {b.checkin_date} → {b.checkout_date}
              </td>
              <td className="py-3 px-4 text-gray-500">{b.purpose || '-'}</td>
              <td className="py-3 px-4 text-gray-500 text-xs max-w-[150px] truncate">{b.requests || '-'}</td>
              <td className="py-3 px-4">
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer outline-none ${statusColors[b.status]}`}
                >
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('dharan_admin_token'));
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = () => {
    localStorage.removeItem('dharan_admin_token');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginForm onLogin={() => setLoggedIn(true)} />;
  }

  const tabs = [
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin nav */}
      <nav className="bg-white border-b border-gray-200 shadow-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'bookings' && <BookingsTab />}
      </div>
    </div>
  );
}
