// src/hooks/useNotifications.js
// Real-time Firestore listener for provider notifications.

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) return undefined;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
      setLoading(false);
    });

    return unsub; // cleanup listener on unmount
  }, [userId]);

  return {
    notifications: userId ? notifications : [],
    unreadCount: userId ? unreadCount : 0,
    loading: userId ? loading : false,
  };
}
