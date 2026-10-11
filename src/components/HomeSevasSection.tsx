import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin, Seva, getSevaAutoDescription } from "@/context/AdminContext";
import { 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Share2
} from "lucide-react";
import { toast } from "sonner";

function getSevaThumbnail(s: Seva): string | null {
  if (s.thumbnail && s.thumbnail.trim()) return s.thumbnail.trim();
  return null;
}

const SEVA_GRADIENTS = [
  "from-[#4a083f] via-[#71105e] to-[#91165a]", // Royal Magenta
  "from-[#380946] via-[#5c136a] to-[#801b70]", // Deep Purple Amethyst
  "from-[#521035] via-[#831843] to-[#9f1239]", // Sacred Crimson Rose
  "from-[#3b1238] via-[#651554] to-[#86198f]", // Divine Plum
  "from-[#451408] via-[#7c2d12] to-[#9a3412]", // Saffron Temple Ochre
];

export default function HomeSevasSection() {
  const { sevas, homeSevasConfig } = useAdmin();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter & sort sevas based on admin configuration
  const displaySevas = useMemo(() => {
    if (!homeSevasConfig?.enabled) return [];

    const activeList = (sevas || []).filter((s) => s.active !== false);

    let filtered: Seva[];
    if (homeSevasConfig.displayMode === "all") {
      filtered = activeList;
    } else {
      // "selected" mode: show sevas marked as featuredOnHome
      filtered = activeList.filter((s) => s.featuredOnHome === true);
      
      // Fallback: if none are explicitly marked as featuredOnHome yet, show active sevas up to 8
      if (filtered.length === 0) {
        filtered = activeList.slice(0, 8);
      }
    }

    // Sort by homeOrder first, then general order
    return [...filtered].sort((a, b) => {
      const orderA = typeof a.homeOrder === "number" ? a.homeOrder : (a.order ?? 999);
      const orderB = typeof b.homeOrder === "number" ? b.homeOrder : (b.order ?? 999);
      return orderA - orderB;
    });
  }, [sevas, homeSevasConfig]);

  // Check scroll bounds & calculate progress
  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(maxScroll > 10 && el.scrollLeft < maxScroll - 10);

    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(0);
    }

    // Active card calculation
    const cardEl = el.querySelector<HTMLElement>("[data-seva-card]");
    if (cardEl) {
      const cardWidth = cardEl.offsetWidth + 20; // width + gap
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, Math.max(0, displaySevas.length - 1)));
    }
  }, [displaySevas.length]);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardEl = el.querySelector<HTMLElement>("[data-seva-card]");
    const scrollAmount = cardEl ? cardEl.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth"
    });
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-seva-card]"));
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  // Auto-scroll loop that pauses on hover/touch
  useEffect(() => {
    if (displaySevas.length <= 1) return;
    const el = scrollerRef.current;
    if (!el) return;

    let isPaused = false;
    const onPause = () => { isPaused = true; };
    const onResume = () => { isPaused = false; };

    el.addEventListener("pointerdown", onPause);
    el.addEventListener("pointerup", onResume);
    el.addEventListener("mouseenter", onPause);
    el.addEventListener("mouseleave", onResume);
    el.addEventListener("scroll", updateScrollState, { passive: true });

    const timer = setInterval(() => {
      if (isPaused) return;
      const left = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (left >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-seva-card]"));
        const elRect = el.getBoundingClientRect();
        const nextCard = cards.find((c) => {
          const cardLeft = c.getBoundingClientRect().left - elRect.left + left;
          return cardLeft > left + 15;
        });

        if (nextCard) {
          const nextLeft = nextCard.getBoundingClientRect().left - elRect.left + left;
          el.scrollTo({ left: nextLeft, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4500);

    return () => {
      clearInterval(timer);
      el.removeEventListener("pointerdown", onPause);
      el.removeEventListener("pointerup", onResume);
      el.removeEventListener("mouseenter", onPause);
      el.removeEventListener("mouseleave", onResume);
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [displaySevas.length, updateScrollState]);

  const handleShare = (e: React.MouseEvent, s: Seva) => {
    e.preventDefault();
    e.stopPropagation();
    const sevaSlug = s.slug || s.id;
    const url = `${window.location.origin}/donate/${sevaSlug}`;
    const minPrice = s.prices && s.prices.length > 0 
      ? Math.min(...s.prices.map((p) => p.amount || 0)) 
      : 516;
    const desc = getSevaAutoDescription(s);
    const text = `🪷 ${s.title} — Sri Sri Puri Jagannath Mandir (ISKCON Kurnool)\n${desc}\nOffer Seva (starts from ₹${minPrice.toLocaleString("en-IN")}): ${url}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: s.title,
        text,
        url,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Seva link copied to clipboard!");
    }
  };

  if (!homeSevasConfig?.enabled || displaySevas.length === 0) {
    return null;
  }

  return (
    <section 
      aria-label="Temple Sevas and Offerings"
      className="relative py-10 sm:py-16 md:py-20 bg-gradient-to-b from-[#31062c] via-[#5b0d4b] via-[#73125e] to-[#270423] text-white overflow-hidden border-t-2 border-b-2 border-pink-400/40"
    >
      {/* Top glowing celestial magenta aura beam */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_25px_rgba(244,114,182,0.95)] opacity-95" />

      {/* Top Radiant Celestial Magenta Starlight Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] max-w-full h-[520px] bg-gradient-to-b from-fuchsia-500/35 via-pink-500/25 to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* Center Devotional Magenta & Royal Rose Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] max-w-full h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.38)_0%,rgba(236,72,153,0.25)_45%,rgba(190,24,93,0.12)_70%,transparent_85%)] blur-[95px] pointer-events-none" />

      {/* Center Divine Solar Amber Warmth for Sacred Balance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-full h-[400px] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,transparent_70%)] blur-[85px] pointer-events-none" />

      {/* Bottom glowing celestial magenta accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-400/80 to-transparent shadow-[0_0_20px_rgba(217,70,239,0.85)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile-Friendly Responsive App Header on Magenta Gradient Background */}
        <div className="mb-5 sm:mb-8 md:mb-10">
          <div className="max-w-3xl">
            {/* Luminous Devotional Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-400/15 border border-pink-300/40 text-pink-200 text-[11px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2 shadow-[0_0_14px_rgba(236,72,153,0.25)]">
              <Sparkles className="h-3 w-3 text-pink-300 animate-pulse" />
              <span>Sacred Temple Offerings • ISKCON Kurnool</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-amber-100 via-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(245,158,11,0.5)]">
                {homeSevasConfig.title && homeSevasConfig.title !== "Offer Your Devotion Through Seva"
                  ? homeSevasConfig.title
                  : "Sri Sri Puri Jagannath Sevas"}
              </span>
            </h2>
            <p className="text-pink-100/90 text-xs sm:text-sm md:text-base line-clamp-2 mt-1.5 font-sans font-medium max-w-2xl">
              {homeSevasConfig.subtitle || "Participate in divine service and receive transcendental blessings at Sri Sri Puri Jagannath Mandir."}
            </p>
          </div>
        </div>

        {/* Carousel Container with Big Floating Side Arrows */}
        <div className="relative group/carousel">
          {/* Big Floating Left Navigation Arrow on Carousel */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              aria-label="Previous Seva"
              className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-13 h-13 lg:w-15 lg:h-15 items-center justify-center rounded-full bg-gradient-to-br from-[#3d0736] via-[#5b0d4b] to-[#73125e] text-amber-200 border-2 border-amber-300/85 hover:border-white hover:from-amber-500 hover:to-orange-500 hover:text-slate-950 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.85)] backdrop-blur-md active:scale-95 hover:scale-110 transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="h-8 w-8 lg:h-9 lg:w-9 stroke-[3]" />
            </button>
          )}

          {/* Big Floating Right Navigation Arrow on Carousel */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              aria-label="Next Seva"
              className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-13 h-13 lg:w-15 lg:h-15 items-center justify-center rounded-full bg-gradient-to-br from-[#3d0736] via-[#5b0d4b] to-[#73125e] text-amber-200 border-2 border-amber-300/85 hover:border-white hover:from-amber-500 hover:to-orange-500 hover:text-slate-950 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.85)] backdrop-blur-md active:scale-95 hover:scale-110 transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="h-8 w-8 lg:h-9 lg:w-9 stroke-[3]" />
            </button>
          )}

          {/* Horizontal Scrolling Track (One Complete Seva on Mobile, Multi-Card on Desktop) */}
          <div
            ref={scrollerRef}
            className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 touch-pan-x [-webkit-overflow-scrolling:touch] focus:outline-none"
            tabIndex={0}
            aria-label="Seva Cards Carousel"
          >
          {displaySevas.map((s, index) => {
            const hasMultiplePrices = Boolean(s.prices && s.prices.length > 1);
            const minPrice = s.prices && s.prices.length > 0 
              ? Math.min(...s.prices.map((p) => p.amount || 0)) 
              : 516;
            const sevaSlug = s.slug || s.id;
            const thumbnail = getSevaThumbnail(s);
            const gradientClass = SEVA_GRADIENTS[index % SEVA_GRADIENTS.length];

            return (
              <Link
                key={s.id || index}
                to="/donate/$slug"
                params={{ slug: sevaSlug }}
                data-seva-card
                className="w-[calc(100vw-2rem)] max-w-sm sm:max-w-none sm:w-[290px] md:w-[320px] lg:w-[340px] flex-shrink-0 snap-center sm:snap-start group relative bg-gradient-to-b from-white via-[#fffefc] to-[#fffbf2] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 hover:border-amber-400 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.15)] active:scale-[0.98] hover:shadow-[0_22px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
              >
                {/* Generous Prominent Height Thumbnail or Devotional Gradient Banner */}
                <div className="relative h-80 sm:h-72 md:h-80 lg:h-88 w-full overflow-hidden bg-slate-900">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top sm:object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}

                  {/* Devotional Gradient Banner with Seva Title (when no image added or on error) */}
                  <div
                    style={{ display: thumbnail ? "none" : "flex" }}
                    className={`w-full h-full relative flex-col items-center justify-center p-5 sm:p-6 text-center overflow-hidden bg-gradient-to-br ${gradientClass} select-none`}
                  >
                    {/* Radiant Ambient Core Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.25)_0%,transparent_75%)] pointer-events-none" />
                    
                    {/* Concentric Divine Aura Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-52 h-52 rounded-full border border-amber-300/40" />
                      <div className="w-36 h-36 rounded-full border border-amber-300/30" />
                    </div>

                    {/* Content: Sacred Seva Eyebrow, Title & Temple Inscription */}
                    <div className="relative z-10 flex flex-col items-center justify-center max-w-[92%] transition-transform duration-500 ease-out group-hover:scale-104">
                      <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 backdrop-blur-md shadow-xs">
                        <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-black text-amber-200 uppercase tracking-widest font-sans">
                          SACRED SEVA
                        </span>
                      </div>

                      <h4 className="font-display sm:font-sans text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] tracking-tight leading-snug line-clamp-3">
                        {s.title}
                      </h4>

                      <span className="mt-3 text-[10.5px] sm:text-[11px] text-pink-100/80 font-semibold tracking-wider uppercase font-sans">
                        Sri Sri Puri Jagannath Mandir
                      </span>
                    </div>
                  </div>
                </div>

                {/* Glowing Golden Threshold Divider */}
                <div className="h-[2.5px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

                {/* Unique Attractive Card Body - Luminous Golden Silk Background */}
                <div className="relative p-4 sm:p-4.5 md:p-5 flex-1 flex flex-col justify-between space-y-3 bg-gradient-to-b from-white/95 via-[#fffdf7]/95 to-[#fff8eb]/90 backdrop-blur-md overflow-hidden">
                  
                  <div className="relative z-10">
                    {/* Devotional Seva Identity Badge & Share Action Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/40 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)] shrink-0" />
                        <span className="text-[10px] sm:text-[10.5px] font-black text-amber-900 uppercase tracking-wider font-sans">
                          SRI SRI PURI JAGANNATH SEVAS
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleShare(e, s)}
                        className="p-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 hover:text-amber-950 border border-amber-300/60 transition-all hover:scale-110 active:scale-90 cursor-pointer shrink-0 shadow-2xs"
                        title="Share this Seva"
                        aria-label={`Share ${s.title}`}
                      >
                        <Share2 className="h-3.5 w-3.5 text-amber-800" />
                      </button>
                    </div>

                    {/* Attractive Title */}
                    <h3 className="font-sans text-base sm:text-[17px] md:text-lg font-black text-slate-900 group-hover:text-amber-800 tracking-tight leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] transition-colors">
                      {s.title}
                    </h3>

                    {/* Modern Attractive Description Card - Auto-generated if none provided */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/90 group-hover:bg-white border border-amber-200/70 shadow-[0_2px_8px_rgba(217,119,6,0.06)] flex items-start gap-2 transition-all">
                      <span className="p-1 rounded-lg bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      <p className="text-slate-700 text-xs sm:text-[13px] line-clamp-2 leading-relaxed font-sans font-medium">
                        {getSevaAutoDescription(s)}
                      </p>
                    </div>
                  </div>

                  {/* Clean Price & Action Button Shelf */}
                  <div className="pt-3 border-t border-amber-200/60 flex items-end justify-between gap-2.5 relative z-10">
                    <div className="flex flex-col">
                      {/* Starts from indicator for multiple tiers */}
                      {hasMultiplePrices && (
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-800 uppercase tracking-wider leading-none mb-1 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                          Starts from
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base text-emerald-700 font-black font-cinzel" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>₹</span>
                        <span 
                          className="font-cinzel text-2xl sm:text-2xl md:text-3xl font-black text-emerald-700 leading-none tracking-tight drop-shadow-xs"
                          style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 900 }}
                        >
                          {minPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* App CTA Button - Shimmer Gleam & Specular 3D Pill - Bigger on mobile */}
                    <span className="relative overflow-hidden group/btn inline-flex items-center gap-1.5 sm:gap-2 py-2.5 px-4.5 sm:py-2.5 sm:px-5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:via-amber-500 hover:to-orange-600 text-white font-black text-sm sm:text-[13.5px] tracking-wide shadow-[0_4px_18px_rgba(234,88,12,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.5)] group-hover:shadow-[0_6px_22px_rgba(234,88,12,0.55)] ring-1 ring-amber-300/40 hover:ring-amber-200/80 group-hover:scale-104 active:scale-95 transition-all duration-300 shrink-0">
                      {/* Sweeping Specular Light Gleam */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
                      <span>Offer Seva</span>
                      <ArrowRight className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white transition-transform duration-300 group-hover:translate-x-1 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

        {/* Mobile & Desktop Progress Navigation on Magenta Gradient Background */}
        <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center gap-2">
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5">
            {displaySevas.slice(0, Math.min(displaySevas.length, 12)).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to seva ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === i 
                    ? "w-7 sm:w-8 h-1.5 sm:h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]" 
                    : "w-2 sm:w-2.5 h-1.5 sm:h-2 bg-pink-200/25 hover:bg-pink-200/50"
                }`}
              />
            ))}
          </div>

          {/* Mobile Current Card Counter & Swipe Hint on Magenta Gradient Background */}
          <div className="sm:hidden text-[11px] font-semibold text-amber-200/90 tracking-wide flex items-center gap-1.5">
            <span>Seva {activeIndex + 1} of {displaySevas.length}</span>
            <span className="text-amber-400">•</span>
            <span className="text-pink-200/80">Swipe for next seva</span>
          </div>
        </div>

        {/* Bottom Action - Explore All Sevas Button (Enlarged and touch-friendly on mobile) */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center">
          <Link
            to={homeSevasConfig.viewAllLink || "/donate"}
            className="group/all relative inline-flex items-center justify-center gap-2.5 w-[calc(100vw-3rem)] sm:w-auto max-w-sm px-8 py-4 sm:px-10 sm:py-4.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:via-amber-500 hover:to-orange-600 text-white font-black text-base sm:text-lg tracking-wide shadow-[0_6px_25px_rgba(234,88,12,0.45),inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_10px_35px_rgba(234,88,12,0.65)] ring-2 ring-amber-300/50 hover:ring-amber-200 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden text-center"
          >
            {/* Sweeping Specular Light Beam */}
            <span className="absolute inset-0 -translate-x-full group-hover/all:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-800 ease-in-out pointer-events-none" />
            
            <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-amber-100 group-hover/all:rotate-12 transition-transform duration-300 shrink-0" />
            <span>Explore all Sevas</span>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 group-hover/all:translate-x-1.5 stroke-[2.75] shrink-0" />
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-pink-200/75 font-sans font-medium text-center">
            View all regular, festival, and temple offerings
          </p>
        </div>

      </div>
    </section>
  );
}
