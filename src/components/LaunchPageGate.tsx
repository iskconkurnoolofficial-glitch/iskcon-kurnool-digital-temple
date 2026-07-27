import { ReactNode, useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Instagram, MapPin, Key, Lock, ArrowRight, X, Heart, User, Phone, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LaunchPageGate({ children }: { children: ReactNode }) {
  const { settings, ready, addPreviewLead } = useAdmin();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Preview Unlock form states
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUnlocked, setPreviewUnlocked] = useState(false);

  // Check if user previously unlocked preview
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked =
        sessionStorage.getItem("iskcon_preview_unlocked") === "true" ||
        localStorage.getItem("iskcon_preview_unlocked") === "true";
      if (isUnlocked) setPreviewUnlocked(true);
    }
  }, []);

  // 1. Check if launch page is active & passcode bypass status
  const localBypassCode = typeof window !== "undefined" ? localStorage.getItem("iskcon_launch_bypass_code") : null;
  const isBypassed =
    !!localBypassCode &&
    !!settings.launchBypassCode &&
    localBypassCode.trim().toLowerCase() === settings.launchBypassCode.trim().toLowerCase();

  // If path is admin login/dashboard, bypass the coming soon lock screen!
  const isConfigPath =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/auth"));

  // Calculate countdown
  useEffect(() => {
    if (!settings.launchPageActive || isBypassed || isConfigPath) return;

    const calculateTimeLeft = () => {
      const launchTime = new Date(settings.launchDate || "2026-07-15T09:00:00").getTime();
      const now = new Date().getTime();
      const difference = launchTime - now;

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
  }, [settings.launchPageActive, settings.launchDate, isBypassed, isConfigPath]);

  // Handle bypass entry
  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.trim().toLowerCase() === settings.launchBypassCode?.trim().toLowerCase()) {
      localStorage.setItem("iskcon_launch_bypass_code", enteredCode.trim());
      setCodeError("");
      setShowCodeModal(false);
      window.location.reload();
    } else {
      setCodeError("Invalid Passcode. Please try again.");
    }
  };

  // Handle unlock preview form submission
  const handleUnlockPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const name = visitorName.trim();
    const phone = visitorPhone.trim();

    if (!name) {
      setFormError("Please enter your name.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addPreviewLead({ name, phone });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("iskcon_preview_unlocked", "true");
      }
      setPreviewUnlocked(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent hydration/loading flicker by holding rendering until Supabase context settings load
  if (!ready) {
    if (isConfigPath) return <>{children}</>;
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // Render original site children if launch page is inactive or user is bypassed
  if (!settings.launchPageActive || isBypassed || isConfigPath) {
    return <>{children}</>;
  }

  // Format launch date nicely
  const formattedLaunchDate = (() => {
    try {
      if (!settings.launchDate) return "July 12, 2026";
      const dateObj = new Date(settings.launchDate);
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return settings.launchDate || "July 12, 2026";
    }
  })();

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-[#130722] to-[#02050c] text-white overflow-hidden font-sans select-none">
      
      {/* Mesh glowing decoration overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#5b2c9b]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* 1. Header Layout */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo Left */}
        <div className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool Logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary/60" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-accent grid place-items-center text-white font-display font-bold text-sm shadow-glow">
              IK
            </div>
          )}
          <div className="hidden sm:block leading-tight text-left">
            <span className="font-display font-extrabold text-base tracking-tight text-white block">ISKCON Kurnool</span>
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">Sri Sri Puri Jagannath Temple</span>
          </div>
        </div>

        {/* Enter Code Button Right */}
        <button
          onClick={() => setShowCodeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-xs font-semibold tracking-wider text-white uppercase cursor-pointer"
        >
          <Key className="h-3.5 w-3.5 text-accent" />
          Enter Code
        </button>
      </header>

      {/* 2. Main Coming Soon Body */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto py-12 space-y-10">
        
        {/* Hare Krishna + Heading */}
        <div className="space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-xs sm:text-sm tracking-widest uppercase"
          >
            Hare Krishna 🙏
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight"
          >
            A Divine Digital Experience<br />is Coming Soon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/60 text-base sm:text-lg max-w-xl mx-auto"
          >
            The Official Website of ISKCON Kurnool
          </motion.p>

          {/* Developer Credit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-white text-slate-900 font-sans tracking-wide text-xs sm:text-sm font-bold shadow-xl border border-white/25 mt-4"
          >
            <span>Designed and Developed by</span>
            <span className="font-extrabold text-primary">Devesh</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse shrink-0" />
          </motion.div>
        </div>

        {/* 3. Countdown timer grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl w-full"
        >
          <TimeBlock val={timeLeft.days} label="DAYS" />
          <TimeBlock val={timeLeft.hours} label="HOURS" />
          <TimeBlock val={timeLeft.minutes} label="MIN" />
          <TimeBlock val={timeLeft.seconds} label="SEC" />
        </motion.div>

        {/* Launching date label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-secondary font-semibold text-sm sm:text-base tracking-widest uppercase"
        >
          Launching on Sunday, {formattedLaunchDate}
        </motion.p>

        {/* 4. UNLOCK WEBSITE PREVIEW SECTION */}
        <div className="w-full flex flex-col items-center">
          {!previewUnlocked ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="w-full max-w-xl bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" /> Unlock Website Preview
                </span>
                <span className="text-xs text-white/50 font-medium">Early Access Preview</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Hare Krishna 🙏</h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  Enter your name and mobile number to unlock exclusive early preview of the ISKCON Kurnool digital temple!
                </p>
              </div>

              <form onSubmit={handleUnlockPreview} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Enter your name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={visitorName}
                      onChange={(e) => { setVisitorName(e.target.value); setFormError(""); }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 focus:border-accent/60 rounded-xl text-white placeholder-white/35 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Enter your mobile number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={visitorPhone}
                      onChange={(e) => { setVisitorPhone(e.target.value); setFormError(""); }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 focus:border-accent/60 rounded-xl text-white placeholder-white/35 text-sm outline-none transition font-mono"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-red-400 text-xs font-semibold animate-pulse">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-accent via-amber-500 to-accent hover:opacity-95 text-white font-bold rounded-xl shadow-gold flex items-center justify-center gap-2 cursor-pointer transition text-sm tracking-wide"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  {isSubmitting ? "Unlocking Preview..." : "Unlock Website Preview"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-3xl bg-white/5 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Preview Unlocked
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-bold text-white truncate">
                    {settings.previewVideoTitle || "Sri Sri Puri Jagannath Temple Preview"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("iskcon_preview_unlocked");
                    setPreviewUnlocked(false);
                  }}
                  className="text-xs text-white/50 hover:text-white underline cursor-pointer"
                >
                  Re-enter Details
                </button>
              </div>

              {/* Render Video */}
              <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                {renderVideoPlayer(settings.previewVideoUrl)}
              </div>

              {settings.previewVideoSubtitle && (
                <p className="text-white/70 text-xs sm:text-sm px-2 italic text-center">
                  "{settings.previewVideoSubtitle}"
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* 5. Discover Items */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="space-y-4 border-t border-b border-white/5 py-8 w-full max-w-lg"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/40 block font-bold">Discover</span>
          <div className="flex flex-col gap-2.5 text-sm sm:text-base font-semibold text-white/80">
            <div>Temple Programs • Festivals • Darshan</div>
            <div>Bhagavad Gita • Youth Programs • Donations</div>
          </div>
        </motion.div>

      </main>

      {/* 6. Footer Layout */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 text-white/55 text-xs sm:text-sm">
        
        {/* Instagram Follow */}
        <a
          href={settings.instagram || "https://instagram.com/iskcon_kurnool"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent/90 text-white font-semibold shadow-gold transition duration-200 text-xs tracking-wider uppercase cursor-pointer"
        >
          <Instagram className="h-4 w-4" />
          Follow Us on Instagram
        </a>

        {/* Location tag */}
        <div className="flex items-center gap-1.5 font-semibold text-white/70">
          <MapPin className="h-4 w-4 text-accent shrink-0" />
          📍 ISKCON Kurnool
        </div>
      </footer>

      {/* Passcode Modal Overlay */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120422] border border-white/10 rounded-[32px] max-w-md w-full p-8 shadow-elegant relative overflow-hidden text-left"
            >
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setCodeError("");
                }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-accent/15 border border-accent/30 text-accent">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Enter Bypass Code</h3>
                    <p className="text-white/60 text-xs font-sans mt-0.5">Please input the launch bypass code to view the website.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitCode} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter bypass passcode..."
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-white/30 text-center font-bold tracking-widest text-lg focus:outline-none focus:border-accent/40"
                    autoFocus
                  />
                  {codeError && (
                    <p className="text-red-500 text-xs font-semibold text-center font-sans animate-pulse">{codeError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold"
                  >
                    Bypass Screen
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TimeBlock({ val, label }: { val: number; label: string }) {
  const formattedVal = val.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-3 sm:p-5 shadow-elegant backdrop-blur-sm relative overflow-hidden group">
      {/* Light accent lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="font-sans font-extrabold tabular-nums text-2xl sm:text-4xl md:text-5xl text-accent tracking-tight leading-none">
        {formattedVal}
      </span>
      <span className="text-[8px] sm:text-[10px] tracking-widest font-extrabold text-white/50 mt-1 sm:mt-2">
        {label}
      </span>
    </div>
  );
}

function renderVideoPlayer(url?: string) {
  const videoSource = url || "https://assets.mixkit.co/videos/preview/mixkit-candles-shining-in-a-dark-room-41555-large.mp4";
  if (videoSource.includes("youtube.com") || videoSource.includes("youtu.be")) {
    const embedUrl = videoSource
      .replace("watch?v=", "embed/")
      .replace("youtu.be/", "youtube.com/embed/");
    return (
      <iframe
        src={embedUrl}
        title="ISKCON Kurnool Website Preview"
        className="w-full aspect-video rounded-2xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video
      src={videoSource}
      controls
      autoPlay
      className="w-full max-h-[480px] rounded-2xl object-cover"
    />
  );
}
