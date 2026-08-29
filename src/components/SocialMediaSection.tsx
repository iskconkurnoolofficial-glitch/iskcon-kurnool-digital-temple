import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Instagram, Youtube, Facebook, MessageCircle, Twitter } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

// Official Custom Brand Logo Components
const InstagramLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#instagram-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.51C1.248 4.395.518 5.125.518 6.577C0 8.448 0 12 0 12s0 3.552.518 5.423c.53 1.45 1.26 2.18 2.11 2.18c1.87.51 9.38.51 9.38.51s7.518 0 9.389-.51a3.003 3.003 0 0 0 2.11-2.18c.518-1.87.518-5.423.518-5.423s0-3.552-.518-5.423zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.764.462 3.42 1.272 4.884l-.864 3.156 3.228-.846c1.41.774 3.018 1.206 4.71 1.206 5.52 0 10.002-4.476 10.002-10.002C20.35 6.48 15.864 2 12.004 2zm5.346 12.3c-.228.648-1.32 1.206-1.806 1.254-.486.048-1.092.072-2.922-.678-2.34-.96-3.84-3.342-3.954-3.504-.12-.156-.96-1.278-.96-2.442 0-1.164.606-1.734.822-1.974.216-.24.474-.294.63-.294.156 0 .312.006.45.012.144.006.336-.054.528.402.198.474.678 1.656.738 1.776.06.12.096.258.018.414-.078.156-.174.258-.294.396-.12.138-.258.312-.366.42-.12.12-.246.252-.108.492.138.24.612 1.008 1.314 1.632.906.804 1.668 1.05 1.908 1.17.24.12.378.102.516-.054.138-.156.594-.69.756-.924.162-.234.324-.198.546-.114.222.084 1.41.666 1.65.786.24.12.396.18.456.282.06.102.06.582-.168 1.23z" />
  </svg>
);

