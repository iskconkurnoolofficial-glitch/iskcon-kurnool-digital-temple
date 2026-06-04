import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/ekadashi")({
  head: () => ({ meta: [
    { title: "Ekadashi — ISKCON Kurnool" },
    { name: "description", content: "Observe Ekadashi with ISKCON Kurnool — fasting, kirtan and devotional service." },
  ]}),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Sacred Observance" title="Ekadashi" subtitle="Fasting, kirtan and remembrance of Lord Krishna." />
      <section className="py-20 text-center">
        <p className="text-muted-foreground max-w-xl mx-auto px-6">Join us in observing Ekadashi twice a month. Ekadashi calendar and details coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
