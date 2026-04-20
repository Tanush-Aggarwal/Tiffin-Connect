// src/components/common/Modal.jsx

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className={`modal-box w-full ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom: '1px solid #F4EDE4' }}>
          <h2 className="font-display text-lg font-bold" style={{ color: '#2C1810' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2" aria-label="Close modal">
            <X size={18} style={{ color: '#9B7B6B' }} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
