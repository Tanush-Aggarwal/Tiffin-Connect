// src/components/common/UserAvatar.jsx
// Google-style avatar: initials in a warm color derived from the name.
// Used in Navbar, ProviderCard, ReviewCard, etc.

const AVATAR_COLORS = [
  '#C8552A', // terracotta
  '#3D7A55', // herb green
  '#D4943A', // golden mustard
  '#7B5EA7', // lavender
  '#2A7A8C', // teal
  '#A85A2A', // burnt sienna
  '#5A7A2A', // olive
  '#C45A74', // rose
  '#3A5A8C', // slate blue
  '#8B6914', // dark amber
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * @param {string}  name      – user's full name
 * @param {number}  size      – diameter in px (default 36)
 * @param {string}  className – extra classes
 * @param {string}  src       – optional image URL (future: upload support)
 */
export default function UserAvatar({ name = '', size = 36, className = '', src }) {
  const initials = getInitials(name);
  const color    = getAvatarColor(name);
  const fontSize = Math.round(size * 0.38);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials || '?'}
    </div>
  );
}
