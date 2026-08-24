import { Phone, Mail, MapPin, Instagram, Youtube, MessageCircle, Heart, ArrowUpRight, Navigation, MessageSquare } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { safeUrl, safeMapEmbed } from "@/lib/utils";

export default function ConnectSection() {
  const { settings } = useAdmin();

  const phone = settings.phone || "+91 95053 77520";
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsapp = settings.whatsapp || "+91 95053 77520";
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  const email = settings.email || "iskconkurnool@gmail.com";
  const address = settings.address || "Sri Sri Puri Jagannath Temple, ISKCON Kurnool, Andhra Pradesh";

  return (
    <section id="connect" className="py-16 sm:py-24 bg-gradient-to-b from-[#fffaf0] via-[#fef5e7] to-[#fffdf9] border-t border-amber-200/60 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-300/60 text-purple-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-purple-700" />
            <span>Visit the Abode</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
            Connect &amp; Visit ISKCON Kurnool
          </h2>
          <p className="text-[#4a1d40]/85 text-sm sm:text-base leading-relaxed">
            Experience peace, bliss, and supreme spiritual association. All visitors and devotees are warmly welcome.
          </p>
        </div>

        {/* 2-Column Info & Interactive Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Contact Cards, Socials & Donation */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-xl space-y-6">
            <div className="space-y-4">
              {/* Address Card */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">Temple Address</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5">{address}</p>
                </div>
              </div>

              {/* Simple Phone & WhatsApp Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call {phone}</span>
                </a>

                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>

              {/* Email Card */}
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Mail className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Us</span>
                  <span className="text-xs font-bold text-slate-800">{email}</span>
                </div>
              </a>

              {/* Follow Us */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Follow Sacred Updates
                </span>
                <div className="flex gap-2.5">
                  <a
                    href={safeUrl(settings.instagram, "https://instagram.com/iskconkurnool")}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href={safeUrl(settings.youtube, "https://youtube.com/@iskconkurnool")}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Youtube className="h-4 w-4" />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Donate CTA */}
            <div className="pt-2">
              <a
                id="donate"
                href="/donate"
                className="relative group overflow-hidden flex items-center justify-center gap-2 text-center px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-gold hover:shadow-xl hover:scale-102 active:scale-98 transition duration-300 cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-white/30 text-white group-hover:scale-125 transition-transform" />
                <span>Support ISKCON Kurnool (Seva &amp; Donation)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Embed */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border-2 border-amber-200/80 bg-white min-h-[420px] flex flex-col">
            <div className="p-3.5 bg-amber-500/10 border-b border-amber-200/60 flex items-center justify-between px-5">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-amber-700" />
                <span>Google Maps Location</span>
              </span>
              <a
                href="https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-900 hover:text-orange-700 inline-flex items-center gap-1"
              >
                <span>Open in Maps</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex-1 w-full min-h-[380px]">
              <iframe
                src={safeMapEmbed(settings.mapEmbed)}
                title="ISKCON Kurnool Location"
                className="w-full h-full min-h-[380px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
