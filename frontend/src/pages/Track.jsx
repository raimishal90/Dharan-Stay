import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrder } from '../api';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

const STEPS = ['placed', 'preparing', 'ready', 'delivered'];
const STEP_LABELS = ['Placed', 'Preparing', 'Ready', 'Delivered'];

function getStepIndex(status) {
  const idx = STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function Track() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderId(id);
      fetchOrder(id);
    }
  }, [searchParams, fetchOrder]);

  // Polling every 30 seconds
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;
    const interval = setInterval(() => {
      fetchOrder(order.id);
    }, 30000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderId.trim()) fetchOrder(orderId.trim().toUpperCase());
  };

  const stepIndex = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-forest mb-6 text-center">Track Order</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md mx-auto">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order ID (e.g. DHR-001)"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
        />
        <button type="submit" className="bg-forest hover:bg-forest-mid text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Track
        </button>
      </form>

      {loading && <div className="text-center py-12 text-muted">Loading...</div>}

      {notFound && !loading && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-muted">Order not found. Please check the ID and try again.</p>
        </div>
      )}

      {order && !loading && (
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Progress bar */}
          {!isCancelled && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {STEP_LABELS.map((label, idx) => {
                  const completed = idx <= stepIndex;
                  const current = idx === stepIndex;
                  return (
                    <div key={label} className="flex flex-col items-center z-10 relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                          completed
                            ? current
                              ? 'bg-terra border-terra text-white'
                              : 'bg-forest border-forest text-white'
                            : 'bg-gray-200 border-gray-300 text-gray-400'
                        }`}
                      >
                        {completed && !current ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          current ? 'text-terra' : completed ? 'text-forest' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}

                {/* Connecting lines */}
                <div className="absolute top-5 left-0 right-0 flex px-5" style={{ zIndex: 0 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-forest' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6 text-center font-medium">
              This order has been cancelled.
            </div>
          )}

          {/* Order details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display font-bold text-forest text-lg">{order.id}</span>
                <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${
                  isCancelled
                    ? 'bg-red-100 text-red-600'
                    : order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gold/20 text-gold'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <span className="text-xs text-muted">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            <div className="text-sm text-muted">
              <span className="font-medium text-ink">{order.guest_name}</span>
            </div>

            {/* Items */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} <span className="text-muted">×{item.quantity}</span>
                    </span>
                    <span className="font-medium">NPR {formatNPR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border mt-3 pt-3 font-display font-bold text-terra">
                <span>Total</span>
                <span>NPR {formatNPR(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
