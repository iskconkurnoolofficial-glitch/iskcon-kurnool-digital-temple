import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import {
  Sparkles,
  ArrowRight,
  Camera,
  Baby
} from "lucide-react";

export default function HomePrahladaBadiSection() {
  const { prahladaBadi, heroBanners } = useAdmin();

  // Retrieve Prahlada Badi hero banner image, fallback if not explicitly set
  const heroBannerImage =
    heroBanners?.prahladaBadi ||
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";

  const isRegOpen = prahladaBadi?.regStatus === "Open";

  // Gather photos from prahladaBadi gallery
  const prahladaGallery = useMemo(() => {
    const list: { id: string; url: string; label?: string }[] = [];
    if (prahladaBadi?.gallery && Array.isArray(prahladaBadi.gallery)) {
      prahladaBadi.gallery.forEach((g, idx) => {
        if (g.url) list.push({ id: g.id || `g_${idx}`, url: g.url, label: g.label || "Prahlada Badi Activity" });
      });
    }
    if (list.length < 4) {
      const defaults = [
        { id: "g1", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80", label: "Art & Drawing Classes" },
        { id: "g2", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", label: "Storytelling & Values" },
        { id: "g3", url: "https://images.unsplash.com/photo-1460518451285-cd7afbc11b0b?auto=format&fit=crop&w=800&q=80", label: "Music & Devotional Songs" },
        { id: "g4", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80", label: "Joyful Group Activities" }
      ];
      defaults.forEach((def) => {
        if (!list.some((it) => it.url === def.url)) list.push(def);
      });
    }
    return list;
  }, [prahladaBadi?.gallery]);

  // Repeated list for continuous 1-line non-stop marquee loop
  const marqueeImages = useMemo(() => {
    return [...prahladaGallery, ...prahladaGallery, ...prahladaGallery, ...prahladaGallery];
  }, [prahladaGallery]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#fffbf0] via-[#fef7e6] to-[#fff8eb] border-t border-b border-amber-200/60">
      {/* Background Sacred Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-28 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-28 w-96 h-96 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#d977060f_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Image Banner (Prahlada Badi Hero Banner Image) */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border-4 border-amber-300/70 bg-white shadow-2xl group hover:shadow-[0_25px_60px_-15px_rgba(217,119,6,0.3)] transition-all duration-500">
              {/* Image Banner */}
              <div className="relative aspect-[4/3] overflow-hidden bg-amber-100">
                <img
                  src={heroBannerImage}
                  alt="Sri Bhakta Prahlada Summer Training Classes — ISKCON Kurnool"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-400/40 shadow-md">
                  <Baby className="h-4 w-4 text-amber-400" />
                  <span>Sri Bhakta Prahlada Badi</span>
                </div>

                {/* Bottom Overlay Text */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block">
                    Kids Summer Program
                  </span>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                    Sri Bhakta Prahlada Summer Classes
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1">
                    Bhagavad Gita, Slokas, Music, Art, Drama &amp; Value Education
                  </p>
                </div>
              </div>

              {/* Bottom Info Bar inside Card */}
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-between font-bold text-xs sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Nurturing Values &amp; Confidence</span>
                </span>
                <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-slate-950 uppercase tracking-wider">
                  Age 5 – 15 Yrs
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: About Details & Action Buttons */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Prahlada Badi</span>
                </span>

                {isRegOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    Registrations Open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 border border-amber-400/40 text-xs font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Summer Batch 2027 Coming Soon
                  </span>
                )}
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
                Inspiring Young Minds with Timeless Values
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
              <strong>Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi</strong> is a special summer program organized at ISKCON Kurnool Temple to help children grow with spiritual wisdom, creativity, confidence, discipline, and strong moral values.
            </p>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-xl">🕉️</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Spiritual Wisdom</h4>
                  <p className="text-[11px] text-slate-500">Bhagavad Gita &amp; Slokas</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-xl">🎨</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Creativity &amp; Art</h4>
                  <p className="text-[11px] text-slate-500">Drama, drawing &amp; painting</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-xl">🎶</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Music &amp; Kirtan</h4>
                  <p className="text-[11px] text-slate-500">Devotional songs &amp; bhajans</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-xl">🤝</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Moral Values</h4>
                  <p className="text-[11px] text-slate-500">Confidence &amp; discipline</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/prahlada-badi"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-gold transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Explore Prahlada Badi</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isRegOpen && prahladaBadi?.registerUrl && (
                <a
                  href={prahladaBadi.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition hover:scale-105 cursor-pointer"
                >
                  <span>Register Child Now</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Single-Line Marquee Gallery Strip from Prahlada Badi */}
        {marqueeImages.length > 0 && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                <Camera className="h-3.5 w-3.5 text-amber-600" />
                <span>Prahlada Badi Moments</span>
              </span>
              <Link
                to="/prahlada-badi"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative w-full overflow-hidden mask-marquee py-2 group select-none">
              <div className="flex w-max animate-[marquee_35s_linear_infinite] gap-4 sm:gap-5 px-2 group-hover:[animation-play-state:paused] will-change-transform">
                {marqueeImages.map((img, idx) => (
                  <Link
                    key={`pb_home_strip_${img.id}_${idx}`}
                    to="/prahlada-badi"
                    className="group/item relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200/80 bg-white aspect-square h-44 sm:h-52 w-44 sm:w-52 shrink-0 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer block"
                  >
                    <img
                      src={img.url}
                      alt={img.label || "Prahlada Badi Activity"}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-2xl sm:rounded-3xl group-hover/item:scale-110 transition-transform duration-500"
                    />
                    {img.label && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-left transition-all duration-300">
                        <span className="text-white text-xs font-extrabold block truncate drop-shadow-xs">
                          {img.label}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
