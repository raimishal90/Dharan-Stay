import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function Navbar() {
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <nav className="sticky top-0 z-50 bg-forest text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold">
          <span className="text-2xl">🏔</span> Dharan Stays
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <Link to="/book" className="hover:text-gold transition-colors">Book</Link>
          <Link to="/track" className="hover:text-gold transition-colors">Track</Link>
        </div>

        <Link
          to="/cart"
          className="flex items-center gap-2 bg-terra hover:bg-orange-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
        >
          <span>🛒</span>
          {cartCount > 0 && (
            <>
              <span className="bg-white text-terra rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
              <span className="hidden sm:inline">NPR {formatNPR(cartTotal)}</span>
            </>
          )}
          {cartCount === 0 && <span>Cart</span>}
        </Link>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex justify-around border-t border-forest-mid py-2 text-xs">
        <Link to="/" className="hover:text-gold">Home</Link>
        <Link to="/shop" className="hover:text-gold">Shop</Link>
        <Link to="/book" className="hover:text-gold">Book</Link>
        <Link to="/track" className="hover:text-gold">Track</Link>
      </div>
    </nav>
  );
}
