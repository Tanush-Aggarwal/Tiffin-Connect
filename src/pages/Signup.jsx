// src/pages/Signup.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, MapPin, Eye, EyeOff,
  ArrowRight, ArrowLeft, Loader2, CheckCircle2, UtensilsCrossed, ChefHat, ShieldCheck, XCircle, Leaf, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  {
    value: 'customer',
    Icon: User,
    label: 'Customer',
    desc: 'Browse & subscribe to daily tiffins',
    activeClass: 'border-[#3A7250] shadow-[0_3px_12px_rgba(58,114,80,0.10)]',
    activeBg: '#F2FAF5',
    activeHoverBg: '#EAF6EF',
    labelColor: '#3A7250',
    checkBg: '#3A7250',
    cta: { text: 'Find my tiffin', Icon: UtensilsCrossed },
  },
  {
    value: 'provider',
    Icon: ChefHat,
    label: 'Tiffin Provider',
    desc: 'Offer your home-cooked tiffin service',
    activeClass: 'border-[#C2532A] shadow-[0_3px_12px_rgba(194,83,42,0.10)]',
    activeBg: '#FFF5EF',
    activeHoverBg: '#FFEEE5',
    labelColor: '#C2532A',
    checkBg: '#C2532A',
    cta: { text: 'Start serving tiffins', Icon: ChefHat },
  },
];

const validators = {
  name:     (v) => v.trim().length > 1,
  location: (v) => v.trim().length > 1,
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  password: (v) => v.length >= 6,
  confirm:  (v, pw) => v === pw && v.length >= 6,
};

// Warm input style — forces cream bg even over browser dark-mode / autofill
const warmInput = (bg = '#FFFAF5') => ({
  flex: 1,
  border: 'none',
  outline: 'none',
  background: bg,
  WebkitBoxShadow: `0 0 0 100px ${bg} inset`,
  boxShadow: `0 0 0 100px ${bg} inset`,
  WebkitTextFillColor: '#5C3318',
  color: '#5C3318',
  padding: '9.5px 6px 9.5px 0',
  fontSize: '13.5px',
  fontFamily: 'Inter, sans-serif',
  caretColor: '#C2532A',
});

function InputField({
  id, label, placeholder, type = 'text',
  value, onChange, onBlur, icon: Icon,
  isValid, isTouched, suffix,
}) {
  const idle      = !isTouched || !value;
  const borderColor = idle ? '#EDD9C0' : isValid ? '#3A7250' : '#D4674A';
  const glow        = idle ? 'none'
    : isValid ? '0 0 0 3px rgba(58,114,80,0.08)'
    : '0 0 0 3px rgba(212,103,74,0.08)';
  const inputBg = idle ? '#FFFAF5' : isValid ? '#F8FCF9' : '#FFF9F7';

  return (
    <div>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: '#7A4A28', letterSpacing: '0.05em',
        textTransform: 'uppercase', marginBottom: 4,
        fontFamily: 'Inter, sans-serif',
      }}>{label}</label>

      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 11, background: inputBg,
        boxShadow: glow, overflow: 'hidden',
        transition: 'border-color .2s, box-shadow .2s',
      }}>
        {Icon && (
          <Icon size={14} style={{ color: '#CDB99A', marginLeft: 10, flexShrink: 0 }} />
        )}
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange} onBlur={onBlur}
          autoComplete="off"
          style={warmInput(inputBg)}
        />
        {isTouched && value && isValid && (
          <CheckCircle2 size={14} style={{ color: '#3A7250', marginRight: 10, flexShrink: 0 }} />
        )}
        {suffix}
      </div>
    </div>
  );
}

