import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import {
  Music,
  Sparkles,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Heart,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Flame,
  Camera
} from "lucide-react";

export default function HomeHarinamaSection() {
  const { harinama: h } = useAdmin();

  const whatsappUrl = h?.whatsappUrl || "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3";

  const defaultPhotos = [
    {
      id: "hn1",
      url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
      label: "Joyful Street Chanting in Kurnool"
    },
    {
      id: "hn2",
      url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
      label: "Ecstatic Mridanga & Karatalas"
    },
    {
      id: "hn3",
      url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
      label: "Procession through Town"
    }
  ];

  // Only display added images from admin (gallery & aboutImage)
  const galleryList = useMemo(() => {
    const list: { id: string; url: string; label?: string }[] = [];

    if (h?.gallery && Array.isArray(h.gallery) && h.gallery.length > 0) {
      h.gallery.forEach((g, idx) => {
        if (g.url && g.url.trim()) {
          list.push({ id: g.id || `g_${idx}`, url: g.url, label: g.label || "" });
        }
      });
    }

    if (h?.aboutImage && h.aboutImage.trim() && !list.some((p) => p.url === h.aboutImage)) {
      list.unshift({ id: "about_img", url: h.aboutImage, label: "" });
    }

    // Only fallback if literally zero images are added
    if (list.length === 0) {
      return defaultPhotos;
    }

    return list;
  }, [h?.gallery, h?.aboutImage]);

  // Duplicated for smooth non-stop continuous marquee loop
  const marqueePhotos = useMemo(() => {
    if (galleryList.length === 0) return [];
    const repeatCount = galleryList.length < 3 ? 6 : galleryList.length < 6 ? 4 : 3;
    const result: { id: string; url: string; label?: string }[] = [];
    for (let i = 0; i < repeatCount; i++) {
      result.push(...galleryList);
    }
    return result;
  }, [galleryList]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#fffbf2] via-[#fef3d8] to-[#fffdf9] border-t border-b border-amber-300/60">
      {/* Radiant Warm Gold Background Glows */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header Row with Badge & Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-950 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Flame className="h-3.5 w-3.5 text-amber-700" />
              <span>Yuga Dharma • Congregational Chanting</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
              Hari Nama Sankeerthana
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Chanting the transcendental holy names through the vibrant streets of Kurnool — awakening pure love of God, one Holy Name at a time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-end">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              <span>Join Next Sankeerthana</span>
            </a>

            <Link
              to="/harinama"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Modern Warm Gold Layout: Maha Mantra Shrine + Schedule Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (7 Cols): The Maha Mantra Golden Card */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-amber-900 via-amber-950 to-orange-950 p-6 sm:p-8 md:p-10 border-2 border-amber-400/40 text-white shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-extrabold flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span>The Supreme Benediction</span>
                </span>
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider px-3 py-0.5 rounded-full bg-white/15 border border-white/20">
                  Sri Sri Gaura Nitai
                </span>
              </div>

              <div className="py-2">
                <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-amber-200 leading-tight drop-shadow-md tracking-tight">
                  Hare Krishna Hare Krishna <br />
                  Krishna Krishna Hare Hare <br />
                  Hare Rama Hare Rama <br />
                  Rama Rama Hare Hare
                </p>
              </div>

              <p className="text-xs sm:text-sm text-amber-100/90 italic leading-relaxed font-sans">
                “In this age of Kali, there is no other way, no other way, no other way for spiritual deliverance than chanting the Holy Name of Lord Hari.” — Brihan-naradiya Purana
              </p>
            </div>

            {/* 3 Pillars of Sankeerthana */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
                  ✨ Citta-Mārjana
                </span>
                <p className="text-[11px] text-amber-100/80">Cleanses the heart of all accumulated dust.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
                  🌊 Ānanda-Vardhana
                </span>
                <p className="text-[11px] text-amber-100/80">Expands the boundless ocean of bliss.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
                  🌸 Sarvātma-Snapanam
                </span>
                <p className="text-[11px] text-amber-100/80">Bestows pure spiritual cooling for the soul.</p>
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Live Schedule & Procession Info */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border-2 border-amber-300/80 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-gold shrink-0">
                  <Music className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-800 block">
                    Weekly Procession
                  </span>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                    {h?.scheduleDay || "Every Saturday"} • {h?.scheduleTime || "5:00 PM onwards"}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 pt-1 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 block font-bold text-xs">Assembly Point:</strong>
                    {h?.meetingPoint || "Sri Sri Puri Jagannath Temple, ISKCON Kurnool"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Open to all families, youths &amp; town devotees</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Get Weekly Route Updates on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Continuous Non-Stop Auto-Marquee (Slow Speed, Only Added Images) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-900 font-extrabold">
              <Camera className="h-4 w-4 text-amber-600" />
              <span>Glimpses of Street Sankeerthana Processions</span>
            </div>

            <Link
              to="/harinama"
              className="text-xs font-bold text-amber-900 hover:text-orange-700 inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative w-full overflow-hidden mask-marquee py-2 group select-none">
            {/* Seamless Infinite Continuous Marquee Loop */}
            <div className="flex w-max animate-[marquee_55s_linear_infinite] gap-5 px-2 group-hover:[animation-play-state:paused] will-change-transform">
              {marqueePhotos.map((photo, idx) => (
                <div
                  key={`${photo.id}_${idx}`}
                  className="shrink-0 w-[240px] sm:w-[280px] md:w-[320px] relative rounded-3xl overflow-hidden shadow-lg border-2 border-amber-200/80 bg-white aspect-[16/10] group/card cursor-pointer hover:border-amber-400 transition-all duration-300"
                >
                  <img
                    src={photo.url}
                    alt={photo.label || "Hari Nama Sankeerthana"}
                    className="w-full h-full object-cover object-center group-hover/card:scale-108 transition-transform duration-700 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  {photo.label ? (
                    <div className="absolute bottom-3 left-3.5 right-3.5">
                      <span className="text-xs font-bold text-white drop-shadow-md line-clamp-1">
                        {photo.label}
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
