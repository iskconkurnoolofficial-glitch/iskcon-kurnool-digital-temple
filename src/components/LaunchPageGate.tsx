import { ReactNode, useState, useEffect, useRef } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Instagram, MapPin, X, Heart, Sparkles, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LaunchPageGateProps {
  children: ReactNode;
}

export default function LaunchPageGate({ children }: LaunchPageGateProps) {
  const { settings, setSettings } = useAdmin();
  
  // Secret Admin passcode modal state
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Launching sequence states
  const [isLaunchingSequence, setIsLaunchingSequence] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchStageText, setLaunchStageText] = useState("Initializing Launch Ceremony...");
  const [showConfetti, setShowConfetti] = useState(false);

  // 30-Second Post-Launch Confetti Flowing State on Main Website
  const [showPostLaunchCelebration, setShowPostLaunchCelebration] = useState(false);

  // Logo triple click counter for secret admin access
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Local storage bypass
  const [localBypass, setLocalBypass] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("iskcon_launch_bypass_code");
    return !!stored && stored.trim().toLowerCase() === (settings.launchBypassCode || "108").trim().toLowerCase();
  });

  const isConfigPath =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/auth"));

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!settings.launchPageActive || isConfigPath) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(settings.launchDate || "2026-09-04T00:00:00").getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.launchPageActive, settings.launchDate, isConfigPath]);

  // Triple click logo to trigger secret passcode modal
  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 3) {
      setShowSecretModal(true);
      setLogoClickCount(0);
    }
  };

  // Handle Passcode verification
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEntered = enteredCode.trim().toLowerCase();
    const targetCode = (settings.launchBypassCode || "108").trim().toLowerCase();

    if (cleanEntered === targetCode) {
      localStorage.setItem("iskcon_launch_bypass_code", cleanEntered);
      setLocalBypass(true);
      setAuthError("");
      setShowSecretModal(false);
      toast.success("Access Unlocked!");
    } else {
      setAuthError("Incorrect Passcode.");
    }
  };

  // Auto-trigger launch sequence when Admin sets isLaunchingSequence = true
  useEffect(() => {
    if (settings.isLaunchingSequence && !isLaunchingSequence) {
      handleTriggerLaunch();
    }
  }, [settings.isLaunchingSequence]);

  // Trigger 30-second post-launch confetti celebration on live site when launched
  useEffect(() => {
    if (!settings.launchPageActive && settings.lastLaunchedAt) {
      const elapsed = Date.now() - settings.lastLaunchedAt;
      if (elapsed < 30000) {
        setShowPostLaunchCelebration(true);
      }
    }
  }, [settings.launchPageActive, settings.lastLaunchedAt]);

  // Launch Trigger Handler
  const handleTriggerLaunch = () => {
    setShowConfetti(true);
    setIsLaunchingSequence(true);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setLaunchProgress(Math.min(currentProgress, 100));

      if (currentProgress < 20) {
        setLaunchStageText("✂️ Ribbon Cut Ceremony Completed!");
      } else if (currentProgress < 40) {
        setLaunchStageText("🌸 Chanting Hare Krishna Mahamantra...");
      } else if (currentProgress < 60) {
        setLaunchStageText("🪔 Invoking Divine Blessings of Sri Sri Jagannath...");
      } else if (currentProgress < 85) {
        setLaunchStageText("✨ Unlocking Digital Temple Portal & Live Features...");
      } else {
        setLaunchStageText("🎉 WEBSITE LAUNCHED SUCCESSFULLY!");
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSettings({
            ...settings,
            launchPageActive: false,
            isLaunchingSequence: false,
            lastLaunchedAt: Date.now(),
          });

          setShowPostLaunchCelebration(true);
          toast.success("🎉 ISKCON Kurnool Website is now LIVE!");
        }, 800);
      }
    }, 300);
  };

  // Render main site if launch lock is inactive or path is /admin
  if (!settings.launchPageActive || isConfigPath) {
    return (
      <>
        {showPostLaunchCelebration && (
          <CelebratoryConfettiBlasts30s onDismiss={() => setShowPostLaunchCelebration(false)} />
        )}
        {children}
      </>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#380006] via-[#73020f] to-[#1c0002] text-white overflow-x-hidden font-sans select-none">
      
      {/* Dynamic Background Particle Canvas */}
      <BackgroundParticles />
      {showConfetti && <ConfettiCanvas />}

      {/* Radiant Floating Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
          y: [0, -30, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-amber-500/20 via-red-600/10 to-transparent blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 40, 0]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-10 left-10 h-[400px] w-[400px] rounded-full bg-yellow-500/15 blur-[110px] pointer-events-none"
      />

      {/* Modern Metallic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 1. Header Layout */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Temple Logo & Title (Triple click triggers hidden access) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3.5 cursor-pointer group"
          title="ISKCON Kurnool"
        >
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool Logo" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-amber-400/80 shadow-2xl transition group-hover:scale-105" />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-600 grid place-items-center text-red-950 font-display font-black text-base sm:text-lg shadow-2xl border border-amber-200">
              IK
            </div>
          )}
          <div className="leading-tight text-left">
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white block">ISKCON Kurnool</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200/90 font-semibold block">Sri Sri Puri Jagannath Temple</span>
          </div>
        </div>

        {/* Clean Header Right: Instagram Channel Button */}
        <a
          href={settings.instagram || "https://instagram.com/iskcon_kurnool"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/40 bg-black/30 hover:bg-black/50 hover:border-amber-400/70 transition-all duration-300 text-xs font-bold tracking-wider text-amber-200 uppercase cursor-pointer backdrop-blur-md shadow-lg"
        >
          <Instagram className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Follow Instagram</span>
        </a>
      </header>

      {/* 2. Main Hero Body */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto py-8 sm:py-12 space-y-6 sm:space-y-8">
        
        {/* Greeting Badge */}
        <div className="space-y-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/25 to-amber-500/20 border border-amber-400/50 text-amber-300 font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-xl backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <span>Hare Krishna • Grand Digital Portal Launch</span>
          </motion.div>

          {/* MAIN LAUNCH TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight drop-shadow-2xl"
          >
            ISKCON Kurnool Website<br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent drop-shadow-md">
              Launching Today
            </span>
          </motion.h1>

          {/* HIGHLIGHTED LAUNCH DATE BOX: SEPTEMBER 4TH 2026 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="pt-2"
          >
            <div className="inline-block px-7 py-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-2 border-amber-400/70 text-amber-300 font-display font-black text-xl sm:text-3xl tracking-widest uppercase shadow-2xl backdrop-blur-md ring-4 ring-amber-400/15">
              SEPTEMBER 4TH 2026
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-amber-100/90 text-base sm:text-lg max-w-xl mx-auto font-medium"
          >
            Official Digital Experience of Sri Sri Jagannath Baladev Subhadra Temple
          </motion.p>

          {/* Developer Credit Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-2 text-white/90 font-sans tracking-wide text-xs sm:text-sm md:text-base mt-2 bg-black/25 px-4 py-1.5 rounded-full border border-white/10 shadow-md"
          >
            <span>Designed and Developed by</span>
            <span className="font-bold text-amber-300">Devesh</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse shrink-0" />
          </motion.div>
        </div>

        {/* SATIN RED RIBBON BANNER ON LAUNCH PAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.32 }}
          className="w-full max-w-3xl py-2 relative my-2"
        >
          <div className="relative w-full py-6 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 h-14 sm:h-16 bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-y-4 border-amber-300 shadow-2xl flex items-center justify-between px-6 z-10">
              <div className="w-1/2 h-full bg-gradient-to-r from-red-800 to-red-600 border-r-2 border-amber-400 flex items-center justify-start pl-4">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-200 uppercase">ISKCON KURNOOL</span>
              </div>
              <div className="w-1/2 h-full bg-gradient-to-l from-red-800 to-red-600 border-l-2 border-amber-400 flex items-center justify-end pr-4">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-200 uppercase font-black">GRAND OPENING</span>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-14 w-14 sm:h-18 sm:w-18 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-4 border-amber-100 shadow-2xl grid place-items-center text-primary">
                <div className="text-center">
                  <span className="font-display font-black text-xs sm:text-sm text-red-950 block leading-tight">2026</span>
                  <span className="text-[8px] font-black text-amber-900 uppercase block">LAUNCH</span>
                </div>
              </div>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>
        </motion.div>

        {/* 3. Countdown Timer Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl w-full"
        >
          <TimeBlock val={timeLeft.days} label="DAYS" />
          <TimeBlock val={timeLeft.hours} label="HOURS" />
          <TimeBlock val={timeLeft.minutes} label="MINUTES" />
          <TimeBlock val={timeLeft.seconds} label="SECONDS" />
        </motion.div>

        {/* 5. Discover Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="space-y-4 border-t border-b border-amber-400/20 py-6 w-full max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-amber-300/80 block font-extrabold">Discover Temple Services</span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold text-white/90">
            <span className="px-3.5 py-1.5 rounded-full bg-black/25 border border-white/10 shadow-md">🪔 Daily Darshan</span>
            <span className="px-3.5 py-1.5 rounded-full bg-black/25 border border-white/10 shadow-md">🌸 Festivals &amp; Sevas</span>
            <span className="px-3.5 py-1.5 rounded-full bg-black/25 border border-white/10 shadow-md">📖 Bhagavad Gita</span>
            <span className="px-3.5 py-1.5 rounded-full bg-black/25 border border-white/10 shadow-md">🚌 Youth Yatra 2026</span>
            <span className="px-3.5 py-1.5 rounded-full bg-black/25 border border-white/10 shadow-md">🍚 Sunday Prasadam</span>
          </div>
        </motion.div>

      </main>

      {/* 6. Footer Layout */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-400/15 text-amber-100/70 text-xs sm:text-sm">
        <a
          href={settings.instagram || "https://instagram.com/iskcon_kurnool"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-red-950 font-bold shadow-lg transition duration-200 text-xs tracking-wider uppercase cursor-pointer"
        >
          <Instagram className="h-4 w-4" />
          Follow Us on Instagram
        </a>

        <div className="flex items-center gap-2 font-semibold text-amber-200/90">
          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
          📍 ISKCON Kurnool Temple Premises
        </div>
      </footer>

      {/* HIDDEN SECRET PASSCODE MODAL */}
      <AnimatePresence>
        {showSecretModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#260206] border-2 border-amber-400/40 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left"
            >
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setAuthError("");
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-extrabold text-white">Enter Access Key</h3>
                  <p className="text-amber-200/70 text-xs font-sans mt-0.5">Enter passcode to bypass coming soon screen.</p>
                </div>

                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter passcode..."
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-400/30 rounded-xl bg-black/40 text-white placeholder-white/30 text-center font-bold tracking-widest text-lg focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  {authError && (
                    <p className="text-red-400 text-xs font-semibold text-center animate-pulse">{authError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 rounded-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-gold"
                  >
                    Unlock Site Access
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 30-SECOND LAUNCHING PROGRESS OVERLAY WITH SPARKLE BACKGROUND ANIMATIONS */}
      <AnimatePresence>
        {isLaunchingSequence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-[#400007] via-[#6e010f] to-[#210003] border-2 border-amber-400/70 rounded-[36px] max-w-lg w-full p-8 sm:p-10 shadow-2xl text-center space-y-7 relative overflow-hidden"
            >
              {/* SPARKLE BACKGROUND ANIMATIONS */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(14)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.2, 0.9, 0.2],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    style={{
                      top: `${(i * 17) % 90}%`,
                      left: `${(i * 23) % 90}%`,
                    }}
                    className="absolute text-amber-300/60"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ))}
              </div>

              <div className="absolute top-0 right-1/2 translate-x-1/2 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col items-center justify-center pt-2">
                <motion.div
                  animate={{
                    y: [0, -14, 0],
                    rotate: [-1, 1.5, -1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 p-5 rounded-3xl bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 border-2 border-amber-200 text-red-950 shadow-gold"
                >
                  <Rocket className="h-12 w-12 text-red-950 -rotate-45 transform" />
                  {settings.logo && (
                    <img
                      src={settings.logo}
                      alt="ISKCON Emblem"
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full object-cover ring-2 ring-amber-300 shadow-md"
                    />
                  )}
                </motion.div>
                <motion.div
                  animate={{ scaleY: [0.8, 1.4, 0.9], opacity: [0.7, 1, 0.8] }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                  className="w-8 h-10 bg-gradient-to-b from-yellow-300 via-amber-500 to-red-600 rounded-b-full blur-[2px] -mt-1 shadow-lg"
                />
              </div>

              <div className="space-y-2 relative z-10">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                  <span>Launching ISKCON Kurnool</span>
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                </h2>
                <p className="text-amber-300 text-sm font-extrabold tracking-wide uppercase">
                  {launchStageText}
                </p>
              </div>

              {/* Progress Bar Container with Sparkle Rays */}
              <div className="space-y-2 relative z-10">
                <div className="w-full h-5 rounded-full bg-black/60 p-1 border border-amber-400/50 shadow-inner overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 shadow-gold relative overflow-hidden"
                    style={{ width: `${launchProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  >
                    {/* Animated Sparkle Ray shimmer inside progress bar */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[size:1rem_1rem] animate-pulse" />
                  </motion.div>
                </div>

                <div className="flex justify-between items-center text-xs font-black text-amber-300 tracking-wider">
                  <span>LAUNCHING PORTAL</span>
                  <span className="text-sm font-black text-amber-200">{launchProgress}%</span>
                </div>
              </div>

              <div className="pt-2 min-h-[60px] flex items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={Math.floor(launchProgress / 20)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="p-3 rounded-2xl bg-black/30 border border-amber-400/20 text-xs font-medium text-amber-100/90 italic max-w-md"
                  >
                    {launchProgress < 20 && "“Chant Hare Krishna and be happy.” — Srila Prabhupada"}
                    {launchProgress >= 20 && launchProgress < 40 && "“Always think of Me, become My devotee, worship Me and offer your homage unto Me.” — Bhagavad Gita 18.65"}
                    {launchProgress >= 40 && launchProgress < 60 && "“Whatever action a great man performs, common men follow.” — Bhagavad Gita 3.21"}
                    {launchProgress >= 60 && launchProgress < 80 && "“Pure devotion to Lord Krishna is the highest perfection of life.” — Srimad Bhagavatam"}
                    {launchProgress >= 80 && "“Welcome to the official digital portal of ISKCON Kurnool! All Glories to Srila Prabhupada!”"}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-1 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setLaunchProgress(100);
                    setSettings({
                      ...settings,
                      launchPageActive: false,
                      isLaunchingSequence: false,
                      lastLaunchedAt: Date.now(),
                    });
                    setShowPostLaunchCelebration(true);
                    toast.success("🎉 ISKCON Kurnool Website is now LIVE!");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/30 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase transition cursor-pointer"
                >
                  <span>⚡ Instant Launch (Skip Wait)</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// INTENSE CONTINUOUS FLOWING CONFETTI CELEBRATION (Renders across live website without labels or sound)
function CelebratoryConfettiBlasts30s({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 30-second countdown timer to automatically clear canvas
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // High-Density Dual Cannon & Rain Confetti Particle Physics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#FFD700", "#FF4500", "#FF1493", "#00E5FF", "#76FF03", 
      "#FFC107", "#FFFFFF", "#E040FB", "#FF6E40", "#FFEA00", "#00E676"
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      gravity: number;
      drag: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle" | "petal" | "ribbon";
      opacity: number;
    }

    const particles: Particle[] = [];

    // Continuous blast emitter (fires from bottom left, bottom right, and top rain)
    const blastCannons = () => {
      // Bottom Left Cannon
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * 80,
          y: height - 10,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: Math.random() * 14 + 6,
          vy: -(Math.random() * 18 + 12),
          gravity: 0.22,
          drag: 0.975,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 14,
          shape: Math.random() > 0.3 ? "rect" : Math.random() > 0.5 ? "petal" : "ribbon",
          opacity: 1,
        });
      }

      // Bottom Right Cannon
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: width - Math.random() * 80,
          y: height - 10,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: -(Math.random() * 14 + 6),
          vy: -(Math.random() * 18 + 12),
          gravity: 0.22,
          drag: 0.975,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 14,
          shape: Math.random() > 0.3 ? "rect" : Math.random() > 0.5 ? "petal" : "ribbon",
          opacity: 1,
        });
      }

      // Top Rain Emitter
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * width,
          y: -20,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 5 + 4,
          gravity: 0.15,
          drag: 0.98,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          opacity: 1,
        });
      }
    };

    // Initial Blast
    blastCannons();

    // Rhythmic continuous blasts every 800ms
    const blastInterval = setInterval(() => {
      blastCannons();
    }, 800);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.0025;

        if (p.opacity <= 0 || p.y > height + 60) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2.8);
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, p.size, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(blastInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999]"
    />
  );
}

// Time block display
function TimeBlock({ val, label }: { val: number; label: string }) {
  const formattedVal = val.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-black/40 to-black/60 border border-amber-400/30 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="font-sans font-black tabular-nums text-2xl sm:text-4xl md:text-5xl text-amber-300 tracking-tight leading-none drop-shadow-md">
        {formattedVal}
      </span>
      <span className="text-[8px] sm:text-[10px] tracking-widest font-black text-amber-200/60 mt-1 sm:mt-2">
        {label}
      </span>
    </div>
  );
}

// Background Floating Particles
function BackgroundParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.6 + 0.4,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
          className="absolute w-2 h-2 rounded-full bg-amber-300/40 blur-[1px]"
        />
      ))}
    </div>
  );
}

// Confetti Canvas Engine for Coming Soon launcher screen
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#FFD700", "#FF4500", "#FF69B4", "#FF8C00", "#FFFFFF", "#FF1493", "#FFA500", "#DAA520"];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle" | "petal";
      opacity: number;
    }

    const particles: Particle[] = [];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "petal" : "circle",
        opacity: Math.random() * 0.4 + 0.6,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, p.size, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
