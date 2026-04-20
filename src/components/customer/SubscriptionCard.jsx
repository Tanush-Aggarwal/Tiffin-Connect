// src/components/customer/SubscriptionCard.jsx — Full-width horizontal redesign

import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, PauseCircle, PlayCircle, XCircle,
  ExternalLink, Clock, CheckCircle, AlertCircle,
  UtensilsCrossed, Trash2,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { getPlanImage } from '../../utils/constants';

const STATUS_CONFIG = {
  active:    { accent: '#3A7250', bg: '#EDF7F1', icon: CheckCircle,  label: 'Active',    bar: '#3A7250', barW: '100%' },
  paused:    { accent: '#D97706', bg: '#FEF3C7', icon: PauseCircle,  label: 'Paused',    bar: '#D97706', barW: '55%'  },
  pending:   { accent: '#B45309', bg: '#FEF9EC', icon: Clock,        label: 'Pending',   bar: '#D97706', barW: '30%'  },
  rejected:  { accent: '#C0392B', bg: '#FFF0F0', icon: AlertCircle,  label: 'Rejected',  bar: '#C0392B', barW: '100%' },
  cancelled: { accent: '#6B7280', bg: '#F3F4F6', icon: XCircle,      label: 'Cancelled',   bar: '#9CA3AF', barW: '100%' },
  completed: { accent: '#6B7280', bg: '#F3F4F6', icon: CheckCircle,  label: 'Completed',   bar: '#9CA3AF', barW: '100%' },
};

