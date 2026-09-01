import { useState } from "react";
import { useAdmin, uploadToCloudinary, HarinamaData } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { Trash2, ArrowUp, ArrowDown, Music2, Eye, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

type Tab = "settings" | "gallery";

export default function HarinamaManager() {
  const { harinama, setHarinama } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<HarinamaData>) => {
    setHarinama({ ...harinama, ...patch });
    toast.success("Harinama details saved!");
  };

  const galleryList = harinama.gallery || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Music2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Harinama Sankirtana Manager</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Nagar Sankirtan
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure street chanting schedules, meeting points, route details, and past Nagar Sankirtan photo galleries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Sankirtan Photos</span>
              <strong className="font-display text-lg text-primary">{galleryList.length}</strong>
            </div>
            <a
              href="/harinama"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Harinama Page
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            tab === "settings"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Schedule & About Details
        </button>
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            tab === "gallery"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Sankirtan Photos Gallery ({galleryList.length})
        </button>
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
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Schedule & Social Links
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <UploadBox label="Sankirtana Section Image" url={harinama.aboutImage} onPick={pickImage} aspect="aspect-video" className="max-w-[200px]" />

            <div>
              <label className={labelClass}>WhatsApp Group URL</label>
              <input 
                className={inputClass} 
                value={harinama.whatsappUrl || ""} 
                onChange={(e) => update({ whatsappUrl: e.target.value })} 
                placeholder="https://chat.whatsapp.com/..." 
              />
            </div>
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input 
                className={inputClass} 
                value={harinama.instagramHandle || ""} 
                onChange={(e) => update({ instagramHandle: e.target.value })} 
                placeholder="iskconkurnool" 
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Schedule Day</label>
                <input 
                  className={inputClass} 
                  value={harinama.scheduleDay || ""} 
                  onChange={(e) => update({ scheduleDay: e.target.value })} 
                  placeholder="e.g. Every Saturday" 
                />
              </div>
              <div>
                <label className={labelClass}>Schedule Time</label>
                <input 
                  className={inputClass} 
                  value={harinama.scheduleTime || ""} 
                  onChange={(e) => update({ scheduleTime: e.target.value })} 
                  placeholder="e.g. 5:00 PM onwards" 
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Meeting Point / Route Start Address</label>
              <textarea 
                className={inputClass} 
                rows={3}
                value={harinama.meetingPoint || ""} 
                onChange={(e) => update({ meetingPoint: e.target.value })} 
                placeholder="e.g. ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple"
              />
              <p className="text-[11px] text-amber-800 font-semibold mt-1">
                💡 Leave any field empty to display <strong>“Details Coming Soon!”</strong> on the public website.
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <label className={labelClass}>About Hari Nama Sankeerthana (Paragraphs)</label>
          <textarea 
            className={inputClass} 
            rows={5}
            value={harinama.aboutText || ""} 
            onChange={(e) => update({ aboutText: e.target.value })} 
            placeholder="Enter paragraphs explaining Hari Nama..."
          />
          <p className="text-xs text-muted-foreground mt-1">Use double newlines (press Enter twice) to separate paragraphs.</p>
        </div>
      </div>
    </div>
  );
}

function GalleryTab({ harinama, update }: { harinama: HarinamaData; update: (p: Partial<HarinamaData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      const u = await uploadToCloudinary(f);
      setUrl(u); 
      toast.success("Photo uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) {
      toast.error("Upload an image first");
      return;
    }
    update({ gallery: [...(harinama.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
    setIsModalOpen(false);
    toast.success("Photo added to sankirtan gallery!");
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
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Sankirtan Photos ({galleryList.length})</h3>
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setLabel("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Sankirtan Photo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {galleryList.map((g, i) => (
          <div key={g.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
              <img src={g.url} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-foreground line-clamp-1">{g.label || "(untitled)"}</div>
              <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => update({ gallery: galleryList.filter((x) => x.id !== g.id) })} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors ml-auto cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Sankirtan Photo"
        subtitle="Upload photos of street chanting, dancing, and mridanga kirtan"
        icon={ImageIcon}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox label="Sankirtan Photo" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Caption / Location (Optional)
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Nagar Sankirtan at Raj Vihar Circle"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !url}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : "Add to Gallery"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
