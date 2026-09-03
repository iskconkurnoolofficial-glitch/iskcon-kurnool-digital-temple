import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, DailyClass } from "@/context/AdminContext";
import { isDailyClassLive, parseTimeStrToMinutes, getCurrentTimeIST } from "@/lib/scheduleUtils";
import { Calendar, Clock, Globe2, Video, Search, Sparkles, BookOpen, ExternalLink, Radio, CheckCircle2, Timer } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [
    { title: "Daily Classes — ISKCON Kurnool" },
    { name: "description", content: "Join our daily spiritual classes, including Srimad Bhagavatam readings and Bhagavad Gita discourses." },
  ]}),
  component: Page,
});

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80";

function fmtDate(dt: string) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch { return dt; }
}

function fmtTime(dt: string) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch { return ""; }
}

function Page() {
  const { classes } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");
  const [now, setNow] = useState(Date.now());

  // Update time every 5 seconds to keep live/upcoming states accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter out inactive classes
  const activeClasses = classes.filter(c => c.active);

  // Group classes by status
  const categorized = activeClasses.map(c => {
    const isLive = isDailyClassLive(c);
    const startMin = parseTimeStrToMinutes(c.startTimeStr || "");
    const nowIst = getCurrentTimeIST();
    const currentMin = nowIst.getHours() * 60 + nowIst.getMinutes();

    let status: "live" | "upcoming" | "past" = "past";
    if (isLive) {
      status = "live";
    } else if (startMin !== null && currentMin < startMin) {
      status = "upcoming";
    } else {
      status = "past";
    }

    return { ...c, status, startTimeMs: startMin ?? 0 };
  });

  // Apply filters
  const filtered = categorized.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === "All" || c.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  // Sort classes: Live first, then upcoming (soonest first), then completed (most recent first)
  const sortedClasses = [...filtered].sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;
    if (a.status === "upcoming" && b.status === "past") return -1;
    if (b.status === "upcoming" && a.status === "past") return 1;
    if (a.status === "upcoming" && b.status === "upcoming") return a.startTimeMs - b.startTimeMs;
    if (a.status === "past" && b.status === "past") return b.startTimeMs - a.startTimeMs;
    return b.startTimeMs - a.startTimeMs;
  });

  // Get list of unique languages actually present in classes
  const languages = ["All", ...Array.from(new Set(activeClasses.map(c => c.language).filter(Boolean)))];

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Spiritual Discourses" 
        title="Daily Classes" 
        subtitle="Morning Srimad Bhagavatam readings and evening Bhagavad Gita classes led by ISKCON devotees." 
        pageKey="courses" 
      />

      {/* FILTER BAR & SEARCH */}
      <section className="py-8 bg-background border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Languages Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  selectedLang === lang
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search daily classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
            />
          </div>
        </div>
      </section>

      <section className="pt-4 pb-16 md:pt-6 md:pb-24 bg-gradient-to-b from-background via-surface/70 to-background min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="space-y-6 animate-fade-up">
            <h2 className="font-display font-bold text-2xl text-primary tracking-tight flex items-center gap-2.5">
              <CheckCircle2 className="h-6 w-6 text-green-600" /> Daily Classes by ISKCON Kurnool
            </h2>
            
            {sortedClasses.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-3xl bg-card border border-border/80 text-muted-foreground max-w-xl mx-auto shadow-sm">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-secondary/80" />
                <p className="font-medium text-foreground">No classes found</p>
                <p className="text-sm mt-1">Try refining your search or language filter.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedClasses.map((c) => (
                  <ClassCard key={c.id} c={c} isLive={c.status === "live"} isPast={c.status === "past"} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ClassCard({ c, isLive = false, isPast = false }: { c: DailyClass; isLive?: boolean; isPast?: boolean }) {
  const joinUrl = c.joinUrl?.trim();
  
  // Detect meeting provider for custom styling/branding
  let providerType = "meet";
  let providerLabel = "Join Class";
  
  if (joinUrl) {
    if (joinUrl.includes("meet.google.com")) {
      providerType = "google-meet";
      providerLabel = "Join Google Meet";
    } else if (joinUrl.includes("zoom.us")) {
      providerType = "zoom";
      providerLabel = "Join Zoom Meeting";
    } else if (joinUrl.includes("youtube.com") || joinUrl.includes("youtu.be")) {
      providerType = "youtube";
      providerLabel = "Watch on YouTube";
    }
  }

  const durationText = c.durationMin 
    ? c.durationMin >= 60 
      ? `${Math.floor(c.durationMin / 60)}h${c.durationMin % 60 > 0 ? ` ${c.durationMin % 60}m` : ""}` 
      : `${c.durationMin} mins`
    : "60 mins";

  return (
    <div 
      className={`group flex flex-col rounded-3xl overflow-hidden bg-card border transition-all duration-300 ${
        isLive 
          ? "border-red-400/40 shadow-elegant hover:shadow-[0_20px_50px_-20px_rgba(239,68,68,0.2)]" 
          : "border-border/80 hover:shadow-elegant hover:-translate-y-1"
      }`}
    >
      {/* CARD THUMBNAIL */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        <img 
          src={c.thumbnail || DEFAULT_THUMBNAIL} 
          alt={c.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live Now
            </span>
          )}
          {!isLive && !isPast && (
            <span className="bg-secondary text-secondary-foreground text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Scheduled
            </span>
          )}
          {isPast && (
            <span className="bg-green-600/10 text-green-700 border border-green-600/20 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm animate-fade-in">
              Completed
            </span>
          )}
        </div>
      </div>

        {/* CARD BODY */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-lg text-primary leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-2">
              {c.title}
            </h3>
            {c.description && (
              <p className="text-sm text-foreground/75 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            )}
            
            <div className="space-y-2.5 pt-1">
              {/* Grid for Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-2xl border border-border/40 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-accent shrink-0" /> Date
                  </span>
                  <span className="font-bold text-foreground leading-tight text-[13px]">
                    {c.everyday ? "Every Day" : fmtDate(c.startAt)}
                  </span>
                </div>
                <div className="bg-muted/50 p-3 rounded-2xl border border-border/40 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-accent shrink-0" /> Time (IST)
                  </span>
                  <span className="font-bold text-foreground leading-tight text-[13px]">
                    {c.startTimeStr && c.endTimeStr 
                      ? `${c.startTimeStr} – ${c.endTimeStr}` 
                      : c.startTimeStr 
                        ? c.startTimeStr 
                        : fmtTime(c.startAt)}
                  </span>
                </div>
              </div>

              {/* Grid for Duration & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-2xl border border-border/40 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider mb-1 flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-accent shrink-0" /> Duration
                  </span>
                  <span className="font-bold text-foreground leading-tight text-[13px]">{durationText}</span>
                </div>
                <div className="bg-muted/50 p-3 rounded-2xl border border-border/40 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider mb-1 flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-accent shrink-0" /> Language
                  </span>
                  <span className="font-bold text-foreground leading-tight text-[13px]">{c.language}</span>
                </div>
              </div>
            </div>
          </div>

        {/* BUTTON */}
        <div className="pt-2">
          {joinUrl ? (
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
                isLive 
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-glow hover:scale-[1.02]" 
                  : isPast
                    ? "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                    : "bg-primary hover:bg-primary/95 text-primary-foreground hover:scale-[1.02]"
              }`}
            >
              <Video className="h-4 w-4 shrink-0" />
              <span>{providerLabel}</span>
              <ExternalLink className="h-3 w-3 opacity-60 ml-0.5 shrink-0" />
            </a>
          ) : (
            <button
              disabled
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-muted text-muted-foreground cursor-not-allowed"
            >
              <Video className="h-4 w-4 shrink-0" />
              <span>Link coming soon</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

