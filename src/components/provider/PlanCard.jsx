// src/components/provider/PlanCard.jsx — Swiggy/Zomato food-item card with image

import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Users, Clock, Pencil, Trash2, Leaf, CheckCircle, Tag, ChevronDown, ChevronUp, X } from 'lucide-react';

import { getPlanImage } from '../../utils/constants';

export default function PlanCard({ plan, onSubscribe, onEdit, onDelete, mySubscription = null, isSubscribing = false, onCancel = null, horizontal = false, subscribeMode = 'customer' }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    id, title, description, pricePerDay, pricePerMonth,
    isVeg, deliveryDays = [], deliveryTimeWindow,
    maxSubscribers, currentSubscribers = 0, weeklyMenu = {},
  } = plan;

  const spotsLeft = maxSubscribers > 0 ? maxSubscribers - (currentSubscribers || 0) : Infinity;
  const isFull    = maxSubscribers > 0 && spotsLeft <= 0;
  const isOwner   = !!onEdit;
  const fillPct   = maxSubscribers > 0 ? Math.min(100, (currentSubscribers / maxSubscribers) * 100) : 0;
  const foodImg   = getPlanImage({
    imageUrl: plan.imageUrl,
    imageIndex: plan.imageIndex,
    title,
    description,
    fallbackKey: id || title,
  });

  // Derive display state from mySubscription
  const subStatus    = mySubscription?.status ?? null;  // 'pending' | 'active' | 'paused' | null
  const isSubscribed = subStatus !== null;              // any live connection to this plan
  const isPending    = subStatus === 'pending';
  const isActive     = subStatus === 'active';
  const isPaused     = subStatus === 'paused';

  /* ── Horizontal layout (used on ProviderDetail page) ── */
  if (horizontal) {
    return (
      <div className="food-card-h" id={`plan-card-${id}`}>
        {/* Image */}
        <div className="food-card-h-image" style={{ width: '200px', minHeight: '160px', flexShrink: 0 }}>
          <img
            src={foodImg}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80';
            }}
          />
          {/* Veg dot */}
          <div style={{
            position: 'absolute', top: '.5rem', left: '.5rem',
            width: '18px', height: '18px', borderRadius: '3px',
            border: `2px solid ${isVeg ? '#27AE60' : '#C0392B'}`,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isVeg ? '#27AE60' : '#C0392B',
            }} />
          </div>
        </div>

        {/* Body */}
        <div className="food-card-h-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>
                  {title}
                </h3>
                {isSubscribed && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.2rem',
                    padding: '.1rem .5rem', borderRadius: '999px',
                    fontSize: '.68rem', fontWeight: 700, fontFamily: 'Nunito',
                    background: isPending ? '#FEF3C7' : 'var(--ok-bg)',
                    color:      isPending ? '#D97706'  : 'var(--ok)',
                  }}>
                    {isPending ? <><Clock size={9} /> Pending</> : isPaused ? 'Paused' : <><CheckCircle size={9} /> Subscribed</>}
                  </span>
                )}
              </div>
              {description && (
                <p style={{
                  fontSize: '.8rem', color: 'var(--ink-3)', marginTop: '.25rem',
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', lineHeight: 1.45,
                }}>
                  {description}
                </p>
              )}
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0 }}>
                <button onClick={() => onEdit(plan)} className="btn-ghost" style={{ padding: '.4rem' }} aria-label="Edit">
                  <Pencil size={13} style={{ color: 'var(--ink-3)' }} />
                </button>
                <button onClick={() => onDelete(id)} className="btn-ghost" style={{ padding: '.4rem' }} aria-label="Delete">
                  <Trash2 size={13} style={{ color: 'var(--err)' }} />
                </button>
              </div>
            )}
          </div>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '.75rem', marginTop: '.6rem' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--terracotta)' }}>
              ₹{pricePerDay}
              <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink-3)', marginLeft: '.2rem' }}>/day</span>
            </span>
            {pricePerMonth > 0 && (
              <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink-3)' }}>
                ₹{pricePerMonth}<span style={{ fontSize: '.68rem' }}>/mo</span>
              </span>
            )}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
            {deliveryTimeWindow && (
              <span style={{ fontSize: '.72rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                <Clock size={11} style={{ color: 'var(--mustard)' }} /> {deliveryTimeWindow}
              </span>
            )}
            {deliveryDays?.length > 0 && (
              <span style={{ fontSize: '.72rem', color: 'var(--herb)', fontWeight: 600 }}>
                {deliveryDays.join(' · ')}
              </span>
            )}
            {maxSubscribers > 0 && (
              <span style={{ fontSize: '.72rem', color: isFull ? 'var(--err)' : 'var(--herb)', fontWeight: 600 }}>
                {isFull ? 'Full' : `${spotsLeft} spots left`}
              </span>
            )}
          </div>

          {/* ── Weekly Menu button → portal modal ── */}
          {(() => {
            const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
            const sortedMenu = Object.entries(weeklyMenu)
              .filter(([, meal]) => meal)
              .sort(([a], [b]) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
            return sortedMenu.length > 0;
          })() && (
            <div style={{ marginTop: '.7rem' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                  padding: '.35rem .85rem', borderRadius: '999px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--terracotta)', fontFamily: 'Nunito', fontWeight: 700,
                  fontSize: '.75rem', cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--terracotta)'; e.currentTarget.style.background = 'var(--terracotta-pale)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
              >
                View Weekly Menu <ChevronDown size={12} />
              </button>

              {/* ── Portal modal (renders at body, never clipped) ── */}
              {menuOpen && ReactDOM.createPortal(
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(30, 15, 5, 0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem',
                    animation: 'fadeIn .2s ease',
                  }}
                >
                  {/* Modal card — stop propagation so clicking inside doesn't close */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-xl)',
                      boxShadow: 'var(--shadow-lg)',
                      width: '100%', maxWidth: '420px',
                      maxHeight: '80vh', overflowY: 'auto',
                      animation: 'fadeInUp .22s ease',
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1.1rem 1.25rem',
                      borderBottom: '1px solid var(--border-lt)',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)',
                        }}>
                          This Week's Menu
                        </p>
                        <p style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginTop: '.1rem' }}>
                          {title}
                        </p>
                      </div>
                      <button
                        onClick={() => setMenuOpen(false)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          border: '1px solid var(--border)', background: 'var(--bg-warm)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--ink-3)', flexShrink: 0,
                          transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--terracotta-pale)'; e.currentTarget.style.color = 'var(--terracotta)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-warm)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Day rows — sorted Mon → Sun */}
                    <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                      {(() => {
                        const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                        return Object.entries(weeklyMenu)
                          .filter(([, meal]) => meal)
                          .sort(([a], [b]) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
                      })().map(([day, meal]) => (
                        <div key={day} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                          padding: '.65rem .8rem',
                          background: 'var(--bg-warm)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border-lt)',
                        }}>
                          <span style={{
                            fontSize: '.65rem', fontWeight: 900, color: '#fff',
                            background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
                            borderRadius: '8px', padding: '.25rem .55rem',
                            fontFamily: 'Nunito', textTransform: 'uppercase',
                            letterSpacing: '.05em', flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(194,83,42,.3)',
                          }}>
                            {day.slice(0, 3)}
                          </span>
                          <span style={{
                            fontSize: '.875rem', color: 'var(--ink-2)',
                            lineHeight: 1.5, paddingTop: '.1rem',
                          }}>
                            {meal}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer hint */}
                    <div style={{
                      padding: '.75rem 1.25rem',
                      borderTop: '1px solid var(--border-lt)',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '.72rem', color: 'var(--ink-4)', fontFamily: 'Nunito' }}>
                        Click outside to close
                      </p>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          )}


          {/* Capacity bar */}
          {maxSubscribers > 0 && (
            <div style={{ marginTop: '.6rem' }}>
              <div className="capacity-bar-track">
                <div className={`capacity-bar-fill ${isFull ? 'full' : ''}`} style={{ width: `${fillPct}%` }} />
              </div>
            </div>
          )}

          {/* Subscribe / status button + cancel option */}
          {!isOwner && (
            <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {/* Main action button */}
              <button
                onClick={() => {
                  if (isSubscribing || isFull || isSubscribed || subscribeMode === 'provider') return;
                  onSubscribe ? onSubscribe(plan) : null;
                }}
                disabled={isFull || isSubscribed || subscribeMode === 'provider' || isSubscribing}
                id={`subscribe-btn-${id}`}
                style={{
                  width: '100%',
                  padding: '.55rem 1rem', borderRadius: 'var(--r-full)',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.85rem',
                  cursor: (isFull || isSubscribed || subscribeMode === 'provider' || isSubscribing) ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background:
                    isPending            ? '#FEF3C7'
                    : isActive || isPaused ? 'var(--ok-bg)'
                    : isFull             ? 'var(--bg-warm)'
                    : isSubscribing      ? 'linear-gradient(135deg, #d4724d, #b85e3b)'
                    : subscribeMode === 'guest'    ? 'linear-gradient(135deg, #3A7250, #2D5E40)'
                    : subscribeMode === 'provider' ? 'var(--bg-deep)'
                    : 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
                  color:
                    isPending              ? '#D97706'
                    : isActive || isPaused ? 'var(--ok)'
                    : isFull               ? 'var(--ink-4)'
                    : subscribeMode === 'provider' ? 'var(--ink-4)'
                    : '#fff',
                  opacity: (isFull || subscribeMode === 'provider') ? .65 : 1,
                  transition: 'all .16s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem',
                  boxShadow: (isSubscribed || isFull || subscribeMode === 'provider') ? 'none'
                    : subscribeMode === 'guest' ? '0 3px 10px rgba(58,114,80,.3)'
                    : '0 3px 10px rgba(194,83,42,.3)',
                }}
              >
                {isSubscribing
                  ? <>
                      <span style={{
                        width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.4)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                      }} />
                      Sending request…
                    </>
                  : isPending
                    ? 'Pending Approval'
                    : isActive
                      ? 'Subscribed'
                      : isPaused
                        ? 'Paused'
                        : isFull
                          ? 'Plan Full'
                          : subscribeMode === 'guest'
                            ? 'Login to Subscribe'
                            : subscribeMode === 'provider'
                              ? 'Viewing as Provider'
                              : 'Subscribe'}
              </button>

              {/* Cancel / Withdraw button — shown when customer has any live sub */}
              {onCancel && mySubscription && (isActive || isPaused || isPending) && (
                <button
                  onClick={() => onCancel(mySubscription)}
                  id={`cancel-sub-btn-${id}`}
                  style={{
                    width: '100%',
                    padding: '.45rem 1rem', borderRadius: 'var(--r-full)',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.78rem',
                    cursor: 'pointer', border: '1.5px solid rgba(192,57,43,.3)',
                    background: 'transparent', color: '#C0392B',
                    transition: 'background .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF0F0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {isPending ? 'Withdraw Request' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Vertical card (used on dashboard / grid view) ── */
  return (
    <div className="food-card" id={`plan-card-${id}`}>
      {/* Image */}
      <div className="food-card-image">
        <img
          src={foodImg}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Veg indicator */}
        <div style={{
          position: 'absolute', top: '.65rem', left: '.65rem',
          width: '20px', height: '20px', borderRadius: '4px',
          border: `2px solid ${isVeg ? '#27AE60' : '#C0392B'}`,
          background: 'rgba(255,255,255,.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '9px', height: '9px', borderRadius: '50%',
            background: isVeg ? '#27AE60' : '#C0392B',
          }} />
        </div>

        {/* Price ribbon */}
        <div style={{
          position: 'absolute', top: '.65rem', right: '.65rem',
          background: 'rgba(42,26,14,.82)', backdropFilter: 'blur(6px)',
          borderRadius: 'var(--r-full)', padding: '.2rem .65rem',
          fontSize: '.8rem', fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: '#fff',
        }}>
          ₹{pricePerDay}/day
        </div>

        {/* Subscribed badge */}
        {isSubscribed && (
          <div style={{
            position: 'absolute', bottom: '.65rem', left: '.65rem',
            background: 'var(--ok)', borderRadius: 'var(--r-full)',
            padding: '.15rem .55rem', fontSize: '.7rem', fontWeight: 700,
            color: '#fff', display: 'flex', alignItems: 'center', gap: '.25rem',
          }}>
            <CheckCircle size={9} /> Subscribed
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div style={{
            position: 'absolute', bottom: '.65rem', right: '.65rem',
            display: 'flex', gap: '.25rem',
          }}>
            <button
              onClick={(e) => { e.preventDefault(); onEdit(plan); }}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Edit plan"
            >
              <Pencil size={13} style={{ color: 'var(--ink-2)' }} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(id); }}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Delete plan"
            >
              <Trash2 size={13} style={{ color: 'var(--err)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="food-card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem', marginBottom: '.4rem' }}>
          <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)', flex: 1 }}>
            {title}
          </h3>
          {pricePerMonth > 0 && (
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>
              ₹{pricePerMonth}/mo
            </span>
          )}
        </div>

        {description && (
          <p style={{
            fontSize: '.8rem', color: 'var(--ink-3)', lineHeight: 1.45, marginBottom: '.6rem',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {description}
          </p>
        )}

        {/* Delivery days chips */}
        {deliveryDays.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.6rem' }}>
            {deliveryDays.map((d) => (
              <span key={d} style={{
                padding: '.15rem .45rem', borderRadius: '999px',
                fontSize: '.68rem', fontWeight: 700,
                background: 'var(--herb-pale)', color: 'var(--herb)',
              }}>
                {d}
              </span>
            ))}
          </div>
        )}

        {/* Delivery time */}
        {deliveryTimeWindow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', color: 'var(--ink-3)', marginBottom: '.5rem' }}>
            <Clock size={12} style={{ color: 'var(--mustard)' }} />
            {deliveryTimeWindow}
          </div>
        )}

        {/* Weekly menu preview */}
        {Object.values(weeklyMenu).some(Boolean) && (
          <div style={{
            background: 'var(--bg-warm)', borderRadius: 'var(--r-md)',
            padding: '.6rem .75rem', marginBottom: '.6rem',
            border: '1px solid var(--border-lt)',
          }}>
            <p style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.35rem' }}>
              This week
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.2rem .75rem' }}>
              {Object.entries(weeklyMenu).filter(([, v]) => v).slice(0, 4).map(([day, meal]) => (
                <div key={day} style={{ fontSize: '.73rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--terracotta)' }}>{day}: </span>
                  <span style={{ color: 'var(--ink-2)' }}>{meal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capacity bar */}
        {maxSubscribers > 0 && (
          <div style={{ marginBottom: '.7rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--ink-3)', marginBottom: '.3rem' }}>
              <span>{currentSubscribers}/{maxSubscribers} subscribers</span>
              <span style={{ color: isFull ? 'var(--err)' : 'var(--herb)', fontWeight: 600 }}>
                {isFull ? 'Full' : `${spotsLeft} left`}
              </span>
            </div>
            <div className="capacity-bar-track">
              <div className={`capacity-bar-fill ${isFull ? 'full' : ''}`} style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        {onSubscribe && (
          <button
            onClick={() => onSubscribe(plan)}
            disabled={isFull || isSubscribed}
            id={`subscribe-btn-${id}`}
            style={{
              width: '100%', padding: '.65rem', borderRadius: 'var(--r-full)',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.875rem',
              border: 'none', cursor: (isFull || isSubscribed) ? 'not-allowed' : 'pointer',
              background: isSubscribed
                ? 'var(--bg-warm)'
                : isFull
                  ? 'var(--bg-deep)'
                  : 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
              color: isSubscribed || isFull ? 'var(--ink-3)' : '#fff',
              opacity: (isFull || isSubscribed) ? .75 : 1,
              transition: 'all .16s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
              boxShadow: isSubscribed || isFull ? 'none' : '0 3px 10px rgba(194,83,42,.3)',
            }}
          >
            {isSubscribed ? 'Already Subscribed' : isFull ? 'Plan Full' : 'Subscribe to This Plan'}
          </button>
        )}
      </div>
    </div>
  );
}
