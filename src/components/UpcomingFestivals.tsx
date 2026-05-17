import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin, Festival } from "@/context/AdminContext";
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

function fmt(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function FestivalCard({ f }: { f: Festival }) {
  const isExternal = f.donateUrl?.startsWith("http");
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-elegant transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {f.thumbnail ? (
          <img src={f.thumbnail} alt={f.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground"><Sparkles className="h-10 w-10" /></div>
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow">
          <Calendar className="h-3.5 w-3.5" /> {fmt(f.date)}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-primary leading-snug line-clamp-2 mb-4">{f.title}</h3>
        {isExternal ? (
          <a href={f.donateUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-lg transition-all">
            Donate Now
          </a>
        ) : (
          <Link to={f.donateUrl || "/donate"} className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-lg transition-all">
            Donate Now
          </Link>
        )}
      </div>
    </article>
  );
}

export default function UpcomingFestivals() {
  const { festivals } = useAdmin();
  const list = festivals.filter((f) => f.active);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);

  const needsCarousel = list.length > 4;
  const perPage = 4;
  const pageCount = needsCarousel ? Math.ceil(list.length / perPage) : 1;

  // Auto-advance
  useEffect(() => {
    if (!needsCarousel) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pageCount), 5000);
    return () => clearInterval(id);
  }, [needsCarousel, pageCount]);

  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.scrollTo({ left: trackRef.current.clientWidth * page, behavior: "smooth" });
  }, [page]);

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

        {!needsCarousel ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {list.map((f) => <FestivalCard key={f.id} f={f} />)}
          </div>
        ) : (
          <div className="relative">
            <div
              ref={trackRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-0 -mx-2"
              style={{ scrollbarWidth: "none" }}
            >
              {Array.from({ length: pageCount }).map((_, i) => (
                <div key={i} className="shrink-0 w-full snap-start px-2">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {list.slice(i * perPage, i * perPage + perPage).map((f) => <FestivalCard key={f.id} f={f} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)} className="h-10 w-10 rounded-full border border-border bg-white grid place-items-center text-primary hover:bg-surface transition" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} aria-label={`Page ${i + 1}`} className={`h-2 rounded-full transition-all ${i === page ? "w-8 bg-primary" : "w-2 bg-border"}`} />
                ))}
              </div>
              <button onClick={() => setPage((p) => (p + 1) % pageCount)} className="h-10 w-10 rounded-full border border-border bg-white grid place-items-center text-primary hover:bg-surface transition" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
