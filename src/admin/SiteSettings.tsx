import { useState } from "react";
import { useAdmin, uploadToCloudinary, SiteSettings as Settings } from "@/context/AdminContext";

export default function SiteSettingsForm() {
  const { settings, setSettings } = useAdmin();
  const [s, setS] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  const update = (k: keyof Settings, v: string) => setS((prev) => ({ ...prev, [k]: v }));
  const save = () => { setSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const onLogo = async (f: File) => {
    try { const url = await uploadToCloudinary(f); setS((p) => ({ ...p, logo: url })); } catch { alert("Upload failed"); }
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

      <div>
        <span className="text-sm font-medium text-foreground/80 mb-2 block">Logo</span>
        <div className="flex items-center gap-4">
          {s.logo && <img src={s.logo} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary" />}
          <label className="px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary">
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">Save Changes</button>
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
