/**
 * usePushNotifications — Hook para notificaciones push PWA
 * Usa la Notifications API del navegador + Service Worker.
 * Esta fase cubre notificaciones locales mientras la aplicación permanece abierta;
 * el envío persistente requiere una suscripción Web Push y un backend emisor.
 */
import { useState, useEffect, useCallback } from "react";

export type NotifPermission = "default" | "granted" | "denied";
export type NotificationChannel = "trips" | "messages" | "status";

export interface PushPreferences {
  enabled: boolean;
  trips: boolean;
  messages: boolean;
  status: boolean;
}

const defaultPreferences: PushPreferences = {
  enabled: false,
  trips: true,
  messages: true,
  status: true,
};

function preferenceKey(role: string) {
  return `unpasajero_push_preferences_${role}`;
}

function loadPreferences(role: string): PushPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(preferenceKey(role)) || "{}");
    return { ...defaultPreferences, ...stored };
  } catch {
    return defaultPreferences;
  }
}

export function usePushNotifications(role: string = "client") {
  const [permission, setPermission] = useState<NotifPermission>("default");
  const [preferences, setPreferences] = useState<PushPreferences>(defaultPreferences);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission as NotifPermission);
    }
    setPreferences(loadPreferences(role));
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, [role]);

  const updatePreferences = useCallback((next: Partial<PushPreferences>) => {
    setPreferences(current => {
      const updated = { ...current, ...next };
      localStorage.setItem(preferenceKey(role), JSON.stringify(updated));
      return updated;
    });
  }, [role]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    const result = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
    setPermission(result as NotifPermission);
    if (result === "granted") updatePreferences({ enabled: true });
    return result === "granted";
  }, [updatePreferences]);

  const sendNotification = useCallback(async (
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      url?: string;
      vibrate?: number[];
      channel?: NotificationChannel;
      onlyWhenHidden?: boolean;
    }
  ) => {
    if (!("Notification" in window)) return;
    const channel = options?.channel || "status";
    if (!preferences.enabled || !preferences[channel]) return;
    if (Notification.permission !== "granted") return;
    if (options?.onlyWhenHidden !== false && document.visibilityState !== "hidden") return;

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
  }, [preferences]);

  return { permission, preferences, requestPermission, updatePreferences, sendNotification };
}
