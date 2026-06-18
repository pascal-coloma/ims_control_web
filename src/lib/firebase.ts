// Web counterpart of the RN app's utils/firebaseApp.ts. projectId,
// storageBucket and messagingSenderId are shared across platforms; apiKey
// and appId come from the Web App registered separately in Firebase Console
// (Project settings > General > Add app > Web).
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: "ims-ambulancias",
  storageBucket: "ims-ambulancias.firebasestorage.app",
  messagingSenderId: "562177550205",
  appId: import.meta.env.VITE_FIREBASE_WEB_APP_ID,
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!(await isSupported())) return null;
  return getMessaging(app);
}
