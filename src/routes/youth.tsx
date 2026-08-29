import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import { 
  MessageCircle, 
  Star, 
  Instagram, 
  MapPin, 
  Calendar, 
  Settings, 
  Music, 
  BookOpen, 
  Sparkles, 
  Users, 
  Heart, 
  Smile, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from "lucide-react";

export const Route = createFileRoute("/youth")({
  head: () => ({ meta: [
    { title: "Youth Program — ISKCON Kurnool" },
    { name: "description", content: "Youth Program at ISKCON Kurnool — every Saturday for boys. Bhagavad Gita, kirtan, music, mind management and prasadam." },
    { property: "og:title", content: "Youth Program — ISKCON Kurnool" },
    { property: "og:description", content: "Join the ISKCON Kurnool Youth every Saturday for kirtan, Gita wisdom and prasadam." },
  ]}),
  component: YouthPage,
});

function YouthPage() {
  const { youth, sunday } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const isLive = isTimeStrLive("6:30 PM – 8:30 PM", 6); // 6 = Saturday

  const visibleReviews = youth.reviews.filter((r) => r.visible);
  const whatsappUrl = youth.whatsappUrl || "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3";
  const directionsUrl = sunday.directionsUrl || "https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9";

  const img1 = youth.gallery[0]?.url || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80";
  const img2 = youth.gallery[1]?.url || "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=600&q=80";
  const img3 = youth.gallery[2]?.url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80";
  const img4 = youth.gallery[3]?.url || "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=600&q=80";

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <PageHero
        eyebrow="ISKCON Kurnool"
        title="Youth Program"
        subtitle="Empowering Youth. Inspiring Purpose. Transforming Lives."
        pageKey="youth"
        logo={youth.logo}
      >
        <div className="space-y-4 w-full flex flex-col items-center lg:items-start mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-secondary text-sm font-semibold tracking-wide shadow-sm">
            <Clock className="h-4 w-4" />
            <span>{youth.schedule}</span>
            {isLive && (
              <span className="ml-1.5 inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-accent text-white font-semibold hover:scale-105 active:scale-95 transition shadow-md shadow-accent/10 cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" /> Join the Youth Program
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/60 hover:bg-white/10 text-white font-semibold transition hover:scale-105"
            >
              <MapPin className="h-4.5 w-4.5" /> Get Directions
            </a>
          </div>
        </div>
      </PageHero>

      {/* SPACE TO LEARN, CONNECT & GROW */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left Box Quote */}
            <div className="relative group p-8 md:p-10 rounded-[32px] bg-gradient-soft border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col justify-center overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
              <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary leading-snug mb-6">
                One Saturday.<br/>New Perspectives.<br/>Meaningful Connections.<br/>A Better Direction.
              </h3>
              <blockquote className="text-slate-600 italic text-sm md:text-base border-l-4 border-accent pl-4 mb-6">
                "Engage the youth in Krishna's service and the world will transform."
              </blockquote>
              <p className="text-accent font-bold text-xs uppercase tracking-widest">
                — Spiritual Vision
              </p>
            </div>

            {/* Right content details */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Focus &amp; Growth
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary leading-tight">
                A Space to Learn, Connect &amp; Grow
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-4 text-sm sm:text-base">
                <p>
                  Youth life is filled with important decisions, ambitions, distractions, pressure, and questions about the future. At the ISKCON Kurnool Youth Program, we explore practical spiritual wisdom that helps young people face modern challenges with greater clarity and inner strength.
                </p>
                <p>
                  Through inspiring discussions, interactive sessions, mantra meditation, and meaningful friendships, every Saturday becomes an opportunity for personal and spiritual growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL JOIN US / CTA SECTION */}
      <section className="py-12 md:py-16 bg-[#141221] text-white relative overflow-hidden border-t border-black">
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Text & Join Content */}
          <div className="lg:col-span-6 space-y-6 text-left animate-fade-up">
            <span className="text-secondary font-semibold uppercase text-xs tracking-[0.25em] block">
              Make Saturdays Count
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight leading-tight">
              Make Your Saturday Meaningful
            </h2>
            <p className="text-slate-350 text-sm sm:text-base leading-relaxed">
              Step away from the noise of everyday life and spend time discovering wisdom, friendship, inspiration, and inner peace.
            </p>

            <div className="h-px bg-white/10 w-full" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-3.5 items-start">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-accent shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schedule</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">Every Saturday</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">6:30 PM – 8:30 PM</p>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-accent shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venue</h4>
                  <p className="text-xs font-semibold text-white mt-0.5 leading-snug whitespace-pre-line">{youth.venue}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-semibold hover:scale-105 active:scale-95 transition duration-200 cursor-pointer shadow-lg"
              >
                Join the Youth Program <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Image Collage Grid */}
          <div className="lg:col-span-6 flex justify-center w-full animate-fade-up">
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] aspect-[4/5] bg-muted group">
                  <img src={img1} alt="Kirtan session" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] aspect-square bg-muted group">
                  <img src={img2} alt="Gita discussion" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
              {/* Column 2 */}
              <div className="space-y-4 lg:pt-8">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] aspect-square bg-muted group">
                  <img src={img3} alt="Youth community discussion" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] aspect-[4/5] bg-muted w-full group">
                  <img src={img4} alt="Youth gathering" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS EVERY SATURDAY */}
      <section className="py-20 md:py-28 bg-slate-50/60 relative overflow-hidden border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Schedule</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-primary tracking-tight">
              What Happens Every Saturday?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Explore the key elements that make our weekly youth gatherings inspiring and empowering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {youth.features.map((act, i) => (
              <div
                key={i}
                className="bg-white border-[3px] border-amber-500/25 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:border-amber-500/65 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-muted w-full overflow-hidden">
                    {act.image && (
                      <img 
                        src={act.image} 
                        alt={act.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-primary mb-3 group-hover:text-accent transition-colors duration-300">
                      {act.title}
                    </h3>
                    <p className="text-sm text-slate-650 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY JOIN THE YOUTH PROGRAM */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-amber-100 via-amber-200/40 to-amber-50 relative overflow-hidden border-y border-amber-200/40">
        <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-amber-200 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Empowerment
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-primary tracking-tight">
              Why Join the Youth Program?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Equip yourself with practical, emotional, and spiritual tools designed specifically for modern youth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Discover greater clarity and purpose in life",
              "Improve focus and self-discipline",
              "Learn to manage stress and distractions",
              "Build strong values and positive habits",
              "Understand the practical wisdom of the Bhagavad Gita",
              "Connect with a positive youth community in Kurnool",
              "Experience mantra meditation and spiritual culture",
              "Grow personally and spiritually"
            ].map((pt, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-amber-200/20 hover:bg-white transition duration-200"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-semibold text-sm sm:text-base leading-snug">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      {youth.gallery.length > 0 && (
        <section className="py-20 bg-slate-50 border-t border-slate-100 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">A Glimpse of the Joy</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Moments of kirtan, discussions, and friendship from our Saturday youth programs.
            </p>
          </div>
          <AutoGallery images={youth.gallery} />
        </section>
      )}

      {/* WHO CAN JOIN */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-amber-100/80 via-amber-200/60 to-amber-100/40 relative overflow-hidden border-t border-amber-250/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-center">
            {/* Left card */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left animate-fade-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Users className="h-4 w-4" /> Community
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary leading-tight">
                Who Can Join?
              </h2>
              
              <div className="inline-flex flex-col items-center lg:items-start p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-amber-200/50 w-full shadow-sm">
                <span className="px-4 py-1.5 rounded-full bg-accent text-white font-extrabold text-sm tracking-widest uppercase mb-3 border border-amber-200 shadow-sm">
                  Only Boys
                </span>
                <p className="text-amber-900 text-sm text-center lg:text-left leading-relaxed font-semibold">
                  The program is designed specifically for boys and young men looking to build solid principles and values.
                </p>
              </div>
            </div>

            {/* Right Card Grid list */}
            <div className="lg:col-span-7 space-y-6 bg-white/60 backdrop-blur-sm border border-amber-200/50 p-8 rounded-3xl animate-fade-up shadow-sm">
              <h3 className="font-display font-bold text-xl text-primary mb-4">The program welcomes:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "College students",
                  "University students",
                  "Young professionals",
                  "Youth interested in self-development",
                  "Anyone curious about spirituality and the Bhagavad Gita"
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center bg-white border border-amber-100/50 px-4 py-3.5 rounded-xl shadow-sm hover:scale-[1.02] transition duration-200">
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                    <span className="text-slate-800 font-semibold text-xs sm:text-sm leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-amber-200/30 w-full my-4" />
              <p className="text-amber-800 italic text-xs sm:text-sm leading-relaxed text-center sm:text-left font-medium">
                No prior spiritual knowledge is required. Everyone is welcome to explore, learn, and participate.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* REVIEWS SECTION */}
      {visibleReviews.length > 0 && (
        <section className="py-20 md:py-24 bg-gradient-to-b from-amber-50 via-amber-100/30 to-background overflow-hidden relative border-t border-amber-200/30">
          {/* Soft glowing decorations */}
          <div className="absolute top-12 right-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 left-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 mb-12 text-center relative z-10">
            <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Reviews</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-2">
              What Seekers Say
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
              Real stories of growth and inspiration from participants of the Saturday youth program.
            </p>
          </div>

          {/* Scrolling Marquee Container */}
          <div className="relative w-full overflow-hidden z-10">
            {/* Left/Right Gradient Overlays for smooth fading */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Marquee Inner Wrapper */}
            <div className="group flex overflow-hidden">
              <div className="flex w-max animate-[marquee-reverse_30s_linear_infinite] gap-6 px-4 py-4 group-hover:[animation-play-state:paused] will-change-transform">
                {[...visibleReviews, ...visibleReviews, ...visibleReviews].map((r, idx) => (
                  <div
                    key={idx}
                    className="w-[320px] sm:w-[380px] bg-white border border-slate-100/85 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shrink-0"
                  >
                    <div>
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {/* Review Text */}
                      <p className="text-slate-600 text-sm leading-relaxed italic mb-6">
                        "{r.text}"
                      </p>
                    </div>
                    {/* Divider & Author */}
                    <div>
                      <div className="h-px bg-slate-100 w-full mb-4" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-display font-extrabold text-sm shrink-0 border border-primary/20">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{r.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Youth Member</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM FEED CTA */}
      {youth.instagramHandle && (
        <section className="py-20 bg-background relative overflow-hidden border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-8 md:p-14 shadow-2xl">
              {/* background decoration */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left content */}
                <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
                  <span className="text-secondary font-semibold uppercase text-xs tracking-[0.2em] block">Social Media</span>
                  <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
                    Follow Our Journey
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Get daily inspiration, weekly updates, program photos, and spiritual content directly in your feed.
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://instagram.com/${youth.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(219,39,119,0.35)]"
                    >
                      <Instagram className="h-5 w-5" /> @{youth.instagramHandle}
                    </a>
                  </div>
                </div>

                {/* Right content: 3 polaroid-style hover items representing posts */}
                <div className="lg:col-span-6 grid grid-cols-3 gap-3 md:gap-4">
                  {[
                    youth.gallery[0]?.url || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=400&q=80",
                    youth.gallery[1]?.url || "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=400&q=80",
                    youth.gallery[2]?.url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80",
                  ].map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg group/post cursor-pointer ${
                        i === 1 ? "translate-y-2 md:translate-y-3" : ""
                      }`}
                    >
                      <img src={url} alt="Instagram post" className="w-full h-full object-cover group-hover/post:scale-110 transition duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/post:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}




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
        track.scrollLeft += 0.6;
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
          <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-white aspect-[4/3] relative">
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
        </div>
      ))}
    </div>
  );
}
