// src/components/common/ErrorMessage.jsx

import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
           style={{ background: '#FDECEA' }}>
        <AlertTriangle size={26} style={{ color: '#C0392B' }} />
      </div>
      <p className="font-semibold mb-1" style={{ color: '#2C1810' }}>Oops! Something went wrong</p>
      <p className="text-sm mb-4" style={{ color: '#9B7B6B' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm py-2">Try Again</button>
      )}
    </div>
  );
}
