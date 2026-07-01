import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { MessageCircle, Instagram, MapPin, Calendar, Camera, Music, Sparkles, Heart, ArrowRight } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-40 animate-fade-in" />
        <div className="relative max-w-5xl mx-auto px-6 text-center animate-fade-up">
          <span className="text-secondary font-medium uppercase text-xs tracking-[0.3em] block mb-4">Activities</span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl">Hari Nama Sankeerthana</h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto font-light leading-relaxed">
            Chanting the holy names through the streets of Kurnool — every week, every heart, one Name at a time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>
        </div>
      </section>

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

      {/* Auto-scrolling Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 bg-white overflow-hidden border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">A Glimpse of the Joy</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
            A glimpse of the streets we've walked, the faces we've met, and the joy we've shared — one Hari Nama at a time.
          </p>
        </div>

        <AutoGallery images={gallery} />
      </section>

      {/* Schedule Block Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-soft border border-border shadow-elegant overflow-hidden p-8 md:p-12 relative">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Calendar className="h-4 w-4" /> Schedule
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">Join the Street Chanting</h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">Come walk, dance, and chant the holy names with us weekly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="rounded-2xl bg-white border border-border p-6 flex items-center gap-4 shadow-sm">
                <div className="p-3.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Weekly Schedule</h4>
                  <p className="font-semibold text-foreground text-lg mt-0.5">{harinama.scheduleDay || "Every Saturday"}</p>
                  <p className="text-sm text-accent font-semibold">{harinama.scheduleTime || "5:00 PM onwards"}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-border p-6 flex items-center gap-4 shadow-sm">
                <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Starting Point</h4>
                  <p className="font-semibold text-foreground text-base mt-0.5 leading-snug">
                    {harinama.meetingPoint || "ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white border-t border-border">
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

function AutoGallery({ images }: { images: { id: string; url: string; label: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        track.scrollLeft += 0.7;
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) track.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [images.length]);

  const loop = [...images, ...images];

  return (
    <div
      ref={trackRef}
      className="flex gap-4 sm:gap-6 overflow-x-hidden py-4 cursor-grab select-none"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {loop.map((img, i) => (
        <div key={img.id + "-" + i} className="shrink-0 w-64 sm:w-72 md:w-80 group">
          <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white aspect-[4/3] relative">
            <img 
              src={img.url} 
              alt={img.label} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            {img.label && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs sm:text-sm font-medium font-sans leading-tight">{img.label}</p>
              </div>
            )}
          </div>
          {img.label && (
            <p className="text-center text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary transition duration-300 block md:hidden">
              {img.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
