import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api';
import useCartStore from '../store/cartStore';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

const CATEGORIES = [
  { name: 'Staples', emoji: '🍚', bg: 'bg-amber-50', label: 'Breakfast & Cereal' },
  { name: 'Fresh', emoji: '🥬', bg: 'bg-green-50', label: 'Produce' },
  { name: 'Spices', emoji: '🌶️', bg: 'bg-red-50', label: 'Spices' },
  { name: 'Drinks', emoji: '🥤', bg: 'bg-blue-50', label: 'Drinks' },
  { name: 'Snacks', emoji: '🍿', bg: 'bg-orange-50', label: 'Snacks & Lunch' },
  { name: 'Meal Kit', emoji: '🍛', bg: 'bg-purple-50', label: 'Meal Kits' },
];

export default function Home() {
  const [mealKits, setMealKits] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getProducts('Meal Kit')
      .then((data) => setMealKits(data.slice(0, 4)))
      .catch(() => {});
    getProducts('Fresh')
      .then((data) => setFeaturedProducts(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/track?id=${trackId.trim()}`);
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Promo banner */}
      <div className="bg-accent text-white text-center py-2 text-sm font-medium">
        Special Offer — Get <strong>40% Off</strong> on Fresh Vegetables!
      </div>

      {/* Hero section — Ecolive style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main hero */}
          <div className="md:col-span-2 relative bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 overflow-hidden min-h-[300px] flex items-center">
            <div className="relative z-10 max-w-md">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">100% Pure & Natural</span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">
                Fresh Groceries<br />
                <span className="text-primary">Just for You</span>
              </h1>
              <p className="text-gray-500 mb-6">Delivered fresh to your doorstep in Dharan</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3 rounded-full hover:bg-primary-600 transition-colors shadow-md"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 text-8xl md:text-9xl opacity-20 select-none">
              🥭🥤
            </div>
          </div>

          {/* Side promo cards */}
          <div className="flex flex-col gap-4">
            <div className="relative bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl p-6 flex-1 overflow-hidden">
              <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">40% Off</span>
              <h3 className="font-display text-lg font-bold text-gray-900 mt-3">
                Everyday Fresh
              </h3>
              <p className="text-sm text-gray-500 mt-1">Vegetables & fruits</p>
              <div className="absolute right-2 bottom-2 text-5xl opacity-30">🥗</div>
            </div>
            <div className="relative bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-6 flex-1 overflow-hidden">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">20% Off</span>
              <h3 className="font-display text-lg font-bold text-gray-900 mt-3">
                Healthy Food
              </h3>
              <p className="text-sm text-gray-500 mt-1">Meal kits & staples</p>
              <div className="absolute right-2 bottom-2 text-5xl opacity-30">🍛</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category — circular icons like Ecolive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          Shop by category
        </h2>
        <div className="flex justify-center gap-6 md:gap-10 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className="flex flex-col items-center gap-2.5 group flex-shrink-0"
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 ${cat.bg} rounded-full flex items-center justify-center text-3xl md:text-4xl group-hover:shadow-lg group-hover:scale-110 transition-all duration-200 border-2 border-transparent group-hover:border-primary/20`}>
                {cat.emoji}
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Produce — Ecolive style product cards */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Featured Produce</h2>
            <Link to="/shop?category=Fresh" className="text-primary font-semibold text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-card-hover transition-all animate-fade-in">
                <div className="relative bg-green-50 py-8 flex items-center justify-center">
                  <span className="absolute top-3 left-3 bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{product.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-primary">NPR {formatNPR(product.price)}</span>
                    <button
                      onClick={() => addItem(product)}
                      className="w-8 h-8 rounded-full bg-primary hover:bg-primary-600 flex items-center justify-center text-white transition-all active:scale-90 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Promo banners — Ecolive style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Fresh from market</span>
              <h3 className="font-display text-2xl font-bold text-gray-900 mt-2 mb-1">
                Fresh Vegetables &<br />Grocery Basket
              </h3>
              <p className="text-sm text-gray-500 mb-4">From farm to your door</p>
              <Link
                to="/shop?category=Fresh"
                className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
              >
                Shop Now
              </Link>
            </div>
            <div className="absolute right-4 bottom-4 text-7xl opacity-20">🥬🥕</div>
          </div>

          <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl p-8 overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">Curated for you</span>
              <h3 className="font-display text-2xl font-bold text-gray-900 mt-2 mb-1">
                Nepali Meal Kits<br />Ready to Cook
              </h3>
              <p className="text-sm text-gray-500 mb-4">Everything you need in one kit</p>
              <Link
                to="/shop?category=Meal Kit"
                className="inline-block bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-accent-400 transition-colors"
              >
                Explore Kits
              </Link>
            </div>
            <div className="absolute right-4 bottom-4 text-7xl opacity-20">🍛🍲</div>
          </div>
        </div>
      </section>

      {/* Featured Meal Kits */}
      {mealKits.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Best Sellers</h2>
            <Link to="/shop?category=Meal Kit" className="text-primary font-semibold text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mealKits.map((kit) => (
              <div key={kit.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-card-hover transition-all animate-fade-in">
                <div className="relative bg-purple-50 py-8 flex items-center justify-center">
                  <span className="absolute top-3 left-3 bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    Meal Kit
                  </span>
                  {kit.badge && (
                    <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {kit.badge}
                    </span>
                  )}
                  <span className="text-5xl group-hover:scale-110 transition-transform">{kit.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-gray-900 text-sm mb-1 line-clamp-2">{kit.name}</h3>
                  {kit.description && (
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{kit.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-primary">NPR {formatNPR(kit.price)}</span>
                    <button
                      onClick={() => addItem(kit)}
                      className="w-8 h-8 rounded-full bg-primary hover:bg-primary-600 flex items-center justify-center text-white transition-all active:scale-90 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track order */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-primary-50 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-2">Track your order</h3>
          <p className="text-gray-500 mb-6">Enter your order ID to see real-time status</p>
          <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              placeholder="e.g. DHR-001"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="input-field flex-1"
            />
            <button type="submit" className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap">
              Track
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg">Dharan Stays</span>
              </div>
              <p className="text-sm text-gray-400">
                Dharan-6, Sunsari<br />
                Eastern Nepal
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-3">Payment</h4>
              <p className="text-sm text-gray-400">eSewa · Khalti · Cash</p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-3">Contact</h4>
              <p className="text-sm text-gray-400">
                WhatsApp: +977-XXXXXXXXXX<br />
                Available 7 AM — 10 PM
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 mt-10 pt-6 border-t border-gray-800">
            &copy; {new Date().getFullYear()} Dharan Stays. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
