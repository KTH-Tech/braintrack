import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const queryClient = useQueryClient();
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const { data: statusData } = useQuery<{ subscribed: boolean }>({
    queryKey: ["/api/push/status"],
    enabled: isSupported,
  });

  const { data: vapidData } = useQuery<{ publicKey: string }>({
    queryKey: ["/api/push/vapid-public-key"],
    enabled: isSupported,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const sub = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      return apiRequest("POST", "/api/push/subscribe", {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push/status"] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      return apiRequest("POST", "/api/push/unsubscribe", { endpoint });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push/status"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/push/test", {}),
  });

  const enable = useCallback(async (): Promise<"granted" | "denied" | "unsupported"> => {
    if (!isSupported || !vapidData?.publicKey) return "unsupported";
    setIsRegistering(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== "granted") return "denied";

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey) as BufferSource,
      });

      await subscribeMutation.mutateAsync(sub);
      return "granted";
    } catch (err) {
      console.error("Push enable error:", err);
      return "denied";
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported, vapidData, subscribeMutation]);

  const disable = useCallback(async () => {
    setIsRegistering(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeMutation.mutateAsync(sub.endpoint);
        await sub.unsubscribe();
      }
    } catch (err) {
      console.error("Push disable error:", err);
    } finally {
      setIsRegistering(false);
    }
  }, [unsubscribeMutation]);

  const sendTest = useCallback(async () => {
    await testMutation.mutateAsync();
  }, [testMutation]);

  return {
    isSupported,
    isSubscribed: statusData?.subscribed ?? false,
    permissionState,
    isRegistering: isRegistering || subscribeMutation.isPending || unsubscribeMutation.isPending,
    isSendingTest: testMutation.isPending,
    enable,
    disable,
    sendTest,
  };
}
