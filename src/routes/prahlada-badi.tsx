import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Settings, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Camera,
  Heart
} from "lucide-react";

export const Route = createFileRoute("/prahlada-badi")({
  head: () => ({ meta: [
    { title: "Prahlada Badi — ISKCON Kurnool" },
    { name: "description", content: "Sri Bhakta Prahlada Summer Training Classes at ISKCON Kurnool. Bhagavad Gita, keerthanas, drawing, drama, and value education for kids." },
    { property: "og:title", content: "Prahlada Badi — ISKCON Kurnool" },
    { property: "og:description", content: "Sri Bhakta Prahlada Summer Training Classes. Nurturing spiritual values in children through slokas, music, drawing, and stories." },
  ]}),
  component: PrahladaBadiPage,
});

const teluguMonths: Record<string, string> = {
  "01": "జనవరి", "02": "ఫిబ్రవరి", "03": "మార్చి", "04": "ఏప్రిల్",
  "05": "మే", "06": "జూన్", "07": "జూలై", "08": "ఆగస్టు",
  "09": "సెప్టెంబరు", "10": "అక్టోబరు", "11": "నవంబరు", "12": "డిసెంబరు"
};

function formatTeluguNumber(num: number | string): string {
  const teluguDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  return String(num).split("").map(char => {
    const digit = parseInt(char);
    return isNaN(digit) ? char : teluguDigits[digit];
  }).join("");
}

function getFormattedDateRange(startStr: string, endStr: string) {
  try {
    if (!startStr || !endStr) return { en: "", tel: "" };
    
    const parseDate = (dStr: string) => {
      const [year, month, day] = dStr.split("-");
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthNameEn = d.toLocaleString("en-US", { month: "long" });
      const teluguMonth = teluguMonths[month] || month;
      const dayNum = parseInt(day);
      const yrNum = parseInt(year);
      
      return {
        en: `${monthNameEn} ${dayNum}, ${yrNum}`,
        tel: `${teluguMonth} ${formatTeluguNumber(dayNum)}, ${formatTeluguNumber(yrNum)}`
      };
    };
    
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    
    return {
      en: `${start.en} to ${end.en}`,
      tel: `${start.tel} నుండి ${end.tel}`
    };
  } catch (e) {
    return { en: `${startStr} – ${endStr}`, tel: `${startStr} – ${endStr}` };
  }
}

// Colored circular badges for activities
const badgeColors = [
  "bg-purple-100 text-purple-600 border-purple-200",
  "bg-amber-100 text-amber-600 border-amber-200",
  "bg-emerald-100 text-emerald-600 border-emerald-200",
  "bg-rose-100 text-rose-600 border-rose-200",
  "bg-blue-100 text-blue-600 border-blue-200",
  "bg-teal-100 text-teal-600 border-teal-200",
  "bg-pink-100 text-pink-600 border-pink-200"
];

const cardColorThemes = [
  { bg: "bg-[#faf5ff] hover:bg-[#f3e8ff] border-purple-200", iconBg: "bg-purple-100 border-purple-200/50", badge: "bg-purple-100/80 text-purple-800 border-purple-200/60" },
  { bg: "bg-[#fffbeb] hover:bg-[#fef3c7] border-amber-200", iconBg: "bg-amber-100 border-amber-200/50", badge: "bg-amber-100/80 text-amber-800 border-amber-200/60" },
  { bg: "bg-[#f0fdf4] hover:bg-[#dcfce7] border-emerald-200", iconBg: "bg-emerald-100 border-emerald-200/50", badge: "bg-emerald-100/80 text-emerald-800 border-emerald-200/60" },
  { bg: "bg-[#fff5f5] hover:bg-[#ffe3e3] border-rose-200", iconBg: "bg-rose-100 border-rose-200/50", badge: "bg-rose-100/80 text-rose-800 border-rose-200/60" },
  { bg: "bg-[#f0f9ff] hover:bg-[#e0f2fe] border-blue-200", iconBg: "bg-blue-100 border-blue-200/50", badge: "bg-blue-100/80 text-blue-800 border-blue-200/60" },
  { bg: "bg-[#f0fdfa] hover:bg-[#ccfbf1] border-teal-200", iconBg: "bg-teal-100 border-teal-200/50", badge: "bg-teal-100/80 text-teal-800 border-teal-200/60" }
];

