import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import OfficialReceiptModal from "@/components/OfficialReceiptModal";
import LifePatronOnboardingModal from "@/components/LifePatronOnboardingModal";
import confetti from "canvas-confetti";
import {
  Award,
  Sparkles,
  Ticket,
  ShieldCheck,
  Building2,
  BookOpen,
  Heart,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Phone,
  MessageCircle,
  QrCode,
  Globe,
  Sun,
  Star,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const RAZORPAY_KEY = "rzp_live_TTxJXHnvmVNCF8";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export const Route = createFileRoute("/temple/life-patron")({
  head: () => ({
    meta: [
      { title: "Become an ISKCON Kurnool Life Member | Life Patron Membership" },
      {
        name: "description",
        content:
          "Become an ISKCON Kurnool Life Member & Patron. Enjoy worldwide temple guest house accommodation, lifetime Back to Godhead magazine, 80G tax exemption, and eternal spiritual merit.",
      },
      { property: "og:title", content: "Become an ISKCON Kurnool Life Member | Life Patron Membership" },
      {
        property: "og:description",
        content:
          "Join our global spiritual family as an ISKCON Life Patron. Valid in 800+ ISKCON temples worldwide with 80G tax benefits.",
      },
    ],
  }),
  component: LifePatronPage,
});

const BHAKTI_STEPS_PATRON_JOURNEY = [
  {
    step: 1,
    title: "Shraddha (Sacred Faith)",
    subtitle: "Taking the vow of lifelong patron devotion",
    description: "Begin your spiritual patron journey by making a dedicated lifetime commitment to Sri Sri Jagannath Baladev Subhadra Temple.",
    icon: Star,
    badge: "Step 1",
    color: "from-amber-400 to-yellow-500",
  },
  {
    step: 2,
    title: "Sadhu Sanga (Holy Association)",
    subtitle: "Connecting with 800+ temples worldwide",
    description: "Enjoy lifetime guest house privileges, spiritual retreats, and welcoming association of devotees anywhere across the globe.",
    icon: Globe,
    badge: "Step 2",
    color: "from-amber-500 to-orange-500",
  },
  {
    step: 3,
    title: "Sevak (Deity & Temple Service)",
    subtitle: "Sustaining daily Nitya Seva & sringara",
    description: "Your patron contribution directly supports daily deity worship, grand festival celebrations, and fragrant flower archana.",
    icon: Sparkles,
    badge: "Step 3",
    color: "from-orange-500 to-rose-500",
  },
  {
    step: 4,
    title: "Upasaka (Annadanam & Goshala)",
    subtitle: "Feeding visiting devotees & cow protection",
    description: "Nourish thousands through sanctified Krishna prasadam distribution and lifelong maintenance of Mother Cow at the temple Goshala.",
    icon: Heart,
    badge: "Step 4",
    color: "from-rose-500 to-purple-600",
  },
  {
    step: 5,
    title: "Mahapatron (Eternal Preaching Partner)",
    subtitle: "Building the Sri Sri Puri Jagannath Mandir",
    description: "Etch your family's legacy permanently into the temple foundation, creating eternal spiritual merit for generations to come.",
    icon: Award,
    badge: "Step 5 · Highest Merit",
    color: "from-purple-600 to-indigo-700",
  },
];

export default function LifePatronPage() {
  const { lifePatron, settings } = useAdmin();
  const [selectedTier, setSelectedTier] = useState<string>("Life Patron");
  const [patronName, setPatronName] = useState("");
  const [patronPhone, setPatronPhone] = useState("");
  const [patronEmail, setPatronEmail] = useState("");
  const [patronCity, setPatronCity] = useState("Kurnool");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardName, setCardName] = useState("SRI DEVOTEE PATRON");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<{
    paymentId: string;
    amount: number;
    date: string;
    patronName: string;
    patronPhone: string;
    patronEmail?: string;
    patronCity?: string;
    tierName: string;
  } | null>(null);

  const heroImg = lifePatron.heroImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1600&q=85";

  useEffect(() => {
    if (onboardingData) {
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        colors: ["#f5c518", "#f97316", "#eab308", "#ffffff", "#ec4899", "#10b981"],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [onboardingData]);

  const triggerOnboardingFlow = (pName?: string, pPhone?: string, amount: number = 55555) => {
    const finalName = pName || patronName || "Sri Devotee Patron";
    const finalPhone = pPhone || patronPhone || "+91 95053 77520";
    const pId = `PAY-LP-${Math.floor(100000 + Math.random() * 900000)}`;
    const curDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

    setOnboardingData({
      paymentId: pId,
      amount: amount,
      date: curDate,
      patronName: finalName,
      patronPhone: finalPhone,
      patronEmail: patronEmail || "",
      patronCity: patronCity || "Kurnool",
      tierName: selectedTier || "Life Patron",
    });
    setIsModalOpen(false);
    toast.success("Payment Successful! Launching Onboarding Flow...");
  };

  const handleDownloadApplicationPdf = () => {
    const pdfUrl = lifePatron.applicationPdfUrl;
    
    if (pdfUrl && pdfUrl.startsWith("http")) {
      window.open(pdfUrl, "_blank");
    } else {
      const content = `=====================================================
ISKCON KURNOOL - LIFE PATRON MEMBERSHIP APPLICATION FORM
Sri Sri Jagannath Baladev Subhadra Temple, Kurnool, Andhra Pradesh
=====================================================

PATRON DETAILS:
Full Name: ${onboardingData?.patronName || "Sri Devotee Patron"}
Phone / WhatsApp: ${onboardingData?.patronPhone || ""}
Email: ${onboardingData?.patronEmail || "N/A"}
City: ${onboardingData?.patronCity || "Kurnool"}

PAYMENT CONFIRMATION:
Membership Level: ${onboardingData?.tierName || "Life Patron"}
Contribution Amount: ₹${(onboardingData?.amount || 55555).toLocaleString()}
Payment ID / Receipt No: ${onboardingData?.paymentId || "PAY-LP-880026"}
Date: ${onboardingData?.date || new Date().toLocaleDateString("en-IN")}

INSTRUCTIONS:
1. Please review and verify your personal details above.
2. Fill in your details / sign the form.
3. Send the completed form on WhatsApp (+91 95053 77520).

Thank you for becoming a valued Life Patron of ISKCON Kurnool!
=====================================================`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ISKCON_Life_Patron_Application_${(onboardingData?.patronName || "Form").replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success("Downloading Application Form!");
  };

  const handleOnboardingWhatsApp = () => {
    if (!onboardingData) return;
    const phoneNum = (lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "");
    const msg = `Hare Krishna 🙏%0AI have successfully completed my ISKCON Kurnool Life Patron Membership payment.%0A%0A*Membership:* ${encodeURIComponent(onboardingData.tierName)}%0A*Amount:* ₹${onboardingData.amount.toLocaleString()}%0A*Payment ID:* ${encodeURIComponent(onboardingData.paymentId)}%0A*Name:* ${encodeURIComponent(onboardingData.patronName)}%0A*Phone:* ${encodeURIComponent(onboardingData.patronPhone)}%0A%0AI am sending my completed application form for further processing.`;

    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp to submit your completed application form!");
  };

  const handleGenerateReceipt = () => {
    if (!onboardingData) return;
    setReceiptSuccess({
      receiptNo: onboardingData.paymentId,
      date: new Date().toISOString(),
      donorName: onboardingData.patronName,
      donorEmail: onboardingData.patronEmail,
      donorPhone: onboardingData.patronPhone,
      amount: onboardingData.amount,
      sevaTitle: `ISKCON Kurnool Life Patron Membership (${onboardingData.tierName})`,
      category: "Life Patron Membership",
      notes: `City: ${onboardingData.patronCity || "Kurnool"}. Eligible for 80G Income Tax Exemption.`,
      paymentMethod: "Online / Gateway",
    });
    toast.success("Generating Official 80G Tax Exemption Receipt!");
  };

  const handleRazorpayPayment = async (amountInINR: number = 55555) => {
    if (!patronName || !patronPhone) {
      toast.error("Please enter your name and phone number to proceed with payment");
      return;
    }

    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(amountInINR * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `Life Patron Membership — ${selectedTier}`,
      image: settings.logo || undefined,
      notes: {
        membershipTier: selectedTier,
        donorName: patronName,
        phone: patronPhone,
        email: patronEmail,
        city: patronCity,
      },
      prefill: {
        name: patronName || undefined,
        email: patronEmail || undefined,
        contact: patronPhone ? patronPhone.replace(/\D/g, "") : undefined,
      },
      theme: { color: "#d97706" },
      handler: async (response: any) => {
        const pId = response?.razorpay_payment_id || `PAY-LP-${Math.floor(100000 + Math.random() * 900000)}`;
        const curDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
        setIsModalOpen(false);

        setOnboardingData({
          paymentId: pId,
          amount: amountInINR,
          date: curDate,
          patronName: patronName || "Sri Devotee Patron",
          patronPhone: patronPhone || "",
          patronEmail: patronEmail || "",
          patronCity: patronCity || "Kurnool",
          tierName: selectedTier || "Life Patron",
        });

        setReceiptSuccess({
          receiptNo: pId,
          date: new Date().toISOString(),
          donorName: patronName,
          donorEmail: patronEmail,
          donorPhone: patronPhone,
          amount: amountInINR,
          sevaTitle: `ISKCON Kurnool Life Patron Membership (${selectedTier})`,
          category: "Life Patron Membership",
          notes: `City: ${patronCity}. Eligible for 80G Income Tax Exemption.`,
          paymentMethod: "Razorpay Gateway",
        });
      },
    });

    rzp.open();
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronName || !patronPhone) {
      toast.error("Please enter your name and phone number");
      return;
    }

    const phoneNum = (lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "");
    const msg = `*NEW LIFE PATRON ENROLLMENT INQUIRY*%0A%0A*Name:* ${encodeURIComponent(patronName)}%0A*Phone:* ${encodeURIComponent(patronPhone)}%0A*Email:* ${encodeURIComponent(patronEmail || "N/A")}%0A*City:* ${encodeURIComponent(patronCity)}%0A*Selected Category:* ${encodeURIComponent(selectedTier)}%0A%0A_Hare Krishna! I would like to enroll as an ISKCON Kurnool Life Member and request payment & card procedure details._`;

    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp to connect with Temple Patron Coordinator!");
    setIsModalOpen(false);
  };

  return (
    <SiteLayout>
      {/* ULTRA PREMIUM HERO SECTION */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#1c0b36] via-[#2d1254] to-[#120524] text-white">
        {/* Glowing Background Orbs & Radial Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Shimmering Coupon Badge */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Shimmer Coupon Side Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 shadow-xl group hover:border-amber-400/80 transition-all">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
                
                <div className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md overflow-hidden">
                  <Ticket className="h-3.5 w-3.5" />
                  <span>LPM</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none animate-shimmer" />
                </div>

                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {lifePatron.badgeText || "✨ Life Patron Membership"}
                </span>
              </div>

              {/* Main Playfair Display Hero Title */}
              <div className="space-y-4">
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-tight leading-[1.15] drop-shadow-md">
                  {lifePatron.heroTitle || "Become an ISKCON Kurnool Life Member"}
                </h1>
                <p className="font-sans text-base sm:text-xl text-amber-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  {lifePatron.heroSubtitle || "Join our global spiritual family as a Life Patron and receive sacred blessings, lifetime temple privileges, and eternal spiritual merit."}
                </p>
              </div>

              {/* High Impact Patron Quick Highlights Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs sm:text-sm text-amber-200 font-medium">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>800+ Guest Houses Worldwide</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs sm:text-sm text-amber-200 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% Tax Deductible (80G)</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs sm:text-sm text-amber-200 font-medium">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                  <span>Lifetime Back to Godhead</span>
                </div>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/donate/$slug"
                  params={{ slug: "life-patron-membership" }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,197,24,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-300/60"
                >
                  <Award className="h-5 w-5" />
                  <span>Enroll as Life Member</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${(lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "")}?text=Hare%20Krishna!%20I%20want%20to%20know%20more%20about%20ISKCON%20Kurnool%20Life%20Patron%20Membership.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-sm border border-emerald-500/40 backdrop-blur-md transition-all cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>

            {/* Right Column: Clean Simple Admin Uploaded Image Banner (No Shadow, No Extra Cards) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <img
                src={heroImg}
                alt="Become an ISKCON Kurnool Life Member"
                className="w-full max-w-lg h-auto rounded-2xl object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: JOIN OUR SPIRITUAL FAMILY & ABOUT LIFE MEMBERSHIP (WARM IVORY / WHITE THEME) */}
      <section className="py-20 bg-gradient-to-b from-[#fdf6ec] via-white to-[#fdf6ec] text-slate-900 relative overflow-hidden border-t border-b border-amber-200/60">
        {/* Soft background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-900 font-extrabold text-xs uppercase tracking-wider border border-amber-300">
              <Globe className="h-4 w-4 text-amber-600" />
              <span>Global Devotional Fellowship</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-primary tracking-tight">
              Join Our Spiritual Family
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Experience spiritual growth, meaningful service, and the blessings of Krishna consciousness by becoming a Life Member of ISKCON Kurnool.
            </p>
          </div>

          {/* About Life Membership Main Card Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/90 shadow-elegant space-y-8 relative">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-5">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-700 shrink-0">
                <Sun className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                  About Life Membership
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Discover the purpose, spiritual impact, and lifelong privileges of ISKCON patronage
                </p>
              </div>
            </div>

            {/* 4 Paragraphs Arranged in a Clean Responsive 2x2 Grid Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl bg-[#fdf6ec]/80 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center gap-2.5 text-amber-800 font-display font-bold text-base">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                    <Globe className="h-4.5 w-4.5" />
                  </div>
                  <span>Worldwide Spiritual Mission</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  ISKCON is a worldwide spiritual organization dedicated to sharing the timeless teachings of the Vedic scriptures and the principles of Krishna consciousness.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#fdf6ec]/80 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center gap-2.5 text-amber-800 font-display font-bold text-base">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                    <Sun className="h-4.5 w-4.5" />
                  </div>
                  <span>Sacred Temple Sanctuary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  ISKCON Kurnool provides a spiritual and cultural environment where people can learn about Vedic wisdom, devotional practices, service, and a meaningful way of life.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#fdf6ec]/80 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center gap-2.5 text-amber-800 font-display font-bold text-base">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <span>Valued Member Connection</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  The Life Membership program offers an opportunity to become a valued part of the ISKCON family and support the temple's spiritual and cultural activities.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#fdf6ec]/80 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center gap-2.5 text-amber-800 font-display font-bold text-base">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <span>Service to Sri Krishna</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  By becoming a Life Member, you contribute towards the service of Sri Krishna while receiving opportunities to deepen your spiritual connection and association with devotees.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: WHY BECOME AN ISKCON KURNOOL LIFE MEMBER? (ROYAL PURPLE / WHITE TITLE THEME WITH DISTINCT SPLIT LAYOUT) */}
      <section className="py-20 bg-gradient-to-b from-[#18082e] via-[#260c47] to-[#120524] text-white relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Title in Pure White & Summary Box */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-400/30">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Patron Advantages</span>
              </div>

              {/* Main Title IN PURE WHITE as requested */}
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.15]">
                Why Become an ISKCON Kurnool Life Member?
              </h2>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                Life Membership is an opportunity to support the mission of ISKCON while becoming more closely connected with its spiritual community.
              </p>

              <div className="p-6 rounded-3xl bg-white/5 border border-amber-400/20 backdrop-blur-md space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-1">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-amber-100 font-medium leading-relaxed">
                    Begin your spiritual journey with ISKCON Kurnool and become a part of our growing spiritual family.
                  </p>
                </div>

                <Link
                  to="/donate/$slug"
                  params={{ slug: "life-patron-membership" }}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                >
                  <Award className="h-4.5 w-4.5" />
                  <span>Become a Life Member</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: 6 Distinct Feature Benefit Cards in a Clean 2-Column Grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  As a Life Member, you can:
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* 1 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">01</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Participate in spiritual and devotional activities.
                  </h3>
                </div>

                {/* 2 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <Building2 className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">02</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Support the development and services of ISKCON Kurnool.
                  </h3>
                </div>

                {/* 3 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">03</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Receive spiritual literature and devotional resources.
                  </h3>
                </div>

                {/* 4 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <Heart className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">04</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Experience the association of devotees.
                  </h3>
                </div>

                {/* 5 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <Award className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">05</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Receive applicable facilities and benefits available to Life Members.
                  </h3>
                </div>

                {/* 6 */}
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/60 hover:bg-white/10 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 group-hover:scale-110 transition-transform">
                      <Sun className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/60">06</span>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Contribute towards spreading Vedic knowledge and Krishna consciousness.
                  </h3>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: LIFE MEMBERSHIP BENEFITS (WARM GRADIENT BACKGROUND WITH THUMBNAIL CARDS) */}
      <section className="py-20 bg-gradient-to-b from-[#fdf6ec] via-[#f8ead7] to-[#f3dfc8] text-slate-900 relative overflow-hidden border-t border-b border-amber-300/60 shadow-inner">
        {/* Warm Ambient Radial Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-900 font-extrabold text-xs uppercase tracking-wider border border-amber-400/50 shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <span>Sacred Devotional Privileges</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-primary tracking-tight">
              Life Membership Benefits
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
              Explore the spiritual, devotional, and institutional benefits available to all ISKCON Kurnool Life Members.
            </p>
          </div>

          {/* FEATURED SEVA CARD WITH ADMIN UPLOADED IMAGE */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-amber-300/80 shadow-elegant overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Seva – Opportunity to Serve</span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-4xl text-primary leading-snug">
                  Seva – Opportunity to Serve
                </h3>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                  Become part of the service activities of ISKCON Kurnool and contribute towards the service of Sri Krishna. Your support helps the temple continue its spiritual, cultural, and community activities.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span>Sri Krishna Devotional Seva</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span>Community &amp; Cultural Growth</span>
                  </div>
                </div>
              </div>

              {/* Admin Uploaded Image Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-amber-300/60 aspect-4/3">
                  <img
                    src={lifePatron.sevaCardImage || "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=1200&q=85"}
                    alt="Seva Opportunity to Serve"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold font-display px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/20">
                    ✨ Dedicated Seva at Sri Sri Jagannath Baladev Subhadra Temple
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 7 BENEFIT CARDS WITH ADMIN THUMBNAIL IMAGES */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Spiritual Knowledge */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
                    alt="Spiritual Knowledge"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    📖 Vedic Wisdom &amp; Scriptures
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Spiritual Knowledge
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Receive spiritual books and resources that help you explore the teachings of Bhagavad-gita, Srimad-Bhagavatam, and other Vedic scriptures.
                  </p>
                </div>
              </div>
            </div>

            {/* Prasadam */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
                    alt="Prasadam"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    🍲 Sanctified Feast Tradition
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <Heart className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Prasadam
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Experience the spiritual tradition of prasadam and participate in devotional programs and special occasions at ISKCON centres, subject to the applicable Life Member facilities.
                  </p>
                </div>
              </div>
            </div>

            {/* Life Member / Patron Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80"
                    alt="Life Member / Patron Card"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    💳 Official Patron Recognition
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Life Member / Patron Card
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Receive your Life Membership card as recognition of your association with ISKCON. The card helps establish your Life Member status when availing applicable facilities at participating ISKCON centres.
                  </p>
                </div>
              </div>
            </div>

            {/* Support ISKCON Kurnool */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
                    alt="Support ISKCON Kurnool"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    🏛️ Temple Maintenance &amp; Sevas
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Support ISKCON Kurnool
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Your contribution supports the development and maintenance of ISKCON Kurnool and helps facilitate spiritual programs, festivals, prasadam distribution, educational activities, and other community services.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Occasions */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
                    alt="Special Occasions"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    🎉 Birthdays &amp; Anniversaries
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Special Occasions
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Life Members may receive special prasadam or other devotional facilities on occasions such as birthdays and anniversaries, according to the facilities offered by the temple.
                  </p>
                </div>
              </div>
            </div>

            {/* Book Set */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-amber-300/70 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
                    alt="Book Set"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    📚 Sacred Literature Set
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-primary">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                      <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-primary">
                      Book Set
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Life Members may receive spiritual literature as part of their membership benefits. The book set can be collected from the temple after completion of the applicable membership contribution. Additional charges may apply for delivery to the member's address.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* VISITING ISKCON CENTRES WIDE CARD */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 rounded-3xl p-6 sm:p-8 border border-amber-400/80 shadow-md backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-amber-500/20 text-amber-900 rounded-2xl shrink-0 shadow-xs">
                  <Globe className="h-7 w-7 text-amber-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-primary">
                    Visiting ISKCON Centres
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans max-w-3xl">
                    Life Members can contact official ISKCON centres when planning visits and enquire about the facilities available to Life Members. Please contact the respective ISKCON centre in advance to confirm accommodation and other facilities, and carry your valid Life Membership card/details when visiting.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>Enquire Patron Visits</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* OFFICIAL ISKCON LIFE PATRON PASS SECTION (GOLD GRADIENT EFFECT THEME WITH 3D CARD TILT HOVER ANIMATION) */}
      <section className="py-24 bg-gradient-to-b from-[#1c0a2a] via-[#290d45] to-[#120422] text-white relative overflow-hidden">
        {/* Radiant Gold Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold border border-amber-400/30">
                <QrCode className="h-4 w-4 text-amber-400" />
                <span>Official Patron Card</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-tight">
                {lifePatron.cardPassTitle || "Official ISKCON Life Patron Pass"}
              </h2>

              <p className="text-amber-100/90 text-base sm:text-lg leading-relaxed font-normal">
                {lifePatron.cardPassSubtitle || "Global Spiritual Membership Card · Recognised in 800+ Temples Worldwide"}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 text-xs sm:text-sm text-amber-200 backdrop-blur-md">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>Complimentary stay in 800+ ISKCON guest houses globally</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 text-xs sm:text-sm text-amber-200 backdrop-blur-md">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>Lifetime Back to Godhead monthly spiritual magazine</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-amber-400/20 text-xs sm:text-sm text-amber-200 backdrop-blur-md">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>100% Tax Deductible (Section 80G) Certificate</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/donate/$slug"
                  params={{ slug: "life-patron-membership" }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,197,24,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/60"
                >
                  <Award className="h-5 w-5" />
                  <span>Apply for Patron Card</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Gold Gradient Theme Card with 3D Tilt Hover Animation (Clean image without border) */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 8, rotateX: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full max-w-lg relative group perspective-1000 cursor-pointer"
              >
                <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                  <img
                    src={lifePatron.cardPassImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=85"}
                    alt="Official ISKCON Life Patron Pass"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: ISKCON KURNOOL LIFE MEMBERSHIP (ULTRA-MODERN PRICING & BENEFIT INFOGRAPHICS) */}
      <section className="py-20 bg-gradient-to-b from-[#fdf6ec] via-white to-[#fdf6ec] relative border-t border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 font-extrabold text-xs uppercase tracking-wider border border-amber-400/50 shadow-xs">
              <Ticket className="h-4 w-4 text-amber-600" />
              <span>Official Temple Membership</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-primary tracking-tight">
              ISKCON Kurnool Life Membership
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Become a recognized lifelong patron of Sri Sri Jagannath Baladev Subhadra Temple with lifetime devotional privileges.
            </p>
          </div>

          {/* MAIN FEATURED PATRON PRICING & PAYMENT CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300/80 shadow-2xl relative overflow-hidden">
            {/* Top Gold Accent Ribbon */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 via-orange-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-widest px-6 py-1.5 rounded-bl-2xl shadow-md">
              ✨ LIFELONG PATRON MEMBERSHIP
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Modern Price Display Hero Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border-2 border-amber-300/70 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
                      One-Time Devotional Contribution
                    </span>
                    <span className="text-xs font-bold text-amber-800 font-mono">
                      80G Tax Exempt
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2 pt-1">
                    <span className="font-sans font-black text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 tracking-tight">
                      ₹55,555
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-700 font-sans">/-</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 ml-1">
                      Only (Lifetime Membership)
                    </span>
                  </div>

                  {/* Installment Badge */}
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-300/80 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <strong className="text-amber-900 font-bold block">Installment Facility Available</strong>
                      <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">
                        Flexible installment options may be available. Please contact ISKCON Kurnool directly for current terms and customized payment plans.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Membership Includes List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                    <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                      <span>Membership Includes:</span>
                    </h4>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Lifetime Privileges
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Life Member / Patron Card</strong>
                        <span className="text-slate-500 text-[11px]">Official recognition card valid worldwide</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Global Accommodation Privileges</strong>
                        <span className="text-slate-500 text-[11px]">Stay facilities at participating ISKCON centres</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Spiritual Books &amp; Literature</strong>
                        <span className="text-slate-500 text-[11px]">Sacred Vedic literature &amp; publications</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Devotional Seva Opportunities</strong>
                        <span className="text-slate-500 text-[11px]">Direct participation in Sri Krishna Seva</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Prasadam Facilities</strong>
                        <span className="text-slate-500 text-[11px]">Sanctified prasadam on visits &amp; programs</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Special Occasion Facilities</strong>
                        <span className="text-slate-500 text-[11px]">Blessings on birthdays &amp; anniversaries</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic leading-relaxed pt-1">
                    * For current membership benefits, eligibility, accommodation facilities, and applicable terms, please contact ISKCON Kurnool directly.
                  </p>
                </div>

                {/* Payment Option Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link
                    to="/donate/$slug"
                    params={{ slug: "life-patron-membership" }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300"
                  >
                    <Award className="h-5 w-5" />
                    <span>Pay ₹55,555 Online &amp; Enroll</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={`https://wa.me/${(lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "")}?text=Hare%20Krishna!%20I%20am%20interested%20in%20ISKCON%20Kurnool%20Life%20Membership%20(Rs.55,555).%20Please%20send%20installment%20and%20payment%20options.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-200" />
                    <span>Enquire Installments on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Patron Card Display */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/70 relative group bg-slate-950">
                  <img
                    src={lifePatron.cardPassImage || lifePatron.heroImage}
                    alt="Official ISKCON Life Patron Card"
                    className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                </div>

                <div className="text-center text-xs font-bold text-slate-700 bg-amber-100/80 border border-amber-300 px-4 py-1.5 rounded-full">
                  Valid across 800+ ISKCON Centres Worldwide
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 80G TAX EXEMPTION BANNER */}
      <section className="py-12 bg-emerald-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 p-8 rounded-3xl bg-emerald-900/50 border border-emerald-500/30 backdrop-blur-md">
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 shrink-0">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">100% Tax Deductible (Section 80G)</h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                All patron contributions made to ISKCON Kurnool are eligible for 80G Income Tax exemption certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (ANIMATED ACCORDION DROPDOWN) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Clear answers regarding ISKCON Life Membership rules and guest house reservations.
            </p>
          </div>

          <div className="space-y-3">
            {(lifePatron.faqs || []).map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-amber-50/50 border border-amber-200/80 overflow-hidden transition-all duration-300 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-base text-primary hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-amber-600 font-extrabold text-sm font-mono">Q.</span>
                      <span>{faq.question}</span>
                    </span>
                    <span className={`p-1.5 rounded-full bg-amber-200/60 text-amber-900 transition-transform duration-300 ${isOpen ? "rotate-180 bg-amber-500 text-slate-950" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-10 border-t border-amber-100/80 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENROLLMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-primary">Life Member Enrollment</h3>
                  <p className="text-xs text-slate-500">Selected Category: <strong className="text-amber-600">{selectedTier}</strong></p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patronName}
                    onChange={(e) => setPatronName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Sri Devotee Patron"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patronPhone}
                      onChange={(e) => setPatronPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="+91 95053 77520"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={patronCity}
                      onChange={(e) => setPatronCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Kurnool"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={patronEmail}
                    onChange={(e) => setPatronEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="patron@example.com"
                  />
                </div>

                <div className="pt-4 border-t space-y-3">
                  <button
                    type="button"
                    onClick={() => triggerOnboardingFlow(patronName, patronPhone, 55555)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Complete Payment &amp; View Onboarding Flow (Test / Instant)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRazorpayPayment(55555)}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Award className="h-4 w-4 text-amber-400" />
                    <span>Pay via Razorpay Gateway (Live)</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Inquiry for Installments</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REUSABLE LIFE PATRON ONBOARDING MODAL */}
      <LifePatronOnboardingModal
        data={onboardingData}
        onClose={() => setOnboardingData(null)}
        onGenerateReceipt={handleGenerateReceipt}
      />

      {/* OFFICIAL DOWNLOADABLE DONATION RECEIPT MODAL */}
      {receiptSuccess && (
        <OfficialReceiptModal
          data={receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
        />
      )}

    </SiteLayout>
  );
}
