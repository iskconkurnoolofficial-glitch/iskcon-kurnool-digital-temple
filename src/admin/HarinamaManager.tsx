import { useState } from "react";
import { useAdmin, uploadToCloudinary, HarinamaData } from "@/context/AdminContext";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "gallery";

export default function HarinamaManager() {
  const { harinama, setHarinama } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<HarinamaData>) => setHarinama({ ...harinama, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "gallery"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab harinama={harinama} update={update} />}
      {tab === "gallery" && <GalleryTab harinama={harinama} update={update} />}
    </div>
  );
}

function SettingsTab({ harinama, update }: { harinama: HarinamaData; update: (p: Partial<HarinamaData>) => void }) {
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
      <h3 className="font-display text-xl font-bold text-primary mb-2">Harinama Sankeerthan Settings</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <UploadBox label="About Section Image" url={harinama.aboutImage} onPick={pickImage} />
          {busy && <p className="text-xs text-muted-foreground animate-pulse">Uploading image…</p>}

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Group / Contact URL</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={harinama.whatsappUrl || ""} 
              onChange={(e) => update({ whatsappUrl: e.target.value })} 
              placeholder="https://chat.whatsapp.com/..." 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram Handle</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={harinama.instagramHandle || ""} 
              onChange={(e) => update({ instagramHandle: e.target.value })} 
              placeholder="iskconkurnool" 
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Schedule Day</label>
              <input 
                className="w-full px-4 py-2.5 border rounded-lg" 
                value={harinama.scheduleDay || ""} 
                onChange={(e) => update({ scheduleDay: e.target.value })} 
                placeholder="Every Saturday" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Schedule Time</label>
              <input 
                className="w-full px-4 py-2.5 border rounded-lg" 
                value={harinama.scheduleTime || ""} 
                onChange={(e) => update({ scheduleTime: e.target.value })} 
                placeholder="5:00 PM onwards" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meeting Point / Route Start Address</label>
            <textarea 
              className="w-full px-4 py-2.5 border rounded-lg" 
              rows={2}
              value={harinama.meetingPoint || ""} 
              onChange={(e) => update({ meetingPoint: e.target.value })} 
              placeholder="ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <label className="block text-sm font-medium mb-1">About Hari Nama Sankeerthana (Paragraphs)</label>
        <textarea 
          className="w-full px-4 py-2.5 border rounded-lg font-sans" 
          rows={6}
          value={harinama.aboutText || ""} 
          onChange={(e) => update({ aboutText: e.target.value })} 
          placeholder="Enter paragraphs explaining Hari Nama..."
        />
        <p className="text-xs text-muted-foreground mt-1">Use double newlines (press Enter twice) to separate paragraphs.</p>
      </div>
    </div>
  );
}

function GalleryTab({ harinama, update }: { harinama: HarinamaData; update: (p: Partial<HarinamaData>) => void }) {
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
    update({ gallery: [...(harinama.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!harinama.gallery) return;
    const j = i + dir;
    if (j < 0 || j >= harinama.gallery.length) return;
    const copy = [...harinama.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  const galleryList = harinama.gallery || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Past Sankeerthana Image</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Upload Image" url={url} onPick={onPick} />
          <div className="space-y-3">
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
        <h3 className="font-display text-xl font-bold text-primary mb-4">Harinama Gallery ({galleryList.length})</h3>
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
