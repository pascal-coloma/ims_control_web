// Background-message handler for FCM web push. Runs outside the Vite module
// graph, so it can't read import.meta.env — these values are hardcoded
// (not secrets: apiKey/appId end up in the public JS bundle regardless).
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "***REMOVED-LEAKED-API-KEY***",
  projectId: "ims-ambulancias",
  storageBucket: "ims-ambulancias.firebasestorage.app",
  messagingSenderId: "562177550205",
  appId: "1:562177550205:web:6056cada54b23c1b6f8e14",
});

firebase.messaging();
