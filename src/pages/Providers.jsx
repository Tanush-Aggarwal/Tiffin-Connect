// src/pages/Providers.jsx — Swiggy/Zomato style browse page

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Utensils, Leaf, Soup, Fish, Salad, Flame, ChefHat } from 'lucide-react';
import { useProviders } from '../hooks/useProviders';
import ProviderCard from '../components/provider/ProviderCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { filterProviders } from '../utils/helpers';
import { CUISINE_TYPES, CUISINE_COVER_IMAGES } from '../utils/constants';

const CUISINE_ICONS = {
  'North Indian':          Soup,
  'South Indian':          Soup,
  'Bengali':               Fish,
  'Gujarati':              Salad,
  'Maharashtrian':         Flame,
  'Punjabi':               ChefHat,
  'Street Food':           Flame,
  'Mixed / Multi-cuisine': Utensils,
};

export default function Providers() {
  const { providers, loading, error, refetch } = useProviders();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialCuisine = params.get('cuisine');
  const initialSearch = params.get('q') ?? '';

  const [search,      setSearch]      = useState(initialSearch);
  const [cuisine,     setCuisine]     = useState(
    initialCuisine && CUISINE_TYPES.includes(initialCuisine) ? initialCuisine : 'all',
  );
  const [vegOnly,     setVegOnly]     = useState(false);

  const searchRef = useRef(null);
  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = useMemo(
    () => filterProviders(providers, { search, cuisine, vegOnly }),
    [providers, search, cuisine, vegOnly],
  );
  const hasActiveFilters = search || cuisine !== 'all' || vegOnly;
  const clearFilters = () => { setSearch(''); setCuisine('all'); setVegOnly(false); };

  return (
    <div>
      {/* ── Top header bar (Swiggy style) */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-lt)',
        padding: '1.5rem 0 0',
        position: 'sticky', top: '72px', zIndex: 20,
        boxShadow: '0 2px 8px rgba(42,26,14,.04)',
      }}>
        <div className="page-container">
          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: 'var(--ink)' }}>
                Home Tiffin Providers
              </h1>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-3)', marginTop: '.15rem' }}>
                {loading ? 'Loading…' : `${filtered.length} home cooks available`}
              </p>
            </div>

          </div>

          {/* Search bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="input-group" style={{ maxWidth: '520px' }}>
              <Search size={15} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                id="provider-search"
                type="text"
                placeholder="Search by name, city, or cuisine…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}
                >
                  <X size={14} style={{ color: 'var(--ink-3)' }} />
                </button>
              )}
            </div>
          </div>

          {/* Cuisine filter chips (horizontal scroll) */}
          <div className="scroll-row" style={{ marginBottom: '0', paddingBottom: '1rem' }}>
            <button
              className={`category-chip ${cuisine === 'all' ? 'active' : ''}`}
              onClick={() => setCuisine('all')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                <Utensils size={14} />
                All
              </span>
            </button>
            {CUISINE_TYPES.filter((c) => c !== 'Street Food' && c !== 'Mixed / Multi-cuisine').map((c) => {
              const Icon = CUISINE_ICONS[c] || Utensils;
              return (
                <button
                  key={c}
                  className={`category-chip ${cuisine === c ? 'active' : ''}`}
                  onClick={() => setCuisine(c)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                    <Icon size={14} />
                    {c}
                  </span>
                </button>
              );
            })}
            <label
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                padding: '.45rem 1rem', borderRadius: '999px',
                fontSize: '.85rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                cursor: 'pointer', flexShrink: 0,
                border: `1.5px solid ${vegOnly ? 'var(--herb)' : 'var(--border)'}`,
                background: vegOnly ? 'var(--herb-pale)' : 'var(--bg-surface)',
                color: vegOnly ? 'var(--herb)' : 'var(--ink-2)',
                transition: 'all .16s',
              }}
            >
              <input
                type="checkbox"
                id="veg-filter"
                className="hidden"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                style={{ display: 'none' }}
              />
              <Leaf size={14} />
              Veg Only
            </label>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="category-chip"
                style={{ background: 'var(--err-bg)', borderColor: 'rgba(184,50,50,.2)', color: 'var(--err)' }}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content */}
      <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Results count when filtered */}
        {hasActiveFilters && !loading && (
          <p style={{ fontSize: '.875rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
            Showing <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{filtered.length}</span> of {providers.length} providers
            {cuisine !== 'all' && (
              <> for <span style={{ fontWeight: 700, color: 'var(--terracotta)' }}>{cuisine}</span></>
            )}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: '160px' }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '40%', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && (
          filtered.length === 0
            ? <EmptyState
                title="No providers found"
                message={hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'No tiffin providers have joined yet.'}
                action={hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-secondary">Clear all filters</button>
                )}
              />
            : (
              <>
                {/* Cuisine sections when showing all */}
                {cuisine === 'all' && !search && !vegOnly ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* All providers in one grid */}
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        {filtered.map((p) => <ProviderCard key={p.id} provider={p} />)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {filtered.map((p) => <ProviderCard key={p.id} provider={p} />)}
                  </div>
                )}
              </>
            )
        )}
      </div>
    </div>
  );
}
