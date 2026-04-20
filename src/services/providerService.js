// src/services/providerService.js
// ─────────────────────────────────────────────────────────────
// Firestore CRUD for providers and tiffin plans.
// All functions return plain JS objects (no Firestore internals
// leak into components).
// ─────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ══ PROVIDERS ════════════════════════════════════════════════

/** Fetch all providers (for the browse page). */
export async function getAllProviders() {
  // Simple collection fetch — no orderBy needed to avoid composite index requirement
  const snap = await getDocs(collection(db, 'providers'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch a single provider by uid. */
export async function getProvider(uid) {
  const snap = await getDoc(doc(db, 'providers', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Create or fully overwrite a provider profile. */
export async function upsertProviderProfile(uid, data) {
  const ref = doc(db, 'providers', uid);
  await setDoc(
    ref,
    { ...data, uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Partial update (e.g. just avgRating / ratingCount). */
export async function updateProvider(uid, fields) {
  await updateDoc(doc(db, 'providers', uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// ══ TIFFIN PLANS ═════════════════════════════════════════════

/** Fetch all plans for a given provider. */
export async function getPlansByProvider(providerId) {
  // where-only query: no composite index required
  const snap = await getDocs(
    query(
      collection(db, 'tiffinPlans'),
      where('providerId', '==', providerId),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch a single plan by its document id. */
export async function getPlan(planId) {
  const snap = await getDoc(doc(db, 'tiffinPlans', planId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Create a new plan; returns the new document id. */
export async function createPlan(providerId, planData) {
  const ref = await addDoc(collection(db, 'tiffinPlans'), {
    ...planData,
    providerId,
    currentSubscribers: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing plan. */
export async function updatePlan(planId, fields) {
  await updateDoc(doc(db, 'tiffinPlans', planId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a plan by id. */
export async function deletePlan(planId) {
  await deleteDoc(doc(db, 'tiffinPlans', planId));
}

/** Fetch all plans (used on Provider detail page to avoid a second query). */
export async function getAllPlans() {
  const snap = await getDocs(collection(db, 'tiffinPlans'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
