import { useState } from "react";
import { useAdmin, uploadToCloudinary, GoshalaData } from "@/context/AdminContext";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "gallery";

export default function GoshalaManager() {
  const { goshala, setGoshala } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<GoshalaData>) => setGoshala({ ...goshala, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "gallery"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-white text-foreground hover:bg-muted border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab goshala={goshala} update={update} />}
      {tab === "gallery" && <GalleryTab goshala={goshala} update={update} />}
    </div>
  );
}

function SettingsTab({ goshala, update }: { goshala: GoshalaData; update: (p: Partial<GoshalaData>) => void }) {
  const [busy, setBusy] = useState(false);

  const pickImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      update({ aboutImage: url });
    } catch {
      alert("Upload failed");
    }
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
      <h3 className="font-display text-xl font-bold text-primary mb-2">Goshala Page Settings</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow (e.g. Our Goshala)</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={goshala.eyebrow || ""} 
              onChange={(e) => update({ eyebrow: e.target.value })} 
              placeholder="Our Goshala" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={goshala.title || ""} 
              onChange={(e) => update({ title: e.target.value })} 
              placeholder="Goshala Seva" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={goshala.subtitle || ""} 
              onChange={(e) => update({ subtitle: e.target.value })} 
              placeholder="Maintained by ISKCON Kurnool & Narsaraopeta" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <UploadBox label="Devotional Section Image" url={goshala.aboutImage} onPick={pickImage} aspect="aspect-video" className="max-w-[180px]" />
          {busy && <p className="text-xs text-muted-foreground animate-pulse">Uploading image…</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Call-To-Action Button Label</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={goshala.buttonLabel || ""} 
              onChange={(e) => update({ buttonLabel: e.target.value })} 
              placeholder="Visit Goshala" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Call-To-Action Button Link (URL)</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={goshala.buttonUrl || ""} 
              onChange={(e) => update({ buttonUrl: e.target.value })} 
              placeholder="https://maps.app.goo.gl/..." 
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Intro Paragraph (Vedic tradition cow context)</label>
          <textarea 
            className="w-full px-4 py-2.5 border rounded-lg font-sans text-sm" 
            rows={3}
            value={goshala.aboutText1 || ""} 
            onChange={(e) => update({ aboutText1: e.target.value })} 
            placeholder="In the Vedic tradition, the cow is regarded as a mother..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Middle Paragraph (Below the Gallery)</label>
          <textarea 
            className="w-full px-4 py-2.5 border rounded-lg font-sans text-sm" 
            rows={3}
            value={goshala.aboutText2 || ""} 
            onChange={(e) => update({ aboutText2: e.target.value })} 
            placeholder="This Goshala is not just a shelter..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Conclusion Paragraph (Invitation)</label>
          <textarea 
            className="w-full px-4 py-2.5 border rounded-lg font-sans text-sm" 
            rows={2}
            value={goshala.aboutText3 || ""} 
            onChange={(e) => update({ aboutText3: e.target.value })} 
            placeholder="We invite you to come see this seva in person..."
          />
        </div>
      </div>
    </div>
  );
}

function GalleryTab({ goshala, update }: { goshala: GoshalaData; update: (p: Partial<GoshalaData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      setUrl(await uploadToCloudinary(f)); 
    } catch { 
      alert("Upload failed"); 
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) return alert("Upload an image first");
    update({ gallery: [...(goshala.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!goshala.gallery) return;
    const j = i + dir;
    if (j < 0 || j >= goshala.gallery.length) return;
    const copy = [...goshala.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  const galleryList = goshala.gallery || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Goshala Gallery Image</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <UploadBox label="Upload Image" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[140px] shrink-0" />
          <div className="flex-1 space-y-3">
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              placeholder="Title / Description (optional)" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)} 
            />
            <button 
              disabled={busy} 
              onClick={add} 
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Add Image"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Goshala Gallery ({galleryList.length})</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryList.map((g, i) => (
            <div key={g.id} className="bg-white rounded-xl shadow border overflow-hidden">
              <img src={g.url} alt={g.label} className="w-full aspect-square object-cover" />
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium truncate">{g.label || "(no title)"}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => update({ gallery: galleryList.filter((x) => x.id !== g.id) })} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
