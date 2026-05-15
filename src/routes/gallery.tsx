import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import GallerySection from "@/components/GallerySection";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Gallery — ISKCON Kurnool" },
    { name: "description", content: "Glimpses of devotion, festivals and divine moments at ISKCON Kurnool." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Memories" title="Temple Gallery" subtitle="Festivals, deities and moments of devotion" />
      <GallerySection />
    </SiteLayout>
  );
}
