import { useState, useEffect, useMemo } from "react";
import { useAdmin, LiveProgrammeItem, LivePlatform } from "@/context/AdminContext";
import { 
  Radio, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Bell, 
  Play, 
  Sparkles, 
  Tv, 
  Eye, 
  CheckCircle2, 
  ChevronRight,
  Share2,
  CalendarPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * Format 24-hr time string "07:30" to "7:30 AM"
 */
function formatTime12(time24: string): string {
  if (!time24) return "";
  try {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  } catch {
    return time24;
  }
}

/**
 * Format ISO date string "YYYY-MM-DD" to "August 23, 2026"
 */
function formatLiveDate(dateIso: string): { fullDate: string; isToday: boolean; isTomorrow: boolean; dayOfWeek: string } {
  try {
    const [y, m, d] = dateIso.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const fullDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(y, m - 1, d);
    check.setHours(0, 0, 0, 0);

    const diffDays = Math.round((check.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      fullDate,
      isToday: diffDays === 0,
      isTomorrow: diffDays === 1,
      dayOfWeek,
    };
  } catch {
    return { fullDate: dateIso, isToday: false, isTomorrow: false, dayOfWeek: "" };
  }
}

/**
 * Generates Google Calendar reminder link
 */
function generateGoogleCalendarUrl(item: LiveProgrammeItem): string {
  try {
    const [y, m, d] = item.date.split("-").map(Number);
    const [sh, sm] = (item.startTime || "07:00").split(":").map(Number);
    const [eh, em] = (item.endTime || "08:00").split(":").map(Number);

    const start = new Date(Date.UTC(y, m - 1, d, sh - 5, sm - 30)); // IST to UTC approx
    const end = new Date(Date.UTC(y, m - 1, d, eh - 5, em - 30));

    const fmtUtc = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");

    const title = encodeURIComponent(`🔴 LIVE: ${item.title} | ISKCON Kurnool`);
    const details = encodeURIComponent(`${item.description || "Live spiritual broadcast from ISKCON Kurnool."}\n\nWatch Live Stream: ${item.streamUrl}`);
    const location = encodeURIComponent("Online — ISKCON Kurnool Digital Temple");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmtUtc(start)}/${fmtUtc(end)}&details=${details}&location=${location}`;
  } catch {
    return "https://calendar.google.com/";
  }
}

/**
 * Downloads .ics calendar invite
 */
function downloadIcsCalendar(item: LiveProgrammeItem) {
  try {
    const [y, m, d] = item.date.split("-").map(Number);
    const [sh, sm] = (item.startTime || "07:00").split(":").map(Number);
    const [eh, em] = (item.endTime || "08:00").split(":").map(Number);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dtStart = `${y}${pad(m)}${pad(d)}T${pad(sh)}${pad(sm)}00`;
    const dtEnd = `${y}${pad(m)}${pad(d)}T${pad(eh)}${pad(em)}00`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ISKCON Kurnool//Live Broadcast//EN",
      "BEGIN:VEVENT",
      `SUMMARY:LIVE: ${item.title} | ISKCON Kurnool`,
      `DESCRIPTION:${item.description || "Live temple programme"} - Watch: ${item.streamUrl}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      "LOCATION:Online Livestream",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ISKCON_Kurnool_Live_${item.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Calendar reminder invite downloaded!");
  } catch {
    toast.error("Failed to generate calendar invite.");
  }
}

export default function LiveProgrammeSection() {
  const { liveProgrammes } = useAdmin();
  const [now, setNow] = useState<Date>(new Date());

  // Periodically refresh current time every 15 seconds for smart status detection
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter published programmes
  const publishedProgrammes = useMemo(() => {
    if (!liveProgrammes.enabled) return [];
    return (liveProgrammes.programmes || []).filter((p) => p.published !== false);
  }, [liveProgrammes.enabled, liveProgrammes.programmes]);

  // Compute status for all programmes
  const evaluatedProgrammes = useMemo(() => {
    const currentMs = now.getTime();

    return publishedProgrammes.map((item) => {
      let status: "LIVE_NOW" | "UPCOMING" | "ENDED" = "UPCOMING";

      if (item.isManualLiveOverride) {
        status = "LIVE_NOW";
      } else {
        try {
          const [y, m, d] = item.date.split("-").map(Number);
          const [sh, sm] = (item.startTime || "00:00").split(":").map(Number);
          const [eh, em] = (item.endTime || "23:59").split(":").map(Number);

          const startMs = new Date(y, m - 1, d, sh, sm, 0).getTime();
          const endMs = new Date(y, m - 1, d, eh, em, 0).getTime();

          if (currentMs >= startMs && currentMs < endMs) {
            status = "LIVE_NOW";
          } else if (currentMs < startMs) {
            status = "UPCOMING";
          } else {
            status = "ENDED";
          }
        } catch {
          status = "UPCOMING";
        }
      }

      return {
        ...item,
        status,
      };
    });
  }, [publishedProgrammes, now]);

  // Find currently active Live Now programme
  const liveNowItem = useMemo(() => {
    return evaluatedProgrammes.find((p) => p.status === "LIVE_NOW");
  }, [evaluatedProgrammes]);

  // Find today's upcoming programmes (if not currently live)
  const todaysUpcoming = useMemo(() => {
    return evaluatedProgrammes.filter((p) => {
      if (p.status !== "UPCOMING") return false;
      const { isToday } = formatLiveDate(p.date);
      return isToday;
    });
  }, [evaluatedProgrammes]);

  // Find the next upcoming livestream anywhere in future
  const nextUpcoming = useMemo(() => {
    const upcomingList = evaluatedProgrammes.filter((p) => p.status === "UPCOMING");
    if (upcomingList.length === 0) return null;
    return upcomingList[0];
  }, [evaluatedProgrammes]);

  const handleReminderClick = (item: LiveProgrammeItem) => {
    const gcalUrl = generateGoogleCalendarUrl(item);
    window.open(gcalUrl, "_blank", "noopener,noreferrer");
    toast.success(`Opening Google Calendar reminder for ${item.title}`);
  };

  const getPlatformBadge = (platform: LivePlatform) => {
    switch (platform) {
      case "YouTube":
        return {
          bg: "bg-red-600/10 text-red-700 border-red-200",
          icon: "▶",
          label: "YouTube Live",
        };
      case "Facebook":
        return {
          bg: "bg-blue-600/10 text-blue-700 border-blue-200",
          icon: "f",
          label: "Facebook Live",
        };
      case "Instagram":
        return {
          bg: "bg-pink-600/10 text-pink-700 border-pink-200",
          icon: "📸",
          label: "Instagram Live",
        };
      default:
        return {
          bg: "bg-purple-600/10 text-purple-700 border-purple-200",
          icon: "📡",
          label: "Webcast",
        };
    }
  };

  // Hide the entire section if disabled or if no programme is currently live streaming
  if (!liveProgrammes.enabled || !liveNowItem) return null;

  return (
    <section className="py-12 md:py-18 bg-gradient-to-b from-white via-[#fffdfa] to-white relative overflow-hidden border-b border-amber-100">
      
      {/* Background Sacred Ambient Glow */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold uppercase tracking-widest shadow-2xs">
            <Radio className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>{liveProgrammes.badgeText || "Temple Broadcast • Live Stream"}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
            {liveProgrammes.sectionTitle || "Live Temple Broadcast"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            {liveProgrammes.sectionSubtitle || "Join live morning discourses, ecstatic kirtans, and holy deity aartis straight from ISKCON Kurnool."}
          </p>
        </div>

        {/* Dynamic State Rendering */}
        <div className="mt-8">
          
          {/* ========================================================================= */}
          {/* CASE 1: PROGRAMME IS LIVE RIGHT NOW (🔴 LIVE NOW)                        */}
          {/* ========================================================================= */}
          {liveNowItem ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 text-white border-2 border-red-500/60 shadow-2xl p-6 sm:p-8 md:p-10"
            >
              {/* Radial Live Spotlight Glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Left Col: Live Thumbnail with Play Action */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-black">
                    <img
                      src={liveNowItem.thumbnailUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80"}
                      alt={liveNowItem.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Floating LIVE Badge on Image */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg border border-red-400/40">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping absolute" />
                        <span className="h-2 w-2 rounded-full bg-white relative inline-block" />
                        LIVE NOW
                      </span>
                    </div>

                    {/* Platform Tag */}
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
                      {liveNowItem.platform} Live
                    </div>

                    {/* Center Big Play Button */}
                    <a
                      href={liveNowItem.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      title="Watch Live Stream"
                    >
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white backdrop-blur-md grid place-items-center shadow-2xl shadow-red-600/50 group-hover:scale-110 transition-all border-2 border-white/40">
                        <Play className="h-8 w-8 fill-white translate-x-0.5" />
                      </div>
                    </a>

                    {/* Bottom Live Timings Ribbon on Thumbnail */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white/90 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        {formatTime12(liveNowItem.startTime)} – {formatTime12(liveNowItem.endTime)} IST
                      </span>
                      {liveNowItem.speakerOrPerformer && (
                        <span className="truncate max-w-[180px] text-white/75 text-[11px]">
                          🎙️ {liveNowItem.speakerOrPerformer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Live Description & Large CTA */}
                <div className="lg:col-span-6 space-y-6">
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-extrabold uppercase tracking-wider">
                        <Radio className="h-3.5 w-3.5 animate-pulse" /> Official Live Stream
                      </span>
                      <span className="text-xs text-amber-300 font-sans font-semibold">
                        Today • {formatTime12(liveNowItem.startTime)} to {formatTime12(liveNowItem.endTime)}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                      {liveNowItem.title}
                    </h3>

                    {liveNowItem.description && (
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                        {liveNowItem.description}
                      </p>
                    )}
                  </div>

                  {/* Primary Watch Live CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <a
                      href={liveNowItem.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold text-base shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer text-center"
                    >
                      <Play className="h-5 w-5 fill-white" />
                      <span>Watch Live Stream Now</span>
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: liveNowItem.title,
                            text: `🔴 Watch Live: ${liveNowItem.title} from ISKCON Kurnool!\n`,
                            url: liveNowItem.streamUrl,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(liveNowItem.streamUrl);
                          toast.success("Live stream link copied to clipboard!");
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" /> Share Stream
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          ) : todaysUpcoming.length > 0 ? (
            /* ========================================================================= */
            /* CASE 2: NO ACTIVE STREAM BUT UPCOMING PROGRAMMES SCHEDULED FOR TODAY     */
            /* ========================================================================= */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <h3 className="font-display font-bold text-lg text-primary">
                    Today's Live Programme Schedule
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {todaysUpcoming.length} Upcoming Today
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todaysUpcoming.map((item) => {
                  const badge = getPlatformBadge(item.platform);
                  const isFeastHighlighted = 
                    item.title?.toLowerCase().includes("sunday feast") || 
                    item.title?.toLowerCase().includes("bhagavad gita seminar") ||
                    item.title?.toLowerCase().includes("grand sunday");

                  const cardContent = (
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        {/* Thumbnail Frame */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                          <img
                            src={item.thumbnailUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white font-sans text-xs font-bold px-3 py-1 rounded-full">
                            {formatTime12(item.startTime)} – {formatTime12(item.endTime)}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-2">
                          <div className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Today's Broadcast
                          </div>
                          <h4 className="font-display font-bold text-base text-foreground line-clamp-2">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reminder & Watch Action Footer */}
                      <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center gap-2">
                        {item.enableReminders !== false && (
                          <button
                            onClick={() => handleReminderClick(item)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 text-xs font-bold transition-colors cursor-pointer border border-amber-300"
                          >
                            <Bell className="h-3.5 w-3.5 text-accent" /> Set Reminder
                          </button>
                        )}
                        <a
                          href={item.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-foreground transition-colors shrink-0"
                          title="Open Channel / Stream Link"
                        >
                          <ExternalLink className="h-4 w-4 text-accent" />
                        </a>
                      </div>
                    </div>
                  );

                  if (isFeastHighlighted) {
                    return (
                      <div key={item.id} className="animated-red-border-wrapper">
                        <div className="animated-red-border-inner overflow-hidden flex flex-col justify-between">
                          {cardContent}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-amber-200/70 shadow-elegant overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : nextUpcoming ? (
            /* ========================================================================= */
            /* CASE 3: NO LIVE PROGRAMME CURRENTLY -> SHOW NEXT SCHEDULED LIVESTREAM     */
            /* ========================================================================= */
            <div className="bg-white rounded-3xl border border-amber-200/80 shadow-elegant p-6 sm:p-8 md:p-10 space-y-6">
              
              {/* Friendly Empty State Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-700 grid place-items-center shrink-0">
                    <Tv className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      No Live Programme Currently
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      There is no broadcast streaming right now. View the next scheduled broadcast below.
                    </p>
                  </div>
                </div>

                <a
                  href="/daily-darshan"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-colors self-start sm:self-center shrink-0 shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" /> View Today's Darshan
                </a>
              </div>

              {/* Next Scheduled Programme Card */}
              {(() => {
                const { fullDate, isToday, isTomorrow, dayOfWeek } = formatLiveDate(nextUpcoming.date);
                const badge = getPlatformBadge(nextUpcoming.platform);
                const dateDisplay = isToday ? "Today" : isTomorrow ? "Tomorrow" : fullDate;
                const isFeastHighlighted = 
                  nextUpcoming.title?.toLowerCase().includes("sunday feast") || 
                  nextUpcoming.title?.toLowerCase().includes("bhagavad gita seminar") ||
                  nextUpcoming.title?.toLowerCase().includes("grand sunday");

                const innerNextCard = (
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      {nextUpcoming.thumbnailUrl && (
                        <div className="h-20 w-28 rounded-xl overflow-hidden shrink-0 hidden sm:block border border-slate-200">
                          <img src={nextUpcoming.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateDisplay} ({dayOfWeek}) • {formatTime12(nextUpcoming.startTime)} to {formatTime12(nextUpcoming.endTime)} IST
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-lg sm:text-xl text-foreground">
                          {nextUpcoming.title}
                        </h4>

                        {nextUpcoming.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                            {nextUpcoming.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reminder Action Button */}
                    <div className="shrink-0 flex items-center gap-3">
                      {nextUpcoming.enableReminders !== false && (
                        <button
                          onClick={() => handleReminderClick(nextUpcoming)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Bell className="h-4 w-4" />
                          <span>Set Reminder</span>
                        </button>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-extrabold font-sans uppercase tracking-widest text-accent flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Next Live Programme
                    </span>

                    {isFeastHighlighted ? (
                      <div className="animated-red-border-wrapper">
                        <div className="animated-red-border-inner bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5">
                          {innerNextCard}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5">
                        {innerNextCard}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          ) : (
            /* ========================================================================= */
            /* CASE 4: NO PROGRAMMES SCHEDULED AT ALL                                    */
            /* ========================================================================= */
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <Tv className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-display font-bold text-lg text-foreground">
                No live programmes scheduled.
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Check back soon or visit our temple social channels for broadcast announcements.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
