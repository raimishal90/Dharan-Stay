import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { placeOrder } from '../api';
import useCartStore from '../store/cartStore';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    room_number: '',
    delivery_pref: 'asap',
    notes: '',
    payment_method: 'cash',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.guest_name.trim()) errs.guest_name = 'Full name is required';
    if (!form.guest_phone.trim()) errs.guest_phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.guest_phone.trim())) errs.guest_phone = 'Enter a valid 10-digit phone number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError('');
    try {
      const data = {
        ...form,
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        items: items.map((i) => ({
          product_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.qty,
        })),
      };
      const result = await placeOrder(data);
      clearCart();
      navigate(`/confirmation?id=${result.orderId}`);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some groceries or meal kits to get started.</p>
        <Link to="/shop" className="btn-primary">
          Browse groceries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-gray-900">Your items ({items.length})</h2>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 group">
              <span className="text-2xl w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-gray-500 text-xs">NPR {formatNPR(item.price)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-400 font-bold text-gray-600 transition-colors">-</button>
                <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-400 font-bold text-gray-600 transition-colors">+</button>
              </div>
              <span className="font-display font-bold text-gray-900 w-24 text-right text-sm">
                NPR {formatNPR(item.price * item.qty)}
              </span>
              <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-gray-900 text-lg">Order details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
                <input
                  type="text"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  className={`input-field ${errors.guest_name ? 'border-red-400 ring-red-100' : ''}`}
                  placeholder="Your full name"
                />
                {errors.guest_name && <p className="text-red-500 text-xs mt-1">{errors.guest_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                  className={`input-field ${errors.guest_phone ? 'border-red-400 ring-red-100' : ''}`}
                  placeholder="98XXXXXXXX"
                />
                {errors.guest_phone && <p className="text-red-500 text-xs mt-1">{errors.guest_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Room number</label>
                <input
                  type="text"
                  value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Room 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery time</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'asap', label: 'ASAP' },
                    { value: '1hour', label: '1 hour' },
                    { value: 'tomorrow', label: 'Tomorrow' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`text-center py-2.5 rounded-xl text-sm font-medium cursor-pointer border-2 transition-all ${
                        form.delivery_pref === opt.value
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_pref"
                        value={opt.value}
                        checked={form.delivery_pref === opt.value}
                        onChange={(e) => setForm({ ...form, delivery_pref: e.target.value })}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Special instructions</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Any special requests..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment method</label>
                <div className="space-y-2">
                  {[
                    { value: 'esewa', label: 'eSewa / Khalti', icon: '💳' },
                    { value: 'cash', label: 'Cash on delivery', icon: '💵' },
                    { value: 'checkout', label: 'Pay at checkout', icon: '🏪' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        form.payment_method === opt.value
                          ? 'bg-primary-50 border-primary'
                          : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={opt.value}
                        checked={form.payment_method === opt.value}
                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        className="sr-only"
                      />
                      <span>{opt.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                      {form.payment_method === opt.value && (
                        <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex justify-between mb-5">
                  <span className="font-medium text-gray-600">Total</span>
                  <span className="font-display font-bold text-gray-900 text-2xl">NPR {formatNPR(cartTotal)}</span>
                </div>

                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
