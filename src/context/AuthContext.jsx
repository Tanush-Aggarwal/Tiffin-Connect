/* eslint-disable react-refresh/only-export-components */

// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global authentication state via React Context API.
//
// WHY Context? Auth state (currentUser, role) is needed by many
// components across the tree: Navbar, ProtectedRoute, dashboards,
// review forms, etc. Passing it via props would require "prop
// drilling" through every intermediate component. Context solves
// this cleanly with a single Provider wrapping the whole app.
//
// WHAT it provides:
//   • currentUser  – Firebase Auth user object (or null)
//   • userDoc      – Firestore user document (name, role, location…)
//   • userRole     – 'customer' | 'provider' | null (shorthand)
//   • authLoading  – true while Firebase resolves the initial state
//   • login / signup / logout – wrapped auth actions
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { signInUser, signOutUser, signUpUser, getUserDoc } from '../services/authService';

// 1. Create the context object with sensible defaults
const AuthContext = createContext({
  currentUser:    null,
  userDoc:        null,
  userRole:       null,
  authLoading:    true,
  login:          async () => {},
  signup:         async () => {},
  logout:         async () => {},
  refreshUserDoc: async () => {},
});

// 2. Provider component – wrap the whole app with this
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]  = useState(null);
  const [userDoc,     setUserDoc]      = useState(null);
  const [authLoading, setAuthLoading]  = useState(true);

  // ── Listen to Firebase Auth state changes ─────────────────
  // useEffect here runs once on mount and fires the cleanup
  // (unsubscribe) when the component unmounts. This is the
  // canonical pattern for Firebase Auth listeners in React.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch the Firestore user doc to get role, name, etc.
          const doc = await getUserDoc(firebaseUser.uid);

          if (doc) {
            setUserDoc(doc);
          } else {
            // User doc missing — create a minimal fallback so we never
            // spin forever. Role defaults to 'customer' (safest default).
            console.warn('[AuthContext] No user doc found for', firebaseUser.uid, '— using fallback');
            setUserDoc({
              uid:   firebaseUser.uid,
              name:  firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role:  'customer',   // safe default
            });
          }
        } catch (err) {
          console.error('[AuthContext] getUserDoc error:', err);
          // Even on error, set a fallback so the app doesn't freeze
          setUserDoc({
            uid:   firebaseUser.uid,
            name:  firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role:  'customer',
          });
        }
      } else {
        setUserDoc(null);
      }

      setAuthLoading(false);
    });

    // Cleanup: unsubscribe when AuthProvider unmounts
    return unsubscribe;
  }, []);

  // ── Auth actions ──────────────────────────────────────────
  // useCallback prevents these functions from being recreated on
  // every render, which is important because they are passed down
  // to Login, Signup and Navbar — memoisation avoids unnecessary
  // re-renders of those child components.

  const login = useCallback(async (email, password) => {
    const user = await signInUser({ email, password });
    return user;
  }, []);

  const signup = useCallback(async (fields) => {
    const user = await signUpUser(fields);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    // State resets automatically via the onAuthStateChanged listener above
  }, []);

  const refreshUserDoc = useCallback(async () => {
    if (!auth.currentUser) return;
    const doc = await getUserDoc(auth.currentUser.uid);
    setUserDoc(doc);
  }, []);

  // ── Derived shorthand ─────────────────────────────────────
  const userRole = userDoc?.role ?? null;

  const value = {
    currentUser,
    userDoc,
    userRole,
    authLoading,
    login,
    signup,
    logout,
    refreshUserDoc,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook – useAuth() – so components don't import
//    AuthContext directly (cleaner API, easier to refactor).
//    Throws a dev-time error if used outside AuthProvider.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
