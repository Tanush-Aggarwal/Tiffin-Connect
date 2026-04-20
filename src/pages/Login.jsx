// src/pages/Login.jsx — TiffinConnect · Two-column warm login (fully functional)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, Star, UtensilsCrossed, Soup, Home, PauseCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const C = {
  pageBg:       '#FEF5EE',
  card:         '#FFFFFF',
  border:       '#EDD9CC',
  brown:        '#2C1810',
  orange:       '#C8552A',
  orangeHov:    '#A8401A',
  muted:        '#9B7B6B',
  placeholder:  '#B59080',
  inputBg:      '#FDF8F5',
  inputFocusBg: '#FFFAF7',
  accent:       '#FEF0E8',
  teal:         '#EAF5EF',
  tealBorder:   '#C3E6D0',
  tealText:     '#2D7A5E',
  google:       '#FDFAF7',
  leftBg:       '#FFF4E6',
  leftBorder:   '#EDD9C0',
};

/* ── Controlled floating-label input ── */
function FloatingInput({ id, label, type = 'text', icon, value, onChange, extra }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || (value && value.length > 0);
  const IconComponent = icon;

  return (
    <div style={{ position: 'relative', marginBottom: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        border: `1.5px solid ${focused ? C.orange : C.border}`,
        borderRadius: 14, padding: '14px 14px',
        backgroundColor: focused ? C.inputFocusBg : C.inputBg,
        boxShadow: focused ? '0 0 0 3px rgba(200,85,42,0.09)' : 'none',
        transition: 'all 0.18s',
      }}>
        <IconComponent size={15} style={{ color: focused ? C.orange : C.placeholder, flexShrink: 0, transition: 'color 0.18s' }} />
        <input
          id={id} type={type} value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          style={{
            flex: 1, border: 'none', outline: 'none',
            backgroundColor: 'transparent', background: 'transparent',
            fontSize: 14, color: C.brown, fontFamily: 'sans-serif',
            padding: 0, WebkitTextFillColor: C.brown, caretColor: C.orange,
          }}
        />
        {extra}
      </div>
      <label htmlFor={id} style={{
        position: 'absolute',
        top: raised ? 0 : '50%',
        left: raised ? 36 : 40,
        transform: 'translateY(-50%)',
        fontSize: raised ? 10 : 13.5,
        color: raised ? C.orange : C.placeholder,
        fontWeight: raised ? 700 : 400,
        letterSpacing: raised ? '0.07em' : 0,
        textTransform: raised ? 'uppercase' : 'none',
        backgroundColor: raised ? C.card : 'transparent',
        padding: raised ? '0 4px' : 0,
        pointerEvents: 'none',
        fontFamily: 'sans-serif',
        transition: 'all 0.18s ease',
      }}>{label}</label>
    </div>
  );
}

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { login, currentUser, userRole, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && currentUser)
      navigate(userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer', { replace: true });
  }, [currentUser, userRole, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    try {
      setLoading(true);
      await login(email.trim(), password);
      toast.success('Welcome back! 👋');
    } catch (err) {
      setError({
        'auth/user-not-found':     'No account found with this email.',
        'auth/wrong-password':     'Incorrect password. Please try again.',
        'auth/invalid-email':      'Please enter a valid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests':  'Too many attempts. Please wait a moment.',
      }[err.code] ?? 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: C.pageBg, colorScheme: 'light',
      backgroundImage: `
        radial-gradient(circle at 15% 15%, rgba(200,85,42,0.07) 0%, transparent 50%),
        radial-gradient(circle at 85% 85%, rgba(200,85,42,0.05) 0%, transparent 50%)
      `,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative floating dots */}
      {[
        { w:120, h:120, top:'-30px',   left:'-40px',  o:0.5 },
        { w:60,  h:60,  bottom:'40px', right:'30px',  o:0.4 },
        { w:28,  h:28,  top:'35%',     right:'20px',  o:0.3 },
        { w:16,  h:16,  top:'20%',     left:'40px',   o:0.4 },
      ].map((d, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          backgroundColor: 'rgba(200,85,42,0.12)',
          width: d.w, height: d.h, opacity: d.o,
          top: d.top, bottom: d.bottom, left: d.left, right: d.right,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Two-column card ── */}
      <div className="login-card" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: C.card,
        borderRadius: 28,
        border: `1.5px solid ${C.border}`,
        width: '100%',
        maxWidth: 820,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 12px 48px rgba(44,24,16,0.11), 0 2px 8px rgba(44,24,16,0.06)',
      }}>

        {/* ══ LEFT warm panel ══ */}
        <div style={{
          background: C.leftBg, padding: '2.5rem 2.2rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          borderRight: `1px solid ${C.leftBorder}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative background icons */}
          <span style={{ position:'absolute', top:-8, right:-4, opacity:.10, pointerEvents:'none', lineHeight:1, color:'#B77A5A' }}>
            <Leaf size={86} />
          </span>
          <span style={{ position:'absolute', bottom:8, left:-6, opacity:.08, pointerEvents:'none', lineHeight:1, color:'#B77A5A' }}>
            <Soup size={70} />
          </span>

          <div style={{ position: 'relative' }}>
            {/* Brand mark */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.8rem' }}>
              <div style={{
                width:38, height:38, background:'#FDEEE8', borderRadius:12,
                border:'1px solid #EDCBB0',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#C2532A',
              }}>
                <UtensilsCrossed size={18} />
              </div>
              <span style={{ fontSize:18, fontWeight:700, color:'#5C2D0A', fontFamily:'Georgia, serif' }}>
                TiffinConnect
              </span>
            </div>

            <h2 style={{
              fontSize:21, fontWeight:700, color:'#3D1A06',
              lineHeight:1.4, marginBottom:'.7rem', fontFamily:'Georgia, serif',
            }}>
              A warm meal,<br/>every single day
            </h2>
            <p style={{ fontSize:13, color:'#9C7355', lineHeight:1.65 }}>
              Made in real kitchens, by real hands. No preservatives — just home food the way it should be.
            </p>

            {/* Feature list */}
            <div style={{ marginTop:'1.4rem', display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { Icon: Soup,        text:'Fresh meals cooked daily' },
                { Icon: Leaf,        text:'No preservatives, ever' },
                { Icon: Home,        text:'Real home kitchens near you' },
                { Icon: PauseCircle, text:'Pause or cancel anytime' },
              ].map(f => (
                <div key={f.text} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:30, height:30, borderRadius:8,
                    background:'#FDEEE8', border:'1px solid #EDCBB0',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, color:'#C2532A',
                  }}>
                    <f.Icon size={14} />
                  </div>
                  <span style={{ fontSize:12.5, color:'#6B4226' }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{
              background:'#FFFBF5', border:`1px solid ${C.leftBorder}`,
              borderRadius:16, padding:'1rem 1.2rem', marginTop:'1.6rem',
            }}>
              <div style={{ display:'flex', gap:2, marginBottom:6 }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={11} fill="#C98B2A" style={{ color:'#C98B2A' }} />)}
              </div>
              <p style={{ fontSize:13, color:'#6B4226', lineHeight:1.6, fontStyle:'italic', fontFamily:'Georgia, serif' }}>
                "Eating from TiffinConnect feels like my mom packed my lunch. I didn't expect to feel this at home."
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:'.75rem' }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%',
                  background:'#FDEEE8', border:'1px solid #EDCBB0',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, color:'#C2532A',
                }}>AS</div>
                <span style={{ fontSize:12, color:'#9C7355', fontWeight:600 }}>Anjali S. · Bangalore</span>
              </div>
            </div>
          </div>

          {/* City pills */}
          <div style={{ position:'relative', marginTop:'1.6rem' }}>
            <p style={{ fontSize:11.5, color:'#B09278', marginBottom:6 }}>Home cooks serving fresh tiffins in</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Mumbai','Pune','Bangalore','Delhi','Hyderabad'].map(c => (
                <span key={c} style={{
                  background:'#FFF0E0', color:'#8B5C3A',
                  fontSize:11, padding:'4px 11px',
                  borderRadius:100, border:'1px solid #EDCBB0',
                }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT form panel ══ */}
        <div style={{ padding: '2.5rem 2.3rem', background: C.card }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{
              width:44, height:44, borderRadius:13,
              backgroundColor: C.accent, border:`1.5px solid ${C.border}`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0,
            }}>👋</div>
            <div>
              <h1 style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:C.brown, lineHeight:1.2 }}>
                Welcome back!
              </h1>
              <p style={{ fontSize:12.5, color:C.muted, fontFamily:'sans-serif', marginTop:2 }}>
                Your tiffin is waiting for you
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:'#FFF5F0', border:'1px solid #EDCBB0',
              color: C.orange, borderRadius:12,
              padding:'10px 14px', fontSize:12.5, marginBottom:16,
              fontFamily:'sans-serif',
            }}>⚠️ {error}</div>
          )}

          {/* Google */}
          <button type="button"
            onClick={() => toast('Google sign-in coming soon!', { icon:'🔜' })}
            style={{
              width:'100%', display:'flex', alignItems:'center',
              justifyContent:'center', gap:10, padding:'11px 16px',
              borderRadius:12, border:`1.5px solid ${C.border}`,
              backgroundColor: C.google, color: C.brown,
              fontSize:13.5, fontWeight:600, cursor:'pointer',
              fontFamily:'sans-serif', outline:'none', transition:'all 0.15s',
              marginBottom:4,
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor=C.accent; e.currentTarget.style.borderColor='#D4A898'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 3px 10px rgba(44,24,16,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor=C.google; e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.3 9 3.4l6.7-6.7C35.7 2.5 30.2 0 24 0 14.6 0 6.6 5.5 2.6 13.6l7.8 6C12.3 13 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 37.5 46.5 31.4 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.4 28.4A14.6 14.6 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.8-6.2z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.3-7.7 2.3-6.3 0-11.6-4.3-13.6-10l-7.8 6.2C6.6 42.5 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
            <div style={{ flex:1, height:1, backgroundColor:C.border }} />
            <span style={{ fontSize:10.5, color:C.muted, fontWeight:700, letterSpacing:'0.1em', fontFamily:'sans-serif' }}>OR</span>
            <div style={{ flex:1, height:1, backgroundColor:C.border }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <FloatingInput
              id="login-email" label="Email address" type="email" icon={Mail}
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <FloatingInput
              id="login-password" label="Password"
              type={showPass ? 'text' : 'password'} icon={Lock}
              value={password} onChange={e => setPassword(e.target.value)}
              extra={
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
                  {showPass
                    ? <EyeOff size={14} style={{ color:C.placeholder }} />
                    : <Eye    size={14} style={{ color:C.placeholder }} />}
                </button>
              }
            />

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, marginTop:-8 }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor:C.orange, width:14, height:14 }} />
                <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>Remember me</span>
              </label>
              <span style={{ fontSize:12, color:C.orange, fontWeight:600, fontFamily:'sans-serif', cursor:'default' }}>
                Forgot password?
              </span>
            </div>

            <button type="submit" id="login-submit" disabled={loading}
              style={{
                width:'100%', padding:15, borderRadius:14, border:'none',
                backgroundColor: loading ? '#D4856A' : C.orange,
                color:'#FFFFFF', fontSize:15, fontWeight:700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                fontFamily:'sans-serif', letterSpacing:'0.01em',
                boxShadow:'0 5px 18px rgba(200,85,42,0.35)',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.backgroundColor=C.orangeHov; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(200,85,42,0.40)'; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.backgroundColor=C.orange; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 5px 18px rgba(200,85,42,0.35)'; } }}
            >
              {loading ? 'Signing in…' : <><span>Log In</span><ArrowRight size={16} color="#fff"/></>}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:C.muted, marginTop:20, fontFamily:'sans-serif' }}>
            New here?{' '}
            <Link to="/signup" style={{ color:C.orange, fontWeight:700, textDecoration:'none' }}>Create an account →</Link>
          </p>

          {/* Green strip */}
          <div style={{
            marginTop:20, padding:'12px 16px', borderRadius:14,
            backgroundColor:C.teal, border:`1px solid ${C.tealBorder}`,
            display:'flex', alignItems:'center', gap:9,
          }}>
            <Leaf size={14} style={{ color:C.tealText, flexShrink:0 }} />
            <span style={{ fontSize:12, color:C.tealText, fontFamily:'sans-serif', fontWeight:500 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Feels like home, every single day
                <Leaf size={13} style={{ color: C.tealText }} />
              </span>
            </span>
          </div>

          {/* Trust chips */}
          <div style={{ display:'flex', gap:6, marginTop:14, flexWrap:'wrap' }}>
            {[
              { Icon: ShieldCheck, text: 'Secure login' },
              { Icon: Star,        text: '4.8 rating' },
              { Icon: Home,        text: '10k+ home cooks' },
            ].map((t) => (
              <div key={t.text} style={{
                fontSize:11, color:C.muted, fontFamily:'sans-serif',
                backgroundColor:'#FEF5EE', border:`1px solid ${C.border}`,
                borderRadius:999, padding:'4px 10px',
                display:'inline-flex', alignItems:'center', gap:6,
              }}>
                <t.Icon size={13} style={{ color: C.orange }} />
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 640px) {
          .login-card { grid-template-columns: 1fr !important; }
          .login-card > div:first-child { display: none !important; }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #FDF8F5 inset !important;
          -webkit-text-fill-color: #2C1810 !important;
          caret-color: #C8552A;
        }
      `}</style>
    </div>
  );
}
