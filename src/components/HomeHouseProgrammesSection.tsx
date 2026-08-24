import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import {
  Home,
  Sparkles,
  Music,
  BookOpen,
  Flame,
  Utensils,
  Phone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Heart,
  Users,
  MapPin,
  Smile
} from "lucide-react";

export default function HomeHouseProgrammesSection() {
  const { houseProgrammes: hp } = useAdmin();

  const cleanPhone = (hp?.contactPhone || "+919505377520").replace(/\D/g, "");
  const whatsappNum = (hp?.whatsappNumber || hp?.contactPhone || "919505377520").replace(/\D/g, "");
  const formattedWhatsapp = whatsappNum.length === 10 ? `91${whatsappNum}` : whatsappNum;

  const contactWhatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
    "Hare Krishna! 🙏 I would like to inquire about arranging an ISKCON House Programme at my home in Kurnool."
  )}`;

  // Existing images from houseProgrammes state
  const mainImage =
    hp?.aboutImage ||
    hp?.gallery?.[0]?.url ||
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80";

  const secondaryImage =
    hp?.aboutImageRight ||
    hp?.gallery?.[1]?.url ||
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80";

  const thirdImage =
    hp?.gallery?.[2]?.url ||
    "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 bg-gradient-to-b from-[#fffaf0] via-[#fef6e9] to-[#fffdf9] border-t border-b border-amber-200/60">
      {/* Background Sacred Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-28 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-28 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Intro Details & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300/60 text-amber-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Home className="h-3.5 w-3.5 text-amber-600" />
              <span>{hp.badgeText || "Devotional Home Gatherings"}</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
              {hp?.heroTitle || "Invite Divine Blessings into Your Home"}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {hp.heroSubtitle ||
                "Transform your home into a spiritual sanctuary. ISKCON Kurnool devotees visit your residence to conduct uplifting kirtans, Bhagavad Gita discourses, altar worship, and sanctified prasadam distribution."}
            </p>

            {/* 4 Core Quick Feature Tags */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-base">🎶</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Ecstatic Kirtan</h4>
                  <p className="text-[11px] text-slate-500">Maha Mantra chanting</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-base">📖</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Gita Discourse</h4>
                  <p className="text-[11px] text-slate-500">Practical wisdom Q&amp;A</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-base">🪔</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Altar Harati</h4>
                  <p className="text-[11px] text-slate-500">Auspicious home puja</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-base">🍚</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Pure Prasadam</h4>
                  <p className="text-[11px] text-slate-500">Sanctified food feast</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/house-programmes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:scale-102 cursor-pointer"
              >
                <span>Book a House Programme</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={contactWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-300 hover:scale-102 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-amber-600" />
                <span>Call Coordinator</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Photo Collage of Existing Images (Clean, No Overlay Text) */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Large Image */}
              <div className="col-span-2 relative rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 group aspect-[16/9]">
                <img
                  src={mainImage}
                  alt="ISKCON House Programme Gathering"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>

              {/* Secondary Left Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white/80 group aspect-[4/3]">
                <img
                  src={secondaryImage}
                  alt="Altar Worship and Harati"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>

              {/* Secondary Right Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white/80 group aspect-[4/3]">
                <img
                  src={thirdImage}
                  alt="Prasadam and Community"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Floating Top Badge */}
            <div className="absolute -top-4 -right-2 sm:-right-4 bg-amber-500 text-slate-950 font-display font-extrabold text-xs px-4 py-2 rounded-2xl shadow-gold border-2 border-white flex items-center gap-1.5 animate-in fade-in">
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              <span>Available Across Kurnool</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
