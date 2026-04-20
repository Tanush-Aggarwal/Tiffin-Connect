// src/components/provider/ProviderCard.jsx — Swiggy/Zomato style restaurant card

import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Clock, Leaf, Drumstick } from 'lucide-react';
import { getProviderCoverImage } from '../../utils/constants';

export default function ProviderCard({ provider }) {
  const {
    id, name, location, description, avgRating = 0, ratingCount = 0,
    cuisineTypes = [], vegOnly, currentSubscribers = 0, coverImageUrl = '',
  } = provider;

  const coverImg = getProviderCoverImage(cuisineTypes, id, coverImageUrl);
  const cuisineLabel = cuisineTypes.slice(0, 2).join(', ') || 'Home Kitchen';

  return (
    <Link to={`/providers/${id}`} className="restaurant-card" id={`provider-card-${id}`}>
      {/* Cover image */}
      <div className="restaurant-cover">
        <img
          src={coverImg}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="restaurant-cover-overlay" />

        {/* Top badges */}
        <div className="restaurant-cover-badges">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.25rem',
              padding: '.2rem .6rem', borderRadius: '9999px',
              fontSize: '.72rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
              background: vegOnly ? '#E8F4ED' : '#FDEAEA',
              color: vegOnly ? '#27714A' : '#B83232',
              border: `1px solid ${vegOnly ? 'rgba(39,113,74,.25)' : 'rgba(184,50,50,.2)'}`,
            }}
          >
            {vegOnly
              ? <><Leaf size={14} style={{ color: 'var(--herb)' }} /> Veg</>
              : <><Drumstick size={14} style={{ color: 'var(--terracotta)' }} /> Non-Veg</>}
          </span>
        </div>

        {/* Rating pill */}
        {avgRating > 0 && (
          <div className="restaurant-cover-rating">
            <Star size={11} fill="#C98B2A" style={{ color: '#C98B2A' }} />
            <span>{avgRating.toFixed(1)}</span>
            <span style={{ color: '#8C6B52', fontWeight: 500 }}>({ratingCount})</span>
          </div>
        )}

        {/* Subscribers pill */}
        <div className="restaurant-cover-time">
          <Users size={10} style={{ marginRight: '3px' }} />
          {currentSubscribers} subs
        </div>
      </div>

      {/* Info */}
      <div className="restaurant-info">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
          <h3 style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
            color: 'var(--ink)', lineHeight: 1.3, flex: 1, minWidth: 0,
          }}>
            {name}
          </h3>
        </div>

        <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: '.2rem', fontWeight: 500 }}>
          {cuisineLabel}
        </p>

        {location && (
          <p style={{ fontSize: '.75rem', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: '.3rem' }}>
            <MapPin size={10} /> {location}
          </p>
        )}

        {/* Cuisine chips */}
        {cuisineTypes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginTop: '.6rem' }}>
            {cuisineTypes.slice(0, 3).map((c) => (
              <span key={c} style={{
                padding: '.15rem .55rem', borderRadius: '999px',
                fontSize: '.7rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                background: 'var(--terracotta-pale)', color: 'var(--terracotta)',
              }}>
                {c}
              </span>
            ))}
            {cuisineTypes.length > 3 && (
              <span style={{
                padding: '.15rem .55rem', borderRadius: '999px',
                fontSize: '.7rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                background: 'var(--bg-warm)', color: 'var(--ink-3)',
              }}>
                +{cuisineTypes.length - 3} more
              </span>
            )}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '.75rem', paddingTop: '.65rem',
          borderTop: '1px solid var(--border-lt)',
        }}>
          {description ? (
            <p style={{
              fontSize: '.78rem', color: 'var(--ink-3)', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical', flex: 1, marginRight: '.5rem',
            }}>
              {description}
            </p>
          ) : (
            <span style={{ fontSize: '.78rem', color: 'var(--ink-4)' }}>View plans →</span>
          )}
          <span style={{
            fontSize: '.78rem', fontWeight: 700, color: 'var(--terracotta)',
            fontFamily: 'Nunito, sans-serif', flexShrink: 0,
          }}>
            View Menu →
          </span>
        </div>
      </div>
    </Link>
  );
}
