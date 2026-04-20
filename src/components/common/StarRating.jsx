// src/components/common/StarRating.jsx

export default function StarRating({ value = 0, onChange, size = 18, max = 5 }) {
  const interactive = !!onChange;
  return (
    <div className="flex gap-0.5" role={interactive ? 'group' : undefined}
         aria-label={interactive ? 'Star rating' : `Rating: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            style={{
              cursor:     interactive ? 'pointer' : 'default',
              background: 'none',
              border:     'none',
              padding:    '1px',
              lineHeight: 1,
              fontSize:   size,
              color:      filled ? '#D4943A' : '#E8D5C0',
              transition: 'color 100ms ease, transform 100ms ease',
            }}
            className={interactive ? 'hover:scale-125' : ''}
            aria-label={`${i + 1} star${i + 1 !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
