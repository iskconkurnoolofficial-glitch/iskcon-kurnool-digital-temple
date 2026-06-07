import { useMemo } from "react";
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
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {f.thumbnail ? (
          <img src={f.thumbnail} alt={f.title} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground"><Sparkles className="h-10 w-10" /></div>
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

  if (list.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
            <span className="h-px w-8 bg-secondary" /> Sacred Calendar <span className="h-px w-8 bg-secondary" />
          </span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary mt-4">Upcoming Festivals</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Join us in celebrating the divine pastimes of the Lord through these sacred occasions.</p>
        </div>

        {/* Horizontally scrollable cards */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
          {list.map((f) => (
            <div key={f.id} className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[320px] lg:w-[calc(25%-0.9375rem)]">
              <FestivalCard f={f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
