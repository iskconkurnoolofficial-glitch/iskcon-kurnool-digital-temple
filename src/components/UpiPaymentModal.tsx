import React, { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  X,
  Info,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  Lock,
  MessageCircle
} from "lucide-react";
import { useAdmin, generateUpiUri, uploadToCloudinary } from "@/context/AdminContext";
import { toast } from "sonner";

export interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  sevaTitle: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  pan?: string;
  notes?: string;
  onPaymentSuccess: (details: {
    utr: string;
    amount: number;
    paymentMethod: string;
    screenshotUrl?: string;
    notes?: string;
  }) => void;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  amount,
  sevaTitle,
  donorName,
  donorEmail,
  donorPhone,
  pan,
  notes: initialNotes,
  onPaymentSuccess,
}: UpiPaymentModalProps) {
  const { upiPayment, settings } = useAdmin();
  
  // Step state: 1 = Scan QR & Pay, 2 = Enter UTR & Upload Screenshot
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1 states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [viewMode, setViewMode] = useState<"dynamic" | "custom">("dynamic");

  // Step 2 states
  const [utrNumber, setUtrNumber] = useState("");
  const [donorNotes, setDonorNotes] = useState(initialNotes || "");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = upiPayment.upiId || "iskconkurnool@sbi";
  const payeeName = upiPayment.payeeName || "ISKCON Kurnool";
  const customQr = upiPayment.customQrImage;

  // Build the official NPCI UPI Deep Link URI with pre-filled amount
  const upiUri = generateUpiUri({
    upiId,
    payeeName,
    amount,
    transactionNote: `${sevaTitle || "Donation"} - ${donorName || "Devotee"}`,
    currency: "INR",
  });

  // Dynamic QR code generation URL
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&data=${encodeURIComponent(
    upiUri
  )}&margin=12`;

  const activeQrSrc = viewMode === "custom" && customQr ? customQr : dynamicQrCodeUrl;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setUtrNumber("");
      setScreenshotUrl("");
      setIsSubmitting(false);
      setIsUploadingImage(false);
      setDonorNotes(initialNotes || "");
      setViewMode(upiPayment.useDynamicAmountQr !== false ? "dynamic" : "custom");
    }
  }, [isOpen, upiPayment.useDynamicAmountQr, initialNotes]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(amount));
    setCopiedAmount(true);
    toast.success("Amount copied to clipboard!");
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleOpenMobileUpi = () => {
    window.location.href = upiUri;
  };

  // Handle Screenshot Upload via Cloudinary
  const handleScreenshotFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Screenshot file size should be less than 10MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setScreenshotUrl(url);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (err) {
      console.error("Screenshot upload failed:", err);
      toast.error("Failed to upload screenshot. You can still proceed by entering your UTR number.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Screenshot removed.");
  };

  // Step 1 ➔ Step 2 Navigation
  const handleProceedToStep2 = () => {
    setCurrentStep(2);
  };

  // Step 2 ➔ Final Submit
  const handleFinalSubmit = () => {
    const trimmedUtr = utrNumber.trim();
    // Made fully optional as per user request (no mandatory Transaction ID or photo upload)
    setIsSubmitting(true);
    const finalUtr = trimmedUtr || `UPI_${Date.now()}`;

    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSuccess({
        utr: finalUtr,
        amount,
        paymentMethod: "UPI QR Payment",
        screenshotUrl: screenshotUrl || undefined,
        notes: donorNotes || undefined,
      });
      toast.success("Payment details submitted successfully!");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-amber-200/80 shadow-2xl relative my-auto">
        
        {/* Top Header Banner with 2-Step Progress Indicator */}
        <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Stepper Pill Badges */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full border border-white/20 text-[11px] font-extrabold uppercase tracking-wider">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === 1 ? "bg-amber-300 text-slate-900" : "bg-emerald-400 text-slate-900"
              }`}>
                {currentStep === 2 ? "✓" : "1"}
              </span>
              <span>Step {currentStep} of 2: {currentStep === 1 ? "Scan & Pay" : "Enter UTR & Proof"}</span>
            </div>

            <span className="text-[11px] text-amber-200 font-semibold hidden sm:inline">
              100% Direct Temple UPI
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {currentStep === 1 ? "Scan UPI QR Code" : "Submit Payment Reference"}
          </h3>
          <p className="text-xs text-white/80 mt-1 line-clamp-1">
            {sevaTitle} · For <span className="font-bold text-amber-200">{donorName || "Devotee"}</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SCAN QR CODE VIEW */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            
            {/* Amount Card with 1-Click Copy */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Donation Amount
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                    ⚡ Auto-Filled
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAmount}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                title="Copy Amount"
              >
                {copiedAmount ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-amber-600" />}
                <span>{copiedAmount ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* QR Code Presentation Box */}
            <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 text-center relative group">
              
              {/* Dynamic vs Custom QR Toggle (if custom static QR uploaded) */}
              {customQr && (
                <div className="flex items-center gap-2 mb-3 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("dynamic")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      viewMode === "dynamic"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ⚡ Dynamic Amount QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("custom")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      viewMode === "custom"
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Static Temple QR
                  </button>
                </div>
              )}

              {/* QR Image Container */}
              <div className="relative p-3.5 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-[240px] sm:max-w-[260px] w-full aspect-square flex items-center justify-center">
                <img
                  src={activeQrSrc}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              {/* Auto Amount Indicator */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Scanning auto-fills ₹{amount.toLocaleString("en-IN")} into your UPI app</span>
              </div>

              {/* Payee Info */}
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p className="font-extrabold text-slate-800">{payeeName}</p>
                <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="font-mono font-bold text-slate-900 select-all">{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-primary hover:text-amber-600 p-1 cursor-pointer transition"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Mobile Direct Deep-Link Button */}
              <div className="w-full mt-4 sm:hidden">
                <button
                  type="button"
                  onClick={handleOpenMobileUpi}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Open in UPI App (GPay / PhonePe)</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </button>
              </div>

              {/* Supported App Logos / Pills */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-blue-600">Google Pay</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-purple-600">PhonePe</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-sky-600">Paytm</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-orange-600">BHIM UPI</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-slate-700">Cred</span>
              </div>

            </div>

            {/* Quick Step Guidance */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Scan the QR code in any UPI app, complete the transaction, then click <strong>“I Have Completed Payment ➔”</strong> to enter your UTR and upload screenshot.
              </p>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <span>I Have Completed Payment ➔ Next Step</span>
                <ArrowRight className="h-5 w-5 opacity-90 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition"
              >
                Cancel / Choose Another Method
              </button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1 border-t border-slate-100">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Official ISKCON Kurnool UPI · 80G Tax Exempted</span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ENTER UTR & UPLOAD SCREENSHOT */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto animate-fade-in">
            
            {/* Back Button & Top Confirmation Pill */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to QR Code</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-800 text-xs font-black">
                <span>Amount: ₹{amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Section 1: UTR / Reference Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>12-Digit UPI Ref No. / UTR ID (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">From UPI App</span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 423819204918"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 24).toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition tracking-widest uppercase"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Found in transaction details of Google Pay, PhonePe, Paytm, BHIM, or your bank app.
              </p>
            </div>

            {/* Section 2: Upload Payment Screenshot (File Upload Box) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>Upload Payment Screenshot (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border">
                  Optional
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleScreenshotFileChange}
                className="hidden"
              />

              {screenshotUrl ? (
                /* Uploaded Thumbnail Preview */
                <div className="relative p-3 rounded-2xl bg-emerald-50/60 border-2 border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={screenshotUrl}
                      alt="Uploaded Screenshot"
                      className="h-14 w-14 object-cover rounded-xl border border-emerald-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Screenshot Attached ✓</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">Ready for admin verification</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove Screenshot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Drop Area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                    isUploadingImage
                      ? "border-emerald-400 bg-emerald-50/50"
                      : "border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20"
                  }`}
                >
                  {isUploadingImage ? (
                    <>
                      <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin" />
                      <p className="text-xs font-bold text-emerald-700">Uploading payment screenshot...</p>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Click or drag to upload payment screenshot (Optional)
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Optional Notes / Sankalpa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sankalpa / Notes for Temple Priests (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. For good health, birthdays, family welfare..."
                value={donorNotes}
                onChange={(e) => setDonorNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || isUploadingImage}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Verifying Details...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 fill-white/20 text-white group-hover:scale-110 transition-transform" />
                    <span>Submit Details ✓</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 py-1 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                <span>— OR —</span>
              </div>

              <a
                href={`https://wa.me/${(settings.whatsapp || "9505377520").replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hare Krishna! I have made a UPI donation of ₹${amount} for "${sevaTitle}".\nDevotee: ${donorName}\nUTR/Txn ID: ${utrNumber || "Not entered"}\nGotram/Notes: ${donorNotes || "None"}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl border-2 border-emerald-500 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-700 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="h-4.5 w-4.5 text-emerald-600" />
                <span>Send Details via WhatsApp (Quick)</span>
              </a>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to QR Code</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1 border-t border-slate-100">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct Bank Transfer · Recorded Securely</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
