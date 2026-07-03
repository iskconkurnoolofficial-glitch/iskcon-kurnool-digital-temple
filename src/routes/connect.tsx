import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import ConnectSection from "@/components/ConnectSection";
import ContactFormSection from "@/components/ContactFormSection";

export const Route = createFileRoute("/connect")({
  head: () => ({ meta: [
    { title: "Connect — ISKCON Kurnool" },
    { name: "description", content: "Visit the temple, send queries, or locate us on the map." },
  ]}),
  component: Page,
});

// Connect Page displays Contact Form and Temple Address/Map as separate sections
function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Get in Touch" title="Connect With Us" subtitle="Send us a message or visit the temple — we welcome you with open arms." pageKey="connect" />
      <ContactFormSection />
      <ConnectSection />
    </SiteLayout>
  );
}
