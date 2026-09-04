import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import DailyDarshanSection from "@/components/DailyDarshanSection";
import LiveProgrammeSection from "@/components/LiveProgrammeSection";
import UpcomingFestivals from "@/components/UpcomingFestivals";
import SundayProgramSection from "@/components/SundayProgramSection";
import HomeGallery from "@/components/HomeGallery";
import HomeGoshala from "@/components/HomeGoshala";
import SocialMediaSection from "@/components/SocialMediaSection";
import HomeHouseProgrammesSection from "@/components/HomeHouseProgrammesSection";
import HomeYouthSection from "@/components/HomeYouthSection";
import HomeHarinamaSection from "@/components/HomeHarinamaSection";
import HomePrahladaBadiSection from "@/components/HomePrahladaBadiSection";
import HomeGitaCourseSection from "@/components/HomeGitaCourseSection";
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
      <LiveProgrammeSection />
      <DailyDarshanSection />
      <UpcomingFestivals />
      <SundayProgramSection />
      <HomeGallery />
      <HomeGoshala />
      <SocialMediaSection />
      <HomeHouseProgrammesSection />
      <HomeYouthSection />
      <HomeHarinamaSection />
      <HomePrahladaBadiSection />
      <HomeGitaCourseSection />
      <ConnectSection />
    </SiteLayout>
  );
}
