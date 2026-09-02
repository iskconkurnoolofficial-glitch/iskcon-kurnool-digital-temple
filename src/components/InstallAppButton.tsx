import React from "react";
import { Smartphone, Monitor, Download, CheckCircle } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import InstallAppModal from "./InstallAppModal";
import { useAdmin } from "@/context/AdminContext";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

interface InstallAppButtonProps {
  variant?: "footer" | "drawer" | "banner";
  className?: string;
}

export default function InstallAppButton({ variant = "footer", className = "" }: InstallAppButtonProps) {
  const { settings } = useAdmin();
  const { isInstalled, hasNativePrompt, promptInstall, isModalOpen, closeModal, deviceInfo } = usePwaInstall();
  const appLogo = settings.logo ? getOptimizedCloudinaryUrl(settings.logo, "thumbnail") : "/jagannatha.png";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    promptInstall();
  };

  const IconComponent = deviceInfo.isMobile ? Smartphone : Monitor;

  if (variant === "drawer") {
    return (
      <>
        <button
          onClick={handleClick}
          type="button"
          className={`w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-slate-900 transition-all flex items-center justify-between group cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            {appLogo ? (
              <img
                src={appLogo}
                alt="App Icon"
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-amber-400/60 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                {isInstalled ? <CheckCircle className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </div>
            )}
            <div className="text-left">
              <span className="font-bold text-xs block text-slate-900 leading-tight">
                {isInstalled ? "App Installed" : "Install Mobile App"}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isInstalled ? "Launch from Home Screen" : "1-Tap Home Screen shortcut"}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
            {isInstalled ? "Installed" : "Install"}
          </span>
        </button>

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
  }

  return (
    <>
      <button
        onClick={handleClick}
        type="button"
        title="Install ISKCON Kurnool application on your device"
        className={`group flex items-center gap-2 text-footer-foreground/80 hover:text-secondary transition-all duration-300 text-sm text-left cursor-pointer ${className}`}
      >
        <IconComponent className="h-3.5 w-3.5 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
        <span>{isInstalled ? "App Installed" : deviceInfo.isMobile ? "Install Mobile App" : "Install App"}</span>
      </button>

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
}
