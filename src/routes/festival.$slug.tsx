import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import LanguageToggle from "@/components/LanguageToggle";
import { useAdmin, normalizeFestival, isFestivalLive, Festival, Seva, getSevaCategories } from "@/context/AdminContext";
import { Calendar, Heart, HandHeart, ArrowLeft, Sparkles, MapPin, Clock, Flame, Music, BookOpen, Utensils, Droplet, Check, Sunrise, Sun, Sunset, Moon, ExternalLink, Navigation } from "lucide-react";
import { getCurrentTimeIST, isTimeStrLive } from "@/lib/scheduleUtils";

export const Route = createFileRoute("/festival/$slug")({
  head: () => ({ meta: [
    { title: "Festival — ISKCON Kurnool" },
    { name: "description", content: "Participate in festival sevas at ISKCON Kurnool." },
  ]}),
  component: Page,
});

const RAZORPAY_KEY = "rzp_live_TTxJXHnvmVNCF8";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function fmt(d: string) {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }); }
  catch { return d; }
}

function SidebarCarousel({ images }: { images: string[] }) {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCur((c) => (c + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-3xs group aspect-[4/3] bg-slate-950 select-none">
      {/* Images container */}
      <div className="w-full h-full relative">
        {images.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`Gallery slide ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === cur ? "opacity-100 scale-100 z-1" : "opacity-0 scale-105 z-0"
            }`}
          />
        ))}
      </div>

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCur(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === cur ? "w-4 bg-amber-400" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Left/Right buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCur((c) => (c - 1 + images.length) % images.length)}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-black/45 backdrop-blur-xs text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 z-10 cursor-pointer text-xs font-bold"
          >
            &#8592;
          </button>
          <button
            onClick={() => setCur((c) => (cur + 1) % images.length)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-black/45 backdrop-blur-xs text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 z-10 cursor-pointer text-xs font-bold"
          >
            &#8594;
          </button>
        </>
      )}
    </div>
  );
}

function getPeriod(timeStr: string): "Morning" | "Afternoon" | "Evening" | "Night" {
  if (!timeStr) return "Morning";
  const clean = timeStr.trim().toLowerCase();
  const isPM = clean.includes("pm");
  const isAM = clean.includes("am");
  const match = clean.match(/(\d+)(?::(\d+))?/);
  if (!match) return "Morning";
  let hour = parseInt(match[1], 10);
  if (isPM && hour !== 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }
  if (hour >= 4 && hour < 12) {
    return "Morning";
  } else if (hour >= 12 && hour < 16) {
    return "Afternoon";
  } else if (hour >= 16 && hour < 20) {
    return "Evening";
  } else {
    return "Night";
  }
}

function getFestivalProgramIcon(title: string) {
  const t = (title || "").toLowerCase();
  if (t.includes("arati") || t.includes("aarati") || t.includes("harati") || t.includes("darshan")) {
    return Flame;
  }
  if (t.includes("kirtan") || t.includes("bhajan") || t.includes("chant") || t.includes("sing") || t.includes("dance")) {
    return Music;
  }
  if (t.includes("discourse") || t.includes("lecture") || t.includes("class") || t.includes("gita") || t.includes("bhagavat") || t.includes("talk") || t.includes("pravachanam")) {
    return BookOpen;
  }
  if (t.includes("prasadam") || t.includes("feast") || t.includes("lunch") || t.includes("dinner") || t.includes("breakfast") || t.includes("bhoga") || t.includes("vitaran")) {
    return Utensils;
  }
  if (t.includes("abhishe")) {
    return Droplet;
  }
  return Sparkles;
}

