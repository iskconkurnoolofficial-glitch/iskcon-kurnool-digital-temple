import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { MessageCircle, Instagram, MapPin, Calendar, Camera, Music, Sparkles, Heart, ArrowRight, Smile, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/harinama")({
  head: () => ({ meta: [
    { title: "Hari Nama Sankeerthana — ISKCON Kurnool" },
    { name: "description", content: "Hari Nama Sankeerthana — congregational chanting of the holy names with ISKCON Kurnool." },
    { property: "og:title", content: "Hari Nama Sankeerthana — ISKCON Kurnool" },
    { property: "og:description", content: "Join ISKCON Kurnool for street chanting and musical sankirtan every week." },
  ]}),
  component: HarinamaPage,
});

const defaultGallery = [
  {
    id: "dg1",
    url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
    label: "Joyful Chanting on the Streets"
  },
  {
    id: "dg2",
    url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
    label: "Procession through the Town"
  },
  {
    id: "dg3",
    url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
    label: "Mridangam and Kartalas Beats"
  }
];

function HarinamaPage() {
  const { harinama } = useAdmin();
  const gallery = harinama.gallery && harinama.gallery.length > 0 ? harinama.gallery : defaultGallery;
  const whatsappUrl = harinama.whatsappUrl || "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3";
  const instagramUrl = `https://instagram.com/${harinama.instagramHandle || "iskconkurnool"}`;

  const defaultAboutText = "Hari Nama Sankeerthana is the congregational chanting of the holy names of Krishna — Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare — carried out loudly, joyfully, and publicly, usually while walking through streets, markets, and neighborhoods.\n\nThis practice was given special emphasis by Sri Chaitanya Mahaprabhu, who taught that in this age, chanting the names of God together, in public, is the easiest and most powerful way to purify the heart and connect with the Divine. It doesn't require Sanskrit knowledge, ritual expertise, or any qualification — anyone who joins, chants, or even simply hears, benefits.\n\nAt ISKCON Kurnool, Hari Nama Sankeerthana is not a performance — it's an offering. Devotees walk together with mridangam and karatalas, singing, dancing, and inviting the whole town to taste a moment of transcendence in the middle of an ordinary day.";
  const aboutText = harinama.aboutText || defaultAboutText;
  const defaultAboutImage = "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80";
  const aboutImage = harinama.aboutImage || defaultAboutImage;

  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Activities" 
        title="Hari Nama Sankeerthana" 
        subtitle="Chanting the holy names through the streets of Kurnool — every week, every heart, one Name at a time." 
        pageKey="harinama"
      >
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-secondary hover:bg-secondary/95 text-secondary-foreground font-semibold px-8 py-3.5 shadow-gold transition hover:scale-[1.03] text-base"
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          Join the Next Sankeerthana
        </a>
        <a 
          href="#gallery"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold px-8 py-3.5 transition hover:scale-[1.03] text-base"
        >
          <Camera className="h-5 w-5 shrink-0" />
          View Photo Gallery
        </a>
      </PageHero>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-7 space-y-8 animate-fade-in">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-bold">
                  <Sparkles className="h-4 w-4" /> Sacred Procession
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                  About Hari Nama Sankeerthana
                </h2>
                <div className="h-1 w-20 bg-secondary rounded-full" />
              </div>
              
              <div className="text-foreground/90 space-y-4 text-base md:text-lg leading-relaxed font-sans">
                {aboutText.split("\n\n").map((para, i) => {
                  if (!para.trim()) return null;
                  
                  // Bold key mahamantra snippet if it appears
                  const hasMantra = para.includes("Hare Krishna Hare Krishna");
                  if (hasMantra) {
                    const parts = para.split("Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare");
                    return (
                      <p key={i}>
                        {parts[0]}
                        <span className="font-bold text-primary">
                          Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare
                        </span>
                        {parts[1]}
                      </p>
                    );
                  }
                  
                  return <p key={i}>{para}</p>;
                })}
              </div>

              {/* Why We Do It Card */}
              <div className="rounded-2xl border border-secondary/30 bg-surface/50 p-6 md:p-8 shadow-gold relative overflow-hidden">
                <h3 className="font-display text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" /> Why we do it
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "To purify the atmosphere of the town with the vibration of the holy names",
                    "To give every passerby — regardless of belief — a free taste of spiritual sound",
                    "To build community among devotees through shared service",
                    "To follow the example and instruction of Sri Chaitanya Mahaprabhu"
                  ].map((point, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="h-6 w-6 rounded-full bg-secondary text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-foreground/90 font-medium text-sm md:text-base leading-relaxed">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Beautiful Banner Image */}
            <div className="lg:col-span-5 animate-fade-up">
              <div className="relative group rounded-[32px] overflow-hidden border-4 border-white shadow-elegant aspect-[4/5] bg-muted">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <img 
                  src={aboutImage} 
                  alt="Hari Nama Sankeerthana Street Chanting" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                  <span className="text-xs uppercase tracking-widest text-secondary font-bold">Sacred Sound Vibration</span>
                  <h4 className="font-display font-bold text-xl sm:text-2xl mt-1 text-white leading-tight">Joyful Street Chanting in Kurnool</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-amber-100 via-amber-200/40 to-amber-50 relative overflow-hidden border-y border-amber-200/40">
        {/* Soft glowing decorations */}
        <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 border border-amber-200 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Spiritual Rewards
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-primary tracking-tight">
              Benefits of Harinam Sankirtana
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Discover the transformative power of congregational chanting on your heart, mind, and surroundings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Purifies the Heart",
                desc: "The chanting cleanses the consciousness and removes impurities from the heart.",
                color: "bg-rose-500/10 text-rose-600 border-rose-200/30"
              },
              {
                icon: Sparkles,
                title: "Calms the Mind",
                desc: "The rhythmic repetition of the mantra brings deep peace and mental clarity.",
                color: "bg-indigo-500/10 text-indigo-600 border-indigo-200/30"
              },
              {
                icon: Smile,
                title: "Spiritual Joy",
                desc: "Participants experience a deep sense of spiritual awakening and ecstatic joy.",
                color: "bg-amber-500/10 text-amber-600 border-amber-200/30"
              },
              {
                icon: Globe,
                title: "Spiritual Influence",
                desc: "Creates a positive spiritual atmosphere, purifying the surroundings and inspiring others.",
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/30"
              }
            ].map((b, i) => (
              <div 
                key={i} 
                className="bg-white/95 backdrop-blur-sm border border-amber-200/40 rounded-3xl p-8 shadow-[0_8px_30px_rgba(245,197,24,0.03)] hover:shadow-[0_20px_50px_rgba(245,197,24,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                
                <div>
                  {/* Icon Box */}
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shrink-0 transition-all duration-300 group-hover:scale-110 border ${b.color}`}>
                    <b.icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl text-primary mb-3 group-hover:text-accent transition-colors duration-300">
                    {b.title}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto-scrolling Gallery Section */}
      <section id="gallery" className="py-20 md:py-28 bg-[#141221] overflow-hidden border-y border-black relative">
        {/* Soft glowing decorations */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <Camera className="h-3.5 w-3.5 text-secondary" /> Visual Darshan
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mt-4">
            A Glimpse of the Joy
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            A graceful visual walk of the streets we've walked, the faces we've met, and the sheer ecstasy of congregational chanting.
          </p>
        </div>

        <DualRowGallery images={gallery} />
      </section>

      {/* Schedule Block Section */}
      <section className="py-20 md:py-24 bg-background relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-amber-700" /> Gathering Details
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-3">
              Join the Street Chanting
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Come walk, dance, and chant the holy names with us weekly.
            </p>
          </div>

          {/* Details Card Grid or Details Coming Soon Banner */}
          {!(harinama.scheduleDay?.trim() || harinama.scheduleTime?.trim() || harinama.startingPoint?.trim() || harinama.meetingPoint?.trim() || harinama.endingPoint?.trim()) ? (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border-2 border-amber-300/60 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/20 text-amber-800 mx-auto grid place-items-center border border-amber-300/40">
                <Clock className="h-8 w-8 animate-pulse text-amber-700" />
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-primary">
                Details Coming Soon...
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-sans">
                The upcoming street chanting schedule, timing, starting point, and route details will be posted shortly by our temple administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Weekly Day */}
              <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex items-center">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-500 transition-all duration-300 group-hover:w-1.5" />
                <div className="flex items-center gap-3.5 pl-1.5">
                  <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Weekly Day</h4>
                    <p className={`font-display font-extrabold text-slate-800 text-sm mt-0.5 leading-tight ${!harinama.scheduleDay?.trim() ? "text-amber-800 italic" : ""}`}>
                      {harinama.scheduleDay?.trim() || "Details Coming Soon..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Starting Time */}
              <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex items-center">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500 transition-all duration-300 group-hover:w-1.5" />
                <div className="flex items-center gap-3.5 pl-1.5">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Starting Time</h4>
                    <p className={`font-display font-extrabold text-slate-800 text-sm mt-0.5 leading-tight ${!harinama.scheduleTime?.trim() ? "text-amber-800 italic" : ""}`}>
                      {harinama.scheduleTime?.trim() || "Details Coming Soon..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Starting Point */}
              <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex items-center">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500 transition-all duration-300 group-hover:w-1.5" />
                <div className="flex items-center gap-3.5 pl-1.5">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Starting Point</h4>
                    <p className={`font-sans font-semibold text-slate-700 text-xs mt-0.5 leading-snug ${!(harinama.startingPoint?.trim() || harinama.meetingPoint?.trim()) ? "text-amber-800 italic" : ""}`}>
                      {harinama.startingPoint?.trim() || harinama.meetingPoint?.trim() || "Details Coming Soon..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ending Point */}
              <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex items-center">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 transition-all duration-300 group-hover:w-1.5" />
                <div className="flex items-center gap-3.5 pl-1.5">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ending Point</h4>
                    <p className={`font-sans font-semibold text-slate-700 text-xs mt-0.5 leading-snug ${!harinama.endingPoint?.trim() ? "text-amber-800 italic" : ""}`}>
                      {harinama.endingPoint?.trim() || "Details Coming Soon..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 rounded-2xl border-2 border-green-500 bg-green-50/50 hover:bg-green-50 hover:scale-[1.01] transition shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500 text-white grid place-items-center shrink-0">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-green-800 text-lg">WhatsApp Group</h4>
                <p className="text-green-700/80 text-sm mt-0.5">Join the next Sankeerthana group</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-green-600 transform group-hover:translate-x-1 transition shrink-0" />
          </a>

          {/* Instagram CTA */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 rounded-2xl border-2 border-pink-500 bg-pink-50/50 hover:bg-pink-50 hover:scale-[1.01] transition shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white grid place-items-center shrink-0">
                <Instagram className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-pink-850 text-lg">Follow Instagram</h4>
                <p className="text-pink-700/80 text-sm mt-0.5">Get weekly routes & updates</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-pink-600 transform group-hover:translate-x-1 transition shrink-0" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}

function DualRowGallery({ images }: { images: { id: string; url: string; label: string }[] }) {
  if (!images || images.length === 0) return null;

  // Split or copy images for Row 1 & Row 2.
  // Ensure enough items in each row to fill the marquee width seamlessly
  const row1Images = [...images, ...images, ...images];
  const row2Images = [...images.slice().reverse(), ...images.slice().reverse(), ...images.slice().reverse()];

  return (
    <div className="space-y-6 relative z-10">
      {/* Row 1: Left to Right */}
      <div className="group overflow-hidden relative w-full">
        {/* Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#141221] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#141221] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[marquee-reverse_35s_linear_infinite] gap-6 px-4 py-2 group-hover:[animation-play-state:paused] will-change-transform">
          {row1Images.map((img, idx) => (
            <div 
              key={`r1-${img.id}-${idx}`}
              className="w-[280px] sm:w-[340px] md:w-[400px] aspect-[16/10] relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] group/card shrink-0 select-none cursor-pointer"
            >
              <img 
                src={img.url} 
                alt={img.label} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 group-hover/card:rotate-1" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />
              {img.label && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 transform translate-y-1.5 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium font-sans leading-tight">{img.label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Right to Left */}
      <div className="group overflow-hidden relative w-full">
        {/* Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#141221] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#141221] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[marquee_35s_linear_infinite] gap-6 px-4 py-2 group-hover:[animation-play-state:paused] will-change-transform">
          {row2Images.map((img, idx) => (
            <div 
              key={`r2-${img.id}-${idx}`}
              className="w-[280px] sm:w-[340px] md:w-[400px] aspect-[16/10] relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] group/card shrink-0 select-none cursor-pointer"
            >
              <img 
                src={img.url} 
                alt={img.label} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 group-hover/card:rotate-1" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />
              {img.label && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 transform translate-y-1.5 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium font-sans leading-tight">{img.label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
