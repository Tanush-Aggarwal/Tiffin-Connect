// src/pages/Profile.jsx — Redesigned TiffinConnect Profile Page

import { useState } from 'react';
import { MapPin, Phone, Mail, Edit3, Save, X, ChevronRight, Star, ShoppingBag, Clock, User, ChefHat, PencilLine } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ─── Decorative SVG tile pattern ─── */
const PatternBg = () => (
  <svg
    aria-hidden="true"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="mandala" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeWidth="0.8" />
        <circle cx="30" cy="30" r="12" fill="none" stroke="#fff" strokeWidth="0.6" />
        <circle cx="30" cy="30" r="4"  fill="#fff" />
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line
            key={i}
            x1={30 + 4  * Math.cos(deg * Math.PI / 180)}
            y1={30 + 4  * Math.sin(deg * Math.PI / 180)}
            x2={30 + 20 * Math.cos(deg * Math.PI / 180)}
            y2={30 + 20 * Math.sin(deg * Math.PI / 180)}
            stroke="#fff" strokeWidth="0.5"
          />
        ))}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#mandala)" />
  </svg>
);

/* ─── Stat pill ─── */
const Stat = ({ icon, label, value }) => {
  const IconComponent = icon;

  return (
    <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.18)',
    minWidth: '90px',
  }}>
    <IconComponent size={15} style={{ color: 'rgba(255,255,255,0.7)' }} />
    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}>{value}</span>
    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
};

