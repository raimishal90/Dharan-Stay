import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

function formatNPR(amount) {
  return amount.toLocaleString('en-NP');
}

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-elevated flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-display font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-gray-300 text-sm mt-1">Add items from the shop</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 group">
              <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-primary font-semibold text-sm">NPR {formatNPR(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-400 flex items-center justify-center text-sm font-bold text-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-400 flex items-center justify-center text-sm font-bold text-gray-600 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="font-display font-bold text-xl text-gray-900">NPR {formatNPR(cartTotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="btn-primary block text-center w-full"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
