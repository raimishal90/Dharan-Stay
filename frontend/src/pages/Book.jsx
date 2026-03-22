import { useState } from 'react';
import { submitBooking } from '../api';
import Toast from '../components/Toast';

export default function Book() {
  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    checkin_date: '',
    checkout_date: '',
    guest_count: 2,
    purpose: '',
    requests: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.guest_name.trim()) errs.guest_name = 'Full name is required';
    if (!form.guest_phone.trim()) errs.guest_phone = 'Phone number is required';
    if (!form.checkin_date) errs.checkin_date = 'Check-in date is required';
    if (!form.checkout_date) errs.checkout_date = 'Check-out date is required';
    if (form.checkin_date && form.checkout_date && new Date(form.checkout_date) <= new Date(form.checkin_date)) {
      errs.checkout_date = 'Check-out must be after check-in';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await submitBooking({
        ...form,
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        guest_count: parseInt(form.guest_count) || 2,
      });
      setToast({ message: 'Booking request submitted! We\'ll contact you shortly via WhatsApp.', type: 'success' });
      setForm({ guest_name: '', guest_phone: '', guest_email: '', checkin_date: '', checkout_date: '', guest_count: 2, purpose: '', requests: '' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to submit booking.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: '📶', label: 'Free WiFi' },
    { icon: '🔌', label: 'Power backup' },
    { icon: '🍳', label: 'Full kitchen' },
    { icon: '🅿️', label: 'Free parking' },
    { icon: '🌀', label: 'Fan / AC' },
    { icon: '🔑', label: 'Self check-in' },
    { icon: '🛒', label: 'Grocery delivery' },
    { icon: '🏥', label: 'Near BPKIHS' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="font-display text-3xl font-bold text-forest mb-8 text-center">Book Apartment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Apartment card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-forest/10 h-48 flex items-center justify-center">
            <span className="text-6xl">🏠</span>
          </div>
          <div className="p-6">
            <h2 className="font-display text-xl font-bold text-forest mb-2">Dharan Stays Apartment</h2>
            <p className="text-muted text-sm mb-4">
              Comfortable self-catering apartment in Dharan-6, perfect for trekkers, medical visitors, and tourists exploring Eastern Nepal.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <div className="bg-forest/5 rounded-lg p-4 text-center">
              <span className="font-display text-3xl font-bold text-terra">NPR 2,100</span>
              <span className="text-muted text-sm"> / night</span>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div>
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.guest_email}
                onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in *</label>
                <input
                  type="date"
                  value={form.checkin_date}
                  onChange={(e) => setForm({ ...form, checkin_date: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest ${errors.checkin_date ? 'border-red-400' : 'border-border'}`}
                />
                {errors.checkin_date && <p className="text-red-500 text-xs mt-1">{errors.checkin_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out *</label>
                <input
                  type="date"
                  value={form.checkout_date}
                  onChange={(e) => setForm({ ...form, checkout_date: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest ${errors.checkout_date ? 'border-red-400' : 'border-border'}`}
                />
                {errors.checkout_date && <p className="text-red-500 text-xs mt-1">{errors.checkout_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of guests</label>
              <select
                value={form.guest_count}
                onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Purpose of visit</label>
              <select
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="">Select...</option>
                <option value="Trekking">Trekking</option>
                <option value="Medical">Medical</option>
                <option value="Tourism">Tourism</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Special requests</label>
              <textarea
                value={form.requests}
                onChange={(e) => setForm({ ...form, requests: e.target.value })}
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Any special requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-terra hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium text-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Request booking'}
            </button>

            <p className="text-xs text-muted text-center">
              Free cancellation up to 48 hours before check-in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
