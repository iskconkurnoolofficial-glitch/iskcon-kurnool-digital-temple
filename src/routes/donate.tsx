import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Heart, Building2, Utensils, BookOpen } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [
    { title: "Donate — ISKCON Kurnool" },
    { name: "description", content: "Support ISKCON Kurnool — temple seva, deity worship, prasadam and book distribution." },
  ]}),
  component: Page,
});

const causes = [
  { icon: Building2, title: "Temple Construction", desc: "Help build and maintain the sacred abode of Sri Sri Puri Jagannath." },
  { icon: Heart, title: "Deity Seva", desc: "Sponsor daily worship, decoration and offerings to the Lord." },
  { icon: Utensils, title: "Annadana", desc: "Sponsor sanctified prasadam meals for devotees and guests." },
  { icon: BookOpen, title: "Book Distribution", desc: "Help distribute Srila Prabhupada's books across the region." },
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Sacred Service" title="Donate" subtitle="Be part of the divine mission of Sri Sri Puri Jagannath Temple" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6 mb-12">
          {causes.map((c) => (
            <div key={c.title} className="flex gap-5 p-7 rounded-2xl bg-surface border border-border hover:shadow-elegant transition">
              <div className="h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center shrink-0 shadow-glow">
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-primary mb-1">{c.title}</h3>
                <p className="text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto px-6 text-center">
          <a
            href="#"
            className="inline-flex items-center px-10 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:scale-105 hover:shadow-gold transition-all"
          >
            Donate Now
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            For bank transfer details please contact the temple office.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