export default function Signup() {
  const [role,     setRole]     = useState('customer');
  const [step,     setStep]     = useState(1);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [touched,  setTouched]  = useState({});

  const { signup, currentUser, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && currentUser) navigate('/', { replace: true });
  }, [currentUser, authLoading, navigate]);

  const touch = (...fields) =>
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));

  const valid = {
    name:     validators.name(name),
    location: validators.location(location),
    email:    validators.email(email),
    password: validators.password(password),
    confirm:  validators.confirm(confirm, password),
  };

  const goStep2 = () => {
    touch('name', 'location', 'email');
    if (!valid.name || !valid.location || !valid.email) {
      setError('Please fill in all fields correctly.'); return;
    }
    setError(''); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    touch('password', 'confirm');
    if (!valid.password) { setError('Password must be at least 6 characters.'); return; }
    if (!valid.confirm)  { setError('Passwords do not match.'); return; }
    setError('');
    try {
      setLoading(true);
      await signup({
        email: email.trim(), password,
        name: name.trim(), role,
        location: location.trim(),
      });
      toast.success('Welcome to TiffinConnect!');
      navigate(
        role === 'provider' ? '/dashboard/provider' : '/dashboard/customer',
        { replace: true }
      );
    } catch (err) {
      setError({
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/weak-password':        'Password must be at least 6 characters.',
      }[err.code] ?? 'Sign up failed. Please try again.');
    } finally { setLoading(false); }
  };

  const activeRole = ROLES.find((r) => r.value === role);

  /* ── shared style tokens ── */
  const cream  = '#FFFCF7';
  const border = '1px solid #EDD9C0';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', background: '#FDF6EE',
      colorScheme: 'light', fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Trust strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        justifyContent: 'center', gap: 16,
        padding: '7px 20px', borderRadius: 100,
        background: '#FFF8F0', border,
        fontSize: 12, color: '#9C7355', marginBottom: '1.4rem',
      }}>
        {[
          { Icon: ShieldCheck,    text: 'Secure signup' },
          { Icon: CheckCircle2,   text: '10,000+ happy customers' },
          { Icon: XCircle,        text: 'Cancel anytime' },
          { Icon: UtensilsCrossed, text: 'Free to browse' },
        ].map((t, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#9C7355' }}>
            {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D4A97A', display: 'inline-block' }} />}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <t.Icon size={14} style={{ color: '#C2532A' }} />
              {t.text}
            </span>
          </span>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 820 }}>

        {/* ── Two-column card ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: cream, borderRadius: 28, border,
          overflow: 'hidden',
        }}
          className="signup-card"
        >

          {/* ══ LEFT warm panel ══ */}
          <div style={{
            background: '#FFF4E6', padding: '2.5rem 2.2rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            borderRight: border, position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative background icons */}
            <span style={{ position:'absolute', top:-8, right:-4, opacity:.10, pointerEvents:'none', lineHeight:1, color:'#B77A5A' }}>
              <Leaf size={86} />
            </span>
            <span style={{ position:'absolute', bottom:8, left:-6, opacity:.08, pointerEvents:'none', lineHeight:1, color:'#B77A5A' }}>
              <UtensilsCrossed size={70} />
            </span>

            <div style={{ position: 'relative' }}>
              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.8rem' }}>
                <div style={{
                  width: 38, height: 38, background: '#FDEEE8',
                  borderRadius: 12, border: '1px solid #EDCBB0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color:'#C2532A',
                }}>
                  <UtensilsCrossed size={18} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#5C2D0A', fontFamily: 'Georgia, serif' }}>
                  TiffinConnect
                </span>
              </div>

              <h2 style={{
                fontSize: 21, fontWeight: 700, color: '#3D1A06',
                lineHeight: 1.4, marginBottom: '.7rem', fontFamily: 'Georgia, serif',
              }}>
                A warm meal,<br />every single day
              </h2>
              <p style={{ fontSize: 13, color: '#9C7355', lineHeight: 1.65 }}>
                Made in real kitchens, by real hands. No preservatives — just home food the way it should be.
              </p>

              {/* Testimonial */}
              <div style={{
                background: '#FFFBF5', border, borderRadius: 16,
                padding: '1rem 1.2rem', marginTop: '1.4rem',
              }}>
                <p style={{ fontSize: 13, color: '#6B4226', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  "Eating from TiffinConnect feels like my mom packed my lunch. I didn't expect to feel this at home."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '.75rem' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#FDEEE8', border: '1px solid #EDCBB0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#C2532A',
                  }}>AS</div>
                  <span style={{ fontSize: 12, color: '#9C7355', fontWeight: 600 }}>Anjali S. · Bangalore</span>
                </div>
              </div>
            </div>

            {/* City pills */}
            <div style={{ position: 'relative', marginTop: '1.6rem' }}>
              <p style={{ fontSize: 11.5, color: '#B09278', marginBottom: 6 }}>Home cooks serving fresh tiffins in</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'].map((c) => (
                  <span key={c} style={{
                    background: '#FFF0E0', color: '#8B5C3A',
                    fontSize: 11, padding: '4px 11px',
                    borderRadius: 100, border: '1px solid #EDCBB0',
                  }}>{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT form panel ══ */}
          <div style={{ padding: '2rem 2.3rem', background: cream }}>

            {/* Logo header */}
            <div style={{ textAlign: 'center', marginBottom: '1.3rem' }}>
              <div style={{
                display: 'inline-flex', padding: 10,
                background: '#FFF0E0', borderRadius: 14,
                border, marginBottom: '.5rem',
                color: '#C2532A',
              }}>
                <UtensilsCrossed size={18} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#3D1A06', fontFamily: 'Georgia, serif' }}>
                Create your account
              </h1>
              <p style={{ fontSize: 12.5, color: '#9C7355', marginTop: 3 }}>
                Join thousands eating &amp; serving home-cooked meals
              </p>
            </div>

            {/* Role selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.2rem' }}>
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    style={{
                      padding: 13, borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                      border: `1.5px solid ${active ? r.labelColor : '#EDD9C0'}`,
                      background: active ? r.activeBg : '#FFFCF7',
                      boxShadow: active ? `0 3px 12px rgba(0,0,0,0.07)` : 'none',
                      transition: 'all .2s',
                      WebkitAppearance: 'none', appearance: 'none',
                      colorScheme: 'light',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = active ? r.activeHoverBg : '#FFF8F2';
                      e.currentTarget.style.borderColor = active ? r.labelColor : '#DBBFA0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = active ? r.activeBg : '#FFFCF7';
                      e.currentTarget.style.borderColor = active ? r.labelColor : '#EDD9C0';
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? r.activeHoverBg : '#FFF4EC', border: '1px solid #EDD9C0', color: active ? r.labelColor : '#9C7355' }}>
                      <r.Icon size={16} />
                    </div>
                    <p style={{
                      fontSize: 13, fontWeight: 700, marginTop: 6,
                      color: active ? r.labelColor : '#3D1A06',
                    }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: '#9C7355', marginTop: 2, lineHeight: 1.4 }}>{r.desc}</p>
                    {active && (
                      <div style={{
                        width: 15, height: 15, borderRadius: '50%', marginTop: 5,
                        background: r.checkBg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#FFFFFF',
                      }}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '1.1rem' }}>
              {[1, 2].map((s) => (
                <div key={s} style={{
                  height: 7, borderRadius: 4, transition: 'all .3s',
                  width: step === s ? 22 : 8,
                  background: step > s ? '#A3C4A8' : step === s ? '#C2532A' : '#EDD9C0',
                }} />
              ))}
              <span style={{ fontSize: 11.5, color: '#9C7355', marginLeft: 4 }}>
                Step {step} of 2 — {step === 1 ? 'Your details' : 'Set your password'}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FFF5F0', border: '1px solid #EDCBB0',
                color: '#C2532A', borderRadius: 12,
                padding: '10px 14px', fontSize: 12.5, marginBottom: '.9rem',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} />
                  {error}
                </span>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <InputField id="f-name" label="Full name *" placeholder="Priya Sharma"
                    value={name} onChange={(e) => setName(e.target.value)}
                    onBlur={() => touch('name')}
                    icon={User} isValid={valid.name} isTouched={touched.name} />
                  <InputField id="f-loc" label="City / Area *" placeholder="Pune, MH"
                    value={location} onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => touch('location')}
                    icon={MapPin} isValid={valid.location} isTouched={touched.location} />
                </div>
                <InputField id="f-email" label="Email address *" placeholder="you@example.com" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  icon={Mail} isValid={valid.email} isTouched={touched.email} />

                <WarmButton onClick={goStep2} style={{ marginTop: 4 }}>
                  Continue <ArrowRight size={14} />
                </WarmButton>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
                <InputField id="f-pass" label="Password *" placeholder="Min. 6 characters"
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch('password')}
                  icon={Lock} isValid={valid.password} isTouched={touched.password}
                  suffix={
                    <button type="button" onClick={() => setShowPass((s) => !s)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '0 10px', color: '#CDB99A', flexShrink: 0,
                        display: 'flex', alignItems: 'center', colorScheme: 'light',
                      }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  } />

                <InputField id="f-conf" label="Confirm password *" placeholder="Repeat password"
                  type={showPass ? 'text' : 'password'}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => touch('confirm')}
                  icon={Lock} isValid={valid.confirm} isTouched={touched.confirm} />

                <BackButton onClick={() => { setStep(1); setError(''); }}>
                  <ArrowLeft size={14} /> Back
                </BackButton>

                <WarmButton type="submit" disabled={loading}>
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Creating account…</>
                    : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {activeRole.cta.text}
                        <activeRole.cta.Icon size={14} />
                      </span>
                    )}
                </WarmButton>

                {/* Micro trust */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {[
                    { Icon: ShieldCheck, text: 'No spam' },
                    { Icon: UtensilsCrossed, text: 'Free to browse' },
                    { Icon: XCircle, text: 'Cancel anytime' },
                  ].map((t) => (
                    <span key={t.text} style={{ fontSize: 11, color: '#B8967A', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <t.Icon size={13} />
                      {t.text}
                    </span>
                  ))}
                </div>
              </form>
            )}

            <div style={{ borderTop: '1px solid #EDD9C0', margin: '.9rem 0' }} />
            <p style={{ textAlign: 'center', fontSize: 13, color: '#9C7355' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#C2532A', fontWeight: 700, textDecoration: 'none' }}>Log in →</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#C4A882', marginTop: '1rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Leaf size={14} />
            Feels like home, every single day
          </span>
        </p>
      </div>

      {/* Force light color scheme globally on this page */}
      <style>{`
        .signup-card, .signup-card * { color-scheme: light !important; }
        .signup-card input {
          background: #FFFAF5 !important;
          -webkit-box-shadow: 0 0 0 100px #FFFAF5 inset !important;
          box-shadow: 0 0 0 100px #FFFAF5 inset !important;
          -webkit-text-fill-color: #5C3318 !important;
          color: #5C3318 !important;
        }
        .signup-card input::placeholder {
          color: #D4B89A !important;
          -webkit-text-fill-color: #D4B89A !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

/* ── Reusable warm buttons ── */
function WarmButton({ children, onClick, type = 'button', disabled = false, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: 12, borderRadius: 13, border: 'none',
        fontSize: 13.5, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontFamily: 'Inter, sans-serif', transition: 'background .15s',
        background: disabled ? '#D4896E' : hovered ? '#B04825' : '#C2532A',
        color: '#FFFFFF',
        WebkitAppearance: 'none', appearance: 'none', colorScheme: 'light',
        ...style,
      }}>
      {children}
    </button>
  );
}

function BackButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '10px 12px', borderRadius: 13,
        border: `1.5px solid ${hovered ? '#DBBFA0' : '#EDD9C0'}`,
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontFamily: 'Inter, sans-serif', transition: 'all .15s',
        background: hovered ? '#FFEFDc' : '#FFF4E6',
        color: hovered ? '#7A5035' : '#9C7355',
        WebkitAppearance: 'none', appearance: 'none', colorScheme: 'light',
      }}>
      {children}
    </button>
  );
}
