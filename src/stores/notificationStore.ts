import { create } from "zustand";
import type { AppNotification } from "../types/api";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  selected: AppNotification | null;
  addNotification: (n: { id: string; title: string; body: string }) => void;
  clearAll: () => void;
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
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  selectNotification: (n) =>
    set((state) => ({
      selected: n,
      notifications: state.notifications.map((x) =>
        x.id === n.id ? { ...x, read: true } : x,
      ),
      unreadCount: n.read ? state.unreadCount : state.unreadCount - 1,
    })),
  clearSelected: () => set({ selected: null }),
}));
