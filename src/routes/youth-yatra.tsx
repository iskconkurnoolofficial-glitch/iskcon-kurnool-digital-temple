import { useState, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin, YatraEvent, YatraTimelineDay, YatraPlace, YatraGalleryItem, YatraRegistration } from "@/context/AdminContext";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Navigation,
  Compass,
  CheckCircle2,
  Heart,
  Music,
  BookOpen,
  Flame,
  ShieldCheck,
  Download,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Info,
  Check,
  X,
  Send,
  Loader2,
  QrCode,
  CreditCard,
  Camera,
  AlertTriangle,
  ArrowRight,
  Sun,
  Award,
  Layers,
  FileText,
  Copy,
  Printer,
  Bus,
  Train
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import YouthYatraBoardingPass from "@/components/YouthYatraBoardingPass";

export const Route = createFileRoute("/youth-yatra")({
  head: () => ({
    meta: [
      { title: "Annual Youth Yatra — ISKCON Kurnool" },
      {
        name: "description",
        content:
          "Join the Annual Youth Yatra by ISKCON Kurnool. An empowering 5-day spiritual pilgrimage of soul-stirring kirtans, Bhagavad Gita wisdom, sacred temple darshans, and lifelong devotee friendships.",
      },
      { property: "og:title", content: "Annual Youth Yatra — ISKCON Kurnool" },
      {
        property: "og:description",
        content:
          "A transformational youth pilgrimage to sacred dhams. Register online now for ISKCON Kurnool Youth Yatra.",
      },
    ],
  }),
  component: YouthYatraPage,
});

