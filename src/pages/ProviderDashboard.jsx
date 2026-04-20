// src/pages/ProviderDashboard.jsx — Swiggy-style provider dashboard

import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, UtensilsCrossed, Users, TrendingUp, ChefHat, Edit, CheckCircle, IndianRupee, BellRing, Clock, CheckCheck, XCircle, Upload, ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTiffinPlans } from '../hooks/useTiffinPlans';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { createPlan, updatePlan, deletePlan, upsertProviderProfile, getProvider } from '../services/providerService';
import { approveSubscription, rejectSubscription, vendorCancelSubscription } from '../services/subscriptionService';
import PlanCard from '../components/provider/PlanCard';
import PlanForm from '../components/provider/PlanForm';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';
import { CUISINE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

const TABS = ['overview', 'plans', 'requests', 'subscribers', 'profile'];

export default function ProviderDashboard() {
  const { currentUser, userDoc } = useAuth();
  const uid = currentUser?.uid;

  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useTiffinPlans(uid);
  const { subscriptions } = useSubscriptions({ providerId: uid });

  const [provider,       setProvider]       = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileForm,setShowProfileForm] = useState(false);
  const [profileForm,    setProfileForm]     = useState({ description: '', cuisineTypes: [], vegOnly: true, phone: '', coverImageUrl: '' });
  const [savingProfile,  setSavingProfile]   = useState(false);
  const [planFormOpen,   setPlanFormOpen]    = useState(false);
  const [editingPlan,    setEditingPlan]     = useState(null);
  const [activeTab,      setActiveTab]       = useState('overview');

  useEffect(() => {
    if (!uid) return;
    getProvider(uid).then((p) => {
      setProvider(p);
      if (p) setProfileForm({ description: p.description || '', cuisineTypes: p.cuisineTypes || [], vegOnly: p.vegOnly ?? true, phone: p.phone || '', coverImageUrl: p.coverImageUrl || '' });
      setProfileLoading(false);
    });
  }, [uid]);

  const pendingRequests  = useMemo(() => subscriptions.filter((s) => s.status === 'pending'),  [subscriptions]);
  const activeCount      = subscriptions.filter((s) => s.status === 'active').length;

  const stats = useMemo(() => ({
    plans:       plans.length,
    activeCount,
    totalCap:    plans.reduce((s, p) => s + (p.maxSubscribers || 0), 0),
    currentSubs: plans.reduce((s, p) => s + (p.currentSubscribers || 0), 0),
    estMonthly:  plans.reduce((s, p) => s + (p.currentSubscribers || 0) * (p.pricePerMonth || p.pricePerDay * 26 || 0), 0),
  }), [plans, activeCount]);

  const toggleCuisine = (c) => setProfileForm((f) => ({
    ...f, cuisineTypes: f.cuisineTypes.includes(c) ? f.cuisineTypes.filter((x) => x !== c) : [...f.cuisineTypes, c],
  }));

  const handleStoreCoverFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Store image is too large (max 2MB).'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((f) => ({ ...f, coverImageUrl: String(reader.result || '') }));
      toast.success('Store image selected.');
    };
    reader.onerror = () => toast.error('Could not read this image.');
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.description.trim()) { toast.error('Please add a description.'); return; }
    try {
      setSavingProfile(true);
      await upsertProviderProfile(uid, { ...profileForm, name: userDoc?.name || '', location: userDoc?.location || '', isProfileComplete: true });
      setProvider(await getProvider(uid));
      setShowProfileForm(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const handleSavePlan = async (formData) => {
    if (editingPlan) { await updatePlan(editingPlan.id, formData); toast.success('Plan updated!'); }
    else             { await createPlan(uid, formData);            toast.success('Plan created!'); }
    await refetchPlans();
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    try { await deletePlan(planId); toast.success('Plan deleted'); await refetchPlans(); }
    catch (err) { toast.error(err.message); }
  };

  const handleApprove = async (sub) => {
    try {
      await approveSubscription(sub.id, sub.customerId, sub.planTitle, uid);
      toast.success(`Approved ${sub.customerName}'s request!`);
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async (sub) => {
    if (!window.confirm(`Reject ${sub.customerName}'s request for "${sub.planTitle}"?`)) return;
    try {
      await rejectSubscription(sub.id, sub.planId, sub.customerId, sub.planTitle);
      toast.success(`Request rejected.`);
    } catch (err) { toast.error(err.message); }
  };

  const handleVendorCancel = async (sub) => {
    if (!window.confirm(
      `Cancel ${sub.customerName}'s active subscription to "${sub.planTitle}"?\nThey will be notified immediately.`
    )) return;
    try {
      await vendorCancelSubscription(
        sub.id,
        sub.planId,
        sub.customerId,
        sub.planTitle,
        userDoc?.name || 'Your provider',
      );
      toast.success(`Subscription cancelled for ${sub.customerName}.`);
    } catch (err) { toast.error(err.message); }
  };

  if (profileLoading) return <div className="page-container" style={{ paddingTop: '5rem' }}><Spinner size="lg" /></div>;

  const STAT_CARDS = [
    { label: 'Total Plans',        value: stats.plans,       color: 'var(--terracotta)', bg: 'var(--terracotta-pale)', icon: UtensilsCrossed },
    { label: 'Active Subscribers', value: stats.activeCount, color: 'var(--ok)',         bg: 'var(--ok-bg)',           icon: Users },
    { label: 'Pending Requests',   value: pendingRequests.length, color: '#D97706', bg: '#FEF3C7', icon: BellRing },
    { label: 'Est. Monthly ₹',     value: stats.estMonthly > 0 ? `₹${stats.estMonthly.toLocaleString()}` : '—', color: '#7C3AED', bg: '#F3EFFE', icon: IndianRupee },
  ];

  const TAB_LABELS = {
    overview:    <><TrendingUp size={14} /> Overview</>,
    plans:       <><UtensilsCrossed size={14} /> Plans</>,
    requests:    <><BellRing size={14} /> Requests{pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}</>,
    subscribers: <><Users size={14} /> Subscribers</>,
    profile:     <><Edit size={14} /> Profile</>,
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #2A1A0E, #5C2E14)', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--terracotta-light)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'Nunito', marginBottom: '.3rem' }}>
                Provider Dashboard
              </p>
              <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#fff' }}>
                {userDoc?.name?.split(' ')[0]}'s Kitchen
              </h1>
              {!provider?.isProfileComplete && (
                <p style={{ fontSize: '.8rem', color: 'rgba(255,200,100,.85)', marginTop: '.35rem' }}>
                  Complete your profile so customers can find you
                </p>
              )}
            </div>
            <button
              onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }}
              className="btn-primary"
              id="create-plan-btn"
              style={{ flexShrink: 0 }}
            >
              <PlusCircle size={17} /> New Tiffin Plan
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab strip ── */}
        <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-lt)', position: 'sticky', top: '72px', zIndex: 20 }}>
        <div className="page-container">
          <div className="tab-strip scroll-row" style={{ overflowX: 'auto', paddingBottom: '0' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              {STAT_CARDS.map((s) => (
                <div key={s.label} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '.85rem',
                  }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: 'var(--ink)', lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent plans preview */}
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem' }}>
              Your Plans
            </h2>
            {plans.length === 0 ? (
              <EmptyState icon={UtensilsCrossed} title="No plans yet"
                message="Create your first tiffin plan."
                action={<button onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }} className="btn-primary"><PlusCircle size={16} /> Create Plan</button>} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {plans.slice(0, 4).map((plan) => (
                  <PlanCard key={plan.id} plan={plan}
                    onEdit={(p) => { setEditingPlan(p); setPlanFormOpen(true); }}
                    onDelete={handleDeletePlan} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PLANS TAB ══ */}
        {activeTab === 'plans' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
                All Tiffin Plans
              </h2>
              <button onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }} className="btn-primary">
                <PlusCircle size={16} /> Add Plan
              </button>
            </div>
            {plansLoading && <Spinner className="py-8" />}
            {plansError   && <ErrorMessage message={plansError} onRetry={refetchPlans} />}
            {!plansLoading && !plansError && plans.length === 0 && (
              <EmptyState icon={UtensilsCrossed} title="No plans yet"
                message="Create your first tiffin plan to start getting subscribers."
                action={<button onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }} className="btn-primary"><PlusCircle size={16} /> Create First Plan</button>} />
            )}
            {!plansLoading && !plansError && plans.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan}
                    onEdit={(p) => { setEditingPlan(p); setPlanFormOpen(true); }}
                    onDelete={handleDeletePlan} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ REQUESTS TAB ══ */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
                Subscription Requests
              </h2>
              {pendingRequests.length > 0 && (
                <span style={{
                  background: '#FEF3C7', color: '#D97706',
                  fontFamily: 'Nunito', fontWeight: 800, fontSize: '.75rem',
                  padding: '.2rem .65rem', borderRadius: '999px',
                  border: '1px solid rgba(217,119,6,.25)',
                }}>
                  {pendingRequests.length} pending
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                borderRadius: 'var(--r-xl)', padding: '3.5rem 2rem', textAlign: 'center',
              }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-warm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--ok)' }}>
                  <CheckCheck size={22} />
                </div>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, color: 'var(--ink)', fontSize: '1.1rem', marginBottom: '.4rem' }}>
                  All caught up!
                </h3>
                <p style={{ color: 'var(--ink-3)', fontSize: '.875rem' }}>
                  No pending subscription requests right now.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRequests.map((sub) => (
                  <div key={sub.id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderLeft: '4px solid #D97706',
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem 1.5rem',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.2rem', color: '#fff',
                    }}>
                      {(sub.customerName || '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.2rem' }}>
                        <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>
                          {sub.customerName}
                        </p>
                        <span style={{
                          fontSize: '.68rem', fontWeight: 700, fontFamily: 'Nunito',
                          background: '#FEF3C7', color: '#D97706',
                          padding: '.1rem .5rem', borderRadius: '999px',
                          border: '1px solid rgba(217,119,6,.2)',
                        }}>
                          Pending approval
                        </span>
                      </div>
                      <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginBottom: '.2rem' }}>
                        wants to subscribe to <strong>"{sub.planTitle}"</strong>
                      </p>
                      <p style={{ fontSize: '.75rem', color: 'var(--ink-4)' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: '.25rem' }} />
                        {sub.startDate?.toDate?.()?.toLocaleString?.('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        }) ?? 'Just now'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '.65rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleReject(sub)}
                        id={`reject-btn-${sub.id}`}
                        style={{
                          padding: '.55rem 1.1rem',
                          borderRadius: '.75rem',
                          border: '1.5px solid rgba(192,57,43,.3)',
                          background: '#FEF0F0',
                          color: '#C0392B',
                          fontFamily: 'Nunito', fontWeight: 800, fontSize: '.82rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FADBD8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF0F0'; }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(sub)}
                        id={`approve-btn-${sub.id}`}
                        style={{
                          padding: '.55rem 1.25rem',
                          borderRadius: '.75rem',
                          border: '1.5px solid rgba(39,174,96,.35)',
                          background: 'linear-gradient(135deg, #27AE60, #229954)',
                          color: '#fff',
                          fontFamily: 'Nunito', fontWeight: 800, fontSize: '.82rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem',
                          boxShadow: '0 4px 12px rgba(39,174,96,.25)',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(39,174,96,.35)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(39,174,96,.25)'; }}
                      >
                        <CheckCheck size={14} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SUBSCRIBERS TAB ══ */}
        {activeTab === 'subscribers' && (
          <div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
              Subscribers ({subscriptions.length})
            </h2>
            {subscriptions.length === 0 ? (
              <EmptyState icon={Users} title="No subscribers yet" message="When customers subscribe to your plans, they'll appear here." />
            ) : (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '.875rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-lt)', background: 'var(--bg-warm)' }}>
                        {['Customer', 'Plan', 'Status', 'Since', 'Action'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '.85rem 1.1rem', fontSize: '.72rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-lt)', transition: 'background .12s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-warm)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '.8rem 1.1rem', color: 'var(--ink)', fontWeight: 600 }}>{sub.customerName}</td>
                          <td style={{ padding: '.8rem 1.1rem', color: 'var(--ink-2)' }}>{sub.planTitle}</td>
                          <td style={{ padding: '.8rem 1.1rem' }}><Badge variant={sub.status}>{sub.status}</Badge></td>
                          <td style={{ padding: '.8rem 1.1rem', color: 'var(--ink-3)', fontSize: '.8rem' }}>
                            {sub.startDate?.toDate?.()?.toLocaleDateString?.('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}
                          </td>
                          {/* Cancel button — only for active or paused subscriptions */}
                          <td style={{ padding: '.6rem 1.1rem' }}>
                            {(sub.status === 'active' || sub.status === 'paused') ? (
                              <button
                                onClick={() => handleVendorCancel(sub)}
                                id={`vendor-cancel-${sub.id}`}
                                style={{
                                  padding: '.35rem .85rem',
                                  borderRadius: '.6rem',
                                  border: '1.5px solid rgba(192,57,43,.3)',
                                  background: '#FEF0F0',
                                  color: '#C0392B',
                                  fontFamily: 'Nunito', fontWeight: 800, fontSize: '.75rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem',
                                  transition: 'all .15s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#FADBD8'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF0F0'; }}
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            ) : (
                              <span style={{ fontSize: '.75rem', color: 'var(--ink-4)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
                  Provider Profile
                </h2>
                <Badge variant={provider?.isProfileComplete ? 'active' : 'paused'}>
                  {provider?.isProfileComplete ? <><CheckCircle size={10} /> Complete</> : 'Incomplete'}
                </Badge>
              </div>
              <button onClick={() => setShowProfileForm((s) => !s)} id="edit-profile-btn"
                className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem' }}>
                <Edit size={14} /> {showProfileForm ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!provider?.isProfileComplete && !showProfileForm && (
              <div style={{ padding: '1rem 1.25rem', background: '#FEF4E6', border: '1px solid #F5D0A0', borderRadius: 'var(--r-lg)', marginBottom: '1.25rem', color: '#E67E22', fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <Clock size={16} /> Complete your profile so customers can find and trust you.
              </div>
            )}

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
              {showProfileForm ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label className="label">About your tiffin service *</label>
                    <textarea className="input" style={{ minHeight: '90px', resize: 'none' }}
                      placeholder="Tell customers what makes your food special…"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="label">Phone number</label>
                      <input className="input" type="tel" placeholder="+91 9876543210"
                        value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Food type</label>
                      <select className="input" value={String(profileForm.vegOnly)}
                        onChange={(e) => setProfileForm((f) => ({ ...f, vegOnly: e.target.value === 'true' }))}>
                        <option value="true">Veg Only</option>
                        <option value="false">Veg + Non-Veg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Store cover image (Browse page)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                      <label
                        htmlFor="store-cover-upload"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                          padding: '.45rem .9rem', borderRadius: '999px',
                          border: '1.5px solid var(--border)', cursor: 'pointer',
                          background: 'var(--bg-surface)', fontWeight: 700, fontSize: '.8rem',
                          color: 'var(--ink-2)', fontFamily: 'Nunito',
                        }}
                      >
                        <Upload size={13} /> Upload cover
                      </label>
                      <input
                        id="store-cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStoreCoverFile(e.target.files?.[0])}
                        style={{ display: 'none' }}
                      />
                      {profileForm.coverImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm((f) => ({ ...f, coverImageUrl: '' }))}
                          className="btn-secondary"
                          style={{ fontSize: '.75rem', padding: '.35rem .7rem' }}
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '.72rem', color: 'var(--ink-4)', marginTop: '.3rem' }}>
                      This image is shown on Browse Tiffins and your provider page banner.
                    </p>
                    {profileForm.coverImageUrl && (
                      <div style={{
                        marginTop: '.65rem', borderRadius: 'var(--r-md)', overflow: 'hidden',
                        border: '1px solid var(--border)', maxWidth: '380px',
                      }}>
                        <img
                          src={profileForm.coverImageUrl}
                          alt="Store cover preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Cuisine types</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                      {CUISINE_TYPES.map((c) => (
                        <button key={c} type="button" onClick={() => toggleCuisine(c)}
                          style={{
                            padding: '.35rem .85rem', borderRadius: '999px', fontSize: '.82rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all .15s', fontFamily: 'Nunito, sans-serif',
                            border: `1.5px solid ${profileForm.cuisineTypes.includes(c) ? 'var(--terracotta)' : 'var(--border)'}`,
                            background: profileForm.cuisineTypes.includes(c) ? 'var(--terracotta-pale)' : 'var(--bg-surface)',
                            color: profileForm.cuisineTypes.includes(c) ? 'var(--terracotta)' : 'var(--ink-3)',
                          }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button type="submit" className="btn-primary" disabled={savingProfile}>
                      {savingProfile ? 'Saving…' : 'Save Profile'}
                    </button>
                    <button type="button" onClick={() => setShowProfileForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '.9rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p className="label">Description</p>
                    <p style={{ color: 'var(--ink-2)', marginTop: '.25rem', lineHeight: 1.7 }}>{provider?.description || '—'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p className="label" style={{ marginBottom: '.45rem' }}>Store Cover</p>
                    {provider?.coverImageUrl ? (
                      <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img
                          src={provider.coverImageUrl}
                          alt="Store cover"
                          style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <p style={{ color: 'var(--ink-3)' }}>
                        <ImageIcon size={13} style={{ display: 'inline', marginRight: '.35rem' }} />
                        Using auto cuisine-based cover image
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="label">Food type</p>
                    <p style={{ color: 'var(--ink-2)' }}>{provider?.vegOnly ? 'Veg Only' : 'Veg + Non-Veg'}</p>
                  </div>
                  <div>
                    <p className="label">Phone</p>
                    <p style={{ color: 'var(--ink-2)' }}>{provider?.phone || '—'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p className="label" style={{ marginBottom: '.5rem' }}>Cuisines</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                      {provider?.cuisineTypes?.length
                        ? provider.cuisineTypes.map((c) => <Badge key={c} variant="orange">{c}</Badge>)
                        : <span style={{ color: 'var(--ink-3)' }}>Not set</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PlanForm
        key={`${planFormOpen ? 'open' : 'closed'}-${editingPlan?.id ?? 'new'}`}
        isOpen={planFormOpen}
        onClose={() => { setPlanFormOpen(false); setEditingPlan(null); }}
        onSave={handleSavePlan}
        initialData={editingPlan}
      />
    </div>
  );
}
