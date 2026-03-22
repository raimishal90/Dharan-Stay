import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import useCartStore from '../store/cartStore';

const CATEGORIES = ['Staples', 'Fresh', 'Spices', 'Drinks', 'Snacks', 'Meal Kit'];

const CATEGORY_META = {
  Staples: { emoji: '🍚', bg: 'bg-amber-50', label: 'Staples' },
  Fresh: { emoji: '🥬', bg: 'bg-green-50', label: 'Fresh Produce' },
  Spices: { emoji: '🌶️', bg: 'bg-red-50', label: 'Spices & Herbs' },
  Drinks: { emoji: '🥤', bg: 'bg-blue-50', label: 'Drinks' },
  Snacks: { emoji: '🍿', bg: 'bg-orange-50', label: 'Snacks' },
  'Meal Kit': { emoji: '🍛', bg: 'bg-purple-50', label: 'Meal Kits' },
};

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Staples';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);

  useEffect(() => {
    setLoading(true);
    getProducts(activeCategory)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const getCartItem = (id) => items.find((i) => i.id === id);
  const isMealKit = activeCategory === 'Meal Kit';

  return (
    <div className="pb-24 md:pb-8">
      {/* Promo banner */}
      <div className="bg-primary text-white text-center py-2 text-sm font-medium">
        Free delivery on orders above NPR 500 — Shop fresh today!
      </div>

      {/* Shop by Category - circular icons like Ecolive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          Shop by category
        </h2>
        <div className="flex justify-center gap-6 md:gap-10 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex flex-col items-center gap-2 group flex-shrink-0"
              >
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 ring-2 ring-primary shadow-md scale-105'
                      : `${meta.bg} group-hover:shadow-md group-hover:scale-105`
                  }`}
                >
                  {meta.emoji}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-primary font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section header with filter tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">
            {CATEGORY_META[activeCategory].label}
          </h2>
          <div className="hidden md:flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                  activeCategory === cat
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`grid gap-5 ${isMealKit ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}

      {/* Product grid — Ecolive style cards */}
      {!loading && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div
            className={`grid gap-5 ${
              isMealKit
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            }`}
          >
            {products.map((product) => {
              const cartItem = getCartItem(product.id);
              const outOfStock = !product.in_stock;
              const catMeta = CATEGORY_META[product.category] || CATEGORY_META[activeCategory];

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-card-hover transition-all duration-200 animate-fade-in ${
                    outOfStock ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  {/* Product image area */}
                  <div className={`relative ${catMeta.bg} ${isMealKit ? 'py-8' : 'py-6'} flex items-center justify-center`}>
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>

                    {/* Badge (e.g., Popular, New) */}
                    {product.badge && (
                      <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}

                    <span className={`${isMealKit ? 'text-6xl' : 'text-5xl'} group-hover:scale-110 transition-transform duration-200`}>
                      {product.icon}
                    </span>
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                      {product.name}
                    </h3>

                    {isMealKit && product.description && (
                      <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                    )}

                    {isMealKit && product.ingredients && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {product.ingredients.slice(0, 4).map((ing, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ing}</span>
                          ))}
                          {product.ingredients.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.ingredients.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {outOfStock && (
                      <span className="text-xs text-red-500 font-medium block mb-2">Out of stock</span>
                    )}

                    {/* Price & Cart */}
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="font-display font-bold text-primary text-base">
                          NPR {formatNPR(product.price)}
                        </span>
                      </div>

                      {outOfStock ? (
                        <span className="text-[10px] text-gray-400">Unavailable</span>
                      ) : cartItem ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQty(product.id, -1)}
                            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-gray-900">{cartItem.qty}</span>
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-600 flex items-center justify-center text-white font-bold text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(product)}
                          className="w-9 h-9 rounded-full bg-primary hover:bg-primary-600 flex items-center justify-center text-white transition-all active:scale-90 shadow-sm hover:shadow-md"
                          title="Add to cart"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Promotional banners — Ecolive style */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Fresh from market</span>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-2 mb-1">
                  Fresh Vegetables &<br />Grocery Basket
                </h3>
                <p className="text-sm text-gray-500 mb-4">From farm to your door</p>
                <button
                  onClick={() => setActiveCategory('Fresh')}
                  className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
                >
                  Shop Now
                </button>
              </div>
              <div className="absolute right-4 bottom-4 text-7xl opacity-20">🥬🥕🍅</div>
            </div>

            <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl p-8 overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-semibold text-accent uppercase tracking-wide">Curated for you</span>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-2 mb-1">
                  Nepali Meal Kits<br />Ready to Cook
                </h3>
                <p className="text-sm text-gray-500 mb-4">Everything you need in one kit</p>
                <button
                  onClick={() => setActiveCategory('Meal Kit')}
                  className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-accent-400 transition-colors"
                >
                  Explore Kits
                </button>
              </div>
              <div className="absolute right-4 bottom-4 text-7xl opacity-20">🍛🍲🥘</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
