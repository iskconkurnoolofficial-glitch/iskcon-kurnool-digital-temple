import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdmin, PaymentPage, calculatePlatformFee } from "@/context/AdminContext";
import OfficialReceiptModal from "@/components/OfficialReceiptModal";
import { 
  Heart, 
  IndianRupee, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Target, 
  CheckCircle2, 
  ExternalLink,
  Copy,
  Check,
  User,
  Zap,
  Crown,
  Layers,
  Award
} from "lucide-react";

export const Route = createFileRoute("/pay/$slug")({
  head: () => ({
    meta: [
      { title: "Direct Seva Payment — ISKCON Kurnool" },
      { name: "description", content: "Official instant payment page for ISKCON Kurnool divine sevas." },
    ]
  }),
  component: PaymentPageRoute,
});

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

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80";

function PaymentPageRoute() {
  const { slug } = Route.useParams();
  const { paymentPages, settings, addPaymentRecord, platformFee, ready } = useAdmin();
  
  const [page, setPage] = useState<PaymentPage | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("5555");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);

  // Success Receipt Modal
  const [paymentSuccess, setPaymentSuccess] = useState<{
    paymentId: string;
    amount: number;
    donorName: string;
  } | null>(null);

  useEffect(() => {
    if (ready && paymentPages.length > 0) {
      const found = paymentPages.find((p) => p.slug === slug || p.id === slug);
      if (found) {
        setPage(found);
        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const amountParam = searchParams?.get("amount") || searchParams?.get("amt");
        if (amountParam && !isNaN(Number(amountParam))) {
          setCustomAmount(amountParam);
          if (found.pricingType === "preset" && found.presetPrices?.length) {
            const matchingTier = found.presetPrices.find((p) => p.amount === Number(amountParam));
            if (matchingTier) {
              setSelectedTierId(matchingTier.id);
            } else {
              setSelectedTierId("");
            }
          }
        } else if (found.pricingType === "fixed") {
          setCustomAmount(String(found.fixedAmount || 5555));
        } else if (found.pricingType === "preset" && found.presetPrices?.length) {
          setSelectedTierId(found.presetPrices[0].id);
          setCustomAmount(String(found.presetPrices[0].amount));
        }
      } else {
        setPage(null);
      }
    }
  }, [slug, paymentPages, ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!page || !page.active) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-950 text-white">
        <div className="max-w-md w-full text-center bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 space-y-4">
          <div className="h-16 w-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Page Not Found or Inactive</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            This payment link might have expired or been deactivated. Please check with the administrator or explore available temple sevas.
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            Explore Public Sevas
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current amount to pay
  let activeAmount = 0;
  if (page.pricingType === "fixed") {
    activeAmount = page.fixedAmount || 0;
  } else if (page.pricingType === "preset") {
    const tier = page.presetPrices?.find((p) => p.id === selectedTierId);
    activeAmount = tier ? tier.amount : Number(customAmount) || 0;
  } else {
    activeAmount = Number(customAmount) || 0;
  }

  const platformChargeAmount = platformFee.enabled && coverPlatformFee ? calculatePlatformFee(activeAmount, platformFee) : 0;
  const totalPayableAmount = activeAmount + platformChargeAmount;

  const handlePayNow = async () => {
    if (activeAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    // Validate required fields
    for (const f of page.fields) {
      if (f.required && !fieldValues[f.id]?.trim()) {
        alert(`Please fill in required field: ${f.label}`);
        return;
      }
    }

    // Handle Razorpay direct external link override if configured
    if (page.razorpayPageUrl) {
      window.open(page.razorpayPageUrl, "_blank");
      return;
    }

    setBusy(true);
    const ok = await loadRazorpay();
    setBusy(false);

    if (!ok) {
      alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    const donorNameVal = fieldValues["f1"] || fieldValues["name"] || Object.values(fieldValues)[0] || "Devotee";
    const donorEmailVal = fieldValues["f2"] || fieldValues["email"] || "";
    const donorPhoneVal = fieldValues["f3"] || fieldValues["phone"] || "";

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(totalPayableAmount * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${page.title}`,
      image: page.logoUrl || settings.logo || undefined,
      notes: {
        pageTitle: page.title,
        pageSlug: page.slug,
        baseDonation: activeAmount,
        platformFeeCovered: coverPlatformFee ? platformChargeAmount : 0,
        ...fieldValues,
      },
      prefill: {
        name: donorNameVal,
        email: donorEmailVal,
        contact: donorPhoneVal,
      },
      theme: {
        color: "#5b2c9b",
      },
      handler: async function (response: any) {
        const pId = response.razorpay_payment_id || `pay_${Date.now()}`;
        setPaymentSuccess({
          paymentId: pId,
          amount: totalPayableAmount,
          donorName: donorNameVal,
        });

        // Store payment record in Admin Panel
        try {
          await addPaymentRecord({
            paymentId: pId,
            donorName: donorNameVal,
            donorEmail: donorEmailVal,
            donorPhone: donorPhoneVal,
            amount: totalPayableAmount,
            baseAmount: activeAmount,
            platformFee: coverPlatformFee ? platformChargeAmount : 0,
            currency: "INR",
            category: `Instant Page: ${page.title}`,
            sevaOrPageTitle: page.title,
            status: "Completed",
            paymentMethod: "Razorpay",
            notes: Object.entries(fieldValues)
              .map(([k, v]) => {
                const fieldDef = page.fields.find((f) => f.id === k);
                return `${fieldDef ? fieldDef.label : k}: ${v}`;
              })
              .join(" | "),
          });
        } catch (err) {
          console.error("Failed to store payment record:", err);
        }
      },
    });

    rzp.open();
  };

  // Goal tracker percent calculation
  const goalTarget = page.goalAmount || 100000;
  const goalRaised = page.raisedAmount || 0;
  const goalPercent = Math.min(100, Math.round((goalRaised / goalTarget) * 100));

  const bannerToDisplay = page.bannerImage || DEFAULT_BANNER;
  const styleMode = page.bgStyle || "gradient";
  const themeMode = page.layoutTheme || "split";

  return (
    <div
      className={`min-h-screen font-sans relative overflow-hidden py-4 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-500 ${
        themeMode === "royal"
          ? "bg-[#0a0512] text-white"
          : "bg-gradient-to-br from-[#fffdfa] via-[#fbf6ea] to-[#f4ebdc] text-slate-900"
      }`}
    >
      {/* Ambient Glow Orbs */}
      {themeMode === "royal" ? (
        <>
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* SVG Background Patterns */}
      {styleMode === "geometric" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <svg className="w-full h-full text-amber-500/30" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="sacred-geo" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M40 0 L40 80 M0 40 L80 40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                <polygon points="40,10 70,70 10,70" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <polygon points="40,70 70,10 10,10" fill="none" stroke="currentColor" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sacred-geo)" />
          </svg>
        </div>
      )}

      {styleMode === "minimal" && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="dot-matrix" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-matrix)" />
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LAYOUT THEME 3: MINIMALIST CENTERED CARD (Razorpay Standard Style)         */}
      {/* ========================================================================= */}
      {themeMode === "centered" ? (
        <div className="max-w-xl mx-auto space-y-6 relative z-10 animate-fade-in pb-24 sm:pb-20">
          {/* Centered Top Brand Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary absolute top-0 left-0 right-0" />
            
            {/* SAFFRON CORNER BUTTON */}
            <Link
              to="/donate"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 inline-flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              <Heart className="h-3.5 w-3.5 text-white fill-white" />
              <span>Explore Sevas</span>
            </Link>

            <div className="space-y-3 pt-2">
              {page.logoUrl || settings.logo ? (
                <img
                  src={page.logoUrl || settings.logo}
                  alt="ISKCON Logo"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-500 shadow-md shadow-amber-500/30 mx-auto"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-bold text-xl flex items-center justify-center mx-auto shadow-md ring-2 ring-amber-500 shadow-amber-500/30">
                  IK
                </div>
              )}
              <div>
                <h2 className="font-sans font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-amber-600 via-primary to-orange-600 bg-clip-text text-transparent">
                  ISKCON Kurnool
                </h2>
                <p className="font-sans text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Sri Sri Puri Jagannath Temple
                </p>
              </div>
            </div>

            {/* Banner Image inside Centered Modal */}
            {page.bannerImage && (
              <div className="rounded-2xl overflow-hidden h-40 relative shadow-md">
                <img src={page.bannerImage} alt={page.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white text-left font-display font-bold text-lg">
                  {page.title}
                </div>
              </div>
            )}

            {!page.bannerImage && (
              <h1 className="font-display text-2xl font-bold text-slate-900">{page.title}</h1>
            )}

            {/* Pricing Mode */}
            {page.pricingType === "fixed" && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-secondary font-bold uppercase">Fixed Seva Offering</span>
                <span className="text-2xl font-extrabold font-sans text-secondary">
                  ₹{(page.fixedAmount || 0).toLocaleString("en-IN")}.00
                </span>
              </div>
            )}

            {page.pricingType === "preset" && (
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Offering Amount
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {page.presetPrices?.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => {
                        setSelectedTierId(pr.id);
                        setCustomAmount(String(pr.amount));
                      }}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        selectedTierId === pr.id
                          ? "bg-primary/5 border-primary text-primary font-bold ring-2 ring-primary/20 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-xs font-semibold">{pr.label}</span>
                      <span className="text-sm font-extrabold font-sans text-primary">₹{pr.amount.toLocaleString("en-IN")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {page.pricingType === "custom" && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Enter Offering Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg font-sans">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="5555"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 font-sans focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3 text-left">
              {page.fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type={f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    value={fieldValues[f.id] || ""}
                    onChange={(e) => setFieldValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition"
                  />
                </div>
              ))}
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={busy}
              onClick={handlePayNow}
              className="w-full py-4 bg-gradient-to-r from-primary via-[#3d1a6a] to-primary hover:from-primary/95 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl transition cursor-pointer flex items-center justify-between px-6 active:scale-[0.99] disabled:opacity-60"
            >
              <span className="text-[10px] text-secondary font-mono tracking-widest uppercase flex items-center gap-1">
                <Zap className="h-4 w-4" /> Instant Payment
              </span>
              <span className="flex items-center gap-1.5 font-sans font-extrabold">
                Pay ₹{activeAmount > 0 ? activeAmount.toLocaleString("en-IN") : "0"}.00
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* LAYOUT THEMES 1 & 2: FLOATING GLASS SPLIT & DARK ROYAL TEMPLE               */
        /* ========================================================================= */
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10 animate-fade-in pb-24 sm:pb-20">

          {/* ULTRA-VIBRANT 3D GRADIENT HEADER CARD */}
          <div
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-500/20 backdrop-blur-xl border-t-2 border-amber-300/40 border-b border-black/90 border-x border-amber-500/30 flex items-center justify-between gap-3 sm:gap-4 transition-all relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#27104b] via-[#3a1563] to-slate-950 text-white`}
          >
            {/* Ambient Background Ray Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent pointer-events-none" />

            {/* LEFT: CIRCULAR TEMPLE LOGO WITH SAFFRON RING */}
            <div className="flex items-center shrink-0 z-10">
              {page.logoUrl || settings.logo ? (
                <img
                  src={page.logoUrl || settings.logo}
                  alt="ISKCON Logo"
                  className="h-12 w-12 sm:h-15 sm:w-15 rounded-full object-cover ring-2 ring-amber-500 shadow-md shadow-amber-500/40"
                />
              ) : (
                <div className="h-12 w-12 sm:h-15 sm:w-15 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center shadow-md ring-2 ring-amber-500 shadow-amber-500/40">
                  IK
                </div>
              )}
            </div>

            {/* CENTER: ISKCON KURNOOL & SRI SRI PURI JAGANNATH TEMPLE (GOLDEN SAFFRON TEXT GRADIENT) */}
            <div className="text-center flex-1 space-y-0.5 px-2 min-w-0 z-10">
              <h2 className="font-sans font-extrabold text-base sm:text-2xl text-white tracking-tight truncate flex items-center justify-center gap-1.5 drop-shadow-sm">
                {themeMode === "royal" && <Crown className="h-4 w-4 text-amber-400 shrink-0" />} ISKCON Kurnool
              </h2>
              <p className="font-sans text-[11px] sm:text-xs font-bold tracking-wide truncate bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                Sri Sri Puri Jagannath Temple
              </p>
            </div>

            {/* RIGHT: SAFFRON EXPLORE SEVAS BUTTON */}
            <Link
              to="/donate"
              className="shrink-0 z-10 inline-flex items-center gap-1.5 py-2 px-3 sm:px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 border border-white/20"
            >
              <Heart className="h-3.5 w-3.5 text-white fill-white" />
              <span className="hidden sm:inline">Explore Sevas</span>
              <span className="sm:hidden">Sevas</span>
            </Link>
          </div>

          {/* HERO BANNER IMAGE CARD */}
          <div
            className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl group bg-slate-950 border ${
              themeMode === "royal" ? "border-amber-500/40 shadow-amber-500/10" : "border-amber-200/60"
            }`}
          >
            <img
              src={bannerToDisplay}
              alt={page.title}
              className="w-full h-44 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Badge Overlay */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5">
              <span className="inline-flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-secondary text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/20 shadow-md">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" /> Devotional Offering
              </span>
            </div>

            {/* Title Overlay inside Hero Image */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1">
              <h1 className="font-display text-xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                {page.title}
              </h1>
            </div>
          </div>

          {/* Main Payment & Cause Layout (Mobile Flow: Payment Card First) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

            {/* RIGHT COLUMN IN DESKTOP / FIRST IN MOBILE: Payment Details Card */}
            <div className="lg:col-span-5 lg:order-2 sticky top-4">
              <div
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden transition-all ${
                  themeMode === "royal"
                    ? "bg-gradient-to-br from-[#1c0e35] via-slate-900 to-[#160a2c] text-white border-amber-500/40 shadow-amber-500/20"
                    : "bg-gradient-to-br from-white via-amber-50/50 to-orange-50/40 text-slate-900 border-amber-300/70 shadow-amber-500/10"
                }`}
              >
                {/* Top Accent Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

                <div className="flex items-center justify-between border-b border-slate-100/20 pb-3">
                  <div>
                    <h3 className={`font-display text-lg sm:text-xl font-bold ${themeMode === "royal" ? "text-white" : "text-slate-900"}`}>
                      Payment Details
                    </h3>
                    <div className="w-8 h-1 bg-secondary rounded-full mt-1" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Secured
                  </span>
                </div>

                {/* Pricing Mode Display (Inter Font for Amounts) */}
                {page.pricingType === "fixed" && (
                  <div className="bg-gradient-to-br from-slate-900 to-primary text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between border border-amber-500/30">
                    <div>
                      <div className="text-[10px] text-secondary uppercase font-bold tracking-wider">Fixed Seva Amount</div>
                      <div className="text-[11px] sm:text-xs text-white/80 font-medium">Divine Offering</div>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold font-sans text-secondary">
                      ₹{(page.fixedAmount || 0).toLocaleString("en-IN")}.00
                    </span>
                  </div>
                )}

                {page.pricingType === "preset" && (
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeMode === "royal" ? "text-amber-200" : "text-slate-700"}`}>
                      Select Seva Offering Amount
                    </label>
                    <div className="space-y-2">
                      {page.presetPrices?.map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => {
                            setSelectedTierId(pr.id);
                            setCustomAmount(String(pr.amount));
                          }}
                          className={`w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                            selectedTierId === pr.id
                              ? themeMode === "royal"
                                ? "bg-amber-500/20 border-amber-400 text-secondary font-bold ring-2 ring-amber-400/30 shadow-xs"
                                : "bg-primary/5 border-primary text-primary font-bold ring-2 ring-primary/20 shadow-xs"
                              : themeMode === "royal"
                              ? "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xs font-semibold">{pr.label}</span>
                          <span className={`text-sm font-extrabold font-sans ${themeMode === "royal" ? "text-secondary" : "text-primary"}`}>
                            ₹{pr.amount.toLocaleString("en-IN")}.00
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {page.pricingType === "custom" && (
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${themeMode === "royal" ? "text-amber-200" : "text-slate-700"}`}>
                      Enter Offering Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg font-sans">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="5555"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className={`w-full pl-9 pr-4 py-3 border rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg font-sans focus:outline-none focus:border-primary ${
                          themeMode === "royal"
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Donor Fields Form */}
                <div className="space-y-3 pt-1">
                  {page.fields.map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className={`text-xs font-bold block ${themeMode === "royal" ? "text-slate-300" : "text-slate-700"}`}>
                        {f.label} {f.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        value={fieldValues[f.id] || ""}
                        onChange={(e) => setFieldValues((v) => ({ ...v, [f.id]: e.target.value }))}
                        className={`w-full px-3.5 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition ${
                          themeMode === "royal"
                            ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Platform / Gateway Charges Checkbox & Donation Summary */}
                {platformFee.enabled && activeAmount > 0 && (
                  <div className="pt-2 border-t border-slate-200/40 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={coverPlatformFee}
                        onChange={(e) => setCoverPlatformFee(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <span className={themeMode === "royal" ? "text-slate-200" : "text-slate-700"}>
                        {platformFee.label || "I would like to cover the payment gateway charges"}{" "}
                        <span className="text-emerald-600 font-bold font-sans">
                          (+₹{calculatePlatformFee(activeAmount, platformFee)})
                        </span>
                      </span>
                    </label>

                    {/* Donation Summary Box */}
                    <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      themeMode === "royal" ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      <div className="flex justify-between">
                        <span>Donation Amount:</span>
                        <span className="font-bold font-sans text-slate-800">₹{activeAmount.toLocaleString("en-IN")}.00</span>
                      </div>
                      {coverPlatformFee && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Platform Charge ({platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`}):</span>
                          <span className="font-bold font-sans">+₹{calculatePlatformFee(activeAmount, platformFee)}.00</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1.5 text-slate-900 text-sm">
                        <span>Total Payable:</span>
                        <span className="font-sans text-primary">₹{totalPayableAmount.toLocaleString("en-IN")}.00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Razorpay Metallic Pay Button */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={handlePayNow}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary via-[#3d1a6a] to-primary hover:from-primary/95 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl transition cursor-pointer flex items-center justify-between px-5 sm:px-6 active:scale-[0.99] disabled:opacity-60 group"
                >
                  <span className="text-[10px] text-secondary font-mono tracking-widest uppercase flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> Instant Payment
                  </span>
                  <span className="flex items-center gap-1.5 font-sans font-extrabold">
                    Pay ₹{totalPayableAmount > 0 ? totalPayableAmount.toLocaleString("en-IN") : "0"}.00
                  </span>
                </button>
              </div>
            </div>

            {/* LEFT COLUMN IN DESKTOP / SECOND IN MOBILE: Cause Details & Goal Tracker */}
            <div className="lg:col-span-7 lg:order-1 space-y-6">
              <div
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-sm space-y-6 backdrop-blur-md ${
                  themeMode === "royal"
                    ? "bg-slate-900/90 text-white border-slate-800"
                    : "bg-white/90 text-slate-900 border-white/90"
                }`}
              >
                
                {/* Goal Tracker Component */}
                {page.enableGoalTracker && (
                  <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-300/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                      <span className="flex items-center gap-1.5 font-display text-xs sm:text-sm">
                        <Target className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-600" /> Goal Progress Tracker
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] sm:text-[11px] font-bold">
                        {goalPercent}% Raised
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-3 sm:h-3.5 bg-amber-200/60 rounded-full overflow-hidden p-0.5 border border-amber-300/40">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 transition-all duration-1000 rounded-full shadow-xs"
                        style={{ width: `${goalPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-amber-950 pt-1 font-sans">
                      <span>₹{(goalRaised).toLocaleString("en-IN")} Raised</span>
                      <span className="text-amber-800/80">Target: ₹{(goalTarget).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                {/* Page Description */}
                {page.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About This Seva</h3>
                    <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${themeMode === "royal" ? "text-slate-200" : "text-slate-700"}`}>
                      {page.description}
                    </div>
                  </div>
                )}

                {/* Contact Us */}
                {(page.contactEmail || page.contactPhone || settings.phone) && (
                  <div className="border-t border-slate-100/20 pt-4 space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Temple Contact Details</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold">
                      {(page.contactEmail || settings.email) && (
                        <a href={`mailto:${page.contactEmail || settings.email}`} className="flex items-center gap-1.5 hover:text-primary">
                          <Mail className="h-4 w-4 text-primary" /> {page.contactEmail || settings.email}
                        </a>
                      )}
                      {(page.contactPhone || settings.phone) && (
                        <a href={`tel:${page.contactPhone || settings.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                          <Phone className="h-4 w-4 text-primary" /> {page.contactPhone || settings.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                {page.termsAndConditions && (
                  <div className="border-t border-slate-100/20 pt-3 text-[11px] text-slate-500 leading-normal">
                    {page.termsAndConditions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM PAYMENT BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white border-t border-slate-800 p-3.5 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
        <div>
          <div className="text-[10px] uppercase font-bold text-secondary">Total Payable</div>
          <div className="text-base font-bold font-sans text-white">
            ₹{totalPayableAmount > 0 ? totalPayableAmount.toLocaleString("en-IN") : "0"}.00
          </div>
        </div>
        <button
          onClick={handlePayNow}
          className="py-2.5 px-5 bg-secondary text-primary font-bold text-xs rounded-xl shadow-lg active:scale-95 transition flex items-center gap-1"
        >
          <span>Pay Now</span>
          <Zap className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Payment Success Receipt Modal with PNG Download & Signature */}
      {paymentSuccess && (
        <OfficialReceiptModal
          data={{
            receiptNo: paymentSuccess.paymentId,
            date: new Date().toISOString(),
            donorName: paymentSuccess.donorName,
            amount: paymentSuccess.amount,
            sevaTitle: page.title,
            category: "Instant Payment Page",
          }}
          onClose={() => setPaymentSuccess(null)}
        />
      )}
    </div>
  );
}
