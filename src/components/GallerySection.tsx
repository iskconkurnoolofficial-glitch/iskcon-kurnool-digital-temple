import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function GallerySection() {
  const { photos, categories } = useAdmin();
  const [filter, setFilter] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "All" ? photos : photos.filter((p) => p.category === filter);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % filtered.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filtered.length]);

  return (
    <section id="gallery" className="py-20 md:py-28 bg-gradient-to-b from-amber-100 via-amber-200/50 to-amber-100/45 border-t border-amber-200/40 relative overflow-hidden">
      {/* Soft glowing decorations */}
      <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 animate-fade-up">
          <span className="text-secondary font-medium uppercase text-xs tracking-[0.3em]">Memories</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3">Temple Gallery</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Glimpses of devotion, festivals, and divine moments at ISKCON Kurnool.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12 bg-white/30 backdrop-blur-md border border-amber-200/20 p-2 rounded-2xl max-w-3xl mx-auto">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                filter === c
                  ? "bg-primary text-white shadow-glow scale-[1.03] ring-2 ring-primary/10"
                  : "text-slate-700 hover:text-primary hover:bg-white/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            No photos yet. Add some from the Admin Panel.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [&>*]:mb-4">
            {filtered.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setLightbox(idx)}
                className="group block w-full overflow-hidden rounded-2xl shadow-elegant relative break-inside-avoid"
              >
                <img src={p.url} alt={p.title} loading="lazy" className="w-full h-auto group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                  <span className="text-primary-foreground font-medium text-left">{p.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white p-2" aria-label="Close"><X className="h-7 w-7" /></button>
          <button onClick={() => setLightbox((i) => (i! - 1 + filtered.length) % filtered.length)} className="absolute left-4 text-white p-3" aria-label="Previous"><ChevronLeft className="h-8 w-8" /></button>
          <button onClick={() => setLightbox((i) => (i! + 1) % filtered.length)} className="absolute right-4 text-white p-3" aria-label="Next"><ChevronRight className="h-8 w-8" /></button>
          <figure className="max-w-6xl max-h-[85vh] flex flex-col items-center gap-3">
            <img src={filtered[lightbox].url} alt={filtered[lightbox].title} className="max-h-[80vh] w-auto rounded-lg" />
            <figcaption className="text-white/90 text-sm">{filtered[lightbox].title}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
