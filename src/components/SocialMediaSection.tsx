import { useState } from "react";
import { Instagram, Youtube, Facebook, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function SocialMediaSection() {
  const { settings, instagram } = useAdmin();
  const [activeReelIdx, setActiveReelIdx] = useState(0);

  const activeReelsList = (instagram?.reels || []).slice(0, 8).filter((r) => !!r.url);

  // Format WhatsApp Link
  const waPhone = settings.whatsapp || "+91 9505377520";
  const rawDigits = waPhone.replace(/\D/g, "");
  const waUrl = waPhone.startsWith("http") ? waPhone : `https://wa.me/${rawDigits}`;

  const platforms = [
    {
      name: "Instagram",
      href: settings.instagram || "https://instagram.com/iskcon_kurnool",
      icon: Instagram,
      desc: "Daily darshan, reels & festival highlights",
      cta: "Follow Us",
      brand: "from-[#feda75] via-[#fa7e1e] to-[#d62976]",
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(214,41,118,0.25)] hover:border-[#d62976]/35",
      btnStyle: "border border-slate-200 text-slate-700 group-hover:bg-gradient-to-r group-hover:from-[#fa7e1e] group-hover:to-[#d62976] group-hover:text-white group-hover:border-transparent",
    },
    {
      name: "YouTube",
      href: settings.youtube || "https://youtube.com/@iskconkurnool",
      icon: Youtube,
      desc: "Lectures, kirtans & live programs",
      cta: "Subscribe",
      brand: "from-[#ff0000] to-[#cc0000]",
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(255,0,0,0.25)] hover:border-red-500/35",
      btnStyle: "border border-slate-200 text-slate-700 group-hover:bg-red-600 group-hover:text-white group-hover:border-transparent",
    },
    {
      name: "Facebook",
      href: settings.facebook || "https://facebook.com/iskconkurnool",
      icon: Facebook,
      desc: "Community updates & event invites",
      cta: "Follow Us",
      brand: "from-[#1877f2] to-[#0a5dc2]",
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(24,119,242,0.25)] hover:border-[#1877f2]/35",
      btnStyle: "border border-slate-200 text-slate-700 group-hover:bg-[#1877f2] group-hover:text-white group-hover:border-transparent",
    },
    {
      name: "WhatsApp",
      href: waUrl,
      icon: MessageCircle,
      desc: "Get temple updates on your phone",
      cta: "Join Channel",
      brand: "from-[#25d366] to-[#128c7e]",
      glow: "hover:shadow-[0_20px_40px_-15px_rgba(37,211,102,0.25)] hover:border-[#25d366]/35",
      btnStyle: "border border-slate-200 text-slate-700 group-hover:bg-[#25d366] group-hover:text-white group-hover:border-transparent",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/15 via-white to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Main Section Title */}
        <div className="text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent font-semibold">
            <span className="h-px w-8 bg-secondary" /> Social Channels <span className="h-px w-8 bg-secondary" />
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary mt-4">
            Follow Us on Social Media
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
            Stay connected with ISKCON Kurnool — daily darshan, festivals, kirtans &amp; spiritual content
          </p>
        </div>

        {/* Social Platforms Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/60 p-6 flex flex-col items-center text-center hover:-translate-y-1.5 transition-all duration-300 shadow-sm ${p.glow}`}
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${p.brand} grid place-items-center text-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-primary mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
                <span className={`mt-6 inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full font-bold text-xs w-full transition-all duration-300 transform group-hover:scale-[1.02] shadow-sm ${p.btnStyle}`}>
                  {p.cta}
                </span>
              </a>
            );
          })}
        </div>

        {/* Instagram Profile Header section */}
        {instagram && (
          <div className="space-y-8 pt-8 border-t border-secondary/20">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-secondary/20 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 max-w-4xl mx-auto animate-fade-in">
              {/* Logo / Profile Picture */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-primary/20 p-1 bg-white shrink-0 overflow-hidden shadow-sm">
                {settings.logo ? (
                  <img src={settings.logo} alt="ISKCON Kurnool Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-lg">
                    IK
                  </div>
                )}
              </div>

              {/* Bio info */}
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-primary tracking-wide">
                    {instagram.fullName || "ISKCON KURNOOL OFFICIAL"}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 border text-slate-500 rounded-full w-max mx-auto sm:mx-0">
                    Non-profit organisation
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {instagram.bio}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-sm font-semibold text-accent">
                  {instagram.hashtags.split(" ").map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>

                <div>
                  <a
                    href={`https://${instagram.websiteUrl.replace(/https?:\/\//, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary hover:text-accent underline transition"
                  >
                    {instagram.websiteUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* Reels Grid (4 cols, 2 rows) */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-display font-bold text-xl text-primary">Featured Reels</h3>
                <p className="text-xs text-muted-foreground">Click to watch latest devotional highlights directly</p>
              </div>
              
              {/* Desktop Grid (visible on md and up) */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {activeReelsList.map((reel) => (
                  <div
                    key={reel.id}
                    className="bg-white rounded-3xl border border-secondary/20 shadow-sm overflow-hidden aspect-[9/16] relative hover:shadow-gold hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <video
                      src={reel.url}
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl bg-black"
                      controls
                      preload="metadata"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Carousel Slider (visible on mobile only) */}
              {activeReelsList.length > 0 && (
                <div className="md:hidden space-y-5 max-w-sm mx-auto">
                  <div className="relative aspect-[9/16] w-full max-w-[270px] mx-auto bg-black rounded-3xl overflow-hidden shadow-gold border border-secondary/20 group">
                    <video
                      key={activeReelsList[activeReelIdx].id}
                      src={activeReelsList[activeReelIdx].url}
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      controls
                      preload="metadata"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    
                    {/* Navigation Arrows */}
                    {activeReelIdx > 0 && (
                      <button
                        onClick={() => setActiveReelIdx((prev) => prev - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-primary hover:bg-white shadow z-20 transition active:scale-95 cursor-pointer"
                        aria-label="Previous reel"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {activeReelIdx < activeReelsList.length - 1 && (
                      <button
                        onClick={() => setActiveReelIdx((prev) => prev + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-primary hover:bg-white shadow z-20 transition active:scale-95 cursor-pointer"
                        aria-label="Next reel"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex justify-center items-center gap-2 pt-1">
                    {activeReelsList.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveReelIdx(i)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeReelIdx === i ? "w-6 bg-accent" : "w-2 bg-slate-300"
                        }`}
                        aria-label={`Go to reel ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