function PrahladaBadiPage() {
  const { prahladaBadi } = useAdmin();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const dates = getFormattedDateRange(prahladaBadi.startDate, prahladaBadi.endDate);
  const activities = [...(prahladaBadi.activities || [])].sort((a, b) => a.order - b.order);
  const gallery = prahladaBadi.gallery && prahladaBadi.gallery.length > 0
    ? prahladaBadi.gallery
    : [
        { id: "g1", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80", label: "Art & Drawing Classes" },
        { id: "g2", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", label: "Storytelling & Values" },
        { id: "g3", url: "https://images.unsplash.com/photo-1460518451285-cd7afbc11b0b?auto=format&fit=crop&w=800&q=80", label: "Music & Devotional Songs" },
        { id: "g4", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80", label: "Joyful Group Activities" }
      ];

  const marqueeRow1 = [...gallery, ...gallery, ...gallery, ...gallery];
  const marqueeRow2 = [...gallery].reverse().concat([...gallery].reverse(), [...gallery].reverse(), [...gallery].reverse());
  const visibleReviews = (prahladaBadi.reviews || []).filter((r) => r.visible);
  const reviewsToDisplay = visibleReviews.length > 0 
    ? visibleReviews 
    : [
        { id: "r1", name: "Srinivas Rao", text: "A wonderful summer camp! My daughter learned so many slokas and traditional values. She wakes up early now with self-discipline!", rating: 5 },
        { id: "r2", name: "Radhika Reddy", text: "Prahlada Badi is the best summer program in Kurnool. The combination of music, drama, and Bhagavad Gita is perfect for modern children.", rating: 5 },
        { id: "r3", name: "Ananth Kumar", text: "Highly recommended! The organizers are very kind and caring. The prasadam distribution everyday was loved by my son.", rating: 5 },
        { id: "r4", name: "Lavanya K.", text: "It was amazing to see my kid perform a skit on stage during the grand finale. Thank you ISKCON team for boosting their confidence!", rating: 5 },
        { id: "r5", name: "G. R. Naidu", text: "A beautiful blend of spiritual wisdom and creativity. The drawing classes and stories were very engaging. Will definitely enroll next year!", rating: 5 }
      ];
  
  const isRegOpen = prahladaBadi.regStatus === "Open";

  const heroTitle = isRegOpen 
    ? "Sri Bhakta Prahlada Summer Training Classes" 
    : "Prahlada Badi – 2027 Coming Soon";

  const heroSubtitle = isRegOpen 
    ? "Inspiring Young Minds with Timeless Values" 
    : "A joyful summer journey filled with spirituality, creativity, culture, confidence, friendship, and values.";

  const displayDates = (dates.en && dates.en.trim() !== "" && dates.en.trim() !== "–" && dates.en.trim() !== "-") ? dates.en : "April 25, 2026 to May 16, 2026";
  const displayTimings = prahladaBadi.timings || "9:30 AM – 12:30 PM";
  const displayVenue = prahladaBadi.venueEn || "ISKCON Kurnool Temple";

  // Lightbox keyboard controls
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % gallery.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, gallery.length]);

  return (
    <SiteLayout>
      {/* Premium Hero Banner */}
      <PageHero
        eyebrow="Summer Program for Kids"
        title={heroTitle}
        subtitle={heroSubtitle}
        pageKey="prahladaBadi"
      >
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-bold shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Prahlada Badi
          </span>
          {prahladaBadi.regStatus === "Open" ? (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
              Registrations Open
            </span>
          ) : prahladaBadi.regStatus === "Closed" ? (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Registrations Closed
            </span>
          ) : (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Coming Soon
            </span>
          )}
        </div>
      </PageHero>

      <div className="bg-gradient-to-b from-[#faf7f0] via-[#f7f2e6] to-[#f4ece0] border-t border-amber-200/40">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-14 md:space-y-16">
        {/* Quick Registration Status Alert banner (Ultra Modern Glassmorphic Look) */}
        <div className={`rounded-3xl sm:rounded-[36px] p-6 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative overflow-hidden transition-all duration-300 ${
          isRegOpen 
            ? "bg-gradient-to-br from-[#06382b] via-[#094d3b] to-[#04281f] text-white border-2 border-emerald-400/40 shadow-[0_20px_50px_rgba(16,185,129,0.25)]" 
            : "bg-gradient-to-br from-[#280c4e] via-[#3a1370] to-[#1e073c] text-white border-2 border-amber-400/40 shadow-[0_20px_50px_rgba(245,158,11,0.25)]"
        }`}>
          {/* Subtle Ambient Glowing Background Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            {/* Elegant Icon Container */}
            <div className={`p-3.5 sm:p-4 rounded-2xl shrink-0 border backdrop-blur-md shadow-md ${
              isRegOpen 
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50" 
                : "bg-amber-400/25 text-amber-300 border-amber-400/50"
            }`}>
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full border shadow-2xs ${
                  isRegOpen
                    ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/50"
                    : "bg-amber-500/30 text-amber-200 border-amber-400/50"
                }`}>
                  {isRegOpen ? "✨ Batch Registrations Open" : "⏳ Summer Camp 2027 Coming Soon"}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {isRegOpen ? "Secure Your Child's Spot Today!" : "Summer Camp Registrations 2027"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl leading-relaxed font-sans">
                {isRegOpen 
                  ? "Fill out the registration form to enroll your children in the upcoming summer batch."
                  : "Registrations for the 2027 Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi will open soon. Give your child an opportunity to spend the summer learning timeless values, discovering hidden talents, building confidence, and growing in a joyful spiritual environment."}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 self-start md:self-auto w-full md:w-auto">
            {isRegOpen ? (
              <a
                href={prahladaBadi.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/30 hover:scale-[1.03] active:scale-95 transition-all duration-250 cursor-pointer text-sm font-sans"
              >
                Register Now <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-bold text-xs sm:text-sm backdrop-blur-md select-none">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Registrations Opening Soon for 2027
              </span>
            )}
          </div>
        </div>

        {/* Intro / Pillars Section */}
        <section className="bg-white rounded-3xl border border-border p-8 md:p-12 shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 left-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-4 space-y-5">
              <div className="space-y-2">
                <span className="text-secondary font-semibold uppercase text-xs tracking-[0.35em] block">About the Program</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
                  Inspiring Young Minds with Timeless Values
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
              <div className="space-y-4 text-foreground/80 leading-relaxed text-sm md:text-base font-sans">
                <p className="font-medium text-primary/90 text-base">
                  Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi is a special summer program organized at ISKCON Kurnool Temple to help children grow with spiritual wisdom, creativity, confidence, discipline, and strong moral values.
                </p>
                <p>
                  Through joyful and engaging activities, children will explore the timeless teachings of the Bhagavad Gita, devotional culture, inspiring stories, music, art, and personality development.
                </p>
              </div>
            </div>

            {/* Middle: Krishna Illustration */}
            <div className="lg:col-span-4 flex justify-center items-center relative min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-orange-300/10 to-transparent rounded-full blur-3xl pointer-events-none scale-75" />
              <img
                src="/krishna.png"
                alt="Bal Krishna"
                className="max-h-[420px] w-auto object-contain drop-shadow-[0_15px_30px_rgba(245,158,11,0.22)] animate-float relative z-10 select-none pointer-events-none"
                onError={(e) => {
                  // Fallback: If image fails to load, hide this container
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {/* Right Content: 5 Pillars / Core Values Grid */}
            <div className="lg:col-span-4 bg-gradient-to-br from-surface to-amber-50/20 p-6 md:p-7 rounded-3xl border border-border/80 space-y-4">
              <h3 className="font-display font-bold text-lg text-primary border-b border-border/60 pb-2 mb-2">
                5 Pillars of Growth
              </h3>
              <div className="space-y-3.5">
                {[
                  { name: "Spiritual Wisdom", desc: "Understanding our roots and eternal relationship with God.", icon: "🕉️", color: "bg-purple-100 text-purple-800 border-purple-200" },
                  { name: "Creativity & Art", desc: "Expressing talent through drama, music, and painting.", icon: "🎨", color: "bg-amber-100 text-amber-800 border-amber-200" },
                  { name: "Self Confidence", desc: "Building stage presence and public speaking abilities.", icon: "🌟", color: "bg-rose-100 text-rose-800 border-rose-200" },
                  { name: "Discipline & Focus", desc: "Developing strong daily habits and mind management.", icon: "🎯", color: "bg-blue-100 text-blue-800 border-blue-200" },
                  { name: "Moral Values", desc: "Cultivating kindness, honesty, and leadership qualities.", icon: "🤝", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
                ].map((val, idx) => (
                  <div key={idx} className="flex gap-3 bg-white p-3 rounded-2xl border border-border/80 hover:scale-[1.01] transition-transform duration-200 shadow-sm items-center">
                    <span className={`text-2xl p-2 rounded-xl shrink-0 ${val.color.split(' ')[0]} ${val.color.split(' ')[1]}`}>{val.icon}</span>
                    <div>
                      <h4 className="font-bold text-primary text-xs tracking-wider uppercase font-sans">{val.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Activities Covered Section (Rich Spiritual Dark Theme) */}
        <div className="space-y-10 bg-gradient-to-br from-[#1c0b3b] via-[#2d1254] to-[#15072b] rounded-3xl sm:rounded-[36px] p-5 sm:p-8 md:p-12 border-2 border-amber-400/30 shadow-[0_20px_60px_rgba(24,8,48,0.5)] relative overflow-hidden text-white">
          {/* Subtle Glowing Background Orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="text-center max-w-xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Curriculum &amp; Activities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Activities Covered
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full mx-auto" />
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-1">
              Traditional and value education delivered in a fun-filled, engaging, and kid-friendly atmosphere.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="py-12 text-center text-white/70 bg-white/5 rounded-2xl border border-dashed border-white/20 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-70" />
              <p className="italic text-sm">Activities list will be populated soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
              {activities.map((act, index) => {
                const actTitleEn = act.titleEn || (act as any).title || `Activity ${index + 1}`;
                const actDescEn = act.descriptionEn || (act as any).descriptionEn || (act as any).description || (act as any).desc;

                return (
                  <div
                    key={act.id || index}
                    className="group relative bg-white/5 hover:bg-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-amber-400/60 shadow-lg hover:shadow-[0_16px_40px_-10px_rgba(245,197,24,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer backdrop-blur-md active:scale-[0.99]"
                  >
                    {/* Top Golden Accent Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    {/* Ambient Hover Light */}
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/15 rounded-full blur-xl group-hover:bg-amber-400/30 transition-all duration-500 pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      {/* Icon & Index Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-amber-400/30 bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-purple-500/20 text-amber-300 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 backdrop-blur-xs">
                          {act.icon || "🌟"}
                        </div>
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-400/40 bg-amber-400/15 text-amber-300 font-mono shadow-xs">
                          Activity {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-2 pt-1">
                        <h4 className="font-display font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors duration-200 leading-snug">
                          {actTitleEn}
                        </h4>
                        {actDescEn && (
                          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed pt-2.5 border-t border-white/10 font-sans font-normal">
                            {actDescEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {prahladaBadi.footerNoteEn && (
            <div className="pt-8 text-center border-t border-white/10 max-w-2xl mx-auto relative z-10">
              <p className="italic text-amber-300/90 text-xs sm:text-sm font-semibold">
                ✨ "{prahladaBadi.footerNoteEn}"
              </p>
            </div>
          )}
        </div>



        {/* Photo Gallery (Two Continuous Marquee Rows - Left to Right & Right to Left) */}
        {gallery.length > 0 && (
          <div className="space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/60 text-amber-900 text-[11px] font-extrabold uppercase tracking-widest shadow-2xs">
                <Camera className="h-3.5 w-3.5 text-amber-600" /> Visual Highlights
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Summer Camp Memories
              </h2>
              <div className="h-1.5 w-20 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 rounded-full mx-auto" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                Capturing moments of joy, devotion, learning, and lifelong friendships in children.
              </p>
            </div>
            
            <div className="space-y-5 group">
              {/* Row 1: Left to Right Marquee */}
              <div className="relative w-full overflow-hidden mask-marquee py-2 select-none">
                <div className="flex w-max animate-[marquee-reverse_35s_linear_infinite] gap-5 px-2 group-hover:[animation-play-state:paused] will-change-transform">
                  {marqueeRow1.map((img, idx) => (
                    <button
                      key={`r1-${img.id || idx}-${idx}`}
                      onClick={() => setLightbox(idx % gallery.length)}
                      className="group/item relative rounded-3xl overflow-hidden border-2 border-amber-200/80 bg-white aspect-square h-56 sm:h-64 w-56 sm:w-64 shrink-0 shadow-[0_4px_20px_rgba(217,119,6,0.08)] hover:shadow-[0_16px_40px_-10px_rgba(217,119,6,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer text-left active:scale-[0.98]"
                    >
                      <img
                        src={img.url}
                        alt={img.label || `Summer Camp Memory`}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-3xl group-hover/item:scale-110 transition-transform duration-500"
                      />

                      {/* Bottom Caption Overlay */}
                      {img.label && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-left transition-all duration-300 flex flex-col justify-end">
                          <span className="text-white text-xs sm:text-sm font-extrabold leading-snug block drop-shadow-sm truncate">
                            {img.label}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Right to Left Marquee */}
              <div className="relative w-full overflow-hidden mask-marquee py-2 select-none">
                <div className="flex w-max animate-[marquee_35s_linear_infinite] gap-5 px-2 group-hover:[animation-play-state:paused] will-change-transform">
                  {marqueeRow2.map((img, idx) => (
                    <button
                      key={`r2-${img.id || idx}-${idx}`}
                      onClick={() => setLightbox((idx + 2) % gallery.length)}
                      className="group/item relative rounded-3xl overflow-hidden border-2 border-amber-200/80 bg-white aspect-square h-56 sm:h-64 w-56 sm:w-64 shrink-0 shadow-[0_4px_20px_rgba(217,119,6,0.08)] hover:shadow-[0_16px_40px_-10px_rgba(217,119,6,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer text-left active:scale-[0.98]"
                    >
                      <img
                        src={img.url}
                        alt={img.label || `Summer Camp Memory`}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-3xl group-hover/item:scale-110 transition-transform duration-500"
                      />

                      {/* Bottom Caption Overlay */}
                      {img.label && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-left transition-all duration-300 flex flex-col justify-end">
                          <span className="text-white text-xs sm:text-sm font-extrabold leading-snug block drop-shadow-sm truncate">
                            {img.label}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials section (Modern Glassmorphic Review Cards) */}
        {reviewsToDisplay.length > 0 && (
          <div className="space-y-10 overflow-hidden py-4">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/60 text-amber-900 text-[11px] font-extrabold uppercase tracking-widest shadow-2xs">
                <Heart className="h-3.5 w-3.5 text-amber-600" /> Parent Testimonials
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                What Parents Say
              </h2>
              <div className="h-1.5 w-20 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 rounded-full mx-auto" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                Hear how Prahlada Badi transformed young lives with values, confidence, and joy.
              </p>
            </div>

            {/* Marquee Wrapper with fading mask edges */}
            <div className="relative w-full overflow-hidden flex gap-6 mask-marquee py-3 select-none">
              {/* Double tracked marquee flex loops */}
              <div className="flex gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] shrink-0 min-w-full">
                {reviewsToDisplay.map((rev, idx) => (
                  <div 
                    key={`${rev.id}-t1-${idx}`} 
                    className="w-[310px] sm:w-[370px] shrink-0 rounded-3xl border-2 border-amber-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(217,119,6,0.06)] hover:shadow-[0_20px_45px_-10px_rgba(217,119,6,0.2)] hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top Golden Accent Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="space-y-3 relative z-10">
                      {/* Rating Stars & Verified Pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-2xs" />
                          ))}
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          Verified Parent Review
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic font-sans relative pt-1">
                        <span className="text-3xl text-amber-400/30 absolute -top-3 -left-1 font-serif select-none">“</span>
                        "{rev.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 border-t border-dashed border-amber-200/70 pt-4 relative z-10">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-extrabold flex items-center justify-center shadow-md text-sm font-sans shrink-0 border border-amber-300">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-extrabold text-primary text-sm font-sans truncate">{rev.name}</h4>
                        <span className="text-[11px] text-muted-foreground/80 font-medium block">Parent of Prahlada Badi Student</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] shrink-0 min-w-full" aria-hidden="true">
                {reviewsToDisplay.map((rev, idx) => (
                  <div 
                    key={`${rev.id}-t2-${idx}`} 
                    className="w-[310px] sm:w-[370px] shrink-0 rounded-3xl border-2 border-amber-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(217,119,6,0.06)] hover:shadow-[0_20px_45px_-10px_rgba(217,119,6,0.2)] hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top Golden Accent Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="space-y-3 relative z-10">
                      {/* Rating Stars & Verified Pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-2xs" />
                          ))}
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          Verified Parent Review
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic font-sans relative pt-1">
                        <span className="text-3xl text-amber-400/30 absolute -top-3 -left-1 font-serif select-none">“</span>
                        "{rev.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 border-t border-dashed border-amber-200/70 pt-4 relative z-10">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-extrabold flex items-center justify-center shadow-md text-sm font-sans shrink-0 border border-amber-300">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-extrabold text-primary text-sm font-sans truncate">{rev.name}</h4>
                        <span className="text-[11px] text-muted-foreground/80 font-medium block">Parent of Prahlada Badi Student</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Registration Button */}
        <div className="text-center space-y-4 pt-6">
          {isRegOpen ? (
            <div className="bg-gradient-to-br from-[#06382b] via-[#094d3b] to-[#04281f] border-2 border-emerald-400/40 rounded-[32px] p-8 md:p-12 max-w-3xl mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.25)] text-center space-y-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-400/40 font-sans uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Limited Seats Available
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Secure Your Child's Spot Today!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg mx-auto leading-relaxed">
                  Fill out the registration form to enroll your children in the upcoming summer batch.
                </p>
              </div>

              <div className="pt-2 relative z-10">
                <a
                  href={prahladaBadi.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 text-base cursor-pointer"
                >
                  Register Now for Summer Camp <ArrowRight className="h-5 w-5" />
                </a>
              </div>
              <p className="text-[11px] text-emerald-200/70 font-sans relative z-10">Clicking will redirect to Google Form registration.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#280c4e] via-[#3a1370] to-[#1e073c] border-2 border-amber-400/40 rounded-[32px] p-8 md:p-12 max-w-3xl mx-auto shadow-[0_20px_50px_rgba(245,158,11,0.25)] text-center space-y-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs border border-amber-400/40 font-sans select-none uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Summer Camp 2027 Coming Soon
                </span>
                <p className="text-white font-extrabold text-2xl sm:text-3xl font-display">Registrations Opening Soon for 2027</p>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-200/90 leading-relaxed font-sans max-w-2xl mx-auto relative z-10">
                <p>
                  Registrations for the 2027 Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi will open soon. Give your child an opportunity to spend the summer learning timeless values, discovering hidden talents, building confidence, and growing in a joyful spiritual environment.
                </p>
                <p className="font-semibold text-amber-300 border-t border-white/10 pt-4">
                  Stay tuned for registration dates, program schedule, age groups, and complete details.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>

    {/* Gallery Lightbox modal */}
      {lightbox !== null && gallery[lightbox] && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <button 
            onClick={() => setLightbox(null)} 
            className="absolute top-4 right-4 text-white hover:text-secondary p-2 transition cursor-pointer" 
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>
          
          <button 
            onClick={() => setLightbox((i) => (i! - 1 + gallery.length) % gallery.length)} 
            className="absolute left-4 text-white hover:text-secondary p-3 transition cursor-pointer" 
            aria-label="Previous image"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          
          <button 
            onClick={() => setLightbox((i) => (i! + 1) % gallery.length)} 
            className="absolute right-4 text-white hover:text-secondary p-3 transition cursor-pointer" 
            aria-label="Next image"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
          
          <figure className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-3">
            <img src={gallery[lightbox].url} alt={gallery[lightbox].label} className="max-h-[80vh] w-auto rounded-lg object-contain" />
            {gallery[lightbox].label && (
              <figcaption className="text-white/95 text-sm font-semibold">{gallery[lightbox].label}</figcaption>
            )}
          </figure>
        </div>
      )}
    </SiteLayout>
  );
}
