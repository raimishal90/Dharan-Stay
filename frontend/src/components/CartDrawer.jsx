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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-forest">Your Cart</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <p className="text-muted text-center py-8">Your cart is empty</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-cream rounded-lg p-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-terra font-semibold text-sm">NPR {formatNPR(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded bg-border hover:bg-muted/30 text-sm font-bold">-</button>
                <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded bg-border hover:bg-muted/30 text-sm font-bold">+</button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-500 text-lg">&times;</button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between mb-3">
              <span className="font-medium">Total</span>
              <span className="font-display font-bold text-terra text-lg">NPR {formatNPR(cartTotal)}</span>
            </div>
            <a
              href="/cart"
              className="block text-center bg-terra hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
