import { useState, useEffect } from 'react';
import { getProducts } from '../api';
import useCartStore from '../store/cartStore';

const CATEGORIES = ['Staples', 'Fresh', 'Spices', 'Drinks', 'Snacks', 'Meal Kit'];

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('Staples');
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold text-forest mb-6">Shop Groceries</h1>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-forest text-white'
                : 'bg-card border border-border text-muted hover:bg-border'
            }`}
          >
            {cat === 'Meal Kit' ? 'Meal Kits' : cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-muted">Loading products...</div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-muted">No products found in this category.</div>
      )}

      {/* Product grid */}
      {!loading && products.length > 0 && (
        <div
          className={`grid gap-4 ${
            isMealKit
              ? 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'
              : 'grid-cols-[repeat(auto-fill,minmax(155px,1fr))]'
          }`}
        >
          {products.map((product) => {
            const cartItem = getCartItem(product.id);
            const outOfStock = !product.in_stock;

            return (
              <div
                key={product.id}
                className={`bg-card border border-border rounded-xl p-4 flex flex-col ${
                  outOfStock ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`${isMealKit ? 'text-4xl' : 'text-3xl'}`}>{product.icon}</span>
                  {product.badge && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">
                      {product.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-semibold text-forest text-sm mb-1">{product.name}</h3>

                {isMealKit && product.description && (
                  <p className="text-muted text-xs mb-2">{product.description}</p>
                )}

                {isMealKit && product.ingredients && (
                  <div className="mb-3 flex-1">
                    <p className="text-xs font-medium text-ink mb-1">Includes:</p>
                    <ul className="text-xs text-muted space-y-0.5">
                      {product.ingredients.map((ing, i) => (
                        <li key={i}>• {ing}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {outOfStock && (
                  <span className="text-xs text-red-500 font-medium mb-2">Unavailable</span>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-display font-bold text-terra">
                    NPR {formatNPR(product.price)}
                  </span>

                  {outOfStock ? (
                    <button disabled className="bg-gray-300 text-gray-500 px-3 py-1.5 rounded-lg text-xs cursor-not-allowed">
                      Out of stock
                    </button>
                  ) : cartItem ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(product.id, -1)}
                        className="w-7 h-7 rounded bg-border hover:bg-muted/30 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-sm font-medium">{cartItem.qty}</span>
                      <button
                        onClick={() => updateQty(product.id, 1)}
                        className="w-7 h-7 rounded bg-border hover:bg-muted/30 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(product)}
                      className="bg-terra hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
