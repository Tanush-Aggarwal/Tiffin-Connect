// src/utils/helpers.js
// ─────────────────────────────────────────────────────────────
// Pure utility functions used across the app.
// Keeping these here means components stay clean.
// ─────────────────────────────────────────────────────────────

import { DELIVERY_DAYS } from './constants';

/**
 * Format a Firestore Timestamp or JS Date to a readable date string.
 * e.g. "19 Apr 2026"
 */
export function formatDate(value) {
  if (!value) return '—';
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format a number as Indian Rupees currency.
 * e.g. formatCurrency(1500) → "₹1,500"
 */
export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a display-friendly list of delivery days.
 * e.g. ['Mon','Tue','Wed'] → "Mon, Tue, Wed"
 */
export function formatDeliveryDays(days = []) {
  if (!days.length) return 'No days set';
  // Sort by the canonical order defined in DELIVERY_DAYS
  const sorted = [...days].sort(
    (a, b) => DELIVERY_DAYS.indexOf(a) - DELIVERY_DAYS.indexOf(b),
  );
  return sorted.join(', ');
}

/**
 * Clamp a numeric value between min and max.
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Truncate a string to a given length and add ellipsis.
 */
export function truncate(str, len = 100) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/**
 * Build initials from a full name for avatar fallback.
 * e.g. "Priya Sharma" → "PS"
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Check whether a subscription status is considered "active".
 */
export function isActiveSubscription(status) {
  return status === 'active' || status === 'paused';
}

/**
 * Deep-filter an array of providers by search text, filters etc.
 * Used with useMemo in the Providers page.
 */
export function filterProviders(providers, { search, cuisine, vegOnly, priceRange }) {
  return providers.filter((p) => {
    // Text search across name, location, description
    if (search) {
      const q = search.toLowerCase();
      const match =
        p.name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.cuisineTypes?.some((c) => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (cuisine && cuisine !== 'all') {
      if (!p.cuisineTypes?.includes(cuisine)) return false;
    }
    if (vegOnly && !p.vegOnly) return false;
    if (priceRange) {
      const dayPrice = p.minPricePerDay ?? Infinity;
      if (dayPrice < priceRange.min || dayPrice > priceRange.max) return false;
    }
    return true;
  });
}
