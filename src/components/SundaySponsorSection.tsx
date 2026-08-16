import { useState, useEffect } from "react";
import { useAdmin, SundaySponsor } from "@/context/AdminContext";
import { Sparkles, Heart, Calendar, Gift, Cake, Award, Flame, Users, HandHeart, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

function getOccasionIcon(occasion: string) {
  const occ = (occasion || "").toLowerCase();
  if (occ.includes("birth") || occ.includes("janma")) {
    return { icon: Cake, color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30" };
  }
  if (occ.includes("anniversary") || occ.includes("vivah") || occ.includes("wedding") || occ.includes("marriage")) {
    return { icon: Heart, color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30" };
  }
  if (occ.includes("memory") || occ.includes("memorial") || occ.includes("punyatithi") || occ.includes("shradh")) {
    return { icon: Flame, color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/30" };
  }
  if (occ.includes("seva") || occ.includes("offering") || occ.includes("prasad")) {
    return { icon: HandHeart, color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30" };
  }
  return { icon: Award, color: "text-secondary bg-secondary/15 border-secondary/30" };
}

/* =========================================================================
   Sponsor Image Carousel Sub-component (Up to 4 Images)
   ========================================================================= */
function SponsorCarousel({ images, title }: { images: string[]; title: string }) {
  const validImages = (images || []).filter(Boolean);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (validImages.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % validImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [validImages.length, isPaused]);

  if (validImages.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border/80 flex items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/80 dark:bg-card shadow-sm flex items-center justify-center text-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-primary block">Sunday Feast Seva</span>
        </div>
      </div>
    );
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % validImages.length);
  };

  return (
    <div 
      className="relative w-full h-full min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-muted shadow-sm border border-border/80 group/carousel select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Images */}
      {validImages.map((img, i) => (
        <div
          key={img + i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === currentIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={img}
            alt={`${title} - photo ${i + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
      ))}

      {/* Floating Counter Badge */}
      {validImages.length > 1 && (
        <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
          <ImageIcon className="h-3 w-3 text-amber-300" />
          <span>{currentIdx + 1}/{validImages.length}</span>
        </div>
      )}

      {/* Navigation Arrows (if > 1 image) */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {validImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
          {validImages.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(dotIdx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                dotIdx === currentIdx
                  ? "w-6 bg-amber-400 shadow-sm"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Main Sunday Feast Sponsorship Section (Side-by-Side on Large Screens)
   ========================================================================= */
export default function SundaySponsorSection({ className = "" }: { className?: string }) {
  const { sunday, settings } = useAdmin();
  const sponsors = (sunday.sponsors || []).filter((s) => s.active !== false);

  if (sponsors.length === 0) {
    return null;
  }

  const whatsappPhone = settings.whatsapp || settings.phone || "919491689255";
  const cleanPhone = whatsappPhone.replace(/\D/g, "");

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-surface via-[#fffdf9] to-background border-b border-border/40 relative overflow-hidden ${className}`}>
      {/* Devotional background aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-primary dark:text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-3.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> Sacred Annadana Seva
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight">
            Sunday Feast Sponsorship
          </h2>
          <p className="text-muted-foreground mt-3 font-sans text-sm sm:text-base leading-relaxed">
            Honoring and expressing our heartfelt gratitude to the noble devotees who have lovingly sponsored the Sunday Feast Prasadam.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-secondary/40 via-accent to-secondary/40 mx-auto rounded-full mt-4" />
        </div>

        {/* Sponsor Cards Stack (Side-by-Side layout on Large Devices) */}
        <div className="space-y-8 max-w-5xl mx-auto">
          {sponsors.map((sponsor, idx) => {
            const { icon: OccasionIcon, color: iconStyle } = getOccasionIcon(sponsor.occasion || "");
            const sponsorImages = sponsor.images && sponsor.images.length > 0 ? sponsor.images : (sponsor.image ? [sponsor.image] : []);
            
            return (
              <div 
                key={sponsor.id || idx}
                className="bg-white dark:bg-card rounded-[32px] border-2 border-secondary/30 shadow-[0_15px_40px_-15px_rgba(91,44,155,0.08)] p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1 group"
              >
                {/* Corner Decorative Aura */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/15 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                {/* Top Badge: Date & Occasion */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5 mb-6">
                  {sponsor.date && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-border text-foreground font-semibold text-xs shadow-xs">
                      <Calendar className="h-3.5 w-3.5 text-accent" />
                      <span>{sponsor.date}</span>
                    </div>
                  )}

                  {sponsor.occasion && (
                    <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${iconStyle} shadow-xs`}>
                      <OccasionIcon className="h-3.5 w-3.5" />
                      <span>{sponsor.occasion}</span>
                    </div>
                  )}
                </div>

                {/* Main Content Layout: Left Carousel + Right Details on Large Screens */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  
                  {/* Left Side: 4-Image Carousel / Photo Slider */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <SponsorCarousel images={sponsorImages} title={sponsor.sponsorName} />
                  </div>

                  {/* Right Side: Sponsor Name, Family, Feast Details, Devotional Blessing */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                    
                    {/* Sponsor & Family Title */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-accent uppercase tracking-widest font-sans block">
                        Sponsored With Devotion By
                      </span>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-primary leading-tight">
                          {sponsor.sponsorName}
                        </h3>
                        {sponsor.familyName && (
                          <span className="font-display font-semibold text-xl sm:text-2xl text-secondary">
                            {sponsor.familyName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feast / Sponsorship Details */}
                    {sponsor.details && (
                      <div className="bg-[#fdf9f2] dark:bg-surface/60 border border-secondary/25 rounded-2xl p-4 sm:p-5 relative shadow-xs">
                        <div className="flex items-start gap-3">
                          <Gift className="h-4 w-4 text-accent mt-1 shrink-0" />
                          <div className="space-y-1 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Feast / Seva Details
                            </span>
                            <p className="text-foreground/90 font-sans text-sm sm:text-base leading-relaxed italic">
                              "{sponsor.details}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Devotional Blessing Line */}
                    <div className="flex items-start sm:items-center gap-2.5 pt-3 text-xs sm:text-sm text-muted-foreground border-t border-border/40 font-sans">
                      <Heart className="h-4 w-4 fill-accent/20 text-accent shrink-0 mt-0.5 sm:mt-0" />
                      <span className="leading-normal">
                        May Sri Sri Puri Jagannath bestow abundant bhakti, good health, peace, and auspicious blessings upon the family.
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>



      </div>
    </section>
  );
}
