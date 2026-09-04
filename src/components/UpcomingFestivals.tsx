import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin, normalizeFestival, isFestivalLive, Festival } from "@/context/AdminContext";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Clock,
  Flame,
  CheckCircle2,
  Gift,
  PartyPopper
} from "lucide-react";
import { toast } from "sonner";

function formatFestivalDate(d: string) {
  if (!d) return { formatted: "", day: "", month: "", year: "" };
  try {
    const dateObj = new Date(d + "T00:00:00");
    const day = dateObj.toLocaleDateString("en-IN", { day: "2-digit" });
    const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
    const year = dateObj.getFullYear().toString();
    const formatted = dateObj.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return { formatted, day, month, year };
  } catch {
    return { formatted: d, day: "", month: "", year: "" };
  }
}

function getDaysRemaining(dateStr: string) {
  if (!dateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const festDate = new Date(dateStr + "T00:00:00");
    festDate.setHours(0, 0, 0, 0);

    const diffTime = festDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today!";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1 && diffDays <= 30) return `In ${diffDays} days`;
    if (diffDays > 30) return `${diffDays} days to go`;
    return null;
  } catch {
    return null;
  }
}

function FestivalCard({ f }: { f: Festival }) {
  const { formatted } = formatFestivalDate(f.date);
  const daysRemaining = getDaysRemaining(f.date);
  const minSevaAmount = useMemo(() => {
    if (!f.sevas || f.sevas.length === 0) return null;
    const amounts = f.sevas
      .flatMap((s) => (s.prices ?? []).map((p) => p.amount))
      .filter((a) => typeof a === "number" && a > 0);
    if (!amounts.length) return null;
    return Math.min(...amounts);
  }, [f.sevas]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/festival/${f.slug}`;
    const text = `🕉️ ${f.title} at ISKCON Kurnool\n📅 Date: ${formatted}\nParticipate and offer seva: ${url}`;
    if (navigator.share) {
      navigator.share({ title: f.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Festival link copied to clipboard!");
    }
  };

  return (
    <article className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-amber-200/70 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500/50 transition-all duration-500 flex flex-col h-full">
      {/* Top Banner Image with Floating Badges */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {f.thumbnail ? (
          <img
            src={getOptimizedCloudinaryUrl(f.thumbnail, "card")}
            alt={f.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-all duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-amber-600 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50">
            <Sparkles className="h-12 w-12 animate-pulse" />
            <span className="text-xs font-semibold mt-2 text-amber-800 uppercase tracking-widest">Auspicious Utsava</span>
          </div>
        )}

        {/* Floating Countdown & Top Right Badges */}
        <div className="absolute top-3.5 right-3.5 flex flex-col items-end gap-1.5">
          {daysRemaining && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-gold border border-amber-300 animate-in fade-in duration-300">
              <Sparkles className="h-3 w-3 text-slate-950" />
              {daysRemaining}
            </span>
          )}

          {f.sevas && f.sevas.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-200 text-[10px] font-bold border border-white/20">
              <Gift className="h-3 w-3 text-amber-400" />
              {f.sevas.length} Sevas
            </span>
          )}
        </div>

        {/* Quick Share Overlay Button */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md"
          title="Share Festival"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Formatted Date Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-400 gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              {formatted || "Festival Date TBA"}
            </span>
            {minSevaAmount && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Sevas from <strong className="text-amber-800 dark:text-amber-400">₹{minSevaAmount}</strong>
              </span>
            )}
          </div>

          {/* Festival Title */}
          <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {f.title}
          </h3>

          {/* Short Description */}
          {f.shortDescription ? (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {f.shortDescription}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 italic">
              Join us for glorious abhishekams, transcendental kirtans, and festive prasadam.
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <Link
            to="/festival/$slug"
            params={{ slug: f.slug }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-[1.02] active:scale-95 group/btn"
          >
            <span>Participate &amp; Sevas</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function UpcomingFestivals() {
  const { festivals } = useAdmin();
  const list = useMemo(
    () =>
      festivals
        .map(normalizeFestival)
        .filter((f) => isFestivalLive(f))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [festivals]
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    // Calculate approximate active index
    const cardWidth = el.querySelector("[data-fcard]")?.clientWidth || 320;
    const currentIdx = Math.round(el.scrollLeft / (cardWidth + 20));
    setActiveIndex(Math.min(currentIdx, Math.max(0, list.length - 1)));
  }, [list.length]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  };

  const scrollToCard = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-fcard]"));
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  };

  // Auto-scroll logic (pauses seamlessly on hover or touch interaction)
  useEffect(() => {
    if (list.length < 2) return;
    const el = scrollerRef.current;
    if (!el) return;

    let userInteracting = false;
    const pause = () => { userInteracting = true; };
    const resume = () => { userInteracting = false; };

    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("scroll", checkScroll, { passive: true });

    const interval = setInterval(() => {
      if (userInteracting) return;
      const left = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (left >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-fcard]"));
        const elRect = el.getBoundingClientRect();
        const next = cards.find((c) => {
          const cardLeft = c.getBoundingClientRect().left - elRect.left + left;
          return cardLeft > left + 15;
        });

        if (next) {
          const nextLeft = next.getBoundingClientRect().left - elRect.left + left;
          el.scrollTo({ left: nextLeft, behavior: "smooth" });
        } else {
          el.scrollTo({ left: 0, behavior: "smooth" });
        }
      }
    }, 4500);

    return () => {
      clearInterval(interval);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("scroll", checkScroll);
    };
  }, [list.length, checkScroll]);

  if (list.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-transparent relative overflow-hidden border-b border-amber-200/50 dark:border-slate-800">
      {/* Background Sacred Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header with Badge & Interactive Nav Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300/60 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Auspicious Vaishnava Utsavas</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
              Upcoming Festivals &amp; Celebrations
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Experience transcendental joy with grand deity abhishekams, ecstatic kirtans, discourses, 56 bhoga offerings, and special prasadam feasts.
            </p>
          </div>

          {/* Controls: Carousel Arrows & Saffron View All Link */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={() => scrollBy("left")}
                disabled={!canScrollLeft}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Previous festival"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollBy("right")}
                disabled={!canScrollRight}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Next festival"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Link
              to="/festivals"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Horizontally Scrollable Festival Cards */}
        <div
          ref={scrollerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {list.map((f) => (
            <div
              key={f.id}
              data-fcard
              className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[340px] lg:w-[calc((100%-3rem)/3)] transition-transform duration-300"
            >
              <FestivalCard f={f} />
            </div>
          ))}
        </div>

        {/* Dot Pagination Indicator */}
        {list.length > 3 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {list.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToCard(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? "w-8 bg-amber-600 dark:bg-amber-400" : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                title={`Go to festival ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
