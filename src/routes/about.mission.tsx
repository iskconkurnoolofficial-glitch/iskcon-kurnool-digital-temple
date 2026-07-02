import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/mission")({
  head: () => ({ meta: [
    { title: "Our Mission — ISKCON Kurnool" },
    { name: "description", content: "The seven purposes of ISKCON as set forth by Srila Prabhupada." },
  ]}),
  component: Page,
});

const purposes = [
  "To systematically propagate spiritual knowledge to society at large.",
  "To propagate a consciousness of Krishna as revealed in the Bhagavad-gita and Srimad-Bhagavatam.",
  "To bring members closer together for the purpose of teaching a simpler, more natural way of life.",
  "To teach and encourage the sankirtana movement of congregational chanting of the holy name of God.",
  "To erect for the members and society at large a holy place of transcendental pastimes dedicated to Krishna.",
  "To bring members closer together for the purpose of developing a Krishna conscious community.",
  "To publish and distribute periodicals, magazines, books and other writings.",
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Purpose" title="Our Mission" subtitle="The Seven Purposes of ISKCON" pageKey="aboutMission" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          {purposes.map((p, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-surface border border-border/60 hover:shadow-elegant transition">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold">{i + 1}</div>
              <p className="text-foreground/80 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
