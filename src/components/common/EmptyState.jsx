// src/components/common/EmptyState.jsx

import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon = PackageOpen, title = 'Nothing here yet', message = '', action }) {
  const IconComponent = icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
           style={{ background: '#FEF4E8' }}>
        <IconComponent size={28} style={{ color: '#C8552A' }} />
      </div>
      <h3 className="font-semibold text-lg mb-1" style={{ color: '#2C1810' }}>{title}</h3>
      {message && <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#9B7B6B' }}>{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
