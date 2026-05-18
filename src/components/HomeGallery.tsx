import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { ChevronRight, ImageIcon } from "lucide-react";

export default function HomeGallery() {
  const { photos } = useAdmin();
  const list = photos.slice(0, 6);
  const trackRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
            <span className="h-px w-8 bg-secondary" /> Memories <span className="h-px w-8 bg-secondary" />
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary mt-4">
            Temple Gallery
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Glimpses of devotion, festivals, and divine moments.
          </p>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
            No photos yet.
          </div>
        ) : (
          <>
            {/* Desktop / tablet grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {list.map((p) => (
                <figure key={p.id} className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-sm">
                  <img
                    src={p.url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                  <figcaption className="absolute bottom-0 inset-x-0 p-4 text-white font-display font-semibold text-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                    {p.title}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div
              ref={trackRef}
              className="sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {list.map((p) => (
                <figure
                  key={p.id}
                  className="relative shrink-0 w-[78%] snap-center overflow-hidden rounded-2xl aspect-[4/5] shadow-md"
                >
                  <img src={p.url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
                  <figcaption className="absolute bottom-0 inset-x-0 p-4 text-white font-display font-semibold text-base">
                    {p.title}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-accent text-white font-semibold text-sm shadow-lg hover:scale-105 hover:shadow-[0_15px_30px_-10px_rgba(232,103,12,0.6)] transition-all"
              >
                View More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
