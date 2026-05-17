import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import UpcomingFestivals from "@/components/UpcomingFestivals";
import GallerySection from "@/components/GallerySection";
import ConnectSection from "@/components/ConnectSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISKCON Kurnool — Sri Sri Puri Jagannath Temple" },
      { name: "description", content: "Welcome to ISKCON Kurnool, the abode of Sri Sri Puri Jagannath, Baladeva and Subhadra. Join our temple programs, festivals, and spiritual community." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <HeroCarousel />
      <WelcomeSection />
      <GallerySection />
      <ConnectSection />
    </SiteLayout>
  );
}
