const SEEN_KEY = "cafe_seen_notification_ids";

export function getBrowserNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification({ title, body, tag, onClickPath }) {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const notification = new Notification(title, {
    body,
    tag: tag || title,
    icon: "/vite.svg",
  });

  if (onClickPath) {
    notification.onclick = () => {
      window.focus();
      window.location.href = onClickPath;
      notification.close();
    };
  }

  return true;
}

export function loadSeenNotificationIds() {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function saveSeenNotificationIds(ids) {
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

export function markNotificationsSeen(notifications, seenIds) {
  const next = new Set(seenIds);
  for (const item of notifications) {
    if (item.notification_id) next.add(item.notification_id);
  }
  saveSeenNotificationIds(next);
  return next;
}

export function findNewNotifications(notifications, seenIds) {
  return notifications.filter(
    (item) => item.notification_id && !seenIds.has(item.notification_id),
  );
}
