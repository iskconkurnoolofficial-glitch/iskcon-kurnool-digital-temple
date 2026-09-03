import { Link } from "@tanstack/react-router";
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowUp,
  Twitter,
  Sparkles,
  Heart,
  ShieldCheck,
  Flower2
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { safeUrl } from "@/lib/utils";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";
import InstallAppButton from "@/components/InstallAppButton";

export default function Footer() {
  const { settings } = useAdmin();
  const currentYear = new Date().getFullYear();

  const discoverLinks = [
    { label: "Home", href: "/" },
    { label: "Bhakti Steps (5 Levels)", href: "/bhakti-steps" },
    { label: "House Programmes", href: "/house-programmes" },
    { label: "About ISKCON", href: "/about/iskcon" },
    { label: "ISKCON Kurnool", href: "/about/kurnool" },
    { label: "Founder Acharya", href: "/about/founder" },
    { label: "Our Mission", href: "/about/mission" },
  ];

  const templeLinks = [
    { label: "Daily Darshan", href: "/daily-darshan" },
    { label: "Temple Timings", href: "/temple" },
    { label: "Sunday Satsang Feast", href: "/temple/sunday" },
    { label: "Upcoming Festivals", href: "/festivals" },
    { label: "Sri Jagannath Sevas", href: "/donate" },
    { label: "Goshala Seva", href: "/goshala" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#180928] via-[#12061e] to-[#090310] text-slate-200 border-t border-amber-400/30 overflow-hidden font-sans">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-12">
        
        {/* Top Devotional CTA Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-purple-600/20 border border-amber-400/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 font-extrabold text-[11px] uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-400" />
              Support Temple Seva &amp; Prasadam
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              Sponsor Daily Worship, Annadana &amp; Goshala
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl">
              Your generous offerings sustain Sri Sri Puri Jagannath daily bhoga offerings, festival abhishekam, and free prasadam distribution to hundreds of devotees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/donate"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Heart className="h-4 w-4 text-white fill-white shrink-0" />
              <span className="text-white font-black">Offer Seva / Donate</span>
            </Link>
            <Link
              to="/temple/sunday"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sunday Feast</span>
            </Link>
          </div>
        </div>

        {/* Main Footer 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pt-4">
          
          {/* Column 1: Brand Info, Prabhupada Tribute & Maha Mantra (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3.5">
              {settings.logo ? (
                <img
                  src={getOptimizedCloudinaryUrl(settings.logo, "thumbnail")}
                  alt="ISKCON Kurnool"
                  className="h-14 w-14 rounded-2xl ring-2 ring-amber-400/60 object-cover shadow-lg"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 grid place-items-center font-display font-black text-slate-950 shadow-lg text-lg">
                  IK
                </div>
              )}
              <div>
                <div className="font-display font-black text-2xl text-white tracking-tight leading-tight">
                  ISKCON Kurnool
                </div>
                <div className="text-xs text-amber-300 font-medium">
                  Sri Sri Puri Jagannath Temple
                </div>
              </div>
            </div>
            
            {/* Devotional Maha Mantra Card */}
            <div className="relative border-l-4 border-amber-400 bg-white/[0.04] p-4 rounded-r-2xl border-y border-r border-amber-400/20 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-extrabold flex items-center gap-1">
                  <Flower2 className="h-3 w-3 text-amber-400" /> Hare Krishna Maha Mantra
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-100/90 font-serif italic font-medium">
                "Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare<br />
                Hare Rama, Hare Rama, Rama Rama, Hare Hare"
              </p>
            </div>

            {/* Founder Acharya Tribute Badge */}
            <div className="text-[11px] text-slate-300/80 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/10 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Founder-Acharya: <strong className="text-amber-200">His Divine Grace A.C. Bhaktivedanta Swami Prabhupada</strong> — International Society for Krishna Consciousness.
              </span>
            </div>
          </div>

          {/* Column 2: Discover Links (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-black text-amber-300 text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Discover &amp; Learn
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="group flex items-center text-slate-300 hover:text-amber-300 hover:translate-x-1.5 transition-all duration-300 font-medium"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-amber-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <InstallAppButton variant="footer" />
              </li>
            </ul>
          </div>

          {/* Column 3: Temple & Services Links (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-black text-amber-300 text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Temple Worship &amp; Sevas
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              {templeLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="group flex items-center text-slate-300 hover:text-amber-300 hover:translate-x-1.5 transition-all duration-300 font-medium"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-amber-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social Connect (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="font-display font-black text-amber-300 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Connect With Us
              </h4>
              <div className="flex flex-wrap gap-2">
                <a 
                  href={safeUrl(settings.youtube, "https://youtube.com/@iskconkurnool")} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="YouTube" 
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a 
                  href={safeUrl(settings.facebook, "https://facebook.com/iskconkurnool")} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Facebook" 
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href={safeUrl(settings.instagram, "https://instagram.com/iskconkurnool")} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Instagram" 
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                {settings.twitter && (
                  <a 
                    href={settings.twitter} 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Twitter" 
                    className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${(settings.whatsapp || "+919505377520").replace(/\D/g, "")}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="WhatsApp" 
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line leading-relaxed">{settings.address || "ISKCON Kurnool, Somashila Road, Kurnool, Andhra Pradesh, India"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`tel:${(settings.phone || "+919505377520").replace(/\D/g, "")}`} className="hover:text-amber-300 transition-colors font-medium">
                  {settings.phone || "+91 95053 77520"}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email || "info@iskconkurnool.org"}`} className="hover:text-amber-300 transition-colors font-medium truncate">
                  {settings.email || "info@iskconkurnool.org"}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Copyright & Utility Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="space-y-1 text-center md:text-left">
            <div>
              {settings.footer || `© ${currentYear} ISKCON Kurnool — Sri Sri Puri Jagannath Temple. All Rights Reserved.`}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-medium flex items-center justify-center md:justify-start gap-1.5 pt-1">
              <span className="animate-text-shimmer font-bold">Designed &amp; Developed with</span>
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse scale-110 shrink-0 inline-block" />
              <span className="animate-text-shimmer font-bold">by</span>
              <span className="animate-text-shimmer font-black text-sm sm:text-base tracking-wide drop-shadow-md">
                Devesh
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <Link to="/privacy" className="hover:text-amber-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-amber-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <button 
              onClick={scrollToTop} 
              className="hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