function YouthYatraPage() {
  const { youthYatra, addYatraRegistration } = useAdmin();
  const search = useSearch({ strict: false }) as { year?: string; eventId?: string };

  // Determine which event to show: by query param or activeEventId
  const availableEvents = youthYatra.events || [];
  const activeEvent =
    availableEvents.find((e) => (search.year ? String(e.year) === search.year : search.eventId ? e.id === search.eventId : e.id === youthYatra.activeEventId)) ||
    availableEvents[0];

  const [selectedEventId, setSelectedEventId] = useState<string>(activeEvent?.id || "");

  useEffect(() => {
    if (activeEvent?.id) {
      setSelectedEventId(activeEvent.id);
    }
  }, [activeEvent?.id]);

  const currentEvent: YatraEvent | undefined =
    availableEvents.find((e) => e.id === selectedEventId) || activeEvent;

  // Gallery & Lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<YatraGalleryItem | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq1");

  // Timeline Active Day Tab
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [accommodationRequired, setAccommodationRequired] = useState(true);
  const [foodPreference, setFoodPreference] = useState("Satvik Pure Veg Prasadam");
  const [registrationCategory, setRegistrationCategory] = useState("College Student");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Payment Selection State
  const paymentModeConfig = currentEvent?.paymentConfig?.mode || "free";
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"free" | "qr" | "razorpay">(
    paymentModeConfig === "free" ? "free" : paymentModeConfig === "razorpay" ? "razorpay" : "qr"
  );
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedRegId, setSubmittedRegId] = useState<string | null>(null);

  // Boarding Pass Retrieval Modal State
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookedUpReg, setLookedUpReg] = useState<YatraRegistration | null>(null);

  // Countdown timer to Yatra startDate
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!currentEvent?.startDate) return;
    const calculateTime = () => {
      const difference = +new Date(currentEvent.startDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [currentEvent?.startDate]);

  if (!currentEvent) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Sparkles className="h-12 w-12 text-secondary animate-bounce" />
          <h2 className="font-display text-2xl font-bold text-primary">No Yatra Event Available</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Please check back soon or contact the temple administration.
          </p>
        </div>
      </SiteLayout>
    );
  }

  // Registration calculations
  const eventRegistrations = (youthYatra.registrations || []).filter((r) => r.eventId === currentEvent.id);
  const registeredCount = eventRegistrations.length;
  const maxSeats = currentEvent.maxSeats || 120;
  const remainingSeats = Math.max(0, maxSeats - registeredCount);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // WhatsApp Share Handler
  const shareText = `*${currentEvent.title} — ISKCON Kurnool*\n🚩 *Theme:* ${currentEvent.theme}\n🗓️ *Dates:* ${currentEvent.startDate} to ${currentEvent.endDate} (${currentEvent.durationText})\n📍 *Route:* ${currentEvent.routeSummary}\n\nRegister online now:\n${typeof window !== "undefined" ? window.location.href : "https://iskconkurnool.org/youth-yatra"}\n\nHare Krishna! 🙏`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Yatra link copied to clipboard!");
    }
  };

  // Upload proof helper
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProof(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshotUrl(reader.result as string);
      setIsUploadingProof(false);
      toast.success("Payment screenshot attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Registration Submit Handler
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !city.trim() || !age) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    if (selectedPaymentMode === "qr" && !transactionId.trim()) {
      toast.error("Please provide the 12-digit UPI Transaction ID / UTR number.");
      return;
    }

    setSubmitting(true);
    try {
      const regId = await addYatraRegistration({
        eventId: currentEvent.id,
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactRelation: emergencyContactRelation.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        accommodationRequired,
        foodPreference,
        specialRequirements: specialRequirements.trim() || undefined,
        registrationCategory,
        paymentMode: selectedPaymentMode,
        amountPaid: selectedPaymentMode === "free" ? 0 : currentEvent.paymentConfig.fee || 2500,
        transactionId: transactionId.trim() || undefined,
        paymentScreenshotUrl: paymentScreenshotUrl || undefined,
      });

      setSubmittedRegId(regId);
      toast.success(`Registration Successful! Your ID: ${regId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setAge("");
    setPhone("");
    setEmail("");
    setCity("");
    setEmergencyContactName("");
    setEmergencyContactRelation("");
    setEmergencyContactPhone("");
    setSpecialRequirements("");
    setTransactionId("");
    setPaymentScreenshotUrl("");
    setSubmittedRegId(null);
  };

  const primaryCoordinator = currentEvent.coordinators?.[0] || {
    name: "Ramanuja Dasa",
    phone: "+91 95053 77520",
    whatsapp: "919505377520",
  };

  return (
    <SiteLayout>
      {/* ========================================================================= */}
      {/* TOP FLOATING EDITION / YEAR SELECTOR & QUICK BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#1b0633]/95 text-white py-2 px-3 sm:px-6 sticky top-16 z-30 border-b border-amber-400/20 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Left: Edition / Year Pill Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2 overflow-x-auto no-scrollbar scrollbar-none py-0.5 shrink-0">
            <span className="text-amber-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0">
              <span>🚩</span>
              <span>Yatra Edition:</span>
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {availableEvents.map((evt) => {
                const active = evt.id === currentEvent.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      active
                        ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,197,24,0.4)] scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{evt.year}</span>
                    {evt.id === youthYatra.activeEventId && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${active ? "bg-slate-900 text-amber-300" : "bg-emerald-600 text-white"}`}>
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Jump Nav Strip */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none touch-pan-x whitespace-nowrap text-xs font-semibold py-0.5">
            <button
              onClick={() => scrollToSection("overview")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection("travel")}
              className="px-2.5 py-1 rounded-xl text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <span>🚍</span> Travel &amp; Reporting
            </button>
            <button
              onClick={() => scrollToSection("timeline")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              Timeline
            </button>
            <button
              onClick={() => scrollToSection("places")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              Route
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("guidelines")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              Guidelines
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="px-2.5 py-1 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              FAQ
            </button>

            {/* Quick Action Badges */}
            <div className="h-4 w-px bg-white/20 mx-1 shrink-0" />

            <button
              onClick={() => {
                setLookupQuery("");
                setLookedUpReg(null);
                setLookupModalOpen(true);
              }}
              className="px-3 py-1 rounded-full bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <span>🎟️</span> Find Pass
            </button>

            <button
              onClick={() => scrollToSection("register")}
              className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-xs transition hover:scale-105 cursor-pointer shrink-0"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO / EVENT HEADER WITH COUNTDOWN & SEAT COUNTER */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a052e] via-[#320f5c] to-[#120320] text-white py-16 lg:py-24">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[36rem] h-[36rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-8 text-center">
          {/* Top Tagline Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-bold text-xs uppercase tracking-widest backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> ISKCON Kurnool Youth Forum (IYF)
            </span>
            <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wide">
              🚩 {currentEvent.durationText}
            </span>
          </div>

          {/* Main Title & Theme */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
              {currentEvent.title}
            </h1>
            <p className="font-serif italic text-xl sm:text-2xl text-amber-300 font-normal">
              "{currentEvent.theme}"
            </p>
            <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
              {currentEvent.tagline}
            </p>
          </div>

          {/* Date & Route Quick Details */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4 text-amber-300 shrink-0" />
              <span>
                <strong>Dates:</strong> {currentEvent.startDate} – {currentEvent.endDate}
              </span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2 text-white">
              <Compass className="h-4 w-4 text-amber-300 shrink-0" />
              <span>
                <strong>Age Group:</strong> {currentEvent.ageGroup}
              </span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2 text-white">
              <Users className="h-4 w-4 text-amber-300 shrink-0" />
              <span>
                <strong>Seats:</strong> {registeredCount} / {maxSeats} Registered
              </span>
            </div>
          </div>

          {/* Live Countdown Timer */}
          <div className="pt-2">
            <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-3 flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Countdown to Departure
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hours", val: timeLeft.hours },
                { label: "Minutes", val: timeLeft.minutes },
                { label: "Seconds", val: timeLeft.seconds },
              ].map((t) => (
                <div
                  key={t.label}
                  className="bg-black/40 border border-white/15 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-inner text-center"
                >
                  <div className="font-display font-black text-2xl sm:text-4xl text-amber-300 font-mono">
                    {String(t.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-semibold">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Action Buttons (Ergonomic Mobile & Desktop Arrangement) */}
          <div className="max-w-xl mx-auto space-y-3 pt-4">
            {/* Primary Action Button */}
            <button
              onClick={() => scrollToSection("register")}
              className="w-full py-4 sm:py-4.5 px-8 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(245,197,24,0.5)] transition hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <CheckCircle2 className="h-5 w-5 text-slate-950" />
              <span>Register for Yatra Now</span>
              <ArrowRight className="h-5 w-5 text-slate-950" />
            </button>

            {/* Secondary Action Buttons Grid on Mobile */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setLookupQuery("");
                  setLookedUpReg(null);
                  setLookupModalOpen(true);
                }}
                className="py-3 px-4 rounded-2xl border border-amber-300/60 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-white font-bold transition text-xs sm:text-sm backdrop-blur-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="h-4 w-4 text-amber-300" />
                <span>My Boarding Pass</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="py-3 px-4 rounded-2xl border border-emerald-400/60 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white font-bold transition text-xs sm:text-sm backdrop-blur-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                <span>Share WhatsApp</span>
              </button>
            </div>

            {/* Optional Poster Link */}
            {currentEvent.posterUrl && (
              <div className="pt-1">
                <a
                  href={currentEvent.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-amber-300 transition underline underline-offset-4"
                >
                  <Download className="h-3.5 w-3.5" /> View / Download Official Yatra Poster
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. YATRA OVERVIEW & PURPOSE SECTION */}
      {/* ========================================================================= */}
      <section id="overview" className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
              <Compass className="h-4 w-4" /> Transformative Experience
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
              Yatra Overview &amp; Purpose
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {currentEvent.description}
            </p>
          </div>

          {/* 3 Key Yatra Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-border shadow-xs hover:shadow-md transition space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center text-xl font-bold">
                🎯
              </div>
              <h3 className="font-display font-bold text-lg text-primary">The Divine Purpose</h3>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                {currentEvent.purpose}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border shadow-xs hover:shadow-md transition space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 grid place-items-center text-xl font-bold">
                👥
              </div>
              <h3 className="font-display font-bold text-lg text-primary">Who Can Join?</h3>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                {currentEvent.whoCanJoin}
              </p>
              <div className="text-xs font-semibold text-secondary pt-1">
                Age: {currentEvent.ageGroup}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border shadow-xs hover:shadow-md transition space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center text-xl font-bold">
                ✨
              </div>
              <h3 className="font-display font-bold text-lg text-primary">Organized by IYF</h3>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                Conducted with devotion and discipline by {currentEvent.organizedBy} under guidance of senior monk educators.
              </p>
              <div className="text-xs font-semibold text-emerald-700 pt-1">
                Full 24/7 Mentorship &amp; Care
              </div>
            </div>
          </div>

          {/* 4 Pillar Inclusions Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>AC Deluxe Coach Travel</span>
            </div>
            <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                {Math.max(1, (currentEvent.timeline?.length || 5) - 1)} Nights Hotel Stay (Triple/Quad Sharing)
              </span>
            </div>
            <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>3x Unlimited Satvik Prasadam</span>
            </div>
            <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Yatra Kit &amp; Entry Passes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 TRAVEL MEANS & WHERE TO COME (STEP-BY-STEP PROCESS) */}
      {/* ========================================================================= */}
      <section id="travel" className="py-20 md:py-28 bg-surface/60 relative overflow-hidden border-t border-border/70 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
              <Bus className="h-4 w-4" /> Transit Logistics &amp; Departure Guide
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
              Travel Means &amp; Where to Come
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything you need to know about our luxury coach fleet, reporting timings at ISKCON Kurnool, step-by-step departure process, and en-route pickup points.
            </p>
          </div>

          {/* Quick Summary Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-900 grid place-items-center text-xl shrink-0">
                🚍
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Vehicle Mode</div>
                <div className="font-display font-bold text-sm text-foreground">
                  {currentEvent.travelConfig?.primaryMode || "Luxury AC Pushback Coaches"}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-900 grid place-items-center text-xl shrink-0">
                ⏰
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Reporting Time</div>
                <div className="font-display font-bold text-sm text-foreground">
                  {currentEvent.travelConfig?.reportingTime || "05:00 AM (Mangala Harati)"}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-900 grid place-items-center text-xl shrink-0">
                🚩
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Departure Time</div>
                <div className="font-display font-bold text-sm text-rose-600">
                  {currentEvent.travelConfig?.departureTime || "06:00 AM Sharp"}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border shadow-xs flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-900 grid place-items-center text-xl shrink-0">
                📍
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Departure Hub</div>
                <div className="font-display font-bold text-sm text-foreground truncate">
                  ISKCON Kurnool Main Altar
                </div>
              </div>
            </div>
          </div>

          {/* Coach Fleet Cards */}
          {currentEvent.travelConfig?.vehicles && currentEvent.travelConfig.vehicles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <Bus className="h-5 w-5 text-secondary" /> Yatra Coach Fleet &amp; Facilities
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {currentEvent.travelConfig.vehicles.length} Dedicated Vehicles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentEvent.travelConfig.vehicles.map((veh) => (
                  <div
                    key={veh.id}
                    className="bg-white rounded-3xl border border-border p-6 shadow-xs hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Coach Header */}
                      <div className="flex items-start justify-between gap-3 border-b pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                              {veh.type}
                            </span>
                            <span className="font-mono font-extrabold text-xs text-purple-950 bg-slate-100 px-2 py-0.5 rounded border">
                              {veh.registrationNumber || "AP 21 TZ 4567"}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-lg text-primary">
                            {veh.vehicleName}
                          </h4>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold font-mono shrink-0">
                          {veh.seatCapacity} Seats
                        </span>
                      </div>

                      {/* Coach Batch & Crew Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-surface rounded-2xl border">
                          <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                            Assigned Devotee Batch
                          </span>
                          <span className="font-bold text-emerald-700">{veh.batchTag}</span>
                        </div>

                        <div className="p-3 bg-surface rounded-2xl border">
                          <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                            Captain / Driver
                          </span>
                          <span className="font-bold text-foreground truncate block">
                            {veh.driverName || "Assigned Driver"}
                          </span>
                          {veh.driverPhone && (
                            <a
                              href={`tel:${veh.driverPhone}`}
                              className="text-[10px] text-primary font-mono hover:underline"
                            >
                              {veh.driverPhone}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Coach In-Charge Bar */}
                      <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-purple-900 font-bold uppercase">
                            Coach In-Charge Devotee
                          </div>
                          <div className="font-bold text-purple-950">
                            {veh.coachInChargeName || "Ramanuja Dasa"}
                          </div>
                        </div>

                        {veh.coachInChargePhone && (
                          <a
                            href={`https://wa.me/${veh.coachInChargePhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>

                      {/* Amenities Checklist */}
                      {veh.amenities && veh.amenities.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Onboard Coach Facilities:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {veh.amenities.map((am, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-50 px-2.5 py-1 rounded-xl border text-foreground/80 flex items-center gap-1 font-medium"
                              >
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" /> {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Reporting Timeline */}
          {currentEvent.travelConfig?.stepByStepGuide && currentEvent.travelConfig.stepByStepGuide.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-md space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-primary flex items-center gap-2">
                    <Navigation className="h-6 w-6 text-secondary" /> Step-by-Step Departure Morning Process
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Follow these 5 simple steps on departure morning for a smooth, hassle-free boarding experience.
                  </p>
                </div>

                {currentEvent.travelConfig.departureGoogleMapUrl && (
                  <a
                    href={currentEvent.travelConfig.departureGoogleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 border border-amber-300 font-bold text-xs shadow-xs transition shrink-0"
                  >
                    <MapPin className="h-4 w-4 text-amber-700" /> Open ISKCON Kurnool in Google Maps
                  </a>
                )}
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-purple-900 before:via-amber-400 before:to-emerald-500">
                {currentEvent.travelConfig.stepByStepGuide.map((step, idx) => (
                  <div key={step.id} className="relative flex items-start gap-4 sm:gap-6">
                    {/* Step Number Dot */}
                    <div className="h-10 w-10 rounded-2xl bg-purple-900 text-amber-300 font-display font-black text-sm grid place-items-center shrink-0 ring-4 ring-white shadow-md relative z-10">
                      {step.stepNumber || idx + 1}
                    </div>

                    {/* Step Content Card */}
                    <div className="flex-1 bg-surface p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs space-y-2 hover:border-primary/40 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                            {step.time}
                          </span>
                          <h4 className="font-display font-bold text-base sm:text-lg text-foreground">
                            {step.title}
                          </h4>
                        </div>

                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-secondary" /> {step.location}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                        {step.description}
                      </p>

                      {step.instructions && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                          <strong>Pilgrim Advisory:</strong> {step.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* En-Route Pickups & Outstation Transit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highway Pickup Points */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-4">
              <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" /> En-Route Highway Pickups
              </h4>
              <p className="text-xs text-muted-foreground">
                Outstation participants joining along the highway can board at these designated pickup crossings:
              </p>

              <div className="space-y-2.5 pt-2">
                {(
                  currentEvent.travelConfig?.pickupPoints || [
                    { id: "p1", location: "Dhone Bypass Junction", time: "06:45 AM", landmark: "Hotel Haritha" },
                    { id: "p2", location: "Gooty Toll Plaza", time: "07:15 AM", landmark: "NH-44 Flyover Entry" },
                    { id: "p3", location: "Anantapur (Raptadu)", time: "08:00 AM", landmark: "Raptadu Toll Plaza" },
                  ]
                ).map((point) => (
                  <div
                    key={point.id}
                    className="p-3.5 rounded-2xl bg-surface border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground">{point.location}</div>
                      <div className="text-[11px] text-muted-foreground">{point.landmark}</div>
                    </div>
                    <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md shrink-0">
                      {point.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outstation Devotee Train & Luggage Policy Card */}
            <div className="bg-gradient-to-br from-purple-900 to-[#2e0b50] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
              <h4 className="font-display font-bold text-lg text-amber-300 flex items-center gap-2">
                <Train className="h-5 w-5 text-amber-300" /> Outstation Devotees &amp; Train Info
              </h4>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {currentEvent.travelConfig?.trainOptionDetails ||
                  "For devotees traveling from Hyderabad, Bangalore, or Tirupati: Direct trains to Kurnool City (KNL) run daily. ISKCON Temple is a 10-minute auto ride from the railway station."}
              </p>

              <div className="border-t border-white/15 pt-4 space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  🧳 Luggage &amp; Baggage Allowance
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {currentEvent.travelConfig?.luggagePolicy ||
                    "1 Main Stowed Duffel Bag / Suitcase (Max 15 kg for coach under-chassis boot) + 1 Small Shoulder bag for personal essentials, water bottle & Japa Mala inside bus."}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => scrollToSection("register")}
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md cursor-pointer text-center block"
                >
                  Register Now &amp; Select Coach Seat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. YATRA TIMELINE (DAY 01 → DAY 02 → DAY 03... INTERACTIVE STEPPER) */}
      {/* ========================================================================= */}
      <section id="timeline" className="py-20 md:py-28 bg-gradient-to-br from-[#fff9ea] via-[#fef2d2] to-[#fff5db] relative overflow-hidden border-y border-amber-200">
        <div className="max-w-6xl mx-auto px-6 space-y-12 relative">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
              <Calendar className="h-4 w-4" /> Day-by-Day Journey
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
              Yatra Timeline
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              A balanced rhythm of morning sadhana, soul-stirring kirtan, travel, temple visits, and deep fellowship.
            </p>
          </div>

          {/* Stepper Buttons for Days */}
          <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-3 no-scrollbar scrollbar-none snap-x snap-mandatory touch-pan-x px-1">
            {currentEvent.timeline.map((day) => {
              const active = activeDayNumber === day.dayNumber;
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDayNumber(day.dayNumber)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer border snap-start shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-gold scale-105"
                      : "bg-white hover:bg-surface text-foreground border-border"
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-xs grid place-items-center font-extrabold">
                    {day.dayNumber}
                  </span>
                  <span>Day {day.dayNumber}</span>
                  <span className="text-[11px] opacity-75 font-normal">({day.date.split(",")[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          {(() => {
            const day = currentEvent.timeline.find((d) => d.dayNumber === activeDayNumber) || currentEvent.timeline[0];
            if (!day) return null;

            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-amber-300/60 shadow-xl relative overflow-hidden"
              >
                {/* Header of Active Day */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Day {String(day.dayNumber).padStart(2, "0")}</span> • <span>{day.date}</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                      {day.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="h-4 w-4 text-accent" /> {day.location}
                    </p>
                  </div>

                  {day.specialEvents && (
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-xs text-purple-900 font-semibold max-w-xs flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                      <span>{day.specialEvents}</span>
                    </div>
                  )}
                </div>

                {/* Day Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  {/* Left Column: Itinerary blocks */}
                  <div className="space-y-4">
                    {day.morningProgram && (
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                          <Sun className="h-4 w-4 text-amber-600" /> Morning Program &amp; Sadhana
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                          {day.morningProgram}
                        </p>
                      </div>
                    )}

                    {day.travelDetails && (
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
                          <Navigation className="h-4 w-4 text-blue-600" /> Travel &amp; Sightseeing Details
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                          {day.travelDetails}
                        </p>
                      </div>
                    )}

                    {day.sessions && (
                      <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wide">
                          <BookOpen className="h-4 w-4 text-purple-600" /> Gita Wisdom Session &amp; Workshop
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                          {day.sessions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Activities, Meals, Accommodation & Image */}
                  <div className="space-y-4">
                    {day.image && (
                      <div className="rounded-2xl overflow-hidden h-48 w-full shadow-sm">
                        <img src={day.image} alt={day.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {day.activities && day.activities.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                          Key Day Highlights:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((act, i) => (
                            <span key={i} className="text-xs font-medium bg-surface px-3 py-1.5 rounded-xl border flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground border-t">
                      {day.meals && (
                        <div>
                          <strong>Prasadam:</strong> {day.meals}
                        </div>
                      )}
                      {day.accommodation && (
                        <div>
                          <strong>Stay:</strong> {day.accommodation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PLACES / YATRA ROUTE SECTION */}
      {/* ========================================================================= */}
      <section id="places" className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
              <MapPin className="h-4 w-4" /> Sacred Pilgrimage Circuit
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
              Places &amp; Yatra Route
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            
            {/* Route summary box */}
            <div className="mt-4 p-4 rounded-2xl bg-surface border border-border text-xs sm:text-sm font-semibold text-primary inline-flex items-center gap-2">
              <Compass className="h-4 w-4 text-accent shrink-0" />
              <span>{currentEvent.routeSummary}</span>
            </div>
          </div>

          {/* Destination Place Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvent.places.map((place, idx) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Place Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-muted">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-amber-300 px-3 py-0.5 rounded-full text-xs font-bold border border-white/20">
                      Stop 0{idx + 1}
                    </div>
                    {place.visitDate && (
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
                        {place.visitDate}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-xl text-primary">{place.name}</h3>
                      {place.tagline && (
                        <p className="text-xs text-accent font-semibold">{place.tagline}</p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                      {place.description}
                    </p>

                    {/* Highlights */}
                    {place.highlights && place.highlights.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {place.highlights.map((hl, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-foreground/85">
                            <Sparkles className="h-3 w-3 text-secondary shrink-0" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-4 px-6 border-t bg-surface/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{place.distanceInfo || "Sacred Kshetra"}</span>
                  {place.mapLocationUrl && (
                    <a
                      href={place.mapLocationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:text-accent font-bold flex items-center gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5" /> View Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. REGISTRATION & 6. PAYMENT SYSTEM (ADMIN CONFIGURABLE) */}
      {/* ========================================================================= */}
      <section id="register" className="py-20 md:py-28 bg-gradient-to-br from-[#20083c] via-[#351060] to-[#1a052e] text-white relative overflow-hidden scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Award className="h-3.5 w-3.5 text-amber-300" /> Limited Seats Available
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
              Yatra Registration
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm sm:text-base text-white/80">
              Reserve your seat for the {currentEvent.title}. {remainingSeats} seats remaining out of {maxSeats}.
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-2xl text-foreground border border-amber-300/40 relative overflow-hidden">
            {/* Top Bar Accent */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-purple-700 via-amber-400 to-orange-500" />

            {submittedRegId ? (
              <YouthYatraBoardingPass
                registration={
                  youthYatra.registrations?.find((r) => r.id === submittedRegId) || {
                    id: submittedRegId,
                    eventId: currentEvent.id,
                    fullName,
                    age: Number(age),
                    gender,
                    phone,
                    email,
                    city,
                    emergencyContactName,
                    emergencyContactRelation,
                    emergencyContactPhone,
                    accommodationRequired,
                    foodPreference,
                    specialRequirements,
                    registrationCategory,
                    paymentMode: selectedPaymentMode,
                    paymentStatus: selectedPaymentMode === "free" ? "completed" : "pending",
                    amountPaid: selectedPaymentMode === "free" ? 0 : currentEvent.paymentConfig.fee || 2500,
                    transactionId,
                    paymentScreenshotUrl,
                    registeredAt: new Date().toISOString(),
                    read: false,
                    status: "confirmed",
                    boardingPassId: `BP${String(currentEvent.year).slice(-2)}-00001`,
                    batch: gender === "Female" ? "Batch B (Coach 2 - Girls)" : "Batch A (Coach 1 - Boys)",
                    seatNumber: "01",
                    checkedIn: false,
                  }
                }
                event={currentEvent}
                onRegisterAnother={resetForm}
              />
            ) : (
              /* Interactive Registration Form */
              <form onSubmit={handleSubmitRegistration} className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-display text-2xl font-bold text-primary">
                    Participant Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Please provide accurate contact details for Yatra coordination and accommodation allotment.
                  </p>
                </div>

                {/* Step 1: Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={14}
                      max={45}
                      placeholder="e.g. 21"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer"
                    >
                      <option value="Male">Male (Boys Batch)</option>
                      <option value="Female">Female (Girls Batch)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      WhatsApp / Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      City / Native Town <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kurnool / Nandyal / Hyderabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Participant Category
                    </label>
                    <select
                      value={registrationCategory}
                      onChange={(e) => setRegistrationCategory(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer"
                    >
                      <option value="College Student">College Student</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="Youth Devotee">Youth Devotee (IYF Member)</option>
                      <option value="First-Time Yatra Participant">First-Time Participant</option>
                    </select>
                  </div>
                </div>

                {/* Step 2: Emergency Contact */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Emergency Contact Details (Parent / Guardian)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Contact Person Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. S. Venkat Rao"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Relationship <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Father / Brother / Mother"
                        value={emergencyContactRelation}
                        onChange={(e) => setEmergencyContactRelation(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Emergency Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9440012345"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Special Notes & Requirements */}
                <div className="border-t pt-4">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Special Requirements or Health Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Any medical condition, motion sickness, roommate preference..."
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                  />
                </div>

                {/* Step 4: Payment Section (Admin Configurable) */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-secondary" /> Yatra Registration Fee
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {currentEvent.paymentConfig.feeDescription || "Includes complete travel, food, and accommodation."}
                      </p>
                    </div>

                    {currentEvent.paymentConfig.mode !== "free" && (
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-muted-foreground">Total Fee:</div>
                        <div className="font-display font-extrabold text-2xl text-purple-900">
                          ₹{currentEvent.paymentConfig.fee || 2500}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Mode Selection */}
                  {currentEvent.paymentConfig.mode === "free" ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span>Registration for this Yatra edition is <strong>Complimentary / Free</strong>. Submit to confirm your seat.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentEvent.paymentConfig.mode === "both" && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode("qr")}
                            className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                              selectedPaymentMode === "qr"
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-white text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <QrCode className="h-4 w-4" /> UPI QR Code Payment
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode("razorpay")}
                            className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                              selectedPaymentMode === "razorpay"
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-white text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <CreditCard className="h-4 w-4" /> Online Payment (Cards/UPI)
                          </button>
                        </div>
                      )}

                      {/* QR Payment Box */}
                      {selectedPaymentMode === "qr" && (
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-amber-50/40 to-surface border border-amber-300/60 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            {/* QR Code Graphic */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2">
                              <div className="p-3 bg-white rounded-2xl border-2 border-purple-200 shadow-md">
                                <img
                                  src={currentEvent.paymentConfig.qrImageUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"}
                                  alt="Yatra Payment QR Code"
                                  className="h-36 w-36 object-contain rounded-lg"
                                />
                              </div>
                              <div className="text-xs font-mono font-bold text-purple-900">
                                UPI ID: {currentEvent.paymentConfig.upiId || "iskconkurnool@sbi"}
                              </div>
                            </div>

                            {/* Payment Instructions & UTR input */}
                            <div className="md:col-span-8 space-y-3">
                              <div className="text-xs font-bold text-foreground">
                                Step-by-Step Payment Instructions:
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {currentEvent.paymentConfig.paymentInstructions ||
                                  "1. Scan the QR code with any UPI app (GPay / PhonePe / Paytm / BHIM) and pay ₹2,500.\n2. Copy the 12-digit UTR/Transaction ID and paste below."}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    12-Digit UTR / Transaction ID <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required={selectedPaymentMode === "qr"}
                                    placeholder="e.g. 425689123456"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white font-mono"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    Attach Payment Screenshot
                                  </label>
                                  <label className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white hover:bg-muted cursor-pointer flex items-center justify-center gap-1.5 text-muted-foreground transition">
                                    <Camera className="h-3.5 w-3.5 text-primary" />
                                    <span>{paymentScreenshotUrl ? "Screenshot Attached ✓" : "Upload Image"}</span>
                                    <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Razorpay Online Box */}
                      {selectedPaymentMode === "razorpay" && (
                        <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 text-xs space-y-3">
                          <div className="font-bold text-blue-900 text-sm">Online Gateway Integration Active</div>
                          <p className="text-muted-foreground">
                            When you click submit below, you will be securely redirected to complete the ₹{currentEvent.paymentConfig.fee || 2500} payment via Cards, NetBanking, or UPI.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold shadow-gold text-base transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Confirming Registration...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" /> Confirm Yatra Registration
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Your information is private and handled securely by ISKCON Kurnool Youth Forum.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. REUSABLE GALLERY & ALBUMS */}
      {/* ========================================================================= */}
      {currentEvent.gallery && currentEvent.gallery.length > 0 && (
        <section id="gallery" className="py-20 md:py-28 bg-surface">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
                <Camera className="h-4 w-4" /> Yatra Moments
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
                Yatra Photo Gallery
              </h2>
              <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">
                Glimpses of bliss, soul-stirring kirtans, and scenic sacred dhams from our Youth Yatras.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: "all", label: "All Photos" },
                { id: "kirtan", label: "Kirtan & Beach" },
                { id: "temples", label: "Temples & Darshan" },
                { id: "places", label: "Scenic Treks" },
                { id: "sessions", label: "Gita Workshops" },
                { id: "prasadam", label: "Prasadam Feast" },
              ].map((f) => {
                const active = galleryFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setGalleryFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-white hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentEvent.gallery
                .filter((p) => galleryFilter === "all" || p.albumCategory === galleryFilter)
                .map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer bg-white border aspect-[4/3]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title || "Yatra Photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-5 text-white">
                      <span className="font-bold text-sm">{photo.title}</span>
                      {photo.caption && <span className="text-xs text-white/80 mt-0.5">{photo.caption}</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. WHAT TO BRING PACKING CHECKLIST */}
      {/* ========================================================================= */}
      {currentEvent.whatToBring && currentEvent.whatToBring.length > 0 && (
        <section className="py-20 md:py-28 bg-background relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
                <FileText className="h-4 w-4" /> Travel Preparation
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
                What to Bring Checklist
              </h2>
              <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">
                Ensure you pack these essentials for a comfortable and smooth devotional journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentEvent.whatToBring.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4.5 rounded-2xl border border-border shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground">{item.item}</div>
                      <div className="text-[11px] text-muted-foreground">{item.category}</div>
                    </div>
                  </div>

                  {item.mandatory && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md shrink-0">
                      Mandatory
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 9. IMPORTANT GUIDELINES */}
      {/* ========================================================================= */}
      {currentEvent.guidelines && currentEvent.guidelines.length > 0 && (
        <section id="guidelines" className="py-20 md:py-28 bg-gradient-to-br from-[#2a0e4a] via-[#3c146e] to-[#20083e] text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 space-y-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" /> Yatra Decorum
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                Important Guidelines
              </h2>
              <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
              <p className="text-sm text-white/80">
                To maintain the holiness and safety of the Yatra, all participants are requested to adhere to the following rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEvent.guidelines.map((g) => (
                <div
                  key={g.id}
                  className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-md space-y-2 hover:bg-white/15 transition"
                >
                  <div className="flex items-center gap-2 font-display font-bold text-base text-amber-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{g.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans font-normal">
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 10. FAQ SECTION */}
      {/* ========================================================================= */}
      {currentEvent.faqs && currentEvent.faqs.length > 0 && (
        <section id="faq" className="py-20 md:py-28 bg-surface">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
                <Info className="h-4 w-4" /> Clear Answers
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
                Frequently Asked Questions
              </h2>
              <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            </div>

            <div className="space-y-3">
              {currentEvent.faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-border/80 overflow-hidden shadow-xs transition"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-primary cursor-pointer hover:text-accent transition"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-foreground/80 leading-relaxed border-t border-muted">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 11. CONTACT / HELP & COORDINATORS SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-bold">
              <Phone className="h-4 w-4" /> 24/7 Support Team
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
              Yatra Coordinators &amp; Helpdesk
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              Have questions about travel, registration, or logistics? Feel free to reach out directly to our dedicated coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentEvent.coordinators.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition text-center space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-display font-bold text-xl grid place-items-center mx-auto shadow-md">
                    {c.name.charAt(0)}
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary">{c.name}</h3>
                  <p className="text-xs text-accent font-medium">{c.role}</p>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hare Krishna ${c.name} ji! 🙏 I have a question regarding ${currentEvent.title}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </a>

                  <a
                    href={`tel:${c.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border bg-white hover:bg-muted text-foreground text-xs font-semibold transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Call {c.phone}
                  </a>
                </div>
              </div>
            ))}
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
                alt={selectedPhoto.title || "Yatra Photo"}
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

      {/* ========================================================================= */}
      {/* RETRIEVE / FIND MY BOARDING PASS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {lookupModalOpen && (
          <div
            onClick={() => setLookupModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full bg-surface rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-amber-400/50 shadow-2xl space-y-6 relative max-h-[95vh] overflow-y-auto"
            >
              <button
                onClick={() => setLookupModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-muted text-foreground hover:bg-muted/80 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-2 border-b pb-4">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Official Yatra Verification Portal
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                  Find Your Digital Boarding Pass
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Enter your Registration ID (e.g. <strong className="font-mono">YY26-00001</strong>) or registered WhatsApp phone number.
                </p>
              </div>

              {!lookedUpReg ? (
                <div className="max-w-lg mx-auto space-y-5 py-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const clean = lookupQuery.trim().toUpperCase();
                      if (!clean) {
                        toast.error("Please enter a Registration ID, Devotee Name, or Phone Number.");
                        return;
                      }
                      const allRegs = youthYatra.registrations || [];
                      const found = allRegs.find(
                        (r) =>
                          r.id.toUpperCase().includes(clean) ||
                          r.boardingPassId?.toUpperCase().includes(clean) ||
                          r.fullName.toUpperCase().includes(clean) ||
                          r.phone.replace(/\D/g, "").includes(clean.replace(/\D/g, ""))
                      );
                      if (found) {
                        setLookedUpReg(found);
                        toast.success(`Boarding pass found for ${found.fullName}!`);
                      } else {
                        toast.error(`No boarding pass found matching "${lookupQuery}".`);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground">
                        Registration ID, Devotee Name, or Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. YY26-00482, Rahul Kumar, or 9876543210"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        className="w-full px-4 py-3 text-sm border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none bg-white font-mono"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-bold text-sm shadow-md hover:scale-[1.01] transition cursor-pointer"
                    >
                      Search &amp; Retrieve Boarding Pass
                    </button>
                  </form>

                  {/* Quick Clickable Sample Passes */}
                  <div className="pt-2 border-t text-center space-y-2">
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      Or click to preview a sample verified pass:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {(youthYatra.registrations || []).slice(0, 3).map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => {
                            setLookedUpReg(sample);
                            toast.success(`Boarding pass loaded for ${sample.fullName}!`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🎟️ {sample.fullName}</span>
                          <span className="font-mono text-[10px] bg-purple-200/70 px-1.5 py-0.5 rounded">
                            {sample.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <YouthYatraBoardingPass
                    registration={lookedUpReg}
                    event={currentEvent}
                    onRegisterAnother={() => setLookedUpReg(null)}
                  />
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setLookedUpReg(null)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      ← Search Another Pilgrim Pass
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
