import { create } from "zustand";
import type { AppNotification } from "../types/api";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  selected: AppNotification | null;
  addNotification: (n: { id: string; title: string; body: string }) => void;
  dismissNotification: (id: string) => void;
  markAllRead: () => void;
  selectNotification: (n: AppNotification) => void;
  clearSelected: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  selected: null,
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        { ...n, read: false, receivedAt: new Date() },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((x) => x.id !== id),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((x) => ({ ...x, read: true })),
      unreadCount: 0,
    })),
  selectNotification: (n) => set({ selected: n }),
  clearSelected: () => set({ selected: null }),
}));