export default function SocialMediaSection({ variant = "home" }: { variant?: "home" | "dedicated" }) {
  const { settings, instagram } = useAdmin();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Home gets 4 reels, Dedicated gets 8
  const reelsLimit = variant === "home" ? 4 : 8;
  const activeReelsList = (instagram?.reels || []).slice(0, reelsLimit).filter((r) => !!r.url);
  
  if (activeReelsList.length === 0 && variant === "home") return null;

  // Track active slide on scroll (for mobile dot indicators)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  // Format WhatsApp Link
  const waPhone = settings.whatsapp || "";
  const rawDigits = waPhone.replace(/\D/g, "");
  const waUrl = waPhone ? (waPhone.startsWith("http") ? waPhone : `https://wa.me/${rawDigits}`) : "";

  const socials = [
    {
      name: "Instagram",
      href: settings.instagram,
      icon: Instagram,
      glow: "hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#fa7e1e] hover:to-[#d62976] hover:border-transparent hover:shadow-[0_8px_20px_rgba(214,41,118,0.25)]",
    },
    {
      name: "YouTube",
      href: settings.youtube,
      icon: Youtube,
      glow: "hover:bg-red-600 hover:border-transparent hover:shadow-[0_8px_20px_rgba(255,0,0,0.25)]",
    },
    {
      name: "Facebook",
      href: settings.facebook,
      icon: Facebook,
      glow: "hover:bg-[#1877f2] hover:border-transparent hover:shadow-[0_8px_20px_rgba(24,119,242,0.25)]",
    },
    {
      name: "Twitter",
      href: settings.twitter,
      icon: Twitter,
      glow: "hover:bg-sky-500 hover:border-transparent hover:shadow-[0_8px_20px_rgba(56,189,248,0.25)]",
    },
    {
      name: "WhatsApp",
      href: waUrl,
      icon: MessageCircle,
      glow: "hover:bg-[#25d366] hover:border-transparent hover:shadow-[0_8px_20px_rgba(37,211,102,0.25)]",
    },
  ].filter((s) => !!s.href);

  const platformCards = [
    {
      name: "Instagram",
      handle: instagram?.username ? `@${instagram.username}` : "@iskcon_kurnool",
      desc: "Watch daily darshans, reels, and festival celebrations.",
      btnText: "Follow Us",
      href: settings.instagram,
      icon: InstagramLogo,
      color: "text-[#d62976] bg-amber-500/5 border-amber-500/10",
      btnClass: "bg-gradient-to-r from-accent to-secondary hover:shadow-[0_4px_15px_rgba(232,103,12,0.3)] text-white",
    },
    {
      name: "YouTube",
      handle: "ISKCON Kurnool",
      desc: "Watch full lectures, kirtans, and temple festival videos.",
      btnText: "Subscribe",
      href: settings.youtube,
      icon: YoutubeLogo,
      color: "text-red-600 bg-red-50 border-red-100",
      btnClass: "bg-red-600 hover:bg-red-700 hover:shadow-[0_4px_15px_rgba(255,0,0,0.25)] text-white",
    },
    {
      name: "Facebook",
      handle: "ISKCON Kurnool Temple",
      desc: "Stay updated with event postings and community photos.",
      btnText: "Follow Us",
      href: settings.facebook,
      icon: FacebookLogo,
      color: "text-[#1877f2] bg-[#1877f2]/5 border-[#1877f2]/10",
      btnClass: "bg-[#1877f2] hover:bg-[#166fe5] hover:shadow-[0_4px_15px_rgba(24,119,242,0.3)] text-white",
    },
    {
      name: "Twitter",
      handle: "@iskconkurnool",
      desc: "Follow our official updates and announcements on Twitter/X.",
      btnText: "Follow Us",
      href: settings.twitter,
      icon: TwitterLogo,
      color: "text-slate-900 bg-slate-50 border-slate-100",
      btnClass: "bg-slate-900 hover:bg-slate-800 hover:shadow-[0_4px_15px_rgba(0,0,0,0.25)] text-white",
    },
    {
      name: "WhatsApp",
      handle: "Temple Announcements",
      desc: "Get instant daily darshan and ekadashi announcements.",
      btnText: "Join Channel",
      href: waUrl,
      icon: WhatsappLogo,
      color: "text-[#25d366] bg-[#25d366]/5 border-[#25d366]/10",
      btnClass: "bg-[#25d366] hover:bg-[#20ba5a] hover:shadow-[0_4px_15px_rgba(37,211,102,0.3)] text-white",
    },
  ].filter((c) => !!c.href);

  if (variant === "dedicated") {
    return (
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff] border-t border-amber-200/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Big Platform Cards Section */}
          <div className="space-y-6 animate-fade-up">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-accent font-bold uppercase text-[10px] tracking-[0.25em]">Connect Online</span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-primary mt-1">Our Official Channels</h2>
              <p className="text-slate-650 text-xs md:text-sm mt-2">Subscribe and follow us for daily transcendental messages, photos, and live updates.</p>
            </div>
            
            <div className={`grid gap-6 justify-center ${
              platformCards.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
              platformCards.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto" :
              platformCards.length === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto" :
              platformCards.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto" :
              "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}>
              {platformCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div 
                    key={c.name}
                    className="bg-white rounded-3xl p-6 border border-amber-200/30 shadow-elegant hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1"
                  >
                    <div className="space-y-4 flex flex-col items-center">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${c.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-primary">{c.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{c.handle}</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-[200px]">{c.desc}</p>
                    </div>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-6 w-full text-center py-2.5 rounded-xl font-bold text-xs transition duration-200 block shadow-sm cursor-pointer ${c.btnClass}`}
                    >
                      {c.btnText}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Reels Section */}
          {activeReelsList.length > 0 && (
            <div className="space-y-8 pt-8 border-t border-amber-200/60 animate-fade-up">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-accent font-bold uppercase text-[10px] tracking-[0.25em]">ISKCON Kurnool Media</span>
                <h2 className="font-display font-extrabold text-3xl text-primary mt-1">Featured Video Reels</h2>
              </div>

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
                      className="relative w-full flex-shrink-0 snap-center overflow-hidden rounded-[24px] border border-amber-200/30 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:scale-[1.02] hover:border-amber-400/60 hover:shadow-xl group/card bg-black aspect-[9/16]"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-lg">
                          <Play className="h-6 w-6 fill-white" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Mobile indicators */}
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
                        activeIndex === idx ? "w-6 bg-amber-500" : "w-2 bg-amber-200"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Home Variant (dark background, 4 reels, row of link icons)
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-t from-[#120422] to-[#3d1270] border-t border-primary/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-[#5b2c9b]/25 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 text-left max-w-2xl animate-fade-in">
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

        <div className="relative animate-fade-up">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-lg">
                    <Play className="h-6 w-6 fill-white" />
                  </div>
                </div>
              </a>
            ))}
          </div>

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

        <div className="mt-10 flex justify-center">
          <Link
            to="/social-media"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer text-sm font-sans"
          >
            View All Reels
            <Instagram className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
