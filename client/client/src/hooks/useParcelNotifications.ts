import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

type ParcelStatus = "pending" | "accepted" | "in_transit" | "delivered" | "cancelled";

interface ParcelNotification {
  trackingCode: string;
  status: ParcelStatus;
  message: string;
}

const STATUS_CONFIG = {
  pending: { message: "Tu paquete esta esperando un conductor", sound: "notification" },
  accepted: { message: "Tu paquete ha sido aceptado! En camino", sound: "accepted" },
  in_transit: { message: "Tu paquete esta en transito", sound: "transit" },
  delivered: { message: "Tu paquete ha sido entregado!", sound: "delivered" },
  cancelled: { message: "Tu paquete ha sido cancelado", sound: "cancelled" },
};

export function useParcelNotifications() {
  const notificationQueueRef = useRef<ParcelNotification[]>([]);
  const lastNotificationRef = useRef<{ [key: string]: number }>({});

  const showNotification = useCallback((notification: ParcelNotification) => {
    const now = Date.now();
    const lastTime = lastNotificationRef.current[notification.trackingCode] || 0;

    if (now - lastTime < 3000) return;

    lastNotificationRef.current[notification.trackingCode] = now;

    toast.success(notification.message, { duration: 5000 });

    notificationQueueRef.current.push(notification);
    if (notificationQueueRef.current.length > 50) {
      notificationQueueRef.current.shift();
    }
  }, []);

  const monitorParcelStatus = useCallback(
    (trackingCode: string, currentStatus: ParcelStatus, previousStatus?: ParcelStatus) => {
      if (!previousStatus || previousStatus !== currentStatus) {
        showNotification({
          trackingCode,
          status: currentStatus,
          message: STATUS_CONFIG[currentStatus].message,
        });
      }
    },
    [showNotification]
  );

  return {
    showNotification,
    monitorParcelStatus,
    notificationHistory: notificationQueueRef.current,
  };
}
