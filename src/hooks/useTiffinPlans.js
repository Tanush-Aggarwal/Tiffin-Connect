// src/hooks/useTiffinPlans.js
// ─────────────────────────────────────────────────────────────
// Custom hook to fetch tiffin plans for a specific provider.
// Accepts providerId as a parameter; re-fetches on change.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { getPlansByProvider } from '../services/providerService';

export function useTiffinPlans(providerId) {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchPlans = useCallback(async () => {
    if (!providerId) {
      setPlans([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getPlansByProvider(providerId);
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPlans();
    });
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}
