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
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h2 className="font-display text-2xl font-bold text-forest mb-2">Your cart is empty</h2>
        <p className="text-muted mb-6">Add some groceries or meal kits to get started.</p>
        <Link
          to="/shop"
          className="inline-block bg-terra hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse groceries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold text-forest mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-muted text-xs">NPR {formatNPR(item.price)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded bg-border hover:bg-muted/30 font-bold">-</button>
                <span className="w-8 text-center font-medium">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded bg-border hover:bg-muted/30 font-bold">+</button>
              </div>
              <span className="font-display font-bold text-terra w-24 text-right">
                NPR {formatNPR(item.price * item.qty)}
              </span>
              <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-500 text-xl">&times;</button>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name *</label>
              <input
                type="text"
                value={form.guest_name}
                onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest ${errors.guest_name ? 'border-red-400' : 'border-border'}`}
                placeholder="Your full name"
              />
              {errors.guest_name && <p className="text-red-500 text-xs mt-1">{errors.guest_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp / Phone *</label>
              <input
                type="tel"
                value={form.guest_phone}
                onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest ${errors.guest_phone ? 'border-red-400' : 'border-border'}`}
                placeholder="98XXXXXXXX"
              />
              {errors.guest_phone && <p className="text-red-500 text-xs mt-1">{errors.guest_phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Room number</label>
              <input
                type="text"
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="e.g. Room 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery time</label>
              <div className="flex gap-2">
                {[
                  { value: 'asap', label: 'ASAP' },
                  { value: '1hour', label: 'Within 1 hr' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                      form.delivery_pref === opt.value
                        ? 'bg-forest text-white border-forest'
                        : 'bg-cream border-border text-muted hover:border-forest'
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
              <label className="block text-sm font-medium mb-1">Special instructions</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Any special requests..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment method</label>
              <div className="space-y-2">
                {[
                  { value: 'esewa', label: 'eSewa / Khalti' },
                  { value: 'cash', label: 'Cash on delivery' },
                  { value: 'checkout', label: 'Pay at checkout' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.payment_method === opt.value
                        ? 'bg-forest/5 border-forest'
                        : 'bg-cream border-border hover:border-forest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                      className="accent-forest"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-lg">Total</span>
                <span className="font-display font-bold text-terra text-2xl">NPR {formatNPR(cartTotal)}</span>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-3">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-terra hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium text-lg transition-colors"
              >
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
