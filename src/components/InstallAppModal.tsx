import { X, Download, Monitor, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  hasNativePrompt: boolean;
  isInstalled: boolean;
  browserInfo: {
    isChrome: boolean;
    isEdge: boolean;
    isBrave: boolean;
    isDesktop: boolean;
    isWindows: boolean;
    isMac: boolean;
  };
}

export default function InstallAppModal({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isInstalled,
  browserInfo,
}: InstallAppModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#19092c] via-[#10031f] to-[#090214] text-white rounded-3xl border border-secondary/30 p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header & Icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src="/jagannatha.png"
                alt="ISKCON Kurnool"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/50 shadow-gold"
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary text-primary rounded-full p-1 shadow-md">
                <Monitor className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                  Desktop App
                </span>
                <span className="text-[11px] font-medium text-white/50">Google Chrome & Windows</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                Install ISKCON Kurnool
              </h3>
              <p className="text-xs text-white/70">Sri Sri Puri Jagannath Temple</p>
            </div>
          </div>

          {/* App Status / Success check if already installed */}
          {isInstalled ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-300">Desktop App Already Installed!</h4>
              <p className="text-xs text-white/70 mt-1">
                You can launch ISKCON Kurnool directly from your Windows Desktop or Application Menu.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                  <Zap className="h-4 w-4 text-secondary mb-1.5" />
                  <div className="text-xs font-semibold text-white">Ultra Fast</div>
                  <div className="text-[10px] text-white/60">Instant standalone launch</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                  <Monitor className="h-4 w-4 text-secondary mb-1.5" />
                  <div className="text-xs font-semibold text-white">Desktop Icon</div>
                  <div className="text-[10px] text-white/60">Pin to Taskbar & Desktop</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                  <ShieldCheck className="h-4 w-4 text-secondary mb-1.5" />
                  <div className="text-xs font-semibold text-white">Distraction Free</div>
                  <div className="text-[10px] text-white/60">Clean devotional window</div>
                </div>
              </div>

              {/* Install Action Button (if native prompt is active) */}
              {hasNativePrompt ? (
                <button
                  onClick={onInstall}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-secondary via-amber-400 to-secondary text-slate-950 font-bold text-sm tracking-wide shadow-gold hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Install App to Chrome / PC Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}

              {/* How to install in Chrome instructions */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4.5 mb-6 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-3">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  How to Install in Google Chrome
                </div>
                <ol className="space-y-3 text-xs text-white/80">
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary font-bold text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <span>
                      In <strong>Google Chrome</strong>, look at the address bar (URL bar) on the top right for the{" "}
                      <strong className="text-secondary">Install icon (⊕ or 💻)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary font-bold text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <span>
                      <em>Alternatively:</em> Click Chrome&apos;s <strong>Three Dots Menu (⋮)</strong> in the top-right corner &rarr;{" "}
                      <strong>&quot;Save and Share&quot;</strong> (or <strong>&quot;Cast, save and share&quot;</strong>) &rarr;{" "}
                      <strong>&quot;Install ISKCON Kurnool...&quot;</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary font-bold text-[11px] flex items-center justify-center">
                      3
                    </span>
                    <span>
                      Click <strong>&quot;Install&quot;</strong> in the pop-up. An ISKCON Kurnool desktop shortcut will be added to your PC!
                    </span>
                  </li>
                </ol>
              </div>

              {/* Edge/Other browser note */}
              {browserInfo.isEdge && (
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-[11px] text-sky-200 mb-4">
                  <strong>Microsoft Edge User?</strong> Click the <strong>App icon (⊞)</strong> in the address bar or menu (⋯) &rarr; <em>Apps</em> &rarr; <em>Install this site as an app</em>.
                </div>
              )}
            </>
          )}

          {/* Footer Close */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold transition-colors"
            >
              {isInstalled ? "Done" : "Close"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
