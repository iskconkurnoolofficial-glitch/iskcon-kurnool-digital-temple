import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { Heart, MapPin, X, ChevronLeft, ChevronRight, MessageSquareHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/goshala")({
  head: () => ({ 
    meta: [
      { title: "Goshala Seva — ISKCON Kurnool" },
      { name: "description", content: "Sacred cow protection (Go-Seva) by ISKCON Kurnool. Caring for Mother Cow with love, shelter, and proper nourishment." },
    ]
  }),
  component: Page,
});

function Page() {
  const { goshala } = useAdmin();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const galleryList = goshala.gallery || [];
  
  // Duplicate gallery items to ensure a seamless marquee loop
  const marqueeImages = [...galleryList, ...galleryList, ...galleryList, ...galleryList];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % galleryList.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + galleryList.length) % galleryList.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, galleryList.length]);

  return (
    <SiteLayout>
      <PageHero 
        eyebrow={goshala.eyebrow || "Go-Seva"} 
        title={goshala.title || "Goshala Seva"} 
        subtitle={goshala.subtitle || "Maintained by ISKCON Kurnool"} 
        pageKey="goshala" 
      >
        {goshala.buttonUrl && (
          <a
            href={goshala.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e65c00] to-[#ff9933] text-white font-semibold shadow-[0_4px_14px_rgba(230,92,0,0.35)] hover:shadow-[0_6px_20px_rgba(230,92,0,0.5)] hover:from-[#d35400] hover:to-[#e67e22] hover:-translate-y-0.5 transition duration-300 pointer-events-auto text-sm md:text-base"
          >
            <MapPin className="h-5 w-5 text-white" />
            {goshala.buttonLabel || "Visit Goshala"}
          </a>
        )}
      </PageHero>

      {/* Intro Section with Quote */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-elegant border border-primary/5 flex flex-col md:flex-row items-center gap-8">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <MessageSquareHeart className="h-8 w-8 md:h-10 md:w-10 animate-pulse text-primary" />
            </div>
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-widest text-accent font-semibold">Vedic Wisdom</div>
              <p className="font-display text-lg md:text-2xl text-foreground italic leading-relaxed font-medium">
                "{goshala.aboutText1}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-6">


          <div className="text-center mb-12">
            <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Moments of Go-Seva</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Goshala Gallery</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Visual glimpses of care, nourishment, and devotional service offered to cows at the Goshala.
            </p>
          </div>

          {galleryList.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
              No photos added to the gallery yet. Check back soon.
            </div>
          ) : (
            <div className="group overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
              <div className="relative overflow-hidden">
                {/* Horizontal Marquee Animation (Linear infinite loop, pauses on hover) */}
                <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-6 px-4 py-8 group-hover:[animation-play-state:paused] will-change-transform">
                  {marqueeImages.map((photo, idx) => (
                    <div
                      key={`${photo.id}-${idx}`}
                      onClick={() => setLightbox(idx % galleryList.length)}
                      className="shrink-0 w-[240px] sm:w-[320px] md:w-[380px] aspect-[4/3] rounded-2xl overflow-hidden shadow-elegant border bg-white relative group cursor-pointer transform transition duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.label} 
                        loading="lazy" 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out select-none" 
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 animate-fade-in" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Devotional Service & CTA Section */}
      <section className="py-16 md:py-24 bg-background border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
                <Heart className="h-4 w-4 fill-primary/10 text-primary" /> Devotional Service
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
                An Extension of Our Devotion
              </h3>
              <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed">
                <p>{goshala.aboutText2}</p>
                <p className="font-semibold text-foreground/90">{goshala.aboutText3}</p>
              </div>
              
              {goshala.buttonUrl && (
                <div className="pt-4">
                  <a
                    href={goshala.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#e65c00] to-[#ff9933] text-white font-semibold shadow-[0_4px_14px_rgba(230,92,0,0.35)] hover:shadow-[0_6px_20px_rgba(230,92,0,0.5)] hover:from-[#d35400] hover:to-[#e67e22] hover:-translate-y-0.5 transition duration-300"
                  >
                    <MapPin className="h-5 w-5 text-white" />
                    {goshala.buttonLabel || "Visit Goshala"}
                  </a>
                </div>
              )}
            </div>

            {/* Right Card / Visual Column */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-primary to-accent opacity-30 blur-lg transition duration-500 group-hover:opacity-40"></div>
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-elegant border border-border/80">
                <img 
                  src={goshala.aboutImage || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80"} 
                  alt="Go protection" 
                  className="w-full aspect-[4/3] object-cover" 
                />
                <div className="p-8 space-y-4">
                  <h4 className="font-display text-xl font-bold text-primary">Support Cow Protection (Go-Seva)</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cow protection is considered one of the highest virtues in human society. By supporting the Goshala, you help provide shelter, fodder, medical care, and lifelong protection to these gentle creatures of the Lord.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent"></span> Proper Shelter
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent"></span> Organic Feed
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent"></span> Lifelong Care
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightbox !== null && galleryList[lightbox] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setLightbox(null)} 
              className="absolute top-6 right-6 text-white/80 hover:text-white transition p-2 bg-white/5 hover:bg-white/10 rounded-full focus:outline-none" 
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => setLightbox((i) => (i! - 1 + galleryList.length) % galleryList.length)} 
              className="absolute left-4 md:left-8 text-white/80 hover:text-white transition p-3 bg-white/5 hover:bg-white/10 rounded-full focus:outline-none" 
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            
            <button 
              onClick={() => setLightbox((i) => (i! + 1) % galleryList.length)} 
              className="absolute right-4 md:right-8 text-white/80 hover:text-white transition p-3 bg-white/5 hover:bg-white/10 rounded-full focus:outline-none" 
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            <motion.figure 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-6xl max-h-[85vh] flex flex-col items-center gap-4"
            >
              <img 
                src={galleryList[lightbox].url} 
                alt={galleryList[lightbox].label} 
                className="max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl" 
              />
              <figcaption className="text-white/95 text-center text-sm md:text-base font-medium px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                {galleryList[lightbox].label || "Mother Cow"}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}


