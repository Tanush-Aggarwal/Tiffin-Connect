// src/components/common/Badge.jsx

const VARIANTS = {
  veg:       'badge-veg',
  nonveg:    'badge-nonveg',
  active:    'badge-active',
  paused:    'badge-paused',
  pending:   'badge-pending',
  rejected:  'badge-rejected',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
  orange:    'badge-orange',
  blue:      'badge-blue',
  purple:    'badge-purple',
  default:   'badge-default',
};

export default function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span className={`badge ${VARIANTS[variant] ?? VARIANTS.default} ${className}`}>
      {children}
    </span>
  );
}
