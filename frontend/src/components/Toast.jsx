import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const bg = type === 'success' ? 'bg-forest' : type === 'error' ? 'bg-red-600' : 'bg-gold';

  return (
    <div className={`fixed top-20 right-4 z-50 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); onClose?.(); }} className="ml-2 hover:opacity-70">&times;</button>
    </div>
  );
}
