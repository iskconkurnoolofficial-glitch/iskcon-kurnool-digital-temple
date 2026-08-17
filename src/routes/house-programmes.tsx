import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import {
  Home,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  Navigation,
  CheckCircle2,
  Heart,
  Music,
  BookOpen,
  Flame,
  Flower2,
  Radio,
  Smile,
  X,
  Send,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Camera,
  Layers,
  ChevronRight,
  LocateFixed,
  Sun,
  Star,
  Check,
  Building,
  HeartHandshake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/house-programmes")({
  head: () => ({
    meta: [
      { title: "House Programmes — ISKCON Kurnool" },
      {
        name: "description",
        content:
          "Bring the joy of Krishna consciousness into your home. Book a devotional house programme with Hare Krishna Kirtan, Bhagavad Gita discourses, and sanctified Prasadam from ISKCON Kurnool.",
      },
      { property: "og:title", content: "House Programmes — ISKCON Kurnool" },
      {
        property: "og:description",
        content:
          "Conduct sacred home gatherings with family and friends. Chant, learn, celebrate, and honour prasadam together.",
      },
    ],
  }),
  component: HouseProgrammesPage,
});

function HouseProgrammesPage() {
  const { houseProgrammes, addHouseProgrammeRequest } = useAdmin();
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Activity Filter State
  const [activityCategory, setActivityCategory] = useState<string>("all");

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationArea, setLocationArea] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("Evening (5:30 PM – 7:30 PM)");
  const [participantsCount, setParticipantsCount] = useState("10 – 25 Devotees");
  const [fullAddress, setFullAddress] = useState("");
  const [message, setMessage] = useState("");

  // Location Geolocation State
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("");
  const [locationDetected, setLocationDetected] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cleanPhone = (houseProgrammes.contactPhone || "+919505377520").replace(/\D/g, "");
  const whatsappNum = (houseProgrammes.whatsappNumber || houseProgrammes.contactPhone || "919505377520").replace(/\D/g, "");
  const formattedWhatsapp = whatsappNum.length === 10 ? `91${whatsappNum}` : whatsappNum;

  const contactWhatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
    "Hare Krishna! 🙏 I would like to inquire about arranging an ISKCON House Programme at my home."
  )}`;

  // Detect GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setGoogleMapsUrl(mapUrl);
        setLocationDetected(true);

        // Reverse geocoding with OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const geoData = await res.json();
            if (geoData && geoData.display_name) {
              if (!fullAddress) setFullAddress(geoData.display_name);
              const area =
                geoData.address?.suburb ||
                geoData.address?.neighbourhood ||
                geoData.address?.city_district ||
                geoData.address?.city ||
                "";
              if (area && !locationArea) setLocationArea(area);
            }
          }
        } catch (e) {
          // optional reverse geocode
        }

        setIsFetchingLocation(false);
        toast.success("Exact GPS location captured successfully!");
      },
      (err) => {
        setIsFetchingLocation(false);
        console.error("Location error", err);
        toast.error("Unable to retrieve location. Please check device permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !locationArea.trim() || !preferredDate.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await addHouseProgrammeRequest({
        name: name.trim(),
        phone: phone.trim(),
        locationArea: locationArea.trim(),
        preferredDate,
        preferredTime,
        participantsCount,
        fullAddress: fullAddress.trim() || `${locationArea.trim()}, Kurnool`,
        googleMapsUrl: googleMapsUrl || undefined,
        latitude,
        longitude,
        message: message.trim() || undefined,
      });

      setSubmitted(true);
      toast.success("House Programme requested successfully!");
    } catch (err) {
      toast.error("Failed to submit request. Please try contacting via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setLocationArea("");
    setPreferredDate("");
    setPreferredTime("Evening (5:30 PM – 7:30 PM)");
    setParticipantsCount("10 – 25 Devotees");
    setFullAddress("");
    setMessage("");
    setLatitude(undefined);
    setLongitude(undefined);
    setGoogleMapsUrl("");
    setLocationDetected(false);
    setSubmitted(false);
  };

  const timeOptions = [
    { label: "Morning", time: "7:30 AM – 9:30 AM" },
    { label: "Noon", time: "11:00 AM – 1:00 PM" },
    { label: "Evening", time: "5:30 PM – 7:30 PM" },
    { label: "Night", time: "7:00 PM – 9:00 PM" },
    { label: "Flexible", time: "As Discussed" },
  ];

  const scrollToForm = () => {
    const el = document.getElementById("request-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        document.getElementById("form-name-input")?.focus();
      }, 400);
    }
  };

  const handleSelectActivity = (actTitle: string) => {
    setMessage((prev) =>
      prev ? `${prev}, ${actTitle}` : `I would like to request: ${actTitle}`
    );
    scrollToForm();
  };

  return (
    <SiteLayout>
      {/* ========================================================================= */}
      {/* 1. COMMON HERO SECTION (CONSISTENT WITH OTHER SECTIONS & BRAND DESIGN) */}
      {/* ========================================================================= */}
      <PageHero
        eyebrow="Activities"
        title={houseProgrammes.heroTitle || "House Programmes"}
        subtitle={
          houseProgrammes.heroSubtitle ||
          "Bring the sacred atmosphere of the temple into your home with joyful chanting, spiritual discourses, and divine prasadam."
        }
        image={
          houseProgrammes.heroImage ||
          "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1350&q=80"
        }
        pageKey="houseProgrammes"
      >
        <button
          onClick={scrollToForm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-secondary hover:bg-secondary/95 text-secondary-foreground font-semibold px-6 py-2.5 sm:px-7 sm:py-3 shadow-gold transition hover:scale-[1.02] text-xs sm:text-sm cursor-pointer"
        >
          <Home className="h-4 w-4 shrink-0" />
          Request a House Programme
        </button>

        <a
          href={contactWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold px-6 py-2.5 sm:px-7 sm:py-3 transition hover:scale-[1.02] text-xs sm:text-sm backdrop-blur-sm"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-300" />
          Contact Us for House Programme
        </a>
      </PageHero>

      {/* ========================================================================= */}
      {/* 2. WHAT IS A HOUSE PROGRAMME SECTION (CENTERED CONTENT WITH LEFT & RIGHT IMAGES) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Image Card */}
            <div className="lg:col-span-3 order-2 lg:order-1 flex justify-center w-full">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-border bg-white p-2.5 group hover:shadow-xl transition-all duration-300">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <img
                    src={
                      houseProgrammes.aboutImage ||
                      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Devotional Home Kirtan"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-md text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border border-white/20">
                    <Sparkles className="h-3 w-3" /> Chanting
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="font-bold text-xs">Joyful Hare Krishna Kirtan</span>
                    <span className="text-[10px] text-white/80">Purifying the home atmosphere</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content Column */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-center space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-bold">
                  <Sparkles className="h-4 w-4" /> Spiritual Sanctuary at Home
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
                  {houseProgrammes.aboutTitle || "What is a House Programme?"}
                </h2>
                <div className="h-1.5 w-20 bg-secondary rounded-full mx-auto" />
              </div>

              <div className="text-foreground/90 space-y-4 text-sm sm:text-base leading-relaxed font-sans font-normal max-w-2xl mx-auto">
                {(houseProgrammes.aboutDesc ||
                  "House Programmes are devotional gatherings conducted in devotees' homes, where families, neighbours, and friends come together to practice Krishna consciousness in a simple, joyful, and uplifting atmosphere.\n\nWhether you are celebrating a special occasion, an anniversary, birthday, house warming, or simply seeking divine peace and spiritual association, temple devotees visit your home to conduct sacred kirtans, discuss timeless wisdom from the Bhagavad Gita, and share delicious Krishna prasadam."
                )
                  .split("\n\n")
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>

              {/* 4 Feature Checklist Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-xl mx-auto">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground bg-white p-3 rounded-2xl border shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Simple &amp; Joyful Home Atmosphere</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground bg-white p-3 rounded-2xl border shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Suitable for Families &amp; Children</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground bg-white p-3 rounded-2xl border shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Temple Devotees Visit Your Doorstep</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground bg-white p-3 rounded-2xl border shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Free &amp; Pure Devotional Service</span>
                </div>
              </div>

              {/* Centered CTA */}
              <div className="pt-2">
                <button
                  onClick={scrollToForm}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-md transition hover:scale-105 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" /> Book for Your Home
                </button>
              </div>
            </div>

            {/* Right Image Card */}
            <div className="lg:col-span-3 order-3 flex justify-center w-full">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-border bg-white p-2.5 group hover:shadow-xl transition-all duration-300">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <img
                    src={
                      houseProgrammes.aboutImageRight ||
                      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Spiritual Discourse & Harati"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-md text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border border-white/20">
                    <Sparkles className="h-3 w-3" /> Bhagavad Gita
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="font-bold text-xs">Wisdom &amp; Prasadam</span>
                    <span className="text-[10px] text-white/80">Blessings for the entire family</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ACTIVITIES CAN INCLUDE (WARM GOLD GRADIENT BACKGROUND & CLEAN GRID) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#fff8e8] via-[#fef1cb] to-[#fff4d6] relative overflow-hidden border-y border-amber-200/60">
        {/* Warm golden background ambient glow orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#d9770612_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 space-y-10 relative">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-bold">
              <Heart className="h-4 w-4" /> Devotional Offerings
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
              Activities Can Include
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans">
              You can choose any combination of these sacred devotional activities for your home gathering.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "All Activities (10)", icon: Sparkles },
              { id: "kirtan", label: "Kirtan & Music", icon: Music },
              { id: "wisdom", label: "Gita & Wisdom", icon: BookOpen },
              { id: "puja", label: "Puja & Harati", icon: Flame },
              { id: "prasadam", label: "Prasadam Feast", icon: Heart },
              { id: "family", label: "Family & Meditation", icon: Users },
            ].map((cat) => {
              const active = activityCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActivityCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                      : "bg-white hover:bg-surface text-foreground border-border/80"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-secondary" : "text-primary"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Activities Grid List */}
          {(() => {
            const allActs = houseProgrammes.activities || [];
            const filtered = allActs.filter((act) => {
              if (activityCategory === "all") return true;
              const t = act.title.toLowerCase();
              if (activityCategory === "kirtan") return t.includes("kirtan") || t.includes("bhajan") || t.includes("sankirtana");
              if (activityCategory === "wisdom") return t.includes("gita") || t.includes("discussion") || t.includes("spiritual");
              if (activityCategory === "puja") return t.includes("harati") || t.includes("puja") || t.includes("festival");
              if (activityCategory === "prasadam") return t.includes("prasadam");
              if (activityCategory === "family") return t.includes("family") || t.includes("japa") || t.includes("meditation");
              return true;
            });

            const defaultActivityImages: Record<string, string> = {
              act_1: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
              act_2: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
              act_3: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
              act_4: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
              act_5: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
              act_6: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
              act_7: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
              act_8: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
              act_9: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
              act_10: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((act, idx) => {
                  const numStr = String(idx + 1).padStart(2, "0");
                  const actImg =
                    act.image ||
                    defaultActivityImages[act.id] ||
                    defaultActivityImages[`act_${(idx % 10) + 1}`] ||
                    "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80";

                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="group bg-white rounded-3xl border border-border/80 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-amber-400/50 relative overflow-hidden"
                    >
                      {/* Glow background on hover */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition duration-500 pointer-events-none" />

                      <div className="space-y-4 relative z-10">
                        {/* Visible Activity Image Banner (Increased Height, Crystal Clear) */}
                        <div className="relative h-60 sm:h-64 w-full rounded-2xl overflow-hidden shadow-sm bg-muted group/img">
                          <img
                            src={actImg}
                            alt={act.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl sm:text-2xl font-bold text-primary group-hover:text-primary transition">
                              {act.title}
                            </h3>
                            <span className="text-lg font-display font-extrabold text-border group-hover:text-amber-400/60 transition font-mono">
                              #{numStr}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
                            {act.desc}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-end relative z-10">
                        <button
                          onClick={() => handleSelectActivity(act.title)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary bg-primary/10 px-4 py-2 rounded-xl transition duration-200 cursor-pointer shadow-xs"
                        >
                          <span>Request this Activity</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (5 STEP PROCESS CARDS) */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#260e4a] via-[#3a146e] to-[#20083e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Layers className="h-3.5 w-3.5" /> Simple 5-Step Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
              How It Works
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm md:text-base text-white/80">
              We make it effortless to organize a blissful devotional gathering at your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {(houseProgrammes.howItWorks || []).map((step) => (
              <div
                key={step.step}
                className="bg-white/10 border border-white/15 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4 hover:bg-white/15 transition duration-300 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-950 font-display font-bold text-lg grid place-items-center shadow-gold">
                      {step.step}
                    </div>
                    <span className="text-2xl">{step.icon || "✨"}</span>
                  </div>

                  <h3 className="font-display font-bold text-base text-amber-300 group-hover:text-white transition">
                    {step.title}
                  </h3>

                  <p className="text-xs text-white/85 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="text-[11px] text-white/50 font-mono pt-2 border-t border-white/10">
                  Step 0{step.step}
                </div>
              </div>
            ))}
          </div>

          {/* Action trigger */}
          <div className="text-center pt-4">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,197,24,0.35)] text-xs sm:text-sm transition hover:scale-105 cursor-pointer"
            >
              <Send className="h-4 w-4" /> Start by Requesting a Programme
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PHOTO GALLERY SECTION */}
      {/* ========================================================================= */}
      {houseProgrammes.gallery && houseProgrammes.gallery.length > 0 && (
        <section id="gallery" className="py-16 md:py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-bold">
                <Camera className="h-4 w-4" /> Visual Moments
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">
                House Programme Gallery
              </h2>
              <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">
                Glimpses of bliss, soulful chanting, and sacred fellowship in devotees' homes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {houseProgrammes.gallery.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer bg-white border relative aspect-[4/3]"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4 text-white">
                    <span className="font-bold text-sm">{photo.title}</span>
                    {photo.caption && <span className="text-xs text-white/80">{photo.caption}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. HOUSE PROGRAMME: LEFT FORM DETAILS & RIGHT SACRED SPIRITUAL ATMOSPHERE IMAGE */}
      {/* ========================================================================= */}
      <section id="request-form-section" className="py-16 md:py-24 bg-background relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-[2.5rem] p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#280c4e] via-[#3e1374] to-[#20083c] text-white border-2 border-amber-400/40 shadow-[0_20px_60px_rgba(40,12,78,0.5)] overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              
              {/* ================================================================= */}
              {/* LEFT COLUMN: REQUEST FORM DETAILS FOR HOUSE PROGRAMME */}
              {/* ================================================================= */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-300/30 text-foreground relative overflow-hidden h-full flex flex-col justify-between">
                  {/* Top Accent Gradient Bar */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-700 via-amber-400 to-orange-500" />

                  {submitted ? (
                    /* Submission Success Screen */
                    <div className="py-8 text-center space-y-6 my-auto animate-fade-in">
                      <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto shadow-inner">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                          Hare Krishna! 🙏
                        </span>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                          House Programme Request Received!
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Thank you, <strong className="text-foreground">{name}</strong>. Our temple coordination team will contact you shortly to plan the devotional programme for your home.
                        </p>
                      </div>

                      <div className="bg-surface p-4 rounded-2xl border text-xs text-foreground/80 max-w-md mx-auto space-y-1.5 text-left">
                        <div><strong>Preferred Date:</strong> {preferredDate} ({preferredTime})</div>
                        <div><strong>Location / Area:</strong> {locationArea}</div>
                        {locationDetected && <div className="text-emerald-700 font-semibold">📍 Exact GPS Location coordinates attached.</div>}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <a
                          href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
                            `Hare Krishna! 🙏 I just submitted a House Programme request for ${preferredDate} at ${locationArea} under name ${name} (${phone}). Please confirm!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition hover:scale-105"
                        >
                          <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                        </a>
                        <button
                          onClick={resetForm}
                          className="w-full sm:w-auto px-7 py-3.5 rounded-full border bg-white hover:bg-muted text-sm font-semibold transition cursor-pointer"
                        >
                          Book Another Programme
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Interactive Request Form */
                    <div className="space-y-5">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-secondary font-bold mb-1">
                          <Home className="h-3.5 w-3.5" /> Book Devotional Gathering
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                          Request a House Programme
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Fill in your details below to schedule sacred kirtan, Gita discourse, and prasadam at your residence.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                        {/* Devotee Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              id="form-name-input"
                              type="text"
                              required
                              placeholder="e.g. Ramesh Kumar"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Phone / WhatsApp Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                            />
                          </div>
                        </div>

                        {/* Location / Area & Number of participants */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Location / Area in Kurnool <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Nandyal Checkpost, Kurnool"
                              value={locationArea}
                              onChange={(e) => setLocationArea(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Number of Participants
                            </label>
                            <select
                              value={participantsCount}
                              onChange={(e) => setParticipantsCount(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer"
                            >
                              <option value="5 – 10 Family Members">5 – 10 Family Members</option>
                              <option value="10 – 25 Devotees">10 – 25 Devotees</option>
                              <option value="25 – 50 Devotees">25 – 50 Devotees</option>
                              <option value="50+ Grand Gathering">50+ Grand Gathering</option>
                            </select>
                          </div>
                        </div>

                        {/* Preferred Date & Preferred Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Preferred Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split("T")[0]}
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                              Preferred Time
                            </label>
                            <select
                              value={preferredTime}
                              onChange={(e) => setPreferredTime(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer"
                            >
                              {timeOptions.map((opt) => (
                                <option key={opt.time} value={`${opt.label} (${opt.time})`}>
                                  {opt.label} ({opt.time})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Full Address & GPS Auto-detect */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                              Full Home Address <span className="text-rose-500">*</span>
                            </label>
                            {/* Auto-Detect Exact GPS Location Button */}
                            <button
                              type="button"
                              onClick={handleDetectLocation}
                              disabled={isFetchingLocation}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition border border-blue-200 cursor-pointer"
                            >
                              {isFetchingLocation ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" /> Fetching GPS...
                                </>
                              ) : locationDetected ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> GPS Attached
                                </>
                              ) : (
                                <>
                                  <LocateFixed className="h-3 w-3" /> 📍 Auto-Detect Exact Location
                                </>
                              )}
                            </button>
                          </div>
                          <textarea
                            required
                            rows={2}
                            placeholder="House / Flat No., Street, Landmark, Kurnool..."
                            value={fullAddress}
                            onChange={(e) => setFullAddress(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                          />
                          {locationDetected && latitude && longitude && (
                            <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 mt-1 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                              <Navigation className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              Exact GPS coordinates ({latitude.toFixed(6)}, {longitude.toFixed(6)}) captured for temple team.
                            </div>
                          )}
                        </div>

                        {/* Message / Special Requirements */}
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Occasion / Special Requirements (Optional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Birthday celebration, anniversary, gotram details, or specific bhajans requested..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold shadow-gold text-base transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Submitting Request...
                              </>
                            ) : (
                              <>
                                <Send className="h-5 w-5" /> Request a House Programme
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Your details are safe and shared only with the ISKCON Kurnool coordination team.
                        </p>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* ================================================================= */}
              {/* RIGHT COLUMN: SACRED SPIRITUAL ATMOSPHERE IMAGE & DEVOTIONAL DETAILS */}
              {/* ================================================================= */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                {/* Prominent Sacred Spiritual Atmosphere Image Card */}
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-black/40 group min-h-[360px] lg:min-h-[400px] flex flex-col justify-end">
                  {/* Decorative corner glow */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

                  <img
                    src={
                      houseProgrammes.quoteImage ||
                      "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=1000&q=80"
                    }
                    alt="House Programme Devotion at Home"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                  />

                  {/* Gradient and text overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white relative z-10">
                    <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 bg-black/50 px-3.5 py-1.5 rounded-full w-fit backdrop-blur-md border border-amber-300/30">
                      <span>🪔</span> Sacred Spiritual Atmosphere
                    </div>
                    <h4 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Devotional Home Atmosphere
                    </h4>
                    <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
                      Transform your residence into a spiritual sanctuary with the transcendental vibrations of the Holy Names.
                    </p>
                  </div>
                </div>

                {/* Devotional Closing Quote & Trust Highlights */}
                <div className="space-y-4 text-white/95">
                  <blockquote className="font-serif italic text-base sm:text-lg text-white/90 font-normal leading-relaxed tracking-wide bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                    {houseProgrammes.closingQuote ||
                      "“Bring the joy of Krishna consciousness into your home. Chant together, learn together, and experience the spiritual atmosphere of devotional service.”"}
                  </blockquote>

                  {/* Trust Highlights */}
                  <div className="grid grid-cols-1 gap-2 pt-1 text-xs text-white/85 font-medium">
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                      <Check className="h-4 w-4 text-amber-300 shrink-0" />
                      <span>Conducted with Pure Devotion &amp; Vedic Traditions</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                      <Check className="h-4 w-4 text-amber-300 shrink-0" />
                      <span>Open to All Families, Friends &amp; Neighbours</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                      <Check className="h-4 w-4 text-amber-300 shrink-0" />
                      <span>Free Devotional Service from ISKCON Kurnool</span>
                    </div>
                  </div>

                  {/* Direct WhatsApp Call/Chat Button */}
                  <div className="pt-2">
                    <a
                      href={contactWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-400/50 hover:border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white font-bold px-5 py-3 transition-all duration-300 text-xs sm:text-sm backdrop-blur-md shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      Contact Us for House Programme
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Photo Preview */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-white/20 transition z-10"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
              <div className="p-4 bg-gradient-to-t from-black to-black/80 text-white">
                <h4 className="font-bold text-base">{selectedPhoto.title}</h4>
                {selectedPhoto.caption && <p className="text-xs text-white/80 mt-0.5">{selectedPhoto.caption}</p>}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
