/**
 * usePushNotifications — Hook para notificaciones push PWA
 * Usa la Notifications API del navegador + Service Worker
 * No requiere servidor externo: notificaciones locales inmediatas
 */
import { useState, useEffect, useCallback } from "react";

export type NotifPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotifPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission as NotifPermission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);
    return result === "granted";
  }, []);

  const sendNotification = useCallback(async (
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      url?: string;
      vibrate?: number[];
    }
  ) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const notifOptions: NotificationOptions = {
      body: options?.body,
      icon: options?.icon || "/icon-192.png",
      badge: options?.badge || "/icon-192.png",
      tag: options?.tag,
      data: { url: options?.url || "/" },
    };

    // Use Service Worker if available for better support
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        reg.showNotification(title, notifOptions);
        return;
      }
    }

    // Fallback: direct Notification API
    const notif = new Notification(title, notifOptions);
    notif.onclick = () => {
      window.focus();
      if (options?.url) window.location.href = options.url;
      notif.close();
    };
  }, [requestPermission]);

  return { permission, requestPermission, sendNotification };
}
