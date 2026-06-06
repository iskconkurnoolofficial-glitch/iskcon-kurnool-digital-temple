import { Radio, ExternalLink } from "lucide-react";
import { useLiveClass } from "@/hooks/useLiveClass";
import { safeUrl } from "@/lib/utils";

export default function LiveClassBanner() {
  const live = useLiveClass();
  if (!live) return null;

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
            {live.title}
          </span>
          {live.language && (
            <span className="hidden sm:inline text-xs opacity-80">· {live.language}</span>
          )}
        </div>
        {live.joinUrl && (
          <a
            href={safeUrl(live.joinUrl, "#")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white text-accent font-bold text-xs md:text-sm px-4 py-1.5 rounded-full hover:scale-105 transition shadow"
          >
            Join <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
