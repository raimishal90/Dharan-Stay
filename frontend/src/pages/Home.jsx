import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api';
import useCartStore from '../store/cartStore';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function Home() {
  const [mealKits, setMealKits] = useState([]);
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getProducts('Meal Kit')
      .then((data) => setMealKits(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/track?id=${trackId.trim()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-forest text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Welcome to Dharan Stays
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 font-light">
            Your home away from home in Dharan, Eastern Nepal. Fresh groceries, meal kits &amp; apartment booking — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-terra hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Order groceries
            </Link>
            <Link
              to="/book"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Book apartment
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '⚡', title: '45-min delivery', desc: 'From order to your door' },
            { icon: '🥗', title: 'Fresh daily', desc: 'Local market sourced' },
            { icon: '🍛', title: 'Meal kits', desc: 'Cook like a local' },
            { icon: '📱', title: 'Easy payment', desc: 'eSewa, Khalti or cash' },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
              <span className="text-3xl mb-2 block">{f.icon}</span>
              <h3 className="font-display font-semibold text-forest text-sm">{f.title}</h3>
              <p className="text-muted text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Meal Kits */}
      {mealKits.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="font-display text-2xl font-bold text-forest mb-6 text-center">
            Featured Meal Kits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealKits.map((kit) => (
              <div key={kit.id} className="bg-card border border-border rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{kit.icon}</span>
                  {kit.badge && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">
                      {kit.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-forest text-sm mb-1">{kit.name}</h3>
                {kit.description && (
                  <p className="text-muted text-xs mb-2 flex-1">{kit.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-display font-bold text-terra">NPR {formatNPR(kit.price)}</span>
                  <button
                    onClick={() => addItem(kit)}
                    className="bg-terra hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Add +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Order tracking widget */}
      <section className="max-w-md mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="font-display text-lg font-semibold text-forest mb-3">Track your order</h3>
          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter order ID (e.g. DHR-001)"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <button
              type="submit"
              className="bg-forest hover:bg-forest-mid text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Track
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest text-white py-10 mt-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-display text-lg font-bold mb-2">🏔 Dharan Stays</h4>
            <p className="text-sm opacity-80">
              Dharan-6, Sunsari<br />
              Eastern Nepal
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold mb-2">Payment</h4>
            <p className="text-sm opacity-80">
              eSewa · Khalti · Cash
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold mb-2">Contact</h4>
            <p className="text-sm opacity-80">
              WhatsApp: +977-XXXXXXXXXX<br />
              Available 7 AM — 10 PM
            </p>
          </div>
        </div>
        <div className="text-center text-xs opacity-60 mt-8">
          &copy; {new Date().getFullYear()} Dharan Stays. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
