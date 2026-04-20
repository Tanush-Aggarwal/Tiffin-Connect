// src/pages/CustomerDashboard.jsx

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, CheckCircle, PauseCircle, XCircle, Clock,
  AlertCircle, Bell, Star, ExternalLink, PlayCircle,
  ChefHat, ArrowRight, ClipboardList, Sun, CloudSun, Moon, UtensilsCrossed, Ban, Trash2, Leaf, BellOff, Soup, BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useNotifications } from '../hooks/useNotifications';
import { markAllRead, markNotificationRead } from '../services/notificationService';
import { getReviewsByProvider, deleteReview } from '../services/reviewService';
import { deleteSubscription, deleteAllHistorySubscriptions } from '../services/subscriptionService';
import SubscriptionCard from '../components/customer/SubscriptionCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// ── greeting ────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning',   Icon: Sun,      color: '#C98B2A' };
  if (h < 17) return { text: 'Good afternoon', Icon: CloudSun, color: '#C2532A' };
  return       { text: 'Good evening',   Icon: Moon,     color: '#5C3D8F' };
}

// ── Tab button ───────────────────────────────────────────────────
function TabBtn({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '.65rem 1.1rem',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.88rem',
        color: active ? 'var(--terracotta)' : 'var(--ink-3)',
        background: 'transparent', border: 'none',
        borderBottom: `2px solid ${active ? 'var(--terracotta)' : 'transparent'}`,
        marginBottom: '-2px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '.4rem',
        whiteSpace: 'nowrap', transition: 'color .15s',
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          background: active ? 'var(--terracotta)' : 'var(--ink-4)',
          color: '#fff', fontFamily: 'Nunito', fontWeight: 800,
          fontSize: '.65rem', borderRadius: '999px',
          padding: '.1rem .45rem', lineHeight: 1.4,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── My reviews list ──────────────────────────────────────────────
function MyReviews({ currentUser, subscriptions }) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Collect unique providerIds from all subscriptions the customer ever had
  const providerIds = useMemo(() =>
    [...new Set(subscriptions.map((s) => s.providerId))],
    [subscriptions]
  );

  const fetchMyReviews = useCallback(async () => {
    if (!currentUser || providerIds.length === 0) { setLoading(false); return; }
    setLoading(true);
    try {
      const all = await Promise.all(
        providerIds.map((pid) => getReviewsByProvider(pid))
      );
      const mine = all.flat().filter((r) => r.customerId === currentUser.uid);
      setReviews(mine);
    } catch { /* silent */ }
    setLoading(false);
  }, [currentUser, providerIds]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchMyReviews();
    });
  }, [fetchMyReviews]);
  const handleDelete = async (review) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(review.id, review.providerId);
      toast.success('Review deleted');
      fetchMyReviews();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner />;

  if (reviews.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '3rem 1rem',
      background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)',
      border: '1px dashed var(--border)',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>⭐</div>
      <p style={{ fontFamily: 'Nunito', fontWeight: 800, color: 'var(--ink)', fontSize: '1rem' }}>
        You haven't reviewed any providers yet
      </p>
      <p style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginTop: '.35rem' }}>
        Visit a provider's page and leave a review in the Reviews tab
      </p>
      <Link to="/providers" className="btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
        <Search size={14} /> Browse Providers
      </Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
      {reviews.map((r) => (
        <div key={r.id} style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: '.1rem', marginBottom: '.4rem' }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ color: s <= r.rating ? '#D4943A' : '#E8D5C0', fontSize: '1.1rem' }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{r.comment}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.6rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/providers/${r.providerId}`}
                  style={{ fontSize: '.75rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.2rem' }}
                >
                  View Provider <ExternalLink size={10} />
                </Link>
                <span style={{ fontSize: '.72rem', color: 'var(--ink-4)' }}>
                  {r.createdAt?.toDate?.()?.toLocaleDateString?.('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) ?? ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(r)}
              style={{
                background: 'none', border: '1px solid rgba(192,57,43,.25)',
                color: '#C0392B', borderRadius: '.5rem', padding: '.3rem .6rem',
                fontSize: '.72rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Nunito', flexShrink: 0,
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF0F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────
export default function CustomerDashboard() {
  const { currentUser, userDoc } = useAuth();
  const [activeTab, setActiveTab] = useState('subscriptions');

  const { subscriptions, loading, error, refetch, changeStatus } = useSubscriptions({
    customerId: currentUser?.uid,
  });

  const { notifications, unreadCount } = useNotifications(currentUser?.uid);

  const { active, paused, pending, rejected, history } = useMemo(() => ({
    active:   subscriptions.filter((s) => s.status === 'active'),
    paused:   subscriptions.filter((s) => s.status === 'paused'),
    pending:  subscriptions.filter((s) => s.status === 'pending'),
    rejected: subscriptions.filter((s) => s.status === 'rejected'),
    history:  subscriptions.filter((s) => ['cancelled', 'completed'].includes(s.status)),
  }), [subscriptions]);

  const greeting = getGreeting();

  const handleChangeStatus = async (subId, newStatus, planId) => {
    try {
      await changeStatus(subId, newStatus, planId);
      const msgs = { paused: 'Subscription paused', active: 'Resumed', cancelled: 'Subscription cancelled' };
      const icons = { paused: <PauseCircle size={16} />, active: <PlayCircle size={16} />, cancelled: <XCircle size={16} /> };
      toast.success(msgs[newStatus] || 'Updated', { icon: icons[newStatus] ?? <BadgeCheck size={16} /> });
    } catch { toast.error('Failed to update subscription'); }
  };

  const handleRemoveSub = async (subId) => {
    try { await deleteSubscription(subId); toast.success('Removed from history'); }
    catch { toast.error('Failed to remove'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all past subscriptions from history?')) return;
    try { await deleteAllHistorySubscriptions(currentUser.uid); toast.success('History cleared', { icon: <Trash2 size={16} /> }); }
    catch { toast.error('Failed to clear history'); }
  };

  const STATS = [
    { label: 'Active',   count: active.length,  icon: CheckCircle,   color: 'var(--ok)',    bg: 'var(--ok-bg)'  },
    { label: 'Pending',  count: pending.length,  icon: Clock,         color: '#D97706',      bg: '#FEF3C7'       },
    { label: 'Paused',   count: paused.length,   icon: PauseCircle,   color: '#E67E22',      bg: '#FEF4E6'       },
    { label: 'History',  count: history.length,  icon: ClipboardList, color: 'var(--ink-3)', bg: 'var(--bg-deep)'},
  ];

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* ── Hero greeting ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-warm) 0%, var(--bg-surface) 100%)',
        borderBottom: '1px solid var(--border-lt)',
      }}>
        <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
                textTransform: 'uppercase', fontFamily: 'Nunito',
                color: greeting.color, marginBottom: '.3rem',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
                  <greeting.Icon size={14} style={{ color: greeting.color }} />
                  {greeting.text}
                </span>
              </p>
              <h1 style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--ink)',
                marginBottom: '.3rem',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                  <UtensilsCrossed size={18} style={{ color: 'var(--terracotta)' }} />
                  {userDoc?.name?.split(' ')[0] || 'Your'}'s Dashboard
                </span>
              </h1>
              <p style={{ color: 'var(--ink-3)', fontSize: '.875rem' }}>
                {subscriptions.length > 0
                  ? `${active.length} active · ${pending.length} pending · ${paused.length} paused`
                  : 'Find your first home-cooked tiffin plan below'}
              </p>
            </div>
            <Link to="/providers" className="btn-primary" id="browse-providers-btn" style={{ flexShrink: 0 }}>
              <Search size={15} /> Browse Tiffins
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* ── Unread notification banner ── */}
        {unreadNotifs.length > 0 && (
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border)', borderLeft: '4px solid var(--terracotta)',
            padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.65rem' }}>
              <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.875rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <Bell size={15} style={{ color: 'var(--terracotta)' }} />
                {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
              </p>
              <button
                onClick={async () => { await markAllRead(currentUser.uid); toast.success('All marked as read'); }}
                style={{ fontSize: '.72rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
              {unreadNotifs.slice(0, 4).map((n) => (
                <button
                  key={n.id}
                  onClick={async () => { await markNotificationRead(n.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.65rem',
                    padding: '.55rem .75rem', borderRadius: '.65rem',
                    background: 'var(--terracotta-pale)', border: 'none',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fce0d4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--terracotta-pale)'; }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,.65)',
                    border: '1px solid rgba(194,83,42,.18)',
                    color: 'var(--terracotta)',
                    flexShrink: 0,
                  }}>
                    {n.type === 'subscription_approved' ? <CheckCircle size={15} />
                      : n.type === 'subscription_rejected' ? <XCircle size={15} />
                      : n.type === 'vendor_cancelled' ? <Ban size={15} />
                      : <Bell size={15} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Nunito' }}>{n.message}</p>
                    <p style={{ fontSize: '.7rem', color: 'var(--ink-4)' }}>
                      {n.createdAt?.toDate?.()?.toLocaleString?.('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) ?? 'Just now'}
                    </p>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '1.1rem 1rem',
              display: 'flex', alignItems: 'center', gap: '.85rem',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.5rem', color: 'var(--ink)', lineHeight: 1 }}>
                  {s.count}
                </p>
                <p style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: '.1rem' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{
          borderBottom: '2px solid var(--border-lt)',
          display: 'flex', gap: 0, marginBottom: '1.75rem', overflowX: 'auto',
        }}>
          <TabBtn active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} badge={subscriptions.filter(s => !['cancelled','completed'].includes(s.status)).length}>
            <UtensilsCrossed size={16} />
            My Subscriptions
          </TabBtn>
          <TabBtn active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            <Star size={16} />
            My Reviews
          </TabBtn>
          <TabBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount}>
            <Bell size={16} />
            Notifications
          </TabBtn>
        </div>

        {/* ───────── SUBSCRIPTIONS TAB ───────── */}
        {activeTab === 'subscriptions' && (
          <div>
            {loading && <Spinner size="md" />}
            {error   && <ErrorMessage message={error} onRetry={refetch} />}

            {!loading && !error && subscriptions.length === 0 && (
              <div style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                borderRadius: 'var(--r-xl)', padding: '3.5rem 2rem', textAlign: 'center',
              }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--bg-warm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--terracotta)' }}>
                  <Soup size={22} />
                </div>
                <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--ink)', fontSize: '1.2rem', marginBottom: '.5rem' }}>
                  No subscriptions yet
                </h2>
                <p style={{ color: 'var(--ink-3)', fontSize: '.875rem', maxWidth: '300px', margin: '0 auto .75rem' }}>
                  Browse home cooks near you and subscribe to your first tiffin plan!
                </p>
                <Link to="/providers" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  <Search size={15} /> Find a Tiffin Provider
                </Link>
              </div>
            )}

            {!loading && !error && subscriptions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* No active/pending — show a gentle nudge */}
                {active.length === 0 && pending.length === 0 && paused.length === 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, var(--bg-warm), var(--terracotta-pale))',
                    border: '1px dashed rgba(194,83,42,.3)',
                    borderRadius: 'var(--r-lg)', padding: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.75)', border: '1px solid rgba(194,83,42,.18)', boxShadow: 'var(--shadow-xs)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--terracotta)' }}>
                      <UtensilsCrossed size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 800, color: 'var(--ink)', fontSize: '.95rem' }}>
                        No active subscriptions right now
                      </p>
                      <p style={{ fontSize: '.82rem', color: 'var(--ink-3)', marginTop: '.2rem' }}>
                        Your past subscriptions are shown below. Subscribe to a new plan to get started again!
                      </p>
                    </div>
                    <Link to="/providers" className="btn-primary" style={{ flexShrink: 0, fontSize: '.85rem', padding: '.55rem 1.1rem' }}>
                      <Search size={13} /> Browse Tiffins
                    </Link>
                  </div>
                )}

                {/* Pending */}
                {pending.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.95rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                      <Clock size={15} /> Awaiting Approval
                      <span style={{ background: '#FEF3C7', color: '#D97706', fontFamily: 'Nunito', fontWeight: 800, fontSize: '.7rem', padding: '.1rem .5rem', borderRadius: '999px', border: '1px solid rgba(217,119,6,.25)' }}>
                        {pending.length}
                      </span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {pending.map((sub) => <SubscriptionCard key={sub.id} sub={sub} onChangeStatus={handleChangeStatus} />)}
                    </div>
                  </section>
                )}

                {/* Active */}
                {active.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.95rem', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                      <CheckCircle size={15} /> Active Subscriptions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {active.map((sub) => <SubscriptionCard key={sub.id} sub={sub} onChangeStatus={handleChangeStatus} />)}
                    </div>
                  </section>
                )}

                {/* Paused */}
                {paused.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.95rem', color: '#E67E22', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                      <PauseCircle size={15} /> Paused
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {paused.map((sub) => <SubscriptionCard key={sub.id} sub={sub} onChangeStatus={handleChangeStatus} />)}
                    </div>
                  </section>
                )}

                {/* Rejected */}
                {rejected.length > 0 && (
                  <section>
                    <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.95rem', color: '#C0392B', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                      <AlertCircle size={15} /> Not Accepted
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {rejected.map((sub) => <SubscriptionCard key={sub.id} sub={sub} onChangeStatus={handleChangeStatus} />)}
                    </div>
                  </section>
                )}

                {/* History */}
                {history.length > 0 && (
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.95rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <ClipboardList size={15} /> Past Subscriptions
                        <span style={{ background: 'var(--bg-deep)', color: 'var(--ink-3)', fontFamily: 'Nunito', fontWeight: 800, fontSize: '.7rem', padding: '.1rem .5rem', borderRadius: '999px' }}>
                          {history.length}
                        </span>
                      </h2>
                      <button
                        onClick={handleClearAll}
                        style={{
                          fontSize: '.75rem', fontWeight: 700, fontFamily: 'Nunito',
                          color: '#C0392B', background: '#FFF5F5',
                          border: '1px solid rgba(192,57,43,.25)',
                          borderRadius: '999px', padding: '.3rem .85rem',
                          cursor: 'pointer', transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F5'; }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                          <Trash2 size={14} />
                          Clear All
                        </span>
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {history.map((sub) => (
                        <SubscriptionCard key={sub.id} sub={sub} onChangeStatus={handleChangeStatus} onRemove={handleRemoveSub} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Browse more CTA */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--terracotta-pale), var(--bg-warm))',
                  border: '1px solid var(--border-lt)', borderRadius: 'var(--r-lg)',
                  padding: '1.1rem 1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <p style={{ fontFamily: 'Nunito', fontWeight: 800, color: 'var(--ink)', fontSize: '.95rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                      <Leaf size={15} style={{ color: 'var(--herb)' }} />
                      Want more variety?
                    </span>
                    <span style={{ fontSize: '.82rem', fontWeight: 400, color: 'var(--ink-3)', marginLeft: '.5rem' }}>
                      Discover more home cooks
                    </span>
                  </p>
                  <Link to="/providers" className="btn-primary" style={{ flexShrink: 0, fontSize: '.85rem', padding: '.55rem 1.1rem' }}>
                    Browse all <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───────── REVIEWS TAB ───────── */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
              <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
                  <Star size={16} style={{ color: 'var(--mustard)' }} />
                  My Reviews
                </span>
              </h2>
              <p style={{ fontSize: '.8rem', color: 'var(--ink-3)' }}>
                To write a new review, visit a provider's page → Reviews tab
              </p>
            </div>
            <MyReviews currentUser={currentUser} subscriptions={subscriptions} />
          </div>
        )}

        {/* ───────── NOTIFICATIONS TAB ───────── */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
                  <Bell size={16} style={{ color: 'var(--terracotta)' }} />
                  All Notifications
                </span>
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={async () => { await markAllRead(currentUser.uid); toast.success('All marked as read'); }}
                  style={{ fontSize: '.78rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                borderRadius: 'var(--r-lg)', padding: '3rem 1rem', textAlign: 'center',
              }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--bg-warm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.75rem', color: 'var(--ink-3)' }}>
                  <BellOff size={20} />
                </div>
                <p style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--ink-3)' }}>No notifications yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={async () => { if (!n.isRead) await markNotificationRead(n.id); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                      padding: '.85rem 1rem', borderRadius: 'var(--r-md)',
                      background: n.isRead ? 'var(--bg-surface)' : 'var(--terracotta-pale)',
                      border: `1px solid ${n.isRead ? 'var(--border-lt)' : 'rgba(194,83,42,.2)'}`,
                      cursor: n.isRead ? 'default' : 'pointer',
                      width: '100%', textAlign: 'left',
                      transition: 'background .15s',
                      boxShadow: n.isRead ? 'none' : 'var(--shadow-xs)',
                    }}
                  >
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: n.isRead ? 'var(--bg-warm)' : 'rgba(255,255,255,.65)',
                      border: `1px solid ${n.isRead ? 'var(--border-lt)' : 'rgba(194,83,42,.18)'}`,
                      color: 'var(--terracotta)',
                      flexShrink: 0,
                      marginTop: '.1rem',
                    }}>
                      {n.type === 'subscription_approved' ? <CheckCircle size={16} />
                        : n.type === 'subscription_rejected' ? <XCircle size={16} />
                        : n.type === 'vendor_cancelled' ? <Ban size={16} />
                        : <Bell size={16} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '.875rem', fontWeight: n.isRead ? 500 : 700, color: 'var(--ink)', fontFamily: 'Nunito' }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: '.72rem', color: 'var(--ink-4)', marginTop: '.2rem' }}>
                        {n.createdAt?.toDate?.()?.toLocaleString?.('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) ?? 'Just now'}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)', flexShrink: 0, marginTop: '.4rem' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
