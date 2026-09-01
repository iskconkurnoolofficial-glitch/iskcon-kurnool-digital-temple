import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin, BhaktiStepsLevel } from "@/context/AdminContext";
import {
  Sparkles,
  Heart,
  Music,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
  ExternalLink,
  XCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  Award,
  Flame,
  Clock,
  Send,
  MapPin,
  User,
  ShieldCheck,
  Compass,
  Sun,
  Check,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/bhakti-steps")({
  head: () => ({
    meta: [
      { title: "Bhakti Steps | ISKCON Kurnool" },
      {
        name: "description",
        content:
          "Explore Bhakti Steps at ISKCON Kurnool — a progressive spiritual journey from Shraddhavan to Sri Guru Ashraya through devotional practices, chanting, learning, and service.",
      },
      { property: "og:title", content: "Bhakti Steps | ISKCON Kurnool" },
      {
        property: "og:description",
        content:
          "Recognize • Revitalize • Progress. Take step-by-step spiritual advancement in Krishna Consciousness.",
      },
    ],
  }),
  component: BhaktiStepsPage,
});

// Zero-latency Web Audio confirmation chime
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.45);

    if (navigator.vibrate) navigator.vibrate([60, 40, 90]);
  } catch {}
}

export default function BhaktiStepsPage() {
  const { bhaktiSteps, addBhaktiStepsRegistration } = useAdmin();

  const levels = bhaktiSteps.levels || [];
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || "level_1");
  const [expandedMobileLevelId, setExpandedMobileLevelId] = useState<string | null>(levels[0]?.id || "level_1");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("Kurnool");
  const [selectedLevelName, setSelectedLevelName] = useState("Shraddhavan");
  const [contactMethod, setContactMethod] = useState("WhatsApp");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRegId, setSubmittedRegId] = useState<string | null>(null);
  const [showLocalForm, setShowLocalForm] = useState(false);

  const registerSectionRef = useRef<HTMLDivElement>(null);

  const selectedLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];

  const scrollToRegistration = (levelName?: string) => {
    if (levelName) {
      setSelectedLevelName(levelName);
    }
    const elem = document.getElementById("register-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToLevels = () => {
    const elem = document.getElementById("levels-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim()) {
      toast.error("Please fill in your Full Name, Phone Number, and City.");
      return;
    }

    setIsSubmitting(true);
    try {
      const regId = await addBhaktiStepsRegistration({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        age: age.trim() ? Number(age) : "",
        city: city.trim(),
        level: selectedLevelName,
        contactMethod,
        message: message.trim() || undefined,
      });

      playSuccessChime();
      setSubmittedRegId(regId);
      toast.success(`Hare Krishna! Registration submitted successfully (ID: ${regId})`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setAge("");
    setCity("Kurnool");
    setSelectedLevelName("Shraddhavan");
    setContactMethod("WhatsApp");
    setMessage("");
    setSubmittedRegId(null);
  };

  const rawContacts = (bhaktiSteps && Array.isArray(bhaktiSteps.contactPhones) && bhaktiSteps.contactPhones.length > 0) 
    ? bhaktiSteps.contactPhones 
    : ["9989147723", "9000002745", "9505377520"];

  const parseContactItem = (item: string) => {
    const str = (item || "").trim();
    if (str.includes(":")) {
      const parts = str.split(":");
      return { name: parts[0].trim(), phone: parts.slice(1).join(":").trim() };
    }
    return { name: "Devotee Coordinator", phone: str };
  };

  const parsedContacts = rawContacts.map(parseContactItem);
  const contactPhones = parsedContacts.map((c) => c.phone);

  return (
    <SiteLayout>
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#341154] via-[#4a1c74] to-[#250a3d] text-white py-16 sm:py-24 border-b border-amber-400/20">
        {/* Soft glowing ambient orbs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Subtle decorative temple pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 font-extrabold text-xs tracking-widest uppercase shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Progressive Spiritual Path
          </span>

          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.1] drop-shadow-md">
            {bhaktiSteps.heroTitle || "Bhakti Steps"}
          </h1>

          <p className="font-display italic text-amber-300 text-lg sm:text-2xl font-bold tracking-wide">
            {bhaktiSteps.heroSubtitle || "Recognize • Revitalize • Progress"}
          </p>

          <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-sans">
            {bhaktiSteps.heroDescription ||
              "Bhakti Steps is a structured spiritual journey designed to help devotees gradually deepen their spiritual practices, understanding, discipline, and connection with Krishna Consciousness."}
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollToRegistration()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-extrabold text-sm sm:text-base shadow-[0_10px_30px_rgba(245,197,24,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>
                {bhaktiSteps.registrationStatus === "Closed"
                  ? "Registrations Closed"
                  : bhaktiSteps.registrationStatus === "Coming Soon"
                  ? "Registrations Coming Soon"
                  : "Register Now"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={scrollToLevels}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Explore the 5 Levels ↓</span>
            </button>
          </div>

          {/* Quick 5 Steps Progression Pill Strip */}
          <div className="pt-10 flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
            {levels.map((lvl, index) => (
              <div
                key={lvl.id}
                onClick={() => {
                  setSelectedLevelId(lvl.id);
                  scrollToLevels();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 border border-white/15 text-white/90 hover:text-amber-300 hover:border-amber-400/50 transition cursor-pointer text-xs font-semibold"
              >
                <span className="h-5 w-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] grid place-items-center">
                  {lvl.levelNumber || index + 1}
                </span>
                <span className="truncate max-w-[110px] sm:max-w-none">{lvl.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT BHAKTI STEPS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#fffbeb] via-[#fef08a] to-[#fde047]/40 border-b border-amber-300 relative overflow-hidden">
        {/* Luminous Honey Mesh - Multi-point Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-300/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-yellow-200/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle dot pattern accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 text-amber-950 font-extrabold uppercase text-xs tracking-widest bg-amber-300/50 px-3 py-1.5 rounded-full border border-amber-400/60 shadow-xs">
                <Compass className="h-4 w-4 text-amber-800" />
                Systematic Spiritual Progression
              </span>

              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-amber-950 tracking-tight leading-tight drop-shadow-xs">
                {bhaktiSteps.aboutTitle || "About Bhakti Steps"}
              </h2>

              <div className="space-y-4 text-amber-950/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans font-medium">
                {bhaktiSteps.aboutDescription ||
                  `Bhakti Steps provides a systematic path for devotees to grow step-by-step in Krishna Consciousness. Each level introduces progressive spiritual practices, devotional songs, regulative principles, courses, and sacred books.

The goal is not simply to complete levels, but to recognize one's spiritual progress, revitalize devotional practices, and progress steadily in devotional service back home, back to Godhead.`}
              </div>

              {/* Key 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-300/80 shadow-md shadow-amber-900/5 space-y-1 hover:bg-white hover:border-amber-400 transition-all">
                  <div className="text-amber-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span> Recognize
                  </div>
                  <p className="text-xs text-amber-950/80 font-medium">Acknowledge your sincere spiritual efforts and milestones.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-300/80 shadow-md shadow-amber-900/5 space-y-1 hover:bg-white hover:border-amber-400 transition-all">
                  <div className="text-amber-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔥</span> Revitalize
                  </div>
                  <p className="text-xs text-amber-950/80 font-medium">Re-energize your daily Japa meditation and deity altar worship.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-300/80 shadow-md shadow-amber-900/5 space-y-1 hover:bg-white hover:border-amber-400 transition-all">
                  <div className="text-emerald-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌱</span> Progress
                  </div>
                  <p className="text-xs text-amber-950/80 font-medium">Advance toward authorized Harinama Diksha initiation.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Uploaded Image (No Shadows, No Borders) */}
            <div className="lg:col-span-5 flex items-center justify-center p-0 m-0">
              <img
                src={bhaktiSteps.aboutImage || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80"}
                alt={bhaktiSteps.aboutTitle || "About Bhakti Steps"}
                className="w-full h-auto max-h-[460px] object-contain rounded-2xl border-0 shadow-none outline-none ring-0 block"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE STAIRCASE PROGRESSION PATH (DESKTOP & TABLET) */}
      {/* ========================================================================= */}
      <section id="levels-section" className="py-16 sm:py-24 bg-gradient-to-b from-[#fffaf0] via-[#fef4de] to-[#fff8eb] relative border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 text-accent font-bold uppercase text-xs tracking-widest">
              <Award className="h-4 w-4" />
              Progressive Devotional Ladder
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight">
              Explore the 5 Bhakti Steps Levels
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Click through the ascending steps to discover the songs, daily chanting disciplines, regulative principles, and sacred literature for each level.
            </p>
          </div>

          {/* Ascending Interactive Staircase (Desktop) */}
          <div className="hidden lg:grid grid-cols-5 gap-3 items-end pt-8 pb-4">
            {levels.map((lvl, index) => {
              const isSelected = lvl.id === selectedLevelId;
              const stepHeightClasses = [
                "h-[220px]",
                "h-[260px]",
                "h-[300px]",
                "h-[340px]",
                "h-[380px]",
              ];
              const heightClass = stepHeightClasses[index] || "h-[300px]";

              return (
                <div
                  key={lvl.id}
                  onClick={() => setSelectedLevelId(lvl.id)}
                  className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-400 cursor-pointer select-none group border-2 ${heightClass} ${
                    isSelected
                      ? "bg-gradient-to-b from-[#3d1368] to-[#1e0735] text-white border-amber-400 shadow-2xl scale-105 z-10"
                      : "bg-white hover:bg-amber-50/80 text-slate-800 border-amber-200 shadow-sm hover:border-amber-400/60"
                  }`}
                >
                  {/* Top Step Number Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-9 w-9 rounded-2xl font-black text-sm grid place-items-center shadow-sm ${
                        isSelected
                          ? "bg-amber-400 text-slate-950"
                          : "bg-amber-100 text-amber-900 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors"
                      }`}
                    >
                      {lvl.levelNumber || index + 1}
                    </span>

                    {isSelected && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Level Content */}
                  <div className="space-y-1.5">
                    <h3
                      className={`font-display font-extrabold text-base leading-snug ${
                        isSelected ? "text-amber-300" : "text-primary group-hover:text-accent"
                      }`}
                    >
                      {lvl.name}
                    </h3>
                    <p className={`text-[11px] line-clamp-3 leading-relaxed ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                      {lvl.subtitle}
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? "text-amber-300" : "text-accent"}>
                      {lvl.practices?.length || 3} Practices
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "translate-x-1" : "group-hover:translate-x-1"}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Level Deep-Dive Showcase Card (Desktop & Tablet) */}
          {selectedLevel && (
            <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden animate-scale-in">
              {/* Showcase Header */}
              <div className="bg-gradient-to-r from-[#2c0f4d] via-[#3e176b] to-[#1f0739] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-400/30">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-display font-black text-3xl grid place-items-center shadow-lg shrink-0">
                    {selectedLevel.levelNumber || "1"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                        {selectedLevel.badge || `Level ${selectedLevel.levelNumber}`}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
                      {selectedLevel.name}
                    </h3>
                    <p className="text-amber-200/90 text-xs sm:text-sm font-medium mt-0.5">
                      {selectedLevel.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => scrollToRegistration(selectedLevel.name)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                >
                  <span>
                    {bhaktiSteps.registrationStatus === "Closed"
                      ? "Registrations Closed"
                      : bhaktiSteps.registrationStatus === "Coming Soon"
                      ? "Registrations Coming Soon"
                      : "Register Now"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Showcase Grid of Content Attributes */}
              <div className="p-6 sm:p-8 space-y-8 bg-gradient-to-b from-amber-50/30 via-white to-white">
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {selectedLevel.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 1. Songs / Mantras */}
                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider border-b pb-2">
                      <Music className="h-4 w-4" />
                      <span>Songs to Learn</span>
                    </div>
                    <ul className="space-y-2">
                      {selectedLevel.songs?.map((s, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-pink-500 font-bold mt-0.5">🎵</span>
                          <span className="font-semibold">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Daily Practices */}
                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider border-b pb-2">
                      <Flame className="h-4 w-4" />
                      <span>Daily Practices</span>
                    </div>
                    <ul className="space-y-2">
                      {selectedLevel.practices?.map((p, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-amber-500 font-bold mt-0.5">🪔</span>
                          <span className="font-semibold">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Books to Read */}
                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider border-b pb-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Books to Read</span>
                    </div>
                    <ul className="space-y-2">
                      {selectedLevel.books?.map((b, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-indigo-500 font-bold mt-0.5">📖</span>
                          <span className="font-semibold">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. Courses & Learning */}
                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider border-b pb-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Courses / Modules</span>
                    </div>
                    <ul className="space-y-2">
                      {selectedLevel.learningOrCourses?.map((c, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold mt-0.5">🎓</span>
                          <span className="font-semibold">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Milestone Requirements Box */}
                {selectedLevel.requirements && selectedLevel.requirements.length > 0 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-100/70 via-orange-50 to-amber-100/50 border border-amber-300 space-y-3">
                    <h4 className="font-display font-bold text-base text-amber-950 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span>Level Requirements & Milestones</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedLevel.requirements.map((req, rIdx) => (
                        <div key={rIdx} className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs text-slate-800 flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MOBILE ACCORDION LEVEL CARDS */}
          {/* ========================================================================= */}
          <div className="lg:hidden space-y-4 pt-4">
            <h3 className="font-display font-bold text-xl text-primary text-center pb-2">
              All 5 Levels (Tap to Expand)
            </h3>

            {levels.map((lvl, index) => {
              const isExpanded = expandedMobileLevelId === lvl.id;
              return (
                <div
                  key={lvl.id}
                  className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm transition-all"
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedMobileLevelId(isExpanded ? null : lvl.id)}
                    className="w-full p-4 flex items-center justify-between text-left gap-3 bg-gradient-to-r from-amber-50/50 to-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 font-black text-sm grid place-items-center shrink-0 shadow-xs">
                        {lvl.levelNumber || index + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-accent">{lvl.badge || `Level ${lvl.levelNumber}`}</span>
                        <h4 className="font-display font-extrabold text-base text-primary leading-tight">{lvl.name}</h4>
                      </div>
                    </div>

                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : ""}`} />
                  </button>

                  {/* Accordion Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-amber-100 p-4 space-y-4 bg-white"
                      >
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {lvl.description}
                        </p>

                        {/* Songs */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase text-pink-600 flex items-center gap-1">
                            <Music className="h-3.5 w-3.5" /> Songs / Mantras:
                          </span>
                          <ul className="text-xs text-slate-700 pl-2 space-y-1">
                            {lvl.songs?.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span>•</span>
                                <span className="font-semibold">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Practices */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase text-amber-600 flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5" /> Daily Practices:
                          </span>
                          <ul className="text-xs text-slate-700 pl-2 space-y-1">
                            {lvl.practices?.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span>•</span>
                                <span className="font-semibold">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Books */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase text-indigo-600 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" /> Books to Read:
                          </span>
                          <ul className="text-xs text-slate-700 pl-2 space-y-1">
                            {lvl.books?.map((b, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span>•</span>
                                <span className="font-semibold">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Learning & Courses */}
                        {lvl.learningOrCourses && lvl.learningOrCourses.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" /> Courses / Learning:
                            </span>
                            <ul className="text-xs text-slate-700 pl-2 space-y-1">
                              {lvl.learningOrCourses.map((c, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span>•</span>
                                  <span className="font-semibold">{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={() => scrollToRegistration(lvl.name)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs transition active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            {bhaktiSteps.registrationStatus === "Closed"
                              ? "Registrations Closed"
                              : bhaktiSteps.registrationStatus === "Coming Soon"
                              ? "Registrations Coming Soon"
                              : "Register Now"}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* AUTHORIZED SOURCES & FURTHER LEARNING */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2a0b4e] via-[#3b1266] to-[#1a0533] text-white border-y border-amber-400/30 relative overflow-hidden">
        {/* Soft glowing ambient light orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 font-extrabold text-xs tracking-widest uppercase shadow-sm">
              <BookOpen className="h-3.5 w-3.5" />
              Authentic Vaisnava Curriculum
            </span>

            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              Authorized Sources &amp; Further Learning
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed font-sans">
              All Bhakti Steps materials, recommended reading, and study courses are grounded in the authentic teachings of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada and standardized ISKCON Ministry of Education guidelines.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Srila Prabhupada's Books */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-amber-400/60 transition-all hover:-translate-y-1 group space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 grid place-items-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-white">
                Sacred Literature
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Systematic study of Bhagavad-gita As It Is, Srimad-Bhagavatam, Sri Ishopanishad, and Nectar of Instruction.
              </p>
              <a
                href={bhaktiSteps.booksUrl || "https://vedabase.io"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 hover:text-amber-200 pt-2"
              >
                <span>Explore Vedabase Online</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Card 2: Systematic ISKCON Courses */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-amber-400/60 transition-all hover:-translate-y-1 group space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 grid place-items-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-white">
                Structured Courses
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Seamless path toward Bhakti Shastri, ISKCON Disciple Course (IDC), and foundational Vaisnava diplomas.
              </p>
              <div className="text-xs font-extrabold text-amber-300 pt-2">
                Certified Curriculum
              </div>
            </div>

            {/* Card 3: Songs & Chanting Discipline */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-amber-400/60 transition-all hover:-translate-y-1 group space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 grid place-items-center group-hover:scale-110 transition-transform">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-white">
                Devotional Songbooks
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Learn authentic Vaisnava bhajans, Pranam mantras, and Japa meditation discipline step-by-step.
              </p>
              <div className="text-xs font-extrabold text-amber-300 pt-2">
                Vaishnava Song Guides
              </div>
            </div>

            {/* Card 4: Devotee Mentorship */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-amber-400/60 transition-all hover:-translate-y-1 group space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 grid place-items-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-white">
                Personal Mentorship
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Receive personal guidance from experienced Kurnool temple mentors to nurture your daily sadhana practice.
              </p>
              <div className="text-xs font-extrabold text-amber-300 pt-2">
                1-on-1 Guidance
              </div>
            </div>
          </div>

          {/* Official Resource Links if present */}
          {(bhaktiSteps.officialUrl || bhaktiSteps.booksUrl) && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-2">
              {bhaktiSteps.officialUrl && (
                <a
                  href={bhaktiSteps.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <span>Bhakti Steps Official Resource</span>
                  <ExternalLink className="h-4 w-4 text-amber-300" />
                </a>
              )}
              {bhaktiSteps.booksUrl && (
                <a
                  href={bhaktiSteps.booksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <span>Authentic Devotional Books</span>
                  <ExternalLink className="h-4 w-4 text-amber-300" />
                </a>
              )}
            </div>
          )}

          {/* Prominent CTA Box with REGISTER NOW BUTTON */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-2xl">
              <span className="text-amber-300 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="h-4 w-4 animate-pulse" /> Start Your Spiritual Journey Today
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                Ready to Take Your Next Step in Bhakti?
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">
                Enroll now in Bhakti Steps to get connected with authorized learning materials, study groups, and temple mentors.
              </p>
            </div>

            <button
              onClick={() => scrollToRegistration()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-sm sm:text-base shadow-[0_10px_30px_rgba(245,197,24,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
            >
              <span>
                {bhaktiSteps.registrationStatus === "Closed"
                  ? "Registrations Closed"
                  : bhaktiSteps.registrationStatus === "Coming Soon"
                  ? "Registrations Coming Soon"
                  : "REGISTER NOW"}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REGISTRATION SECTION */}
      {/* ========================================================================= */}
      <section id="register-section" className="py-16 sm:py-24 bg-[#fdf6ec] border-b border-amber-200 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Column: Content */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-accent font-bold uppercase text-xs tracking-widest">
                    <Sparkles className="h-4 w-4" />
                    Enrollment &amp; Guidance
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-primary tracking-tight">
                    Begin Your Bhakti Steps Journey
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Take the next step in your spiritual journey. Register to learn more about the Bhakti Steps program and begin your progress in Krishna Consciousness.
                  </p>
                </div>

                {/* Bottom Registration Status */}
                <div className="pt-6 border-t border-amber-100 space-y-4">
                  {bhaktiSteps.registrationStatus === "Closed" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase">
                        <XCircle className="h-3.5 w-3.5" />
                        Registrations Closed
                      </span>
                      <p className="text-xs text-slate-500">
                        Registrations for Bhakti Steps are currently closed. Please contact our devotee helpline or check back later for the next batch.
                      </p>
                    </div>
                  ) : bhaktiSteps.registrationStatus === "Coming Soon" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        Registrations Coming Soon
                      </span>
                      <p className="text-xs text-slate-600">
                        The next batch of Bhakti Steps will open for registrations soon! Stay tuned and keep checking this page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-up">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          Registrations Open
                        </span>
                      </div>

                      {bhaktiSteps.googleFormUrl ? (
                        <a
                          href={bhaktiSteps.googleFormUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span>Register Now</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowLocalForm(!showLocalForm)}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span>{showLocalForm ? "Hide Form" : "Register Now"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="relative rounded-3xl overflow-hidden aspect-video lg:aspect-[4/3]">
                <img
                  src={bhaktiSteps.aboutImage || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80"}
                  alt="Bhakti Steps Journey"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Local Registration Form (Hidden by default, shown only when no Google Form link and showLocalForm is true) */}
            {bhaktiSteps.registrationStatus === "Opened" && !bhaktiSteps.googleFormUrl && showLocalForm && (
              <div className="border-t border-amber-100 pt-8 mt-6 animate-fade-up">
                {submittedRegId ? (
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-2 border-emerald-400 text-center space-y-6 animate-scale-in">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto grid place-items-center">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-display font-black text-2xl sm:text-3xl text-emerald-900">
                        Hare Krishna! Registration Received
                      </h3>
                      <p className="text-slate-700 text-sm max-w-md mx-auto">
                        Your Bhakti Steps application has been recorded. Our devotee helpline coordinator will contact you with materials and guidance.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-emerald-200 max-w-xs mx-auto space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Your Registration ID
                      </span>
                      <span className="font-mono font-black text-2xl text-emerald-700">{submittedRegId}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <a
                        href={`https://wa.me/91${contactPhones[0]}?text=${encodeURIComponent(`Hare Krishna! I registered for Bhakti Steps (ID: ${submittedRegId}, Level: ${selectedLevelName}).`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                      </a>

                      <button
                        onClick={resetForm}
                        className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
                      >
                        Register Another Devotee
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-accent" /> Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Radhakanta Dasa / Srinivas"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30"
                        />
                      </div>

                      {/* WhatsApp Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9989147723"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30 font-mono"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-indigo-600" /> Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. devotee@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30"
                        />
                      </div>

                      {/* Age & City */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800">Age</label>
                          <input
                            type="number"
                            placeholder="e.g. 24"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" /> City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kurnool"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30"
                          />
                        </div>
                      </div>

                      {/* Level Select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-accent" /> Select Level to Register <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedLevelName}
                          onChange={(e) => setSelectedLevelName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-white font-semibold cursor-pointer"
                        >
                          {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.name}>
                              Level {lvl.levelNumber}: {lvl.name} ({lvl.subtitle})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Preferred Contact Method */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">Preferred Contact Method</label>
                        <select
                          value={contactMethod}
                          onChange={(e) => setContactMethod(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-white font-semibold cursor-pointer"
                        >
                          <option value="WhatsApp">WhatsApp Message</option>
                          <option value="Phone Call">Direct Phone Call</option>
                          <option value="Email">Email Communication</option>
                        </select>
                      </div>
                    </div>

                    {/* Message / Questions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Your Spiritual Background / Questions (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about how many rounds you chant daily, which books you have read, or any questions for our mentors..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 outline-none text-sm bg-surface/30"
                      />
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Submitting Registration...</span>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Submit Registration for Bhakti Steps</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CONTACT FOR REGISTRATION CARD */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#faf1dc] border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-amber-200 p-8 sm:p-12 text-center space-y-8">
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                <Phone className="h-4 w-4" /> Direct Devotee Assistance
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-primary">
                For Registrations Please Contact
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Our temple mentors are readily available to guide you at every milestone of your devotional journey.
              </p>
            </div>

            {/* Phone Numbers Auto-Layout (Centers if 1 number, auto grid if multiple) */}
            <div
              className={`flex flex-wrap justify-center items-stretch gap-6 max-w-5xl mx-auto pt-4 ${
                parsedContacts.length === 1 ? "max-w-md" : ""
              }`}
            >
              {parsedContacts.map((contact, idx) => {
                const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
                return (
                  <div
                    key={idx}
                    className="w-full sm:w-[300px] p-6 rounded-2xl bg-white border border-amber-200/80 shadow-sm hover:border-amber-400/60 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider block">
                        {contact.name || "Devotee Coordinator"}
                      </span>
                      <span className="font-display font-extrabold text-2xl text-slate-900 block tracking-tight">
                        {contact.phone}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <a
                        href={`tel:+91${cleanPhone}`}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Phone className="h-3.5 w-3.5 text-amber-400" />
                        <span>Call Now</span>
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                          `Hare Krishna ${contact.name !== "Devotee Coordinator" ? contact.name : ""}! I would like to know more about the Bhakti Steps program at ISKCON Kurnool.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
