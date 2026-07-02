import { createFileRoute } from "@tanstack/react-router";
import { Leaf, XCircle, CheckCircle2, Sun, BookOpen, AlertTriangle, Sunrise } from "lucide-react";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import vishnuAsset from "@/assets/vishnu-ekadashi.png.asset.json";
import { useAdmin } from "@/context/AdminContext";

export const Route = createFileRoute("/ekadashi")({
  head: () => ({
    meta: [
      { title: "Ekadashi Vratam — Rules & Guidelines | ISKCON Kurnool" },
      {
        name: "description",
        content:
          "Ekadashi — the mother of devotion. Learn the rules and guidelines for observance: foods to avoid and permit, morning practice, mantra, and breaking the fast on Dwadashi.",
      },
      { property: "og:title", content: "Ekadashi Vratam — Rules & Guidelines | ISKCON Kurnool" },
      {
        property: "og:description",
        content: "Rules and guidelines for observing Ekadashi with ISKCON Kurnool.",
      },
    ],
  }),
  component: EkadashiPage,
});

const cardBase = "rounded-2xl bg-card border border-border shadow-elegant p-6 md:p-8";

function EkadashiPage() {
  const { ekadashi: e } = useAdmin();
  const imageSrc = e.image || vishnuAsset.url;

  return (
    <SiteLayout>
      <PageHero
        eyebrow={e.badge}
        title={e.title}
        subtitle={e.subtitle}
        pageKey="ekadashi"
      />

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16 space-y-10 md:space-y-14">
        {/* 2. TWO-COLUMN FOOD CARD */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className={`${cardBase} border-l-4 border-l-red-700/70`}>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-7 w-7 text-red-700" />
              <h2 className="font-display font-bold text-2xl text-red-800">{e.avoidTitle}</h2>
            </div>
            <ul className="space-y-2.5 text-foreground/85 leading-relaxed">
              {e.avoidItems.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-700/70 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${cardBase} border-l-4 border-l-green-700/70`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-700" />
              <h2 className="font-display font-bold text-2xl text-green-800">{e.permitTitle}</h2>
            </div>
            <ul className="space-y-2.5 text-foreground/85 leading-relaxed">
              {e.permitItems.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-700/70 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative rounded-3xl overflow-hidden shadow-elegant border border-secondary/30">
          <img
            src={imageSrc}
            alt="Lord Vishnu reclining on Ananta Sesha with Goddess Lakshmi"
            className="w-full h-64 md:h-96 object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/25 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 text-center">
            <p className="font-display text-primary-foreground text-xl md:text-3xl italic drop-shadow-lg">
              “{e.imageQuote}”
            </p>
          </div>
        </div>

        {/* 3. About Tulsi */}
        <div className={`${cardBase} border-l-4 border-l-green-600/70`}>
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="h-6 w-6 text-green-700" />
            <h2 className="font-display font-bold text-2xl text-primary">{e.tulsiTitle}</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">{e.tulsiBody}</p>
        </div>

        {/* 4. Purpose */}
        <div className={`${cardBase} border-l-4 border-l-accent/70`}>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-6 w-6 text-accent" />
            <h2 className="font-display font-bold text-2xl text-primary">{e.purposeTitle}</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">{e.purposeBody}</p>
        </div>

        {/* 5. Morning Practice */}
        <div className={`${cardBase} border-l-4 border-l-secondary`}>
          <div className="flex items-center gap-3 mb-4">
            <Sun className="h-6 w-6 text-secondary-foreground" />
            <h2 className="font-display font-bold text-2xl text-primary">{e.morningTitle}</h2>
          </div>
          <ol className="space-y-3 text-foreground/85 leading-relaxed">
            {e.morningSteps.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-secondary/40 text-secondary-foreground text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 6. MANTRA */}
        <div className="rounded-3xl bg-gradient-to-br from-secondary/25 via-accent/10 to-secondary/20 border border-secondary/40 shadow-gold p-10 md:p-14 text-center">
          <span className="text-secondary-foreground uppercase text-[11px] tracking-[0.3em] font-semibold">
            The Maha Mantra
          </span>
          <p className="mt-5 font-display font-bold text-2xl md:text-4xl text-primary leading-snug whitespace-pre-line">
            {e.mantra}
          </p>
        </div>

        {/* 7. WARNING */}
        <div className="rounded-2xl bg-red-50/60 border border-red-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-700" />
            <h2 className="font-display font-bold text-2xl text-red-800">{e.warningTitle}</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">{e.warningBody}</p>
        </div>

        {/* 8. Dwadashi */}
        <div className={`${cardBase} border-l-4 border-l-accent/70`}>
          <div className="flex items-center gap-3 mb-3">
            <Sunrise className="h-6 w-6 text-accent" />
            <h2 className="font-display font-bold text-2xl text-primary">{e.dwadashiTitle}</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">{e.dwadashiBody}</p>
          {e.dwadashiNote && (
            <p className="mt-3 text-sm text-muted-foreground italic">{e.dwadashiNote}</p>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
