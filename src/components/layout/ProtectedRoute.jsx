// src/components/layout/ProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────
// Guards routes based on auth state and user role.
// Three outcomes:
//   1. Auth still loading → show spinner (avoids flash of redirect)
//   2. Not logged in → redirect to /login
//   3. Wrong role → redirect to the correct dashboard
//   4. All good → render children
// ─────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../common/Spinner';

/**
 * @param {string|null} requiredRole – 'customer' | 'provider' | null (any role)
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userRole, authLoading } = useAuth();

  // 1. Firebase is still resolving the auth state — show spinner once, not forever
  if (authLoading) return <PageSpinner />;

  // 2. Not authenticated at all
  if (!currentUser) return <Navigate to="/login" replace />;

  // 3. Only redirect if we have a KNOWN role that is the wrong one.
  //    If userRole is still null (userDoc missing/incomplete) we let them
  //    through — better to show the page than loop on a spinner forever.
  if (requiredRole && userRole !== null && userRole !== requiredRole) {
    const correctDash =
      userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer';
    return <Navigate to={correctDash} replace />;
  }

  // 4. All checks passed
  return children;
}
