// src/pages/Landing.jsx â€” Swiggy/Zomato inspired landing page

import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MapPin, ChefHat, Search, Leaf, Clock, Shield, TrendingUp, Gift, ClipboardList, CreditCard, Heart, Laptop, GraduationCap, Soup, Drumstick, Home, Sparkles, Utensils, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CUISINE_COVER_IMAGES, CUISINE_TYPES } from '../utils/constants';

const FEATURED = [
  { name: "Priya's Kitchen", cuisine: 'North Indian', type: 'Veg', rating: 4.8, price: 90, subs: 34, img: CUISINE_COVER_IMAGES['North Indian'] },
  { name: "Ravi's Tiffins", cuisine: 'South Indian', type: 'Veg', rating: 4.7, price: 85, subs: 21, img: CUISINE_COVER_IMAGES['South Indian'] },
  { name: "Grandmother's", cuisine: 'Homestyle', type: 'Veg', rating: 4.9, price: 95, subs: 40, img: CUISINE_COVER_IMAGES.Gujarati },
  { name: 'Chef Sharma', cuisine: 'Punjabi', type: 'Both', rating: 4.6, price: 100, subs: 18, img: CUISINE_COVER_IMAGES.Punjabi },
  { name: "Ananya's Thali", cuisine: 'Maharashtrian', type: 'Veg', rating: 4.8, price: 80, subs: 27, img: CUISINE_COVER_IMAGES.Maharashtrian },
  { name: 'Spice Route', cuisine: 'Street Food', type: 'Both', rating: 4.5, price: 75, subs: 15, img: CUISINE_COVER_IMAGES['Street Food'] },
];

const STATS = [
  { icon: ChefHat, value: '500+', label: 'Home Cooks' },
  { icon: TrendingUp, value: '12K+', label: 'Meals Daily' },
  { icon: Star, value: '4.8★', label: 'Avg Rating' },
  { icon: MapPin, value: '50+', label: 'Cities' },
];

const HERO_FEATURES = [
  {
    title: 'Fresh daily',
    text: 'Rotating meals cooked every morning by local home chefs.',
    Icon: Sparkles,
  },
  {
    title: 'Home-style taste',
    text: 'Balanced thalis that feel familiar, warm, and filling.',
    Icon: Home,
  },
  {
    title: 'Flexible plans',
    text: 'Choose a plan, pause anytime, and stay in control.',
    Icon: Clock,
  },
  {
    title: 'Verified kitchens',
    text: 'Trusted cooks with a quality-first onboarding flow.',
    Icon: Shield,
  },
];

