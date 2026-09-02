import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";
import { ChevronRight, ImageIcon } from "lucide-react";
import { useRef } from "react";

export default function HomeGallery() {
  const { photos } = useAdmin();
  const list = photos.slice(0, 6);
  const marqueeImages = [...list, ...list];
  
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const rotateLeft = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateYLeft = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const translateYRight = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#02050c] via-[#071324] to-[#010307] border-t border-white/5"
    >
      {/* Two-sided rotating mandala scroll decoration */}
      <motion.img
        style={{ y: translateYLeft }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        src="/mandala.png"
        alt="Mandala Left"
        className="absolute -left-24 sm:-left-32 md:-left-44 top-[10%] w-48 sm:w-64 md:w-80 lg:w-[380px] h-auto opacity-75 pointer-events-none select-none filter drop-shadow-[0_0_50px_rgba(232,103,12,0.2)]"
      />
      <motion.img
        style={{ y: translateYRight }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        src="/mandala.png"
        alt="Mandala Right"
        className="absolute -right-24 sm:-right-32 md:-right-44 bottom-[10%] w-48 sm:w-64 md:w-80 lg:w-[380px] h-auto opacity-75 pointer-events-none select-none filter drop-shadow-[0_0_50px_rgba(232,103,12,0.2)]"
      />

      {/* Premium subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Modern mesh-like glowing backdrops with deep sky-blue styling */}
      <div className="absolute -top-24 left-1/4 h-[350px] w-[350px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-12 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 left-10 h-[250px] w-[250px] rounded-full bg-[#38bdf8]/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center gap-3 text-xs uppercase tracking-[0.34em] text-secondary font-semibold">
            <span className="h-px w-10 bg-secondary/30" />
            Temple Gallery
            <span className="h-px w-10 bg-secondary/30" />
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-5 tracking-tight">
            ISKCON Kurnool Gallery
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
                <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-5 px-2 py-8 sm:gap-6 sm:px-4 sm:py-10 md:px-6 group-hover:[animation-play-state:paused] will-change-transform">
                  {marqueeImages.map((photo, index) => (
                    <article
                      key={`${photo.id}-${index}`}
                      className="relative min-w-[220px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-secondary/40 hover:shadow-[0_20px_50px_rgba(232,103,12,0.15)] group/card"
                    >
                      <img
                        src={getOptimizedCloudinaryUrl(photo.url, "card")}
                        alt={photo.title || "Sacred Darshan"}
                        loading="lazy"
                        decoding="async"
                        className="h-[240px] w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 sm:h-[300px] md:h-[340px] lg:h-[360px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex items-end p-5">
                        <div className="transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 ease-out">
                          <p className="text-white font-display font-semibold text-sm sm:text-base tracking-wide">{photo.title || "Sacred Darshan"}</p>
                          <p className="text-secondary text-[10px] sm:text-xs uppercase tracking-widest mt-1.5 font-medium">ISKCON Kurnool</p>
                        </div>
                      </div>
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
