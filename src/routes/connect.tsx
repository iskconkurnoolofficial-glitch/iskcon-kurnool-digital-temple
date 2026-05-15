import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import ConnectSection from "@/components/ConnectSection";

export const Route = createFileRoute("/connect")({
  head: () => ({ meta: [
    { title: "Connect — ISKCON Kurnool" },
    { name: "description", content: "Visit the temple, call us, or follow us on social media." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Get in Touch" title="Connect With Us" subtitle="Visit, call or follow — we welcome you with open arms" />
      <ConnectSection />
    </SiteLayout>
  );
}
