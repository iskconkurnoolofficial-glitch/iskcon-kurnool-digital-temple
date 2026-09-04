import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  Languages,
  Timer,
  Award,
  Globe
} from "lucide-react";

export default function HomeGitaCourseSection() {
  const { gitaCourse: g, heroBanners } = useAdmin();

  const heroImage =
    (heroBanners as any)?.gitaCourse ||
    (heroBanners as any)?.gita ||
    g?.heroImage ||
    g?.gitaAboutImage ||
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80";

  const status = g?.status || "Registrations Opened";
  const isOpened = status === "Registrations Opened";
  const isComingSoon = status === "Coming Soon";
  const isClosed = status === "Closed";

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#220d3f] via-[#33145c] to-[#1c0836] text-white border-t border-b border-amber-400/30">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-28 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-28 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Course Intro Details & Key Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm">
                  <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                  <span>{g?.eyebrow || "18-Day Online Course"}</span>
                </span>

                {isComingSoon ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    ⏳ Coming Soon
                  </span>
                ) : isClosed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-extrabold">
                    <Lock className="h-3 w-3 text-rose-300" />
                    🔒 Registrations Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    ✅ Registrations Open
                  </span>
                )}
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                {g?.title || "18 Days, 18 Chapters — Bhagavad Gita Course"}
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
              {g?.tagline ||
                "Discover life lessons from the Bhagavad Gita explained in simple Telugu by ISKCON Kurnool teachers. Learn to stay calm in challenges, act with clarity, and live with purpose."}
            </p>

            {/* Quick Course Info Card */}
            <div className="rounded-2xl p-4 bg-white/5 border border-white/15 backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                  <span className="font-bold text-white">{g?.startLabel || "July 14"} – {g?.endLabel || "July 31"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Time</span>
                  <span className="font-bold text-white">{g?.time || "7:30 PM Daily"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
                <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Medium &amp; Mode</span>
                  <span className="font-bold text-white">Telugu • Online</span>
                </div>
              </div>
            </div>

            {/* 4 Core Features Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Languages className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">Simple Telugu</h4>
                  <p className="text-[11px] text-slate-300">Easy to understand</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Timer className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">30–40 Mins Daily</h4>
                  <p className="text-[11px] text-slate-300">Fits evening routine</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">All 18 Chapters</h4>
                  <p className="text-[11px] text-slate-300">Complete curriculum</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Award className="h-5 w-5 text-yellow-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">ISKCON Guidance</h4>
                  <p className="text-[11px] text-slate-300">Traditional wisdom</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/gita-course"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(245,197,24,0.3)] transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Explore Gita Course</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isOpened ? (
                <a
                  href={g?.registerUrl || "/gita-course"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition hover:scale-105 cursor-pointer"
                >
                  <span>Register Free Now</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : isComingSoon ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold text-sm cursor-not-allowed opacity-80"
                >
                  <Lock className="h-4 w-4" /> 🔒 Registrations Coming Soon
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 font-bold text-sm cursor-not-allowed opacity-80"
                >
                  <Lock className="h-4 w-4" /> 🔒 Registrations Closed
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Image Banner (Bhagavad Gita Showcase Card - Full Uncropped Image) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border-2 border-amber-400/40 bg-slate-950/80 shadow-2xl group hover:shadow-[0_25px_60px_-15px_rgba(245,197,24,0.3)] transition-all duration-500 flex flex-col">
              
              {/* Full Image Container */}
              <div className="relative w-full bg-slate-950 flex items-center justify-center p-2 min-h-[320px] sm:min-h-[400px]">
                <img
                  src={heroImage}
                  alt="Bhagavad Gita Course ISKCON Kurnool"
                  className="w-full h-auto max-h-[520px] object-contain rounded-2xl group-hover:scale-102 transition-transform duration-500"
                />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-400/40 shadow-lg">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Bhagavad Gita As It Is</span>
                </div>
              </div>

              {/* Bottom Info Bar below image so artwork is never hidden */}
              <div className="p-4 bg-white/10 backdrop-blur-md text-white flex flex-wrap items-center justify-between gap-2 font-bold text-xs sm:text-sm border-t border-white/10">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Free Registration • All Welcome</span>
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  18 Days Course
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
