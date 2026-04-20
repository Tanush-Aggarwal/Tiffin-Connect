// src/components/customer/ReviewCard.jsx — Warm redesign

import { useState, useCallback } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import StarRating from '../common/StarRating';
import UserAvatar from '../common/UserAvatar';
import { formatDate } from '../../utils/helpers';

export default function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const { id, customerName, rating, comment, createdAt, customerId } = review;
  const isOwn = customerId === currentUserId;

  const [editing,     setEditing]     = useState(false);
  const [editRating,  setEditRating]  = useState(rating);
  const [editComment, setEditComment] = useState(comment);
  const [saving,      setSaving]      = useState(false);

  const handleSave = useCallback(async () => {
    if (!editComment.trim()) return;
    setSaving(true);
    await onEdit(id, { rating: editRating, comment: editComment });
    setEditing(false);
    setSaving(false);
  }, [id, editRating, editComment, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this review?')) onDelete(id);
  }, [id, onDelete]);

  const RATING_WORDS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };
  const ratingLabel = RATING_WORDS[Math.round(rating)] || 'Rated';

  return (
    <div
      className="animate-fade-in"
      id={`review-${id}`}
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #FFFDF9 100%)',
        border: '1px solid rgba(204, 182, 166, .45)',
        borderRadius: '1rem',
        boxShadow: '0 6px 18px rgba(42,26,14,.08)',
        padding: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', minWidth: 0 }}>
          <div style={{
            borderRadius: '999px',
            padding: '2px',
            background: 'linear-gradient(135deg, rgba(194,83,42,.5), rgba(58,114,80,.35))',
            flexShrink: 0,
          }}>
            <UserAvatar name={customerName} size={38} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '.9rem',
              color: '#2C1810',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {customerName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginTop: '.12rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.72rem', color: '#9B7B6B', fontWeight: 600 }}>{formatDate(createdAt)}</span>
              <span style={{
                width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(155,123,107,.55)',
              }} />
              <span style={{
                fontSize: '.69rem', fontWeight: 700, color: '#8E5A3B',
                background: '#FDEEDC', border: '1px solid rgba(194,83,42,.22)',
                borderRadius: '999px', padding: '.05rem .45rem',
              }}>
                {ratingLabel}
              </span>
            </div>
          </div>
        </div>

        {!editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexShrink: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.35rem',
              background: '#FFF6E9', border: '1px solid rgba(212,148,58,.25)',
              borderRadius: '999px', padding: '.22rem .55rem',
            }}>
              <StarRating value={rating} size={13} />
              <span style={{ fontSize: '.74rem', fontWeight: 800, color: '#A66D16', fontFamily: 'Nunito' }}>
                {rating.toFixed(1)}
              </span>
            </div>
            {isOwn && (
              <div style={{ display: 'flex', gap: '.28rem' }}>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-ghost p-1.5"
                  aria-label="Edit review"
                  title="Edit review"
                  style={{ borderRadius: '.55rem' }}
                >
                  <Edit size={13} style={{ color: '#8B6A58' }} />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-ghost p-1.5"
                  aria-label="Delete review"
                  title="Delete review"
                  style={{ borderRadius: '.55rem' }}
                >
                  <Trash2 size={13} style={{ color: '#C0392B' }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div style={{
          marginTop: '.85rem',
          paddingTop: '.85rem',
          borderTop: '1px dashed rgba(204,182,166,.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: '.6rem',
        }}>
          <div style={{
            background: '#FFF8EE',
            border: '1px solid rgba(212,148,58,.2)',
            borderRadius: '.75rem',
            padding: '.55rem .7rem',
            display: 'inline-flex',
            alignItems: 'center',
            width: 'fit-content',
          }}>
            <StarRating value={editRating} onChange={setEditRating} size={20} />
          </div>
          <textarea
            className="input min-h-[60px] resize-none text-sm"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            placeholder="Share your updated experience..."
            style={{ lineHeight: 1.55 }}
          />
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-1.5 px-3 text-sm">
              <Check size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-sm">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: '.75rem',
          padding: '.7rem .85rem',
          background: comment ? '#FFF7F0' : '#FAF7F3',
          border: '1px solid rgba(204,182,166,.35)',
          borderRadius: '.75rem',
        }}>
          <p style={{ fontSize: '.83rem', color: '#6B4C3B', lineHeight: 1.65 }}>
            {comment || 'No written comment, only rating provided.'}
          </p>
        </div>
      )}
    </div>
  );
}
