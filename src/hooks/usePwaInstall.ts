import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global event listener to capture beforeinstallprompt before React mounts
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    (window as any).__pwaDeferredPrompt = e;
  });
}

export function usePwaInstall(options?: { autoPromptNewUser?: boolean }) {
  const { autoPromptNewUser = false } = options || {};

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== "undefined" && (window as any).__pwaDeferredPrompt) {
      return (window as any).__pwaDeferredPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("iskcon_app_installed") === "true";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;
    const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const chrome = /Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua);
    const safari = /Safari/i.test(ua) && !/Chrome|Android/i.test(ua);

    setDeviceInfo({
      isMobile: mobile,
      isIOS: ios,
      isAndroid: android,
      isChrome: chrome,
      isSafari: safari,
    });

    if ((window as any).__pwaDeferredPrompt) {
      setDeferredPrompt((window as any).__pwaDeferredPrompt);
    }

    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://") ||
        localStorage.getItem("iskcon_app_installed") === "true";

      if (isStandalone) {
        setIsInstalled(true);
        try {
          localStorage.setItem("iskcon_app_installed", "true");
        } catch {}
      }
      return isStandalone;
    };

    const isStandalone = checkStandalone();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaDeferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      try {
        localStorage.setItem("iskcon_app_installed", "true");
        localStorage.setItem("iskcon_pwa_popup_shown", "true");
      } catch {}
      (window as any).__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsModalOpen(false);
      toast.success("ISKCON Kurnool App installed successfully!", {
        duration: 5000,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker active for PWA install:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration warning:", err);
        });
    }

    // Auto-popup logic for NEW USERS (displays ONLY ONE TIME)
    if (autoPromptNewUser && !isStandalone) {
      const popupShown = localStorage.getItem("iskcon_pwa_popup_shown") === "true";
      const appInstalled = localStorage.getItem("iskcon_app_installed") === "true";
      const isAdminRoute = window.location.pathname.startsWith("/admin");

      if (!popupShown && !appInstalled && !isAdminRoute) {
        const timer = setTimeout(() => {
          setIsModalOpen(true);
          try {
            localStorage.setItem("iskcon_pwa_popup_shown", "true");
          } catch {}
        }, 1200);

        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
          window.removeEventListener("appinstalled", handleAppInstalled);
        };
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [autoPromptNewUser]);

  const openModal = useCallback(() => {
    if (isInstalled || (typeof window !== "undefined" && localStorage.getItem("iskcon_app_installed") === "true")) {
      return;
    }
    setIsModalOpen(true);
  }, [isInstalled]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("iskcon_pwa_popup_shown", "true");
      } catch {}
    }
  }, []);

  const promptInstall = useCallback(async () => {
    if (isInstalled || (typeof window !== "undefined" && localStorage.getItem("iskcon_app_installed") === "true")) {
      toast.success("ISKCON Kurnool app is already installed on your device!");
      return;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("iskcon_pwa_popup_shown", "true");
      } catch {}
    }

    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? (window as any).__pwaDeferredPrompt : null);

    if (promptEvent) {
      try {
        // Direct 1-click native install prompt — no intermediate steps!
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          try {
            localStorage.setItem("iskcon_app_installed", "true");
          } catch {}
          setDeferredPrompt(null);
          (window as any).__pwaDeferredPrompt = null;
          setIsModalOpen(false);
          toast.success("ISKCON Kurnool App installed!");
        } else {
          toast.info("Installation postponed.");
        }
      } catch (err) {
        console.error("Error launching native install prompt:", err);
        openModal();
      }
    } else {
      openModal();
    }
  }, [deferredPrompt, isInstalled, openModal]);

  return {
    isInstalled,
    isInstallable: !isInstalled,
    hasNativePrompt: !!deferredPrompt || (typeof window !== "undefined" && !!(window as any).__pwaDeferredPrompt),
    promptInstall,
    isModalOpen,
    openModal,
    closeModal,
    deviceInfo,
  };
}

