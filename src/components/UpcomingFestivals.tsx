import { useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin, normalizeFestival, isFestivalLive, Festival } from "@/context/AdminContext";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";

function fmt(d: string) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function FestivalCard({ f }: { f: Festival }) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-elegant transition-all duration-300 flex flex-col h-full">
      <div className="relative w-full overflow-hidden">
        {f.thumbnail ? (
          <img src={f.thumbnail} alt={f.title} loading="lazy" className="w-full h-auto block group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="aspect-[4/3] w-full grid place-items-center text-muted-foreground bg-muted"><Sparkles className="h-10 w-10" /></div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold mb-2">
          <Calendar className="h-3.5 w-3.5" /> {fmt(f.date)}
        </div>
        <h3 className="font-display font-bold text-lg text-primary leading-snug line-clamp-2 mb-1.5">{f.title}</h3>
        {f.shortDescription && <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{f.shortDescription}</p>}
        <Link to="/festival/$slug" params={{ slug: f.slug }} className="mt-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-lg transition-all">
          Donate Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function UpcomingFestivals() {
  const { festivals } = useAdmin();
  const list = useMemo(
    () => festivals.map(normalizeFestival).filter((f) => isFestivalLive(f)).sort((a, b) => a.order - b.order),
    [festivals],
  );

  const scrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll one card after another, looping back to the start
  useEffect(() => {
    if (list.length < 2) return;
    const el = scrollerRef.current;
    if (!el) return;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    const t = setInterval(() => {
      if (paused) return;
      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-fcard]"));
      if (!cards.length) return;
      const left = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      // If we are at or close to the maximum scroll limit, loop back to the start
      if (left >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const elRect = el.getBoundingClientRect();
        // Find the first card whose start position relative to the scroll container is ahead of current scroll
        const next = cards.find((c) => {
          const cardLeft = c.getBoundingClientRect().left - elRect.left + left;
          return cardLeft > left + 8;
        });
        
        if (next) {
          const nextLeft = next.getBoundingClientRect().left - elRect.left + left;
          el.scrollTo({ left: nextLeft, behavior: "smooth" });
        } else {
          el.scrollTo({ left: 0, behavior: "smooth" });
        }
      }
    }, 3500);

    return () => {
      clearInterval(t);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [list.length]);

  if (list.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
            <span className="h-px w-8 bg-secondary" /> Sacred Calendar <span className="h-px w-8 bg-secondary" />
          </span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary mt-4">Upcoming Festivals</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Join us in celebrating the divine pastimes of the Lord through these sacred occasions.</p>
        </div>

        {/* Horizontally scrollable cards — auto-scrolls one after another */}
        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
          {list.map((f) => (
            <div key={f.id} data-fcard className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[320px] lg:w-[calc((100%-2.5rem)/3)]">
              <FestivalCard f={f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
