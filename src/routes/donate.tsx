import { useEffect, useMemo, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, Seva, calculatePlatformFee, getSevaCategories } from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { 
  Heart, 
  Search, 
  HandHeart, 
  IndianRupee, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Lock, 
  ShieldCheck, 
  Zap, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Plus,
  Minus,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Smartphone,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Sri Sri Jagannath Sevas | ISKCON Kurnool" },
      { name: "description", content: "Participate in divine service — offer Sri Sri Jagannath Sevas at ISKCON Kurnool. Every seva performed with love reaches the lotus feet of the Lord." },
    ]
  }),
  component: () => <Outlet />,
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

// Quick amount suggestions
const QUICK_SUGGESTIONS = [108, 251, 501, 1008, 2500, 5001, 11000];

export default function Page({ initialSlug }: { initialSlug?: string }) {
  const { sevas, festivals, settings, theme, ready, addDonation, updateDonationStatus, platformFee, addPaymentRecord, sunday, upiPayment } = useAdmin();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [checkoutSeva, setCheckoutSeva] = useState<Seva | null>(null);

  // Payment method selection: "upi" | "razorpay" | "" (unselected by default)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "razorpay" | "">("");

  // Dynamic UPI Payment Modal state
  const [upiModalData, setUpiModalData] = useState<{
    isOpen: boolean;
    amount: number;
    baseAmount: number;
    platformFee: number;
    sevaTitle: string;
    donorName: string;
    donorEmail?: string;
    donorPhone?: string;
    pan?: string;
    notes?: string;
    enquiryId?: string | null;
    optionLabel?: string;
  } | null>(null);

  // Custom Amount state inside Checkout
  const [isCustomCheckoutAmount, setIsCustomCheckoutAmount] = useState(false);
  const [customCheckoutAmount, setCustomCheckoutAmount] = useState<string>("1008");
  const [quantity, setQuantity] = useState<number>(1);

  // Quick Donate State with All Details
  const [quickAmount, setQuickAmount] = useState<number>(501);
  const [quickCustomInput, setQuickCustomInput] = useState<string>("501");
  const [quickDonorName, setQuickDonorName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPurpose, setQuickPurpose] = useState("");
  const [quickPan, setQuickPan] = useState("");
  const [quickCoverFee, setQuickCoverFee] = useState(true);
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<"upi" | "razorpay" | "">("");
  const [quickIsSubmitting, setQuickIsSubmitting] = useState(false);

  // Success Receipt Modal State
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);
  const [devotionalSuccessData, setDevotionalSuccessData] = useState<{ amount: number; sevaTitle: string; donorName: string } | null>(null);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);

  // Form inputs for standard seva checkout
  const [donorName, setDonorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");

  useEffect(() => {
    setQuantity(1);
    if (initialSlug) {
      let found = sevas.find(s => s.slug === initialSlug || s.id === initialSlug);
      
      // Fallback: look in festival inline sevas
      if (!found && festivals) {
        for (const f of festivals) {
          const matched = (f.sevas || []).find(s => s.slug === initialSlug || s.id === initialSlug);
          if (matched) {
            found = matched;
            break;
          }
        }
      }
      
      // Fallback for Sunday Feast Seva
      if (!found && (initialSlug === "sunday-feast-seva" || initialSlug === "sunday-feast")) {
        const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : 5001;
        const amt = isNaN(rawAmount) || rawAmount <= 0 ? 5001 : rawAmount;
        found = {
          id: "s_sunday_feast_fallback",
          title: sunday.donationCardTitle || "Sunday Feast Annadana Seva",
          slug: "sunday-feast-seva",
          category: "Annadana Sevas",
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
  }, [initialSlug, sevas, festivals, sunday]);

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
        category: "Annadana Sevas",
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

  // Extract all categories
  const categories = useMemo(() => {
    let masterList: string[] = [];
    try {
      const saved = localStorage.getItem("iskcon_seva_custom_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) masterList = parsed;
      }
    } catch {}

    const set = new Set<string>();
    set.add("All Sevas");
    
    if (masterList.length > 0) {
      masterList.forEach((c) => set.add(c));
    } else {
      active.forEach((s) => {
        if (s.category && s.category.trim()) {
          set.add(s.category.trim());
        }
      });
    }
    return Array.from(set);
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.filter((s) => {
      const sevaCats = getSevaCategories(s);
      const matchesCategory = 
        selectedCategory === "All" || 
        selectedCategory === "All Sevas" || 
        sevaCats.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
      
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        sevaCats.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [active, query, selectedCategory]);

  // Group sevas by categories for horizontal scrolling sections
  const categorySections = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter active sevas by search query
    const searchFiltered = active.filter((s) => {
      if (!q) return true;
      const sevaCats = getSevaCategories(s);
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        sevaCats.some((c) => c.toLowerCase().includes(q))
      );
    });

    // Extract all unique categories present
    const rawCategories = categories.filter((c) => c !== "All Sevas" && c !== "All");

    // Desired priority order: Regular Sevas first, then Janmashtami, etc.
    const priorityOrder = ["Regular Sevas", "Janmashtami Sevas", "Janmastami Sevas", "Radhashtami Sevas", "Annadana Sevas", "Deity Worship Sevas"];
    const orderedCategories = [...rawCategories].sort((a, b) => {
      const idxA = priorityOrder.findIndex((p) => p.toLowerCase() === a.toLowerCase());
      const idxB = priorityOrder.findIndex((p) => p.toLowerCase() === b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    // If a specific category tab is selected, only show that category
    const targetCategories = (selectedCategory === "All" || selectedCategory === "All Sevas")
      ? orderedCategories
      : [selectedCategory];

    const result: { category: string; sevas: Seva[] }[] = [];

    targetCategories.forEach((cat) => {
      const sevasInCat = searchFiltered.filter((s) => {
        const sevaCats = getSevaCategories(s);
        return sevaCats.some((c) => c.toLowerCase() === cat.toLowerCase());
      });
      if (sevasInCat.length > 0) {
        result.push({ category: cat, sevas: sevasInCat });
      }
    });

    // Fallback if query didn't match any categorized bucket
    if (result.length === 0 && searchFiltered.length > 0) {
      result.push({ category: selectedCategory === "All" ? "Divine Sevas" : selectedCategory, sevas: searchFiltered });
    }

    return result;
  }, [active, categories, selectedCategory, query]);

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
      paymentMethod?: string;
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
    const curMethod = customDetails?.paymentMethod || selectedPaymentMethod;

    if (!curMethod) {
      alert("Please select a Payment Mode (Online Gateway or Pay with UPI QR) before proceeding.");
      return;
    }

    // Store every submission in the admin panel before opening the gateway or QR modal
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

    const platformCharge = platformFee.enabled && curCoverFee ? calculatePlatformFee(amount, platformFee) : 0;
    const totalPayable = amount + platformCharge;

    // Handle UPI QR Payment method
    if (curMethod === "upi" || upiPayment.enabled && !upiPayment.allowRazorpayGateway) {
      setUpiModalData({
        isOpen: true,
        amount: totalPayable,
        baseAmount: amount,
        platformFee: platformCharge,
        sevaTitle: `${seva.title} (${label})`,
        donorName: curDonorName,
        donorEmail: curEmail,
        donorPhone: curPhone,
        pan: curPan,
        notes: curPurpose,
        enquiryId,
        optionLabel: label
      });
      return;
    }

    // Handle Razorpay Online gateway method
    const ok = await loadRazorpay();
    if (!ok) { 
      alert("Unable to load payment gateway. Please check your internet connection and try again."); 
      return; 
    }

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
          paymentMethod: "Razorpay",
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

  // Handle successful UPI payment completion from UpiPaymentModal
  const handleUpiSuccess = async ({ 
    utr, 
    amount: paidAmt, 
    paymentMethod,
    screenshotUrl,
    notes: userNotes
  }: { 
    utr: string; 
    amount: number; 
    paymentMethod: string;
    screenshotUrl?: string;
    notes?: string;
  }) => {
    if (!upiModalData) return;
    const enquiryId = upiModalData.enquiryId;
    if (enquiryId) {
      try {
        await updateDonationStatus(enquiryId, "initiated", utr);
      } catch (e) {
        console.error("Failed to update donation status:", e);
      }
    }

    const finalNotes = userNotes || upiModalData.notes;

    try {
      await addPaymentRecord({
        paymentId: utr,
        donorName: upiModalData.donorName || "Devotee",
        donorEmail: upiModalData.donorEmail,
        donorPhone: upiModalData.donorPhone,
        amount: paidAmt,
        baseAmount: upiModalData.baseAmount || paidAmt,
        platformFee: upiModalData.platformFee || 0,
        currency: "INR",
        category: `General Seva: ${upiModalData.sevaTitle}`,
        sevaOrPageTitle: upiModalData.sevaTitle,
        status: "Pending",
        paymentMethod: "UPI QR Payment",
        screenshotUrl: screenshotUrl,
        panNumber: upiModalData.pan,
        notes: finalNotes,
        taxReceiptRequested: !!upiModalData.pan,
      });
    } catch (err) {
      console.error("Failed to store UPI payment record:", err);
    }

    setDevotionalSuccessData({
      amount: paidAmt,
      sevaTitle: upiModalData.sevaTitle,
      donorName: upiModalData.donorName || "Devotee",
    });

    setUpiModalData(null);
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
  };

  // Handle Quick Donate Form Submit with all details
  const handleQuickPayNow = async (e: React.FormEvent, methodToUse?: "upi" | "razorpay") => {
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

    const chosenMethod = methodToUse || quickPaymentMethod;
    if (!chosenMethod) {
      alert("Please select a Payment Mode (Online Gateway or Pay with UPI QR) before proceeding.");
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
          coverFee: quickCoverFee,
          paymentMethod: chosenMethod,
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
    const basePrice = standardPrice?.amount || 0;
    const finalAmount = isCustomCheckoutAmount ? customAmtNum : (basePrice * quantity);
    const finalLabel = isCustomCheckoutAmount 
      ? `Custom Offering (₹${finalAmount.toLocaleString("en-IN")})` 
      : (quantity > 1 ? `${standardPrice?.label} × ${quantity}` : (standardPrice?.label || "Seva Offering"));

    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!donorName.trim()) { alert("Please enter Donor Name."); return; }
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
              <div className="lg:col-span-5 space-y-6 font-sans">
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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[11px] font-bold uppercase tracking-wider font-sans">
                      <span>Step 1 of 2: Choose Offering</span>
                    </div>
                    <h3 className="font-display font-extrabold text-2xl text-primary leading-tight">{checkoutSeva.title}</h3>
                    {checkoutSeva.description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{checkoutSeva.description}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 font-sans">
                    {/* If multiple price options exist */}
                    {checkoutSeva.prices.length > 1 ? (
                      <>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                          Select Seva Option
                        </label>
                        <div className="grid grid-cols-2 gap-2.5 font-sans">
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
                                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer font-sans ${isSel
                                  ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/20 scale-[1.02]"
                                  : "border-slate-200 bg-slate-50 hover:bg-amber-50/70 hover:border-amber-300 text-slate-800"
                                  }`}
                              >
                                <span className={`text-xs font-bold leading-tight line-clamp-2 ${isSel ? "text-white/90" : "text-slate-700"}`}>
                                  {p.label || "Offering"}
                                </span>
                                <span className={`text-base font-black mt-1 font-sans tracking-tight ${isSel ? "text-amber-300" : "text-primary"}`}>
                                  ₹{p.amount.toLocaleString("en-IN")}
                                </span>
                              </button>
                            );
                          })}

                          {/* Custom Amount Button */}
                          <button
                            type="button"
                            onClick={() => setIsCustomCheckoutAmount(true)}
                            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer font-sans ${isCustomCheckoutAmount
                              ? "border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300 scale-[1.02]"
                              : "border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-100/60 hover:border-amber-500 text-amber-900"
                              } ${checkoutSeva.prices.length % 2 === 0 ? "col-span-2" : "col-span-1"}`}
                          >
                            <span className={`text-xs font-bold flex items-center gap-1 ${isCustomCheckoutAmount ? "text-white" : "text-amber-800"}`}>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Custom Amount</span>
                            </span>
                            <span className={`text-xs font-extrabold mt-1 font-sans ${isCustomCheckoutAmount ? "text-amber-100" : "text-amber-700"}`}>
                              Enter Your Wish (₹)
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Clean Single Amount Card (NO "Per Day", NO complex options) */
                      <div className="p-4.5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-50/40 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4 font-sans">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Fixed Offering Amount</span>
                          <span className="text-2xl sm:text-3xl font-black text-primary font-display mt-0.5 block">
                            ₹{basePrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCustomCheckoutAmount(!isCustomCheckoutAmount)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          {isCustomCheckoutAmount ? "Use Fixed Amount" : "Custom Amount"}
                        </button>
                      </div>
                    )}

                    {/* Quantity / Count Selector with - and + buttons */}
                    {!isCustomCheckoutAmount && (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between font-sans">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Quantity / Count</span>
                          <span className="text-[11px] text-slate-500 font-sans">
                            {quantity > 1 ? `${quantity} × ₹${basePrice.toLocaleString("en-IN")} = ₹${finalAmount.toLocaleString("en-IN")}` : `₹${basePrice.toLocaleString("en-IN")} per unit`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center font-bold text-slate-700 cursor-pointer transition font-sans"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="min-w-[24px] text-center font-extrabold text-sm text-slate-900 font-sans">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            aria-label="Increase quantity"
                            className="h-7 w-7 rounded-lg bg-primary hover:bg-[#4a2282] text-white flex items-center justify-center font-bold cursor-pointer transition shadow-2xs font-sans"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Custom Amount Input Field */}
                    {isCustomCheckoutAmount && (
                      <div className="p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/60 rounded-2xl border border-amber-200/80 space-y-3 font-sans">
                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider font-sans">
                          Enter Offering Amount of Your Wish (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-amber-700 font-sans">₹</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1008, 2500, 5000..."
                            value={customCheckoutAmount}
                            onChange={(e) => setCustomCheckoutAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 shadow-inner font-sans"
                          />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-amber-800 mr-1 font-sans">Add:</span>
                          {[100, 500, 1000, 2500, 5000].map((addVal) => (
                            <button
                              key={addVal}
                              type="button"
                              onClick={() => {
                                const current = Number(customCheckoutAmount) || 0;
                                setCustomCheckoutAmount(String(current + addVal));
                              }}
                              className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-amber-100/80 text-amber-800 border border-amber-200 rounded-lg shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer font-sans"
                            >
                              <Plus className="h-2.5 w-2.5" /> ₹{addVal.toLocaleString("en-IN")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Box in Inter Font */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 space-y-2.5 border border-slate-100 font-sans">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                      <span>Selected Seva:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{checkoutSeva.title}</span>
                    </div>
                    {checkoutSeva.prices.length > 1 && (
                      <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                        <span>Option:</span>
                        <span className="font-semibold text-slate-800 text-right">{finalLabel}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200/60 my-2" />
                    <div className="flex justify-between items-center text-sm font-bold text-primary font-sans">
                      <span>Base Donation:</span>
                      <span className="text-base text-accent font-extrabold font-sans">₹{finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Seva Details & Amount Highlight + Donor Form */}
              <div className="lg:col-span-7" id="donor-form">
                <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-1 font-sans">
                        <span>Step 2 of 2</span>
                      </div>
                      <h4 className="font-display font-extrabold text-xl text-primary">Devotee &amp; Receipt Details</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-sans">Please provide your details below to process the official offering receipt.</p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0 font-sans">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>80G Tax Exemption</span>
                    </div>
                  </div>

                  {/* Selected Seva Details & Total Amount Highlight */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-50/70 rounded-2xl p-4 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-2xs">
                    <div className="flex items-center gap-3">
                      {checkoutSeva.thumbnail && (
                        <img
                          src={checkoutSeva.thumbnail}
                          alt={checkoutSeva.title}
                          className="h-12 w-12 rounded-xl object-contain bg-white border border-amber-200/80 p-0.5 shrink-0 shadow-2xs"
                        />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Offering Seva</span>
                        <h5 className="text-sm font-extrabold text-slate-900 leading-tight line-clamp-1">{checkoutSeva.title}</h5>
                        <span className="text-xs font-semibold text-primary block">{finalLabel}</span>
                      </div>
                    </div>

                    <div className="sm:text-right border-t sm:border-t-0 border-amber-200/60 pt-2 sm:pt-0 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Offering Amount</span>
                      <span className="text-xl sm:text-2xl font-black text-primary font-sans">
                        ₹{finalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Devotee Name *</label>
                      <input
                        id="donor-name-input"
                        type="text"
                        required
                        placeholder="Enter full name of the devotee"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Purpose of Donation / Sankalpa (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. For good health, family welfare, birthdays..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans bg-white"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {["Birthday", "Wedding Anniversary", "Family Welfare", "Good Health", "In Memory of"].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setPurpose(sug)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-slate-900 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Email Address (Optional)</label>
                        <input
                          type="email"
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

                  {/* Payment Method Selector */}
                  {upiPayment.enabled !== false && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 font-sans">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Payment Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("razorpay")}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            selectedPaymentMethod === "razorpay"
                              ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary text-white shadow-xs">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-tight">Online Gateway</p>
                              <p className="text-[10px] font-semibold text-slate-500">Cards / NetBanking / Razorpay</p>
                            </div>
                          </div>
                          {selectedPaymentMethod === "razorpay" && (
                            <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("upi")}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            selectedPaymentMethod === "upi"
                              ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-600 text-white shadow-xs">
                              <QrCode className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-tight">Pay with UPI QR</p>
                              <p className="text-[10px] font-semibold text-slate-500 font-sans">Amount pre-filled in UPI apps</p>
                            </div>
                          </div>
                          {selectedPaymentMethod === "upi" && (
                            <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 space-y-3 font-sans">
                    {upiPayment.enabled !== false && selectedPaymentMethod === "upi" ? (
                      <button
                        type="submit"
                        disabled={finalAmount <= 0}
                        className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 text-base tracking-wide uppercase shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:scale-[1.01] active:scale-98"
                      >
                        <QrCode className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="relative z-10">
                          PAY ₹{totalPayable.toLocaleString("en-IN")} VIA UPI QR
                        </span>
                        <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={finalAmount <= 0}
                        className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 text-base tracking-wide uppercase shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-98"
                      >
                        <Lock className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                        <span className="relative z-10">
                          {upiPayment.enabled !== false 
                            ? `DONATE ₹${totalPayable.toLocaleString("en-IN")} ONLINE`
                            : `DONATE ₹${totalPayable.toLocaleString("en-IN")} NOW`}
                        </span>
                        <Heart className="h-4.5 w-4.5 fill-white/20 stroke-[2.5] text-white transition-transform duration-300 group-hover:scale-125 group-hover:fill-white" />
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                      <span>
                        {upiPayment.enabled !== false && selectedPaymentMethod === "upi"
                          ? "Direct Bank Transfer via Official Temple UPI · 80G Tax Exempted"
                          : "100% Secure Payments powered by Razorpay"}
                      </span>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic UPI Payment Modal for Single Seva */}
        {upiModalData && (
          <UpiPaymentModal
            isOpen={upiModalData.isOpen}
            onClose={() => setUpiModalData(null)}
            amount={upiModalData.amount}
            sevaTitle={upiModalData.sevaTitle}
            donorName={upiModalData.donorName}
            donorEmail={upiModalData.donorEmail}
            donorPhone={upiModalData.donorPhone}
            pan={upiModalData.pan}
            notes={upiModalData.notes}
            onPaymentSuccess={handleUpiSuccess}
          />
        )}

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
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
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
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {["Birthday", "Wedding Anniversary", "Family Welfare", "Good Health", "In Memory of"].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setQuickPurpose(sug)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-slate-800 rounded text-[9px] font-bold transition cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
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

                  {/* Row 4: Platform Fee Checkbox & Total & Dual Pay Actions */}
                  <div className="space-y-3 pt-2">
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

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      <div className="shrink-0">
                        <span className="text-[11px] text-slate-500 font-sans block leading-none">Total Offering:</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                          ₹{quickTotalPayable.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 flex-1 sm:justify-end">
                        {/* Primary Button: Cards / NetBanking / Razorpay */}
                        {upiPayment.allowRazorpayGateway !== false && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickPayNow(e, "razorpay")}
                            disabled={quickIsSubmitting || currentQuickAmountNum <= 0}
                            className={`flex-1 ${upiPayment.enabled !== false ? "sm:flex-initial" : ""} px-5 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-orange-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-98`}
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>{upiPayment.enabled !== false ? "Cards / NetBanking" : "Donate Now"}</span>
                            <Sparkles className="h-3.5 w-3.5 fill-white/20 text-white" />
                          </button>
                        )}

                        {/* Secondary Button: UPI QR (Amount Auto-Filled) */}
                        {upiPayment.enabled !== false && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickPayNow(e, "upi")}
                            disabled={quickIsSubmitting || currentQuickAmountNum <= 0}
                            className="flex-1 sm:flex-initial px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs tracking-wide"
                          >
                            <QrCode className="h-4 w-4 text-slate-500" />
                            <span>Pay with UPI QR</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1 border-t border-slate-100">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Direct Temple UPI · 100% Tax Exempted under 80G · Downloadable Official Receipt</span>
                    </div>
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
      <section className="py-14 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent">Temple Sevas</span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary">
              All Divine Seva Offerings
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans">
              Choose from specific dedicated sevas, deity worship, and anna-daan sponsorships below.
            </p>
          </div>

          {/* Category Tabs Filter Bar */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-8 max-w-full scrollbar-none font-sans px-2">
            {categories.map((cat) => {
              const isAct = 
                selectedCategory.toLowerCase() === cat.toLowerCase() || 
                (selectedCategory === "All" && cat === "All Sevas");
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat === "All Sevas" ? "All" : cat)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${isAct
                    ? "bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/30 scale-[1.02]"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 shadow-2xs"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sevas by name or category..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-sm font-sans"
              />
            </div>
          </div>

          {/* Category-Wise Scrolling Rows */}
          {active.length === 0 ? (
            <FallbackCauses />
          ) : categorySections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-sans bg-white/50 rounded-3xl border border-dashed border-amber-200">
              No sevas found for "{selectedCategory !== "All" ? selectedCategory : query}".
            </div>
          ) : (
            <div className="space-y-12">
              {categorySections.map((sec) => (
                <CategorySevaRow
                  key={sec.category}
                  category={sec.category}
                  sevas={sec.sevas}
                  onSelectAndNavigate={(seva) => {
                    navigate({ 
                      to: "/donate/$slug", 
                      params: { slug: seva.slug || seva.id }
                    });
                  }}
                />
              ))}
            </div>
          )}

          <p className="mt-14 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full font-sans">
            <Sparkles className="h-3.5 w-3.5 text-secondary" /> Secure 256-bit encrypted payments powered by Razorpay · Tax Exempted under 80G
          </p>
        </div>
      </section>

      {/* Dynamic UPI Payment Modal */}
      {upiModalData && (
        <UpiPaymentModal
          isOpen={upiModalData.isOpen}
          onClose={() => setUpiModalData(null)}
          amount={upiModalData.amount}
          sevaTitle={upiModalData.sevaTitle}
          donorName={upiModalData.donorName}
          donorEmail={upiModalData.donorEmail}
          donorPhone={upiModalData.donorPhone}
          pan={upiModalData.pan}
          notes={upiModalData.notes}
          onPaymentSuccess={handleUpiSuccess}
        />
      )}

      {/* Official Downloadable Receipt Modal */}
      {receiptSuccess && (
        <OfficialReceiptModal
          data={receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
        />
      )}

      {/* Devotional Success Confirmation Modal */}
      {devotionalSuccessData && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border text-center space-y-6 relative overflow-hidden">
            {/* Saffron Gradient Accent Header Bar */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
            
            <div className="text-4xl animate-bounce pt-2">🙏</div>
            
            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-primary">
                Hare Krishna!
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Donation Recorded Successfully
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-800 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Devotee Name:</span>
                <span className="font-extrabold text-slate-900">{devotionalSuccessData.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seva / Purpose:</span>
                <span className="font-bold text-primary">{devotionalSuccessData.sevaTitle}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/50 pt-2 font-bold">
                <span className="text-slate-500">Amount Offered:</span>
                <span className="text-base text-accent font-black font-display">₹{devotionalSuccessData.amount.toLocaleString("en-IN")}.00</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Thank you for your generous offering! Your transaction details have been recorded. Our temple admin team will verify it soon. May Lord Sri Jagannath shower eternal blessings upon you and your family.
            </p>

            <button
              onClick={() => setDevotionalSuccessData(null)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-2xl font-black text-sm shadow-md transition cursor-pointer active:scale-98"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function CategorySevaRow({
  category,
  sevas,
  onSelectAndNavigate
}: {
  category: string;
  sevas: Seva[];
  onSelectAndNavigate: (seva: Seva) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sevas]);

  // One-card-after-another auto scroll
  useEffect(() => {
    if (sevas.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const cardStep = 420 + 24; // card width + gap

      // If reached end, smooth scroll back to 0
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: cardStep, behavior: "smooth" });
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [sevas.length, isHovered]);

  const handleScroll = (dir: -1 | 1) => {
    if (!scrollRef.current) return;
    const cardStep = 420 + 24;
    scrollRef.current.scrollBy({ left: dir * cardStep, behavior: "smooth" });
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="space-y-4 font-sans bg-white/80 backdrop-blur-xs p-6 sm:p-8 lg:p-9 rounded-3xl border border-amber-200/90 shadow-sm transition-all"
    >
      {/* Category Row Header with Title & Scroll Buttons */}
      <div className="flex items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xs shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-primary flex items-center gap-2.5 flex-wrap">
              <span>{category}</span>
              <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {sevas.length} {sevas.length === 1 ? "Offering" : "Offerings"}
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
              Explore and sponsor sacred sevas in this offering category
            </p>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll(-1)}
            disabled={!canScrollLeft}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll(1)}
            disabled={!canScrollRight}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-6 overflow-x-auto pb-5 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-amber-300/80 scrollbar-track-amber-50/30 -mx-1 px-1"
      >
        {sevas.map((s) => (
          <div key={s.id} className="w-[320px] sm:w-[370px] md:w-[410px] lg:w-[430px] shrink-0 snap-start flex flex-col">
            <SevaCardItem seva={s} onSelectAndNavigate={onSelectAndNavigate} />
          </div>
        ))}
      </div>
    </div>
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
        <div key={c.title} className="p-7 rounded-2xl bg-surface border border-border text-center font-sans">
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

function SevaCardItem({ 
  seva, 
  onSelectAndNavigate 
}: { 
  seva: Seva; 
  onSelectAndNavigate: (seva: Seva) => void; 
}) {
  const firstPrice = seva.prices?.[0]?.amount;

  return (
    <div className="group relative p-[2px] rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:via-orange-500 hover:to-rose-500 shadow-md hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-1 font-sans flex flex-col h-full">
      <div className="bg-white rounded-[22px] overflow-hidden flex flex-col flex-1 justify-between">
        
        {/* Top Image Banner: Full, clear, uncropped image container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-white p-3 flex items-center justify-center border-b border-amber-100/60">
          <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center bg-white shadow-2xs">
            {seva.thumbnail ? (
              <img 
                src={seva.thumbnail} 
                alt={seva.title} 
                loading="lazy" 
                className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-primary/30 bg-primary/5 rounded-2xl">
                <HandHeart className="h-14 w-14" />
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 font-sans">
          
          {/* Category Badges + Title and Short Description */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {getSevaCategories(seva).map((cat) => (
                <span key={cat} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 uppercase tracking-wider font-sans">
                  {cat}
                </span>
              ))}
            </div>

            <h3 className="font-display font-extrabold text-lg sm:text-xl text-primary line-clamp-1 leading-snug group-hover:text-amber-600 transition-colors">
              {seva.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[34px] font-sans">
              {seva.description || "Support ISKCON Kurnool temple activities and daily deity worship with your generous contribution."}
            </p>
          </div>

          {/* Sponsor CTA Action */}
          <div className="pt-2 border-t border-slate-100 font-sans">
            <button
              type="button"
              onClick={() => onSelectAndNavigate(seva)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/35 transition-all duration-300 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2 group/btn font-sans"
            >
              <Heart className="h-4 w-4 fill-white/20 text-white group-hover/btn:scale-125 transition-transform" />
              <span>
                Sponsor Seva {firstPrice ? (seva.prices && seva.prices.length > 1 ? `· from ₹${firstPrice.toLocaleString("en-IN")}` : `· ₹${firstPrice.toLocaleString("en-IN")}`) : ""}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
