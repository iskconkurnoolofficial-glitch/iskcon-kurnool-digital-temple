import React from "react";
import { X, Download, Smartphone, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Share, PlusSquare, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  hasNativePrompt: boolean;
  isInstalled: boolean;
  deviceInfo?: {
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isChrome: boolean;
    isSafari: boolean;
  };
}

export default function InstallAppModal({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isInstalled,
  deviceInfo = { isMobile: false, isIOS: false, isAndroid: false, isChrome: false, isSafari: false },
}: InstallAppModalProps) {
  const { settings } = useAdmin();

  if (!isOpen || isInstalled) return null;

  const { isMobile, isIOS, isAndroid } = deviceInfo;
  const appLogo = settings.logo ? getOptimizedCloudinaryUrl(settings.logo, "thumbnail") : "/iskcon-logo.png";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#1f0b36] via-[#140529] to-[#0a0216] text-white rounded-3xl border border-amber-500/40 p-6 sm:p-7 shadow-2xl overflow-hidden my-6"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header & Logo */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0">
              <img
                src={appLogo}
                alt="ISKCON Kurnool"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-gold"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-full p-1 shadow-md">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {isIOS ? "iOS Mobile App" : isAndroid ? "Android App" : isMobile ? "Mobile App" : "Official App"}
                </span>
                <span className="text-[10px] font-semibold text-amber-200/70">1-Tap Install</span>
              </div>
              <h3 className="text-xl font-extrabold font-display text-white mt-1 leading-tight tracking-tight">
                INSTALL ISKCON KURNOOL APP
              </h3>
              <p className="text-xs text-amber-100/70 mt-0.5">Sri Sri Puri Jagannath Temple</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
              <Zap className="h-4 w-4 text-amber-400 mb-1 mx-auto" />
              <div className="text-[11px] font-bold text-white">Instant Access</div>
              <div className="text-[9px] text-purple-200/70">1-Tap launch</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
              <Smartphone className="h-4 w-4 text-amber-400 mb-1 mx-auto" />
              <div className="text-[11px] font-bold text-white">Daily Darshan</div>
              <div className="text-[9px] text-purple-200/70">Live updates</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
              <ShieldCheck className="h-4 w-4 text-amber-400 mb-1 mx-auto" />
              <div className="text-[11px] font-bold text-white">Zero Storage</div>
              <div className="text-[9px] text-purple-200/70">Fast & light</div>
            </div>
          </div>

          {/* Direct Install CTA Button */}
          <button
            onClick={onInstall}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:via-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer my-2"
          >
            <Download className="h-5 w-5 shrink-0" />
            <span>INSTALL ISKCON KURNOOL APP</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>

          {/* iOS Safari explicit instructions fallback */}
          {isIOS && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mt-4 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                iOS Safari Installation Guide
              </div>
              <ol className="space-y-1.5 text-xs text-purple-100/90">
                <li className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap <strong>Share <Share className="inline-block h-3.5 w-3.5 text-amber-300 ml-0.5" /></strong> in Safari navigation bar</span>
                </li>
                <li className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Select <strong>"Add to Home Screen" <PlusSquare className="inline-block h-3.5 w-3.5 text-amber-300 ml-0.5" /></strong></span>
                </li>
                <li className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span>Tap <strong>"Add"</strong> to confirm</span>
                </li>
              </ol>
            </div>
          )}

          {/* Android non-prompt instructions fallback */}
          {isAndroid && !hasNativePrompt && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-3 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Android Menu Install
              </div>
              <p className="text-[11px] text-purple-200/80 mt-1">
                Tap Chrome menu <MoreVertical className="inline-block h-3.5 w-3.5 text-amber-300" /> & select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
              </p>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
            <span className="text-[10px] text-purple-200/60 font-medium">Free Official Temple App</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
