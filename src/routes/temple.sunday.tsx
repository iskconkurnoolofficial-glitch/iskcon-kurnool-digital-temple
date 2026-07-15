import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { Calendar, Clock, MapPin, Sparkles, Navigation, Link as LinkIcon, Heart, Sunrise, Sun, Sunset, Music, BookOpen, Soup, Flame, Utensils } from "lucide-react";
import { isTimeStrLive } from "@/lib/scheduleUtils";

function getProgramIcon(program: string) {
  const name = program.toLowerCase();
  if (name.includes("sankirtan") || name.includes("kirtan") || name.includes("singing") || name.includes("chanting")) {
    return { icon: Music, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-100" };
  }
  if (name.includes("gita") || name.includes("pravachanam") || name.includes("lecture") || name.includes("class") || name.includes("discourse")) {
    return { icon: BookOpen, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100" };
  }
  if (name.includes("arati") || name.includes("harati") || name.includes("darshan")) {
    return { icon: Sun, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-100" };
  }
  if (name.includes("prasada") || name.includes("feast") || name.includes("vitaran") || name.includes("distrib")) {
    return { icon: Soup, color: "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-100" };
  }
  if (name.includes("sudarshana") || name.includes("ashirvadam") || name.includes("blessing")) {
    return { icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100" };
  }
  return { icon: Clock, color: "text-primary bg-purple-50 dark:bg-purple-950/30 border-purple-100" };
}

export const Route = createFileRoute("/temple/sunday")({
  head: () => ({
    meta: [
      { title: "Sunday Feast Program — ISKCON Kurnool" },
      { name: "description", content: "Join ISKCON Kurnool every Sunday for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome." },
      { property: "og:title", content: "Sunday Feast Program — ISKCON Kurnool" },
      { property: "og:description", content: "Join us every Sunday for uplifting kirtan, spiritual discussions, and free prasadam feast. Everyone is welcome." },
    ],
  }),
  component: SundayPage,
});

const defaultGallery = [
  {
    id: "dsg1",
    url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
    label: "Devotional Kirtan Chanting"
  },
  {
    id: "dsg2",
    url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
    label: "Sunday Feast Discourses"
  },
  {
    id: "dsg3",
    url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
    label: "Serving Devotees Delicious Prasadam"
  }
];

const icons = [Music, BookOpen, Flame, Sparkles, Utensils, Heart];

function SundayPage() {
  const { sunday, settings } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const scheduleList = sunday.schedule || [];

  // Group schedule items by time to display multiple programs under the same time slot neatly.
  const groupedSchedule: { time: string; programs: string[] }[] = [];
  scheduleList.forEach((item) => {
    const existing = groupedSchedule.find(
      (g) => g.time.trim().toLowerCase() === item.time.trim().toLowerCase()
    );
    if (existing) {
      existing.programs.push(item.program);
    } else {
      groupedSchedule.push({ time: item.time, programs: [item.program] });
    }
  });

  const gallery = sunday.gallery && sunday.gallery.length > 0 ? sunday.gallery : defaultGallery;
  const customButtons = sunday.buttons || [];
  const logoUrl = sunday.logo || settings.logo;

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Worship & Feast" 
        title="Sunday Feast Program" 
        subtitle="Experience a spiritually uplifting Sunday at ISKCON Kurnool." 
        pageKey="sunday" 
      />

      {/* Description & Custom Buttons */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 animate-fade-up">
          <div className="bg-[#fdf6ec] border-2 border-secondary/40 rounded-3xl p-8 md:p-10 shadow-gold relative overflow-hidden max-w-3xl mx-auto">
            <span className="absolute top-2 left-4 text-7xl text-secondary/20 font-serif select-none pointer-events-none">“</span>
            <p className="text-primary font-display italic text-xl md:text-2xl leading-relaxed relative z-10 font-medium">
              {sunday.description || "Experience a spiritually uplifting Sunday at ISKCON Kurnool. Join devotees for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome."}
            </p>
            <span className="absolute bottom-2 right-4 text-7xl text-secondary/20 font-serif select-none pointer-events-none">”</span>
          </div>

          {customButtons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {customButtons.map((btn) => (
                <a
                  key={btn.id}
                  href={btn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 shadow-md hover:scale-[1.02] transition"
                >
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  {btn.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Weekly Schedule Section */}
      <section className="py-16 bg-surface border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="h-3.5 w-3.5" /> Weekly
            </span>
            <h2 className="font-display text-3xl font-bold text-primary">
              {sunday.scheduleTitle || "Weekly Schedule (Every Sunday)"}
            </h2>
            <div className="h-1 w-20 bg-secondary mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Timings List */}
            <div className="lg:col-span-7">
              {groupedSchedule.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No schedule details updated yet. Check back soon!</p>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant animate-fade-up">
                  <div className="divide-y divide-border/60">
                    {groupedSchedule.map((group, i) => {
                      const { icon: Icon, color: iconColor } = getProgramIcon(group.programs.join(" "));
                      const isLive = isTimeStrLive(group.time, 0); // 0 = Sunday
                      return (
                        <div 
                          key={group.time || i} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 transition-colors hover:bg-muted/30 ${
                            isLive 
                              ? "bg-red-55/40 border-l-4 border-red-500 pl-5" 
                              : i % 2 === 0 
                                ? "bg-white" 
                                : "bg-background/20"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${iconColor}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {group.programs.length === 1 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-foreground text-lg">{group.programs[0]}</h4>
                                  {isLive && (
                                    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1.5 py-1">
                                  {group.programs.map((prog, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                      <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-semibold text-foreground text-lg leading-tight">{prog}</h4>
                                        {isLive && idx === 0 && (
                                          <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mt-0.5">Sunday Program</span>
                            </div>
                          </div>
                          <div className="flex items-center self-start sm:self-center shrink-0">
                            <span className={`font-sans font-semibold text-base sm:text-lg border px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap transition-colors ${
                              isLive 
                                ? "text-red-600 bg-red-50/50 border-red-200" 
                                : "text-accent bg-surface/40 border-secondary/20"
                            }`}>
                              {group.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-5 animate-fade-up">
              <div className="relative group rounded-3xl overflow-hidden border-4 border-white shadow-elegant aspect-[4/3] lg:aspect-[1/1] xl:aspect-[4/3] bg-muted">
                <img 
                  src={sunday.timingsImage || "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80"} 
                  alt="Sunday Feast Timings" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sunday Feast Activities Cards Section */}
      <section className="py-16 bg-background border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Highlights
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              Sunday Feast Activities
            </h2>
            <p className="text-[#6b5c54] mt-2 font-sans text-sm md:text-base">
              Explore the sequential highlights of our Sunday gathering
            </p>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full mt-4" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-10 max-w-6xl mx-auto">
            {(sunday.activities || []).map((card, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div 
                  key={card.id || i} 
                  className="group bg-white rounded-3xl p-6 border border-border hover:border-primary/20 shadow-[0_8px_30px_rgba(91,44,155,0.03)] hover:shadow-elegant hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative overflow-hidden w-full md:w-[calc(50%-20px)] lg:w-[calc(33.333%-27px)] max-w-[380px]"
                >
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-primary font-display font-bold text-xs px-3 py-1 rounded-full border border-primary/10 shadow-sm z-10 transition-transform duration-300 group-hover:scale-105">
                    Activity 0{i + 1}
                  </div>

                  {card.image ? (
                    <div className="w-full rounded-2xl overflow-hidden mb-5 relative">
                      <img 
                        src={card.image} 
                        alt={card.title} 
                        className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center mb-5 rounded-2xl border border-primary/5 relative overflow-hidden transition-all duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(#5b2c9b_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
                      <div className="p-4 rounded-2xl bg-white text-accent shadow-sm border border-secondary/20 transition-transform duration-500 group-hover:scale-110">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col items-center">
                    <h3 className="font-display font-bold text-lg md:text-xl text-primary mb-3 leading-tight min-h-[56px] flex items-center justify-center text-center group-hover:text-accent transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-[#6b5c54] font-sans text-sm md:text-base leading-relaxed flex-1 text-center">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Auto-scrolling Gallery Section */}
      <section className="py-16 md:py-20 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-accent font-bold mb-2">
            <Sparkles className="h-4 w-4" /> Photos
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Sunday Moments</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
            A glimpse into the vibrant Sunday celebrations at ISKCON Kurnool.
          </p>
        </div>

        <div className="space-y-6">
          <AutoGallery images={gallery} direction="left" />
          <AutoGallery images={[...gallery].reverse()} direction="right" />
        </div>
      </section>

      {/* Visit ISKCON Kurnool Section */}
      <section className="py-16 bg-background border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-soft border border-border shadow-elegant overflow-hidden p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Left Side: Logo */}
              <div className="md:col-span-4 flex justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="ISKCON Kurnool"
                    className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover ring-4 ring-secondary/50 shadow-glow animate-fade-in"
                  />
                ) : (
                  <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-3xl md:text-4xl shadow-glow">
                    IK
                  </div>
                )}
              </div>

              {/* Right Side: Address & Directions */}
              <div className="md:col-span-8 space-y-6 text-center md:text-left">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                    <Heart className="h-6 w-6 text-accent shrink-0" />
                    {sunday.visitTitle || "Visit ISKCON Kurnool"}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {sunday.visitDescription || "Experience peace, devotion, and spiritual happiness. We warmly welcome you and your family every Sunday."}
                  </p>
                </div>

                <div className="flex items-start justify-center md:justify-start gap-3 text-left">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-accent" />
                  <p className="whitespace-pre-line text-sm md:text-base leading-relaxed font-sans font-medium text-foreground">
                    {sunday.address || "ISKCON Kurnool\nSri Sri Puri Jagannath Temple\nKurnool, Andhra Pradesh\nIndia"}
                  </p>
                </div>

                {sunday.directionsUrl && (
                  <a
                    href={sunday.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold transition hover:scale-[1.03]"
                  >
                    <Navigation className="h-4 w-4 shrink-0" />
                    Get Directions
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function AutoGallery({ images, direction = "left" }: { images: SundayGalleryItem[]; direction?: "left" | "right" }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        if (direction === "left") {
          track.scrollLeft += 0.7;
          const half = track.scrollWidth / 2;
          if (track.scrollLeft >= half) track.scrollLeft -= half;
        } else {
          track.scrollLeft -= 0.7;
          const half = track.scrollWidth / 2;
          if (track.scrollLeft <= 0) track.scrollLeft = half;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [images.length, direction]);

  const loop = [...images, ...images];

  return (
    <div
      ref={trackRef}
      className="flex gap-4 sm:gap-6 overflow-x-hidden py-4 cursor-grab select-none"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {loop.map((img, i) => (
        <div key={img.id + "-" + i} className="shrink-0 w-64 sm:w-72 md:w-80 group">
          <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white aspect-[4/3] relative">
            <img 
              src={img.url} 
              alt={img.label} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            {img.label && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs sm:text-sm font-medium font-sans leading-tight">{img.label}</p>
              </div>
            )}
          </div>
          {img.label && (
            <p className="text-center text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary transition duration-300 block md:hidden">
              {img.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
