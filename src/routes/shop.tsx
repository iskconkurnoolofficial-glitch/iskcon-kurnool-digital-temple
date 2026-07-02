import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [
    { title: "Shop — ISKCON Kurnool" },
    { name: "description", content: "Devotional books, deities, and spiritual items from ISKCON Kurnool." },
  ]}),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Store" title="Shop" subtitle="Devotional books, deities and spiritual items — coming soon." pageKey="shop" />
      <section className="py-20 text-center">
        <p className="text-muted-foreground max-w-xl mx-auto px-6">Our online store is being prepared. Please visit the temple gift shop in the meantime.</p>
      </section>
    </SiteLayout>
  ),
});
