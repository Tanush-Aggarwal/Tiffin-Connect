// src/components/common/Spinner.jsx

export default function Spinner({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'h-6', md: 'h-14', lg: 'h-24' };
  return (
    <div className={`flex items-center justify-center ${sizeMap[size] ?? sizeMap.md} ${className}`}>
      <div className="spinner" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }} />
    </div>
  );
}

// Full-page spinner used by App.jsx lazy loading and ProtectedRoute
export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF8F0' }}>
      <div className="text-center">
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
        <p className="text-sm mt-4" style={{ color: '#9B7B6B' }}>Loading…</p>
      </div>
    </div>
  );
}
