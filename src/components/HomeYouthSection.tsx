import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";
import {
  Users,
  Sparkles,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Music,
  Brain,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Instagram,
  Heart
} from "lucide-react";

export default function HomeYouthSection() {
  const { youth } = useAdmin();

  const isLive = isTimeStrLive(youth?.schedule || "6:30 PM – 8:30 PM", 6); // 6 = Saturday
  const whatsappUrl = youth?.whatsappUrl || "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3";

  // Gather photos from gallery and features
  const galleryPhotos = useMemo(() => {
    const list: { id: string; url: string; label?: string }[] = [];

    if (youth?.gallery && Array.isArray(youth.gallery)) {
      youth.gallery.forEach((g, idx) => {
        if (g.url) list.push({ id: g.id || `g_${idx}`, url: g.url, label: g.label || "Hare Krishna" });
      });
    }

    if (youth?.features && Array.isArray(youth.features)) {
      youth.features.forEach((f, idx) => {
        if (f.image && !list.some((it) => it.url === f.image)) {
          list.push({ id: `f_${idx}`, url: f.image, label: f.title || "Youth Activity" });
        }
      });
    }

    if (list.length < 4) {
      const defaults = [
        { id: "d1", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80", label: "Soulful Kirtan & Harinama" },
        { id: "d2", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", label: "Bhagavad Gita Youth Discourse" },
        { id: "d3", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80", label: "Spiritual Brotherhood & Satsang" },
        { id: "d4", url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80", label: "Youth Retreats & Outdoor Yatras" },
        { id: "d5", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80", label: "Mind Management & Meditation" },
        { id: "d6", url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80", label: "Sanctified Krishna Prasadam" }
      ];
      defaults.forEach((def) => {
        if (!list.some((it) => it.url === def.url)) list.push(def);
      });
    }

    return list;
  }, [youth?.gallery, youth?.features]);

  // Duplicate photos for seamless infinite non-stop marquee loop
  const marqueePhotos = useMemo(() => {
    return [...galleryPhotos, ...galleryPhotos, ...galleryPhotos];
  }, [galleryPhotos]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#180a2b] via-[#240e3f] to-[#120422] text-white border-t border-purple-500/20">
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>IYF Kurnool • Youth Empowerment</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              ISKCON Kurnool Youth Program
            </h2>

            <p className="text-purple-200/80 text-sm sm:text-base leading-relaxed">
              Empowering youth with timeless Bhagavad Gita wisdom, stress-free living, soul-stirring musical kirtans, adventurous yatras, and positive spiritual brotherhood.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-end">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              <span>Join WhatsApp Group</span>
            </a>

            <Link
              to="/youth"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <span>Explore Youth Program</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Highlight Schedule & Timing Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-gold">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300 block">
                Weekly Gathering
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                {youth?.schedule || "Every Saturday • 6:30 PM – 8:30 PM"}
              </h3>
              <p className="text-xs text-purple-200/80">
                {youth?.venue || "ISKCON Kurnool Temple Hall (For Boys & College Students)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse shadow-md">
                <span className="h-2 w-2 rounded-full bg-white" /> Live Session Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-purple-200 text-xs font-semibold border border-white/10">
                <Calendar className="h-3.5 w-3.5 text-amber-400" /> Every Saturday Evening
              </span>
            )}

            <Link
              to="/youth-yatra"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 hover:text-white text-xs font-bold border border-purple-400/40 transition cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5 text-amber-300" />
              <span>Youth Yatra</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Youth Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-purple-400/40 shadow-sm transition-all duration-300 space-y-3 group">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6 text-purple-300" />
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
              Mind &amp; Stress Management
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Practical scientific techniques from Bhagavad Gita to overcome distractions, anxiety, and sharpen mental clarity.
            </p>
          </div>

          <div className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-amber-400/40 shadow-sm transition-all duration-300 space-y-3 group">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Music className="h-6 w-6 text-amber-300" />
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
              Kirtan &amp; Musical Arts
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Hands-on learning of mridanga, harmonium, kartalas, and joyful congregational chanting of the holy names.
            </p>
          </div>

          <div className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-emerald-400/40 shadow-sm transition-all duration-300 space-y-3 group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6 text-emerald-300" />
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
              Youth Yatras &amp; Treks
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Spiritual retreats, holy dham pilgrimage tours, heritage expeditions, camping, and unforgettable bonding.
            </p>
          </div>

          <div className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-orange-400/40 shadow-sm transition-all duration-300 space-y-3 group">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Heart className="h-6 w-6 text-orange-300" />
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
              Sanctified Feast &amp; Brotherhood
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Relish sumptuous pure vegetarian Krishna prasadam every week in the company of sincere, inspiring friends.
            </p>
          </div>
        </div>

        {/* Continuous Non-Stop Auto-Marquee Scrolling Images */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Glimpses of Youth Activities &amp; Gatherings</span>
          </div>

          <div className="relative w-full overflow-hidden mask-marquee py-2 group select-none">
            {/* Seamless Infinite Continuous Marquee Loop with relaxed gentle speed */}
            <div className="flex w-max animate-[marquee_50s_linear_infinite] gap-5 px-2 group-hover:[animation-play-state:paused] will-change-transform">
              {marqueePhotos.map((photo, idx) => (
                <div
                  key={`${photo.id}_${idx}`}
                  className="shrink-0 w-[260px] sm:w-[320px] md:w-[360px] relative rounded-3xl overflow-hidden shadow-xl border border-white/15 aspect-[16/10] group/card"
                >
                  <img
                    src={getOptimizedCloudinaryUrl(photo.url, "card")}
                    alt={photo.label || "Hare Krishna"}
                    className="w-full h-full object-cover object-center group-hover/card:scale-108 transition-transform duration-700 pointer-events-none"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  {photo.label && (
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-xs font-bold text-white drop-shadow-md line-clamp-1">
                        {photo.label}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
