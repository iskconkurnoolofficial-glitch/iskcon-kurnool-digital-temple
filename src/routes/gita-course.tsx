import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { Calendar, Clock, Monitor, IndianRupee, Check, BookOpen, Languages, Timer, Sparkles, ArrowRight, Star, Quote } from "lucide-react";
import { Link } from "@tanstack/react-router";

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

const WHY = [
  { icon: BookOpen, title: "Complete Gita", desc: "All 18 chapters, start to finish — nothing skipped.", colorClass: "bg-primary/20 text-secondary" },
  { icon: Languages, title: "Plain Telugu", desc: "Explained simply, in Telugu, with real-life context.", colorClass: "bg-amber-500/20 text-amber-300" },
  { icon: Timer, title: "30–40 Min a Day", desc: "Fits into an evening. No long-term commitment beyond 18 days.", colorClass: "bg-emerald-500/20 text-emerald-300" },
  { icon: Sparkles, title: "ISKCON Guidance", desc: "Led by ISKCON Kurnool teachers, rooted in tradition.", colorClass: "bg-indigo-500/20 text-indigo-300" },
];

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

function RegisterButton({ url, label = "Register Now" }: { url?: string; label?: string }) {
  const safe = typeof window !== "undefined" ? safeUrl(url ?? "") : url;
  if (!safe) {
    return (
      <button disabled className="inline-flex items-center px-8 py-3.5 rounded-full bg-muted text-muted-foreground font-semibold cursor-not-allowed">
        Registration opening soon
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
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Daily at</div>
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
              <RegisterButton url={g.registerUrl} />
            </div>
          </div>

          {g.heroImage && (
            <div className="animate-fade-up">
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-secondary/40 to-accent/30 blur-xl opacity-70" />
                <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-white/25">
                  <img src={g.heroImage} alt="Bhagavad Gita Course" className="w-full h-auto object-cover" style={{ aspectRatio: "1080 / 1350" }} />
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
                <div className="w-full max-w-md rounded-3xl overflow-hidden">
                  <img
                    src={g.gitaAboutImage}
                    alt="How to Read the Bhagavad Gita"
                    className="w-full h-full object-cover aspect-square"
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
                <div className="w-full max-w-md rounded-3xl overflow-hidden">
                  <img
                    src={g.gitaWhyImage}
                    alt="Why Gita Classes Matter"
                    className="w-full h-full object-cover aspect-square"
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
              <RegisterButton url={g.registerUrl} />
            </div>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((w) => (
              <div key={w.title} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-secondary/20 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
                {/* Hover top line accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                
                {/* Soft Tint Icon Box */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${w.colorClass}`}>
                  <w.icon className="h-5.5 w-5.5" />
                </div>
                
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-secondary transition-colors duration-300">
                  {w.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
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
              <div className="text-xl font-extrabold text-slate-900 font-display">Free Registration Open</div>
            </div>
            
            <div className="flex flex-col items-center gap-3.5">
              <RegisterButton url={g.registerUrl} />
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

