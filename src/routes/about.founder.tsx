import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/founder")({
  head: () => ({ meta: [
    { title: "Founder Acharya — Srila Prabhupada — ISKCON Kurnool" },
    { name: "description", content: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, Founder Acharya of ISKCON." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Founder Acharya" title="Srila Prabhupada" subtitle="His Divine Grace A.C. Bhaktivedanta Swami Prabhupada" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            His Divine Grace A.C. Bhaktivedanta Swami Prabhupada (1896–1977) is the Founder-Acharya of the
            International Society for Krishna Consciousness. At the age of 69, fulfilling the order of his
            spiritual master, he travelled alone to America to introduce Krishna consciousness to the Western world.
          </p>
          <p>
            In just twelve years (1966–1977), Srila Prabhupada established a worldwide spiritual movement, opened
            108 temples, initiated thousands of disciples, and translated and published over eighty volumes of
            sacred Vedic literature including the Bhagavad-gita As It Is and Srimad-Bhagavatam.
          </p>
          <blockquote className="border-l-4 border-secondary pl-6 italic text-foreground/80 font-display text-xl">
            "Chant Hare Krishna and be happy."
            <footer className="text-sm not-italic mt-2 text-muted-foreground">— Srila Prabhupada</footer>
          </blockquote>
        </div>
      </section>
    </SiteLayout>
  );
}
