import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { ChevronRight, ImageIcon } from "lucide-react";

export default function HomeGallery() {
  const { photos } = useAdmin();
  const list = photos.slice(0, 6);
  const marqueeImages = [...list, ...list];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-b from-[#0f0a1c] via-[#1a0f33] to-[#0c0817] border-t border-white/5"
    >
      {/* Soft glowing decorations */}
      <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center justify-center gap-3 text-xs uppercase tracking-[0.34em] text-secondary font-semibold">
            <span className="h-px w-10 bg-secondary/30" />
            Temple Gallery
            <span className="h-px w-10 bg-secondary/30" />
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mt-5 tracking-tight">
            Cinematic Devotion
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            A graceful scroll of sacred imagery in a premium dark temple aesthetic.
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-14 text-center text-slate-300 shadow-[0_32px_120px_-70px_rgba(0,0,0,0.8)]">
            <ImageIcon className="mx-auto h-12 w-12 opacity-60" />
            <p className="mt-4 text-lg font-medium">No photos available.</p>
          </div>
        ) : (
          <>
            <div className="group overflow-hidden rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-md shadow-[0_35px_120px_-65px_rgba(0,0,0,0.5)]">
              <div className="relative overflow-hidden">
                <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-4 px-2 py-8 sm:gap-5 sm:px-4 sm:py-10 md:px-6 group-hover:[animation-play-state:paused] will-change-transform">
                  {marqueeImages.map((photo, index) => (
                    <article
                      key={`${photo.id}-${index}`}
                      className="relative min-w-[220px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px] flex-shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(0,0,0,0.7)]"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        loading="lazy"
                        className="h-[240px] w-full object-cover transition-transform duration-700 ease-out hover:scale-105 sm:h-[300px] md:h-[340px] lg:h-[360px]"
                      />
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#e8670c] px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_22px_90px_-24px_rgba(232,103,12,0.75)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_100px_-24px_rgba(232,103,12,0.95)]"
              >
                View More
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}
