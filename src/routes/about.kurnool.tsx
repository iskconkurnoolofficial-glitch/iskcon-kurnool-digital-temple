import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/kurnool")({
  head: () => ({ meta: [
    { title: "ISKCON Kurnool — Sri Sri Puri Jagannath Temple" },
    { name: "description", content: "ISKCON Kurnool is home to Sri Sri Puri Jagannath, Baladeva and Subhadra deities." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Temple" title="ISKCON Kurnool" subtitle="The Abode of Sri Sri Puri Jagannath, Baladeva & Subhadra" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            ISKCON Kurnool is a sacred sanctuary in the heart of Andhra Pradesh, dedicated to the worship of Sri
            Sri Puri Jagannath, Baladeva, and Subhadra. The temple stands as a beacon of Krishna Consciousness in
            the Rayalaseema region, welcoming devotees and seekers from all walks of life.
          </p>
          <p>
            Through daily darshan, kirtan, Bhagavad-gita classes, festivals and prasadam distribution, the temple
            serves as a vibrant spiritual home where the timeless wisdom of Vedic culture comes alive.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
