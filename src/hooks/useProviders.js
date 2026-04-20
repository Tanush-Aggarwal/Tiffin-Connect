// src/hooks/useProviders.js
// ─────────────────────────────────────────────────────────────
// Custom hook to fetch and cache all providers from Firestore.
// Components call this hook instead of calling providerService
// directly — this centralises the loading/error pattern and
// allows state to be lifted or composed easily.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { getAllProviders } from '../services/providerService';

export function useProviders() {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProviders();
      setProviders(data);
    } catch (err) {
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchProviders();
    });
  }, [fetchProviders]);

  return { providers, loading, error, refetch: fetchProviders };
}
