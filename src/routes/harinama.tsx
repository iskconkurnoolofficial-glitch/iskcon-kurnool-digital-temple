import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/harinama")({
  head: () => ({ meta: [
    { title: "Hari Nama Sankeerthana — ISKCON Kurnool" },
    { name: "description", content: "Hari Nama Sankeerthana — congregational chanting of the holy names with ISKCON Kurnool." },
  ]}),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Chanting" title="Hari Nama Sankeerthana" subtitle="Congregational chanting of the holy names of the Lord." />
      <section className="py-20 text-center">
        <p className="text-muted-foreground max-w-xl mx-auto px-6">Experience the bliss of public chanting. Schedule and locations coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
