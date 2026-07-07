import { useState, useRef } from "react";
import { Play, Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function SocialMediaSection() {
  const { settings, instagram } = useAdmin();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Limit list to latest 4 reels
  const activeReelsList = (instagram?.reels || []).slice(0, 4).filter((r) => !!r.url);
  
  if (activeReelsList.length === 0) return null;

  // Track active slide on scroll (for mobile dot indicators)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  // Format WhatsApp Link
  const waPhone = settings.whatsapp || "+91 9505377520";
  const rawDigits = waPhone.replace(/\D/g, "");
  const waUrl = waPhone.startsWith("http") ? waPhone : `https://wa.me/${rawDigits}`;

  const socials = [
    {
      name: "Instagram",
      href: settings.instagram || "https://instagram.com/iskcon_kurnool",
      icon: Instagram,
      glow: "hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#fa7e1e] hover:to-[#d62976] hover:border-transparent hover:shadow-[0_8px_20px_rgba(214,41,118,0.25)]",
    },
    {
      name: "YouTube",
      href: settings.youtube || "https://youtube.com/@iskconkurnool",
      icon: Youtube,
      glow: "hover:bg-red-600 hover:border-transparent hover:shadow-[0_8px_20px_rgba(255,0,0,0.25)]",
    },
    {
      name: "Facebook",
      href: settings.facebook || "https://facebook.com/iskconkurnool",
      icon: Facebook,
      glow: "hover:bg-[#1877f2] hover:border-transparent hover:shadow-[0_8px_20px_rgba(24,119,242,0.25)]",
    },
    {
      name: "WhatsApp",
      href: waUrl,
      icon: MessageCircle,
      glow: "hover:bg-[#25d366] hover:border-transparent hover:shadow-[0_8px_20px_rgba(37,211,102,0.25)]",
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-t from-[#120422] to-[#3d1270] border-t border-primary/20">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-[#5b2c9b]/25 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Split Header: Left Text, Right Social Icons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 text-left max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent font-semibold">
              <Instagram className="h-4 w-4 text-accent" />
              Instagram Highlights
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-2">
              Sacred Reels & Darshan
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Watch our daily darshans, transcendental kirtans, and festival celebrations. Follow us{" "}
              <a
                href={settings.instagram || "https://instagram.com/iskcon_kurnool"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-accent font-semibold underline"
              >
                @{instagram?.username || "iskcon_kurnool"}
              </a>
              .
            </p>
          </div>

          {/* Social Icons row on the right */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="flex items-center gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-white ${s.glow}`}
                    title={`Follow us on ${s.name}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reels Responsive Grid / Slider Layout */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-6 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 md:pb-0 md:grid-cols-4 max-w-6xl mx-auto"
          >
            {activeReelsList.map((reel) => (
              <a
                key={reel.id}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full flex-shrink-0 snap-center overflow-hidden rounded-[24px] border border-white/10 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-[1.02] hover:border-accent/40 hover:shadow-gold group/card bg-black aspect-[9/16]"
              >
                <video
                  src={reel.url}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  preload="auto"
                  playsInline
                  webkit-playsinline="true"
                  loop
                  muted
                  autoPlay
                />
                {/* Subtle Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />
                
                {/* Play Button Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-lg">
                    <Play className="h-6 w-6 fill-white" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
            {activeReelsList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (scrollRef.current) {
                    const cardWidth = scrollRef.current.clientWidth;
                    scrollRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-accent" : "w-2 bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="mt-10 flex justify-center">
          <a
            href={settings.instagram || "https://instagram.com/iskcon_kurnool"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer text-sm font-sans"
          >
            View All Reels
            <Instagram className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
}

