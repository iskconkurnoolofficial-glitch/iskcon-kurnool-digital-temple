import { Phone, Mail, Sparkles } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function TempleHeader({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact" | "receipt";
  className?: string;
}) {
  const { settings, receiptSettings } = useAdmin();

  // Resolve logo URL
  const logoUrl =
    settings?.logo ||
    receiptSettings?.customReceiptLogo ||
    "/iskcon-logo.png";

  const deityImageUrl = receiptSettings?.rightHeaderImage || "/jagannath-deities.jpg";

  return (
    <header
      className={`relative overflow-hidden text-white bg-gradient-to-r from-[#2a0845] via-[#1e1b4b] to-[#11052c] border-b-2 border-amber-500/60 shadow-xl ${className}`}
      style={{ fontFamily: "'Cinzel', Georgia, serif" }}
    >
      {/* Background Decorative Pattern / Mandala Watermark */}
      <div className="absolute inset-0 bg-[url('/mandala.png')] bg-center bg-no-repeat opacity-[0.06] bg-contain pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Ornate Gold Border Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Main 3-Column Header Grid */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          
          {/* 1. Left Section — ISKCON Official Logo */}
          <div className="flex items-center justify-center shrink-0 order-1 md:order-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
              <img
                src={logoUrl}
                alt="ISKCON Official Logo"
                className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full object-cover ring-2 ring-amber-300 shadow-xl bg-purple-950 p-0.5"
              />
            </div>
          </div>

          {/* 2. Center Section — Temple Identity */}
          <div className="text-center flex-1 order-2 md:order-2 max-w-2xl px-2">
            {/* Line 1 — Organization Name (Big Bold White) */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white tracking-[0.14em] uppercase drop-shadow-md">
              International Society for Krishna Consciousness
            </p>

            {/* Line 2 — Founder-Acharya (Big Bold White) */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white/95 tracking-wide drop-shadow-xs mt-1">
              Founder-Acharya: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
            </p>

            {/* Line 3 — Main Temple Name (BIGGER with Top Spacing) */}
            <h1 className="mt-3 sm:mt-4 md:mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_12px_rgba(217,119,6,0.4)] py-0.5 leading-tight">
              ISKCON KURNOOL
            </h1>

            {/* Line 4 — Temple Name (BIGGER) */}
            <h2 className="mt-1 sm:mt-1.5 text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-amber-200 tracking-[0.2em] uppercase drop-shadow-sm">
              SRI SRI PURI JAGANNATH TEMPLE
            </h2>
          </div>

          {/* 3. Right Section — Sri Sri Jagannath Deities (Exact Same Size & Circular Frame as Left Logo) */}
          <div className="flex items-center justify-center shrink-0 order-3 md:order-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
              <img
                src={deityImageUrl}
                alt="Sri Sri Puri Jagannath Deities"
                className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full object-cover ring-2 ring-amber-300 shadow-xl bg-purple-950 p-0.5"
              />
            </div>
          </div>
        </div>

        {/* 4. Contact Information & Ornamental Divider */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-amber-400/30 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-sans">
          <a
            href="tel:+919505377520"
            className="flex items-center gap-2 text-amber-100 hover:text-amber-300 transition group"
          >
            <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/30">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium tracking-wide">+91 95053 77520</span>
          </a>

          <div className="hidden sm:block h-3.5 w-px bg-amber-400/30" />

          <a
            href="mailto:iskconkurnool.official@gmail.com"
            className="flex items-center gap-2 text-amber-100 hover:text-amber-300 transition group"
          >
            <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/30">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium tracking-wide">iskconkurnool.official@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Bottom Ornate Gold Line */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />
    </header>
  );
}
