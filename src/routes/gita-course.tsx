import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { Calendar, Clock, Monitor, IndianRupee, Check, BookOpen, Languages, Timer, Sparkles, ArrowRight, Star, Quote, Book, Compass, Award, Heart, Lock, Download, User, Phone, Mail, CheckCircle2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { isTimeStrLive, getCurrentTimeIST } from "@/lib/scheduleUtils";
import { toast } from "sonner";

function getGitaIcon(name: string) {
  switch (name) {
    case "book-open": return BookOpen;
    case "languages": return Languages;
    case "timer": return Timer;
    case "sparkles": return Sparkles;
    case "book": return Book;
    case "compass": return Compass;
    case "clock": return Clock;
    case "award": return Award;
    case "star": return Star;
    case "heart": return Heart;
    default: return BookOpen;
  }
}

function getGitaIconColorClass(name: string) {
  switch (name) {
    case "book-open": return "bg-primary/20 text-secondary";
    case "languages": return "bg-amber-500/20 text-amber-300";
    case "timer": return "bg-emerald-500/20 text-emerald-300";
    case "sparkles": return "bg-indigo-500/20 text-indigo-300";
    case "book": return "bg-blue-500/20 text-blue-300";
    case "compass": return "bg-teal-500/20 text-teal-300";
    case "clock": return "bg-rose-500/20 text-rose-300";
    case "award": return "bg-yellow-500/20 text-yellow-300";
    case "star": return "bg-orange-500/20 text-orange-300";
    case "heart": return "bg-pink-500/20 text-pink-300";
    default: return "bg-primary/20 text-secondary";
  }
}

export const Route = createFileRoute("/gita-course")({
  head: () => ({
    meta: [
      { title: "Bhagavad Gita Course — ISKCON Kurnool" },
      { name: "description", content: "18 days, 18 chapters — a complete online Bhagavad Gita course in Telugu. July 14–31, 2026, 7:30 PM daily. Free registration." },
      { property: "og:title", content: "Bhagavad Gita Course — ISKCON Kurnool" },
      { property: "og:description", content: "A complete journey through the Bhagavad Gita, one chapter each night. Free, online, daily." },
    ],
  }),
  component: Page,
});

const CHAPTERS: { sanskrit: string; english: string }[] = [
  { sanskrit: "Arjuna Vishada Yoga", english: "Arjuna's Dejection" },
  { sanskrit: "Sankhya Yoga", english: "The Yoga of Knowledge" },
  { sanskrit: "Karma Yoga", english: "The Yoga of Action" },
  { sanskrit: "Jnana Karma Sanyasa Yoga", english: "Knowledge & Renunciation of Action" },
  { sanskrit: "Karma Sanyasa Yoga", english: "Renunciation of Action" },
  { sanskrit: "Dhyana Yoga", english: "The Yoga of Meditation" },
  { sanskrit: "Jnana Vijnana Yoga", english: "Knowledge & Wisdom" },
  { sanskrit: "Akshara Brahma Yoga", english: "The Imperishable Brahman" },
  { sanskrit: "Raja Vidya Raja Guhya Yoga", english: "The Sovereign Science" },
  { sanskrit: "Vibhuti Yoga", english: "Divine Glories" },
  { sanskrit: "Vishvarupa Darshana Yoga", english: "Vision of the Universal Form" },
  { sanskrit: "Bhakti Yoga", english: "The Yoga of Devotion" },
  { sanskrit: "Kshetra Kshetrajna Vibhaga Yoga", english: "The Field & Its Knower" },
  { sanskrit: "Gunatraya Vibhaga Yoga", english: "The Three Gunas" },
  { sanskrit: "Purushottama Yoga", english: "The Supreme Person" },
  { sanskrit: "Daivasura Sampad Vibhaga Yoga", english: "The Divine & the Demoniac" },
  { sanskrit: "Shraddhatraya Vibhaga Yoga", english: "The Threefold Faith" },
  { sanskrit: "Moksha Sanyasa Yoga", english: "Liberation Through Renunciation" },
];

// WHY array removed in favor of dynamic admin values whyCards

const TESTIMONIALS = [
  {
    quote: "The way the chapters are explained in Telugu is so simple and practical. It changed how I handle daily stress and challenging situations.",
    author: "Srinivas K.",
    role: "Software Engineer",
    rating: 5,
    batch: "July 2025 Batch"
  },
  {
    quote: "I never thought I could understand the Gita in 18 days. The daily 30-minute sessions fit perfectly into my busy evening schedule.",
    author: "Radhika M.",
    role: "Homemaker",
    rating: 5,
    batch: "Oct 2025 Batch"
  },
  {
    quote: "Beautifully structured! Krishna's teachings were made extremely relevant to modern life. Heartfelt gratitude to the ISKCON Kurnool team.",
    author: "Ananth R.",
    role: "College Student",
    rating: 5,
    batch: "Jan 2026 Batch"
  },
  {
    quote: "The explanations are very clear, logical, and beginner-friendly. Highly recommend this course to everyone seeking mental clarity and peace.",
    author: "Vijaya Lakshmi",
    role: "Retired Teacher",
    rating: 5,
    batch: "July 2025 Batch"
  },
  {
    quote: "Simple Telugu, wonderful daily examples, and very direct, practical guidance. This is the best online course I have ever attended.",
    author: "Rajesh V.",
    role: "Business Owner",
    rating: 5,
    batch: "April 2026 Batch"
  },
  {
    quote: "Every single session was an eye-opener. It helped me find logical answers to deep life questions I had been asking for years.",
    author: "Sai Prasanna",
    role: "Chartered Accountant",
    rating: 5,
    batch: "Jan 2026 Batch"
  }
];

function safeUrl(u: string): string | undefined {
  if (!u) return undefined;
  try {
    const url = new URL(u, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function RegisterButton({ url, label = "Register Now", status = "Registrations Opened" }: { url?: string; label?: string; status?: string }) {
  const safe = typeof window !== "undefined" ? safeUrl(url ?? "") : url;

  if (status === "Coming Soon") {
    return (
      <button disabled className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-400/40 cursor-not-allowed opacity-90 shadow-md">
        <Lock className="h-4 w-4 text-amber-400" /> Registrations Coming Soon
      </button>
    );
  }

  if (status === "Closed") {
    return (
      <button disabled className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-200 text-slate-500 font-extrabold border border-slate-300 cursor-not-allowed shadow-md">
        <Lock className="h-4 w-4 text-slate-500" /> Registrations Closed
      </button>
    );
  }

  if (!safe) {
    return (
      <button disabled className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-400/40 cursor-not-allowed opacity-90 shadow-md">
        <Lock className="h-4 w-4 text-amber-400" /> Registrations Coming Soon
      </button>
    );
  }

  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-semibold hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 cursor-pointer shadow-lg"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </a>
  );
}


function Page() {
  const { gitaCourse: g } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const courseActive = (() => {
    try {
      if (!g.startLabel || !g.endLabel) return false;
      const now = getCurrentTimeIST();
      const start = new Date(g.startLabel);
      const end = new Date(g.endLabel);
      end.setHours(23, 59, 59, 999);
      if (now >= start && now <= end) {
        return isTimeStrLive(g.time || "7:30 PM");
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  })();

  const whyCards = g.whyCards && g.whyCards.length > 0 ? g.whyCards : [
    { iconName: "book-open", title: "Complete Gita", desc: "All 18 chapters, start to finish — nothing skipped." },
    { iconName: "languages", title: "Plain Telugu", desc: "Explained simply, in Telugu, with real-life context." },
    { iconName: "timer", title: "30–40 Min a Day", desc: "Fits into an evening. No long-term commitment beyond 18 days." },
    { iconName: "sparkles", title: "ISKCON Guidance", desc: "Led by ISKCON Kurnool teachers, rooted in tradition." },
  ];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-40" />
        {/* decorative glow orbs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-28 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="animate-fade-up text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 text-secondary font-medium uppercase text-[11px] tracking-[0.25em]">
              <BookOpen className="h-3.5 w-3.5" /> {g.eyebrow}
            </span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
              {g.badges.filter(Boolean).map((b) => (
                <span key={b} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/15 text-xs font-medium">{b}</span>
              ))}
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl mt-6 leading-[1.05] tracking-tight">
              {g.title}
            </h1>
            <p className="mt-5 text-lg opacity-90 max-w-md mx-auto md:mx-0">{g.tagline}</p>
            {/* Course Info Card — white, all-in-one */}
            <div className="mt-7 inline-flex flex-col sm:flex-row items-stretch rounded-2xl overflow-hidden bg-white shadow-lg w-full sm:w-auto text-slate-800">
              {/* Starts */}
              <div className="flex items-center gap-3 px-5 py-4 flex-1">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Starts</div>
                  <div className="font-sans font-bold text-sm leading-tight text-slate-900">{g.startLabel}</div>
                </div>
              </div>
              <div className="w-px bg-slate-100 hidden sm:block" /><div className="h-px bg-slate-100 sm:hidden" />
              {/* Ends */}
              <div className="flex items-center gap-3 px-5 py-4 flex-1">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Ends</div>
                  <div className="font-sans font-bold text-sm leading-tight text-slate-900">{g.endLabel}</div>
                </div>
              </div>
              <div className="w-px bg-slate-100 hidden sm:block" /><div className="h-px bg-slate-100 sm:hidden" />
              {/* Time */}
              <div className="flex items-center gap-3 px-5 py-4 flex-1">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                    Daily at
                    {courseActive && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="font-sans font-bold text-sm leading-tight text-slate-900">{g.time}</div>
                </div>
              </div>
              <div className="w-px bg-slate-100 hidden sm:block" /><div className="h-px bg-slate-100 sm:hidden" />
              {/* Mode */}
              <div className="flex items-center gap-3 px-5 py-4 flex-1">
                <Monitor className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Mode</div>
                  <div className="font-sans font-bold text-sm leading-tight text-slate-900">{g.mode}</div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <RegisterButton url={g.registerUrl} status={g.status || "Registrations Opened"} />
            </div>
          </div>

          {g.heroImage && (
            <div className="animate-fade-up">
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-secondary/40 to-accent/30 blur-xl opacity-70" />
                <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-white/25 bg-black/40 p-1.5 flex items-center justify-center">
                  <img src={g.heroImage} alt="Bhagavad Gita Course" className="w-full h-auto max-h-[550px] object-contain rounded-2xl" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 1: How to Read Bhagavad Gita — Text Left, Image Right */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 text-amber-800 text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="h-4 w-4" /> Understanding the Gita
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary leading-tight">
                How to Read Bhagavad Gita &amp; What is It?
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-4">
                <p>
                  The Bhagavad Gita is a conversation between Lord Krishna and the warrior Arjun that happens on the battlefield of Kurukshetra, right before the Mahabharata starts. Arjun is confused and upset about fighting, so Krishna helps him by telling him deep truths about life, duty, the soul, and God. The Gita tells us how to live with wisdom, balance, and devotion.
                </p>
                <p>
                  For beginners who wonder how to read Bhagavad Gita, <strong>ISKCON Kurnool's</strong> classes make the process simple and structured, so you don't just read verses but understand their true meaning and learn how to apply them in real life. The life lessons from Bhagavad Gita teach us to stay calm in challenges, act with clarity, and live with purpose.
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex justify-center lg:justify-end">
              {g.gitaAboutImage ? (
                <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 bg-slate-900/5 p-2 flex items-center justify-center">
                  <img
                    src={g.gitaAboutImage}
                    alt="How to Read the Bhagavad Gita"
                    className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-secondary/10 to-primary/5 border-2 border-dashed border-secondary/30 flex flex-col items-center justify-center gap-3 text-center p-8">
                  <BookOpen className="h-12 w-12 text-secondary/50" />
                  <p className="text-sm text-slate-400 font-medium">Upload section image<br/><span className="text-xs opacity-70">2000 × 2000 px via Admin Panel</span></p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Golden Quote */}
      <section className="py-10 bg-gradient-to-r from-primary to-[#3d1a6a]">
        <div className="max-w-4xl mx-auto px-6 text-center text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          <blockquote className="italic font-display text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            "Whenever there is a decline in righteousness and an increase in unrighteousness, I manifest myself."
          </blockquote>
          <p className="text-secondary font-bold text-xs uppercase tracking-widest mt-4">
            — Bhagavad Gita, Chapter 4
          </p>
        </div>
      </section>

      {/* SECTION 2: Why Do These Gita Classes Matter — Image Left, Text Right */}
      <section className="py-20 md:py-28 bg-slate-50/60 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* Left: Image */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              {g.gitaWhyImage ? (
                <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 bg-slate-900/5 p-2 flex items-center justify-center">
                  <img
                    src={g.gitaWhyImage}
                    alt="Why Gita Classes Matter"
                    className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/5 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 text-center p-8">
                  <Sparkles className="h-12 w-12 text-primary/50" />
                  <p className="text-sm text-slate-400 font-medium">Upload section image<br/><span className="text-xs opacity-70">2000 × 2000 px via Admin Panel</span></p>
                </div>
              )}
            </div>

            {/* Right: Text Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Core Relevance
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary leading-tight">
                Why Do These Gita Classes Matter?
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-4">
                <p>
                  These days, life often feels like a race. We balance work, relationships, duties, and expectations, but many still feel empty inside. People look for peace in travel, technology, or entertainment, but these things don't last long. What if the answers you want are already out there and will always be?
                </p>
                <p>
                  The Bhagavad Gita isn't just a book about religion; it's a conversation about life. It asks questions that everyone can relate to: <em>Who am I? What is my goal? How can I live in this world without losing my peace of mind?</em> These questions are not only about spirituality; they are also about being human. <strong>ISKCON Kurnool</strong> offers structured Gita classes to help you find these answers in a clear and deep way.
                </p>
                <p>
                  The Gita gives you wisdom that never goes away, unlike motivational talks that only give you a short burst of energy. It changes how you think, act, and deal with problems. These classes are about more than just studying; they are about real change.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOWNLOAD BHAGAVAD GITA SECTION */}
      <DownloadGitaSection />

      {/* WHY JOIN */}
      <section className="py-20 md:py-28 bg-[#231e3d] text-white relative overflow-hidden">
        {/* Soft glowing decorations */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Why Join
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight">
              Built to Actually Finish
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Experience a program built around your busy routine, designed to give you clarity and wisdom that stays with you.
            </p>
            <div className="pt-2">
              <RegisterButton url={g.registerUrl} status={g.status || "Registrations Opened"} />
            </div>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyCards.map((w) => {
              const Icon = getGitaIcon(w.iconName);
              const colorClass = getGitaIconColorClass(w.iconName);
              return (
                <div key={w.title} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-secondary/20 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
                  {/* Hover top line accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  
                  {/* Soft Tint Icon Box */}
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  
                  <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-secondary transition-colors duration-300">
                    {w.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {w.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* CHAPTERS SECTION */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-100 via-amber-200/40 to-amber-50 relative overflow-hidden border-t border-amber-200/40">
        {/* Soft glowing decorations */}
        <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-accent font-medium uppercase text-xs tracking-[0.25em]">The Journey</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
              18 Days, 18 Chapters
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Explore the complete curriculum of the course, moving step-by-step through the core chapters of the Gita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {CHAPTERS.map((ch, idx) => {
              const numStr = String(idx + 1).padStart(2, "0");
              return (
                <div 
                  key={ch.sanskrit} 
                  className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_3px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 group-hover:bg-primary/5 border border-amber-500/20 group-hover:border-primary/10 text-amber-700 group-hover:text-primary flex items-center justify-center font-display font-extrabold text-sm shrink-0 transition-all duration-300">
                    {numStr}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base text-primary group-hover:text-amber-700 transition-colors duration-300 truncate">
                      {ch.sanskrit}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {ch.english}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-amber-50 via-amber-100/30 to-background overflow-hidden relative border-t border-amber-200/30">
        {/* Soft glowing decorations */}
        <div className="absolute top-12 right-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 mb-12 text-center relative z-10">
          <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Reviews</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-2">
            What Seekers Say
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
            Real stories of transformation from participants of the 18-day Bhagavad Gita course.
          </p>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="relative w-full overflow-hidden z-10">
          {/* Left/Right Gradient Overlays for smooth fading */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

          {/* Marquee Inner Wrapper */}
          <div className="group flex overflow-hidden">
            <div className="flex w-max animate-[marquee-reverse_30s_linear_infinite] gap-6 px-4 py-4 group-hover:[animation-play-state:paused] will-change-transform">
              {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div
                  key={idx}
                  className="w-[320px] sm:w-[380px] bg-white border border-slate-100/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shrink-0"
                >
                  <div>
                    {/* Stars and Quote Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote className="h-8 w-8 text-primary/10 rotate-180" />
                    </div>
                    {/* Quote Text */}
                    <p className="text-slate-600 text-sm leading-relaxed italic mb-6">
                      "{t.quote}"
                    </p>
                  </div>
                  {/* Divider & Author */}
                  <div>
                    <div className="h-px bg-slate-100 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary">{t.author}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.role}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-secondary/10 border border-amber-500/10 text-[9px] font-bold text-amber-800 uppercase tracking-wider shrink-0">
                        {t.batch}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION SECTION */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden text-white">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="text-white/80 font-medium uppercase text-xs tracking-[0.25em]">Registration</span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white mt-3 tracking-tight">
            Reserve Your Seat for the Journey
          </h2>
          <p className="text-white/90 text-sm max-w-lg mx-auto leading-relaxed">
            Once you register, you will receive the daily session link directly via email/WhatsApp.
          </p>
          
          <div className="bg-white border border-orange-200/20 rounded-3xl p-8 max-w-md mx-auto shadow-2xl space-y-6 text-slate-800 animate-fade-up">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-orange-600 tracking-widest">Enrollment Status</div>
              <div className="text-xl font-extrabold text-slate-900 font-display">
                {(g.status || "Registrations Opened") === "Coming Soon" ? "⏳ Registrations Coming Soon" : (g.status === "Closed" ? "🔒 Registrations Closed" : "Free Registration Open")}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3.5">
              <RegisterButton url={g.registerUrl} status={g.status || "Registrations Opened"} />
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-semibold mt-1">
                <span className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-600 font-bold" /> {g.fee}</span>
                <span>•</span>
                <span className="flex items-center gap-1">{g.mode}</span>
                <span>•</span>
                <span>Daily Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </SiteLayout>

  );
}

function DownloadGitaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { gitaCourse, addGitaDownloadLead } = useAdmin();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp number");
      return;
    }

    setLoading(true);
    try {
      await addGitaDownloadLead({
        name: name.trim(),
        gender,
        whatsapp: cleanPhone,
        email: email.trim() || undefined,
      });

      setDownloadSuccess(true);
      toast.success("Thank you! Your Bhagavad Gita PDF download has started.");

      // Trigger automatic file download
      const targetUrl = gitaCourse.gitaPdfUrl?.trim() || "/gita-gold-cover.jpg";
      const link = document.createElement("a");
      link.href = targetUrl;
      link.target = "_blank";
      link.download = (gitaCourse.gitaDownloadFileTitle || "Bhagavad-Gita-As-It-Is") + (gitaCourse.gitaPdfUrl?.endsWith(".pdf") ? ".pdf" : "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="relative max-w-md w-full bg-[#181308] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-amber-200 hover:bg-white/20 transition-all cursor-pointer z-10"
          title="Close Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {!downloadSuccess ? (
          <div>
            <div className="text-center space-y-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest border border-amber-400/30">
                <Sparkles className="h-3 w-3 text-amber-400" /> Free Bhagavad Gita Download
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent">
                Download Free E-Book
              </h3>
              <p className="text-xs text-amber-100/70 max-w-xs mx-auto">
                Fill in your details below to receive and download your instant copy of Bhagavad Gita As It Is.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-amber-400/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-amber-500/30 text-white placeholder-amber-200/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Gender <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        gender === g
                          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-sm scale-[1.02]"
                          : "bg-white/5 text-amber-100/80 border-amber-500/20 hover:bg-white/10"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="10-digit WhatsApp number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-amber-500/30 text-white placeholder-amber-200/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Email Address <span className="text-amber-400/60 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-400/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com (Optional)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-amber-500/30 text-white placeholder-amber-200/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300/50 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download Free PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="h-16 w-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto text-slate-950 shadow-lg animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display font-bold text-2xl text-amber-200">
              Hari Bol! Download Initiated 📖
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed max-w-xs mx-auto">
              Your Bhagavad Gita As It Is e-book download has started automatically. If your browser blocks popups, click below to open directly:
            </p>
            <div className="pt-3 flex flex-col gap-2">
              <a
                href={gitaCourse.gitaPdfUrl?.trim() || "/gita-gold-cover.jpg"}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                Click Here to Open / Download PDF
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2 text-xs text-amber-300 hover:underline"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadGitaSection() {
  const { gitaCourse: g } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  const rawTitle = g.gitaDownloadTitle || "Download Bhagavad Gita As It Is — Free PDF Edition";
  const desc = g.gitaDownloadDescription || "Unlock divine wisdom with the authentic Bhagavad Gita As It Is. Experience deep spiritual clarity, inner peace, and timeless life answers. Download your free digital copy in Telugu & English.";
  const image = g.gitaDownloadImage || "/gita-gold-cover.jpg";
  const badge = g.gitaDownloadBadge || "Free Divine Gift 📖";

  // Split title if it contains "—" or "-" for ultra-modern font layout
  const hasDash = rawTitle.includes("—") || rawTitle.includes(" - ");
  const parts = hasDash ? rawTitle.split(/—| - /) : [rawTitle];

  return (
    <>
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#161107] via-[#2a200d] to-[#120e06] text-white border-y border-amber-500/30">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="relative rounded-3xl p-8 md:p-12 border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-shimmer" />
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Left Column: Text & CTA */}
              <div className="space-y-6 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest border border-amber-400/40 shadow-sm font-sans">
                  <Sparkles className="h-4 w-4 text-amber-400" /> {badge}
                </span>

                <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
                  {parts.length > 1 ? (
                    <>
                      <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent block drop-shadow-xs">
                        {parts[0].trim()}
                      </span>
                      <span className="inline-block mt-3 text-lg sm:text-2xl md:text-3xl font-extrabold tracking-normal text-amber-300/95 bg-white/10 px-4 py-1.5 rounded-2xl border border-amber-400/30 backdrop-blur-sm">
                        {parts[1].trim()}
                      </span>
                    </>
                  ) : (
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent drop-shadow-xs">
                      {rawTitle}
                    </span>
                  )}
                </h2>

                <p className="text-amber-100/90 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans font-normal">
                  {desc}
                </p>

                {/* Highlights Pills */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2 text-xs font-semibold text-amber-200">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/20">
                    <Check className="h-3.5 w-3.5 text-amber-400 font-bold" /> Instant PDF Download
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/20">
                    <Check className="h-3.5 w-3.5 text-amber-400 font-bold" /> Mobile &amp; Tablet Ready
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/20">
                    <Check className="h-3.5 w-3.5 text-amber-400 font-bold" /> 100% Free Gift
                  </span>
                </div>

                {/* Download CTA Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm md:text-base uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-300"
                  >
                    <Download className="h-5 w-5 animate-bounce" /> Download Bhagavad Gita PDF
                  </button>
                </div>
              </div>

              {/* Right Column: Book Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group max-w-sm w-full">
                  {/* Image Container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-400/40 bg-black/40 p-2 transform group-hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={image}
                      alt="Bhagavad Gita As It Is Free Download"
                      className="w-full h-auto max-h-[480px] object-contain rounded-2xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <DownloadGitaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