/* ─── Field row (view mode) ─── */
const FieldRow = ({ icon, label, value }) => {
  const IconComponent = icon;

  return (
    <div style={{
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #f0ebe5',
  }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
      background: '#fdf3ed',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <IconComponent size={16} style={{ color: '#c2532a' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#b0a090', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#2a1a0e', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</p>
    </div>
    {value && <ChevronRight size={14} style={{ color: '#d0c0b0', flexShrink: 0 }} />}
    </div>
  );
};

/* ─── Input row (edit mode) ─── */
const InputRow = ({ icon, label, id, value, onChange, type = 'text', placeholder }) => {
  const IconComponent = icon;

  return (
    <div style={{ marginBottom: '16px' }}>
    <label htmlFor={id} style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#8a7060', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <IconComponent size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#c2532a', pointerEvents: 'none' }} />
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px 12px 38px',
          fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#2a1a0e',
          background: '#fdf8f5', border: '1.5px solid #ead5c5',
          borderRadius: '12px', outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#c2532a'; e.target.style.boxShadow = '0 0 0 3px rgba(194,83,42,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#ead5c5'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
    </div>
  );
};

/* ════════════════════════════════════════ */
export default function Profile() {
  const { currentUser, userDoc, refreshUserDoc } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({
    name: userDoc?.name || '',
    location: userDoc?.location || '',
    phone: userDoc?.phone || '',
  });
  const [saving,  setSaving]  = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      setSaving(true);
      const fields = { name: form.name.trim(), location: form.location.trim(), phone: form.phone.trim(), updatedAt: serverTimestamp() };
      await updateDoc(doc(db, 'users', currentUser.uid), fields);
      if (userDoc?.role === 'provider') await updateDoc(doc(db, 'providers', currentUser.uid), fields);
      await refreshUserDoc();
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({ name: userDoc?.name || '', location: userDoc?.location || '', phone: userDoc?.phone || '' });
    setEditing(false);
  };

  const initials = (userDoc?.name || currentUser?.displayName || '?')
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const isProvider = userDoc?.role === 'provider';

  const memberSince = userDoc?.createdAt
    ? formatDate(userDoc.createdAt)
    : '—';

  return (
    <div style={{ background: '#fdf8f4', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>

      {/* ══ Hero panel ══ */}
      <div style={{
        background: 'linear-gradient(140deg, #1e0f05 0%, #5c2e14 45%, #8b4513 100%)',
        position: 'relative', overflow: 'hidden',
        paddingTop: '56px', paddingBottom: '90px',
      }}>
        <PatternBg />

        {/* Warm glow blob */}
        <div style={{
          position: 'absolute', right: '-80px', top: '-60px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,100,40,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

          {/* Role badge */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              padding: '5px 14px', borderRadius: '999px',
              background: isProvider ? 'rgba(255,180,50,0.18)' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${isProvider ? 'rgba(255,180,50,0.4)' : 'rgba(255,255,255,0.25)'}`,
              color: isProvider ? '#ffcf6e' : 'rgba(255,255,255,0.75)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {isProvider ? <ChefHat size={14} /> : <User size={14} />}
                {isProvider ? 'Tiffin Provider' : 'Customer'}
              </span>
            </span>
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '28px', marginBottom: '36px', flexWrap: 'wrap' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '28px',
              background: 'linear-gradient(145deg, #e8643a, #a03010)',
              border: '3px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.1rem', fontFamily: 'Nunito, sans-serif',
              fontWeight: 900, color: '#fff',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ paddingBottom: '4px' }}>
              <h1 style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#fff',
                margin: '0 0 6px', lineHeight: 1.15,
              }}>
                {userDoc?.name || currentUser?.displayName || 'Your Name'}
              </h1>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Stat icon={Star}        label="Member Since" value={memberSince} />
            <Stat icon={ShoppingBag} label="Role"         value={isProvider ? 'Provider' : 'Customer'} />
            <Stat icon={Clock}       label="Account"      value="Active" />
          </div>
        </div>
      </div>

      {/* ══ Main card (overlaps hero) ══ */}
      <div style={{ maxWidth: '720px', margin: '-44px auto 0', padding: '0 24px 60px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #ede5dc',
          boxShadow: '0 8px 40px rgba(80,30,10,0.10)',
          overflow: 'hidden',
        }}>

          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '22px 28px 20px',
            borderBottom: '1px solid #f5ede5',
          }}>
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#2a1a0e', margin: 0 }}>
                Profile Information
              </h2>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: '#a09080', margin: '3px 0 0' }}>
                {editing ? 'Make changes and save below' : 'Tap Edit to update your details'}
              </p>
            </div>

            {!editing ? (
              <button
                id="edit-profile-btn"
                onClick={() => {
                  setForm({
                    name: userDoc?.name || '',
                    location: userDoc?.location || '',
                    phone: userDoc?.phone || '',
                  });
                  setEditing(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                  color: '#c2532a', background: '#fdf3ed',
                  border: '1.5px solid #edc8b0',
                  borderRadius: '12px', cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#f5e5d8'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#fdf3ed'; }}
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            ) : (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: '#c2532a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PencilLine size={14} />
                Editing…
              </span>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: '8px 28px 28px' }}>
            {!editing ? (
              <>
                <FieldRow icon={User}   label="Full Name" value={userDoc?.name} />
                <FieldRow icon={Mail}   label="Email"     value={currentUser?.email} />
                <FieldRow icon={MapPin} label="Location"  value={userDoc?.location} />
                <FieldRow icon={Phone}  label="Phone"     value={userDoc?.phone} />
              </>
            ) : (
              <form onSubmit={handleSave} style={{ paddingTop: '12px' }}>
                <InputRow icon={User}   id="p-name"     label="Full name *"  value={form.name}     onChange={set('name')}     placeholder="Your full name" />
                <InputRow icon={MapPin} id="p-location" label="City / Area"  value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru, Karnataka" />
                <InputRow icon={Phone}  id="p-phone"    label="Phone"        value={form.phone}    onChange={set('phone')}    type="tel" placeholder="+91 9876543210" />

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    id="save-profile-btn"
                    type="submit" disabled={saving}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      padding: '13px',
                      fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 800,
                      color: '#fff',
                      background: saving ? '#c2a090' : 'linear-gradient(135deg,#d9623a,#a03010)',
                      border: 'none', borderRadius: '14px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.75 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button" onClick={handleCancel}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '13px 20px',
                      fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                      color: '#7a5040', background: '#f5ece5',
                      border: '1.5px solid #e0cfc0', borderRadius: '14px', cursor: 'pointer',
                    }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div style={{
          marginTop: '20px', padding: '18px 24px',
          background: '#fff8f6', border: '1px solid #f5dbd0',
          borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#8b2500', margin: 0 }}>Delete Account</p>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: '#c09080', margin: '2px 0 0' }}>Permanently remove your data — this cannot be undone</p>
          </div>
          <button
            onClick={() => toast.error('Please contact support to delete your account.')}
            style={{
              fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', fontWeight: 700,
              color: '#c0391a', background: 'transparent',
              border: '1.5px solid #f5c5b0', borderRadius: '10px',
              padding: '8px 16px', cursor: 'pointer', flexShrink: 0,
              transition: 'background .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fff0ec'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
