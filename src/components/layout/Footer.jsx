// src/components/layout/Footer.jsx — Rich 4-column footer

import { UtensilsCrossed, Heart, Globe, Share2, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#2A1A0E', color: 'rgba(255,255,255,.7)' }} className="mt-auto">
      <div className="page-container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.65rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg,var(--terracotta),var(--terracotta-dark))', padding: '.5rem', borderRadius: '.65rem' }}>
                <UtensilsCrossed size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>
                TiffinConnect
              </span>
            </Link>
            <p style={{ fontSize: '.85rem', lineHeight: 1.7, maxWidth: '240px', color: 'rgba(255,255,255,.55)' }}>
              India's largest home-cooked tiffin marketplace. Fresh, authentic, affordable.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '.65rem', marginTop: '1.25rem' }}>
              {[Globe, Share2, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(194,83,42,.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                >
                  <Icon size={14} style={{ color: 'rgba(255,255,255,.7)' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.85rem', color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
              {[
                { to: '/providers', label: 'Browse Providers' },
                { to: '/signup', label: 'Become a Provider' },
                { to: '/login', label: 'Customer Login' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'rgba(255,255,255,.55)', fontSize: '.875rem', textDecoration: 'none', transition: 'color .14s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--terracotta-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.55)'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Us */}
          <div>
            <h4 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.85rem', color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Why TiffinConnect
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
              {[
                'Verified home cooks',
                'Flexible monthly plans',
                'Veg & non-veg options',
                'Real customer reviews',
                'Easy pause / cancel',
              ].map((item) => (
                <li key={item} style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                  <CheckCircle2 size={14} style={{ color: 'rgba(255,255,255,.65)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '.85rem', color: '#fff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              By the Numbers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              {[
                { num: '500+',  label: 'Home Cooks' },
                { num: '12K+', label: 'Meals Delivered' },
                { num: '4.8★', label: 'Avg Rating' },
                { num: '50+',  label: 'Cities Covered' },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: 'var(--terracotta-light)' }}>{s.num}</p>
                  <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', marginTop: '.05rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem' }}>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
            Made with <Heart size={11} style={{ color: 'var(--terracotta-light)' }} fill="var(--terracotta-light)" /> for homely flavours · 2026
          </p>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.3)' }}>
            TiffinConnect · End-Term Project · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
