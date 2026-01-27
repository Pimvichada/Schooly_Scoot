// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTgpR0dHPpTmme5yPaAuYzEnahf5IFpdM",
  authDomain: "schoolyscoot.firebaseapp.com",
  projectId: "schoolyscoot",
  storageBucket: "schoolyscoot.firebasestorage.app",
  messagingSenderId: "260668256698",
  appId: "1:260668256698:web:813a9bab032f8039382d83",
  measurementId: "G-W8NCG4MW2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Revert Long Polling to fix speed issues
// If ERR_QUIC_PROTOCOL_ERROR returns, it means the network is blocking UDP.
const db = getFirestore(app);

// Enable Offline Persistence for speed
import { enableIndexedDbPersistence } from "firebase/firestore";
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.log('The current browser does not support all of the features required to enable persistence');
  }
});

const storage = getStorage(app);
const messaging = getMessaging(app);

export { app, auth, db, analytics, storage, messaging };
