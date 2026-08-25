import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, Seva, calculatePlatformFee } from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import { 
  Heart, 
  Search, 
  HandHeart, 
  IndianRupee, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Plus,
  FileText
} from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Sri Sri Jagannath Sevas | ISKCON Kurnool" },
      { name: "description", content: "Participate in divine service — offer Sri Sri Jagannath Sevas at ISKCON Kurnool. Every seva performed with love reaches the lotus feet of the Lord." },
    ]
  }),
  component: () => <Outlet />,
});

const RAZORPAY_KEY = "rzp_test_SwEw3kkyiffJww";

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

// Quick amount suggestions
const QUICK_SUGGESTIONS = [108, 251, 501, 1008, 2500, 5001, 11000];

export default function Page({ initialSlug }: { initialSlug?: string }) {
  const { sevas, settings, theme, ready, addDonation, updateDonationStatus, platformFee, addPaymentRecord, sunday } = useAdmin();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [checkoutSeva, setCheckoutSeva] = useState<Seva | null>(null);

  // Custom Amount state inside Checkout
  const [isCustomCheckoutAmount, setIsCustomCheckoutAmount] = useState(false);
  const [customCheckoutAmount, setCustomCheckoutAmount] = useState<string>("1008");

  // Quick Donate State with All Details
  const [quickAmount, setQuickAmount] = useState<number>(501);
  const [quickCustomInput, setQuickCustomInput] = useState<string>("501");
  const [quickDonorName, setQuickDonorName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPurpose, setQuickPurpose] = useState("");
  const [quickPan, setQuickPan] = useState("");
  const [quickCoverFee, setQuickCoverFee] = useState(true);
  const [quickIsSubmitting, setQuickIsSubmitting] = useState(false);

  // Success Receipt Modal State
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);

  // Form inputs for standard seva checkout
  const [donorName, setDonorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");

  useEffect(() => {
    if (initialSlug) {
      let found = sevas.find(s => s.slug === initialSlug || s.id === initialSlug);
      
      // Fallback for Sunday Feast Seva
      if (!found && (initialSlug === "sunday-feast-seva" || initialSlug === "sunday-feast")) {
        const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : 5001;
        const amt = isNaN(rawAmount) || rawAmount <= 0 ? 5001 : rawAmount;
        found = {
          id: "s_sunday_feast_fallback",
          title: sunday.donationCardTitle || "Sunday Feast Annadana Seva",
          slug: "sunday-feast-seva",
          description: sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.",
          thumbnail: sunday.donationCardImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
          prices: [
            { label: "Sunday Feast Sponsorship", amount: amt }
          ],
          order: 1,
          active: true
        };
      }

      if (found) {
        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const amountParam = searchParams?.get("amount") || searchParams?.get("amt");
        
        if (amountParam && !isNaN(Number(amountParam))) {
          const amt = Number(amountParam);
          let matchIdx = found.prices.findIndex(p => p.amount === amt);
          if (matchIdx === -1) {
            setIsCustomCheckoutAmount(true);
            setCustomCheckoutAmount(String(amt));
          } else {
            setIsCustomCheckoutAmount(false);
            setSelected(prev => ({ ...prev, [found!.id]: matchIdx }));
          }
        } else {
          setIsCustomCheckoutAmount(false);
        }
        setCheckoutSeva(found);
      } else {
        setCheckoutSeva(null);
      }
    } else {
      setCheckoutSeva(null);
    }
  }, [initialSlug, sevas, sunday]);

  const active = useMemo(() => {
    let list = [...sevas].filter((s) => s.active);

    const hasSundayFeast = list.some(
      (s) => s.slug === "sunday-feast-seva" || s.slug === "sunday-feast" || s.title.toLowerCase().includes("sunday feast")
    );

    if (!hasSundayFeast && sunday.donationCardEnabled !== false) {
      const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : 5001;
      const amt = isNaN(rawAmount) || rawAmount <= 0 ? 5001 : rawAmount;
      const sundaySevaItem: Seva = {
        id: "s_sunday_feast_auto",
        title: sunday.donationCardTitle || "Sunday Feast Annadana Seva",
        slug: "sunday-feast-seva",
        description: sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.",
        thumbnail: sunday.donationCardImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
        prices: [
          { label: "Sunday Feast Sponsorship", amount: amt },
          { label: "50 Devotees Prasadam Seva", amount: 1500 },
          { label: "100 Devotees Prasadam Seva", amount: 3000 },
          { label: "Full Grand Feast Sponsorship", amount: 11000 },
        ],
        order: 0,
        active: true,
      };
      list = [sundaySevaItem, ...list];
    }

    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [sevas, sunday]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active;
    return active.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [active, query]);

  if (!ready) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </SiteLayout>
    );
  }

  const donate = async (
    seva: { title: string }, 
    amount: number, 
    label: string, 
    customDetails?: {
      donorName: string;
      phone: string;
      email?: string;
      pan?: string;
      purpose?: string;
      coverFee?: boolean;
    }
  ) => {
    if (amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const curDonorName = (customDetails?.donorName ?? donorName).trim();
    const curPhone = (customDetails?.phone ?? phone).trim();
    const curEmail = (customDetails?.email ?? email).trim() || `${curPhone.replace(/\D/g, "") || "devotee"}@iskconkurnool.org`;
    const curPan = (customDetails?.pan ?? pan).trim();
    const curPurpose = (customDetails?.purpose ?? purpose).trim();
    const curCoverFee = customDetails ? (customDetails.coverFee ?? true) : coverPlatformFee;

    // Store every submission in the admin panel before opening the gateway
    const enquiryId = await addDonation({
      donorName: curDonorName,
      email: curEmail,
      phone: curPhone,
      pan: curPan,
      purpose: curPurpose,
      sevaTitle: seva.title,
      optionLabel: label,
      amount,
    });

    const ok = await loadRazorpay();
    if (!ok) { 
      alert("Unable to load payment gateway. Please check your internet connection and try again."); 
      return; 
    }

    const platformCharge = platformFee.enabled && curCoverFee ? calculatePlatformFee(amount, platformFee) : 0;
    const totalPayable = amount + platformCharge;

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(totalPayable * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${seva.title} — ${label}`,
      image: settings.logo || undefined,
      notes: {
        seva: seva.title,
        option: label,
        baseDonation: amount,
        platformFeeCovered: platformCharge,
        donorName: curDonorName,
        purpose: curPurpose,
        email: curEmail,
        phone: curPhone,
        pan: curPan
      },
      prefill: {
        name: curDonorName || undefined,
        email: curEmail || undefined,
        contact: curPhone || settings.phone?.replace(/\D/g, "") || undefined
      },
      theme: { color: theme.primary || "#5b2c9b" },
      handler: async (response: any) => {
        const pId = response?.razorpay_payment_id || `pay_${Date.now()}`;
        const finalDonorName = curDonorName || "Devotee";

        if (enquiryId) {
          try {
            await updateDonationStatus(enquiryId, "paid", pId);
          } catch (e) {
            console.error("Failed to update donation status", e);
          }
        }

        try {
          await addPaymentRecord({
            paymentId: pId,
            donorName: finalDonorName,
            donorEmail: curEmail,
            donorPhone: curPhone,
            amount: totalPayable,
            baseAmount: amount,
            platformFee: platformCharge,
            currency: "INR",
            category: `General Seva: ${seva.title}`,
            sevaOrPageTitle: `${seva.title} (${label})`,
            status: "Completed",
            paymentMethod: "Razorpay",
            panNumber: curPan || undefined,
            notes: curPurpose || undefined,
            taxReceiptRequested: !!curPan,
          });
        } catch (err) {
          console.error("Failed to store payment record:", err);
        }

        // Show Official Downloadable Receipt Modal
        setReceiptSuccess({
          receiptNo: pId,
          date: new Date().toISOString(),
          donorName: finalDonorName,
          donorEmail: curEmail,
          donorPhone: curPhone,
          amount: totalPayable,
          sevaTitle: `${seva.title} (${label})`,
          category: "General Seva",
          notes: curPurpose,
          panNumber: curPan,
        });

        setCheckoutSeva(null);
        setDonorName("");
        setPurpose("");
        setEmail("");
        setPhone("");
        setPan("");
        setQuickDonorName("");
        setQuickPhone("");
        setQuickEmail("");
        setQuickPurpose("");
        setQuickPan("");
      },
    });
    rzp.open();
  };

  // Handle Quick Donate Form Submit with all details
  const handleQuickPayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(quickAmount);
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      alert("Please enter a valid donation amount.");
      return;
    }
    if (!quickDonorName.trim()) {
      alert("Please enter Devotee / Donor Name.");
      return;
    }
    if (!quickPhone.trim()) {
      alert("Please enter WhatsApp Phone Number.");
      return;
    }
    if (!quickEmail.trim()) {
      alert("Please enter Email Address.");
      return;
    }

    setQuickIsSubmitting(true);
    try {
      await donate(
        { title: "General Temple Seva & Deity Offering" },
        finalAmount,
        `Quick Donation (₹${finalAmount.toLocaleString("en-IN")})`,
        {
          donorName: quickDonorName,
          phone: quickPhone,
          email: quickEmail,
          pan: quickPan,
          purpose: quickPurpose || "Quick Devotional Offering",
          coverFee: quickCoverFee
        }
      );
    } finally {
      setQuickIsSubmitting(false);
    }
  };

  // ==========================================
  // SINGLE SEVA CHECKOUT VIEW
  // ==========================================
  if (checkoutSeva) {
    const selIdx = selected[checkoutSeva.id] ?? 0;
    const standardPrice = checkoutSeva.prices[selIdx] ?? checkoutSeva.prices[0];
    
    const customAmtNum = Number(customCheckoutAmount) || 0;
    const finalAmount = isCustomCheckoutAmount ? customAmtNum : (standardPrice?.amount || 0);
    const finalLabel = isCustomCheckoutAmount 
      ? `Custom Offering (₹${finalAmount.toLocaleString("en-IN")})` 
      : (standardPrice?.label || "Seva Offering");

    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!donorName.trim()) { alert("Please enter Donor Name."); return; }
      if (!email.trim()) { alert("Please enter Email Address."); return; }
      if (!phone.trim()) { alert("Please enter WhatsApp Phone Number."); return; }

      if (isCustomCheckoutAmount && (!finalAmount || finalAmount <= 0)) {
        alert("Please enter a valid offering amount (minimum ₹1).");
        return;
      }

      donate(checkoutSeva, finalAmount, finalLabel);
    };

    const platformCharge = platformFee.enabled && coverPlatformFee ? calculatePlatformFee(finalAmount, platformFee) : 0;
    const totalPayable = finalAmount + platformCharge;

    return (
      <SiteLayout>
        <PageHero
          eyebrow="Offer Your Seva"
          title="Seva Checkout"
          subtitle={`Complete your offering details for ${checkoutSeva.title}.`}
          pageKey="donate"
        />

        <section className="py-12 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition mb-8 cursor-pointer font-sans"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sevas list
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <div className="rounded-2xl overflow-hidden">
                    {checkoutSeva.thumbnail ? (
                      <img src={checkoutSeva.thumbnail} alt={checkoutSeva.title} className="w-full h-auto object-contain rounded-2xl shadow-sm border border-slate-100/50" />
                    ) : (
                      <div className="aspect-[4/3] w-full grid place-items-center text-primary/30 bg-primary/5 rounded-2xl">
                        <HandHeart className="h-16 w-16" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Selected Devotional Offering</span>
                    <h3 className="font-display font-extrabold text-2xl text-primary leading-tight">{checkoutSeva.title}</h3>
                    {checkoutSeva.description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{checkoutSeva.description}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Option / Amount</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {checkoutSeva.prices.map((p, i) => {
                        const isSel = !isCustomCheckoutAmount && i === selIdx;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setIsCustomCheckoutAmount(false);
                              setSelected((m) => ({ ...m, [checkoutSeva.id]: i }));
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${isSel
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            <span className={`text-xs font-bold font-sans ${isSel ? "text-primary" : "text-slate-700"}`}>
                              {p.label}
                            </span>
                            <span className={`text-xs font-extrabold font-sans ${isSel ? "text-primary" : "text-slate-900"}`}>
                              ₹{p.amount.toLocaleString("en-IN")}
                            </span>
                          </button>
                        );
                      })}

                      {/* Custom Amount Selection Option */}
                      <button
                        type="button"
                        onClick={() => setIsCustomCheckoutAmount(true)}
                        className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${isCustomCheckoutAmount
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm"
                          : "border-dashed border-amber-300/80 bg-amber-50/20 hover:border-amber-500 hover:bg-amber-50/40"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span className={`text-xs font-bold font-sans ${isCustomCheckoutAmount ? "text-amber-800" : "text-amber-700"}`}>
                            Custom Amount (Donate as You Wish)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          Enter Wish
                        </span>
                      </button>
                    </div>

                    {/* Custom Amount Input Field */}
                    {isCustomCheckoutAmount && (
                      <div className="p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Enter Offering Amount of Your Wish (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-amber-700">₹</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1008, 2500, 5000..."
                            value={customCheckoutAmount}
                            onChange={(e) => setCustomCheckoutAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 shadow-inner"
                          />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-amber-800 mr-1">Add:</span>
                          {[100, 500, 1000, 2500, 5000].map((addVal) => (
                            <button
                              key={addVal}
                              type="button"
                              onClick={() => {
                                const current = Number(customCheckoutAmount) || 0;
                                setCustomCheckoutAmount(String(current + addVal));
                              }}
                              className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-amber-100/80 text-amber-800 border border-amber-200 rounded-lg shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="h-2.5 w-2.5" /> ₹{addVal.toLocaleString("en-IN")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 space-y-2.5 border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                      <span>Selected Seva:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{checkoutSeva.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                      <span>Option:</span>
                      <span className="font-semibold text-slate-800 text-right">{finalLabel}</span>
                    </div>
                    <div className="h-px bg-slate-200/60 my-2" />
                    <div className="flex justify-between items-center text-sm font-bold text-primary font-display">
                      <span>Base Donation:</span>
                      <span className="text-base text-accent">₹{finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Donor Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h4 className="font-display font-extrabold text-xl text-primary">Donor & Receipt Information</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">Please provide your details below to process the offering receipt.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Donor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name of the devotee"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Purpose of Donation / Sankalpa</label>
                      <input
                        type="text"
                        placeholder="e.g. For good health, family welfare, birthdays..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="donor@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">WhatsApp Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">PAN Card (Optional)</label>
                        <span className="text-[10px] text-muted-foreground font-sans">For 80G Tax exemption benefits</span>
                      </div>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans tracking-wide uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Platform / Gateway Charges Checkbox */}
                  {platformFee.enabled && finalAmount > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none text-slate-700">
                        <input
                          type="checkbox"
                          checked={coverPlatformFee}
                          onChange={(e) => setCoverPlatformFee(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <span>
                          {platformFee.label || "I would like to cover the payment gateway charges"}{" "}
                          <span className="text-emerald-600 font-bold font-sans">
                            (+₹{calculatePlatformFee(finalAmount, platformFee)})
                          </span>
                        </span>
                      </label>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span>Donation Amount:</span>
                          <span className="font-bold font-sans text-slate-900">₹{finalAmount.toLocaleString("en-IN")}.00</span>
                        </div>
                        {coverPlatformFee && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Platform Charge ({platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`}):</span>
                            <span className="font-bold font-sans">+₹{calculatePlatformFee(finalAmount, platformFee)}.00</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 text-slate-900 text-sm">
                          <span>Total Payable:</span>
                          <span className="font-sans text-primary">₹{totalPayable.toLocaleString("en-IN")}.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <button
                      type="submit"
                      disabled={finalAmount <= 0}
                      className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 text-base tracking-wide uppercase shadow-[0_6px_22px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-98 ring-2 ring-amber-300/30"
                    >
                      <Lock className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                      <span className="relative z-10">
                        DONATE ₹{totalPayable.toLocaleString("en-IN")}
                      </span>
                      <Heart className="h-4.5 w-4.5 fill-white/20 stroke-[2.5] text-white transition-transform duration-300 group-hover:scale-125 group-hover:fill-white" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                      <span>100% Secure Payments by Razorpay</span>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ==========================================
  // MAIN DONATE DIRECTORY & COMPLETE QUICK DONATE
  // ==========================================
  const currentQuickAmountNum = Number(quickAmount) || 0;
  const quickPlatformCharge = platformFee.enabled && quickCoverFee ? calculatePlatformFee(currentQuickAmountNum, platformFee) : 0;
  const quickTotalPayable = currentQuickAmountNum + quickPlatformCharge;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Participate in Divine Service"
        title="Sri Sri Jagannath Sevas"
        subtitle="Offer your devotion to Lord Jagannath and be blessed. Every seva performed with love reaches the lotus feet of the Lord."
        pageKey="donate"
      />

      {/* ========================================= */}
      {/* COMPLETE QUICK DONATE SECTION */}
      {/* ========================================= */}
      <section className="py-8 bg-gradient-to-b from-[#fff7e6] via-[#fffbf0] to-[#fdf4d4] border-b border-amber-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border-2 border-amber-300/90 shadow-lg p-5 sm:p-7 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  <Zap className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-primary leading-tight">
                    Quick Devotional Offering
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    Choose an amount or enter your wish amount, enter your details, and donate securely.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shrink-0 self-start sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>80G Tax Exemption Eligible</span>
              </div>
            </div>

            {/* Grid Layout: Left (Form) & Right (Admin Uploaded Image) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              
              {/* Left Column: Form & Amounts */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                {/* Quick Amount Suggestions + Custom Amount */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
                    1. Select Offering Amount (₹)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {QUICK_SUGGESTIONS.map((amt) => {
                      const isSelected = quickAmount === amt && quickCustomInput === String(amt);
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setQuickAmount(amt);
                            setQuickCustomInput(String(amt));
                          }}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105 ring-2 ring-amber-300"
                            : "bg-slate-100 hover:bg-amber-100/80 text-slate-800 border border-slate-200"
                            }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          ₹{amt.toLocaleString("en-IN")}
                        </button>
                      );
                    })}

                    {/* Inline Custom Amount Input */}
                    <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Custom amount..."
                        value={quickCustomInput}
                        onChange={(e) => {
                          setQuickCustomInput(e.target.value);
                          setQuickAmount(Number(e.target.value) || 0);
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Donor Details & Pay Form */}
                <form onSubmit={handleQuickPayNow} className="space-y-4 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
                    2. Devotee & Receipt Details
                  </label>

                  {/* Row 1: Name, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 font-sans">
                        Devotee Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={quickDonorName}
                          onChange={(e) => setQuickDonorName(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 font-sans">
                        WhatsApp Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email, Purpose */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 font-sans">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="donor@example.com"
                          value={quickEmail}
                          onChange={(e) => setQuickEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 font-sans">
                        Purpose / Sankalpa (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Birthday, Family Welfare..."
                          value={quickPurpose}
                          onChange={(e) => setQuickPurpose(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: PAN Card */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 font-sans">
                      PAN Card (Optional for 80G Tax Exemption)
                    </label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={quickPan}
                      onChange={(e) => setQuickPan(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                    />
                  </div>

                  {/* Row 4: Platform Fee Checkbox & Total & Pay Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <div>
                      {platformFee.enabled && currentQuickAmountNum > 0 && (
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={quickCoverFee}
                            onChange={(e) => setQuickCoverFee(e.target.checked)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                          />
                          <span>
                            Cover payment gateway charges (+₹{quickPlatformCharge})
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-500 font-sans block leading-none">Total:</span>
                        <span className="text-lg font-black text-primary font-display">
                          ₹{quickTotalPayable.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={quickIsSubmitting || currentQuickAmountNum <= 0}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:pointer-events-none text-white font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wide shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-98"
                      >
                        <Lock className="h-4 w-4" />
                        <span>DONATE ₹{quickTotalPayable.toLocaleString("en-IN")} NOW</span>
                        <Heart className="h-4 w-4 fill-white/20 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>100% Secure via Razorpay · Instant Official Downloadable 80G Receipt</span>
                  </div>
                </form>
              </div>

              {/* Right Column: Admin Uploaded Image Banner */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-2xl overflow-hidden bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-amber-50/50 border border-amber-200/70 p-3 sm:p-4">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[300px] w-full rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-amber-200/50">
                  <img
                    src={settings.quickDonateImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80"}
                    alt="Devotional Offering"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <div className="text-white space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Sri Sri Jagannath Seva</span>
                      <p className="text-xs font-semibold text-white/95 leading-tight">Every offering made in pure love brings divine peace & blessings.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>ISKCON Kurnool Digital Temple</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Sanctified Annadana, Deity Worship & Vedic Education
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* ALL TEMPLE SEVAS & OFFERINGS DIRECTORY */}
      {/* ========================================= */}
      <section className="py-12 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent">Temple Sevas</span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-primary">
              All Divine Seva Offerings
            </h3>
            <p className="text-xs text-muted-foreground font-sans">
              Choose from specific dedicated sevas, deity worship, and anna-daan sponsorships below.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sevas..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Cards */}
          {active.length === 0 ? (
            <FallbackCauses />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No sevas match "{query}".</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((s) => {
                const selIdx = selected[s.id] ?? 0;
                const price = s.prices[selIdx] ?? s.prices[0];
                return (
                  <div key={s.id} className="group bg-white rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-square overflow-hidden flex items-center justify-center p-3 bg-amber-50/20">
                      {s.thumbnail ? (
                        <img src={s.thumbnail} alt={s.title} loading="lazy" className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-primary/40"><HandHeart className="h-12 w-12" /></div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-lg text-primary mb-1.5 leading-snug">{s.title}</h3>
                      {s.description && <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">{s.description}</p>}

                      {/* Price options */}
                      <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                        {s.prices.map((p, i) => {
                          const isSel = i === selIdx;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelected((m) => ({ ...m, [s.id]: i }))}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${isSel ? "bg-primary text-primary-foreground border-primary shadow-xs" : "bg-surface text-foreground border-border hover:border-primary/50"
                                }`}
                            >
                              {p.label} · ₹{p.amount.toLocaleString("en-IN")}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/donate/$slug", params: { slug: s.slug || s.id } })}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-hero text-primary-foreground font-bold hover:shadow-gold transition-all cursor-pointer text-sm"
                        >
                          <Heart className="h-4 w-4" /> Sponsor Seva ₹{price?.amount?.toLocaleString("en-IN") || ""}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-12 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full">
            <Sparkles className="h-3.5 w-3.5 text-secondary" /> Secure 256-bit encrypted payments powered by Razorpay · Tax Exempted under 80G
          </p>
        </div>
      </section>

      {/* Official Downloadable Receipt Modal */}
      {receiptSuccess && (
        <OfficialReceiptModal
          data={receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
        />
      )}
    </SiteLayout>
  );
}

function FallbackCauses() {
  const causes = [
    { icon: HandHeart, title: "Deity Seva", desc: "Sponsor daily worship, decoration and offerings to the Lord." },
    { icon: IndianRupee, title: "Annadana", desc: "Sponsor sanctified prasadam meals for devotees and guests." },
    { icon: Heart, title: "Temple Seva", desc: "Help build and maintain the sacred abode of Sri Sri Puri Jagannath." },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {causes.map((c) => (
        <div key={c.title} className="p-7 rounded-2xl bg-surface border border-border text-center">
          <div className="h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center mx-auto mb-4 shadow-glow">
            <c.icon className="h-6 w-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-primary mb-1">{c.title}</h3>
          <p className="text-muted-foreground text-sm">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}
