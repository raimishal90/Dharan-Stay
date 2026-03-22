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
    {
      label: 'Free WiFi',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        </svg>
      ),
    },
    {
      label: 'Power backup',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      label: 'Full kitchen',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
      ),
    },
    {
      label: 'Free parking',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      label: 'Fan / AC',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Self check-in',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
    },
    {
      label: 'Grocery delivery',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      label: 'Near BPKIHS',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Book your stay</h1>
        <p className="text-gray-500">Comfortable apartment in Dharan, Eastern Nepal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Apartment showcase */}
        <div className="space-y-6">
          {/* Image placeholder */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-64 md:h-80 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <p className="text-gray-400 font-medium">Dharan Stays Apartment</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Dharan Stays Apartment</h2>
            <p className="text-gray-500 leading-relaxed">
              Comfortable self-catering apartment in Dharan-6, perfect for trekkers, medical visitors, and tourists exploring Eastern Nepal.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-gray-600">{f.icon}</span>
                <span className="text-sm font-medium text-gray-700">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Price card */}
          <div className="bg-gray-50 rounded-2xl p-6 flex items-baseline gap-1">
            <span className="font-display text-4xl font-extrabold text-gray-900">NPR 2,100</span>
            <span className="text-gray-500 text-lg"> / night</span>
          </div>
        </div>

        {/* Booking form */}
        <div>
          <div className="sticky top-20">
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-gray-900 text-lg">Request a booking</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
                <input
                  type="text"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  className={`input-field ${errors.guest_name ? 'border-red-400' : ''}`}
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
                  className={`input-field ${errors.guest_phone ? 'border-red-400' : ''}`}
                  placeholder="98XXXXXXXX"
                />
                {errors.guest_phone && <p className="text-red-500 text-xs mt-1">{errors.guest_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-in *</label>
                  <input
                    type="date"
                    value={form.checkin_date}
                    onChange={(e) => setForm({ ...form, checkin_date: e.target.value })}
                    className={`input-field ${errors.checkin_date ? 'border-red-400' : ''}`}
                  />
                  {errors.checkin_date && <p className="text-red-500 text-xs mt-1">{errors.checkin_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-out *</label>
                  <input
                    type="date"
                    value={form.checkout_date}
                    onChange={(e) => setForm({ ...form, checkout_date: e.target.value })}
                    className={`input-field ${errors.checkout_date ? 'border-red-400' : ''}`}
                  />
                  {errors.checkout_date && <p className="text-red-500 text-xs mt-1">{errors.checkout_date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Guests</label>
                  <select
                    value={form.guest_count}
                    onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
                  <select
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="Trekking">Trekking</option>
                    <option value="Medical">Medical</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Special requests</label>
                <textarea
                  value={form.requests}
                  onChange={(e) => setForm({ ...form, requests: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any special requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Request booking'}
              </button>

              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Free cancellation up to 48 hours before check-in
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
