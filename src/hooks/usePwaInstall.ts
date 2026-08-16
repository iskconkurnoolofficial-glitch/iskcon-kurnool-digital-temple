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

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== "undefined" && (window as any).__pwaDeferredPrompt) {
      return (window as any).__pwaDeferredPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).__pwaDeferredPrompt) {
      setDeferredPrompt((window as any).__pwaDeferredPrompt);
    }

    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaDeferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      (window as any).__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
      toast.success("ISKCON Kurnool app installed successfully! You can launch it anytime from your desktop.", {
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

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? (window as any).__pwaDeferredPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).__pwaDeferredPrompt = null;
        } else {
          toast.info("Installation cancelled.");
        }
      } catch (err) {
        console.error("Error launching install prompt:", err);
      }
    } else {
      if (isInstalled) {
        toast.success("ISKCON Kurnool app is already installed on your device!");
      } else {
        // Direct browser address bar hint without displaying intermediate modal screens
        toast.info("To install on Chrome: click the Install icon (⊕) in your top address bar or menu (⋮) → 'Save and share' → 'Install ISKCON Kurnool'.", {
          duration: 6000,
        });
      }
    }
  }, [deferredPrompt, isInstalled]);

  return {
    isInstalled,
    isInstallable: !isInstalled,
    hasNativePrompt: !!deferredPrompt || (typeof window !== "undefined" && !!(window as any).__pwaDeferredPrompt),
    promptInstall,
  };
}
