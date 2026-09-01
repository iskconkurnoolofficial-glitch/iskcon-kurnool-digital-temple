import { useState, useEffect } from "react";
import { Radio, ExternalLink } from "lucide-react";
import { useLiveClass } from "@/hooks/useLiveClass";
import { useAdmin } from "@/context/AdminContext";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import { safeUrl } from "@/lib/utils";

export default function LiveClassBanner() {
  const liveClass = useLiveClass();
  const { settings, sunday, gitaCourse, liveProgrammes } = useAdmin();
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  // 1. Check if Live Programme is active from Live Programmes system
  const activeLiveProgramme = (() => {
    if (!liveProgrammes || !liveProgrammes.enabled) return null;
    const nowMs = Date.now();
    const list = (liveProgrammes.programmes || []).filter((p) => p.published !== false);
    for (const item of list) {
      if (item.isManualLiveOverride) return item;
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
    return null;
  })();

  if (activeLiveProgramme) {
    return (
      <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white shadow-md border-b border-red-400/40 relative z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-extrabold tracking-[0.2em] uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1 shadow-sm">
              <Radio className="inline h-3.5 w-3.5 animate-pulse" /> LIVE NOW
            </span>
            <span className="font-bold text-sm md:text-base truncate">
              {activeLiveProgramme.title}
            </span>
            <span className="hidden sm:inline text-xs text-white/80 bg-black/25 px-2.5 py-0.5 rounded-full font-medium">
              {activeLiveProgramme.platform} Live
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={safeUrl(activeLiveProgramme.streamUrl, "#")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-red-600 font-extrabold text-xs md:text-sm px-4 py-1.5 rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-md cursor-pointer border border-white/40"
            >
              Watch LIVE Stream <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check if daily class is live
  if (liveClass) {
    return (
      <div className="w-full bg-gradient-to-r from-accent via-accent to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-white/15 px-2 py-0.5 rounded">
              <Radio className="inline h-3 w-3 mr-1 -mt-0.5" /> Live Now
            </span>
            <span className="font-semibold text-sm md:text-base truncate">
              {liveClass.title}
            </span>
            {liveClass.language && (
              <span className="hidden sm:inline text-xs opacity-80">· {liveClass.language}</span>
            )}
          </div>
          {liveClass.joinUrl && (
            <a
              href={safeUrl(liveClass.joinUrl, "#")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-accent font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow cursor-pointer"
            >
              Join Class <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 3. Check if Gita Course is live
  const isGitaCourseLive = (() => {
    try {
      if (!gitaCourse.startLabel || !gitaCourse.endLabel) return false;
      const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const nowIst = new Date(nowStr);
      const start = new Date(gitaCourse.startLabel);
      const end = new Date(gitaCourse.endLabel);
      end.setHours(23, 59, 59, 999);
      if (nowIst >= start && nowIst <= end) {
        return isTimeStrLive(gitaCourse.time || "7:30 PM");
      }
    } catch {}
    return false;
  })();

  if (isGitaCourseLive) {
    return (
      <div className="w-full bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-white/15 px-2 py-0.5 rounded">
              <Radio className="inline h-3 w-3 mr-1 -mt-0.5" /> Live Now
            </span>
            <span className="font-semibold text-sm md:text-base truncate">
              Bhagavad Gita Course Online Class is running
            </span>
          </div>
          <a
            href="/gita-course"
            className="inline-flex items-center gap-1.5 bg-white text-orange-600 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow cursor-pointer"
          >
            Join Course <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 4. Check if Sunday Program is live
  const isSundayFeastLive = sunday.schedule?.some(item => isTimeStrLive(item.time, 0)) || false;
  if (isSundayFeastLive) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-white/15 px-2 py-0.5 rounded">
              <Radio className="inline h-3 w-3 mr-1 -mt-0.5" /> Live Now
            </span>
            <span className="font-semibold text-sm md:text-base truncate">
              Sunday Feast Program is currently in progress
            </span>
          </div>
          <a
            href="/temple/sunday"
            className="inline-flex items-center gap-1.5 bg-white text-amber-600 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow cursor-pointer"
          >
            View Schedule <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 5. Check if Youth Program is live
  const isYouthLive = isTimeStrLive("6:30 PM – 8:30 PM", 6);
  if (isYouthLive) {
    return (
      <div className="w-full bg-gradient-to-r from-primary via-indigo-600 to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-white/15 px-2 py-0.5 rounded">
              <Radio className="inline h-3 w-3 mr-1 -mt-0.5" /> Live Now
            </span>
            <span className="font-semibold text-sm md:text-base truncate">
              Saturday Youth Program is currently in progress
            </span>
          </div>
          <a
            href="/youth"
            className="inline-flex items-center gap-1.5 bg-white text-primary font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow cursor-pointer"
          >
            Join Program <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
