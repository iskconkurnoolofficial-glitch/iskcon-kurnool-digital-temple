import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/prahlada-badi")({
  head: () => ({ meta: [
    { title: "Prahlada Badi — ISKCON Kurnool" },
    { name: "description", content: "Prahlada Badi children's program at ISKCON Kurnool — spiritual education for young devotees." },
  ]}),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="For Children" title="Prahlada Badi" subtitle="Spiritual education and values for young devotees." />
      <section className="py-20 text-center">
        <p className="text-muted-foreground max-w-xl mx-auto px-6">Prahlada Badi nurtures children with stories, values and devotion. More details coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
