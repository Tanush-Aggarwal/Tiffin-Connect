// src/services/reviewService.js
// ─────────────────────────────────────────────────────────────
// CRUD for the `reviews` collection. After a review is written
// or deleted we recalculate the provider's avgRating/ratingCount
// and persist that back to the `providers` document so provider
// cards always show a fresh average without extra queries.
// ─────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { updateProvider } from './providerService';

// ── Fetch reviews for a provider ─────────────────────────────
export async function getReviewsByProvider(providerId) {
  // where-only query: avoids composite index requirement
  const snap = await getDocs(
    query(
      collection(db, 'reviews'),
      where('providerId', '==', providerId),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Create a review ───────────────────────────────────────────
export async function createReview({ customerId, customerName, providerId, planId, rating, comment }) {
  const ref = await addDoc(collection(db, 'reviews'), {
    customerId,
    customerName,
    providerId,
    planId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
  // Recalculate provider average
  await _recalcProviderRating(providerId);
  return ref.id;
}

// ── Update own review ─────────────────────────────────────────
export async function updateReview(reviewId, { rating, comment, providerId }) {
  await updateDoc(doc(db, 'reviews', reviewId), {
    rating,
    comment,
    updatedAt: serverTimestamp(),
  });
  await _recalcProviderRating(providerId);
}

// ── Delete a review ───────────────────────────────────────────
export async function deleteReview(reviewId, providerId) {
  await deleteDoc(doc(db, 'reviews', reviewId));
  await _recalcProviderRating(providerId);
}

// ── Internal helper ───────────────────────────────────────────
/**
 * Fetch all reviews for a provider, compute the average, and
 * write avgRating + ratingCount back to the provider doc.
 * Called after any create / update / delete.
 */
async function _recalcProviderRating(providerId) {
  const reviews = await getReviewsByProvider(providerId);
  const count = reviews.length;
  const avg =
    count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;
  await updateProvider(providerId, { avgRating: avg, ratingCount: count });
}
