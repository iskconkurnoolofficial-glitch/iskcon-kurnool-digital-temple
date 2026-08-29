import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, normalizeFestival, isFestivalLive } from "@/context/AdminContext";
import { Calendar, Sparkles, Heart, Search, Info, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/festivals")({
  head: () => ({
    meta: [
      { title: "Upcoming Festivals — ISKCON Kurnool" },
      { name: "description", content: "Discover upcoming festivals and auspicious celebrations at ISKCON Kurnool. Participate in sevas and get blessings." },
      { property: "og:title", content: "Upcoming Festivals — ISKCON Kurnool" },
      { property: "og:description", content: "Discover upcoming festivals and auspicious celebrations at ISKCON Kurnool." },
    ],
  }),
  component: FestivalsPage,
});

function fmt(d: string) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function FestivalsPage() {
  const { festivals } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  
  const list = useMemo(() => {
    let r = festivals.map(normalizeFestival).filter((f) => isFestivalLive(f));
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      r = r.filter((f) => 
        f.title.toLowerCase().includes(query) || 
        f.shortDescription?.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query) ||
        f.location?.toLowerCase().includes(query)
      );
    }
    return r.sort((a, b) => a.order - b.order);
  }, [festivals, searchQuery]);

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Sacred Celebrations" 
        title="Upcoming Festivals" 
        subtitle="Join us in celebrating the divine pastimes of the Lord and seek spiritual blessings through seva offerings." 
        pageKey="festivals"
      />

      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-background relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search festivals by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 border border-border bg-white shadow-2xs rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="text-center py-20 bg-card/50 backdrop-blur-sm border border-border/80 rounded-3xl shadow-elegant max-w-2xl mx-auto">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-display text-2xl font-bold text-primary mb-2">No Festivals Found</h3>
              <p className="text-muted-foreground text-base">
                {searchQuery ? "No upcoming festivals match your search criteria. Try modifying your keywords." : "There are no upcoming festivals scheduled at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:gap-10">
              {list.map((f) => (
                <div
                  key={f.id}
                  className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-stretch bg-card hover:bg-card/90 border border-border/60 rounded-3xl overflow-hidden p-5 sm:p-6 shadow-sm hover:shadow-gold transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {/* Date Badge on Corner */}
                  <div className="absolute top-0 right-0 bg-accent text-white px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm z-20">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{fmt(f.date)}</span>
                  </div>

                  {/* Left Column: Image */}
                  <div className="w-full md:w-[320px] lg:w-[380px] aspect-[16/10] md:aspect-auto shrink-0 relative flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden">
                    {f.thumbnail ? (
                      <img
                        src={f.thumbnail}
                        alt={f.title}
                        loading="lazy"
                        className="max-w-full max-h-full rounded-2xl object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-primary/45 bg-gradient-hero">
                        <Sparkles className="h-12 w-12 text-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      {/* Title */}
                      <h3 className="font-display text-2xl md:text-3xl font-extrabold text-primary mb-2.5 leading-tight tracking-tight group-hover:text-accent transition-colors duration-200">
                        {f.title}
                      </h3>

                      {/* Location display if configured */}
                      {f.location && (
                        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mb-3">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{f.location}</span>
                        </div>
                      )}

                      {/* Description */}
                      {f.shortDescription ? (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-sans">
                          {f.shortDescription}
                        </p>
                      ) : (
                        f.description && (
                          <div
                            className="text-muted-foreground text-xs leading-relaxed mb-6 line-clamp-3 font-sans"
                            dangerouslySetInnerHTML={{
                              __html: f.description.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                            }}
                          />
                        )
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-2 flex flex-wrap gap-3">
                      <Link
                        to="/festival/$slug"
                        params={{ slug: f.slug }}
                        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:shadow-sm active:scale-98 transition-all duration-200 cursor-pointer"
                      >
                        <Info className="h-4 w-4 text-slate-400" />
                        <span>View Details</span>
                      </Link>

                      <Link
                        to="/festival/$slug"
                        params={{ slug: f.slug }}
                        hash="sevas-section"
                        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-accent text-white font-bold text-xs shadow-xs hover:shadow-md hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
                      >
                        <Heart className="h-4 w-4" />
                        <span>Donate Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
