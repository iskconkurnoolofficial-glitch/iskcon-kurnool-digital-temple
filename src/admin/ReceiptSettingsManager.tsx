import { useState, useEffect } from "react";
import { useAdmin, uploadToCloudinary, ReceiptSettings, defaultReceiptSettings } from "@/context/AdminContext";
import { generateAndDownloadReceiptPNG, ReceiptData, getReceiptWhatsAppUrl, getReceiptShareUrl, generateReceiptWhatsAppText } from "@/components/OfficialReceiptModal";
import { 
  FileCheck, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Check, 
  RotateCcw, 
  Trash2, 
  Palette, 
  Type, 
  Building2, 
  PenTool, 
  Stamp, 
  Layers,
  HelpCircle,
  Eye,
  MessageCircle,
  Share2
} from "lucide-react";
import { toast } from "sonner";

const PRESET_PALETTES = [
  {
    name: "Royal Purple & Gold",
    primaryColor: "#5b2c9b",
    secondaryColor: "#d97706",
    accentColor: "#059669",
    backgroundColor: "#ffffff",
  },
  {
    name: "Saffron Devotion",
    primaryColor: "#c2410c",
    secondaryColor: "#eab308",
    accentColor: "#047857",
    backgroundColor: "#fffdfa",
  },
  {
    name: "Temple Maroon & Amber",
    primaryColor: "#881337",
    secondaryColor: "#f59e0b",
    accentColor: "#0d9488",
    backgroundColor: "#ffffff",
  },
  {
    name: "Emerald Spiritual",
    primaryColor: "#065f46",
    secondaryColor: "#d97706",
    accentColor: "#0284c7",
    backgroundColor: "#fcfdfd",
  },
  {
    name: "Royal Indigo",
    primaryColor: "#3730a3",
    secondaryColor: "#f59e0b",
    accentColor: "#059669",
    backgroundColor: "#ffffff",
  }
];

