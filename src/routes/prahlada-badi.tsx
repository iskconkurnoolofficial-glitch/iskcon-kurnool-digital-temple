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
  CheckCircle2
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
        { id: "g1", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80", label: "Art & Drawing Classes" },
        { id: "g2", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80", label: "Storytelling & Values" },
        { id: "g3", url: "https://images.unsplash.com/photo-1460518451285-cd7afbc11b0b?auto=format&fit=crop&w=600&q=80", label: "Music & Devotional Songs" },
        { id: "g4", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80", label: "Joyful Group Activities" }
      ];
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

      <div className="bg-gradient-to-b from-[#fef5d1] via-[#fdf0b5] to-[#fffbeb] border-t border-amber-200/40">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Quick Registration Status Alert banner */}
        <div className={`rounded-[32px] border p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative transition-all duration-300 ${
          isRegOpen 
            ? "border-emerald-100 bg-emerald-50/20 shadow-sm" 
            : "border-orange-200/80 bg-white shadow-[0_15px_35px_-10px_rgba(245,158,11,0.07)]"
        }`}>
          <div className="flex items-start gap-4 relative z-10">
            {/* Elegant Icon Container */}
            <div className={`p-3.5 rounded-2xl shrink-0 border ${
              isRegOpen 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                : "bg-orange-50 text-orange-650 border-orange-150/50"
            }`}>
              <Sparkles className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className={`font-display text-xl font-bold ${isRegOpen ? "text-emerald-950" : "text-orange-950"}`}>
                {isRegOpen ? "Secure Your Child's Spot Today!" : "Summer Camp Registrations"}
              </h2>
              <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">
                {isRegOpen 
                  ? "Fill out the registration form to enroll your children in the upcoming summer batch."
                  : "Registrations for the 2027 Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi will open soon. Give your child an opportunity to spend the summer learning timeless values, discovering hidden talents, building confidence, and growing in a joyful spiritual environment."}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 self-start md:self-auto">
            {isRegOpen ? (
              <a
                href={prahladaBadi.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 hover:scale-[1.02] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all duration-250 cursor-pointer text-sm font-sans"
              >
                Register Now <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/15 border-none font-sans select-none">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
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


        {/* Activities Covered Section */}
        <div className="space-y-10 bg-gradient-to-b from-surface/40 to-background rounded-[40px] p-8 md:p-12 border border-border/60 shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-accent font-semibold uppercase text-xs tracking-[0.35em]">Curriculum</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Activities Covered</h2>
            <div className="h-1 w-12 bg-secondary mx-auto rounded-full mt-2" />
            <p className="text-sm text-muted-foreground pt-1">Traditional and value education delivered in a fun-filled kid-friendly manner.</p>
          </div>

          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground italic">Activities list will be populated soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act, index) => {
                const theme = cardColorThemes[index % cardColorThemes.length];
                return (
                  <div 
                    key={act.id} 
                    className={`group rounded-3xl p-6 border shadow-sm hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${theme.bg}`}
                  >
                    <div className="space-y-4">
                      {/* Icon & Index Badge */}
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border group-hover:scale-110 transition-transform duration-300 ${theme.iconBg}`}>
                          {act.icon}
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border font-sans ${theme.badge}`}>
                          Activity {index + 1}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h4 className="font-display font-bold text-lg text-primary group-hover:text-accent transition-colors duration-250">
                          {act.titleEn}
                        </h4>
                        {act.descriptionEn && (
                          <p className="text-sm text-foreground/75 leading-relaxed pt-2 border-t border-dashed border-border/50 font-sans">
                            {act.descriptionEn}
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
            <div className="pt-8 text-center border-t border-dashed border-border/85 max-w-2xl mx-auto">
              <p className="italic text-muted-foreground text-sm font-semibold">
                ✨ "{prahladaBadi.footerNoteEn}"
              </p>
            </div>
          )}
        </div>



        {/* Photo Gallery Grid */}
        {gallery.length > 0 && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Memories</span>
              <h2 className="font-display text-3xl font-bold text-primary">Summer Camp Memories</h2>
              <div className="h-1 w-12 bg-secondary mx-auto rounded-full mt-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {gallery.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setLightbox(idx)}
                  className="group rounded-3xl overflow-hidden border border-border/85 bg-white aspect-square shadow-sm relative hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300 w-full cursor-pointer"
                >
                  <img src={img.url} alt={img.label} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {img.label && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs font-bold truncate block">{img.label}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials section */}
        {reviewsToDisplay.length > 0 && (
          <div className="space-y-8 overflow-hidden py-4">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-accent font-semibold uppercase text-xs tracking-[0.25em]">Reviews</span>
              <h2 className="font-display text-3xl font-bold text-primary">What Parents Say</h2>
              <div className="h-1 w-12 bg-secondary mx-auto rounded-full mt-2" />
            </div>

            {/* Marquee Wrapper with fading edges */}
            <div className="relative w-full overflow-hidden flex gap-6 mask-marquee py-2 select-none">
              {/* Double tracked marquee flex loops */}
              <div className="flex gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] shrink-0 min-w-full">
                {reviewsToDisplay.map((rev, idx) => (
                  <div 
                    key={`${rev.id}-t1-${idx}`} 
                    className="w-[300px] md:w-[350px] shrink-0 rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-elegant transition-all duration-300 space-y-4 flex flex-col justify-between"
                  >
                    <p className="text-sm text-foreground/80 leading-relaxed italic font-sans relative">
                      <span className="text-4xl text-primary/10 absolute -top-5 -left-2 font-serif">“</span>
                      "{rev.text}"
                    </p>
                    <div className="flex items-center gap-3.5 border-t border-dashed border-border/60 pt-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold flex items-center justify-center shadow-sm text-sm font-sans">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-sm font-sans">{rev.name}</h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] shrink-0 min-w-full" aria-hidden="true">
                {reviewsToDisplay.map((rev, idx) => (
                  <div 
                    key={`${rev.id}-t2-${idx}`} 
                    className="w-[300px] md:w-[350px] shrink-0 rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-elegant transition-all duration-300 space-y-4 flex flex-col justify-between"
                  >
                    <p className="text-sm text-foreground/80 leading-relaxed italic font-sans relative">
                      <span className="text-4xl text-primary/10 absolute -top-5 -left-2 font-serif">“</span>
                      "{rev.text}"
                    </p>
                    <div className="flex items-center gap-3.5 border-t border-dashed border-border/60 pt-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold flex items-center justify-center shadow-sm text-sm font-sans">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-sm font-sans">{rev.name}</h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
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
            <div className="space-y-2">
              <a
                href={prahladaBadi.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-hero text-primary-foreground font-bold hover:shadow-gold hover:scale-[1.02] transition-all duration-300 text-base cursor-pointer"
              >
                Register Now for Summer Camp <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-xs text-muted-foreground font-sans">Clicking will redirect to Google Form registration.</p>
            </div>
          ) : (
            <div className="bg-white border border-orange-200/80 rounded-[32px] p-10 md:p-12 max-w-3xl mx-auto shadow-[0_15px_35px_-10px_rgba(245,158,11,0.07)] text-center space-y-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-850 font-bold text-xs border border-orange-200/50 font-sans select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Registrations Opening Soon for 2027
                </span>
                <p className="text-orange-950 font-bold text-2xl font-display">Registrations Opening Soon for 2027</p>
              </div>
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
                <p>
                  Registrations for the 2027 Sri Bhakta Prahlada Summer Training Classes – Prahlada Badi will open soon. Give your child an opportunity to spend the summer learning timeless values, discovering hidden talents, building confidence, and growing in a joyful spiritual environment.
                </p>
                <p className="font-semibold text-orange-900 border-t border-dashed border-orange-200/50 pt-4">
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
