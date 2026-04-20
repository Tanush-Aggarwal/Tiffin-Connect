// One-time script to clean up invalid cuisineTypes from Firestore
// Run with: node scripts/cleanCuisineTypes.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayRemove } from 'firebase/firestore';

// Paste your Firebase config here (same as .env.local)
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// The provider ID to clean — change this to the actual provider UID
const PROVIDER_ID = process.argv[2];

if (!PROVIDER_ID) {
  console.error('Usage: node scripts/cleanCuisineTypes.mjs <providerUID>');
  process.exit(1);
}

const VALID = [
  'North Indian','South Indian','Bengali','Gujarati',
  'Maharashtrian','Punjabi','Street Food','Mixed / Multi-cuisine',
];

const { getDoc } = await import('firebase/firestore');
const snap = await getDoc(doc(db, 'providers', PROVIDER_ID));

if (!snap.exists()) {
  console.error('Provider not found:', PROVIDER_ID);
  process.exit(1);
}

const cuisineTypes = snap.data().cuisineTypes || [];
const invalid = cuisineTypes.filter((c) => !VALID.includes(c));

if (invalid.length === 0) {
  console.log('✅ No invalid cuisine types found.');
  process.exit(0);
}

console.log('Removing invalid values:', invalid);
await updateDoc(doc(db, 'providers', PROVIDER_ID), {
  cuisineTypes: arrayRemove(...invalid),
});
console.log('✅ Done! Removed:', invalid.join(', '));
process.exit(0);
