// src/components/provider/PlanForm.jsx — Premium "Add Thali" form

import { useState } from 'react';
import { X, ImageIcon, Leaf, Drumstick, Clock, Users, CalendarDays, UtensilsCrossed, Tag, Info, Upload } from 'lucide-react';
import { DELIVERY_DAYS, DELIVERY_TIME_WINDOWS } from '../../utils/constants';
import { PLAN_FOOD_IMAGES, getPlanImage } from '../../utils/constants';

const DEFAULT_FORM = {
  title: '', description: '', pricePerDay: '', pricePerMonth: '',
  isVeg: true, deliveryDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  deliveryTimeWindow: '', maxSubscribers: 10,
  weeklyMenu: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
  imageIndex: null,
  imageSelectionMode: 'auto',
  imageUrl: '',
};

const FOOD_TYPE_OPTIONS = [
  { value: true,  label: 'Pure Veg',  Icon: Leaf,      color: '#27AE60', bg: '#E8F4ED', border: 'rgba(39,174,96,.3)' },
  { value: false, label: 'Non-Veg',   Icon: Drumstick, color: '#C0392B', bg: '#FDEAEA', border: 'rgba(192,57,43,.3)' },
];

const SECTION = ({ icon, title, accent, children }) => {
  const IconComponent = icon;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '.5rem',
      marginBottom: '.875rem', paddingBottom: '.5rem',
      borderBottom: '2px solid var(--border-lt)',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: accent || 'var(--terracotta-pale)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconComponent size={14} style={{ color: 'var(--terracotta)' }} />
      </div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.875rem', color: 'var(--ink)', letterSpacing: '.01em' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
  );
};

