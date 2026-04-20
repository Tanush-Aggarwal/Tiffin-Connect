// src/components/customer/ReviewForm.jsx

import { useState } from 'react';
import { Send } from 'lucide-react';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '.2rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.75rem', lineHeight: 1, padding: '2px',
            color: star <= (hovered || value) ? '#D4943A' : '#E8D5C0',
            transition: 'color .1s, transform .1s',
            transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
          }}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ onSubmit, initialRating = 0, initialComment = '', submitLabel = 'Submit Review' }) {
  const [rating,  setRating]  = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0)    { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a short review.'); return; }
    try {
      setSaving(true);
      await onSubmit({ rating, comment: comment.trim() });
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="review-form"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <h3 style={{
        fontFamily: 'Nunito, sans-serif', fontWeight: 800,
        fontSize: '1rem', color: 'var(--ink)', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '.4rem',
      }}>
        ✍️ Write a Review
      </h3>

      {error && (
        <p style={{
          fontSize: '.82rem', color: '#C0392B', fontWeight: 600,
          background: '#FEF0F0', padding: '.5rem .75rem', borderRadius: '.5rem',
          marginBottom: '.85rem', border: '1px solid rgba(192,57,43,.2)',
        }}>
          {error}
        </p>
      )}

      {/* Star picker */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)',
          textTransform: 'uppercase', letterSpacing: '.06em',
          fontFamily: 'Nunito', marginBottom: '.4rem',
        }}>
          Your Rating
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block', fontSize: '.72rem', fontWeight: 700,
          color: 'var(--ink-3)', textTransform: 'uppercase',
          letterSpacing: '.06em', fontFamily: 'Nunito', marginBottom: '.4rem',
        }}>
          Your Review
        </label>
        <textarea
          className="input"
          style={{ minHeight: '90px', resize: 'vertical' }}
          placeholder="Share your experience with this tiffin provider…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={saving}
        style={{ fontSize: '.875rem', padding: '.6rem 1.4rem' }}
      >
        <Send size={14} />
        {saving ? 'Submitting…' : submitLabel}
      </button>
    </form>
  );
}
