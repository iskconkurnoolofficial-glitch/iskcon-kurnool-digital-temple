import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, normalizeFestival, isFestivalLive } from "@/context/AdminContext";
import { Calendar, Sparkles, Heart } from "lucide-react";
import { useMemo } from "react";

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
  
  const list = useMemo(() => {
    return festivals
      .map(normalizeFestival)
      .filter((f) => isFestivalLive(f))
      .sort((a, b) => a.order - b.order);
  }, [festivals]);

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Sacred Celebrations" 
        title="Upcoming Festivals" 
        subtitle="Join us in celebrating the divine pastimes of the Lord and seek spiritual blessings through seva offerings." 
        pageKey="festivals"
      />

      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {list.length === 0 ? (
            <div className="text-center py-20 bg-card/50 backdrop-blur-sm border border-border/80 rounded-3xl shadow-elegant max-w-2xl mx-auto">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-display text-2xl font-bold text-primary mb-2">No Upcoming Festivals</h3>
              <p className="text-muted-foreground text-base">
                There are no upcoming festivals scheduled in the calendar at the moment. Please visit our website regularly or check our social media pages for updates.
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
                  <div className="w-full md:w-[320px] lg:w-[380px] aspect-[16/10] md:aspect-auto shrink-0 relative flex items-center justify-center">
                    {f.thumbnail ? (
                      <img
                        src={f.thumbnail}
                        alt={f.title}
                        loading="lazy"
                        className="max-w-full max-h-full rounded-2xl object-contain"
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
                      <h3 className="font-display text-2xl md:text-3xl font-extrabold text-primary mb-3 leading-tight tracking-tight group-hover:text-accent transition-colors duration-200">
                        {f.title}
                      </h3>

                      {/* Description */}
                      {f.shortDescription ? (
                        <p className="text-muted-foreground text-base leading-relaxed mb-6 font-sans">
                          {f.shortDescription}
                        </p>
                      ) : (
                        f.description && (
                          <div
                            className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 font-sans"
                            dangerouslySetInnerHTML={{
                              __html: f.description.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                            }}
                          />
                        )
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                      <Link
                        to="/festival/$slug"
                        params={{ slug: f.slug }}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-accent text-white font-bold text-sm shadow-sm hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
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
