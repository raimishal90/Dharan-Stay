import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOrder } from '../api';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

function formatWAMessage(order) {
  if (!order) return '';
  const items = order.items
    .map((i) => `  • ${i.name} ×${i.quantity} = NPR ${i.subtotal}`)
    .join('\n');
  const d = new Date(order.created_at);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const time = `${hh}:${mm} · ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;

  return `🛍 NEW ORDER — ${order.id}

Guest : ${order.guest_name}
Phone : ${order.guest_phone}
Room  : ${order.room_number || 'Not specified'}
Pay   : ${order.payment_method}
Time  : ${order.delivery_pref || 'asap'}

Items:
${items}

💰 TOTAL : NPR ${order.total_amount}
🕐 ${time}`;
}

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWA, setShowWA] = useState(false);

  useEffect(() => {
    if (orderId) {
      getOrder(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-20 text-muted">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-2xl font-bold text-forest mb-2">Order not found</h2>
        <Link to="/shop" className="text-terra hover:underline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="font-display text-3xl font-bold text-forest mb-2">Order placed!</h1>

      <div className="inline-block bg-forest/10 text-forest px-4 py-2 rounded-full font-display font-bold text-lg mb-4">
        {order.id}
      </div>

      <p className="text-ink mb-1">
        Thank you, <strong>{order.guest_name}</strong>!
      </p>
      <p className="text-muted mb-6">
        Estimated delivery: <strong>45 minutes</strong>
      </p>

      <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 mb-6 text-left">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📱</span>
          <span className="font-medium text-forest text-sm">
            {order.wa_sent
              ? 'WhatsApp notification sent to host'
              : 'WhatsApp notification will be sent to host'}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowWA(!showWA)}
        className="text-sm text-muted hover:text-ink underline mb-4 inline-block"
      >
        {showWA ? 'Hide' : 'Show'} WhatsApp message preview
      </button>

      {showWA && (
        <pre className="bg-gray-50 border border-border rounded-xl p-4 text-left text-xs whitespace-pre-wrap mb-6 overflow-x-auto">
          {formatWAMessage(order)}
        </pre>
      )}

      <div className="flex gap-4 justify-center">
        <Link
          to={`/track?id=${order.id}`}
          className="bg-forest hover:bg-forest-mid text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Track order
        </Link>
        <Link
          to="/shop"
          className="bg-card border border-border hover:bg-border text-ink px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Order more
        </Link>
      </div>
    </div>
  );
}
