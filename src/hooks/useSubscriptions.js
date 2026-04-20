// src/hooks/useSubscriptions.js
// ─────────────────────────────────────────────────────────────
// Real-time Firestore listener for subscriptions.
// Uses onSnapshot so both customer and provider see updates
// instantly without needing a manual refetch.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { updateSubscriptionStatus } from '../services/subscriptionService';

export function useSubscriptions({ customerId, providerId } = {}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading,       setLoading]       = useState(Boolean(customerId || providerId));
  const [error,         setError]         = useState(null);

  useEffect(() => {
    // Nothing to listen to if no ID is given
    if (!customerId && !providerId) return undefined;

    const field = customerId ? 'customerId' : 'providerId';
    const value = customerId ?? providerId;

    const q = query(
      collection(db, 'subscriptions'),
      where(field, '==', value),
    );

    // onSnapshot = real-time listener. Every time any subscription document
    // changes in Firestore the callback fires automatically — no polling needed.
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          // Sort: pending first, then by date descending
          .sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            return (b.startDate?.seconds ?? 0) - (a.startDate?.seconds ?? 0);
          });
        setSubscriptions(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useSubscriptions] snapshot error:', err);
        setError(err.message || 'Failed to load subscriptions');
        setLoading(false);
      },
    );

    // Cleanup: detach listener when the component unmounts or IDs change
    return unsub;
  }, [customerId, providerId]);

  // refetch is now a no-op (real-time listener handles it) but kept
  // for backward compatibility with any code that calls it.
  const refetch = useCallback(() => {}, []);

  // changeStatus: updates Firestore; the onSnapshot listener will
  // automatically reflect the change in the UI.
  const changeStatus = useCallback(async (subId, newStatus, planId) => {
    await updateSubscriptionStatus(subId, newStatus, planId);
  }, []);

  const hasSource = Boolean(customerId || providerId);

  return {
    subscriptions: hasSource ? subscriptions : [],
    loading: hasSource ? loading : false,
    error: hasSource ? error : null,
    refetch,
    changeStatus,
  };
}
