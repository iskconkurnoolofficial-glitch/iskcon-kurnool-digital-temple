import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function HeroCarousel() {
  const { slides, settings, ready, liveProgrammes } = useAdmin();
  const active = slides.filter((s) => s.active);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Dynamically check if a Live Programme is actively streaming
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

  const activeLiveUrl = activeLiveProgramme ? activeLiveProgramme.streamUrl : null;

  useEffect(() => { setI(0); }, [active.length]);

  useEffect(() => {
    if (paused || active.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % active.length), 5000);
    return () => clearInterval(t);
  }, [paused, active.length]);

  // Touch Swipe Handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // px

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide
      setI((p) => (p + 1) % active.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Slide
      setI((p) => (p - 1 + active.length) % active.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // While loading from the backend, show a neutral surface — no placeholder image flash on reload
  if (!ready) {
    return (
      <section id="home">
        <div className="aspect-[1080/1350] md:aspect-[4917/1750] bg-surface" />
      </section>
    );
  }

  if (active.length === 0) {
    return (
      <section id="home">
        <div className="aspect-[1080/1350] md:aspect-[4917/1750] bg-gradient-hero grid place-items-center">
          <div className="text-center text-primary-foreground p-8">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-4">Hare Krishna</h1>
            <p className="opacity-90 text-sm sm:text-base">Add slides from Admin Panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-surface touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Live Mode Top Glowing Accent Bar */}
      {activeLiveUrl && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 z-30 shadow-lg shadow-red-500/50" />
      )}

      {/* Prominent Live Mode Banner Overlay */}
      {activeLiveUrl && (
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 md:right-12 z-30 animate-fade-in max-w-[85vw] sm:max-w-md">
          {activeLiveProgramme ? (
            <div className="bg-black/85 hover:bg-black/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border border-red-500/80 shadow-[0_10px_30px_rgba(220,38,38,0.45)] transition-all">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="relative flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  LIVE NOW
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                  {activeLiveProgramme.platform}
                </span>
              </div>

              <h4 className="text-white font-display font-bold text-xs sm:text-sm line-clamp-1 mb-1.5">
                {activeLiveProgramme.title}
              </h4>

              <a
                href={activeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold text-[11px] sm:text-xs shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Watch LIVE Now</span>
                <span className="text-xs">▶</span>
              </a>
            </div>
          ) : (
            <a
              href={activeLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/40 text-xs sm:text-sm tracking-wide transition hover:scale-105 active:scale-95 border border-white/20"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              Watch LIVE
            </a>
          )}
        </div>
      )}

      <div className="relative aspect-[1080/1350] md:aspect-[4917/1750]">
        {active.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {s.video ? (
              <video
                src={s.video}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={s.mobile || s.desktop}
              />
            ) : (
              <picture>
                <source media="(min-width: 768px)" srcSet={s.desktop} />
                <img 
                  src={s.mobile || s.desktop} 
                  alt={s.title || `Slide ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  // @ts-ignore
                  fetchPriority={idx === 0 ? "high" : "low"}
                />
              </picture>
            )}

            {(s.title || s.subtitle) && (
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-16 z-10">
                <div className="max-w-4xl mx-auto text-center md:text-left space-y-1.5 sm:space-y-2">
                  {s.title && (
                    <h2 className={`font-display text-2xl sm:text-4xl md:text-6xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-all duration-700 transform ${
                      idx === i ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                    }`}>
                      {s.title}
                    </h2>
                  )}
                  {s.subtitle && (
                    <p className={`text-xs sm:text-base md:text-xl text-white/95 max-w-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-700 delay-150 transform ${
                      idx === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}>
                      {s.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {active.length > 1 && (
          <>
            <button
              onClick={() => setI((p) => (p - 1 + active.length) % active.length)}
              className="hidden sm:grid absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-9 w-9 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm place-items-center shadow-md border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % active.length)}
              className="hidden sm:grid absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-9 w-9 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm place-items-center shadow-md border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center gap-2 sm:gap-2.5 z-20">
              {active.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer ${
                    idx === i 
                      ? "w-6 sm:w-8 bg-secondary shadow-sm shadow-secondary/20 border-none" 
                      : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/75 border border-black/5"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
