import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function WelcomeSection() {
  const { settings, sunday } = useAdmin();
  const welcomeUrl = settings.welcomeImage || settings.logo || sunday.logo;

  return (
    <section id="welcome" className="relative py-12 md:py-16 bg-gradient-to-b from-[#fffaf0] via-[#fef6e0] to-[#fffdf5] overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 items-center">
          
          {/* Left Column: Welcome Message — content below on mobile, left on lg */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left animate-fade-up order-last lg:order-first">
            <span className="inline-flex items-center gap-3 text-secondary font-semibold uppercase text-[11px] tracking-[0.35em]">
              <span className="h-px w-8 bg-secondary/70 hidden lg:block" />
              Sri Sri Puri Jagannath Temple
            </span>

            <h1 className="font-display font-black text-5xl md:text-7xl text-[#5b2c9b] tracking-[-0.02em] leading-[0.95]">
              Hare <span className="italic font-light text-accent">Krishna!</span>
            </h1>

            <h2 className="font-display font-bold text-2xl md:text-3xl text-[#5b2c9b] tracking-tight font-sans">
              Welcome to ISKCON Kurnool
            </h2>

            <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-sans max-w-xl mx-auto lg:mx-0">
              Welcome to the abode of Sri Sri Puri Jagannath, Baladeva, and Subhadra, where the most-benevolent Lord
              has come to receive your love and to fill your lives with His grace. As devotees of the Lord we are here
              to serve you and look forward to welcoming you at our temple.
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                to="/about/kurnool"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold hover:scale-[1.03] transition-all duration-200 cursor-pointer text-sm font-sans"
              >
                Learn More About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Image — appears on top on mobile */}
          <div className="lg:col-span-6 flex justify-center animate-fade-up order-first lg:order-last mb-0 lg:mb-0 -mb-4">
            <img
              src={welcomeUrl || "https://images.unsplash.com/photo-1609137982420-b1885df33a7e?auto=format&fit=crop&w=800&q=80"}
              alt="Sri Sri Puri Jagannath Deities"
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-w-lg rounded-[32px] object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
