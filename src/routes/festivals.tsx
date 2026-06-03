import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, normalizeFestival, isFestivalLive, Festival } from "@/context/AdminContext";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/festivals")({
  head: () => ({ meta: [
    { title: "Upcoming Festivals — ISKCON Kurnool" },
    { name: "description", content: "Join us in celebrating upcoming festivals and sacred occasions at ISKCON Kurnool." },
  ]}),
  component: Page,
});

function fmt(d: string) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function FestivalCard({ f }: { f: Festival }) {
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
        <h3 className="font-display font-bold text-lg text-primary leading-snug line-clamp-2 mb-1.5">{f.title}</h3>
        {f.shortDescription && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{f.shortDescription}</p>}
        <Link to="/festival/$slug" params={{ slug: f.slug }} className="mt-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-lg transition-all">
          Donate Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Page() {
  const { festivals } = useAdmin();
  const list = useMemo(
    () => festivals.map(normalizeFestival).filter((f) => isFestivalLive(f)).sort((a, b) => a.order - b.order),
    [festivals],
  );

  return (
    <SiteLayout>
      <PageHero eyebrow="Sacred Calendar" title="Upcoming Festivals" subtitle="Join us in celebrating the divine pastimes of the Lord through these sacred occasions." />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {list.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3" />
              No upcoming festivals at the moment. Please check back soon.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((f) => (
                <FestivalCard key={f.id} f={f} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
