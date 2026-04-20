// src/services/notificationService.js
// Real-time Firestore notifications for providers.

import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const NOTIF_TYPES = {
  NEW_REQUEST:      'new_subscription_request',
  SUB_APPROVED:     'subscription_approved',
  SUB_REJECTED:     'subscription_rejected',
  VENDOR_CANCELLED: 'vendor_cancelled',   // provider cancels an active subscription
};

/** Create a notification document */
export async function createNotification({ recipientId, type, message, data = {} }) {
  return addDoc(collection(db, 'notifications'), {
    recipientId,
    type,
    message,
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

/** Fetch all notifications for a user */
export async function getNotifications(recipientId) {
  const snap = await getDocs(
    query(collection(db, 'notifications'), where('recipientId', '==', recipientId)),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

/** Mark a single notification as read */
export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
}

/** Mark all notifications for a user as read */
export async function markAllRead(recipientId) {
  const snap = await getDocs(
    query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      where('isRead', '==', false),
    ),
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
}
