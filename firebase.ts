/// <reference types="vite/client" />
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

requiredEnvVars.forEach((varName) => {
  if (!(import.meta.env as any)[varName]) {
    console.warn(`Missing environment variable: ${varName}. Check your .env file.`);
  }
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Revert Long Polling to fix speed issues
// If ERR_QUIC_PROTOCOL_ERROR returns, it means the network is blocking UDP.
// Revert Long Polling to fix speed issues
// If ERR_QUIC_PROTOCOL_ERROR returns, it means the network is blocking UDP.
// const db = getFirestore(app); // Replaced below

// Initialize Firestore (Persistence is handled by Firebase by default)
const db = getFirestore(app);

const storage = getStorage(app);
const messaging = getMessaging(app);

export { app, auth, db, analytics, storage, messaging };
