import { useState } from "react";
import { 
  useAdmin, 
  uploadToCloudinary, 
  PaymentPage, 
  PaymentPageField, 
  PaymentPagePriceField, 
  PaymentRecord,
  slugify 
} from "@/context/AdminContext";
import OfficialReceiptModal from "@/components/OfficialReceiptModal";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Eye, 
  Globe, 
  Lock, 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  CreditCard, 
  Target, 
  IndianRupee, 
  ExternalLink,
  ShieldCheck,
  ImageIcon,
  User,
  Mail,
  Phone,
  ArrowRight,
  Palette,
  Grid,
  Layers,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileText,
  Heart,
  Tag,
  Building2,
  X
} from "lucide-react";

const PRESET_BANNER_IMAGES = [
  {
    label: "Sri Sri Jagannath Deity Altar",
    url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Devotional Diya Lamps & Offerings",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Surabhi Goshala Seva",
    url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Temple Architecture & Evening Arati",
    url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function PaymentPagesManager() {
  const { paymentPages, setPaymentPages, paymentRecords, setPaymentRecords, addPaymentRecord, deletePaymentRecord, markAllPaymentRecordsRead, settings, platformFee, setPlatformFee } = useAdmin();
  
  // Navigation Sub-tab: "records" or "pages"
  const [subTab, setSubTab] = useState<"records" | "pages">("records");

  // Records Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWithCharges, setShowWithCharges] = useState(true);

  // Manual Payment Entry Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState<{
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    amount: string;
    category: string;
    sevaOrPageTitle: string;
    paymentMethod: string;
    status: "Completed" | "Pending";
    notes: string;
    panNumber: string;
    address: string;
  }>({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    category: "General Donation",
    sevaOrPageTitle: "Nitya Annadanam / Temple Seva",
    paymentMethod: "Cash",
    status: "Completed",
    notes: "",
    panNumber: "",
    address: "",
  });

  // Receipt Modal State
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<PaymentRecord | null>(null);

  // Instant Payment Pages Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form draft for create/edit payment page
  const [draft, setDraft] = useState<PaymentPage>({
    id: "",
    slug: "",
    title: "",
    description: "",
    bannerImage: "",
    logoUrl: "",
    bgStyle: "gradient",
    isPrivate: true,
    active: true,
    enableGoalTracker: false,
    goalAmount: 100000,
    raisedAmount: 0,
    pricingType: "fixed",
    fixedAmount: 5555,
    presetPrices: [
      { id: "pr1", label: "General Offering", amount: 1008 },
      { id: "pr2", label: "Special Puja Seva", amount: 5555 },
      { id: "pr3", label: "Patron Donor", amount: 11000 },
    ],
    contactEmail: "info@iskconkurnool.org",
    contactPhone: "+91 98765 43210",
    termsAndConditions: "You agree to share information entered on this page with ISKCON Kurnool and Razorpay.",
    fields: [
      { id: "f1", label: "Full Name", type: "text", required: true },
      { id: "f2", label: "Email Address", type: "email", required: true },
      { id: "f3", label: "Phone Number", type: "phone", required: true },
    ],
  });

  // Helper to calculate Real Net Bank Deposit after Razorpay 2% deduction
  const getRecordBreakdown = (r: PaymentRecord) => {
    const feeRate = platformFee.type === "percentage" ? (platformFee.value || 2) : 2;
    const grossAmount = r.amount || 0;
    let fee = 0;
    let realNet = grossAmount;

    if (typeof r.platformFee === "number" && r.platformFee > 0) {
      fee = r.platformFee;
      realNet = r.baseAmount || Math.max(0, grossAmount - fee);
    } else {
      // Standard Razorpay charge deduction (e.g. 2%)
      fee = Math.round((grossAmount * feeRate) / 100);
      realNet = Math.max(0, grossAmount - fee);
    }

    return { grossAmount, fee, realNet };
  };

  // --- RECORD COMPUTED STATS ---
  const completedRecords = paymentRecords.filter((r) => r.status === "Completed");
  const totalGrossRaisedINR = completedRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalRazorpayFeeDeductedINR = completedRecords.reduce((sum, r) => sum + getRecordBreakdown(r).fee, 0);
  const totalRealNetBankDepositINR = completedRecords.reduce((sum, r) => sum + getRecordBreakdown(r).realNet, 0);

  // Filtering records
  const filteredRecords = paymentRecords.filter((rec) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      rec.donorName?.toLowerCase().includes(q) ||
      rec.donorEmail?.toLowerCase().includes(q) ||
      rec.donorPhone?.toLowerCase().includes(q) ||
      rec.paymentId?.toLowerCase().includes(q) ||
      rec.sevaOrPageTitle?.toLowerCase().includes(q) ||
      rec.category?.toLowerCase().includes(q);

    const matchCat = categoryFilter === "all" || rec.category === categoryFilter;
    const matchStatus = statusFilter === "all" || rec.status === statusFilter;

    return matchSearch && matchCat && matchStatus;
  });

  // Categories list for filter dropdown
  const categoriesList = Array.from(new Set(paymentRecords.map((r) => r.category).filter(Boolean)));

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!paymentRecords || paymentRecords.length === 0) {
      alert("No payment records available to export.");
      return;
    }

    const headers = [
      "Record ID",
      "Payment Txn ID",
      "Date & Time",
      "Donor Name",
      "Email",
      "Phone",
      "Gross Paid (INR)",
      "Razorpay Gateway Fee (INR)",
      "Real Net Bank Deposit (INR)",
      "Category",
      "Seva / Page Title",
      "Status",
      "Payment Method",
      "PAN Number",
      "Notes / Gotram"
    ];

    const rows = paymentRecords.map((r) => {
      const bd = getRecordBreakdown(r);
      return [
        r.id,
        r.paymentId,
        new Date(r.date).toLocaleString("en-IN"),
        r.donorName,
        r.donorEmail || "",
        r.donorPhone || "",
        bd.grossAmount,
        bd.fee,
        bd.realNet,
        r.category,
        r.sevaOrPageTitle || "",
        r.status,
        r.paymentMethod || "Razorpay",
        r.panNumber || "",
        (r.notes || "").replace(/"/g, '""')
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ISKCON_Kurnool_Payment_Records_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Payment Submit
  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.donorName.trim()) {
      alert("Please enter Donor Name.");
      return;
    }
    if (!manualForm.amount || Number(manualForm.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setBusy(true);
    await addPaymentRecord({
      paymentId: `OFFLINE_${Date.now().toString().slice(-6)}`,
      donorName: manualForm.donorName.trim(),
      donorEmail: manualForm.donorEmail.trim(),
      donorPhone: manualForm.donorPhone.trim(),
      amount: Number(manualForm.amount),
      currency: "INR",
      category: manualForm.category.trim() || "Manual Entry",
      sevaOrPageTitle: manualForm.sevaOrPageTitle.trim() || "Temple Donation",
      status: manualForm.status,
      paymentMethod: manualForm.paymentMethod,
      notes: manualForm.notes.trim(),
      panNumber: manualForm.panNumber.trim(),
      address: manualForm.address.trim(),
      taxReceiptRequested: !!manualForm.panNumber.trim(),
    });
    setBusy(false);
    setShowManualModal(false);
    setManualForm({
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      amount: "",
      category: "General Donation",
      sevaOrPageTitle: "Nitya Annadanam / Temple Seva",
      paymentMethod: "Cash",
      status: "Completed",
      notes: "",
      panNumber: "",
      address: "",
    });
  };

  // --- PAYMENT PAGE MANAGEMENT HANDLERS ---
  const getFullShareUrl = (slug: string) => {
    if (typeof window === "undefined") return `/pay/${slug}`;
    return `${window.location.origin}/pay/${slug}`;
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = getFullShareUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const startCreateNew = () => {
    const newId = Date.now().toString();
    setDraft({
      id: newId,
      slug: `donation-${newId.slice(-4)}`,
      title: "New Instant Payment Page",
      description: "Support ISKCON Kurnool's devotional activities and temple programs with your generous contribution.",
      bannerImage: PRESET_BANNER_IMAGES[0].url,
      logoUrl: "",
      bgStyle: "gradient",
      isPrivate: true,
      active: true,
      enableGoalTracker: false,
      goalAmount: 100000,
      raisedAmount: 0,
      pricingType: "fixed",
      fixedAmount: 5555,
      presetPrices: [
        { id: "pr1", label: "Basic Seva", amount: 1008 },
        { id: "pr2", label: "Special Seva", amount: 5555 },
      ],
      contactEmail: "info@iskconkurnool.org",
      contactPhone: "+91 98765 43210",
      termsAndConditions: "You agree to share information entered on this page with ISKCON Kurnool and Razorpay.",
      fields: [
        { id: "f1", label: "Full Name", type: "text", required: true },
        { id: "f2", label: "Email Address", type: "email", required: true },
        { id: "f3", label: "Phone Number", type: "phone", required: true },
      ],
    });
    setEditingId(newId);
    setIsEditing(true);
  };

  const startEdit = (page: PaymentPage) => {
    setDraft({ bgStyle: "gradient", ...page });
    setEditingId(page.id);
    setIsEditing(true);
  };

  const handleDeletePage = (id: string) => {
    if (confirm("Are you sure you want to delete this payment page?")) {
      setPaymentPages(paymentPages.filter((p) => p.id !== id));
    }
  };

  const togglePageActive = (id: string) => {
    setPaymentPages(
      paymentPages.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleSavePage = async () => {
    if (!draft.title.trim()) {
      alert("Please enter a page title.");
      return;
    }

    const cleanSlug = slugify(draft.slug || draft.title);
    const pageToSave: PaymentPage = { ...draft, slug: cleanSlug };

    const exists = paymentPages.some((p) => p.id === draft.id);
    if (exists) {
      setPaymentPages(paymentPages.map((p) => (p.id === draft.id ? pageToSave : p)));
    } else {
      setPaymentPages([...paymentPages, pageToSave]);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddField = () => {
    const newF: PaymentPageField = {
      id: `f_${Date.now()}`,
      label: "Custom Question / Field",
      type: "text",
      required: false,
    };
    setDraft({ ...draft, fields: [...draft.fields, newF] });
  };

  const handleRemoveField = (fieldId: string) => {
    setDraft({ ...draft, fields: draft.fields.filter((f) => f.id !== fieldId) });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<PaymentPageField>) => {
    setDraft({
      ...draft,
      fields: draft.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    });
  };

  const handleAddPresetPrice = () => {
    const newP: PaymentPagePriceField = {
      id: `pr_${Date.now()}`,
      label: "Special Seva",
      amount: 2500,
    };
    setDraft({ ...draft, presetPrices: [...(draft.presetPrices || []), newP] });
  };

  const handleRemovePresetPrice = (prId: string) => {
    setDraft({
      ...draft,
      presetPrices: (draft.presetPrices || []).filter((p) => p.id !== prId),
    });
  };

  const handleUpdatePresetPrice = (prId: string, updates: Partial<PaymentPagePriceField>) => {
    setDraft({
      ...draft,
      presetPrices: (draft.presetPrices || []).map((p) => (p.id === prId ? { ...p, ...updates } : p)),
    });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((prev) => ({ ...prev, bannerImage: url }));
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4 font-sans">
      {/* SECTION HEADER & DUAL SUB-TAB CONTROLS */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-amber-200 backdrop-blur-md">
              <Heart className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>Temple Financial &amp; Seva Management</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Donations &amp; Payment Records</h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Track all website donations, print official receipts, record offline payments, and build custom instant checkout links.
            </p>
          </div>

          {/* Sub-tab Pill Toggle */}
          <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md self-start md:self-auto">
            <button
              onClick={() => setSubTab("records")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === "records"
                  ? "bg-white text-primary shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Payment Records</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subTab === "records" ? "bg-primary/15 text-primary" : "bg-white/20 text-white"}`}>
                {paymentRecords.length}
              </span>
            </button>
            <button
              onClick={() => setSubTab("pages")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === "pages"
                  ? "bg-white text-primary shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Instant Payment Pages</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subTab === "pages" ? "bg-primary/15 text-primary" : "bg-white/20 text-white"}`}>
                {paymentPages.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PAYMENT RECORDS & DIGITAL RECEIPTS */}
      {/* ========================================================================= */}
      {subTab === "records" && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Real Net Received in Bank Account */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-200 font-bold uppercase tracking-wide">Real Net Received in Bank</p>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <IndianRupee className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold font-sans text-emerald-100">
                ₹{totalRealNetBankDepositINR.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-emerald-300 font-medium">
                Actual money deposited into temple bank account (After Razorpay {platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`} fee)
              </p>
            </div>

            {/* Card 2: Total Gross Paid by Donors */}
            <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Gross Paid by Donors</p>
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold font-sans text-slate-900">
                ₹{totalGrossRaisedINR.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Total online payment volume collected from devotees
              </p>
            </div>

            {/* Card 3: Razorpay Gateway Fees Deducted */}
            <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Razorpay Fees Deducted</p>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold font-sans text-amber-700">
                -₹{totalRazorpayFeeDeductedINR.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Estimated {platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`} gateway transaction charges
              </p>
            </div>

            {/* Card 4: Total Verified Transactions */}
            <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Completed Transactions</p>
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold font-sans text-slate-900">
                {completedRecords.length}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Out of {paymentRecords.length} total payment attempts
              </p>
            </div>
          </div>

          {/* PLATFORM & PAYMENT GATEWAY CHARGES CONFIGURATION CARD */}
          <div id="gateway-charges-settings" className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Change &amp; Configure Payment Gateway Charges</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enable/disable gateway charges and set custom percentage rate or fixed fee added at checkout.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${platformFee.enabled ? "text-emerald-700" : "text-slate-500"}`}>
                  {platformFee.enabled ? "Enabled Site-Wide" : "Disabled"}
                </span>
                <button
                  type="button"
                  onClick={() => setPlatformFee({ ...platformFee, enabled: !platformFee.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    platformFee.enabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      platformFee.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {platformFee.enabled && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Quick Change Presets */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5">Quick Charge Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPlatformFee({ ...platformFee, type: "percentage", value: 2.36 })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        platformFee.type === "percentage" && platformFee.value === 2.36
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      2.36% (Standard Razorpay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformFee({ ...platformFee, type: "percentage", value: 3.0 })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        platformFee.type === "percentage" && platformFee.value === 3.0
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      3.00%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformFee({ ...platformFee, type: "fixed", value: 10 })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        platformFee.type === "fixed" && platformFee.value === 10
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹10 Flat Fee
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformFee({ ...platformFee, type: "fixed", value: 20 })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        platformFee.type === "fixed" && platformFee.value === 20
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹20 Flat Fee
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformFee({ ...platformFee, type: "fixed", value: 50 })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        platformFee.type === "fixed" && platformFee.value === 50
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹50 Flat Fee
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Charge Type</label>
                    <div className="flex rounded-xl border p-1 bg-slate-50 gap-1">
                      <button
                        type="button"
                        onClick={() => setPlatformFee({ ...platformFee, type: "percentage" })}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          platformFee.type === "percentage"
                            ? "bg-white text-primary shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlatformFee({ ...platformFee, type: "fixed" })}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          platformFee.type === "fixed"
                            ? "bg-white text-primary shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Fixed Amount (₹)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Change Charge Amount ({platformFee.type === "percentage" ? "%" : "₹"})
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPlatformFee({
                            ...platformFee,
                            value: Math.max(0, parseFloat((platformFee.value - (platformFee.type === "percentage" ? 0.1 : 1)).toFixed(2))),
                          })
                        }
                        className="h-9 w-9 rounded-xl border bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 shrink-0 cursor-pointer"
                      >
                        -
                      </button>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step={platformFee.type === "percentage" ? "0.01" : "1"}
                          min="0"
                          value={platformFee.value}
                          onChange={(e) =>
                            setPlatformFee({ ...platformFee, value: Math.max(0, parseFloat(e.target.value) || 0) })
                          }
                          className="w-full px-3 py-2 border rounded-xl font-sans font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-center"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {platformFee.type === "percentage" ? "%" : "₹"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPlatformFee({
                            ...platformFee,
                            value: parseFloat((platformFee.value + (platformFee.type === "percentage" ? 0.1 : 1)).toFixed(2)),
                          })
                        }
                        className="h-9 w-9 rounded-xl border bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 shrink-0 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Donor Checkbox Label</label>
                    <input
                      type="text"
                      value={platformFee.label}
                      onChange={(e) => setPlatformFee({ ...platformFee, label: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="I would like to cover the payment gateway charges"
                    />
                  </div>
                </div>

                {/* Live Calculation Preview Banner */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      Live Preview on ₹1,000 Donation:
                    </span>
                  </div>
                  <div className="font-sans text-xs">
                    Base: <strong>₹1,000</strong> + Charge: <strong className="text-emerald-700">₹{platformFee.type === "percentage" ? Math.round((1000 * platformFee.value) / 100) : platformFee.value}</strong> ({platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`}) = Total Payable: <strong className="text-emerald-800">₹{(1000 + (platformFee.type === "percentage" ? Math.round((1000 * platformFee.value) / 100) : platformFee.value)).toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH, FILTER & ACTION TOOLBAR */}
          <div className="bg-white rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search donor name, phone, email, Txn ID, or seva..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category & Status Filter Selects */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border px-3 py-2 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs text-foreground cursor-pointer font-medium"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border px-3 py-2 rounded-xl text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs text-foreground cursor-pointer font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {paymentRecords.some((r) => !r.read) && (
                <button
                  onClick={markAllPaymentRecordsRead}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 text-xs flex items-center gap-1.5 transition cursor-pointer animate-pulse"
                  title="Mark all donations as read"
                >
                  <CheckCircle2 className="h-4 w-4 text-red-600" />
                  <span>Mark All Read ({paymentRecords.filter((r) => !r.read).length})</span>
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download CSV Spreadsheet"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Record Offline Payment</span>
              </button>
            </div>
          </div>

          {/* RECORDS LIST TABLE (DESKTOP) & CARDS (MOBILE) */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">No Payment Records Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                    ? "No records match your search query or selected filters."
                    : "When users make payments on the website or you enter offline receipts, they will appear here automatically."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-muted-foreground font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Date &amp; Time</th>
                        <th className="py-3.5 px-4">Payment Txn ID</th>
                        <th className="py-3.5 px-4">Donor / Devotee Details</th>
                        <th className="py-3.5 px-4">Seva / Category</th>
                        <th className="py-3.5 px-4 text-right">Gross Paid (₹)</th>
                        <th className="py-3.5 px-4 text-right text-amber-700">Razorpay Fee (₹)</th>
                        <th className="py-3.5 px-4 text-right text-emerald-700">Real Net Bank (₹)</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredRecords.map((rec) => {
                        const bd = getRecordBreakdown(rec);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              <p className="font-medium text-slate-900">{new Date(rec.date).toLocaleDateString("en-IN")}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(rec.date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-primary whitespace-nowrap">
                              {rec.paymentId}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{rec.donorName}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                {rec.donorPhone && <span>📞 {rec.donorPhone}</span>}
                                {rec.donorEmail && <span>✉️ {rec.donorEmail}</span>}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 mb-0.5">
                                {rec.category}
                              </span>
                              <p className="text-slate-800 font-medium truncate max-w-[200px]">{rec.sevaOrPageTitle}</p>
                            </td>
                            <td className="py-3.5 px-4 text-right font-sans font-medium text-slate-700 whitespace-nowrap">
                              ₹{bd.grossAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-right font-sans text-xs text-amber-700 font-medium whitespace-nowrap">
                              -₹{bd.fee.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-right font-sans font-bold text-sm text-emerald-700 whitespace-nowrap">
                              ₹{bd.realNet.toLocaleString("en-IN")}
                            </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                rec.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rec.status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : rec.status === "Refunded"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {rec.status === "Completed" && <CheckCircle2 className="h-3 w-3" />}
                              {rec.status === "Pending" && <Clock className="h-3 w-3" />}
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedReceiptRecord(rec)}
                                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition cursor-pointer"
                                title="View & Print Official Receipt"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete payment record for ${rec.donorName}?`)) {
                                    deletePaymentRecord(rec.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y">
                  {filteredRecords.map((rec) => {
                    const bd = getRecordBreakdown(rec);
                    return (
                      <div key={rec.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              {new Date(rec.date).toLocaleString("en-IN")}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{rec.donorName}</h4>
                            <p className="text-xs text-primary font-mono font-semibold">{rec.paymentId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans font-bold text-emerald-700 text-base">₹{bd.realNet.toLocaleString("en-IN")} <span className="text-[10px] text-emerald-800 font-normal">Net</span></p>
                            <p className="text-[10px] text-slate-500 font-sans">Gross: ₹{bd.grossAmount.toLocaleString("en-IN")} | Fee: -₹{bd.fee.toLocaleString("en-IN")}</p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                                rec.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {rec.status}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                          <p><strong>Seva/Cause:</strong> {rec.sevaOrPageTitle} ({rec.category})</p>
                          {rec.donorPhone && <p><strong>Phone:</strong> {rec.donorPhone}</p>}
                          {rec.donorEmail && <p><strong>Email:</strong> {rec.donorEmail}</p>}
                          {rec.notes && <p><strong>Notes:</strong> {rec.notes}</p>}
                        </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedReceiptRecord(rec)}
                          className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" /> View Receipt
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete payment record for ${rec.donorName}?`)) {
                              deletePaymentRecord(rec.id);
                            }
                          }}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: INSTANT PAYMENT PAGES BUILDER */}
      {/* ========================================================================= */}
      {subTab === "pages" && (
        <div className="space-y-6">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="bg-white rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Active Instant Payment Links</h3>
                  <p className="text-xs text-muted-foreground">Create standalone custom payment pages with custom slugs, background patterns &amp; goal trackers.</p>
                </div>
                <button
                  onClick={startCreateNew}
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" /> Create New Payment Page
                </button>
              </div>

              {/* Pages Grid */}
              {paymentPages.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border shadow-sm space-y-3">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-display font-bold text-slate-800 text-base">No Custom Payment Pages Created</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Create standalone dedicated payment links for special campaigns, crowdfunding goals, or direct seva contributions.
                  </p>
                  <button
                    onClick={startCreateNew}
                    className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl transition"
                  >
                    + Create First Page
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentPages.map((page) => {
                    const fullUrl = getFullShareUrl(page.slug);
                    return (
                      <div
                        key={page.id}
                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col ${
                          !page.active ? "opacity-60" : ""
                        }`}
                      >
                        {/* Card Image Banner */}
                        <div className="h-32 bg-slate-900 relative overflow-hidden">
                          {page.bannerImage ? (
                            <img src={page.bannerImage} alt={page.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-primary to-[#3d1a6a] flex items-center justify-center text-white/40">
                              <ImageIcon className="h-10 w-10" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                page.isPrivate ? "bg-slate-900/80 text-amber-300" : "bg-emerald-600 text-white"
                              }`}
                            >
                              {page.isPrivate ? "Unlisted Link" : "Public Catalog"}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-display font-bold text-slate-900 text-base">{page.title}</h3>
                              <button
                                onClick={() => togglePageActive(page.id)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                                  page.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {page.active ? "Active" : "Inactive"}
                              </button>
                            </div>
                            <p className="text-xs text-primary font-mono font-medium mb-2">/pay/{page.slug}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{page.description}</p>
                          </div>

                          {/* Pricing Summary */}
                          <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                            <div className="flex justify-between font-medium text-slate-700">
                              <span>Pricing Mode:</span>
                              <span className="font-bold text-slate-900 uppercase text-[10px]">{page.pricingType}</span>
                            </div>
                            {page.pricingType === "fixed" && (
                              <div className="flex justify-between font-bold text-emerald-700">
                                <span>Fixed Amount:</span>
                                <span>₹{page.fixedAmount?.toLocaleString("en-IN")}</span>
                              </div>
                            )}
                            {page.enableGoalTracker && (
                              <div className="pt-1 border-t text-[10px] text-muted-foreground flex justify-between">
                                <span>Goal Tracker:</span>
                                <span className="font-semibold text-slate-800">
                                  ₹{page.raisedAmount?.toLocaleString("en-IN")} / ₹{page.goalAmount?.toLocaleString("en-IN")}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <button
                              onClick={() => handleCopyLink(page.slug, page.id)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                              {copiedId === page.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-slate-600" /> Copy Link
                                </>
                              )}
                            </button>
                            <a
                              href={`/pay/${page.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs transition cursor-pointer"
                              title="Open Payment Link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => startEdit(page)}
                              className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition cursor-pointer"
                              title="Edit Page"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition cursor-pointer"
                              title="Delete Page"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* PAYMENT PAGE EDITOR FORM */
            <div className="bg-white rounded-3xl border shadow-lg p-6 sm:p-8 space-y-8 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-900">
                      {editingId && paymentPages.some((p) => p.id === editingId) ? "Edit Payment Page" : "Create Instant Payment Page"}
                    </h2>
                    <p className="text-xs text-muted-foreground">Customize page details, preset amounts, form questions, and visual themes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePage}
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Save Page
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Settings */}
                <div className="lg:col-span-7 space-y-6">
                  {/* SECTION 1: Page Info & Slug */}
                  <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Page Title *</label>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                          placeholder="e.g. Sharandev Seva or Annadan Seva"
                          className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug *</label>
                        <div className="flex items-center gap-1 bg-white border rounded-xl px-3 py-2 text-xs">
                          <span className="text-muted-foreground font-mono text-[11px]">/pay/</span>
                          <input
                            type="text"
                            value={draft.slug}
                            onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                            className="w-full font-mono text-xs text-primary focus:outline-none font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description / Purpose of Offering</label>
                        <textarea
                          rows={3}
                          value={draft.description}
                          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                          placeholder="Detailed purpose of donation, spiritual benefits..."
                          className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Banner Image & Visual Styling */}
                  <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" /> Banner &amp; Visual Theme
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={draft.bannerImage || ""}
                            onChange={(e) => setDraft({ ...draft, bannerImage: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                          />
                          <label className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 transition shrink-0">
                            <Upload className="h-3.5 w-3.5" /> Upload
                            <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Preset Banners */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-2">Or select a preset temple banner:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_BANNER_IMAGES.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setDraft({ ...draft, bannerImage: img.url })}
                              className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                draft.bannerImage === img.url ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-white hover:border-slate-300"
                              }`}
                            >
                              <img src={img.url} alt={img.label} className="h-8 w-12 rounded-lg object-cover" />
                              <span className="text-[10px] font-medium text-slate-700 line-clamp-1">{img.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Pricing Mode & Goal Tracker */}
                  <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" /> Pricing &amp; Goal Progress
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Pricing Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["fixed", "preset", "custom"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setDraft({ ...draft, pricingType: mode })}
                              className={`py-2 rounded-xl border text-xs font-bold capitalize transition cursor-pointer ${
                                draft.pricingType === mode ? "bg-primary text-white border-primary" : "bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {draft.pricingType === "fixed" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Amount (₹)</label>
                          <input
                            type="number"
                            value={draft.fixedAmount || ""}
                            onChange={(e) => setDraft({ ...draft, fixedAmount: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                          />
                        </div>
                      )}

                      {draft.pricingType === "preset" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">Preset Seva Price Tiers</label>
                            <button
                              type="button"
                              onClick={handleAddPresetPrice}
                              className="text-[11px] font-bold text-primary hover:underline"
                            >
                              + Add Tier
                            </button>
                          </div>
                          {(draft.presetPrices || []).map((pr) => (
                            <div key={pr.id} className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                              <input
                                type="text"
                                value={pr.label}
                                onChange={(e) => handleUpdatePresetPrice(pr.id, { label: e.target.value })}
                                placeholder="Tier Label (e.g. Annadan)"
                                className="flex-1 px-2 py-1 text-xs border rounded-lg"
                              />
                              <input
                                type="number"
                                value={pr.amount}
                                onChange={(e) => handleUpdatePresetPrice(pr.id, { amount: Number(e.target.value) })}
                                className="w-24 px-2 py-1 text-xs border rounded-lg font-bold text-emerald-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePresetPrice(pr.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Goal Tracker Toggle */}
                      <div className="pt-3 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Enable Goal Progress Bar</span>
                          <input
                            type="checkbox"
                            checked={!!draft.enableGoalTracker}
                            onChange={(e) => setDraft({ ...draft, enableGoalTracker: e.target.checked })}
                            className="h-4 w-4 text-primary rounded cursor-pointer"
                          />
                        </div>
                        {draft.enableGoalTracker && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600">Goal Target (₹)</label>
                              <input
                                type="number"
                                value={draft.goalAmount || 100000}
                                onChange={(e) => setDraft({ ...draft, goalAmount: Number(e.target.value) })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600">Raised So Far (₹)</label>
                              <input
                                type="number"
                                value={draft.raisedAmount || 0}
                                onChange={(e) => setDraft({ ...draft, raisedAmount: Number(e.target.value) })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Link Preview Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-6">
                    <h3 className="font-display font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-primary" /> Live Link Preview
                    </h3>
                    <div className="bg-gradient-to-br from-[#1a0c2e] via-[#2d154d] to-[#120722] text-white rounded-3xl p-6 shadow-2xl border border-white/10 space-y-4">
                      <div className="aspect-video bg-black/40 rounded-2xl overflow-hidden relative border border-white/10">
                        {draft.bannerImage ? (
                          <img src={draft.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <h4 className="font-display font-bold text-lg text-white">{draft.title || "Page Title"}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {draft.description || "Page description preview..."}
                      </p>

                      <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300">Amount:</span>
                          <span className="font-display font-bold text-amber-300 text-sm">
                            ₹{draft.pricingType === "fixed" ? (draft.fixedAmount || 5555).toLocaleString("en-IN") : "Select Amount"}
                          </span>
                        </div>
                        <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-default">
                          Pay Now (Preview)
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" /> Powered by Razorpay &amp; ISKCON Kurnool
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL OFFLINE PAYMENT RECORD MODAL */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">Record Offline Payment</h3>
                  <p className="text-xs text-muted-foreground">Add manual cash, direct bank, or UPI contributions.</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Rani Dasi"
                  value={manualForm.donorName}
                  onChange={(e) => setManualForm({ ...manualForm, donorName: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={manualForm.donorPhone}
                    onChange={(e) => setManualForm({ ...manualForm, donorPhone: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="donor@example.com"
                    value={manualForm.donorEmail}
                    onChange={(e) => setManualForm({ ...manualForm, donorEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-bold text-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">Direct UPI / QR</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Cause</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharandev Seva, Annadanam"
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number (For 80G)</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={manualForm.panNumber}
                    onChange={(e) => setManualForm({ ...manualForm, panNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gotram / Notes</label>
                <input
                  type="text"
                  placeholder="Kashyapa Gotram / Family offering"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {busy ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL DIGITAL RECEIPT & PRINT MODAL */}
      {/* ========================================================================= */}
      {/* OFFICIAL DIGITAL RECEIPT & PRINT MODAL */}
      {/* ========================================================================= */}
      {selectedReceiptRecord && (
        <OfficialReceiptModal
          data={{
            receiptNo: selectedReceiptRecord.paymentId,
            date: selectedReceiptRecord.date,
            donorName: selectedReceiptRecord.donorName,
            donorEmail: selectedReceiptRecord.donorEmail,
            donorPhone: selectedReceiptRecord.donorPhone,
            amount: selectedReceiptRecord.amount,
            category: selectedReceiptRecord.category,
            sevaTitle: selectedReceiptRecord.sevaOrPageTitle || selectedReceiptRecord.category,
            notes: selectedReceiptRecord.notes,
            panNumber: selectedReceiptRecord.panNumber,
            paymentMethod: selectedReceiptRecord.paymentMethod,
          }}
          onClose={() => setSelectedReceiptRecord(null)}
        />
      )}
    </div>
  );
}
