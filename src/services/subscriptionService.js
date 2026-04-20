// src/services/subscriptionService.js
// CRUD for the `subscriptions` collection.
// Flow: pending → active (approved) | rejected (vendor rejected)
//       active  → paused | cancelled (customer) | vendor_cancelled (vendor)

import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, where, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification, NOTIF_TYPES } from './notificationService';

// ── Create subscription (status = pending, notify provider) ──
export async function createSubscription({ customerId, customerName, plan, provider }) {
  const providerId = provider.uid || provider.id;

  // 1. Write subscription as PENDING (not active yet)
  const ref = await addDoc(collection(db, 'subscriptions'), {
    customerId,
    customerName,
    planId:       plan.id,
    planTitle:    plan.title,
    planImageUrl: plan.imageUrl || '',
    providerId,
    providerName: provider.name,
    startDate:    serverTimestamp(),
    status:       'pending',           // ← awaiting vendor approval
    updatedAt:    serverTimestamp(),
  });

  // 2. Increment capacity to reserve the spot
  await updateDoc(doc(db, 'tiffinPlans', plan.id), {
    currentSubscribers: increment(1),
  });

  // 3. Notify the provider via the notifications collection
  await createNotification({
    recipientId:    providerId,
    type:           NOTIF_TYPES.NEW_REQUEST,
    message:        `${customerName} wants to subscribe to "${plan.title}"`,
    data: {
      subscriptionId: ref.id,
      customerId,
      customerName,
      planId:    plan.id,
      planTitle: plan.title,
    },
  });

  return ref.id;
}

// ── Approve a subscription request ───────────────────────────
export async function approveSubscription(subscriptionId, customerId, planTitle) {
  await updateDoc(doc(db, 'subscriptions', subscriptionId), {
    status:    'active',
    updatedAt: serverTimestamp(),
  });

  // Notify the customer their request was approved
  await createNotification({
    recipientId: customerId,
    type:        NOTIF_TYPES.SUB_APPROVED,
    message:     `Your subscription to "${planTitle}" has been approved!`,
    data:        { subscriptionId, planTitle },
  });
}

// ── Reject a subscription request ────────────────────────────
export async function rejectSubscription(subscriptionId, planId, customerId, planTitle) {
  await updateDoc(doc(db, 'subscriptions', subscriptionId), {
    status:    'rejected',
    updatedAt: serverTimestamp(),
  });

  // Release the reserved capacity
  await updateDoc(doc(db, 'tiffinPlans', planId), {
    currentSubscribers: increment(-1),
  });

  // Notify the customer
  await createNotification({
    recipientId: customerId,
    type:        NOTIF_TYPES.SUB_REJECTED,
    message:     `Your subscription request for "${planTitle}" was not accepted.`,
    data:        { subscriptionId, planTitle },
  });
}

// ── Vendor cancels an ACTIVE subscription ────────────────────
// This is different from a customer cancelling — the vendor initiates it.
export async function vendorCancelSubscription(subscriptionId, planId, customerId, planTitle, providerName) {
  await updateDoc(doc(db, 'subscriptions', subscriptionId), {
    status:    'cancelled',
    cancelledBy: 'provider',
    updatedAt: serverTimestamp(),
  });

  // Release the capacity slot
  await updateDoc(doc(db, 'tiffinPlans', planId), {
    currentSubscribers: increment(-1),
  });

  // Notify the customer that the vendor cancelled their subscription
  await createNotification({
    recipientId: customerId,
    type:        NOTIF_TYPES.VENDOR_CANCELLED,
    message:     `Your subscription to "${planTitle}" was cancelled by ${providerName}. We're sorry for the inconvenience.`,
    data:        { subscriptionId, planTitle },
  });
}

// ── Get subscriptions for a customer ─────────────────────────
export async function getSubscriptionsByCustomer(customerId) {
  const snap = await getDocs(
    query(collection(db, 'subscriptions'), where('customerId', '==', customerId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Get subscriptions for a provider (all plans) ─────────────
export async function getSubscriptionsByProvider(providerId) {
  const snap = await getDocs(
    query(collection(db, 'subscriptions'), where('providerId', '==', providerId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Update subscription status (pause / cancel / resume) ─────
// Used by customers to pause, resume, or cancel their own subscriptions.
export async function updateSubscriptionStatus(subId, newStatus, planId) {
  await updateDoc(doc(db, 'subscriptions', subId), {
    status:    newStatus,
    updatedAt: serverTimestamp(),
  });

  // If cancelling, free up the capacity slot on the plan
  if (newStatus === 'cancelled' && planId) {
    await updateDoc(doc(db, 'tiffinPlans', planId), {
      currentSubscribers: increment(-1),
    });
  }
}

// ── Delete a single subscription record (clear from history) ─
export async function deleteSubscription(subId) {
  await deleteDoc(doc(db, 'subscriptions', subId));
}

// ── Delete all terminal subscriptions for a customer ─────────
export async function deleteAllHistorySubscriptions(customerId) {
  const snap = await getDocs(
    query(collection(db, 'subscriptions'), where('customerId', '==', customerId))
  );
  const terminal = snap.docs.filter((d) =>
    ['cancelled', 'completed', 'rejected'].includes(d.data().status)
  );
  await Promise.all(terminal.map((d) => deleteDoc(d.ref)));
}
