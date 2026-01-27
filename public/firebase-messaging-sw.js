// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// อย่าลืมเอา Config จาก Firebase Console มาใส่ตรงนี้นะครับ
firebase.initializeApp({
apiKey: "AIzaSyCTgpR0dHPpTmme5yPaAuYzEnahf5IFpdM",
  authDomain: "schoolyscoot.firebaseapp.com",
  projectId: "schoolyscoot",
  storageBucket: "schoolyscoot.firebasestorage.app",
  messagingSenderId: "260668256698",
  appId: "1:260668256698:web:813a9bab032f8039382d83",
  measurementId: "G-W8NCG4MW2N"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png' // Optional: Add your icon path
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
