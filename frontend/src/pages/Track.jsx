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

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderId(id);
      fetchOrder(id);
    }
  }, [searchParams, fetchOrder]);

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Track Order</h1>
        <p className="text-gray-500">Enter your order ID to see real-time updates</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-10 max-w-md mx-auto">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. DHR-001"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-secondary whitespace-nowrap">
          Track
        </button>
      </form>

      {loading && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading order...</p>
        </div>
      )}

      {notFound && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Order not found</p>
          <p className="text-gray-400 text-sm mt-1">Please check the ID and try again</p>
        </div>
      )}

      {order && !loading && (
        <div className="card p-6 md:p-8 animate-fade-in">
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          completed
                            ? current
                              ? 'bg-primary text-white shadow-md shadow-primary/30'
                              : 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {completed && !current ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          current ? 'text-primary' : completed ? 'text-green-600' : 'text-gray-400'
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
                      className={`flex-1 h-0.5 transition-colors ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 text-center font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              This order has been cancelled
            </div>
          )}

          {/* Order details */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-gray-900 text-lg">{order.id}</span>
                <span className={`badge ${
                  isCancelled
                    ? 'bg-red-100 text-red-600'
                    : order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Ordered by <span className="font-semibold text-gray-900">{order.guest_name}</span>
            </p>

            {/* Items */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900">NPR {formatNPR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-gray-100 mt-4 pt-4">
                <span className="font-display font-bold text-gray-900">Total</span>
                <span className="font-display font-bold text-gray-900 text-lg">NPR {formatNPR(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
