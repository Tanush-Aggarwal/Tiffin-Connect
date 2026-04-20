// src/services/authService.js
// ─────────────────────────────────────────────────────────────
// Wraps Firebase Auth + Firestore user-document operations.
// AuthContext calls these functions; components never touch the
// Firebase SDK directly, keeping the rest of the codebase
// backend-agnostic.
// ─────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Sign Up ──────────────────────────────────────────────────
/**
 * Create a new Firebase Auth user, then write an initial
 * document to the `users` collection so we can store role,
 * name, and location alongside the auth record.
 */
export async function signUpUser({ email, password, name, role, location = '' }) {
  // 1. Create the Auth account
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  // 2. Set the display name on the Auth profile
  await updateProfile(user, { displayName: name });

  // 3. Write the user doc (uid = same as Auth uid for easy lookups)
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    uid:       user.uid,
    name,
    email,
    role,          // 'customer' | 'provider'
    location,
    phone:     '',
    createdAt: serverTimestamp(),
  });

  // 4. If provider, create a stub providers doc so it shows in listings later
  if (role === 'provider') {
    const providerDocRef = doc(db, 'providers', user.uid);
    await setDoc(providerDocRef, {
      uid:          user.uid,
      name,
      location,
      cuisineTypes: [],
      vegOnly:      false,
      description:  '',
      phone:        '',
      avgRating:    0,
      ratingCount:  0,
      isProfileComplete: false,
      createdAt:    serverTimestamp(),
    });
  }

  return user;
}

// ── Sign In ──────────────────────────────────────────────────
export async function signInUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth);
}

// ── Fetch user document from Firestore ──────────────────────
/**
 * Returns the full user document from Firestore (includes role,
 * location, phone, etc.) for a given uid.
 */
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
