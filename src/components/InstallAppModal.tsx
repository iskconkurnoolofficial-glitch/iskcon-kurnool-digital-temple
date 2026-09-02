import React from "react";
import { X, Download, Smartphone, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Share, PlusSquare, MoreVertical, Compass } from "lucide-react";
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
  const appLogo = settings.logo ? getOptimizedCloudinaryUrl(settings.logo, "thumbnail") : "/jagannatha.png";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#1c0a32] via-[#120424] to-[#0a0216] text-white rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header & App Badge */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <img
                src={appLogo}
                alt="ISKCON Kurnool"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-gold"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-full p-1 shadow-md">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {isIOS ? "iOS Mobile App" : isAndroid ? "Android App" : isMobile ? "Mobile App" : "Web & Mobile App"}
                </span>
                <span className="text-[11px] font-medium text-purple-200/60">Official PWA</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                Install ISKCON Kurnool App
              </h3>
              <p className="text-xs text-purple-200/80">Sri Sri Puri Jagannath Temple</p>
            </div>
          </div>

          {/* Installed Confirmation */}
          {isInstalled ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-300">App Already Installed!</h4>
              <p className="text-xs text-purple-200/80 mt-1">
                ISKCON Kurnool is ready on your Home Screen. Open it anytime for instant Daily Darshan & Temple updates.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center sm:text-left">
                  <Zap className="h-4 w-4 text-amber-400 mb-1 mx-auto sm:mx-0" />
                  <div className="text-[11px] font-bold text-white">Instant Access</div>
                  <div className="text-[9px] text-purple-200/70">1-tap Home Screen launch</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center sm:text-left">
                  <Smartphone className="h-4 w-4 text-amber-400 mb-1 mx-auto sm:mx-0" />
                  <div className="text-[11px] font-bold text-white">Native App Feel</div>
                  <div className="text-[9px] text-purple-200/70">Full-screen display</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center sm:text-left">
                  <ShieldCheck className="h-4 w-4 text-amber-400 mb-1 mx-auto sm:mx-0" />
                  <div className="text-[11px] font-bold text-white">Zero Storage</div>
                  <div className="text-[9px] text-purple-200/70">Lightweight & fast</div>
                </div>
              </div>

              {/* Direct Native Install Button if available */}
              {hasNativePrompt && (
                <button
                  onClick={onInstall}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-gold hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>Install App to Mobile Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {/* iOS iPhone / iPad Safari Instructions */}
              {isIOS ? (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    How to Install on iPhone / iPad (Safari)
                  </div>
                  <ol className="space-y-2.5 text-xs text-purple-100/90">
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <span>
                        Tap the <strong className="text-amber-300">Share icon <Share className="inline-block h-3.5 w-3.5 text-amber-300 ml-0.5" /></strong> in Safari&apos;s bottom bar.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <span>
                        Scroll down & tap <strong className="text-amber-300">"Add to Home Screen" <PlusSquare className="inline-block h-3.5 w-3.5 text-amber-300 ml-0.5" /></strong>.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <span>
                        Tap <strong className="text-amber-300">"Add"</strong> in the top right corner. Done!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : isAndroid && !hasNativePrompt ? (
                /* Android Chrome / Samsung Instructions when prompt is not triggered */
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    How to Install on Android Phone
                  </div>
                  <ol className="space-y-2.5 text-xs text-purple-100/90">
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <span>
                        Tap Chrome Menu <strong className="text-amber-300">(<MoreVertical className="inline-block h-3.5 w-3.5 text-amber-300" />)</strong> in the top right corner.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <span>
                        Select <strong className="text-amber-300">"Add to Home Screen"</strong> or <strong className="text-amber-300">"Install App"</strong>.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <span>
                        Tap <strong className="text-amber-300">"Install"</strong> to confirm. Shortcut created!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : !hasNativePrompt ? (
                /* Desktop Browser instructions */
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    How to Install in Browser
                  </div>
                  <ol className="space-y-2 text-xs text-purple-100/90">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-300">1.</span>
                      <span>Look for the <strong>Install Icon (⊕ or 💻)</strong> in your browser address bar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-300">2.</span>
                      <span>Or click Menu (⋮) &rarr; <strong>"Save and Share"</strong> &rarr; <strong>"Install ISKCON Kurnool"</strong>.</span>
                    </li>
                  </ol>
                </div>
              ) : null}
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[11px] text-purple-200/60">Free Devotional App</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {isInstalled ? "Done" : "Close"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