export default function Landing() {
  const { currentUser, userRole, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (!targetId) return;

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navigate(location.pathname, { replace: true, state: null });
    });
  }, [location.pathname, location.state, navigate]);

  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <section className="hero-swiggy">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="page-container" style={{ paddingTop: '4.6rem', paddingBottom: '4.9rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2.25rem',
                alignItems: 'center',
              }}
              className="md:grid-cols-2"
            >
              <div className="anim-fade-up">
                <div className="hero-badge" style={{ marginBottom: '1.05rem' }}>
                  <Leaf size={12} style={{ color: '#FFD7B8' }} />
                  <span style={{ fontSize: '.78rem', fontWeight: 900, color: '#FFE6D3', fontFamily: 'Nunito, sans-serif', letterSpacing: '.06em' }}>
                    INDIA'S HOME TIFFIN NETWORK
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1.06,
                    marginBottom: '.9rem',
                    textShadow: '0 12px 28px rgba(0,0,0,.22)',
                    letterSpacing: '-.01em',
                  }}
                >
                  <span className="hero-title-top">Ghar ka swaad,</span>
                  <br />
                  <span
                    className="hero-highlight-line"
                  >
                    <span className="hero-highlight-text">har din doorstep pe</span>
                  </span>
                </h1>

                <p className="hero-muted" style={{ fontSize: '1.02rem', maxWidth: '560px', lineHeight: 1.7, marginBottom: '1.05rem' }}>
                  Discover trusted local home cooks serving authentic thalis and tiffins —
                  healthy, affordable, and crafted with real home-style care.
                </p>



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.55rem', marginBottom: '1.1rem' }}>
                  {['Fresh daily', 'Home-style taste', 'Flexible plans', 'Verified kitchens'].map((t) => (
                    <span key={t} className="hero-chip">
                      <Sparkles size={13} style={{ color: 'rgba(255,255,255,.85)' }} />
                      {t}
                    </span>
                  ))}
                </div>

                {!authLoading && currentUser ? (
                  <Link
                    to={userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer'}
                    className="btn-primary"
                    id="hero-dashboard-btn"
                    style={{ fontSize: '1rem', padding: '.9rem 2.1rem', boxShadow: '0 16px 34px rgba(0,0,0,.22)' }}
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                ) : !authLoading ? (
                  <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to="/providers" className="btn-primary" id="hero-find-btn" style={{ fontSize: '.95rem', boxShadow: '0 16px 34px rgba(0,0,0,.22)' }}>
                      <MapPin size={15} /> Find Tiffin Near You
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-secondary"
                      id="hero-provider-btn"
                      style={{
                        fontSize: '.95rem',
                        color: 'rgba(255,255,255,.92)',
                        borderColor: 'rgba(255,255,255,.32)',
                        background: 'rgba(255,255,255,.08)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      Become a Provider
                    </Link>
                  </div>
                ) : (
                  <div style={{ height: '44px', maxWidth: '540px' }} />
                )}
              </div>

              <div className="hidden md:block" />
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className="page-container" style={{ paddingTop: '.9rem', paddingBottom: '.9rem' }}>
            <div style={{ display: 'flex', gap: '.75rem', overflowX: 'auto', flexWrap: 'wrap' }}>
              {STATS.map((s) => (
                <div key={s.label} className="stat-pill">
                  <s.icon size={14} />
                  <span style={{ fontWeight: 800, color: '#fff' }}>{s.value}</span>
                  <span style={{ opacity: 0.86, fontSize: '.74rem', color: 'rgba(255,255,255,.88)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '1rem' }}>
        <h2
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '1.3rem',
            color: 'var(--ink)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
          }}
        >
          <Utensils size={18} style={{ color: 'var(--terracotta)' }} />
          What are you craving?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
          }}
        >
          {CUISINE_TYPES.filter((c) => c !== 'Street Food' && c !== 'Mixed / Multi-cuisine').map((cuisine) => (
            <Link key={cuisine} to={`/providers?cuisine=${encodeURIComponent(cuisine)}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                  background: 'var(--bg-surface)',
                  transition: 'transform .2s, box-shadow .2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                }}
              >
                <div style={{ height: '90px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={CUISINE_COVER_IMAGES[cuisine]}
                    alt={cuisine}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>
                <div style={{ padding: '.5rem .6rem', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontFamily: 'Nunito, sans-serif',
                      textAlign: 'center',
                      lineHeight: 1.15,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxWidth: '100%',
                    }}
                  >
                    {cuisine}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ink)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <Trophy size={18} style={{ color: 'var(--mustard)' }} />
              Popular Home Kitchens
            </span>
          </h2>
          <Link to="/providers" style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--terracotta)', fontFamily: 'Nunito', textDecoration: 'none' }}>
            See all →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {FEATURED.map((cook, i) => (
            <Link key={cook.name} to="/providers" className="restaurant-card anim-fade-up" style={{ textDecoration: 'none', animationDelay: `${i * 0.07}s` }}>
              <div className="restaurant-cover">
                <img
                  src={cook.img}
                  alt={cook.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="restaurant-cover-overlay" />
                <div className="restaurant-cover-badges">
                  <span
                    style={{
                      padding: '.18rem .55rem',
                      borderRadius: '999px',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      background: cook.type === 'Veg' ? '#E8F4ED' : '#FDEAEA',
                      color: cook.type === 'Veg' ? '#27714A' : '#B83232',
                    }}
                  >
                    {cook.type === 'Veg' ? (
                      <>
                        <Leaf size={14} style={{ color: 'var(--herb)', marginRight: '.35rem', verticalAlign: 'text-bottom' }} /> Veg
                      </>
                    ) : (
                      <>
                        <Drumstick size={14} style={{ color: 'var(--terracotta)', marginRight: '.35rem', verticalAlign: 'text-bottom' }} /> Non-Veg
                      </>
                    )}
                  </span>
                </div>
                <div className="restaurant-cover-rating">
                  <Star size={11} fill="#C98B2A" style={{ color: '#C98B2A' }} />
                  {cook.rating}
                </div>
                <div className="restaurant-cover-time">₹{cook.price}/day</div>
              </div>
              <div className="restaurant-info">
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{cook.name}</p>
                <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: '.15rem' }}>
                  {cook.cuisine} &bull; {cook.subs} subscribers
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.6rem', paddingTop: '.5rem', borderTop: '1px solid var(--border-lt)' }}>
                  <span className="offer-tag" style={{ gap: '.35rem' }}>
                    <Gift size={14} /> Free first week
                  </span>
                  <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--terracotta)', fontFamily: 'Nunito' }}>View Menu →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        style={{ background: 'linear-gradient(180deg, var(--bg-warm) 0%, var(--bg-page) 100%)', borderTop: '1px solid var(--border-lt)', borderBottom: '1px solid var(--border-lt)' }}
      >
        <div className="page-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--mustard)', fontFamily: 'Nunito', marginBottom: '.5rem' }}>
              Simple & Easy
            </p>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--ink)' }}>
              How TiffinConnect Works
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', Icon: Search, title: 'Browse Cooks', desc: 'Explore home cooks by cuisine, rating, and location near you.' },
              { step: '02', Icon: ClipboardList, title: 'Choose a Plan', desc: 'Pick a daily or monthly tiffin plan that fits your taste & budget.' },
              { step: '03', Icon: CreditCard, title: 'Subscribe', desc: 'Subscribe once and get fresh home-cooked tiffins every day.' },
              { step: '04', Icon: Heart, title: 'Enjoy & Rate', desc: 'Relish the flavours and share your experience with the community.' },
            ].map((s, i) => (
              <div key={s.step} className="anim-fade-up" style={{ animationDelay: `${i * 0.1}s`, textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--terracotta-pale), var(--bg-warm))',
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <s.Icon size={22} style={{ color: 'var(--terracotta)' }} />
                </div>
                <span style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: 'var(--terracotta)', fontFamily: 'Nunito', letterSpacing: '.08em', marginBottom: '.4rem' }}>
                  STEP {s.step}
                </span>
                <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '.4rem' }}>{s.title}</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--mustard)', fontFamily: 'Nunito', marginBottom: '.5rem' }}>
            What people say
          </p>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: 'var(--ink)' }}>Reminds me of home</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'Rahul M.', role: 'Software Engineer, Pune', quote: 'Dal just like my mom makes it. 4 months and still loving every meal!', Icon: Laptop, rating: 5 },
            { name: 'Priya S.', role: 'Student, Bangalore', quote: 'Healthy, affordable, and so tasty. Switched from junk food - best decision ever!', Icon: GraduationCap, rating: 5 },
            { name: 'Ananya K.', role: 'Home Cook, Mumbai', quote: 'TiffinConnect gave my kitchen a purpose. From 3 subscribers to 40+ in 3 months!', Icon: ChefHat, rating: 5 },
          ].map((t, i) => (
            <div key={t.name} className="card anim-fade-up" style={{ padding: '1.5rem', animationDelay: `${i * 0.1}s`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-1rem', left: '.75rem', fontSize: '5rem', color: 'var(--terracotta-pale)', fontFamily: 'Georgia, serif', lineHeight: 1, zIndex: 0 }}>
                "
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', marginBottom: '.75rem' }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="#C98B2A" style={{ color: '#C98B2A' }} />
                  ))}
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--terracotta-pale), var(--bg-warm))',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-xs)',
                      color: 'var(--terracotta)',
                    }}
                  >
                    <t.Icon size={16} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '.875rem', color: 'var(--ink)' }}>{t.name}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{t.role}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                    <Shield size={13} style={{ color: 'var(--herb)' }} />
                    <span style={{ fontSize: '.7rem', color: 'var(--herb)', fontWeight: 600 }}>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container" style={{ paddingBottom: '4rem' }}>
        <div
          style={{
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #2A1A0E 0%, #5C2E14 100%)',
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(194,83,42,.2) 0%, transparent 60%)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.10)',
                border: '1px solid rgba(255,255,255,.18)',
                boxShadow: '0 12px 26px rgba(0,0,0,.18)',
                marginBottom: '1rem',
                color: '#FFB68A',
              }}
            >
              <Soup size={22} />
            </div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#fff', marginBottom: '.75rem' }}>
              Ready to eat well every day?
            </h2>
            <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: '420px', margin: '0 auto 2rem', lineHeight: 1.7, fontSize: '.95rem' }}>
              Join thousands who've switched to real, home-cooked tiffins. Healthier, tastier, lighter on the wallet.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-primary" id="final-cta-btn" style={{ fontSize: '1rem', padding: '.9rem 2.5rem' }}>
                Get Started - It's Free <ArrowRight size={16} />
              </Link>
              <Link
                to="/providers"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                  padding: '.9rem 2rem',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,.8)',
                  border: '2px solid rgba(255,255,255,.25)',
                  background: 'rgba(255,255,255,.08)',
                  textDecoration: 'none',
                  transition: 'all .16s',
                }}
              >
                Browse Tiffins
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
