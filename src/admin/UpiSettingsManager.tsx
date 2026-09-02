import { useState, useEffect } from "react";
import { useAdmin, uploadToCloudinary, UpiPaymentSettings, generateUpiUri } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import { 
  QrCode,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Check,
  Save,
  FileText,
  Copy,
  Info
} from "lucide-react";
import { toast } from "sonner";

export default function UpiSettingsManager() {
  const { upiPayment, setUpiPayment } = useAdmin();
  const [upi, setUpi] = useState<UpiPaymentSettings>(upiPayment);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testAmount, setTestAmount] = useState<number>(501);

  useEffect(() => {
    setUpi(upiPayment);
  }, [upiPayment]);

  const updateUpi = (k: keyof UpiPaymentSettings, v: any) => setUpi((prev) => ({ ...prev, [k]: v }));

  const save = () => {
    setUpiPayment(upi);
    setSaved(true);
    toast.success("UPI QR Code & Bank settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const onQrCodeUpload = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Upi");
      updateUpi("customQrImage", url);
      toast.success("Static UPI QR code image uploaded successfully.");
    } catch {
      toast.error("QR image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const previewUpiUri = generateUpiUri({
    upiId: upi.upiId || "iskconkurnool@sbi",
    payeeName: upi.payeeName || "ISKCON Kurnool",
    amount: testAmount,
    transactionNote: `Devotional Offering - ISKCON Kurnool`,
  });

  const previewQrUrl = upi.useDynamicAmountQr !== false || !upi.customQrImage
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(previewUpiUri)}&margin=10`
    : upi.customQrImage;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Header card with Toggle */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-md">
            <QrCode className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>UPI QR &amp; Direct Bank Settings</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            UPI QR &amp; Bank Settings
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Configure the default VPA, payee display title, dynamic QR mode, and instructions for manual bank transfers or QR checkouts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {/* Master Enable/Disable QR Toggle */}
          <div className="bg-white/15 px-4 py-3 rounded-2xl border border-white/15 flex items-center gap-3">
            <span className="text-xs font-black tracking-wider uppercase">UPI QR Mode:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={upi.enabled !== false}
                onChange={(e) => updateUpi("enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/90 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-secondary text-primary hover:bg-amber-300 font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {saved ? <Check className="h-4 w-4 stroke-[3]" /> : <Save className="h-4 w-4" />}
            <span>{saved ? "Saved ✓" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Forms Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Helper Alert Banner on Disable status */}
        {upi.enabled === false && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fade-in">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold">UPI QR Option is currently DISABLED</p>
              <p className="text-slate-700 leading-normal">
                Public donation and seva forms will **skip payment method selection**. Visitors will not see UPI/QR options and clicking "Donate" will instantly launch the Razorpay Online Checkout overlay.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Settings */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                icon={QrCode}
                label="Official Temple UPI ID / VPA *"
                placeholder="e.g. iskconkurnool@sbi"
                value={upi.upiId || ""}
                onChange={(v) => updateUpi("upiId", v)}
                hint="Payments sent to this UPI ID reflect directly in temple bank account."
              />

              <InputField
                icon={Smartphone}
                label="Payee / Account Name *"
                placeholder="e.g. ISKCON Kurnool"
                value={upi.payeeName || ""}
                onChange={(v) => updateUpi("payeeName", v)}
                hint="Displayed as verified receiver in UPI apps."
              />
            </div>

            {/* Dynamic vs Static QR Selector */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Dynamic Amount Pre-Fill QR Mode</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={upi.useDynamicAmountQr !== false}
                    onChange={(e) => updateUpi("useDynamicAmountQr", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                When enabled, the QR code automatically changes to include the exact amount chosen by the devotee (e.g. ₹501, ₹1,008). When scanned in GPay/PhonePe/Paytm, the user doesn't need to manually type the amount!
              </p>
            </div>

            {/* Upload Static QR Fallback Image */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Optional Static QR Image (Fallback / Physical QR Upload)
              </span>
              <UploadBox
                label="Static QR Code Image"
                url={upi.customQrImage || ""}
                onPick={onQrCodeUpload}
                aspect="aspect-square"
                className="w-full max-w-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Upload your bank's physical standee QR code if you want devotees to also view the static QR image.
              </p>
            </div>

            {/* Custom Payment Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Custom Payment Instructions for Devotees</span>
              </label>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                placeholder="Scan using Google Pay, PhonePe, Paytm, BHIM, or any UPI app..."
                value={upi.instructions || ""}
                onChange={(e) => updateUpi("instructions", e.target.value)}
              />
            </div>

            {/* Require UTR Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={upi.requireUtrSubmission !== false}
                onChange={(e) => updateUpi("requireUtrSubmission", e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <span>Ask devotee for 12-digit UPI UTR / Transaction reference number before issuing receipt</span>
            </label>
          </div>

          {/* Right Column: Interactive Real-Time Live Preview */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-amber-50/40 p-5 rounded-3xl border-2 border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                <Smartphone className="h-4 w-4 text-primary" />
                <span>Interactive Live QR Preview</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Live Test
              </span>
            </div>

            {/* Test Amount Slider */}
            <div className="space-y-1.5 text-left bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Simulate Donation Amount:</span>
                <span className="font-black text-base text-primary">₹{testAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="108"
                max="11000"
                step="100"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>₹108</span>
                <span>₹5,000</span>
                <span>₹11,000</span>
              </div>
            </div>

            {/* Simulated Dynamic QR Image */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              <img
                src={previewQrUrl}
                alt="UPI Preview"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg mx-auto"
              />
            </div>

            {/* Auto Amount Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Scanning fills ₹{testAmount.toLocaleString("en-IN")} into UPI app</span>
            </div>

            {/* Generated URI String Box */}
            <div className="text-left bg-slate-900 text-amber-300 p-2.5 rounded-xl text-[10px] font-mono break-all select-all">
              <p className="text-slate-400 uppercase text-[9px] font-sans font-bold mb-0.5">UPI URI Payload:</p>
              {previewUpiUri}
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>All changes take effect in real time across the entire site.</span>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary hover:bg-[#4a2282] text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
        >
          {saved ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : <Save className="h-4.5 w-4.5" />}
          <span>{saved ? "Saved Successfully ✓" : "Save Settings"}</span>
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: any;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span>{label}</span>
      </label>
      <input
        type={type}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="text-[11px] text-muted-foreground mt-1 block">{hint}</span>}
    </div>
  );
}
