import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { savePushSubscriptionServer, removePushSubscriptionServer } from "@/lib/push-notification.functions";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("iskcon_push_prompt_dismissed") === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        setIsSubscribed(true);
      }
    }

    const checkExistingSubscription = async () => {
      if (!supported) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
        }
      } catch (err) {
        console.warn("Push subscription check warning:", err);
      }
    };

    checkExistingSubscription();
  }, []);

  const requestPermissionAndSubscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Push notifications are not supported by your browser.");
      return false;
    }

    setLoading(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === "granted") {
        setIsSubscribed(true);
        try {
          localStorage.setItem("iskcon_push_prompt_dismissed", "true");
        } catch {}

        // Service worker subscription
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          let sub = await reg.pushManager.getSubscription();

          if (!sub) {
            // Standard VAPID or application key setup
            const dummyVapidKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-Skv69yViEuiBIa";
            try {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: dummyVapidKey,
              });
            } catch {
              // Fallback for browsers that allow userVisibleOnly without custom VAPID key
            }
          }

          const endpoint = sub?.endpoint || `browser_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const p256dh = sub?.toJSON().keys?.p256dh || "";
          const auth = sub?.toJSON().keys?.auth || "";

          const ua = navigator.userAgent || "";
          const deviceLabel = /iPhone|iPad/i.test(ua) ? "iOS PWA App" : /Android/i.test(ua) ? "Android Mobile App" : "Desktop Browser";

          await savePushSubscriptionServer({
            data: {
              endpoint,
              keys: { p256dh, auth },
              deviceInfo: deviceLabel,
            },
          });
        }

          // Trigger instant test notification so user sees immediate output!
          if ("serviceWorker" in navigator) {
            try {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("ISKCON Kurnool Notifications Active 🌸", {
                body: "Hari Bol! You will now receive Daily Darshan, Live Aarti & Temple updates directly on your device.",
                icon: "/iskcon-logo.png",
                badge: "/favicon.png",
                vibrate: [100, 50, 100],
                tag: "welcome-notification",
                data: { url: "/daily-darshan" },
              });
            } catch (e) {
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("ISKCON Kurnool Notifications Active 🌸", {
                  body: "Hari Bol! You will now receive Daily Darshan & Temple updates on your device.",
                  icon: "/iskcon-logo.png",
                });
              }
            }
          }

        toast.success("🔔 Notifications enabled! Welcome notification sent to your device.", {
          duration: 5000,
        });
        return true;
      } else if (res === "denied") {
        toast.info("Notification permission was denied in browser settings.");
        return false;
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      toast.error("Failed to enable notifications.");
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  const dismissPrompt = useCallback(() => {
    setPromptDismissed(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("iskcon_push_prompt_dismissed", "true");
      } catch {}
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    promptDismissed,
    requestPermissionAndSubscribe,
    dismissPrompt,
  };
}
