// src/utils/constants.js
// ─────────────────────────────────────────────────────────────
// Central place for all static data: cuisine options, delivery
// day labels, subscription statuses, etc. Keeps UI components
// free from hardcoded strings.
// ─────────────────────────────────────────────────────────────

export const CUISINE_TYPES = [
  'North Indian',
  'South Indian',
  'Bengali',
  'Gujarati',
  'Maharashtrian',
  'Punjabi',
];

export const DELIVERY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DELIVERY_TIME_WINDOWS = [
  '07:00 – 09:00 AM',
  '11:30 AM – 01:00 PM',
  '06:30 – 08:00 PM',
  '07:00 – 09:00 PM',
];

export const SUBSCRIPTION_STATUSES = {
  active:    'active',
  paused:    'paused',
  cancelled: 'cancelled',
  completed: 'completed',
};

export const USER_ROLES = {
  customer: 'customer',
  provider: 'provider',
};

export const PRICE_RANGES = [
  { label: 'Under ₹100/day',    min: 0,   max: 100  },
  { label: '₹100 – ₹150/day',  min: 100, max: 150  },
  { label: '₹150 – ₹200/day',  min: 150, max: 200  },
  { label: 'Above ₹200/day',   min: 200, max: Infinity },
];

export const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];

// ── Cuisine cover images (Unsplash) ──────────────────────────
export const CUISINE_COVER_IMAGES = {
  'North Indian':
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  'South Indian':
    'https://sukhis.com/app/uploads/2022/04/image3-4.jpg',
  'Bengali':
    'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=800&q=80',
  'Gujarati':
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Maharashtrian':
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
  'Punjabi':
    'https://amritsaridhaba.com.au/wp-content/uploads/2025/05/curries-1-1024x683.jpg', // You can replace this URL with anything else
  'Street Food':
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  'Mixed / Multi-cuisine':
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
};

// Default cover image when no cuisine matches
export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80';

// ── Food plan images (thali/combo) ────────────────────────────
export const PLAN_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', // thali
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80', // curry
  'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=600&q=80', // rice
  'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80', // dosa
  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', // paneer
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80', // combo
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', // street
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', // dal
  'https://images.unsplash.com/photo-1574653853027-5d6f8a2f57a8?auto=format&fit=crop&w=600&q=80', // south plate
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', // breakfast plate
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80', // home meal
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', // plated meal
  'https://images.unsplash.com/photo-1596797038530-2c107aa007f8?auto=format&fit=crop&w=600&q=80', // biryani style
  'https://images.unsplash.com/photo-1608032077018-c9aad9565d29?auto=format&fit=crop&w=600&q=80', // roti sabzi
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', // meal spread
];

const PLAN_IMAGE_KEYWORD_RULES = [
  { keywords: ['dosa', 'idli', 'sambar', 'south indian', 'uttapam'], imageIndices: [3, 8, 9] },
  { keywords: ['street', 'chaat', 'pav bhaji', 'roll', 'snack'], imageIndices: [6, 11, 12] },
  { keywords: ['paneer', 'makhani', 'butter masala', 'tikka'], imageIndices: [4, 0, 5] },
  { keywords: ['dal', 'khichdi', 'lentil'], imageIndices: [7, 1, 13] },
  { keywords: ['rice', 'biryani', 'pulao', 'jeera rice'], imageIndices: [2, 10, 13] },
  { keywords: ['thali', 'combo', 'roti', 'sabzi', 'meal'], imageIndices: [0, 5, 12, 14] },
];

function hashText(value = '') {
  return [...String(value)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

/**
 * Pick a plan image with priority:
 * 1) explicit uploaded URL
 * 2) image index selected by vendor
 * 3) description/title keyword match
 * 4) deterministic hash fallback
 */
export function getPlanImage(input = '') {
  if (typeof input === 'object' && input !== null) {
    const {
      imageUrl,
      imageIndex,
      imageSelectionMode,
      description = '',
      title = '',
      fallbackKey = '',
    } = input;

    if (imageUrl) return imageUrl;

    if (imageSelectionMode === 'manual' && Number.isInteger(imageIndex) && imageIndex >= 0) {
      return PLAN_FOOD_IMAGES[imageIndex % PLAN_FOOD_IMAGES.length];
    }

    const searchable = `${title} ${description}`.toLowerCase();
    const matchedRule = PLAN_IMAGE_KEYWORD_RULES.find((rule) =>
      rule.keywords.some((kw) => searchable.includes(kw)),
    );
    if (matchedRule) {
      const rulePool = matchedRule.imageIndices?.length
        ? matchedRule.imageIndices
        : [0];
      const pickIdx = hashText(fallbackKey || title || description) % rulePool.length;
      return PLAN_FOOD_IMAGES[rulePool[pickIdx] % PLAN_FOOD_IMAGES.length];
    }

    const hashSource = fallbackKey || title || description || '';
    const hash = hashText(hashSource);
    return PLAN_FOOD_IMAGES[hash % PLAN_FOOD_IMAGES.length];
  }

  const hash = hashText(input);
  return PLAN_FOOD_IMAGES[hash % PLAN_FOOD_IMAGES.length];
}

/** Pick a cover image for a provider based on priority:
 * 1) vendor uploaded cover image
 * 2) first cuisine-mapped image
 * 3) deterministic fallback by provider id
 */
export function getProviderCoverImage(cuisineTypes = [], providerId = '', coverImageUrl = '') {
  if (coverImageUrl) return coverImageUrl;
  if (cuisineTypes.length > 0 && CUISINE_COVER_IMAGES[cuisineTypes[0]]) {
    return CUISINE_COVER_IMAGES[cuisineTypes[0]];
  }
  const hash = hashText(providerId);
  const fallbacks = Object.values(CUISINE_COVER_IMAGES);
  return fallbacks[hash % fallbacks.length] || DEFAULT_COVER_IMAGE;
}