export default function SubscriptionCard({ sub, onChangeStatus, onRemove }) {
  const {
    id, planTitle, providerName, providerId,
    status, startDate, planId, cancelledBy, planImageUrl,
  } = sub;

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelled;
  const Icon = cfg.icon;
  const isTerminal = ['cancelled', 'completed', 'rejected'].includes(status);

  const handlePause  = useCallback(() => onChangeStatus(id, 'paused',    planId), [id, planId, onChangeStatus]);
  const handleResume = useCallback(() => onChangeStatus(id, 'active',    planId), [id, planId, onChangeStatus]);
  const handleCancel = useCallback(() => {
    const msg = status === 'pending' ? 'Withdraw this subscription request?' : 'Cancel this subscription?';
    if (window.confirm(msg)) onChangeStatus(id, 'cancelled', planId);
  }, [id, planId, status, onChangeStatus]);
  const handleRemove = useCallback(() => onRemove?.(id), [id, onRemove]);

  const coverImg = getPlanImage({
    imageUrl: planImageUrl,
    title: planTitle,
    fallbackKey: planId || planTitle,
  });

  return (
    <div
      id={`sub-card-${id}`}
      style={{
        display: 'flex',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: `4px solid ${cfg.accent}`,
        opacity: isTerminal ? .82 : 1,
        transition: 'box-shadow .2s, opacity .2s',
      }}
      onMouseEnter={(e) => { if (!isTerminal) e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* ── Left: Cover image ── */}
      <div style={{
        width: '190px', flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={coverImg}
          alt={providerName}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: isTerminal ? 'grayscale(.5)' : 'none',
            transition: 'filter .2s',
          }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'; }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(20,10,4,.5) 0%, transparent 80%)',
        }} />
      </div>

      {/* ── Right: Content ── */}
      <div style={{ flex: 1, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.6rem', minWidth: 0 }}>

        {/* Row 1: Title + Status badge + Remove button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: '1rem',
              color: 'var(--ink)', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {planTitle}
            </p>
            <p style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginTop: '.15rem' }}>
              by {providerName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexShrink: 0 }}>
            {/* Status pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '.3rem',
              padding: '.3rem .75rem', borderRadius: '999px',
              background: cfg.bg, color: cfg.accent,
              fontFamily: 'Nunito', fontWeight: 800, fontSize: '.72rem',
              border: `1px solid ${cfg.accent}22`,
            }}>
              <Icon size={12} />
              {cfg.label}
            </span>

            {/* Remove button — only for terminal cards when onRemove is provided */}
            {isTerminal && onRemove && (
              <button
                onClick={handleRemove}
                title="Remove from history"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '1px solid rgba(192,57,43,.2)',
                  background: '#FFF5F5', color: '#C0392B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '.75rem', transition: 'background .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F5'; }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Status-specific message */}
        {status === 'pending' && (
          <div style={{
            padding: '.5rem .75rem', borderRadius: '.6rem',
            background: '#FEF3C7', border: '1px solid rgba(217,119,6,.2)',
            fontSize: '.78rem', color: '#92400E', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '.4rem',
          }}>
            <Clock size={13} /> Waiting for the provider to approve your request…
          </div>
        )}
        {status === 'rejected' && (
          <div style={{
            padding: '.5rem .75rem', borderRadius: '.6rem',
            background: '#FFF0F0', border: '1px solid rgba(192,57,43,.2)',
            fontSize: '.78rem', color: '#C0392B', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '.4rem',
          }}>
            <AlertCircle size={13} /> This request was not accepted by the provider.
          </div>
        )}
        {status === 'cancelled' && cancelledBy === 'provider' && (
          <div style={{
            padding: '.5rem .75rem', borderRadius: '.6rem',
            background: '#FFF0F0', border: '1px solid rgba(192,57,43,.2)',
            fontSize: '.78rem', color: '#C0392B', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '.4rem',
          }}>
            <AlertCircle size={13} /> This subscription was cancelled by the provider.
          </div>
        )}

        {/* Row 3: Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.78rem', color: 'var(--ink-3)' }}>
            <Calendar size={13} style={{ color: 'var(--terracotta)' }} />
            {status === 'pending' ? 'Requested' : 'Member since'} {formatDate(startDate)}
          </span>
          {providerId && (
            <Link
              to={`/providers/${providerId}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '.25rem',
                fontSize: '.78rem', fontWeight: 700, color: 'var(--terracotta)',
                textDecoration: 'none', fontFamily: 'Nunito',
              }}
            >
              <UtensilsCrossed size={12} /> View Kitchen <ExternalLink size={10} />
            </Link>
          )}
        </div>

        {/* Row 4: Progress bar */}
        <div style={{
          height: '5px', borderRadius: '3px', background: cfg.bg, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: cfg.barW, background: cfg.bar,
            borderRadius: '3px', opacity: isTerminal ? .45 : 1,
            transition: 'width .4s ease',
          }} />
        </div>

        {/* Row 5: Action buttons */}
        {!isTerminal && (
          <div style={{ display: 'flex', gap: '.65rem', marginTop: '.1rem' }}>
            {status === 'active' && (
              <button
                onClick={handlePause}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  padding: '.45rem 1rem', borderRadius: 'var(--r-full)',
                  border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                  color: 'var(--ink-2)', fontFamily: 'Nunito', fontWeight: 700,
                  fontSize: '.8rem', cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.color = '#D97706'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
              >
                <PauseCircle size={14} /> Pause
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={handleResume}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  padding: '.45rem 1rem', borderRadius: 'var(--r-full)',
                  border: '1.5px solid #3A7250', background: '#EDF7F1',
                  color: '#3A7250', fontFamily: 'Nunito', fontWeight: 700,
                  fontSize: '.8rem', cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#D4EDDA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#EDF7F1'; }}
              >
                <PlayCircle size={14} /> Resume
              </button>
            )}
            <button
              onClick={handleCancel}
              style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                padding: '.45rem 1rem', borderRadius: 'var(--r-full)',
                border: '1.5px solid rgba(192,57,43,.3)', background: '#FFF5F5',
                color: '#C0392B', fontFamily: 'Nunito', fontWeight: 700,
                fontSize: '.8rem', cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#C0392B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F5'; e.currentTarget.style.borderColor = 'rgba(192,57,43,.3)'; }}
            >
              <XCircle size={14} /> {status === 'pending' ? 'Withdraw' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
