import React, { useState, useEffect } from "react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import InstallAppModal from "./InstallAppModal";
import { Smartphone, Download, X, Sparkles } from "lucide-react";

export const MobileInstallBanner: React.FC = () => {
  const { isInstalled, hasNativePrompt, promptInstall, isModalOpen, closeModal, deviceInfo } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if dismissed previously within 7 days
    const dismissedTime = localStorage.getItem("iskcon_mobile_banner_dismissed");
    if (dismissedTime) {
      const elapsedMs = Date.now() - Number(dismissedTime);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (elapsedMs < sevenDaysMs) {
        setDismissed(true);
        return;
      }
    }

    setDismissed(false);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem("iskcon_mobile_banner_dismissed", String(Date.now()));
    } catch {}
  };

  if (isInstalled || dismissed) {
    return (
      <InstallAppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onInstall={promptInstall}
        hasNativePrompt={hasNativePrompt}
        isInstalled={isInstalled}
        deviceInfo={deviceInfo}
      />
    );
  }

  return (
    <>
      <aside
        aria-label="Mobile app install notification"
        className="fixed bottom-16 sm:bottom-20 inset-x-3 z-30 lg:hidden max-w-md mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e0a38] via-[#2d1154] to-[#17062e] text-white p-3.5 shadow-2xl border border-amber-400/40 backdrop-blur-xl flex items-center justify-between gap-3 group">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

          {/* App Logo & Details */}
          <div className="flex items-center gap-3 min-w-0" onClick={promptInstall}>
            <img
              src="/jagannatha.png"
              alt="ISKCON Kurnool"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400/60 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-300 font-extrabold">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span>Mobile App</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate leading-tight">
                Install ISKCON Kurnool
              </h4>
              <p className="text-[10px] text-purple-200/80 truncate">
                Fast, 1-tap Home Screen access
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={promptInstall}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <InstallAppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onInstall={promptInstall}
        hasNativePrompt={hasNativePrompt}
        isInstalled={isInstalled}
        deviceInfo={deviceInfo}
      />
    </>
  );
};

export default MobileInstallBanner;
