import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOrder } from '../api';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

function formatWAMessage(order) {
  if (!order) return '';
  const items = order.items
    .map((i) => `  ${i.name} x${i.quantity} = NPR ${i.subtotal}`)
    .join('\n');
  const d = new Date(order.created_at);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const time = `${hh}:${mm} · ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;

  return `NEW ORDER — ${order.id}

Guest : ${order.guest_name}
Phone : ${order.guest_phone}
Room  : ${order.room_number || 'Not specified'}
Pay   : ${order.payment_method}
Time  : ${order.delivery_pref || 'asap'}

Items:
${items}

TOTAL : NPR ${order.total_amount}
${time}`;
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
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Order not found</h2>
        <Link to="/shop" className="text-primary hover:underline font-medium">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-3">Order placed!</h1>

      <div className="inline-flex items-center gap-2 bg-gray-100 px-5 py-2.5 rounded-full font-display font-bold text-gray-900 text-lg mb-5">
        {order.id}
      </div>

      <p className="text-gray-700 mb-1">
        Thank you, <strong>{order.guest_name}</strong>!
      </p>
      <p className="text-gray-500 mb-8">
        Estimated delivery: <strong>45 minutes</strong>
      </p>

      {/* WhatsApp status */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.wa_sent ? 'bg-green-100' : 'bg-amber-100'}`}>
            <svg className={`w-4 h-4 ${order.wa_sent ? 'text-green-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <span className="font-medium text-gray-700 text-sm">
            {order.wa_sent
              ? 'WhatsApp notification sent to host'
              : 'WhatsApp notification will be sent to host'}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowWA(!showWA)}
        className="text-sm text-gray-400 hover:text-gray-600 underline mb-6 inline-block transition-colors"
      >
        {showWA ? 'Hide' : 'Show'} message preview
      </button>

      {showWA && (
        <pre className="bg-gray-50 rounded-2xl p-5 text-left text-xs text-gray-600 whitespace-pre-wrap mb-8 overflow-x-auto border border-gray-100">
          {formatWAMessage(order)}
        </pre>
      )}

      <div className="flex gap-3 justify-center">
        <Link to={`/track?id=${order.id}`} className="btn-primary">
          Track order
        </Link>
        <Link to="/shop" className="btn-outline">
          Order more
        </Link>
      </div>
    </div>
  );
}
