import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Sparkles, BookOpen, Music, Palette } from "lucide-react";

export const Route = createFileRoute("/prahlada")({
  head: () => ({ meta: [
    { title: "Prahlada Badi — ISKCON Kurnool" },
    { name: "description", content: "Prahlada Badi — children's spiritual education program at ISKCON Kurnool with stories, kirtan and values." },
  ]}),
  component: Page,
});

const items = [
  { icon: BookOpen, title: "Spiritual Stories", desc: "Pastimes of Lord Krishna and great devotees told in a fun, engaging way for children." },
  { icon: Music, title: "Kirtan & Bhajans", desc: "Children learn to sing the holy names and play instruments with joy." },
  { icon: Palette, title: "Arts & Activities", desc: "Drawing, crafts and games rooted in values and devotion." },
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Children's Program" title="Prahlada Badi" subtitle="Nurturing young hearts with Krishna consciousness" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Inspired by the child devotee Prahlada Maharaja, Prahlada Badi is a weekly program where children
            grow in devotion, character and culture through stories, kirtan, games and creative activities.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((c) => (
              <div key={c.title} className="p-8 rounded-2xl bg-surface border border-border hover:shadow-elegant hover:-translate-y-1 transition">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center mb-5 shadow-glow">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary mb-2">{c.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Sparkles className="h-4 w-4 text-secondary" /> Open to all children — join us at the temple!
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
