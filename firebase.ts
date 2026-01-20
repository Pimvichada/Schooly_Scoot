// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);

export { app, auth, db, analytics };
