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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 w-full max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-bold text-forest text-center mb-2">Admin Login</h1>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-mid text-white py-2.5 rounded-lg font-medium transition-colors disabled:bg-gray-400">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
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
    preparing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-forest/10 text-forest',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="py-8 text-center text-muted">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total orders', value: summary.orders_today, color: 'text-forest' },
            { label: 'Pending', value: summary.pending, color: 'text-gold' },
            { label: 'Delivered today', value: summary.delivered_today, color: 'text-forest' },
            { label: 'Revenue today', value: `NPR ${formatNPR(summary.revenue_today)}`, color: 'text-terra' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted">{s.label}</p>
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-forest text-white' : 'bg-card border border-border text-muted hover:bg-border'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-border rounded-lg px-2 py-1.5 text-xs bg-cream ml-auto"
        />
      </div>

      {/* Order cards */}
      {orders.length === 0 && <p className="text-center text-muted py-8">No orders found.</p>}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} statusColors={statusColors} />
      ))}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, statusColors }) {
  const [showWA, setShowWA] = useState(false);

  const waMessage = `🛍 NEW ORDER — ${order.id}\n\nGuest : ${order.guest_name}\nPhone : ${order.guest_phone}\nRoom  : ${order.room_number || 'N/A'}\nPay   : ${order.payment_method}\n\nItems:\n${order.items.map(i => `  • ${i.name} ×${i.quantity} = NPR ${i.subtotal}`).join('\n')}\n\n💰 TOTAL : NPR ${order.total_amount}`;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-display font-bold text-forest">{order.id}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
          <span className="ml-2 text-xs text-muted">
            {new Date(order.created_at).toLocaleString()}
          </span>
        </div>
        <span className="font-display font-bold text-terra">NPR {formatNPR(order.total_amount)}</span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span><strong>{order.guest_name}</strong></span>
        <a href={`https://wa.me/${order.guest_phone}`} className="text-forest hover:underline" target="_blank" rel="noopener noreferrer">
          {order.guest_phone}
        </a>
        {order.room_number && <span>Room: {order.room_number}</span>}
        <span className="text-xs bg-border px-2 py-0.5 rounded">{order.payment_method}</span>
      </div>

      <div className="text-xs text-muted">
        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
      </div>

      {/* Status buttons */}
      <div className="flex gap-2 flex-wrap">
        {['placed', 'preparing', 'ready', 'delivered'].map((s) => (
          <button
            key={s}
            onClick={() => onUpdateStatus(order.id, s)}
            disabled={order.status === s}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              order.status === s
                ? 'bg-forest text-white'
                : 'bg-border text-muted hover:bg-muted/30'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button onClick={() => setShowWA(!showWA)} className="text-xs text-muted hover:text-ink underline">
        {showWA ? 'Hide' : 'Show'} WhatsApp message
      </button>
      {showWA && (
        <div className="relative">
          <pre className="bg-cream border border-border rounded-lg p-3 text-xs whitespace-pre-wrap">{waMessage}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(waMessage)}
            className="absolute top-2 right-2 text-xs bg-forest text-white px-2 py-1 rounded hover:bg-forest-mid"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inventory Tab ───────────────────────────────────
function InventoryTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState('');

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

  if (loading) return <div className="py-8 text-center text-muted">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 px-3 text-xs text-muted font-medium">Product</th>
            <th className="py-2 px-3 text-xs text-muted font-medium">Category</th>
            <th className="py-2 px-3 text-xs text-muted font-medium">Price (NPR)</th>
            <th className="py-2 px-3 text-xs text-muted font-medium">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border/50 hover:bg-cream/50">
              <td className="py-2 px-3">
                <span className="mr-2">{p.icon}</span>{p.name}
              </td>
              <td className="py-2 px-3 text-muted">{p.category}</td>
              <td className="py-2 px-3">
                {editingPrice === p.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && savePrice(p.id)}
                      className="w-20 border border-border rounded px-2 py-1 text-xs bg-cream"
                      autoFocus
                    />
                    <button onClick={() => savePrice(p.id)} className="text-xs text-forest hover:underline">Save</button>
                    <button onClick={() => setEditingPrice(null)} className="text-xs text-muted hover:underline">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingPrice(p.id); setPriceValue(String(p.price)); }}
                    className="hover:text-terra cursor-pointer"
                  >
                    {formatNPR(p.price)}
                  </button>
                )}
              </td>
              <td className="py-2 px-3">
                <button
                  onClick={() => toggleStock(p.id, p.in_stock)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    p.in_stock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {p.in_stock ? 'In stock' : 'Out of stock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

  if (loading) return <div className="py-8 text-center text-muted">Loading...</div>;
  if (!data) return <div className="py-8 text-center text-muted">Failed to load revenue data.</div>;

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
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="font-display text-xl font-bold text-forest">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Week / Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2">This Week</h3>
          <p className="font-display text-lg font-bold text-forest">Gross: NPR {formatNPR(weekGross)}</p>
          <p className="text-sm text-muted">Est. restock: NPR {formatNPR(Math.round(weekGross * 0.5))}</p>
          <p className="text-sm text-terra font-medium">Est. net: NPR {formatNPR(Math.round(weekGross * 0.5))}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2">This Month</h3>
          <p className="font-display text-lg font-bold text-forest">Gross: NPR {formatNPR(monthGross)}</p>
          <p className="text-sm text-muted">Est. restock: NPR {formatNPR(Math.round(monthGross * 0.5))}</p>
          <p className="text-sm text-terra font-medium">Est. net: NPR {formatNPR(Math.round(monthGross * 0.5))}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-4">Daily Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dcc8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`NPR ${formatNPR(v)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1c3a28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top products */}
      {data.topProducts?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Top 5 Items by Revenue</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 text-xs text-muted font-medium">Product</th>
                <th className="py-2 text-xs text-muted font-medium text-right">Qty Sold</th>
                <th className="py-2 text-xs text-muted font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right text-muted">{p.total_qty}</td>
                  <td className="py-2 text-right font-medium text-terra">NPR {formatNPR(p.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={exportCSV} className="bg-forest hover:bg-forest-mid text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        Export CSV
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
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="py-8 text-center text-muted">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      {bookings.length === 0 && <p className="text-center text-muted py-8">No booking requests yet.</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 px-2 text-xs text-muted font-medium">Guest</th>
            <th className="py-2 px-2 text-xs text-muted font-medium">Phone</th>
            <th className="py-2 px-2 text-xs text-muted font-medium">Dates</th>
            <th className="py-2 px-2 text-xs text-muted font-medium">Purpose</th>
            <th className="py-2 px-2 text-xs text-muted font-medium">Requests</th>
            <th className="py-2 px-2 text-xs text-muted font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-border/50 hover:bg-cream/50">
              <td className="py-2 px-2 font-medium">{b.guest_name}</td>
              <td className="py-2 px-2">
                <a href={`https://wa.me/${b.guest_phone}`} className="text-forest hover:underline" target="_blank" rel="noopener noreferrer">
                  {b.guest_phone}
                </a>
              </td>
              <td className="py-2 px-2 text-xs">
                {b.checkin_date} → {b.checkout_date}
              </td>
              <td className="py-2 px-2 text-muted">{b.purpose || '-'}</td>
              <td className="py-2 px-2 text-muted text-xs max-w-[150px] truncate">{b.requests || '-'}</td>
              <td className="py-2 px-2">
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[b.status]}`}
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
    { id: 'orders', label: 'Orders' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin nav */}
      <nav className="bg-forest text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏔</span>
            <span className="font-display font-bold">Dharan Stays Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-forest text-white'
                  : 'bg-card border border-border text-muted hover:bg-border'
              }`}
            >
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
