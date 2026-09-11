import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X, CheckCircle, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { motion, AnimatePresence } from "framer-motion";

export default function PushNotificationPrompt() {
  const { isSupported, permission, isSubscribed, promptDismissed, requestPermissionAndSubscribe, dismissPrompt } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip if on admin routes
    if (window.location.pathname.startsWith("/admin")) return;

    // Show after 3.5s delay if supported, permission is default, not subscribed, and prompt not dismissed
    if (isSupported && permission === "default" && !isSubscribed && !promptDismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, promptDismissed]);

  if (!visible || !isSupported || permission !== "default" || isSubscribed || promptDismissed) {
    return null;
  }

  const handleEnable = async () => {
    const success = await requestPermissionAndSubscribe();
    if (success) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9990] animate-fade-in">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative bg-gradient-to-r from-[#1d0935] via-[#120324] to-[#0b0216] border border-amber-400/40 rounded-3xl p-5 shadow-2xl text-white overflow-hidden backdrop-blur-lg"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-gold flex items-center justify-center text-slate-950">
                <Bell className="h-6 w-6 animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-900 border border-amber-400 rounded-full p-0.5">
                <Sparkles className="h-3 w-3 text-amber-300" />
              </div>
            </div>

            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Mobile Notifications
                </span>
              </div>
              <h4 className="font-display text-base font-bold text-white leading-tight">
                Get Daily Darshan & Temple Alerts
              </h4>
              <p className="text-xs text-amber-100/80 leading-snug">
                Receive instant notifications on your phone for morning Sringara Darshan, Live Aarti streams, and Festival Sevas.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleEnable}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs tracking-wide shadow-gold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Bell className="h-3.5 w-3.5 fill-slate-950" />
                  <span>Enable Notifications</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold transition cursor-pointer"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
