import { useState } from "react";
import { 
  useAdmin, 
  uploadToCloudinary, 
  PaymentPage, 
  PaymentPageField, 
  PaymentPagePriceField, 
  slugify 
} from "@/context/AdminContext";
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
  Maximize2,
  Crown,
  Zap
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
  const { paymentPages, setPaymentPages } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form draft for create/edit
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

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this payment page?")) return;
    setPaymentPages(paymentPages.filter((p) => p.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setPaymentPages(
      paymentPages.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleSavePage = () => {
    if (!draft.title.trim()) {
      alert("Please enter a page title.");
      return;
    }
    const safeSlug = slugify(draft.slug || draft.title) || `page-${Date.now()}`;
    const pageToSave = { ...draft, slug: safeSlug };

    const exists = paymentPages.some((p) => p.id === draft.id);
    if (exists) {
      setPaymentPages(paymentPages.map((p) => (p.id === draft.id ? pageToSave : p)));
    } else {
      setPaymentPages([...paymentPages, pageToSave]);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsEditing(false);
    }, 1200);
  };

  const handleUploadBanner = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, bannerImage: url }));
    } catch (e) {
      alert("Failed to upload banner image.");
    }
    setBusy(false);
  };

  const handleUploadLogo = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, logoUrl: url }));
    } catch (e) {
      alert("Failed to upload logo.");
    }
    setBusy(false);
  };

  // Add custom donor input field
  const handleAddField = () => {
    const fieldId = `field_${Date.now()}`;
    setDraft((d) => ({
      ...d,
      fields: [
        ...d.fields,
        { id: fieldId, label: "Custom Field", type: "text", required: false },
      ],
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    setDraft((d) => ({
      ...d,
      fields: d.fields.filter((f) => f.id !== fieldId),
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<PaymentPageField>) => {
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  };

  // Preset prices handlers
  const handleAddPresetPrice = () => {
    const prId = `pr_${Date.now()}`;
    setDraft((d) => ({
      ...d,
      presetPrices: [
        ...(d.presetPrices || []),
        { id: prId, label: "Offering Option", amount: 1008 },
      ],
    }));
  };

  const handleRemovePresetPrice = (prId: string) => {
    setDraft((d) => ({
      ...d,
      presetPrices: (d.presetPrices || []).filter((p) => p.id !== prId),
    }));
  };

  const handleUpdatePresetPrice = (prId: string, updates: Partial<PaymentPagePriceField>) => {
    setDraft((d) => ({
      ...d,
      presetPrices: (d.presetPrices || []).map((p) => (p.id === prId ? { ...p, ...updates } : p)),
    }));
  };

  if (isEditing) {
    return (
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
        {/* Editor Top Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-white/90"
              title="Back to Pages List"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="text-[10px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Modern Payment Page Builder
              </div>
              <h2 className="font-display text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                {draft.title || "Untitled Payment Page"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {draft.slug && (
              <button
                onClick={() => handleCopyLink(draft.slug, draft.id)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === draft.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedId === draft.id ? "Copied Link!" : "Copy Share Link"}</span>
              </button>
            )}

            <button
              onClick={handleSavePage}
              className="py-2.5 px-6 bg-gradient-to-r from-primary to-[#3d1a6a] hover:from-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              {saved ? <Check className="h-4 w-4 text-secondary" /> : <CreditCard className="h-4 w-4 text-secondary" />}
              <span>{saved ? "Saved & Live!" : "Save and Update Page"}</span>
            </button>
          </div>
        </div>

        {/* Split View Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Page Content, Images & Background Pattern (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* LAYOUT THEME SELECTOR (Split View, Royal Dark, Minimalist Centered) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-display text-base font-bold text-primary flex items-center gap-2 border-b pb-3">
                <Layers className="h-4.5 w-4.5 text-secondary" /> Page Structure &amp; Layout Theme
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, layoutTheme: "split" }))}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                    (draft.layoutTheme || "split") === "split"
                      ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-amber-950 font-bold"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    <span className="text-[9px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Split View</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">🎨 Floating Glass Split</div>
                    <div className="text-[10px] text-muted-foreground">Hero banner + 2-column split desktop card</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, layoutTheme: "royal" }))}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                    draft.layoutTheme === "royal"
                      ? "bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 text-purple-950 font-bold"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="text-[9px] font-bold uppercase bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">Royal Dark</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">👑 Dark Royal Temple</div>
                    <div className="text-[10px] text-muted-foreground">Velvet dark mode &amp; metallic gold glowing borders</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, layoutTheme: "centered" }))}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                    draft.layoutTheme === "centered"
                      ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 font-bold"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    <span className="text-[9px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Centered Modal</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">⚡ Minimalist Centered</div>
                    <div className="text-[10px] text-muted-foreground">Compact centered modal &amp; 1-click checkout</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-display text-base font-bold text-primary flex items-center gap-2 border-b pb-3">
                <ImageIcon className="h-4.5 w-4.5 text-secondary" /> 1. Hero Image &amp; Branding
              </h3>

              {/* Title & Slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Page Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharandev Seva"
                    value={draft.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setDraft((d) => ({
                        ...d,
                        title: newTitle,
                        slug: d.slug || slugify(newTitle),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">/pay/</span>
                    <input
                      type="text"
                      placeholder="sharandev"
                      value={draft.slug}
                      onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                      className="w-full pl-13 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-primary font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* HERO BANNER IMAGE OPTIONS */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Header Banner Image (Custom Upload or Preset)
                </label>

                {draft.bannerImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group max-h-52 bg-slate-900 shadow-sm">
                    <img src={draft.bannerImage} alt="Banner Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        onClick={() => setDraft((d) => ({ ...d, bannerImage: "" }))}
                        className="p-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-2xl p-6 text-center transition bg-slate-50/50 space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700">Upload high-res hero banner image</p>
                      <p className="text-[11px] text-muted-foreground">Recommended size: 1200x600 px (JPG, PNG, WebP)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadBanner(e.target.files[0]);
                      }}
                      className="hidden"
                      id="banner-img-upload"
                      disabled={busy}
                    />
                    <label
                      htmlFor="banner-img-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-xs transition cursor-pointer shadow-sm hover:bg-primary/90 ${
                        busy ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {busy ? "Uploading image..." : "Browse Local File"}
                    </label>
                  </div>
                )}

                {/* Direct Image URL input */}
                <input
                  type="text"
                  placeholder="Or paste image URL (e.g. https://...)"
                  value={draft.bannerImage}
                  onChange={(e) => setDraft((d) => ({ ...d, bannerImage: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30"
                />

                {/* SPIRITUAL IMAGE PRESETS PICKER */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    ✨ Or Choose a Curated Spiritual Preset Image:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PRESET_BANNER_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, bannerImage: preset.url }))}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition group cursor-pointer ${
                          draft.bannerImage === preset.url
                            ? "border-primary ring-2 ring-primary/30 scale-105 shadow-md"
                            : "border-slate-200 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="h-16 w-full object-cover" />
                        <div className="p-1.5 bg-slate-900/90 text-[10px] font-semibold text-white leading-tight truncate">
                          {preset.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo / Thumbnail Upload */}
              <div className="space-y-1.5 pt-2 border-t">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Page Logo / Organization Avatar
                </label>
                <div className="flex items-center gap-3">
                  {draft.logoUrl ? (
                    <img src={draft.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/20" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">Logo</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUploadLogo(e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Logo
                  </label>
                  {draft.logoUrl && (
                    <button
                      onClick={() => setDraft((d) => ({ ...d, logoUrl: "" }))}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Goal Tracker Toggle */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">Goal Tracker Progress Bar</div>
                      <div className="text-[11px] text-amber-700">Display raised vs. target amount</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDraft((d) => ({ ...d, enableGoalTracker: !d.enableGoalTracker }))}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                      draft.enableGoalTracker ? "bg-amber-600" : "bg-slate-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${draft.enableGoalTracker ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {draft.enableGoalTracker && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-200/60">
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 uppercase block">Target Goal (₹)</label>
                      <input
                        type="number"
                        value={draft.goalAmount || 100000}
                        onChange={(e) => setDraft((d) => ({ ...d, goalAmount: Number(e.target.value) }))}
                        className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 uppercase block">Total Raised (₹)</label>
                      <input
                        type="number"
                        value={draft.raisedAmount || 0}
                        onChange={(e) => setDraft((d) => ({ ...d, raisedAmount: Number(e.target.value) }))}
                        className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Page Description / Cause Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed page description, purpose of donation, or seva benefits..."
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase block">Contact Email</label>
                  <input
                    type="email"
                    value={draft.contactEmail || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase block">Contact Phone</label>
                  <input
                    type="text"
                    value={draft.contactPhone || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {draft.isPrivate ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Globe className="h-3.5 w-3.5 text-emerald-600" />}
                      <span>{draft.isPrivate ? "Private / Unlisted Link" : "Public Page"}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {draft.isPrivate ? "Only people with the direct link can access" : "Listed on public donation catalog"}
                    </div>
                  </div>
                  <button
                    onClick={() => setDraft((d) => ({ ...d, isPrivate: !d.isPrivate }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      draft.isPrivate ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {draft.isPrivate ? "Unlisted" : "Public"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing, Fields & Ultra-Modern Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pricing Mode Selector & Field Config */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-display text-base font-bold text-primary flex items-center gap-2 border-b pb-3">
                <IndianRupee className="h-4.5 w-4.5 text-emerald-600" /> 2. Pricing &amp; Price Fields
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Pricing Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, pricingType: "fixed" }))}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      draft.pricingType === "fixed"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Fixed Amount
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, pricingType: "preset" }))}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      draft.pricingType === "preset"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Preset Tiers
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, pricingType: "custom" }))}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      draft.pricingType === "custom"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Custom Input
                  </button>
                </div>
              </div>

              {/* Fixed Amount Config */}
              {draft.pricingType === "fixed" && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <label className="text-[11px] font-bold text-emerald-900 uppercase block">Fixed Amount (₹)</label>
                  <input
                    type="number"
                    value={draft.fixedAmount || 5555}
                    onChange={(e) => setDraft((d) => ({ ...d, fixedAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 font-sans"
                  />
                </div>
              )}

              {/* Preset Prices Config */}
              {draft.pricingType === "preset" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase">Preset Offering Tiers</label>
                    <button
                      type="button"
                      onClick={handleAddPresetPrice}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Tier
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(draft.presetPrices || []).map((pr) => (
                      <div key={pr.id} className="flex items-center gap-2 p-2 bg-slate-50 border rounded-xl">
                        <input
                          type="text"
                          value={pr.label}
                          placeholder="Label (e.g. Special Seva)"
                          onChange={(e) => handleUpdatePresetPrice(pr.id, { label: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border rounded-lg"
                        />
                        <input
                          type="number"
                          value={pr.amount}
                          placeholder="Amount (₹)"
                          onChange={(e) => handleUpdatePresetPrice(pr.id, { amount: Number(e.target.value) })}
                          className="w-24 px-2.5 py-1.5 text-xs font-bold bg-white border rounded-lg text-emerald-700 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePresetPrice(pr.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Donor Fields Builder */}
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Donor Form Fields</label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {draft.fields.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 p-2.5 bg-slate-50 border rounded-xl text-xs">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => handleUpdateField(f.id, { label: e.target.value })}
                        className="flex-1 px-2 py-1 bg-white border rounded-lg font-medium"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase">{f.type}</span>
                      {f.id !== "f1" && f.id !== "f2" && f.id !== "f3" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ULTRA-MODERN LIVE PREVIEW CARD */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="text-[11px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1.5 z-10 relative">
                <Eye className="h-3.5 w-3.5 text-secondary" /> Live Modern Devotee Page Preview ({draft.bgStyle || "gradient"})
              </div>

              {/* Simulated Devotee Payment Card */}
              <div className="bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-amber-100 relative z-10">
                {/* Header Banner in Preview */}
                {draft.bannerImage ? (
                  <div className="h-28 rounded-2xl overflow-hidden relative shadow-sm">
                    <img src={draft.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">ISKCON Kurnool</div>
                      <div className="text-xs font-bold font-display truncate">{draft.title || "Page Title"}</div>
                    </div>
                  </div>
                ) : null}

                <div className="border-b pb-2">
                  <h4 className="font-display text-base font-bold text-primary">Payment Details</h4>
                  <div className="w-8 h-1 bg-secondary rounded-full mt-1" />
                </div>

                {/* Amount Row (Inter Font) */}
                <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-amber-500/5 p-3 rounded-2xl border border-primary/10">
                  <span className="text-xs font-bold text-slate-600">Amount</span>
                  <span className="text-base font-extrabold text-primary font-sans">
                    {draft.pricingType === "fixed"
                      ? `₹${(draft.fixedAmount || 0).toLocaleString("en-IN")}.00`
                      : draft.pricingType === "preset"
                      ? `₹${(draft.presetPrices?.[0]?.amount || 0).toLocaleString("en-IN")}.00`
                      : "Custom Amount"}
                  </span>
                </div>

                {/* Input Fields */}
                <div className="space-y-2">
                  {draft.fields.map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">{f.label}</label>
                      <div className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                        {f.label}...
                      </div>
                    </div>
                  ))}
                </div>

                {/* Razorpay Button Preview */}
                <button
                  type="button"
                  className="w-full py-3.5 bg-gradient-to-r from-primary via-[#3d1a6a] to-primary text-white rounded-2xl font-bold text-xs flex items-center justify-between px-4 shadow-lg shadow-primary/20"
                >
                  <span className="text-[10px] text-white/70 tracking-wider">UPI / VISA / RuPay</span>
                  <span className="flex items-center gap-1 font-sans font-bold">
                    Pay {draft.pricingType === "fixed" ? `₹${(draft.fixedAmount || 0).toLocaleString("en-IN")}.00` : "Now"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW: Table & Cards of existing Payment Pages
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-[#3d1a6a] to-primary text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary text-xs font-bold uppercase tracking-wider border border-white/10">
            <CreditCard className="h-3.5 w-3.5" /> Instant Payment Pages
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Payment Pages Builder</h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl">
            Build ultra-modern standalone payment pages with custom slugs, background pattern illustrations, goal progress bars, unlisted sharing links, and direct Razorpay checkout.
          </p>
        </div>

        <button
          onClick={startCreateNew}
          className="z-10 py-3 px-6 bg-secondary hover:bg-secondary/90 text-primary font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="h-4.5 w-4.5" /> Create New Payment Page
        </button>
      </div>

      {/* Pages List */}
      {paymentPages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CreditCard className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-800">No Payment Pages Created Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Create your first instant payment page with a custom slug and share the link directly on WhatsApp or Email.
            </p>
          </div>
          <button
            onClick={startCreateNew}
            className="py-2.5 px-5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Page Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paymentPages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* Banner Image Preview header */}
              {page.bannerImage ? (
                <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                  <img src={page.bannerImage} alt={page.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900/80 text-secondary border border-white/20">
                      {page.bgStyle || "gradient"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                        page.isPrivate ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {page.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {page.isPrivate ? "Unlisted" : "Public"}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="p-5 space-y-3 flex-1">
                {!page.bannerImage && (
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        page.isPrivate ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {page.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {page.isPrivate ? "Unlisted Link" : "Public"}
                    </span>

                    <button
                      onClick={() => handleToggleActive(page.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        page.active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {page.active ? "Active" : "Disabled"}
                    </button>
                  </div>
                )}

                {/* Title & Slug */}
                <div>
                  <h3 className="font-display text-base font-bold text-slate-800 leading-snug line-clamp-1">
                    {page.title}
                  </h3>
                  <div className="text-xs font-mono text-primary font-semibold mt-0.5">
                    /pay/{page.slug}
                  </div>
                </div>

                {/* Amount Info */}
                <div className="bg-slate-50 p-3 rounded-2xl border text-xs space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Pricing Mode</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1 font-sans">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {page.pricingType === "fixed"
                        ? `₹${(page.fixedAmount || 0).toLocaleString("en-IN")} Fixed`
                        : page.pricingType === "preset"
                        ? `${page.presetPrices?.length || 0} Preset Tiers`
                        : "Custom Input"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50/80 border-t flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyLink(page.slug, page.id)}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Copy direct share link"
                >
                  {copiedId === page.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === page.id ? "Copied!" : "Copy Link"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={getFullShareUrl(page.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-primary transition rounded-lg"
                    title="View Page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => startEdit(page)}
                    className="p-2 text-slate-500 hover:text-primary transition rounded-lg cursor-pointer"
                    title="Edit Page"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 transition rounded-lg cursor-pointer"
                    title="Delete Page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
