import { useState, useEffect } from "react";
import { useAdmin, uploadToCloudinary, SiteSettings as Settings, UpiPaymentSettings, generateUpiUri } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Instagram, 
  Youtube, 
  Facebook, 
  Twitter,
  MapPin, 
  Navigation, 
  Globe, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Lock, 
  Calendar, 
  Save, 
  FileText, 
  ShieldCheck,
  QrCode,
  Smartphone,
  IndianRupee,
  Copy,
  Sliders,
  CheckCircle2,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

export default function SiteSettingsForm() {
  const { settings, setSettings, upiPayment, setUpiPayment } = useAdmin();
  const [s, setS] = useState<Settings>(settings);
  const [upi, setUpi] = useState<UpiPaymentSettings>(upiPayment);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testAmount, setTestAmount] = useState<number>(501);

  useEffect(() => {
    setS(settings);
  }, [settings]);

  useEffect(() => {
    setUpi(upiPayment);
  }, [upiPayment]);

  const update = (k: keyof Settings, v: any) => setS((prev) => ({ ...prev, [k]: v }));
  const updateUpi = (k: keyof UpiPaymentSettings, v: any) => setUpi((prev) => ({ ...prev, [k]: v }));

  const save = () => {
    setSettings(s);
    setUpiPayment(upi);
    setSaved(true);
    toast.success("Site & UPI Payment Settings saved! All changes updated in real time.");
    setTimeout(() => setSaved(false), 2500);
  };

  const onLogo = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Settings");
      setS((p) => ({ ...p, logo: url }));
      toast.success("Logo uploaded successfully.");
    } catch {
      toast.error("Logo upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onWelcomeImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Settings");
      setS((p) => ({ ...p, welcomeImage: url }));
      toast.success("Welcome section image uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onQuickDonateImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Settings");
      setS((p) => ({ ...p, quickDonateImage: url }));
      toast.success("Quick donate image uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onQrCodeUpload = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Upi");
      setUpi((p) => ({ ...p, customQrImage: url }));
      toast.success("Static UPI QR code image uploaded successfully.");
    } catch {
      toast.error("QR image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const previewUpiUri = generateUpiUri({
    upiId: (upi.upiId || "").trim(),
    payeeName: upi.payeeName || "ISKCON Kurnool",
    amount: testAmount,
    transactionNote: `Devotional Offering - ISKCON Kurnool`,
  });

  const previewQrUrl = upi.useDynamicAmountQr !== false || !upi.customQrImage
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(previewUpiUri)}&margin=10`
    : upi.customQrImage;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>Central Site-Wide Master Control</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Site Settings
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            When you update your phone number, WhatsApp, social channels, maps link, address, or logo here, it instantly updates across every single page and component on the entire website!
          </p>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-secondary text-primary hover:bg-amber-300 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          {saved ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : <Save className="h-4.5 w-4.5" />}
          <span>{saved ? "Saved ✓" : "Save All Changes"}</span>
        </button>
      </div>

      {/* SECTION 1: CONTACT NUMBERS & EMAIL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Temple Contact Numbers &amp; Email</h3>
            <p className="text-xs text-muted-foreground">Connected to navbar, footer, contact page, floating call buttons, and receipt printouts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <InputField
            icon={Phone}
            label="Phone Number"
            placeholder="e.g. +91 95053 77520"
            value={s.phone}
            onChange={(v) => update("phone", v)}
            hint="Used for click-to-call links across the site."
          />

          <InputField
            icon={MessageCircle}
            label="WhatsApp Number / Link"
            placeholder="e.g. +91 95053 77520 or 919505377520"
            value={s.whatsapp}
            onChange={(v) => update("whatsapp", v)}
            hint="Controls the Floating WhatsApp button and all chat links."
          />

          <InputField
            icon={Mail}
            label="Email Address"
            type="email"
            placeholder="e.g. info@iskconkurnool.org"
            value={s.email}
            onChange={(v) => update("email", v)}
            hint="Displayed in footer, contact form, and official communications."
          />
        </div>
      </div>

      {/* SECTION 2: SOCIAL MEDIA CHANNELS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Official Social Media Channels</h3>
            <p className="text-xs text-muted-foreground">Updated in the footer, mobile navigation drawer, social reels bar, and connect sections.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <InputField
            icon={Instagram}
            label="Instagram Profile URL"
            placeholder="https://instagram.com/iskcon_kurnool"
            value={s.instagram}
            onChange={(v) => update("instagram", v)}
          />

          <InputField
            icon={Youtube}
            label="YouTube Channel URL"
            placeholder="https://youtube.com/@iskconkurnool"
            value={s.youtube}
            onChange={(v) => update("youtube", v)}
          />

          <InputField
            icon={Facebook}
            label="Facebook Page URL"
            placeholder="https://facebook.com/iskconkurnool"
            value={s.facebook || ""}
            onChange={(v) => update("facebook", v)}
          />

          <InputField
            icon={Twitter}
            label="Twitter / X Profile URL"
            placeholder="https://twitter.com/iskconkurnool"
            value={s.twitter || ""}
            onChange={(v) => update("twitter", v)}
          />
        </div>
      </div>

      {/* SECTION 3: LOCATION & MAPS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Temple Physical Location &amp; Google Maps</h3>
            <p className="text-xs text-muted-foreground">Governs the interactive map, directions buttons, and full physical address.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            icon={Navigation}
            label="Google Maps Direct Link / Share URL"
            placeholder="https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9"
            value={s.googleMapUrl || ""}
            onChange={(v) => update("googleMapUrl", v)}
            hint="Opens Google Maps directly when devotees click 'Open in Maps'."
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Google Maps Embed Iframe URL</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={s.mapEmbed}
              onChange={(e) => update("mapEmbed", e.target.value)}
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              From Google Maps → Share → Embed a map → copy only the `src="..."` URL.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>Full Temple Physical Address</span>
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            placeholder="ISKCON Kurnool, Sri Sri Jagannath Baladev Subhadra Temple..."
            value={s.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 4: BRANDING, LOGOS & VISUAL ASSETS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Temple Logo, Footer &amp; Homepage Images</h3>
            <p className="text-xs text-muted-foreground">Upload and manage visual assets displayed across the entire site.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Temple Logo</span>
            <UploadBox
              label="Temple Logo"
              url={s.logo}
              onPick={onLogo}
              aspect="aspect-square"
              className="w-full"
            />
            <p className="text-[11px] text-muted-foreground">Used in header, navbar, footer, admin login, and PDF receipts.</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Homepage Welcome Image</span>
            <UploadBox
              label="Welcome Section"
              url={s.welcomeImage || ""}
              onPick={onWelcomeImage}
              aspect="aspect-[4/3]"
              className="w-full"
            />
            <p className="text-[11px] text-muted-foreground">Featured in the home Welcome to ISKCON Kurnool intro block.</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Quick Donate Section Image</span>
            <UploadBox
              label="Quick Donate Right"
              url={s.quickDonateImage || ""}
              onPick={onQuickDonateImage}
              aspect="aspect-square"
              className="w-full"
            />
            <p className="text-[11px] text-muted-foreground">Featured in the right side card of Quick Donation.</p>
          </div>
        </div>

        <div className="pt-2">
          <InputField
            icon={FileText}
            label="Footer Copyright &amp; Legal Text"
            placeholder="© 2025 ISKCON Kurnool. All Rights Reserved."
            value={s.footer}
            onChange={(v) => update("footer", v)}
          />
        </div>
      </div>





      {/* Floating / Bottom Sticky Save Bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>All changes take effect in real time across the entire site upon saving.</span>
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