export default function PlanForm({ isOpen, onClose, onSave, initialData = null }) {
  const [form,   setForm]   = useState(() => (
    initialData
      ? {
          ...DEFAULT_FORM,
          ...initialData,
          imageIndex: initialData.imageIndex ?? null,
          imageSelectionMode: initialData.imageSelectionMode ?? 'auto',
        }
      : DEFAULT_FORM
  ));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [tab,    setTab]    = useState('basic'); // 'basic' | 'delivery' | 'menu'

  const set       = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDay = (day) => setForm((f) => ({
    ...f,
    deliveryDays: f.deliveryDays.includes(day)
      ? f.deliveryDays.filter((d) => d !== day)
      : [...f.deliveryDays, day],
  }));
  const setMenuDay = (day, v) => setForm((f) => ({ ...f, weeklyMenu: { ...f.weeklyMenu, [day]: v } }));
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      setTab('basic');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Please upload up to 2MB.');
      setTab('basic');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      set('imageUrl', String(reader.result || ''));
      set('imageSelectionMode', 'upload');
      set('imageIndex', null);
      setError('');
    };
    reader.onerror = () => {
      setError('Could not read image file. Please try another one.');
      setTab('basic');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim())                  { setError('Plan title is required.'); setTab('basic'); return; }
    if (!form.pricePerDay || +form.pricePerDay <= 0) { setError('Enter a valid price per day.'); setTab('basic'); return; }
    if (form.deliveryDays.length === 0)      { setError('Select at least one delivery day.'); setTab('delivery'); return; }
    try {
      setSaving(true);
      await onSave({
        ...form,
        imageUrl: form.imageUrl || '',
        imageSelectionMode: form.imageSelectionMode || 'auto',
        imageIndex:
          form.imageSelectionMode === 'manual' && Number.isInteger(form.imageIndex)
            ? form.imageIndex
            : null,
        pricePerDay:    +form.pricePerDay,
        pricePerMonth:  form.pricePerMonth ? +form.pricePerMonth : 0,
        maxSubscribers: +form.maxSubscribers || 10,
      });
      onClose();
    } catch (err) { setError(err.message || 'Failed to save plan.'); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  const previewImg = getPlanImage({
    imageUrl: form.imageUrl,
    imageIndex: form.imageIndex,
    imageSelectionMode: form.imageSelectionMode,
    title: form.title,
    description: form.description,
  });
  const TABS = [
    { id: 'basic',    label: 'Basic Info',   icon: UtensilsCrossed },
    { id: 'delivery', label: 'Delivery',     icon: Clock },
    { id: 'menu',     label: 'Weekly Menu',  icon: CalendarDays },
  ];

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(20,10,5,.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      {/* Modal box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '1.5rem',
          width: '100%', maxWidth: '680px',
          boxShadow: '0 32px 80px rgba(0,0,0,.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* ── HERO HEADER ── */}
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
          {/* Cover image */}
          <img
            src={previewImg}
            alt="Plan preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all .4s ease' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'; }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(20,10,5,.15) 0%, rgba(20,10,5,.75) 100%)',
          }} />

          {/* Image picker strip */}
          <div style={{
            position: 'absolute', bottom: '1rem', left: '1rem',
            display: 'flex', gap: '.4rem',
            maxWidth: 'calc(100% - 170px)',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingRight: '.35rem',
            scrollbarWidth: 'thin',
          }}>
            {PLAN_FOOD_IMAGES.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  set('imageIndex', i);
                  set('imageSelectionMode', 'manual');
                  set('imageUrl', '');
                }}
                title="Pick this photo"
                style={{
                  width: '36px', height: '36px', borderRadius: '.5rem',
                  overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer',
                  outline: form.imageIndex === i ? '2.5px solid #fff' : '2px solid transparent',
                  boxShadow: form.imageIndex === i ? '0 0 0 1px var(--terracotta)' : 'none',
                  transition: 'outline .15s, box-shadow .15s',
                  flexShrink: 0,
                }}
              >
                <img
                  src={img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </button>
            ))}
          </div>

          {/* Title overlay */}
          <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '.2rem .7rem', marginBottom: '.35rem' }}>
                <UtensilsCrossed size={11} style={{ color: '#fff' }} />
                <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#fff', fontFamily: 'Nunito', letterSpacing: '.06em' }}>
                  {initialData ? 'EDIT PLAN' : 'NEW TIFFIN PLAN'}
                </span>
              </div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.35rem', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)', lineHeight: 1.2 }}>
                {form.title ? `"${form.title}"` : initialData ? 'Edit this plan' : 'Create your thali plan'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={15} style={{ color: '#fff' }} />
            </button>
          </div>

          {/* Photo select label */}
          <div style={{
            position: 'absolute', bottom: '1rem', right: '1rem',
            display: 'flex', alignItems: 'center', gap: '.3rem',
            background: 'rgba(20,10,5,.35)',
            border: '1px solid rgba(255,255,255,.2)',
            backdropFilter: 'blur(6px)',
            borderRadius: '999px',
            padding: '.25rem .5rem',
            pointerEvents: 'none',
          }}>
            <ImageIcon size={11} style={{ color: 'rgba(255,255,255,.7)' }} />
            <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.7)', fontFamily: 'Nunito', fontWeight: 600 }}>
              {form.imageUrl ? 'Using your uploaded photo' : 'Pick a photo'}
            </span>
          </div>
        </div>

        {/* ── TAB STRIP ── */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-lt)', background: 'var(--bg-surface)', flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '.7rem .5rem', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.82rem',
                color: tab === t.id ? 'var(--terracotta)' : 'var(--ink-3)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--terracotta)' : 'transparent'}`,
                marginBottom: '-2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem',
                transition: 'color .14s, border-color .14s',
              }}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div style={{
            padding: '.7rem 1.25rem',
            background: '#FEF0F0', borderBottom: '1px solid rgba(192,57,43,.2)',
            display: 'flex', alignItems: 'center', gap: '.5rem',
            fontSize: '.82rem', color: '#C0392B', fontWeight: 600, flexShrink: 0,
          }}>
            <Info size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── FORM BODY (scrollable) ── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

          {/* ═══ TAB: BASIC INFO ═══ */}
          {tab === 'basic' && (
            <div>
              <SECTION icon={UtensilsCrossed} title="Plan Details">
                {/* Title */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Plan Name *</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. Rajasthani Dal-Baati Thali, South Indian Combo…"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    required
                    style={{ fontSize: '1rem', fontWeight: 500 }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '.5rem' }}>
                  <label className="label">Describe your thali</label>
                  <textarea
                    className="input"
                    style={{ minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
                    placeholder="What's special about this plan? Mention ingredients, taste, nutrition…"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '.9rem' }}>
                  <label className="label">Plan image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                    <label
                      htmlFor="plan-image-upload"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                        padding: '.5rem .9rem', borderRadius: '999px',
                        border: '1.5px solid var(--border)', cursor: 'pointer',
                        background: 'var(--bg-surface)', fontWeight: 700, fontSize: '.8rem',
                        color: 'var(--ink-2)', fontFamily: 'Nunito',
                      }}
                    >
                      <Upload size={13} /> Upload from device
                    </label>
                    <input
                      id="plan-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                      style={{ display: 'none' }}
                    />
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          set('imageUrl', '');
                          set('imageIndex', null);
                          set('imageSelectionMode', 'auto');
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '.75rem', padding: '.35rem .7rem' }}
                      >
                        Remove uploaded image
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '.7rem', color: 'var(--ink-4)', marginTop: '.35rem' }}>
                    Upload your own image. If you skip this, we auto-pick one based on your plan description.
                  </p>
                </div>
              </SECTION>

              {/* Food type */}
              <SECTION icon={Leaf} title="Food Type">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  {FOOD_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => set('isVeg', opt.value)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--r-lg)',
                        border: `2px solid ${form.isVeg === opt.value ? opt.border : 'var(--border-lt)'}`,
                        background: form.isVeg === opt.value ? opt.bg : 'var(--bg-page)',
                        cursor: 'pointer',
                        transition: 'all .15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem',
                      }}
                    >
                      <span style={{
                        width: 42, height: 42, borderRadius: '999px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: form.isVeg === opt.value ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.35)',
                        border: `1px solid ${form.isVeg === opt.value ? opt.border : 'rgba(0,0,0,.06)'}`,
                      }}>
                        <opt.Icon size={18} style={{ color: opt.color }} />
                      </span>
                      <span style={{
                        fontFamily: 'Nunito', fontWeight: 800, fontSize: '.875rem',
                        color: form.isVeg === opt.value ? opt.color : 'var(--ink-3)',
                      }}>
                        {opt.label}
                      </span>
                      {form.isVeg === opt.value && (
                        <span style={{
                          fontSize: '.68rem', fontWeight: 700,
                          color: opt.color, background: opt.bg,
                          padding: '.1rem .5rem', borderRadius: '999px',
                          border: `1px solid ${opt.border}`,
                        }}>
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </SECTION>

              {/* Pricing */}
              <SECTION icon={Tag} title="Pricing">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '.75rem' }}>
                  <div>
                    <label className="label">Price per Day (₹) *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito' }}>₹</span>
                      <input className="input" type="number" min="1" placeholder="80"
                        value={form.pricePerDay} onChange={(e) => set('pricePerDay', e.target.value)}
                        required style={{ paddingLeft: '2rem', fontWeight: 700, fontSize: '1.1rem' }} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Price per Month (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--ink-3)', fontWeight: 700, fontFamily: 'Nunito' }}>₹</span>
                      <input className="input" type="number" min="0" placeholder="1800"
                        value={form.pricePerMonth} onChange={(e) => set('pricePerMonth', e.target.value)}
                        style={{ paddingLeft: '2rem', fontWeight: 600 }} />
                    </div>
                    <p style={{ fontSize: '.7rem', color: 'var(--ink-4)', marginTop: '.25rem' }}>
                      {form.pricePerDay ? `Daily × 26 = ₹${+form.pricePerDay * 26} suggested` : 'Optional discount pricing'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="label">Max Subscribers (capacity)</label>
                  <div style={{ position: 'relative' }}>
                    <Users size={14} style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                    <input className="input" type="number" min="1" placeholder="10"
                      value={form.maxSubscribers} onChange={(e) => set('maxSubscribers', e.target.value)}
                      style={{ paddingLeft: '2.25rem' }} />
                  </div>
                  <p style={{ fontSize: '.7rem', color: 'var(--ink-4)', marginTop: '.25rem' }}>
                    Leave at 10 for unlimited — plan auto-closes when full
                  </p>
                </div>
              </SECTION>
            </div>
          )}

          {/* ═══ TAB: DELIVERY ═══ */}
          {tab === 'delivery' && (
            <div>
              <SECTION icon={Clock} title="Delivery Time Window">
                <select
                  className="input"
                  value={form.deliveryTimeWindow}
                  onChange={(e) => set('deliveryTimeWindow', e.target.value)}
                  style={{ fontSize: '.95rem' }}
                >
                  <option value="">Select your delivery window…</option>
                  {DELIVERY_TIME_WINDOWS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                {form.deliveryTimeWindow && (
                  <div style={{
                    marginTop: '.75rem', padding: '.65rem 1rem',
                    background: 'var(--herb-pale)', borderRadius: 'var(--r-md)',
                    border: '1px solid rgba(58,114,80,.2)',
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    fontSize: '.82rem', color: 'var(--herb)', fontWeight: 600,
                  }}>
                    <Clock size={13} /> Tiffins delivered {form.deliveryTimeWindow}
                  </div>
                )}
              </SECTION>

              <SECTION icon={CalendarDays} title="Delivery Days *">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '.4rem', marginBottom: '1rem' }}>
                  {DELIVERY_DAYS.map((day) => {
                    const active = form.deliveryDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        style={{
                          padding: '.65rem .3rem',
                          borderRadius: '.75rem',
                          border: `1.5px solid ${active ? 'var(--terracotta)' : 'var(--border)'}`,
                          background: active
                            ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))'
                            : 'var(--bg-page)',
                          color: active ? '#fff' : 'var(--ink-3)',
                          fontFamily: 'Nunito', fontWeight: 800,
                          fontSize: '.72rem', cursor: 'pointer',
                          transition: 'all .15s',
                          textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.2rem',
                        }}
                      >
                        <span>{day.slice(0, 1)}</span>
                        <span style={{ fontSize: '.6rem', opacity: .7 }}>{day.slice(1, 3)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--ink-3)' }}>
                  <span>{form.deliveryDays.length} day{form.deliveryDays.length !== 1 ? 's' : ''} selected</span>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, deliveryDays: [...DELIVERY_DAYS] }))}
                      style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--herb)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.78rem' }}>
                      All 7
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, deliveryDays: ['Mon','Tue','Wed','Thu','Fri','Sat'] }))}
                      style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.78rem' }}>
                      Mon–Sat
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, deliveryDays: ['Mon','Tue','Wed','Thu','Fri'] }))}
                      style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.78rem' }}>
                      Weekdays
                    </button>
                  </div>
                </div>
              </SECTION>
            </div>
          )}

          {/* ═══ TAB: WEEKLY MENU ═══ */}
          {tab === 'menu' && (
            <div>
              <SECTION icon={CalendarDays} title="Weekly Thali Menu">
                <p style={{ fontSize: '.82rem', color: 'var(--ink-3)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Tell customers exactly what's on the menu each day. This builds trust and reduces dropouts.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {DELIVERY_DAYS.map((day) => {
                    const isDeliveryDay = form.deliveryDays.includes(day);
                    return (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                          background: isDeliveryDay
                            ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))'
                            : 'var(--bg-deep)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          transition: 'background .15s',
                        }}>
                          <span style={{ fontSize: '.58rem', fontWeight: 700, color: isDeliveryDay ? 'rgba(255,255,255,.8)' : 'var(--ink-4)', fontFamily: 'Nunito', lineHeight: 1 }}>
                            {day.slice(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <input
                          className="input"
                          style={{
                            flex: 1, fontSize: '.875rem',
                            opacity: isDeliveryDay ? 1 : .5,
                          }}
                          placeholder={isDeliveryDay ? `e.g. Dal, Sabzi, 2 Roti, Rice, Salad…` : `No delivery on ${day}`}
                          disabled={!isDeliveryDay}
                          value={form.weeklyMenu[day] || ''}
                          onChange={(e) => setMenuDay(day, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </SECTION>

              {/* Quick fill suggestion */}
              <div style={{
                padding: '.85rem 1rem',
                background: 'var(--bg-warm)', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-lt)',
                fontSize: '.8rem', color: 'var(--ink-3)', lineHeight: 1.6,
              }}>
                <p style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: '.3rem', display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
                  <Info size={14} /> Tip
                </p>
                Include portions e.g. "2 Roti, 1 Sabzi, Dal, Rice, Pickle, Sweet" — customers love detail!
              </div>
            </div>
          )}

          {/* ── FOOTER ACTIONS ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem',
            borderTop: '1px solid var(--border-lt)',
          }}>
            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '.5rem' }}>
              {tab !== 'basic' && (
                <button type="button" onClick={() => setTab(tab === 'menu' ? 'delivery' : 'basic')}
                  className="btn-secondary" style={{ fontSize: '.82rem', padding: '.5rem .9rem' }}>
                  ← Back
                </button>
              )}
              {tab !== 'menu' && (
                <button type="button" onClick={() => setTab(tab === 'basic' ? 'delivery' : 'menu')}
                  className="btn-secondary" style={{ fontSize: '.82rem', padding: '.5rem .9rem' }}>
                  Next →
                </button>
              )}
            </div>

            {/* Primary actions */}
            <div style={{ display: 'flex', gap: '.65rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary" id="plan-form-cancel">
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                id="plan-form-submit"
                disabled={saving}
                style={{ minWidth: '130px', justifyContent: 'center' }}
              >
                {saving ? (
                  <><span className="spinner" style={{ width: '14px', height: '14px', marginRight: '.4rem' }} />{initialData ? 'Saving…' : 'Creating…'}</>
                ) : (
                  initialData ? 'Save Changes' : 'Create Plan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
