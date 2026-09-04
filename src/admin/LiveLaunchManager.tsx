import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Lock, Unlock, CheckCircle2, ShieldCheck, Heart, RefreshCw, Eye, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LiveLaunchManager() {
  const { settings, setSettings } = useAdmin();
  const isCurrentlyLocked = !!settings.launchPageActive;
  const isLaunchingSequence = !!settings.isLaunchingSequence;

  // Trigger Launch for Public Visitors
  const handleTriggerPublicLaunch = () => {
    setSettings({
      ...settings,
      launchPageActive: true,
      isLaunchingSequence: true,
      lastLaunchedAt: Date.now(),
    });
    toast.success("🚀 Grand Launch Triggered! Public website is now playing the live confetti & rocket progress launch ceremony!");
  };

  // Instant Unlock without ceremony
  const handleInstantUnlock = () => {
    setSettings({
      ...settings,
      launchPageActive: false,
      isLaunchingSequence: false,
      lastLaunchedAt: Date.now(),
    });
    toast.success("🎉 Website UNLOCKED! ISKCON Kurnool digital portal is now LIVE for all visitors globally!");
  };

  // Re-Lock Website
  const handleReLockWebsite = () => {
    setSettings({
      ...settings,
      launchPageActive: true,
      isLaunchingSequence: false,
    });
    toast.info("🔒 Launch Lock ENABLED: Public visitors will now see the Coming Soon countdown timer.");
  };

  return (
    <div className="relative min-h-[80vh] w-full rounded-3xl bg-gradient-to-br from-[#380006] via-[#73020f] to-[#1c0002] text-white p-6 sm:p-10 overflow-hidden font-sans border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
          y: [0, -30, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-red-600/10 to-transparent blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-red-600/20 blur-[110px] pointer-events-none"
      />

      {/* 1. Header Row */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-400/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-lg group-hover:bg-amber-400/60 transition" />
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="ISKCON Logo"
                className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-amber-400/80 shadow-2xl"
              />
            ) : (
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-600 grid place-items-center text-red-950 font-display font-black text-xl shadow-2xl ring-2 ring-amber-300">
                IK
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Master Launch Control</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Website Live Launch Control
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isLaunchingSequence ? (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-extrabold tracking-wider uppercase animate-pulse shadow-lg">
              <Rocket className="h-4 w-4 text-amber-400 animate-bounce" />
              <span>Launch Sequence Active on Website</span>
            </span>
          ) : isCurrentlyLocked ? (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 text-xs font-extrabold tracking-wider uppercase shadow-lg">
              <Lock className="h-4 w-4 text-red-400" />
              <span>Launch Lock: ACTIVE (Coming Soon Screen)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-extrabold tracking-wider uppercase shadow-lg">
              <Unlock className="h-4 w-4 text-emerald-400" />
              <span>Site is LIVE for ALL VISITORS</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Center Control Body */}
      <div className="relative z-20 my-8 flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto">
        
        <div className="space-y-4">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight drop-shadow-2xl">
            Grand Website Launch Control<br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent">
              Sri Sri Puri Jagannath Temple
            </span>
          </h2>

          <p className="text-amber-100/90 text-sm sm:text-base max-w-xl mx-auto font-medium">
            When you click <strong className="text-amber-300">"LAUNCH WEBSITE LIVE"</strong> below, it triggers the ceremonial ribbon cut, confetti explosion, and 30-second progress bar <strong className="text-amber-300">directly on the public website</strong> for all visiting devotees!
          </p>
        </div>

        {/* Big Launch Action Buttons */}
        <div className="w-full max-w-xl space-y-6 pt-2">
          
          {/* PRIMARY LAUNCH BUTTON */}
          <button
            onClick={handleTriggerPublicLaunch}
            className="w-full relative group overflow-hidden px-8 py-5 sm:py-6 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 hover:scale-105 active:scale-95 ring-4 ring-amber-400/50 shadow-2xl font-display font-black text-xl sm:text-2xl tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Rocket className="h-7 w-7 text-red-950 animate-bounce shrink-0" />
            <span>🚀 LAUNCH WEBSITE LIVE FOR ALL</span>
            <Sparkles className="h-6 w-6 text-red-950 shrink-0" />
          </button>

          {/* SECONDARY CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {isCurrentlyLocked ? (
              <button
                onClick={handleInstantUnlock}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-400/50 text-emerald-200 font-extrabold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Instant Unlock (Skip Animation)</span>
              </button>
            ) : (
              <button
                onClick={handleReLockWebsite}
                className="w-full py-3.5 px-4 rounded-2xl bg-red-900/60 hover:bg-red-800/80 border border-red-400/50 text-red-200 font-extrabold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Lock className="h-4 w-4 text-red-400" />
                <span>Re-Lock (Enable Coming Soon)</span>
              </button>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-black/50 hover:bg-black/70 border border-amber-400/40 text-amber-200 font-extrabold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Eye className="h-4 w-4 text-amber-400" />
              <span>Preview Public Website</span>
            </a>
          </div>

        </div>

      </div>

      {/* 3. Footer info */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-400/20 pt-6 text-xs text-amber-200/80 font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Central Real-Time Launch Controller</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Designed &amp; Developed for ISKCON Kurnool by</span>
          <span className="font-bold text-amber-300">Devesh</span>
          <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
        </div>
      </div>

    </div>
  );
}
