import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import SocialMediaSection from "@/components/SocialMediaSection";

export const Route = createFileRoute("/social-media")({
  head: () => ({ meta: [
    { title: "Social Media — ISKCON Kurnool" },
    { name: "description", content: "Stay connected with ISKCON Kurnool on social media. Follow us on Instagram, YouTube, Facebook, and WhatsApp." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Media Channels" title="Social Media" subtitle="Follow us on YouTube, Instagram, Facebook, and WhatsApp for daily updates, reels, darshan, and lectures." pageKey="socialMedia" />
      <SocialMediaSection />
    </SiteLayout>
  );
}
