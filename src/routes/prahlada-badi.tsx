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
  Sparkles
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

function PrahladaBadiPage() {
  const { prahladaBadi } = useAdmin();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const dates = getFormattedDateRange(prahladaBadi.startDate, prahladaBadi.endDate);
  const activities = [...(prahladaBadi.activities || [])].sort((a, b) => a.order - b.order);
  const gallery = prahladaBadi.gallery || [];
  const visibleReviews = (prahladaBadi.reviews || []).filter((r) => r.visible);
  
  const isRegOpen = prahladaBadi.regStatus === "Open";

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
        eyebrow="Summer Program for Kids • పిల్లల వేసవి శిక్షణ తరగతులు"
        title="Sri Bhakta Prahlada Summer Training Classes"
        subtitle="శ్రీ భక్త ప్రహ్లాద వేసవి శిక్షణ తరగతులు"
        image={prahladaBadi.heroImage}
        pageKey="prahladaBadi"
      >
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Prahlada Badi / ప్రహ్లాద బడి
          </span>
          {prahladaBadi.regStatus === "Open" ? (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
              Registrations Open
            </span>
          ) : prahladaBadi.regStatus === "Closed" ? (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider">
              Registrations Closed
            </span>
          ) : (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          )}
        </div>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-12">
        {/* Quick Registration Status Alert banner */}
        <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          isRegOpen 
            ? "border-emerald-500 bg-emerald-50/50 shadow-sm" 
            : "border-amber-500 bg-amber-50/50 shadow-sm"
        }`}>
          <div className="space-y-1">
            <h2 className={`font-display text-xl font-bold ${isRegOpen ? "text-emerald-800" : "text-amber-850"}`}>
              {isRegOpen ? "Secure Your Child's Spot Today!" : "Summer Camp Registrations"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRegOpen 
                ? "Fill out the registration form to enroll your children in the upcoming summer batch."
                : "Registrations for this summer program will open shortly. Stay tuned!"}
            </p>
          </div>
          {isRegOpen ? (
            <a
              href={prahladaBadi.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 hover:scale-[1.02] shadow shadow-emerald-600/20 transition duration-300 shrink-0"
            >
              Register Now <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-amber-500/20 text-amber-800 font-bold text-sm shrink-0">
              Registrations Opening Soon
            </span>
          )}
        </div>

        {/* Schedule, Venue & Quick Info Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Dates */}
          <div className="rounded-2xl bg-white border border-border/80 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3.5 rounded-xl bg-purple-50 text-primary shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Program Dates</span>
              <div className="space-y-0.5">
                <p className="font-bold text-foreground text-sm">{dates.en}</p>
                <p className="text-xs text-muted-foreground font-medium">{dates.tel}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Timings */}
          <div className="rounded-2xl bg-white border border-border/80 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Timings</span>
              <p className="font-bold text-foreground text-sm leading-snug">{prahladaBadi.timings}</p>
            </div>
          </div>

          {/* Card 3: Venue */}
          <div className="rounded-2xl bg-white border border-border/80 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-500 shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-2 min-w-0">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Venue</span>
              <div className="space-y-0.5">
                <p className="font-bold text-foreground text-sm truncate">{prahladaBadi.venueEn}</p>
                <p className="text-xs text-muted-foreground font-medium truncate">{prahladaBadi.venueTel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Covered Section */}
        <div className="space-y-8 bg-glass rounded-3xl p-8 md:p-12 border border-border/80 shadow-elegant">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-accent font-semibold uppercase text-xs tracking-[0.35em]">Curriculum</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Activities Covered</h2>
            <p className="text-sm text-muted-foreground">Traditional and value education delivered in a fun-filled kid-friendly manner.</p>
          </div>

          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground">Activities list will be populated soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activities.map((act, index) => {
                const colorClass = badgeColors[index % badgeColors.length];
                return (
                  <div 
                    key={act.id} 
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-border/50 shadow-sm hover:scale-[1.01] hover:shadow-md transition"
                  >
                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}>
                      {index + 1}
                    </div>
                    <div className="text-2xl shrink-0">{act.icon}</div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-primary text-sm truncate">{act.titleEn}</h4>
                      <p className="text-xs text-muted-foreground truncate">{act.titleTel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(prahladaBadi.footerNoteEn || prahladaBadi.footerNoteTel) && (
            <div className="pt-6 text-center border-t border-dashed border-border/85">
              {prahladaBadi.footerNoteEn && (
                <p className="italic text-muted-foreground text-sm font-medium">
                  ✨ "{prahladaBadi.footerNoteEn}"
                </p>
              )}
              {prahladaBadi.footerNoteTel && (
                <p className="italic text-primary/70 text-xs font-semibold mt-1">
                  ✨ "{prahladaBadi.footerNoteTel}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Fee Details Section */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-accent font-semibold uppercase text-xs tracking-wider">Invest in Values</span>
            <h2 className="font-display text-3xl font-bold text-primary">Fee Structure</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Fee Tier 1 */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between text-center relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 to-purple-600" />
              <div className="space-y-2 my-4">
                <h3 className="font-bold text-lg text-primary">{prahladaBadi.feeTier1LabelEn}</h3>
                <p className="text-xs text-muted-foreground font-semibold">{prahladaBadi.feeTier1LabelTel}</p>
                <div className="pt-4">
                  <span className="text-3xl font-extrabold text-foreground">{prahladaBadi.feeTier1Amount}</span>
                </div>
              </div>
            </div>

            {/* Fee Tier 2 */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between text-center relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent to-amber-500" />
              <div className="space-y-2 my-4">
                <h3 className="font-bold text-lg text-primary">{prahladaBadi.feeTier2LabelEn}</h3>
                <p className="text-xs text-muted-foreground font-semibold">{prahladaBadi.feeTier2LabelTel}</p>
                <div className="pt-4">
                  <span className="text-3xl font-extrabold text-foreground">{prahladaBadi.feeTier2Amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="rounded-3xl bg-[#3a2417] text-amber-50 p-8 md:p-10 border border-amber-900/20 shadow-elegant max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-1">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest">Enquiries</span>
            <h3 className="font-display text-2xl font-bold">For Details Contact</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-bold text-white">{prahladaBadi.contactName}</p>
            <p className="text-xs text-amber-200/80 font-semibold uppercase tracking-wide">
              {prahladaBadi.contactTitleEn} / {prahladaBadi.contactTitleTel}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {[prahladaBadi.phone1, prahladaBadi.phone2, prahladaBadi.phone3].filter(Boolean).map((phone, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/10">
                <span className="text-xs font-semibold">{phone}</span>
                <div className="flex gap-1.5 ml-2">
                  <a href={`tel:${phone}`} className="p-1.5 rounded-lg bg-amber-500 text-primary hover:scale-105 transition" aria-label={`Call ${phone}`}>
                    <Phone className="h-3.5 w-3.5 fill-current" />
                  </a>
                  <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-green-500 text-white hover:scale-105 transition" aria-label={`WhatsApp ${phone}`}>
                    <MessageCircle className="h-3.5 w-3.5 fill-current" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery Grid */}
        {gallery.length > 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-accent font-semibold uppercase text-xs tracking-wider">Memories</span>
              <h2 className="font-display text-3xl font-bold text-primary">Summer camp Memories</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setLightbox(idx)}
                  className="group rounded-2xl overflow-hidden border border-border/60 bg-white aspect-square shadow-sm relative hover:shadow-md transition duration-300 w-full"
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {img.label && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left opacity-0 group-hover:opacity-100 transition duration-350">
                      <span className="text-white text-xs font-semibold truncate block">{img.label}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials section */}
        {visibleReviews.length > 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-accent font-semibold uppercase text-xs tracking-wider">Reviews</span>
              <h2 className="font-display text-3xl font-bold text-primary">What Parents Say</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm">{rev.name}</h4>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3 w-3 fill-secondary text-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
              ))}
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
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-accent text-white font-bold hover:scale-[1.03] shadow-lg shadow-accent/20 hover:shadow-accent/35 transition duration-300"
              >
                Register Now for Summer Camp <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-xs text-muted-foreground">Clicking will redirect to Google Form registration.</p>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 max-w-lg mx-auto">
              <p className="text-amber-800 font-bold">Registrations will open soon — stay tuned!</p>
              <p className="text-xs text-muted-foreground mt-1">Please check back closer to summer or contact administrators for prior bookings.</p>
            </div>
          )}
        </div>

        {/* Link back to Admin dashboard */}
        <Link
          to="/admin"
          className="block rounded-2xl bg-[#3a2417] text-amber-50 p-5 hover:opacity-95 transition"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-secondary" />
            <span className="font-semibold">Admin Panel</span>
          </div>
          <p className="text-sm opacity-80 mt-1">Manage settings, activities curriculum list, photos gallery and parents reviews</p>
        </Link>
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