export default function ReceiptSettingsManager() {
  const { receiptSettings, setReceiptSettings, settings } = useAdmin();
  const [form, setForm] = useState<ReceiptSettings>(receiptSettings || defaultReceiptSettings);
  const [activeTab, setActiveTab] = useState<"temple" | "logo" | "signature" | "styling">("temple");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (receiptSettings) {
      setForm(receiptSettings);
    }
  }, [receiptSettings]);

  const update = (key: keyof ReceiptSettings, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      setReceiptSettings(form);
      setSavedSuccess(true);
      toast.success("Official Receipt settings saved successfully!");
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      toast.error("Failed to save receipt settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset receipt settings to default template?")) {
      setForm(defaultReceiptSettings);
      setReceiptSettings(defaultReceiptSettings);
      toast.success("Receipt settings restored to default.");
    }
  };

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadToCloudinary(file);
      update("customReceiptLogo", url);
      update("useNavLogo", false);
      toast.success("Receipt logo uploaded successfully.");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadSignature = async (file: File) => {
    setUploadingSig(true);
    try {
      const url = await uploadToCloudinary(file);
      update("signatureImage", url);
      toast.success("Authorized signature uploaded successfully.");
    } catch {
      toast.error("Failed to upload signature.");
    } finally {
      setUploadingSig(false);
    }
  };

  const handleUploadSeal = async (file: File) => {
    setUploadingSeal(true);
    try {
      const url = await uploadToCloudinary(file);
      update("sealImage", url);
      toast.success("Temple seal / stamp uploaded.");
    } catch {
      toast.error("Failed to upload seal image.");
    } finally {
      setUploadingSeal(false);
    }
  };

  // Sample data for real-time preview & test download
  const sampleReceiptData: ReceiptData = {
    receiptNo: "ISK-2026-8809",
    date: new Date().toISOString(),
    donorName: "Sri Radhanath Das",
    donorEmail: "radhanath.das@example.com",
    donorPhone: "+91 98765 43210",
    amount: 5001,
    category: "Special Festival",
    sevaTitle: "Sri Krishna Janmashtami Mahotsav & Annadana Seva",
    notes: "Achyuta Gotram — For universal peace & family auspiciousness",
    panNumber: "ABCDE1234F",
    paymentMethod: "UPI / QR Code",
  };

  const handleTestDownload = () => {
    generateAndDownloadReceiptPNG(sampleReceiptData, form, settings);
    toast.success("Sample PNG receipt generated and downloaded!");
  };

  const resolvedLogo = form.useNavLogo ? (settings.logo || form.customReceiptLogo) : (form.customReceiptLogo || settings.logo);

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> High-Resolution PNG &amp; Printable Receipts
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-3">
              <FileCheck className="h-7 w-7 text-amber-400" /> Official Receipt Customizer
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Design and customize the temple donation receipts with instant PNG download, automatic navbar logo inheritance, bottom-right authorized signature upload, custom colors, ornate borders, and 80G tax certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={getReceiptWhatsAppUrl(sampleReceiptData, undefined, form, settings)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> Test WhatsApp Redirect
            </a>
            <button
              type="button"
              onClick={handleTestDownload}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/15 cursor-pointer"
            >
              <Download className="h-4 w-4 text-amber-400" /> Test PNG Download
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="Reset to defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>Saving...</>
              ) : savedSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Receipt Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
        <div className="lg:col-span-6 space-y-5">
          {/* Navigation Pills */}
          <div className="bg-white rounded-2xl p-1.5 border shadow-sm flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("temple")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === "temple" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Building2 className="h-4 w-4" /> Temple &amp; 80G
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logo")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === "logo" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ImageIcon className="h-4 w-4" /> Logo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signature")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === "signature" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <PenTool className="h-4 w-4" /> Signature &amp; Seal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("styling")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === "styling" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Palette className="h-4 w-4" /> Colors &amp; Style
            </button>
          </div>

          {/* TAB 1: TEMPLE & 80G DETAILS */}
          {activeTab === "temple" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border shadow-sm space-y-5 animate-fade-in">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Temple &amp; Header Information</h3>
                  <p className="text-xs text-slate-500">Customize the temple identity displayed at the top of receipts.</p>
                </div>
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Temple Title (Header Line 1)</label>
                  <input
                    type="text"
                    value={form.templeName}
                    onChange={(e) => update("templeName", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="ISKCON KURNOOL"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Deity / Subtitle (Header Line 2)</label>
                  <input
                    type="text"
                    value={form.deityName}
                    onChange={(e) => update("deityName", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="Sri Sri Jagannath Baladev Subhadra Temple"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Temple Address / Location</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="Sri Sri Puri Jagannath Temple, Kurnool, Andhra Pradesh, India"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="+91 95053 77520"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="iskconkurnool@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Receipt Badge Title</label>
                  <input
                    type="text"
                    value={form.receiptTitle}
                    onChange={(e) => update("receiptTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="OFFICIAL DONATION RECEIPT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">80G Registration Number</label>
                  <input
                    type="text"
                    value={form.taxRegNumber}
                    onChange={(e) => update("taxRegNumber", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="AAATI1234F / 80G / 2024-25"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">80G Tax Exemption Notice Text</label>
                  <input
                    type="text"
                    value={form.taxExemptionText}
                    onChange={(e) => update("taxExemptionText", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="Eligible for 80G Income Tax Exemption · 100% Tax Deductible"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Devotional Blessing Quote</label>
                  <textarea
                    rows={2}
                    value={form.blessingMessage}
                    onChange={(e) => update("blessingMessage", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium resize-none"
                    placeholder="May Lord Sri Jagannath shower eternal blessings upon you and your family."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Footer Legal / Acknowledgement Note</label>
                  <textarea
                    rows={2}
                    value={form.footerNotes}
                    onChange={(e) => update("footerNotes", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium resize-none"
                    placeholder="All donations to ISKCON Kurnool are eligible for 80G tax exemption. This is a computer-generated official receipt."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO CONFIGURATION */}
          {activeTab === "logo" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border shadow-sm space-y-5 animate-fade-in">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Receipt Logo Configuration</h3>
                  <p className="text-xs text-slate-500">Choose to auto-inherit the website navbar logo or upload a high-res custom receipt emblem.</p>
                </div>
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>

              {/* Auto Take Navigation Logo Switch */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Auto-Take Navigation / Site Logo</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    When enabled, the receipt automatically uses the primary temple logo configured in Site Settings (<code>settings.logo</code>).
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.useNavLogo}
                    onChange={(e) => update("useNavLogo", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Current Active Logo Preview */}
              <div className="border rounded-2xl p-4 bg-slate-50 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white border-2 border-primary/20 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {resolvedLogo ? (
                    <img src={resolvedLogo} alt="Receipt Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                      IK
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {form.useNavLogo ? "Currently Using Site Navbar Logo" : "Using Custom Uploaded Receipt Logo"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {resolvedLogo || "No custom logo uploaded yet."}
                  </p>
                </div>
              </div>

              {/* Custom Logo Upload Section */}
              {!form.useNavLogo && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Upload Custom Receipt Logo (PNG / JPG / WebP)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-primary transition cursor-pointer relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLogo(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingLogo}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingLogo ? "Uploading logo..." : "Click or drag & drop to upload custom receipt logo"}
                      </p>
                      <p className="text-[10px] text-slate-500">Transparent PNG or circular logo recommended (500x500)</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Or Paste Image URL directly</label>
                    <input
                      type="text"
                      value={form.customReceiptLogo || ""}
                      onChange={(e) => update("customReceiptLogo", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      placeholder="https://example.com/receipt-logo.png"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SIGNATURE & SEAL (BOTTOM-RIGHT) */}
          {activeTab === "signature" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border shadow-sm space-y-5 animate-fade-in">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Bottom-Right Signature &amp; Stamp</h3>
                  <p className="text-xs text-slate-500">Upload the authorized signature and configure the signatory credentials.</p>
                </div>
                <PenTool className="h-5 w-5 text-primary" />
              </div>

              {/* Signatory Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={form.signatoryName}
                    onChange={(e) => update("signatoryName", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="Vaishnava Krupa Das"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation / Title</label>
                  <input
                    type="text"
                    value={form.signatoryTitle}
                    onChange={(e) => update("signatoryTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="Temple President / Authorised Signatory"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization / Branch</label>
                  <input
                    type="text"
                    value={form.signatoryOrg}
                    onChange={(e) => update("signatoryOrg", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                    placeholder="ISKCON Kurnool"
                  />
                </div>
              </div>

              {/* Signature Image Upload Box */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Authorized Signature Image (PNG recommended with transparent background)</label>
                  {form.signatureImage && (
                    <button
                      type="button"
                      onClick={() => update("signatureImage", "")}
                      className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Remove Signature
                    </button>
                  )}
                </div>

                {form.signatureImage ? (
                  <div className="border rounded-2xl p-4 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-48 bg-white border-2 border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-xs">
                        <img src={form.signatureImage} alt="Uploaded Signature" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Signature Uploaded</p>
                        <p className="text-[10px] text-slate-500">Will render on bottom-right of PNG &amp; Modal</p>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSignature(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingSig}
                      />
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                      >
                        {uploadingSig ? "Uploading..." : "Replace"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-primary transition cursor-pointer relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSignature(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingSig}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <PenTool className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingSig ? "Uploading signature..." : "Click or drag & drop to upload Signature PNG"}
                      </p>
                      <p className="text-[10px] text-slate-500">A clear digital signature on transparent / white background (e.g. 400x150)</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">Or Paste Signature URL</label>
                  <input
                    type="text"
                    value={form.signatureImage || ""}
                    onChange={(e) => update("signatureImage", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="https://example.com/signature.png"
                  />
                </div>
              </div>

              {/* Temple Seal / Stamp Options */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">Show Temple Seal / Stamp Badge</span>
                    <p className="text-[11px] text-slate-500">Displays official verified emblem watermark on the receipt.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={form.showSeal}
                      onChange={(e) => update("showSeal", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {form.showSeal && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Custom Temple Seal Image (Optional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={form.sealImage || ""}
                        onChange={(e) => update("sealImage", e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        placeholder="Leave blank for automatic golden verified seal badge"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadSeal(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploadingSeal}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COLORS, FONTS & STYLING */}
          {activeTab === "styling" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border shadow-sm space-y-6 animate-fade-in">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Colors, Typography &amp; Borders</h3>
                  <p className="text-xs text-slate-500">Fine-tune the receipt aesthetics to match your temple branding.</p>
                </div>
                <Palette className="h-5 w-5 text-primary" />
              </div>

              {/* Preset Color Themes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preset Color Palettes</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_PALETTES.map((preset) => {
                    const isSelected = form.primaryColor === preset.primaryColor && form.secondaryColor === preset.secondaryColor;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          update("primaryColor", preset.primaryColor);
                          update("secondaryColor", preset.secondaryColor);
                          update("accentColor", preset.accentColor);
                          update("backgroundColor", preset.backgroundColor);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="h-3.5 w-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.primaryColor }} />
                          <span className="h-3.5 w-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.secondaryColor }} />
                          <span className="h-3.5 w-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Primary Theme</label>
                  <div className="flex items-center gap-2 p-1.5 border rounded-xl bg-slate-50">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">{form.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Gold Accent</label>
                  <div className="flex items-center gap-2 p-1.5 border rounded-xl bg-slate-50">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                      className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">{form.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Amount Accent</label>
                  <div className="flex items-center gap-2 p-1.5 border rounded-xl bg-slate-50">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => update("accentColor", e.target.value)}
                      className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">{form.accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Background</label>
                  <div className="flex items-center gap-2 p-1.5 border rounded-xl bg-slate-50">
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => update("backgroundColor", e.target.value)}
                      className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">{form.backgroundColor}</span>
                  </div>
                </div>
              </div>

              {/* Typography & Fonts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Font Style</label>
                  <select
                    value={form.fontFamily}
                    onChange={(e) => update("fontFamily", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="Inter">Inter (Modern &amp; Ultra-Crisp)</option>
                    <option value="Cinzel">Cinzel (Divine &amp; Classical)</option>
                    <option value="Outfit">Outfit (Clean Geometric)</option>
                    <option value="Playfair">Playfair (Traditional Serif)</option>
                    <option value="Geist">Geist (Modern Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Border Frame Style</label>
                  <select
                    value={form.borderStyle}
                    onChange={(e) => update("borderStyle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="royal_gold">Royal Gold Double Ornate Frame</option>
                    <option value="classic_double">Classic Symmetrical Double Line</option>
                    <option value="modern_clean">Modern Minimal Subtle Frame</option>
                    <option value="temple_arch">Temple Mandala Corner Arch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Header Banner Style</label>
                  <select
                    value={form.headerBgStyle}
                    onChange={(e) => update("headerBgStyle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="gradient">Rich Gradient Banner</option>
                    <option value="solid">Solid Royal Fill</option>
                    <option value="ornate">Ornate Gold Accent Band</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Watermark Text</label>
                  <input
                    type="text"
                    value={form.watermarkText}
                    onChange={(e) => update("watermarkText", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    placeholder="ISKCON KURNOOL"
                  />
                </div>
              </div>

              {/* Watermark Toggle */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <span className="font-bold text-xs text-slate-900">Show Background Watermark</span>
                  <p className="text-[11px] text-slate-500">Adds subtle diagonal watermark across the receipt body.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.showWatermark}
                    onChange={(e) => update("showWatermark", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE REAL-TIME RECEIPT PREVIEW */}
        <div className="lg:col-span-6 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold text-sm text-slate-800">Live Receipt Preview</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Real-time
              </span>
            </div>
            <button
              type="button"
              onClick={handleTestDownload}
              className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Sample PNG
            </button>
          </div>

          {/* RECEIPT CARD PREVIEW */}
          <div 
            className="rounded-3xl p-5 sm:p-7 shadow-xl border overflow-hidden relative transition-all"
            style={{ 
              backgroundColor: form.backgroundColor || "#ffffff",
              borderColor: `${form.secondaryColor}40`,
              fontFamily: form.fontFamily === "Cinzel" ? "serif" : form.fontFamily === "Playfair" ? "Georgia, serif" : "sans-serif"
            }}
          >
            {/* Outer Frame Decoration */}
            <div 
              className="absolute inset-2 sm:inset-3 rounded-2xl pointer-events-none border-2"
              style={{ borderColor: form.secondaryColor }}
            />
            <div 
              className="absolute inset-3 sm:inset-4 rounded-xl pointer-events-none border"
              style={{ borderColor: `${form.primaryColor}30` }}
            />

            {/* Diagonal Watermark if enabled */}
            {form.showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-25deg]">
                <span className="text-5xl sm:text-6xl font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
                  {form.watermarkText || "ISKCON KURNOOL"}
                </span>
              </div>
            )}

            {/* Header Banner */}
            <div 
              className="rounded-xl p-4 sm:p-5 text-center text-white relative shadow-sm mb-4"
              style={{
                background: form.headerBgStyle === "solid"
                  ? form.primaryColor
                  : `linear-gradient(135deg, ${form.primaryColor} 0%, #1e1b4b 100%)`,
                borderBottom: `3px solid ${form.secondaryColor}`
              }}
            >
              {/* Emblem / Logo */}
              <div className="flex justify-center mb-2">
                {resolvedLogo ? (
                  <img
                    src={resolvedLogo}
                    alt="Logo"
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shadow-md ring-2"
                    style={{ ringColor: form.secondaryColor }}
                  />
                ) : (
                  <div 
                    className="h-12 w-12 rounded-full font-bold text-lg flex items-center justify-center shadow-md border-2"
                    style={{ backgroundColor: form.secondaryColor, color: form.primaryColor, borderColor: "#ffffff" }}
                  >
                    IK
                  </div>
                )}
              </div>

              <h2 className="font-display font-black text-lg sm:text-xl tracking-wider uppercase text-white">
                {form.templeName || "ISKCON KURNOOL"}
              </h2>
              <p className="text-xs font-semibold mt-0.5" style={{ color: form.secondaryColor }}>
                {form.deityName || "Sri Sri Jagannath Baladev Subhadra Temple"}
              </p>
              <p className="text-[10px] text-white/80 mt-1">
                {form.address || "Kurnool, Andhra Pradesh · Phone: " + (form.phone || "+91 95053 77520")}
              </p>

              {/* Receipt Title Badge */}
              <div 
                className="mt-3 inline-block px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
                style={{ 
                  backgroundColor: "#fffdf0", 
                  color: form.primaryColor,
                  border: `1.5px solid ${form.secondaryColor}` 
                }}
              >
                {form.receiptTitle || "OFFICIAL DONATION RECEIPT"}
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 text-[11px] mb-3">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Receipt Ref No:</span>
                <span className="font-mono font-bold" style={{ color: form.primaryColor }}>
                  {sampleReceiptData.receiptNo}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Date &amp; Time:</span>
                <span className="font-semibold text-slate-700">
                  {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-1.5 text-xs text-slate-800 mb-4 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Devotee Name:</span>
                <span className="font-bold text-slate-900">{sampleReceiptData.donorName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-700">{sampleReceiptData.donorPhone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Seva / Offering:</span>
                <span className="font-bold truncate max-w-[220px]" style={{ color: form.primaryColor }}>
                  {sampleReceiptData.sevaTitle}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Gotram / Notes:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[220px]">
                  {sampleReceiptData.notes}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">80G PAN Ref:</span>
                <span className="font-mono font-bold uppercase text-slate-800">
                  {sampleReceiptData.panNumber}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-700">{sampleReceiptData.paymentMethod}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div 
              className="p-3.5 rounded-2xl border flex items-center justify-between mb-4 shadow-xs"
              style={{ 
                backgroundColor: `${form.accentColor}10`,
                borderColor: `${form.accentColor}40`
              }}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: form.accentColor }}>
                  Total Contribution Received
                </span>
                <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Status: Verified &amp; Confirmed
                </span>
              </div>

              <div className="text-right font-display font-black text-xl sm:text-2xl" style={{ color: form.accentColor }}>
                ₹{sampleReceiptData.amount.toLocaleString("en-IN")}.00
              </div>
            </div>

            {/* WhatsApp Direct Details Section */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-950">WhatsApp Donation Details</span>
                </div>
                <span className="text-[9px] text-emerald-700 font-semibold">1-Click Redirect</span>
              </div>

              <p className="text-[10px] text-emerald-800 leading-relaxed">
                Forwards full receipt details (Ref No, Seva, Amount, PAN, Gotram) directly to Temple WhatsApp or personal chat.
              </p>

              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href={getReceiptWhatsAppUrl(sampleReceiptData, undefined, form, settings)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <MessageCircle className="h-3 w-3" /> Send to Temple
                </a>
                <a
                  href={getReceiptShareUrl(sampleReceiptData, form, settings)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <Share2 className="h-3 w-3 text-emerald-700" /> Share
                </a>
              </div>
            </div>

            {/* Blessing Quote & 80G */}
            <div className="text-center space-y-1 py-1 mb-4">
              <p className="text-xs font-semibold italic" style={{ color: form.primaryColor }}>
                "{form.blessingMessage}"
              </p>
              <p className="text-[10px] text-slate-500">
                {form.taxExemptionText} · Reg: {form.taxRegNumber}
              </p>
            </div>

            {/* BOTTOM-RIGHT SIGNATURE BLOCK */}
            <div className="border-t border-slate-200/80 pt-4 flex items-end justify-between">
              {/* Left Seal Badge */}
              <div>
                {form.showSeal && (
                  <div className="flex items-center gap-2">
                    {form.sealImage ? (
                      <img src={form.sealImage} alt="Temple Seal" className="h-12 w-12 object-contain" />
                    ) : (
                      <div 
                        className="h-11 w-11 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center"
                        style={{ borderColor: form.secondaryColor, color: form.secondaryColor }}
                      >
                        <Stamp className="h-4 w-4" />
                        <span className="text-[7px] font-black uppercase leading-none">SEAL</span>
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-700 uppercase block">Official Seal</span>
                      <span className="text-[8px] text-slate-400">ISKCON Verified</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Signature Area */}
              <div className="text-right flex flex-col items-end">
                {form.signatureImage ? (
                  <div className="h-16 sm:h-20 mb-1.5 max-w-[220px] flex items-end">
                    <img
                      src={form.signatureImage}
                      alt="Authorized Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-44 border-b-2 border-slate-400 mb-1.5" />
                )}

                <p className="font-display font-bold text-xs sm:text-sm leading-tight" style={{ color: form.primaryColor }}>
                  {form.signatoryName || "Vaishnava Krupa Das"}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700">
                  {form.signatoryTitle || "Temple President / Authorised Signatory"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">
                  {form.signatoryOrg || "ISKCON Kurnool"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
