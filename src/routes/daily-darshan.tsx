import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, DailyDarshanItem } from "@/context/AdminContext";
import { 
  Sun, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  Share2, 
  Download, 
  Maximize2, 
  X, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  Heart, 
  Flame, 
  Check, 
  ArrowUpRight,
  Filter,
  Eye,
  Camera,
  Layers,
  Play,
  Pause,
  LayoutGrid,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/daily-darshan")({
  head: () => ({
    meta: [
      { title: "Daily Darshan — ISKCON Kurnool Digital Temple" },
      { 
        name: "description", 
        content: "Experience today's divine daily deity darshan carousel of Sri Sri Jagannath, Baladeva, Subhadra Maharani and Sri Sri Radha Govinda at ISKCON Kurnool. Updated daily with multi-photo sringara carousels and auto-scrolling archives." 
      },
    ],
  }),
  component: DailyDarshanPage,
});

function formatDarshanDate(isoDate: string): { fullDate: string; dayOfWeek: string; relativeLabel: string } {
  try {
    const parts = isoDate.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);

    const fullDate = d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });

    // Relative check (Today / Yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
    let relativeLabel = "";
    if (diffDays === 0) relativeLabel = "Today's Darshan";
    else if (diffDays === 1) relativeLabel = "Yesterday's Darshan";
    else if (diffDays > 1 && diffDays <= 7) relativeLabel = `${diffDays} days ago`;

    return { fullDate, dayOfWeek, relativeLabel };
  } catch {
    return { fullDate: isoDate, dayOfWeek: "", relativeLabel: "" };
  }
}

/**
 * Premium Devotional Image Carousel for Daily Darshan Showcase
 */
