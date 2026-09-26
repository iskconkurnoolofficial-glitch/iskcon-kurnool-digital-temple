import { useMemo } from "react";
import { useAdmin, LiveProgrammeItem, LivePlatform } from "@/context/AdminContext";
import { 
  Radio, 
  ExternalLink, 
  Clock, 
  Play, 
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
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

export default function LiveProgrammeSection() {
  const { liveProgrammes } = useAdmin();

  // Find active live item (either manually forced live or published)
  const activeLiveItem = useMemo(() => {
    if (!liveProgrammes.enabled) return null;
    const list = (liveProgrammes.programmes || []).filter((p) => p.published !== false);
    if (list.length === 0) return null;

    // 1. Prefer manual override live item
    const forcedLive = list.find((p) => p.isManualLiveOverride);
    if (forcedLive) return forcedLive;

    // 2. Otherwise check current time range or fallback to first published stream
    const nowMs = Date.now();
    for (const item of list) {
      try {
        const [y, m, d] = item.date.split("-").map(Number);
        const [sh, sm] = (item.startTime || "00:00").split(":").map(Number);
        const [eh, em] = (item.endTime || "23:59").split(":").map(Number);

        const startMs = new Date(y, m - 1, d, sh, sm, 0).getTime();
        const endMs = new Date(y, m - 1, d, eh, em, 0).getTime();

        if (nowMs >= startMs && nowMs < endMs) {
          return item;
        }
      } catch {}
    }

    // Fallback to first published broadcast item when marked live
    return list[0];
  }, [liveProgrammes.enabled, liveProgrammes.programmes]);

  // Hide the entire section if disabled or if no active live programme exists
  if (!liveProgrammes.enabled || !activeLiveItem) return null;

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
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#5b2c9b] tracking-tight">
            {liveProgrammes.sectionTitle || "Live Temple Broadcast"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            {liveProgrammes.sectionSubtitle || "Join live morning discourses, ecstatic kirtans, and holy deity aartis straight from ISKCON Kurnool."}
          </p>
        </div>

        {/* Live Spotlight Card */}
        <div className="mt-8">
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
                    src={activeLiveItem.thumbnailUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80"}
                    alt={activeLiveItem.title}
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
                    {activeLiveItem.platform || "YouTube"} Live
                  </div>

                  {/* Center Big Play Button */}
                  <a
                    href={activeLiveItem.streamUrl}
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
                      {formatTime12(activeLiveItem.startTime)} – {formatTime12(activeLiveItem.endTime)} IST
                    </span>
                    {activeLiveItem.speakerOrPerformer && (
                      <span className="truncate max-w-[180px] text-white/75 text-[11px]">
                        🎙️ {activeLiveItem.speakerOrPerformer}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Live Content Details & Join Now Button */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-extrabold uppercase tracking-wider">
                      <Radio className="h-3.5 w-3.5 animate-pulse" /> Official Live Stream
                    </span>
                    <span className="text-xs text-amber-300 font-sans font-semibold">
                      {formatTime12(activeLiveItem.startTime)} to {formatTime12(activeLiveItem.endTime)} IST
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                    {activeLiveItem.title}
                  </h3>

                  {activeLiveItem.description && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                      {activeLiveItem.description}
                    </p>
                  )}
                </div>

                {/* Primary Watch Live / Join Now Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <a
                    href={activeLiveItem.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold text-base shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer text-center"
                  >
                    <Play className="h-5 w-5 fill-white" />
                    <span>Join Now</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: activeLiveItem.title,
                          text: `🔴 Watch Live: ${activeLiveItem.title} from ISKCON Kurnool!\n`,
                          url: activeLiveItem.streamUrl,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(activeLiveItem.streamUrl);
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
        </div>

      </div>
    </section>
  );
}
