import { useState, useEffect } from "react";
import { Radio, ExternalLink } from "lucide-react";
import { useLiveClass } from "@/hooks/useLiveClass";
import { useAdmin } from "@/context/AdminContext";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import { safeUrl } from "@/lib/utils";

export default function LiveClassBanner() {
  const liveClass = useLiveClass();
  const { settings, sunday, gitaCourse } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. Check if daily class is live
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

  // 2. Check if general livestream is active (via liveStreamLink in Settings)
  if (settings.liveStreamLink) {
    return (
      <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase bg-white/15 px-2 py-0.5 rounded">
              <Radio className="inline h-3 w-3 mr-1 -mt-0.5" /> Live Stream
            </span>
            <span className="font-semibold text-sm md:text-base truncate">
              {settings.liveStreamTitle || "Join the Live Temple Stream now"}
            </span>
          </div>
          <a
            href={safeUrl(settings.liveStreamLink, "#")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white text-red-600 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow cursor-pointer"
          >
            Watch LIVE <ExternalLink className="h-3.5 w-3.5" />
          </a>
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
