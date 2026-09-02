import { useState } from "react";
import { useAdmin, uploadToCloudinary, GoshalaData } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { Trash2, ArrowUp, ArrowDown, HeartHandshake, Eye, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

type Tab = "settings" | "gallery";

export default function GoshalaManager() {
  const { goshala, setGoshala } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<GoshalaData>) => {
    setGoshala({ ...goshala, ...patch });
    toast.success("Goshala details updated!");
  };

  const galleryList = goshala.gallery || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-emerald-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-emerald-500/20 text-emerald-800 rounded-2xl shrink-0 shadow-xs">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Go Seva & Goshala Management</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Surabhi Seva
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage sacred cow protection narratives, location directions, and goshala photo galleries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Gallery Photos</span>
              <strong className="font-display text-lg text-emerald-700">{galleryList.length}</strong>
            </div>
            <a
              href="/goshala"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Goshala Page
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
          Page Narrative & Settings
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
          Goshala Photos Gallery ({galleryList.length})
        </button>
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
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/Goshala");
      update({ aboutImage: url });
      toast.success("Goshala cover image uploaded!");
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
          <Sparkles className="h-5 w-5 text-accent" /> Hero Section & Action Links
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Eyebrow Badge</label>
              <input 
                className={inputClass} 
                value={goshala.eyebrow || ""} 
                onChange={(e) => update({ eyebrow: e.target.value })} 
                placeholder="Our Goshala" 
              />
            </div>
            <div>
              <label className={labelClass}>Main Title</label>
              <input 
                className={inputClass} 
                value={goshala.title || ""} 
                onChange={(e) => update({ title: e.target.value })} 
                placeholder="Goshala Seva" 
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input 
                className={inputClass} 
                value={goshala.subtitle || ""} 
                onChange={(e) => update({ subtitle: e.target.value })} 
                placeholder="Maintained by ISKCON Kurnool & Narsaraopeta" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <UploadBox label="Devotional Section Image" url={goshala.aboutImage} onPick={pickImage} aspect="aspect-video" className="max-w-[200px]" />

            <div>
              <label className={labelClass}>Call-To-Action Button Label</label>
              <input 
                className={inputClass} 
                value={goshala.buttonLabel || ""} 
                onChange={(e) => update({ buttonLabel: e.target.value })} 
                placeholder="Visit Goshala" 
              />
            </div>
            <div>
              <label className={labelClass}>Call-To-Action Button Link (URL)</label>
              <input 
                className={inputClass} 
                value={goshala.buttonUrl || ""} 
                onChange={(e) => update({ buttonUrl: e.target.value })} 
                placeholder="https://maps.app.goo.gl/..." 
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div>
            <label className={labelClass}>Intro Paragraph (Vedic tradition cow context)</label>
            <textarea 
              className={inputClass} 
              rows={3}
              value={goshala.aboutText1 || ""} 
              onChange={(e) => update({ aboutText1: e.target.value })} 
              placeholder="In the Vedic tradition, the cow is regarded as a mother..."
            />
          </div>

          <div>
            <label className={labelClass}>Middle Paragraph (Below the Gallery)</label>
            <textarea 
              className={inputClass} 
              rows={3}
              value={goshala.aboutText2 || ""} 
              onChange={(e) => update({ aboutText2: e.target.value })} 
              placeholder="This Goshala is not just a shelter..."
            />
          </div>

          <div>
            <label className={labelClass}>Conclusion Paragraph (Invitation)</label>
            <textarea 
              className={inputClass} 
              rows={2}
              value={goshala.aboutText3 || ""} 
              onChange={(e) => update({ aboutText3: e.target.value })} 
              placeholder="We invite you to come see this seva in person..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryTab({ goshala, update }: { goshala: GoshalaData; update: (p: Partial<GoshalaData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      const u = await uploadToCloudinary(f, "ISKCON-KURNOOL/Goshala");
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
    update({ gallery: [...(goshala.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
    setIsModalOpen(false);
    toast.success("Photo added to goshala gallery!");
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
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Goshala Photos ({galleryList.length})</h3>
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setLabel("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Goshala Photo
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
        title="Add Goshala Photo"
        subtitle="Upload photos of sacred cows, calves, and surabhi seva"
        icon={ImageIcon}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox label="Goshala Photo" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Caption / Description (Optional)
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Morning Grass Feeding Seva"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !url}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
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
