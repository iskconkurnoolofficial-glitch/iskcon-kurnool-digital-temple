import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, type SundayGalleryItem } from "@/context/AdminContext";
import { Calendar, Clock, MapPin, Sparkles, Navigation, Link as LinkIcon, Heart, Sunrise, Sun, Sunset, Music, BookOpen, Soup, Flame, Utensils, Users, HandHeart, ArrowRight } from "lucide-react";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import SundaySponsorSection from "@/components/SundaySponsorSection";
import SundayDonationSection from "@/components/SundayDonationSection";
import SundaySponsorModal from "@/components/SundaySponsorModal";

function getProgramIcon(program: string) {
  const name = program.toLowerCase();
  if (name.includes("sankirtan") || name.includes("kirtan") || name.includes("singing") || name.includes("chanting")) {
    return { icon: Music, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-100" };
  }
  if (name.includes("gita") || name.includes("pravachanam") || name.includes("lecture") || name.includes("class") || name.includes("discourse")) {
    return { icon: BookOpen, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100" };
  }
  if (name.includes("arati") || name.includes("harati") || name.includes("darshan")) {
    return { icon: Sun, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-100" };
  }
  if (name.includes("prasada") || name.includes("feast") || name.includes("vitaran") || name.includes("distrib")) {
    return { icon: Soup, color: "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-100" };
  }
  if (name.includes("sudarshana") || name.includes("ashirvadam") || name.includes("blessing")) {
    return { icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100" };
  }
  return { icon: Clock, color: "text-primary bg-purple-50 dark:bg-purple-950/30 border-purple-100" };
}

export const Route = createFileRoute("/temple/sunday")({
  head: () => ({
    meta: [
      { title: "Sunday Feast Program — ISKCON Kurnool" },
      { name: "description", content: "Join ISKCON Kurnool every Sunday for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome." },
      { property: "og:title", content: "Sunday Feast Program — ISKCON Kurnool" },
      { property: "og:description", content: "Join us every Sunday for uplifting kirtan, spiritual discussions, and free prasadam feast. Everyone is welcome." },
    ],
  }),
  component: SundayPage,
});

const defaultGallery = [
  {
    id: "dsg1",
    url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
    label: "Devotional Kirtan Chanting"
  },
  {
    id: "dsg2",
    url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
    label: "Sunday Feast Discourses"
  },
  {
    id: "dsg3",
    url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
    label: "Serving Devotees Delicious Prasadam"
  }
];

const defaultActivityImages = [
  "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
];

const icons = [Music, BookOpen, Sun, Sparkles, Soup, Heart];

function SundayPage() {
  const { sunday, settings } = useAdmin();
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const scheduleList = sunday.schedule || [];

  // Group schedule items by time to display multiple programs under the same time slot neatly.
  const groupedSchedule: { time: string; programs: string[] }[] = [];
  scheduleList.forEach((item) => {
    const existing = groupedSchedule.find(
      (g) => g.time.trim().toLowerCase() === item.time.trim().toLowerCase()
    );
    if (existing) {
      existing.programs.push(item.program);
    } else {
      groupedSchedule.push({ time: item.time, programs: [item.program] });
    }
  });

  const gallery = sunday.gallery && sunday.gallery.length > 0 ? sunday.gallery : defaultGallery;
  const customButtons = sunday.buttons || [];
  const logoUrl = sunday.logo || settings.logo;

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Worship & Feast" 
        title="Sunday Feast Program" 
        subtitle="Experience a spiritually uplifting Sunday at ISKCON Kurnool." 
        pageKey="sunday" 
      >
        <Link
          to="/donate/sunday-feast"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-sans font-bold text-base shadow-[0_10px_25px_-5px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.65)] transition-all duration-300 hover:scale-105 border border-amber-300/40 cursor-pointer"
        >
          <HandHeart className="h-5 w-5 text-white" />
          <span>Sponsor Sunday Feast</span>
          <ArrowRight className="h-4 w-4 text-white ml-0.5" />
        </Link>
      </PageHero>

      {/* Continuous Moving Announcement Ticker */}
      <SundayAnnouncementTicker sunday={sunday} onOpenSponsorModal={() => setIsSponsorModalOpen(true)} />

      {/* Sacred Annadana Seva — Sunday Feast Sponsorship Modal */}
      <SundaySponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} />

      {/* Divine Invitation & 4 Pillars Showcase */}
      <section 
        className={`py-12 md:py-16 bg-gradient-to-b from-background via-surface/40 to-background transition-all duration-1000 transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6">
          
          {/* Main Card with Royal Devotional Theme */}
          <div className="relative rounded-[36px] bg-gradient-to-br from-[#2a1052] via-[#431976] to-[#1f0b3d] text-white p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(91,44,155,0.4)] border-2 border-secondary/30 overflow-hidden">
            
            {/* Ambient Decorative Halo & Glow Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#fec84b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
              
              {/* Header Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-secondary/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-inner">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>Divine Invitation • ISKCON Kurnool</span>
              </div>

              {/* Main Headline & Description */}
              <div className="space-y-4">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  Experience a Spiritually Uplifting Sunday
                </h2>
                
                <p className="text-white/90 font-sans text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
                  {sunday.description || "Experience a spiritually uplifting Sunday at ISKCON Kurnool. Join devotees for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome."}
                </p>
              </div>

              {/* 4 Pillars Grid: Visual Feature Highlight Capsules */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
                <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition-all duration-300 hover:-translate-y-1 text-center space-y-2 group shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                    <Music className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">Devotional Chanting</h4>
                  <p className="text-[11px] text-white/70 font-sans">Ecstatic Kirtan</p>
                </div>

                <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition-all duration-300 hover:-translate-y-1 text-center space-y-2 group shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">Gita Discourse</h4>
                  <p className="text-[11px] text-white/70 font-sans">Vedic Wisdom</p>
                </div>

                <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition-all duration-300 hover:-translate-y-1 text-center space-y-2 group shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-300 group-hover:scale-110 transition-transform">
                    <Sun className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">Deity Darshan</h4>
                  <p className="text-[11px] text-white/70 font-sans">Sacred Raja Bhoga</p>
                </div>

                <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition-all duration-300 hover:-translate-y-1 text-center space-y-2 group shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                    <Soup className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">Delicious Feast</h4>
                  <p className="text-[11px] text-white/70 font-sans">Free Prasadam</p>
                </div>
              </div>

              {/* Welcome Badge & Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-slate-900 font-bold text-xs shadow-md">
                  <Users className="h-4 w-4 text-slate-900" />
                  <span>Everyone is Welcome • Free Entry For All</span>
                </div>

                {customButtons.map((btn) => (
                  <a
                    key={btn.id}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:scale-[1.02] transition"
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    {btn.label}
                  </a>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Weekly Schedule Section - Modern Animated Connected Flow */}
      <section 
        className={`py-16 md:py-24 bg-gradient-to-b from-surface/80 via-background to-surface/60 border-y border-border/40 transition-all duration-1000 delay-150 relative overflow-hidden transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Subtle background ambient lights */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-primary dark:text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-3.5 shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-accent" /> Sunday Program Flow
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight">
              {sunday.scheduleTitle || "Weekly Schedule (Every Sunday)"}
            </h2>
            <p className="text-muted-foreground mt-3 font-sans text-sm sm:text-base leading-relaxed">
              Step into an uplifting spiritual atmosphere with our sequential devotional schedule from morning to afternoon feast.
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-secondary via-accent to-secondary mx-auto rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Modern Animated Connected Flow Timeline */}
            <div className="lg:col-span-7">
              {groupedSchedule.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-white/50 dark:bg-card/50">
                  <Clock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No schedule details updated yet. Check back soon!</p>
                </div>
              ) : (
                <div className="relative space-y-4">
                  {groupedSchedule.map((group, i) => {
                    const { icon: Icon, color: iconColor } = getProgramIcon(group.programs.join(" "));
                    const isLive = isTimeStrLive(group.time, 0); // 0 = Sunday

                    return (
                      <div 
                        key={group.time || i} 
                        style={{ transitionDelay: `${i * 70}ms` }}
                        className={`group relative p-[1.5px] rounded-[28px] transition-all duration-400 hover:-translate-y-1 hover:shadow-xl ${
                          isLive 
                            ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 shadow-[0_10px_30px_-5px_rgba(239,68,68,0.25)]" 
                            : "bg-gradient-to-r from-secondary/50 via-accent/35 to-primary/35 hover:from-secondary hover:via-accent hover:to-primary shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <div className={`rounded-[26.5px] p-5 sm:p-6 bg-white dark:bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-5 h-full ${
                          isLive ? "bg-red-50/30 dark:bg-red-950/20" : ""
                        }`}>
                          {/* Left Side: Icon + Program Titles */}
                          <div className="flex items-start sm:items-center gap-4 flex-1">
                            
                            {/* Step / Icon Badge */}
                            <div className="relative shrink-0">
                              <div className={`p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-105 shadow-sm ${iconColor}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              {isLive && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                </span>
                              )}
                            </div>

                            {/* Programs List */}
                            <div className="flex-1 min-w-0">
                              {group.programs.length === 1 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-primary transition-colors">
                                    {group.programs[0]}
                                  </h4>
                                  {isLive && (
                                    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1.5 py-0.5">
                                  {group.programs.map((prog, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-2" />
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
                                          {prog}
                                        </h4>
                                        {isLive && idx === 0 && (
                                          <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Activity {i + 1}</span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="text-[11px] text-muted-foreground">Every Sunday Morning</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Clean Time Badge */}
                          <div className="flex items-center self-start sm:self-center shrink-0">
                            <span className={`inline-flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-sm border whitespace-nowrap transition-all ${
                              isLive 
                                ? "text-red-700 bg-red-100 dark:bg-red-950/40 border-red-300" 
                                : "text-primary dark:text-amber-200 bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 group-hover:border-secondary/40 group-hover:bg-secondary/10"
                            }`}>
                              <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                              {group.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Visual Feature & Fast Highlights Card */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Premium Image Card */}
              <div className="relative group rounded-[32px] overflow-hidden border border-border/80 shadow-[0_15px_35px_-10px_rgba(91,44,155,0.1)] bg-card">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={sunday.timingsImage || "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80"} 
                    alt="Sunday Feast Timings" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Sunday Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary dark:text-amber-300 text-xs font-black shadow-md border border-white/20">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> Every Sunday Special
                  </div>

                  {/* Bottom Image Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <h3 className="font-display font-extrabold text-xl leading-tight">Sri Sri Puri Jagannath Temple</h3>
                    <p className="text-xs text-white/80 font-sans">Open to all families, youth, and visitors with free entry and prasadam.</p>
                  </div>
                </div>
              </div>

              {/* Devotional Highlights Quick Card */}
              <div className="bg-white dark:bg-card rounded-3xl p-6 border border-border/80 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" /> Why Attend Sunday Feast?
                </h4>
                
                <div className="space-y-2.5 text-xs text-muted-foreground font-sans">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-surface/50 border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                    <div>
                      <strong className="text-foreground block">Free Sanctified Prasadam:</strong>
                      Multi-course delicious vegetarian feast cooked with pure devotion.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-surface/50 border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                    <div>
                      <strong className="text-foreground block">Soulful Chanting:</strong>
                      Experience the purifying sound vibration of the Maha-Mantra.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-surface/50 border border-border/40">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                    <div>
                      <strong className="text-foreground block">All Are Welcome:</strong>
                      Bring your family and friends. No prior registration required.
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Sunday Feast Activities Cards Section */}
      <section 
        className={`py-16 md:py-24 bg-gradient-to-b from-background via-surface/50 to-background border-b border-border/40 transition-all duration-1000 delay-300 relative overflow-hidden transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Subtle decorative background glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Sequential Highlights
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight">
              Sunday Feast Activities
            </h2>
            <p className="text-muted-foreground mt-3 font-sans text-sm sm:text-base leading-relaxed">
              Explore the five sequential highlights of our Sunday gathering designed for spiritual rejuvenation and joy.
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-secondary via-accent to-secondary mx-auto rounded-full mt-4" />
          </div>

          {/* Clean Modern Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {(sunday.activities || []).map((card, i) => {
              const Icon = icons[i % icons.length];
              const cardImage = card.image || defaultActivityImages[i % defaultActivityImages.length];

              return (
                <div 
                  key={card.id || i} 
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className={`group bg-white dark:bg-card rounded-3xl border border-border/70 hover:border-secondary/40 shadow-[0_8px_30px_rgba(91,44,155,0.04)] hover:shadow-[0_20px_45px_-12px_rgba(91,44,155,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden relative transform ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                >
                  {/* Top Image Preview Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-muted">
                    <img 
                      src={cardImage} 
                      alt={card.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Floating Icon Badge */}
                    <div className="absolute bottom-3.5 right-3.5 p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-accent shadow-md border border-secondary/20 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-card">
                    <div className="space-y-2">
                      <h3 className="font-display font-extrabold text-xl text-primary group-hover:text-accent transition-colors duration-300 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Devotional Footer Line inside card */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-sans">
                      <span className="font-bold text-secondary">Activity {i + 1}</span>
                      <span className="text-[11px] text-muted-foreground/75">Every Sunday</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Dynamic Sunday Feast Sponsorship Display Section */}
      <SundaySponsorSection />

      {/* Dedicated Sunday Feast Online Donation Section */}
      <SundayDonationSection />

      {/* Auto-scrolling Gallery Section */}
      <section 
        className={`py-16 md:py-20 bg-surface overflow-hidden transition-all duration-1000 delay-550 transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-accent font-bold mb-2">
            <Sparkles className="h-4 w-4" /> Photos
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Sunday Moments</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
            A glimpse into the vibrant Sunday celebrations at ISKCON Kurnool.
          </p>
        </div>

        <div className="space-y-6">
          <AutoGallery images={gallery} direction="left" />
          <AutoGallery images={[...gallery].reverse()} direction="right" />
        </div>
      </section>

      {/* Visit ISKCON Kurnool Section - Modern Devotional Layout */}
      <section 
        className={`py-16 md:py-24 bg-gradient-to-b from-background via-surface/40 to-background border-t border-border/40 transition-all duration-1000 delay-600 relative overflow-hidden transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Ambient background glows */}
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="relative rounded-[36px] bg-gradient-to-br from-[#2a1052] via-[#431976] to-[#1f0b3d] text-white p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(91,44,155,0.4)] border-2 border-secondary/30 overflow-hidden">
            
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#fec84b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Side: Temple Emblem / Logo */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-secondary via-accent to-secondary rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="ISKCON Kurnool"
                      className="relative h-32 w-32 md:h-40 md:w-40 rounded-full object-cover ring-4 ring-secondary/80 shadow-2xl bg-white"
                    />
                  ) : (
                    <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-black text-4xl md:text-5xl ring-4 ring-secondary/80 shadow-2xl">
                      IK
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Open Every Sunday
                </div>
              </div>

              {/* Right Side: Title, Experience Subtitle, Address Capsule & CTA */}
              <div className="md:col-span-7 space-y-5 text-center md:text-left">
                
                {/* Header Badge & Title */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-secondary/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="h-3.5 w-3.5 text-accent" /> Temple Location & Darshan
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    {sunday.visitTitle || "Visit ISKCON Kurnool"}
                  </h3>
                  <p className="text-white/85 font-sans text-sm sm:text-base leading-relaxed">
                    {sunday.visitDescription || "Experience peace, devotion, and spiritual happiness. We warmly welcome you and your family every Sunday."}
                  </p>
                </div>

                {/* Structured Address Capsule Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 text-left space-y-2 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-display font-bold text-base sm:text-lg text-white">
                        ISKCON Kurnool
                      </h4>
                      <p className="text-amber-200 text-xs sm:text-sm font-medium">
                        Sri Sri Puri Jagannath Temple
                      </p>
                      <p className="text-white/75 text-xs sm:text-sm font-sans">
                        Kurnool, Andhra Pradesh, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <a
                    href={sunday.directionsUrl || settings.mapEmbed || "https://maps.google.com/?q=ISKCON+Kurnool"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-secondary hover:bg-secondary/90 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 cursor-pointer"
                  >
                    <Navigation className="h-4 w-4 shrink-0 text-slate-950" />
                    Get Directions
                  </a>

                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition hover:scale-105"
                    >
                      <Heart className="h-4 w-4 text-rose-300" />
                      Contact Temple
                    </a>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function AutoGallery({ images, direction = "left" }: { images: SundayGalleryItem[]; direction?: "left" | "right" }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        if (direction === "left") {
          track.scrollLeft += 0.7;
          const half = track.scrollWidth / 2;
          if (track.scrollLeft >= half) track.scrollLeft -= half;
        } else {
          track.scrollLeft -= 0.7;
          const half = track.scrollWidth / 2;
          if (track.scrollLeft <= 0) track.scrollLeft = half;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [images.length, direction]);

  const loop = [...images, ...images];

  return (
    <div
      ref={trackRef}
      className="flex gap-4 sm:gap-6 overflow-x-hidden py-4 cursor-grab select-none"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {loop.map((img, i) => (
        <div key={img.id + "-" + i} className="shrink-0 w-64 sm:w-72 md:w-80 group">
          <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white aspect-[4/3] relative">
            <img 
              src={img.url} 
              alt={img.label} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            {img.label && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs sm:text-sm font-medium font-sans leading-tight">{img.label}</p>
              </div>
            )}
          </div>
          {img.label && (
            <p className="text-center text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary transition duration-300 block md:hidden">
              {img.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SundayAnnouncementTicker({ sunday, onOpenSponsorModal }: { sunday: any; onOpenSponsorModal?: () => void }) {
  if (sunday.tickerEnabled === false) {
    return null;
  }

  const sponsors = (sunday.sponsors || []).filter((s: any) => s.active !== false);
  const activeSponsor = sponsors[0] || (sunday.sponsor ? { ...sunday.sponsor, active: true } : null);

  const sponsorName = activeSponsor?.name || "Sri XYZ & Family";
  const sponsorDate = activeSponsor?.date || "This Upcoming Sunday";
  const occasion = activeSponsor?.occasion || "Sacred Annadana Seva";

  const customText = sunday.tickerText?.trim();

  const tickerItem = (
    <div className="inline-flex items-center gap-3 sm:gap-5 px-6 text-xs sm:text-sm font-sans font-medium text-amber-100/95 whitespace-nowrap">
      {customText ? (
        <span className="font-semibold text-white/95">{customText}</span>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            This Sunday Feast Sponsored By:
          </span>
          <span className="font-extrabold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 shadow-xs">
            {sponsorName}
          </span>
          <span className="text-amber-300/50">•</span>
          <span className="text-amber-200 font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3 text-accent" /> {sponsorDate}
          </span>
          <span className="text-amber-300/50">•</span>
          <span className="text-white/85 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/20">{occasion}</span>
          <span className="text-amber-300/50">•</span>
          <span className="text-amber-100/80">May Sri Sri Puri Jagannath bestow abundant bhakti & auspicious blessings!</span>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-[#21093a] text-white border-y-2 border-amber-400/35 py-2.5 shadow-lg relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Fixed Announcement Pill Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-sans text-[11px] sm:text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "4s" }} />
          <span>Feast Sponsor</span>
        </div>

        {/* Continuous Moving Marquee Animation */}
        <div 
          onClick={onOpenSponsorModal} 
          className="flex-1 overflow-hidden relative cursor-pointer block select-none"
          title="Click to view Sunday Feast Sponsor details"
        >
          <div className="flex w-max animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] will-change-transform py-1">
            {tickerItem}
            {tickerItem}
            {tickerItem}
            {tickerItem}
          </div>
        </div>

        {/* Right View Details Button with Shimmer Animation */}
        <button
          type="button"
          onClick={onOpenSponsorModal}
          className="relative overflow-hidden shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary hover:bg-amber-300 text-slate-950 text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-md"
        >
          {/* Shimmer Light Sweep */}
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
          <span className="relative z-10">View</span>
          <ArrowRight className="relative z-10 h-3.5 w-3.5 text-slate-950" />
        </button>

      </div>
    </div>
  );
}

