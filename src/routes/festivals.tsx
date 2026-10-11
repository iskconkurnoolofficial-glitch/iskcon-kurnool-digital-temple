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
        pageKey="upcomingFestivals"
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
                  className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-stretch bg-gradient-to-br from-white via-[#fffdf9] to-[#fff8eb] hover:to-[#fff4dc] border-2 border-amber-200/90 hover:border-amber-400 rounded-3xl overflow-hidden p-5 sm:p-6 shadow-[0_8px_30px_rgba(217,119,6,0.08)] hover:shadow-[0_20px_45px_rgba(217,119,6,0.18)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {/* Date Badge on Corner */}
                  <div className="absolute top-0 right-0 bg-accent text-white px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm z-20">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{fmt(f.date)}</span>
                  </div>

                  {/* Left Column: Image */}
                  <div className="w-full md:w-[340px] lg:w-[400px] min-h-[240px] sm:min-h-[280px] md:min-h-[300px] shrink-0 relative flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden">
                    <img
                      src={f.thumbnail || "https://images.unsplash.com/photo-1609137982420-b1885df33a7e?auto=format&fit=crop&w=800&q=80"}
                      alt={f.title}
                      loading="lazy"
                      className="max-w-full max-h-full rounded-2xl object-cover w-full h-full min-h-[240px] sm:min-h-[280px] md:min-h-[300px]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1609137982420-b1885df33a7e?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>

                  {/* Right Column: Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      {/* Modern Bold Distinctive Title */}
                      <div className="relative mb-2 sm:mb-3">
                        <h3 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 group-hover:text-amber-700 tracking-tight leading-tight transition-colors">
                          {f.title}
                        </h3>
                      </div>

                      {/* Location display if configured */}
                      {f.location && (
                        <div className="text-xs sm:text-sm text-muted-foreground font-semibold flex items-center gap-1.5 mb-3 sm:mb-4">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{f.location}</span>
                        </div>
                      )}

                      {/* Description - Modern Sleek Micro-Surface */}
                      {f.shortDescription ? (
                        <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 group-hover:bg-amber-50/50 border border-slate-200/70 group-hover:border-amber-200/80 transition-all flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-sans font-normal">
                            {f.shortDescription}
                          </p>
                        </div>
                      ) : (
                        f.description && (
                          <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 group-hover:bg-amber-50/50 border border-slate-200/70 group-hover:border-amber-200/80 transition-all flex items-start gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                            <div
                              className="text-slate-700 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 font-sans font-normal"
                              dangerouslySetInnerHTML={{
                                __html: f.description.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>

                    {/* Action Buttons with Interactive Styling */}
                    <div className="mt-auto pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                      <Link
                        to="/festival/$slug"
                        params={{ slug: f.slug }}
                        className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 border-amber-300/80 bg-white hover:bg-amber-50/60 hover:border-amber-400 text-slate-800 font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                      >
                        <Info className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-600" />
                        <span>View Details</span>
                      </Link>

                      <Link
                        to="/festival/$slug"
                        params={{ slug: f.slug }}
                        hash="sevas-section"
                        className="relative overflow-hidden group/btn inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:via-amber-500 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-[0_4px_16px_rgba(234,88,12,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.45)] hover:shadow-[0_6px_22px_rgba(234,88,12,0.5)] ring-1 ring-amber-300/40 hover:scale-103 active:scale-95 transition-all duration-300 cursor-pointer"
                      >
                        <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
                        <Heart className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
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
