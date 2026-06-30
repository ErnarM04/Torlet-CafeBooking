import { useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import useBookings from "../hooks/useBookings";
import {
  findNewNotifications,
  getBrowserNotificationPermission,
  loadSeenNotificationIds,
  markNotificationsSeen,
  showBrowserNotification,
} from "../utils/browserNotifications";

const POLL_MS = 30000;

export default function NotificationWatcher() {
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const notifications = useBookings((state) => state.notifications);
  const fetchNotifications = useBookings((state) => state.fetchNotifications);
  const fetchNotificationPreferences = useBookings((state) => state.fetchNotificationPreferences);
  const browserPushEnabled = useBookings((state) => state.browserPushEnabled);
  const seenRef = useRef(loadSeenNotificationIds());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    fetchNotificationPreferences();
    fetchNotifications();
    const timer = setInterval(() => {
      fetchNotifications();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [isLoggedIn, fetchNotifications, fetchNotificationPreferences]);

  useEffect(() => {
    if (!isLoggedIn || !browserPushEnabled) return;
    if (getBrowserNotificationPermission() !== "granted") return;

    if (!initializedRef.current) {
      markNotificationsSeen(notifications, seenRef.current);
      seenRef.current = loadSeenNotificationIds();
      initializedRef.current = true;
      return;
    }

    const fresh = findNewNotifications(notifications, seenRef.current);
    for (const item of fresh) {
      showBrowserNotification({
        title: item.title,
        body: item.message,
        tag: item.notification_id,
        onClickPath: "/customer/history",
      });
    }

    if (fresh.length > 0) {
      seenRef.current = markNotificationsSeen(fresh, seenRef.current);
    }
  }, [isLoggedIn, browserPushEnabled, notifications]);

  return null;
}
