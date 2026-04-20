// src/pages/ProviderDetail.jsx — Zomato/Swiggy style restaurant detail page

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, MessageSquare, ArrowLeft, ChefHat, Leaf, Clock, Users, Share2, Drumstick, UtensilsCrossed } from 'lucide-react';
import { getProvider } from '../services/providerService';
import { createSubscription, updateSubscriptionStatus } from '../services/subscriptionService';
import { getReviewsByProvider, createReview, updateReview, deleteReview } from '../services/reviewService';
import { useTiffinPlans } from '../hooks/useTiffinPlans';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useAuth } from '../context/AuthContext';
import PlanCard from '../components/provider/PlanCard';
import ReviewCard from '../components/customer/ReviewCard';
import ReviewForm from '../components/customer/ReviewForm';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/common/UserAvatar';
import StarRating from '../components/common/StarRating';
import { getProviderCoverImage, CUISINE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ProviderDetail() {
  const { id: providerId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userDoc, userRole, authLoading } = useAuth();

  const [provider,       setProvider]       = useState(null);
  const [provLoading,    setProvLoading]    = useState(true);
  const [provError,      setProvError]      = useState('');
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab,      setActiveTab]      = useState('menu'); // 'menu' | 'reviews'

  const { plans, loading: plansLoading } = useTiffinPlans(providerId);
  const { subscriptions } = useSubscriptions(
    currentUser ? { customerId: currentUser.uid } : {}
  );

  const reviewsRef = useRef(null);
  const scrollToReviews = useCallback(() => {
    setActiveTab('reviews');
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProvider() {
      setProvLoading(true);
      setProvError('');

      try {
        const data = await getProvider(providerId);
        if (cancelled) return;

        setProvider(data);
        if (!data) setProvError('Provider not found.');
      } catch (error) {
        if (!cancelled) setProvError(error.message);
      } finally {
        if (!cancelled) setProvLoading(false);
      }
    }

    void loadProvider();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      setReviews(await getReviewsByProvider(providerId));
    } finally {
      setReviewsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      try {
        const nextReviews = await getReviewsByProvider(providerId);
        if (!cancelled) setReviews(nextReviews);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const myReview = useMemo(() => reviews.find((r) => r.customerId === currentUser?.uid), [reviews, currentUser]);
  // Map from planId → subscription object so PlanCard knows the actual status
  // (pending / active / paused), not just a boolean.
  const subscribedPlansMap = useMemo(() => {
    const map = new Map();
    subscriptions
      .filter((s) => s.providerId === providerId && ['active', 'paused', 'pending'].includes(s.status))
      .forEach((s) => map.set(s.planId, s));
    return map;
  }, [subscriptions, providerId]);

  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  const handleSubscribe = useCallback(async (plan) => {
    if (!currentUser) { navigate('/login'); return; }

    // If auth is still loading, wait briefly then proceed
    // (don't block with an error — the user just clicked)
    if (authLoading) {
      toast.loading('Loading your account…', { duration: 1500 });
      return;
    }

    // Block providers from subscribing; allow customers and null (still loading)
    if (userRole === 'provider') {
      toast.error('Only customers can subscribe to plans.');
      return;
    }
    if (!provider) { toast.error('Provider info missing, please refresh.'); return; }
    if (!plan?.id)  { toast.error('Plan info missing, please refresh.'); return; }

    // Prevent duplicate requests using the map
    if (subscribedPlansMap.has(plan.id)) {
      toast.error('You already have an active or pending subscription to this plan.');
      return;
    }

    setSubscribingPlanId(plan.id);
    try {
      await createSubscription({
        customerId:   currentUser.uid,
        customerName: userDoc?.name || currentUser.email || 'Customer',
        plan,
        provider,
      });
      toast.success(`Request sent for "${plan.title}"! \nWaiting for provider approval.`, { duration: 4500 });
    } catch (err) {
      console.error('[Subscribe] error:', err);
      if (err.code === 'permission-denied') {
        toast.error('Permission denied. Check your Firestore security rules.');
      } else {
        toast.error(err.message || 'Failed to subscribe. Please try again.');
      }
    } finally {
      setSubscribingPlanId(null);
    }
  }, [currentUser, userDoc, userRole, authLoading, provider, subscribedPlansMap, navigate]);

  // Customer can cancel from the detail page (withdraw pending or cancel active)
  const handleCancelFromDetail = useCallback(async (sub) => {
    const label = sub.status === 'pending' ? 'Withdraw this subscription request?' : 'Cancel this subscription?';
    if (!window.confirm(label)) return;
    try {
      await updateSubscriptionStatus(sub.id, 'cancelled', sub.planId);
      toast.success(sub.status === 'pending' ? 'Request withdrawn.' : 'Subscription cancelled.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel.');
    }
  }, []);

  const handleSubmitReview = useCallback(async ({ rating, comment }) => {
    if (!currentUser) { navigate('/login'); return; }
    await createReview({ customerId: currentUser.uid, customerName: userDoc?.name || 'Customer', providerId, planId: null, rating, comment });
    toast.success('Review submitted!');
    await fetchReviews();
  }, [currentUser, userDoc, providerId, navigate, fetchReviews]);

  const handleEditReview   = useCallback(async (reviewId, data) => { await updateReview(reviewId, { ...data, providerId }); toast.success('Updated!'); await fetchReviews(); }, [providerId, fetchReviews]);
  const handleDeleteReview = useCallback(async (reviewId) => { await deleteReview(reviewId, providerId); toast.success('Deleted'); await fetchReviews(); }, [providerId, fetchReviews]);

  if (provLoading) return <div className="page-container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}><Spinner size="lg" /></div>;
  if (provError)   return <div className="page-container" style={{ paddingTop: '5rem' }}><ErrorMessage message={provError} /></div>;

  const isOwnProfile = currentUser?.uid === providerId;

  // subscribeAction: what the subscribe button does.
  // Use !== 'provider' instead of === 'customer' so that if userDoc is
  // still loading (userRole === null), we don't accidentally return null
  // and make the button silently do nothing.
  const subscribeAction =
    !currentUser                                    ? () => navigate('/login')
    : userRole === 'provider' || isOwnProfile       ? null
    : handleSubscribe;   // customer OR role still loading

  // Allow any logged-in user who is NOT a provider to write reviews.
  // Use !== 'provider' (not === 'customer') so that if userDoc is still
  // loading (userRole === null), the form still shows instead of hiding.
  const canReview = !!currentUser && !authLoading && userRole !== 'provider' && !isOwnProfile;
  const coverImg  = getProviderCoverImage(provider.cuisineTypes || [], providerId, provider.coverImageUrl || '');

  return (
    <div>
      {/* ══════════════════════════════════════════════════
          BANNER HEADER (Zomato style)
      ══════════════════════════════════════════════════ */}
      <div className="provider-banner">
        <img src={coverImg} alt={provider.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80'; }} />
        <div className="provider-banner-overlay" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: '1.25rem', left: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '.4rem',
            background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(6px)',
            border: 'none', borderRadius: '999px', padding: '.45rem 1rem',
            cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, color: 'var(--ink-2)',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Provider info overlay */}
        <div className="provider-banner-content page-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '84px', height: '84px', flexShrink: 0,
              borderRadius: '50%',
              padding: '3px',
              background: 'linear-gradient(135deg, rgba(255,255,255,.98), rgba(255,220,185,.9))',
              boxShadow: '0 10px 24px rgba(0,0,0,.28)',
              position: 'relative',
              backdropFilter: 'blur(2px)',
            }}>
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,.8)',
                background: 'var(--bg-warm)',
              }}>
                <UserAvatar name={provider.name} size={78} />
              </div>
              <span style={{
                position: 'absolute', right: '4px', bottom: '4px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#2ECC71', border: '2px solid #fff',
                boxShadow: '0 0 0 2px rgba(46,204,113,.25)',
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)',
                marginBottom: '.25rem',
              }}>
                {provider.name}
              </h1>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                {provider.cuisineTypes?.length > 0 && (
                  <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.82)', fontWeight: 500 }}>
                    {provider.cuisineTypes.join(' • ')}
                  </span>
                )}
                {provider.location && (
                  <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.72)', display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                    <MapPin size={12} /> {provider.location}
                  </span>
                )}
                <span style={{
                  padding: '.18rem .6rem', borderRadius: '999px', fontSize: '.75rem', fontWeight: 700,
                  background: provider.vegOnly ? 'rgba(39,174,96,.25)' : 'rgba(231,76,60,.2)',
                  color: provider.vegOnly ? '#6EE0A0' : '#FF9090',
                  border: `1px solid ${provider.vegOnly ? 'rgba(39,174,96,.35)' : 'rgba(231,76,60,.3)'}`,
                }}>
                  {provider.vegOnly
                    ? <><Leaf size={14} style={{ color: 'var(--herb)' }} /> Veg Only</>
                    : <><Drumstick size={14} style={{ color: 'var(--terracotta)' }} /> Non-Veg</>}
                </span>
              </div>
            </div>

            {/* Rating + Reviews button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
              {provider.avgRating > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  background: 'rgba(255,255,255,.95)', borderRadius: '999px',
                  padding: '.3rem .85rem',
                }}>
                  <Star size={14} fill="#C98B2A" style={{ color: '#C98B2A' }} />
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>
                    {provider.avgRating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>({provider.ratingCount})</span>
                </div>
              )}
              <button
                onClick={scrollToReviews}
                id="view-reviews-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,.25)', borderRadius: '999px',
                  padding: '.3rem .85rem', cursor: 'pointer',
                  fontSize: '.78rem', color: '#fff', fontWeight: 600, fontFamily: 'Nunito',
                }}
              >
                <MessageSquare size={12} /> {reviews.length} Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABS + CONTENT
      ══════════════════════════════════════════════════ */}
      {/* Sticky tab strip */}
      <div style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-lt)',
        position: 'sticky', top: '72px', zIndex: 20,
        boxShadow: '0 2px 6px rgba(42,26,14,.04)',
      }}>
        <div className="page-container">
          <div className="tab-strip">
            <button
              className={`tab-item ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                <UtensilsCrossed size={15} />
                Menu & Plans ({plans.length})
              </span>
            </button>
            <button
              className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                <Star size={15} />
                Reviews ({reviews.length})
              </span>
            </button>
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                style={{
                  marginLeft: 'auto', padding: '.7rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  fontSize: '.85rem', fontWeight: 700, color: 'var(--herb)',
                  fontFamily: 'Nunito', textDecoration: 'none',
                }}
              >
                <Phone size={14} /> {provider.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-[1fr_320px]">

          {/* ── LEFT: Plans / Reviews ── */}
          <div>
            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div>
                {provider.description?.trim().length > 20 && provider.description.includes(' ') && (
                  <div style={{
                    background: 'var(--bg-warm)', borderRadius: 'var(--r-lg)',
                    padding: '1rem 1.25rem', marginBottom: '1.5rem',
                    border: '1px solid var(--border-lt)',
                  }}>
                    <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', lineHeight: 1.7 }}>
                      ℹ️ {provider.description}
                    </p>
                  </div>
                )}

                <h2 style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 900,
                  fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
                    <UtensilsCrossed size={16} />
                    Available Plans
                  </span>
                </h2>

                {plansLoading && <Spinner className="py-8" />}
                {!plansLoading && plans.length === 0 && (
                  <EmptyState icon={ChefHat} title="No plans yet" message="This provider hasn't set up any plans yet." />
                )}

                {/* Plans as horizontal food cards */}
                {!plansLoading && plans.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {plans.map((plan) => {
                      const mySub = subscribedPlansMap.get(plan.id) ?? null;
                      return (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          horizontal={true}
                          mySubscription={mySub}
                          isSubscribing={subscribingPlanId === plan.id}
                          onSubscribe={subscribeAction}
                          onCancel={mySub ? handleCancelFromDetail : null}
                          subscribeMode={!currentUser ? 'guest' : userRole === 'provider' || isOwnProfile ? 'provider' : 'customer'}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div ref={reviewsRef}>
                <h2 style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 900,
                  fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
                    <Star size={16} />
                    Customer Reviews
                  </span>
                  {provider.avgRating > 0 && (
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--mustard)' }}>
                      {provider.avgRating.toFixed(1)}
                    </span>
                  )}
                </h2>

                {canReview && !myReview && (
                  <div style={{ marginBottom: '1.5rem' }}><ReviewForm onSubmit={handleSubmitReview} /></div>
                )}

                {reviewsLoading && <Spinner className="py-6" />}
                {!reviewsLoading && reviews.length === 0 && (
                  <EmptyState title="No reviews yet"
                    message={canReview ? 'Be the first to review. Use the form above.' : 'Sign in to leave the first review.'} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review}
                      currentUserId={currentUser?.uid}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sticky info sidebar ── */}
          <div className="sticky-sidebar hidden lg:block">
            <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
              {/* Provider stats */}
              <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '1rem' }}>
                Kitchen Info
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {provider.vegOnly !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--herb-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Leaf size={16} style={{ color: 'var(--herb)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Food Type</p>
                      <p style={{ fontSize: '.875rem', color: 'var(--ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
                        {provider.vegOnly ? <Leaf size={14} style={{ color: 'var(--herb)' }} /> : <Drumstick size={14} style={{ color: 'var(--terracotta)' }} />}
                        {provider.vegOnly ? 'Veg Only' : 'Veg + Non-Veg'}
                      </p>
                    </div>
                  </div>
                )}

                {provider.cuisineTypes?.filter((c) => CUISINE_TYPES.includes(c)).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--terracotta-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-warm)', border: '1px solid var(--border)', color: 'var(--ink-3)' }}>
                        <UtensilsCrossed size={14} />
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Cuisines</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                        {provider.cuisineTypes
                          .filter((c) => CUISINE_TYPES.includes(c))
                          .map((c) => (
                            <span key={c} style={{
                              padding: '.15rem .55rem', borderRadius: '999px',
                              fontSize: '.72rem', fontWeight: 700, fontFamily: 'Nunito',
                              background: 'var(--terracotta-pale)', color: 'var(--terracotta)',
                            }}>{c}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {provider.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={16} style={{ color: 'var(--ink-3)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Location</p>
                      <p style={{ fontSize: '.875rem', color: 'var(--ink)', fontWeight: 500 }}>{provider.location}</p>
                    </div>
                  </div>
                )}

                {provider.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={16} style={{ color: 'var(--ink-3)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Phone</p>
                      <a href={`tel:${provider.phone}`} style={{ fontSize: '.875rem', color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>{provider.phone}</a>
                    </div>
                  </div>
                )}

                {provider.avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--mustard-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Star size={16} fill="#C98B2A" style={{ color: '#C98B2A' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Rating</p>
                      <p style={{ fontSize: '.875rem', color: 'var(--ink)', fontWeight: 700 }}>
                        {provider.avgRating.toFixed(1)} <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>/ 5</span>
                        <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--ink-3)', marginLeft: '.3rem' }}>({provider.ratingCount} reviews)</span>
                      </p>
                      <StarRating value={Math.round(provider.avgRating)} size={14} />
                    </div>
                  </div>
                )}
              </div>

              <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border-lt)' }} />

              {/* CTA */}
              {!currentUser ? (
                <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Login to Subscribe
                </button>
              ) : userRole === 'customer' && !isOwnProfile ? (
                <div style={{ fontSize: '.82rem', color: 'var(--ink-3)', textAlign: 'center', padding: '.5rem 0' }}>
                  Click "Subscribe" on any plan above
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
