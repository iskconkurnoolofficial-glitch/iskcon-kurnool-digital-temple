import { createFileRoute } from "@tanstack/react-router";
import { Leaf, XCircle, CheckCircle2, Sun, BookOpen, AlertTriangle, Sunrise } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import vishnuAsset from "@/assets/vishnu-ekadashi.png.asset.json";

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

const cardBase =
  "rounded-2xl bg-card border border-border shadow-elegant p-6 md:p-8";

function EkadashiPage() {
  return (
    <SiteLayout>
      {/* 1. HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface to-white">
        <div className="absolute inset-0 bg-gradient-soft opacity-50" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 text-secondary-foreground bg-secondary/25 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em]">
            <Leaf className="h-4 w-4 text-green-700" />
            Sacred Observance
          </span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-primary mt-6 tracking-tight leading-[1.05]">
            Ekadashi — The Mother of Devotion
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground font-display italic">
            Rules and Guidelines for Observance
          </p>
          <span className="divider-gold mt-8 inline-flex" />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16 space-y-10 md:space-y-14">
        {/* 2. TWO-COLUMN FOOD CARD */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Avoid */}
          <div className={`${cardBase} border-l-4 border-l-red-700/70`}>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-7 w-7 text-red-700" />
              <h2 className="font-display font-bold text-2xl text-red-800">Avoid on Ekadashi</h2>
            </div>
            <ul className="space-y-2.5 text-foreground/85 leading-relaxed">
              {[
                "Grains, lentils / pulses, chickpeas, corn",
                "Certain vegetables (ridge gourd, beans)",
                "Peas",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-700/70 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Permitted */}
          <div className={`${cardBase} border-l-4 border-l-green-700/70`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-700" />
              <h2 className="font-display font-bold text-2xl text-green-800">Permitted on Ekadashi</h2>
            </div>
            <ul className="space-y-2.5 text-foreground/85 leading-relaxed">
              {[
                "Fruits, milk",
                "Dry fruits (cashew, almond, pistachio, raisins)",
                "Root vegetables / tubers",
                "Sabudana (sago), Samalu (barnyard millet)",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-700/70 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* IMAGE — Vishnu with suitable gradient */}
        <div className="relative rounded-3xl overflow-hidden shadow-elegant border border-secondary/30">
          <img
            src={vishnuAsset.url}
            alt="Lord Vishnu reclining on Ananta Sesha with Goddess Lakshmi"
            className="w-full h-64 md:h-96 object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/25 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 text-center">
            <p className="font-display text-primary-foreground text-xl md:text-3xl italic drop-shadow-lg">
              “Fasting on Ekadashi is dear to Lord Vishnu.”
            </p>
          </div>
        </div>

        {/* 3. About Tulsi */}
        <div className={`${cardBase} border-l-4 border-l-green-600/70`}>
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="h-6 w-6 text-green-700" />
            <h2 className="font-display font-bold text-2xl text-primary">About Tulsi</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">
            Do not pluck Tulsi leaves on Ekadashi or on Dwadashi (the day after). If Tulsi is
            needed for worship, it should be picked the day before.
          </p>
        </div>

        {/* 4. Purpose of Ekadashi */}
        <div className={`${cardBase} border-l-4 border-l-accent/70`}>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-6 w-6 text-accent" />
            <h2 className="font-display font-bold text-2xl text-primary">Purpose of Ekadashi</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">
            Ekadashi is a day to minimize our bodily needs and instead increase our hearing,
            chanting, and remembrance of the Holy Name of the Lord. By simplifying eating and
            daily activity, the mind becomes free to absorb itself in devotional service and the
            glories of Krishna.
          </p>
        </div>

        {/* 5. Morning Practice */}
        <div className={`${cardBase} border-l-4 border-l-secondary`}>
          <div className="flex items-center gap-3 mb-4">
            <Sun className="h-6 w-6 text-secondary-foreground" />
            <h2 className="font-display font-bold text-2xl text-primary">Morning Practice</h2>
          </div>
          <ol className="space-y-3 text-foreground/85 leading-relaxed">
            {[
              "Worship the deity of Krishna with devotion.",
              "Offer incense, a lamp, Tulsi (picked the day before), fruits, and flowers.",
              "Pray sincerely for the mercy of Lord Vishnu.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-secondary/40 text-secondary-foreground text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 6. HIGHLIGHTED MANTRA BLOCK */}
        <div className="rounded-3xl bg-gradient-to-br from-secondary/25 via-accent/10 to-secondary/20 border border-secondary/40 shadow-gold p-10 md:p-14 text-center">
          <span className="text-secondary-foreground uppercase text-[11px] tracking-[0.3em] font-semibold">
            The Maha Mantra
          </span>
          <p className="mt-5 font-display font-bold text-2xl md:text-4xl text-primary leading-snug">
            Hare Krishna Hare Krishna, Krishna Krishna Hare Hare
            <br />
            Hare Rama Hare Rama, Rama Rama Hare Hare
          </p>
        </div>

        {/* 7. WARNING CARD */}
        <div className="rounded-2xl bg-red-50/60 border border-red-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-700" />
            <h2 className="font-display font-bold text-2xl text-red-800">Strictly Avoid</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">
            Meat, fish, eggs, mushrooms, alcohol, onion, garlic, intoxicants (cigarettes,
            tobacco), and other tamasic substances should be strictly avoided — not only on
            Ekadashi, but as a practice of pure devotional life.
          </p>
        </div>

        {/* 8. Dwadashi — Breaking the Fast */}
        <div className={`${cardBase} border-l-4 border-l-accent/70`}>
          <div className="flex items-center gap-3 mb-3">
            <Sunrise className="h-6 w-6 text-accent" />
            <h2 className="font-display font-bold text-2xl text-primary">Dwadashi — Breaking the Fast</h2>
          </div>
          <p className="text-foreground/85 leading-relaxed">
            On Dwadashi (the day after Ekadashi), wake early, bathe, and worship Lord Vishnu.
            Break the fast at the prescribed <strong>Parana</strong> time.
          </p>
          <p className="mt-3 text-sm text-muted-foreground italic">
            Note: The Parana timing changes for every Ekadashi — always check the calendar for the
            correct window.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