function DarshanImageCarousel({
  images,
  title,
  photographerCredit,
  onOpenFullscreen,
}: {
  images: string[];
  title: string;
  photographerCredit?: string;
  onOpenFullscreen: (index: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reset index if image list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying || isHovered || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const currentImg = images[currentIndex] || images[0] || "";

  return (
    <div 
      className="space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Showcase Frame */}
      <div 
        className="relative group rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-4 border-white ring-1 ring-amber-300/60 aspect-[4/3] md:aspect-[16/10] max-h-[640px] flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={currentImg}
            alt={`${title} - Photo ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full h-full object-contain max-h-[640px] cursor-zoom-in"
            onClick={() => onOpenFullscreen(currentIndex)}
            loading="eager"
          />
        </AnimatePresence>

        {/* Top-Right Floating Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {images.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer border border-white/10"
              title={isPlaying ? "Pause auto-slide" : "Play auto-slide"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-green-400 fill-green-400" />
                  <span className="hidden sm:inline">Auto</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onOpenFullscreen(currentIndex)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer border border-white/10"
            title="Open Fullscreen View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        {/* Top-Left Photo Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-20 bg-black/65 backdrop-blur-md text-white font-sans text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-lg flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            <span>{currentIndex + 1} / {images.length} Photos</span>
          </div>
        )}

        {/* Bottom-Left Image Credit */}
        {photographerCredit && (
          <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-sans px-3 py-1 rounded-full pointer-events-none border border-white/10">
            📷 {photographerCredit}
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md grid place-items-center shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md grid place-items-center shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Next Photo"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Bottom Progress / Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-2 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer ${
                  idx === currentIndex
                    ? "w-8 bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-500/50"
                    : "w-2.5 bg-white/40 hover:bg-white/80 border border-black/10"
                }`}
                aria-label={`Jump to photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Thumbnail Filmstrip (for multiple photos) */}
      {images.length > 1 && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-amber-200/80 shadow-sm flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-200">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
            <Layers className="h-3.5 w-3.5 text-accent" /> Carousel Gallery:
          </span>
          <div className="flex items-center gap-2.5">
            {images.map((imgUrl, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-16 w-20 sm:h-20 sm:w-24 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "ring-3 ring-amber-500 scale-105 shadow-md shadow-amber-500/20"
                      : "opacity-70 hover:opacity-100 hover:ring-2 hover:ring-amber-300 border border-slate-200"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white font-sans text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getYouTubeVideoId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

function DailyDarshanPage() {
  const { dailyDarshan } = useAdmin();
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Published entries sorted chronologically (newest first)
  const publishedEntries = useMemo(() => {
    const list = (dailyDarshan.entries || []).filter((e) => e.published !== false);
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyDarshan.entries]);

  // Determine current active showcase entry (defaults to newest entry)
  const activeDarshan: DailyDarshanItem | undefined = useMemo(() => {
    return publishedEntries[0];
  }, [publishedEntries]);

  // All images for active darshan (main + additional)
  const activeImages: string[] = useMemo(() => {
    if (!activeDarshan) return [];
    const set = new Set<string>();
    if (activeDarshan.imageUrl) set.add(activeDarshan.imageUrl);
    if (activeDarshan.additionalImages) {
      activeDarshan.additionalImages.forEach((img) => {
        if (img) set.add(img);
      });
    }
    return Array.from(set);
  }, [activeDarshan]);

  // Fullscreen Keyboard Navigation
  useEffect(() => {
    if (fullscreenIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreenIndex(null);
      } else if (e.key === "ArrowLeft") {
        setFullscreenIndex((prev) => (prev !== null ? (prev - 1 + activeImages.length) % activeImages.length : 0));
      } else if (e.key === "ArrowRight") {
        setFullscreenIndex((prev) => (prev !== null ? (prev + 1) % activeImages.length : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenIndex, activeImages.length]);

  const handleShare = async (item: DailyDarshanItem) => {
    const { fullDate } = formatDarshanDate(item.date);
    const shareText = `🪷 Today's Divine Daily Darshan (${fullDate}) from ISKCON Kurnool:\n\n*${item.title}*\n\nView high-resolution Darshan carousel & blessings:\n${window.location.origin}/daily-darshan`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Darshan - ${fullDate} | ISKCON Kurnool`,
          text: shareText,
          url: `${window.location.origin}/daily-darshan`,
        });
      } catch {
        copyShareLink(shareText);
      }
    } else {
      copyShareLink(shareText);
    }
  };

  const copyShareLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Darshan share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (imageUrl: string, title: string, date: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.download = `ISKCON_Kurnool_Daily_Darshan_${date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Opening high-resolution Darshan image");
  };

  return (
    <SiteLayout>
      {/* Page Hero Header */}
      <PageHero
        eyebrow={dailyDarshan.badgeText || "Nitya Darshan • Daily Deity Darshan"}
        title="Daily Darshan"
        subtitle={dailyDarshan.headerSubtitle || "Behold the transcendental beauty and divine blessings of Sri Sri Jagannath Baladev Subhadra at ISKCON Kurnool."}
        pageKey="darshan"
      />

      {/* Main Content Area */}
      <main className="bg-gradient-to-b from-[#fffdf5] via-[#fefaf0] to-[#ffffff] min-h-screen py-10 md:py-16 relative overflow-hidden">
        
        {/* Soft Sacred Glow Graphics */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-400/10 via-orange-300/10 to-yellow-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">

          {/* Morning Notice Banner */}
          {dailyDarshan.noticeBanner && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Daily Worship Update
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 font-medium mt-0.5">
                    {dailyDarshan.noticeBanner}
                  </p>
                </div>
              </div>
              <Link
                to="/temple"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors shrink-0 bg-white/70 px-4 py-2 rounded-xl border border-amber-200 shadow-2xs"
              >
                <Clock className="h-3.5 w-3.5" /> Aarti Timings Schedule
              </Link>
            </div>
          )}

          {/* YouTube Live Darshan Broadcast (Conditional) */}
          {dailyDarshan.liveYoutubeUrl && (
            <div className="bg-white rounded-3xl border-4 border-white ring-1 ring-red-500/20 shadow-elegant overflow-hidden transition-all duration-300">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-4 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <h3 className="font-display font-extrabold text-sm sm:text-base tracking-widest uppercase">
                    LIVE Darshan Telecast
                  </h3>
                </div>
                <span className="bg-white/20 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20">
                  YouTube Broadcast
                </span>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(dailyDarshan.liveYoutubeUrl)}?autoplay=1&mute=0`}
                  title="LIVE Daily Darshan YouTube Broadcast"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* SECTION 1: PROMINENT FEATURED / TODAY'S DARSHAN SHOWCASE (CAROUSEL) */}
          {activeDarshan ? (
            <section id="today-darshan-showcase" className="scroll-mt-24 space-y-6">
              {(() => {
                const { fullDate, dayOfWeek, relativeLabel } = formatDarshanDate(activeDarshan.date);

                return (
                  <div className="bg-white rounded-3xl border border-amber-200/80 shadow-elegant overflow-hidden transition-all duration-300">
                    
                    {/* Header Bar */}
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 px-6 py-5 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            Today's Deity Darshan
                          </span>

                          {dayOfWeek && (
                            <span className="text-xs font-semibold text-muted-foreground font-sans">
                              {dayOfWeek}
                            </span>
                          )}

                          {activeImages.length > 1 && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                              <Layers className="h-3 w-3" /> {activeImages.length} Photos Carousel
                            </span>
                          )}
                        </div>

                        {/* Formatted Date Clearly Visible */}
                        <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-primary tracking-tight pt-1">
                          {fullDate}
                        </h2>
                      </div>

                      {/* Quick Share / Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => handleShare(activeDarshan)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-foreground text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          title="Share Today's Darshan"
                        >
                          <Share2 className="h-3.5 w-3.5 text-accent" />
                          <span>{copied ? "Copied!" : "Share Darshan"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Image Carousel Container */}
                    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-amber-50/20 to-white">
                      <DarshanImageCarousel
                        images={activeImages}
                        title={activeDarshan.title}
                        photographerCredit={activeDarshan.photographerCredit}
                        onOpenFullscreen={(idx) => setFullscreenIndex(idx)}
                      />
                    </div>

                    {/* Darshan Details & Caption Section */}
                    <div className="p-6 sm:p-8 border-t border-amber-100 bg-white space-y-6">
                      
                      {/* Title & Official Source CTA */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold font-sans uppercase tracking-widest text-accent flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5" /> Deity Alankara & Sringara
                          </span>
                          <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                            {activeDarshan.title}
                          </h3>
                        </div>

                        {/* Official Source Button */}
                        {activeDarshan.officialSourceUrl && (
                          <div className="shrink-0 flex items-center gap-3">
                            <a
                              href={activeDarshan.officialSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                              <span>View Official Source</span>
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Description / Sloka / Caption */}
                      {activeDarshan.description && (
                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border border-amber-500/20 text-foreground/90 leading-relaxed font-sans text-sm sm:text-base space-y-2">
                          <p className="whitespace-pre-line font-medium">
                            {activeDarshan.description}
                          </p>
                        </div>
                      )}

                      {/* Secondary CTAs Toolbar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-3">
                          {activeDarshan.officialSourceName && (
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                              Source: <strong className="text-foreground">{activeDarshan.officialSourceName}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleDownload(activeImages[0] || activeDarshan.imageUrl, activeDarshan.title, activeDarshan.date)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border hover:bg-slate-50 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5 text-primary" /> Download Photo
                          </button>

                          <Link
                            to="/donate"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-primary font-bold text-xs transition-colors"
                          >
                            <Heart className="h-3.5 w-3.5 text-accent fill-accent" /> Sponsor Pushpalankara Seva
                          </Link>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}
            </section>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-border space-y-4">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-display text-2xl font-bold text-primary">No Darshan Published Yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                The temple administration will publish today's Darshan photos shortly after morning worship.
              </p>
            </div>
          )}

          {/* Devotional Quote Footer Box */}
          <section className="rounded-3xl bg-gradient-to-r from-purple-900 via-primary to-purple-950 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden text-center space-y-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Sparkles className="h-3.5 w-3.5" /> Sacred Darshan Mahatmyam
            </span>
            <blockquote className="font-display italic text-lg sm:text-2xl text-amber-100 max-w-2xl mx-auto leading-relaxed">
              “Simply by taking the merciful darshan of Sri Sri Jagannath, Baladeva, and Subhadra Maharani on the altar, the conditioned soul is purified of all sins and awakens love for God.”
            </blockquote>
            <p className="text-xs sm:text-sm text-white/70 font-sans tracking-wide">
              — Sri Chaitanya Charitamrita
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/temple"
                className="px-6 py-3 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-gold"
              >
                Plan Your Temple Visit
              </Link>
              <Link
                to="/donate"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs transition-colors"
              >
                Offer Seva
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Fullscreen Multi-Photo Lightbox Carousel Modal */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none"
            onClick={() => setFullscreenIndex(null)}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between z-20" onClick={(e) => e.stopPropagation()}>
              <div className="text-white/80 text-xs font-sans font-semibold flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full">
                  {fullscreenIndex + 1} / {activeImages.length}
                </span>
                <span className="truncate max-w-xs sm:max-w-md text-white font-display text-sm font-bold">
                  {activeDarshan?.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activeImages[fullscreenIndex], activeDarshan?.title || "Darshan", activeDarshan?.date || "")}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Download Current Photo"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setFullscreenIndex(null)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close Fullscreen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Fullscreen Image Area with Navigation Arrows */}
            <div 
              className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeImages.length > 1 && (
                <button
                  onClick={() => setFullscreenIndex((fullscreenIndex - 1 + activeImages.length) % activeImages.length)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md grid place-items-center border border-white/20 shadow-2xl cursor-pointer"
                  title="Previous Photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImages[fullscreenIndex]}
                  src={activeImages[fullscreenIndex]}
                  alt="Deity Darshan Fullscreen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl ring-2 ring-amber-400/50"
                />
              </AnimatePresence>

              {activeImages.length > 1 && (
                <button
                  onClick={() => setFullscreenIndex((fullscreenIndex + 1) % activeImages.length)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md grid place-items-center border border-white/20 shadow-2xl cursor-pointer"
                  title="Next Photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip in Fullscreen */}
            {activeImages.length > 1 && (
              <div 
                className="w-full flex justify-center items-center gap-2 overflow-x-auto py-2 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {activeImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFullscreenIndex(idx)}
                    className={`h-12 w-16 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                      idx === fullscreenIndex
                        ? "ring-2 ring-amber-400 scale-110 shadow-lg"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
