import { useState, useEffect } from "react";
import { useAdmin, SundaySponsor } from "@/context/AdminContext";
import { Sparkles, Heart, Calendar, Gift, Cake, Award, Flame, Users, HandHeart, ChevronLeft, ChevronRight, Image as ImageIcon, X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
      className="relative w-full h-full min-h-[240px] sm:min-h-[280px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-muted shadow-sm border border-border/80 group/carousel select-none"
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

      {/* Navigation Arrows */}
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

export default function SundaySponsorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { sunday, settings } = useAdmin();
  const sponsors = (sunday.sponsors || []).filter((s) => s.active !== false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const whatsappPhone = settings.whatsapp || settings.phone || "919491689255";
  const cleanPhone = whatsappPhone.replace(/\D/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-card rounded-[32px] border-2 border-secondary/40 shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#21093a] via-[#431976] to-[#21093a] text-white px-6 sm:px-8 py-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition hover:scale-110 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[11px] font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Sacred Annadana Seva
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sunday Feast Sponsorship
            </h2>
            <p className="text-amber-100/80 font-sans text-xs sm:text-sm">
              Honoring and expressing our heartfelt gratitude to the noble devotees who have lovingly sponsored the Sunday Feast Prasadam.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          {sponsors.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Sparkles className="h-10 w-10 text-amber-500 mx-auto" />
              <h3 className="font-display text-xl font-bold text-primary">No Active Sponsor Listed</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Be the blessed soul to sponsor this upcoming Sunday Feast for the pleasure of Sri Sri Puri Jagannath!
              </p>
            </div>
          ) : (
            sponsors.map((sponsor, idx) => {
              const { icon: OccasionIcon, color: iconStyle } = getOccasionIcon(sponsor.occasion || "");
              const sponsorImages = sponsor.images && sponsor.images.length > 0 ? sponsor.images : (sponsor.image ? [sponsor.image] : []);
              
              return (
                <div 
                  key={sponsor.id || idx}
                  className="bg-surface/50 dark:bg-card/50 rounded-2xl border border-border/80 p-6 relative overflow-hidden"
                >
                  {/* Top Badge: Date & Occasion */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 mb-5">
                    {sponsor.date && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-border text-foreground font-semibold text-xs shadow-xs">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                        <span>{sponsor.date}</span>
                      </div>
                    )}

                    {sponsor.occasion && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${iconStyle} shadow-xs`}>
                        <OccasionIcon className="h-3.5 w-3.5" />
                        <span>{sponsor.occasion}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Column: Image Carousel */}
                    <div className="md:col-span-5">
                      <SponsorCarousel images={sponsorImages} title={sponsor.name || sponsor.sponsorName || "Sunday Feast"} />
                    </div>

                    {/* Right Column: Sponsor Details & Devotional Gratitude */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider mb-1">
                          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                          <span>Sponsored With Devotion By</span>
                        </div>
                        <h3 className="font-display text-2xl font-black text-primary tracking-tight">
                          {sponsor.name || sponsor.sponsorName || "Noble Devotee"}
                        </h3>
                        {(sponsor.familyMembers || sponsor.familyName) && (
                          <p className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{sponsor.familyMembers || sponsor.familyName}</span>
                          </p>
                        )}
                      </div>

                      {/* Seva Quote / Purpose */}
                      {(sponsor.quote || sponsor.details) && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed italic">
                          "{sponsor.quote || sponsor.details}"
                        </div>
                      )}

                      {/* Temple Priest / Devotee Blessing */}
                      <div className="p-3 rounded-xl bg-secondary/15 border border-secondary/30 flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/90 font-medium font-sans">
                          {sponsor.blessing || "May Sri Sri Puri Jagannath, Baladeva & Subhadra Maharani bestow abundant bhakti, health, and peace upon the sponsor and family."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Bottom Action CTA */}
          <div className="pt-2 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/donate/sunday-feast"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-sans font-bold text-sm shadow-md transition hover:scale-105"
            >
              <HandHeart className="h-4 w-4" />
              <span>Sponsor Upcoming Sunday Feast</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-surface hover:bg-surface/80 border border-border text-foreground font-semibold text-sm transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
