import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import GallerySection from "@/components/GallerySection";
import ConnectSection from "@/components/ConnectSection";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISKCON Kurnool — Sri Sri Jagannath Baladev Subhadra Temple" },
      { name: "description", content: "Welcome to ISKCON Kurnool, the abode of Sri Sri Jagannath, Baladev and Subhadra. Join our temple programs, festivals, and spiritual community." },
      { property: "og:title", content: "ISKCON Kurnool — Hare Krishna" },
      { property: "og:description", content: "International Society for Krishna Consciousness, Kurnool. Visit, learn, and serve." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroCarousel />
        <WelcomeSection />
        <GallerySection />
        <ConnectSection />
      </main>
      <Footer />
    </div>
  );
}
