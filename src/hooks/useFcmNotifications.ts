import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported } from "../lib/firebase";
import { registerFcmToken } from "../api/notifications";
import { useNotificationStore } from "../stores/notificationStore";

// Web counterpart of the RN app's utils/firebaseMessaging.ts + NotificationContext.
export function useFcmNotifications(): void {
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // ponytail: bails out until VITE_FIREBASE_* env vars are set (Web App
    // registered in Firebase Console); avoids a useless permission prompt
    // and an unhandled rejection from getToken() with no VAPID key.
    if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return;

    void (async () => {
      try {
        const messaging = await getMessagingIfSupported();
        if (!messaging) return;

        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission !== "granted") return;

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });
        await registerFcmToken(token);

        unsubscribe = onMessage(messaging, (payload) => {
          addNotification({
            id: payload.messageId ?? Date.now().toString(),
            title: payload.notification?.title ?? "",
            body: payload.notification?.body ?? "",
          });
        });
      } catch (err) {
        console.error("FCM setup failed", err);
      }
    })();

    return () => unsubscribe?.();
  }, [addNotification]);
}
