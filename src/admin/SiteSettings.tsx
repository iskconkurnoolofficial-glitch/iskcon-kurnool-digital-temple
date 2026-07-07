import { useState, useEffect } from "react";
import { useAdmin, uploadToCloudinary, SiteSettings as Settings } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";

export default function SiteSettingsForm() {
  const { settings, setSettings } = useAdmin();
  const [s, setS] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setS(settings);
  }, [settings]);

  const update = (k: keyof Settings, v: string) => setS((prev) => ({ ...prev, [k]: v }));
  const save = () => { setSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const onLogo = async (f: File) => {
    try { const url = await uploadToCloudinary(f); setS((p) => ({ ...p, logo: url })); } catch { alert("Upload failed"); }
  };

  const onWelcomeImage = async (f: File) => {
    try { const url = await uploadToCloudinary(f); setS((p) => ({ ...p, welcomeImage: url })); } catch { alert("Upload failed"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border space-y-6 max-w-3xl">
      <h3 className="font-display text-xl font-bold text-primary">Site Settings</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Phone Number" value={s.phone} onChange={(v) => update("phone", v)} />
        <Input label="WhatsApp Number" value={s.whatsapp} onChange={(v) => update("whatsapp", v)} />
        <Input label="Email Address" type="email" value={s.email} onChange={(v) => update("email", v)} />
        <Input label="Instagram URL" value={s.instagram} onChange={(v) => update("instagram", v)} />
        <Input label="YouTube Channel URL" value={s.youtube} onChange={(v) => update("youtube", v)} />
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground/80 mb-1 block">Google Maps Embed URL</span>
        <input className="w-full px-4 py-2.5 border rounded-lg" value={s.mapEmbed} onChange={(e) => update("mapEmbed", e.target.value)} />
        <span className="text-xs text-muted-foreground">Use the iframe src from Google Maps → Share → Embed.</span>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground/80 mb-1 block">Temple Address</span>
        <textarea className="w-full px-4 py-2.5 border rounded-lg" rows={4} value={s.address} onChange={(e) => update("address", e.target.value)} />
      </label>

      <Input label="Footer Copyright Text" value={s.footer} onChange={(v) => update("footer", v)} />

      <div className="flex flex-col sm:flex-row gap-6 border-t pt-4">
        <UploadBox
          label="Temple Logo"
          url={s.logo}
          onPick={onLogo}
          aspect="aspect-square"
          className="w-20 shrink-0"
        />

        <UploadBox
          label="Homepage Welcome Image"
          url={s.welcomeImage || ""}
          onPick={onWelcomeImage}
          aspect="aspect-[4/3]"
          className="max-w-[200px] w-full"
        />
      </div>

      {/* Coming Soon / Launch Page Settings */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-display text-base font-bold text-primary">Coming Soon Launch Page</h4>
        
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={!!s.launchPageActive}
            onChange={(e) => setS((prev) => ({ ...prev, launchPageActive: e.target.checked }))}
            className="h-4.5 w-4.5 rounded text-accent focus:ring-accent border-border"
          />
          <span className="text-sm font-semibold text-foreground/80">Enable Coming Soon Page (Locks Website)</span>
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80 mb-1 block">Launch Date & Time</span>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 border rounded-lg font-medium text-foreground bg-white"
              value={s.launchDate ? s.launchDate.substring(0, 16) : ""}
              onChange={(e) => update("launchDate", e.target.value)}
            />
            <span className="text-xs text-muted-foreground">Select when the website will officially launch.</span>
          </label>

          <Input
            label="Launch Bypass Passcode"
            value={s.launchBypassCode || "108"}
            onChange={(v) => update("launchBypassCode", v)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <button onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer">Save Changes</button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/80 mb-1 block">{label}</span>
      <input type={type} className="w-full px-4 py-2.5 border rounded-lg" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
