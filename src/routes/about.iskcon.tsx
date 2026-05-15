import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/iskcon")({
  head: () => ({ meta: [
    { title: "About ISKCON — ISKCON Kurnool" },
    { name: "description", content: "Learn about the International Society for Krishna Consciousness, founded by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada in 1966." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Heritage" title="About ISKCON" subtitle="The International Society for Krishna Consciousness" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg">
          <p className="text-lg text-muted-foreground leading-relaxed">
            The International Society for Krishna Consciousness (ISKCON), also known as the Hare Krishna movement,
            was founded in 1966 in New York City by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada. ISKCON
            belongs to the Gaudiya-Vaishnava sampradaya, a monotheistic tradition within Vedic culture.
          </p>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            With more than 600 temples, 65 rural communities and 110 vegetarian restaurants worldwide, ISKCON is
            dedicated to promoting the well-being of society through the teachings of Lord Sri Krishna as found in
            the Bhagavad-gita and Srimad-Bhagavatam.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
