import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/goshala")({
  head: () => ({ meta: [
    { title: "Goshala — ISKCON Kurnool" },
    { name: "description", content: "Cow protection at ISKCON Kurnool — a sacred service to Mother Cow." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Go-Seva" title="Goshala" subtitle="Loving care for Mother Cow" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            In Vedic culture the cow is honored as a mother — Gomata. ISKCON Kurnool's Goshala is dedicated to the
            lifelong protection and care of cows, providing them shelter, nourishment, medical care and devotional
            association.
          </p>
          <p>
            Through go-seva, devotees can directly serve Lord Krishna, the protector of cows. Visitors are warmly
            invited to spend time with the cows, offer grass and contribute to their care.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
