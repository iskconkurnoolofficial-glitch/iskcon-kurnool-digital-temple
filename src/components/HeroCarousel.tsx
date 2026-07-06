import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function HeroCarousel() {
  const { slides, ready } = useAdmin();
  const active = slides.filter((s) => s.active);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setI(0); }, [active.length]);

  useEffect(() => {
    if (paused || active.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % active.length), 5000);
    return () => clearInterval(t);
  }, [paused, active.length]);

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
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">Hare Krishna</h1>
            <p className="opacity-90">Add slides from Admin Panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
                <img src={s.mobile || s.desktop} alt={s.title || `Slide ${idx + 1}`} className="w-full h-full object-cover" />
              </picture>
            )}

            {(s.title || s.subtitle) && (
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-16 z-10">
                <div className="max-w-4xl mx-auto text-center md:text-left space-y-2">
                  {s.title && (
                    <h2 className={`font-display text-3xl md:text-6xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-all duration-700 transform ${
                      idx === i ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                    }`}>
                      {s.title}
                    </h2>
                  )}
                  {s.subtitle && (
                    <p className={`text-base md:text-xl text-white/90 max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-700 delay-150 transform ${
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
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm grid place-items-center shadow-md border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % active.length)}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm grid place-items-center shadow-md border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2.5 z-20">
              {active.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer ${
                    idx === i 
                      ? "w-8 bg-secondary shadow-sm shadow-secondary/20 border-none" 
                      : "w-2.5 bg-white/40 hover:bg-white/75 border border-black/5"
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
