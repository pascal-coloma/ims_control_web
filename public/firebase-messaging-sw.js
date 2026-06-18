// Background-message handler for FCM web push. Runs outside the Vite module
// graph, so it can't read import.meta.env — fill these in to match your
// .env's VITE_FIREBASE_API_KEY / VITE_FIREBASE_WEB_APP_ID before deploying.
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "REPLACE_WITH_VITE_FIREBASE_API_KEY",
  projectId: "ims-ambulancias",
  storageBucket: "ims-ambulancias.firebasestorage.app",
  messagingSenderId: "562177550205",
  appId: "REPLACE_WITH_VITE_FIREBASE_WEB_APP_ID",
});

firebase.messaging();