function Page() {
  const { slug } = useParams({ from: "/festival/$slug" });
  const { festivals, sevas: globalSevas, settings, theme, ready } = useAdmin();

  const festival = useMemo(() => {
    const f = festivals.map(normalizeFestival).find((x) => x.slug === slug);
    return f && isFestivalLive(f) ? f : null;
  }, [festivals, slug]);

  const isFestivalToday = useMemo(() => {
    if (!festival?.date) return false;
    const todayISTStr = getCurrentTimeIST().toISOString().split("T")[0];
    return festival.date === todayISTStr;
  }, [festival?.date]);

  const groupedPrograms = useMemo(() => {
    const groups = {
      Morning: [] as { time: string; title: string; description?: string }[],
      Afternoon: [] as { time: string; title: string; description?: string }[],
      Evening: [] as { time: string; title: string; description?: string }[],
      Night: [] as { time: string; title: string; description?: string }[],
    };

    if (!festival || !festival.program) return groups;

    for (const item of festival.program) {
      const period = getPeriod(item.time);
      groups[period].push(item);
    }

    return groups;
  }, [festival]);

  if (!festival) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] grid place-items-center px-6 text-center">
          <div>
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-display text-2xl font-bold text-primary mb-2">{ready ? "Festival not found" : "Loading…"}</h1>
            {ready && <Link to="/" className="text-accent inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Back to home</Link>}
          </div>
        </div>
      </SiteLayout>
    );
  }

  const sevas = useMemo(() => {
    if (!festival) return [];
    
    // 1. Get active inline sevas
    const inline = festival.sevas.filter((s) => s.active);
    
    // 2. Get active global sevas linked to this festival
    const linked = (globalSevas || [])
      .filter((s) => s.active && (s.festivalId === festival.id || (Array.isArray(s.festivalIds) && s.festivalIds.includes(festival.id))));
      
    // 3. Merge them, keeping unique IDs and sorting by order
    const merged = [...inline];
    for (const s of linked) {
      if (!merged.some((m) => m.id === s.id)) {
        merged.push(s);
      }
    }
    
    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [festival, globalSevas]);

  const isJanmashtami = festival.slug === "sri-krishna-janmastami" || festival.slug === "janmashtami";

  return (
    <SiteLayout>
      <FestivalBanner f={festival} />

      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: About, Description */}
          <div className="lg:col-span-8 space-y-10">
            {/* About Festival */}
            <div className="bg-white rounded-3xl border-2 border-amber-400/80 p-6 sm:p-8 md:p-10 shadow-md shadow-amber-500/5 space-y-5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-4 gap-4 flex-wrap sm:flex-nowrap">
                <h2 className="font-display text-2xl sm:text-3xl font-black text-primary flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-amber-500" />
                  About the Celebration
                </h2>
                <div className="scale-90 origin-right">
                  <LanguageToggle />
                </div>
              </div>
              <div className="relative">
                <div className="max-h-[300px] sm:max-h-[360px] overflow-y-auto pr-3 sm:pr-4 space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-sans scrollbar-thin">
                  {festival.description ? (
                    <div 
                      className="prose-festival text-slate-700 max-w-none text-sm sm:text-base leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: festival.description }} 
                    />
                  ) : (
                    <div className="space-y-3">
                      <p>
                        Welcome to the divine celebration of <strong>{festival.title}</strong> at ISKCON Kurnool! This holy occasion brings together thousands of devotees to immerse in ecstatic kirtans, grand deity abhishekams, divine discourses, and Jagannath Mahaprasadam distribution.
                      </p>
                      <p>
                        Throughout the day, the temple atmosphere resonates with transcendental chanting of the Hare Krishna Maha-Mantra, Vedic rituals, elaborate flower decorations (Pushpa Alankaram), and auspicious arati ceremonies.
                      </p>
                      <p>
                        We warmly invite you and your family to join us in person, participate in sacred sevas, receive Sri Sri Radha Govinda's merciful blessings, and relish the festive prasadam.
                      </p>
                    </div>
                  )}
                </div>
                {/* Subtle Gradient Shadow Indicator for Scrollable Content */}
                <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>
            
            {/* Schedule Text (if it exists separate from timeline) */}
            {festival.schedule && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-2xs space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl font-black text-primary border-b pb-4 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-accent" />
                  Festival Schedule Notes
                </h2>
                <div className="prose-festival text-slate-700 max-w-none text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: festival.schedule }} />
              </div>
            )}
          </div>

          {/* Right Column: Venue Card, Quick Sponsor Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Improved Location Card */}
            {(festival.location || festival.locationAddress) && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-primary">
                      Venue Details
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ISKCON Kurnool Temple</p>
                  </div>
                </div>

                <div className="space-y-2 font-sans">
                  {festival.location && (
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {festival.location}
                    </h4>
                  )}
                  {festival.locationAddress && (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                      {festival.locationAddress}
                    </p>
                  )}
                </div>

                {festival.locationLink && (
                  <a
                    href={festival.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-amber-600 text-white hover:text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 group/map cursor-pointer text-center"
                  >
                    <MapPin className="h-4 w-4 text-amber-400 group-hover/map:scale-110 transition-transform" />
                    <span>Navigate on Google Maps</span>
                  </a>
                )}
              </div>
            )}

            {/* Sticky Sponsorship Callout Card */}
            <div className="bg-gradient-to-tr from-purple-950 via-primary to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-400 fill-amber-400" />
                <h3 className="font-display text-xl font-bold tracking-wide">Deity Sponsorship</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                Support the grand decorations, fresh flower garlands, grand abhishekam, and free distribution of Jagannath Mahaprasadam to thousands of devotees.
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById("sevas-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer block text-center uppercase tracking-wider hover:scale-[1.02] active:scale-98"
              >
                Sponsor Auspicious Sevas
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Program Timings Section (Full Bleed Background Container) */}
      {festival.program && festival.program.length > 0 && (
        <section id="program-section" className="relative overflow-hidden bg-slate-950 border-y border-slate-900 py-16 sm:py-20 scroll-mt-24 text-white">
          {/* Shifting Gradient & Illusion Background */}
          <ScheduleBackground />

          <div className="max-w-4xl mx-auto px-5 sm:px-6 space-y-12 relative z-10">
            
            {/* Section Header */}
            <div className="text-center space-y-3 font-sans">
              <div className="inline-flex items-center justify-center p-3 bg-amber-500/15 text-amber-300 rounded-2xl border border-amber-400/30 shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight">
                Festival Schedule
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed font-sans font-normal">
                Explore the auspicious schedule of divine rituals, ecstatic kirtans, spiritual discourses, and Mahaprasadam distribution throughout the day.
              </p>
            </div>

            <div className="space-y-12">
              {(Object.keys(groupedPrograms) as Array<keyof typeof groupedPrograms>).map((period) => {
                const items = groupedPrograms[period];
                if (items.length === 0) return null;
                
                let PeriodIcon = Sunrise;
                let periodThemeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                
                if (period === "Afternoon") {
                  PeriodIcon = Sun;
                  periodThemeColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                } else if (period === "Evening") {
                  PeriodIcon = Sunset;
                  periodThemeColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                } else if (period === "Night") {
                  PeriodIcon = Moon;
                  periodThemeColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                }
                
                return (
                  <div key={period} className="space-y-4 font-sans">
                    {/* Period Header */}
                    <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
                      <div className={`p-2.5 rounded-xl border ${periodThemeColor}`}>
                        <PeriodIcon className="h-5 w-5" />
                      </div>
                      <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-white tracking-wide">
                        {period} Celebration
                      </h3>
                      <div className="h-px bg-gradient-to-r from-amber-500/20 to-transparent flex-1 mx-4 hidden sm:block" />
                      <span className="font-sans text-xs font-bold text-amber-200 uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-400/20 shadow-2xs">
                        {items.length} {items.length === 1 ? "Event" : "Events"}
                      </span>
                    </div>

                    {/* Cards Stack */}
                    <div className="grid grid-cols-1 gap-4">
                      {items.map((item, idx) => {
                        const IconComponent = getFestivalProgramIcon(item.title);
                        const isLive = isFestivalToday && isTimeStrLive(item.time);

                        return (
                          <div 
                            key={idx}
                            className={`group relative p-[1px] rounded-[26px] transition-all duration-300 hover:-translate-y-0.5 ${
                              isLive 
                                ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 shadow-md animate-pulse" 
                                : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:via-amber-400 hover:to-yellow-200 shadow-sm"
                            }`}
                          >
                            <div className={`rounded-[25px] p-5 sm:p-6 bg-[#130b24]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 h-full border border-amber-500/10 ${
                              isLive ? "bg-red-950/40 border-red-500/30" : ""
                            }`}>
                              {/* Left Side: Icon + Program Titles & Description */}
                              <div className="flex items-start sm:items-center gap-4 flex-1">
                                
                                {/* Step / Icon Badge */}
                                <div className="relative shrink-0">
                                  <div className="p-3.5 rounded-2xl border border-amber-400/30 bg-amber-500/15 text-amber-300 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:bg-amber-500/25 group-hover:border-amber-400/50">
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  {isLive && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                    </span>
                                  )}
                                </div>

                                {/* Programs Text */}
                                <div className="flex-1 min-w-0 text-left space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-sans font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors leading-snug tracking-tight">
                                      {item.title}
                                    </h4>
                                    {isLive && (
                                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs sm:text-sm text-slate-300 font-sans font-normal leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Side: High-Visibility Solid White Timing Pill Badge */}
                              <div className="flex items-center self-start sm:self-center shrink-0">
                                <span className={`inline-flex items-center gap-2 font-sans font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-sm border whitespace-nowrap transition-all group-hover:scale-105 ${
                                  isLive
                                    ? "text-red-100 bg-red-900/60 border-red-500/50 shadow-md"
                                    : "text-slate-950 bg-white border-white shadow-md hover:bg-amber-50"
                                }`}>
                                  <Clock className={`w-4 h-4 shrink-0 ${
                                    isLive ? "text-red-300" : "text-amber-600"
                                  }`} />
                                  <span>{item.time}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </section>
      )}

      {/* Sevas Section */}
      <section id="sevas-section" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20 scroll-mt-24 text-slate-900">
        
        {/* All Sevas Can Be Done in Jagannath Sevas Message Banner */}
        <div className="mb-10 p-4 sm:p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-300/80 dark:border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-950 dark:text-amber-200 font-bold text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="h-5.5 w-5.5 animate-pulse text-amber-600" />
            </div>
            <div>
              <span className="block font-black text-sm sm:text-base text-amber-950 dark:text-amber-200">All sevas can be done in Jagannath Sevas</span>
              <span className="text-xs text-amber-800/80 dark:text-amber-300/80 font-normal block">Explore all temple sevas, Nitya Seva, Anna Dana, and deity worship offerings.</span>
            </div>
          </div>
          <Link
            to="/donate"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs uppercase tracking-wider transition hover:scale-105 shadow-md shrink-0 cursor-pointer"
          >
            Jagannath Sevas ➔
          </Link>
        </div>

        {sevas.length > 0 && (
          <div className="text-center mb-12 space-y-3 font-sans">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/15 border border-amber-300/60 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Sacred Festival Offerings</span>
            </div>
            
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-purple-950 via-primary to-amber-700 dark:from-white dark:via-amber-200 dark:to-amber-400 bg-clip-text text-transparent leading-snug">
              Offer a Festival Seva
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-sans font-medium">
              Select an auspicious seva offering below and obtain Their Lordships' divine blessings.
            </p>
          </div>
        )}
        {sevas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-slate-50 border rounded-3xl max-w-md mx-auto">
            <HandHeart className="h-10 w-10 mx-auto opacity-40 mb-2" />
            <p className="text-sm font-semibold">No sevas available for this festival yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sevas.map((s) => (
              <SevaCard key={s.id} seva={s} settings={settings} theme={theme} />
            ))}
          </div>
        )}

      </section>

      {/* Large Bottom Venue & Location Section */}
      <section id="location-section" className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 text-white py-16 sm:py-24 border-t border-slate-800 scroll-mt-24 font-sans">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Festival Venue</span>
            </div>
            
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Venue &amp; Location
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
              Join us live at the temple! Find full address details and get step-by-step navigation directly to Sri Sri Radha Govinda Temple.
            </p>
          </div>

          {/* Large Hero Location Showcase Card */}
          <div className="bg-slate-900/90 rounded-3xl border border-amber-500/20 p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Venue Information & Action Buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                
                <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-white leading-snug">
                  {festival.location || "ISKCON Kurnool Sri Sri Radha Govinda Temple"}
                </h3>
                
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-800/80 font-sans">
                  {festival.locationAddress || "Gowri Gopal Hospital Road, Near New Bus Stand, Kurnool, Andhra Pradesh 518003"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={festival.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((festival.location || "ISKCON Kurnool") + " " + (festival.locationAddress || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/nav cursor-pointer"
                >
                  <MapPin className="h-5 w-5 text-white group-hover/nav:scale-110 transition-transform" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="h-4 w-4 text-amber-200" />
                </a>
              </div>
            </div>

            {/* Right: Embedded Google Maps Visual Showcase */}
            <div className="lg:col-span-5 w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl relative bg-slate-950 group">
              <iframe
                title="ISKCON Kurnool Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3845.8948123048597!2d78.0315!3d15.8281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDQ5JzQxLjIiTiA3OMKwMDEnNTMuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/10 text-xs text-amber-200 font-bold flex items-center justify-between pointer-events-none">
                <span>📍 ISKCON Kurnool Sanctuary</span>
                <span className="text-[10px] text-slate-400 font-normal">Open Daily</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SparkleBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 6 + 4; // 4px to 10px
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 6;
      const opacity = Math.random() * 0.5 + 0.3;
      return { id: i, size, left, top, delay, duration, opacity };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 3D Parallax Rotating Radial Lights */}
      <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_60%)] animate-[spin_60s_linear_infinite] pointer-events-none" />
      <div className="absolute -inset-[30%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_50%)] animate-[spin_40s_linear_reverse_infinite] pointer-events-none" />

      {/* Floating Sparkles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_10px_2px_rgba(251,191,36,0.6)] animate-float-fade"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        />
      ))}

      {/* Keyframe Injector */}
      <style>{`
        @keyframes float-fade {
          0% {
            transform: translateY(0px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
            transform: translateY(-40px) rotate(180deg) scale(1.2);
          }
          100% {
            transform: translateY(-80px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        .animate-float-fade {
          animation-name: float-fade;
        }
      `}</style>
    </div>
  );
}

function ScheduleBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const size = Math.random() * 5 + 3; // 3px to 8px
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = Math.random() * 15 + 8;
      const opacity = Math.random() * 0.6 + 0.3;
      return { id: i, size, left, top, delay, duration, opacity };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gradient-to-b from-[#0a0514] via-[#120824] to-[#0a0514]">
      {/* Floating Ambient Golden Glowing Blob Lights */}
      <div className="absolute top-[-10%] -left-20 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-transparent rounded-full blur-[140px] animate-[float-slow_22s_infinite_ease-in-out]" />
      <div className="absolute bottom-[-15%] -right-20 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-orange-500/15 via-amber-600/15 to-transparent rounded-full blur-[140px] animate-[float-slow_28s_infinite_ease-in-out_reverse]" />
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-yellow-500/10 rounded-full blur-[120px] animate-[pulse_10s_infinite]" />
      <div className="absolute bottom-1/3 right-1/4 w-[380px] h-[380px] bg-amber-500/8 rounded-full blur-[100px] animate-[float-slow_18s_infinite_ease-in-out]" />

      {/* Grid Overlay for depth illusion */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Floating Sparkles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 shadow-[0_0_12px_3px_rgba(251,191,36,0.65)] animate-float-fade"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        />
      ))}

      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}

function FestivalBanner({ f }: { f: Festival }) {
  const dateStr = fmt(f.date);
  const isJanmashtami = f.slug === "sri-krishna-janmastami" || f.slug === "janmashtami";

  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-[40vh] sm:min-h-[50vh] md:min-h-[55vh] flex items-end">
      {/* Background Dark Gradient (No Background Banner Image) */}
      <div className="absolute inset-0 select-none pointer-events-none z-0 bg-gradient-to-br from-[#210936] via-[#2d0e4a] to-[#120520]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Sparkles Animation Layer */}
      <SparkleBackground />

      {/* Hero Content Container */}
      <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-16 md:py-20 z-10 text-white font-sans">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Details & CTA */}
          <div className="md:col-span-7 space-y-6">
            {/* Top Row: Back Link */}
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/festivals"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider group cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to All Utsavas</span>
              </Link>
            </div>

            {/* Date and Location Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30 backdrop-blur-md">
                <Calendar className="h-4 w-4 text-amber-400" />
                {dateStr}
              </span>
              {f.location && (
                <span className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-200 px-3 py-1.5 rounded-xl border border-purple-500/30 backdrop-blur-md">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  {f.location}
                </span>
              )}
            </div>

            {/* Title & Short Description */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                {f.title}
              </h1>
              {f.shortDescription ? (
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl font-sans">
                  {f.shortDescription}
                </p>
              ) : (
                <p className="text-sm sm:text-base text-slate-400 italic font-sans">
                  Sponsor aratis, abhishekams, prasadam distribution, and decorations to receive Their Lordships' blessings.
                </p>
              )}
            </div>

            {/* CTA Buttons inside Hero */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById("sevas-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm shadow-gold hover:scale-[1.03] transition-all cursor-pointer font-sans uppercase tracking-wider"
              >
                Offer Sevas &amp; Donate
              </button>
              {f.program && f.program.length > 0 && (
                <button
                  onClick={() => {
                    const el = document.getElementById("program-section");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md font-bold text-xs sm:text-sm hover:scale-[1.03] transition-all cursor-pointer font-sans"
                >
                  View Schedule
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Carousel inside Hero banner */}
          {f.carouselImages && f.carouselImages.length > 0 && (
            <div className="md:col-span-5 w-full max-w-sm md:max-w-none justify-self-center md:justify-self-end relative animate-fade-in">
              {/* 3D Glassmorphic Container for Carousel */}
              <div className="p-2 rounded-[34px] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <SidebarCarousel images={f.carouselImages} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SevaCard({ seva, settings, theme }: { seva: Seva; settings: any; theme: any }) {
  const firstPrice = seva.prices?.[0]?.amount;

  return (
    <div className="group relative p-[2px] rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:via-orange-500 hover:to-rose-500 shadow-md hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-1 font-sans flex flex-col w-full text-slate-900">
      <div className="bg-white rounded-[22px] overflow-hidden flex flex-col sm:flex-row flex-1">
        
        {/* Left Image Banner */}
        <div className="relative w-full sm:w-44 md:w-52 aspect-square sm:aspect-auto overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-white p-3 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-amber-100/60 shrink-0">
          <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center bg-white shadow-2xs">
            {seva.thumbnail ? (
              <img 
                src={seva.thumbnail} 
                alt={seva.title} 
                loading="lazy" 
                className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-primary/30 bg-primary/5 rounded-2xl">
                <HandHeart className="h-14 w-14" />
              </div>
            )}
          </div>
        </div>

        {/* Right Card Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 font-sans">
          
          {/* Category Badges + Title and Short Description */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {getSevaCategories(seva).map((cat) => (
                <span key={cat} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 uppercase tracking-wider font-sans">
                  {cat}
                </span>
              ))}
            </div>

            <h3 className="font-display font-extrabold text-lg sm:text-xl text-primary leading-snug group-hover:text-amber-600 transition-colors">
              {seva.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {seva.description || "Support ISKCON Kurnool temple activities and daily deity worship with your generous contribution."}
            </p>
          </div>

          {/* Sponsor CTA Action */}
          <div className="pt-2 border-t border-slate-100 font-sans flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            {firstPrice && (
              <div className="text-sm font-sans text-slate-500">
                Seva price: <strong className="text-base font-extrabold text-primary">₹{firstPrice.toLocaleString("en-IN")}</strong>
              </div>
            )}
            <Link
              to="/donate/$slug"
              params={{ slug: seva.slug || seva.id }}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/35 transition-all duration-300 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2 group/btn font-sans shrink-0 w-full sm:w-auto"
            >
              <Heart className="h-4 w-4 fill-white/20 text-white group-hover/btn:scale-125 transition-transform" />
              <span>Sponsor Seva</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
