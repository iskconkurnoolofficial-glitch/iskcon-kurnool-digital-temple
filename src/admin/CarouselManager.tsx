import { useState } from "react";
import { useAdmin, uploadToCloudinary, Slide } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Pencil, X, Play } from "lucide-react";

export default function CarouselManager() {
  const { slides, setSlides } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Slide>>({ title: "", subtitle: "", active: true });

  const upload = async (file: File, key: "desktop" | "mobile" | "video") => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, [key]: url }));
    } catch (e) { alert("Upload failed"); }
    setBusy(false);
  };

  const resetForm = () => { setDraft({ title: "", subtitle: "", active: true }); setEditingId(null); };

  const save = () => {
    if (!draft.desktop && !draft.video) { alert("Upload a desktop image or a video first"); return; }
    if (editingId) {
      setSlides(slides.map((s) => s.id === editingId ? { ...s, ...draft, desktop: draft.desktop || "", mobile: draft.mobile || draft.desktop || "" } as Slide : s));
    } else {
      setSlides([...slides, {
        id: Date.now().toString(),
        desktop: draft.desktop || "",
        mobile: draft.mobile || draft.desktop || "",
        video: draft.video,
        title: draft.title, subtitle: draft.subtitle,
        active: true,
      }]);
    }
    resetForm();
  };

  const startEdit = (s: Slide) => {
    setEditingId(s.id);
    setDraft({ ...s });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const copy = [...slides];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setSlides(copy);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-primary">{editingId ? "Edit Slide" : "Add New Slide"}</h3>
          {editingId && (
            <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><X className="h-4 w-4" /> Cancel</button>
          )}
        </div>
        <div className="flex flex-wrap gap-6 mb-4">
          <UploadBox label="Desktop Image (4917×1750)" url={draft.desktop} onPick={(f) => upload(f, "desktop")} aspect="aspect-video" className="w-full max-w-[180px]" />
          <UploadBox label="Mobile Image (1080×1350)" url={draft.mobile} onPick={(f) => upload(f, "mobile")} aspect="aspect-[4/5]" className="w-full max-w-[130px]" />
          <VideoUploadBox label="Video (optional)" url={draft.video} onPick={(f) => upload(f, "video")} onClear={() => setDraft((d) => ({ ...d, video: undefined }))} aspect="aspect-video" className="w-full max-w-[180px]" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <input className="px-4 py-2.5 border rounded-lg" placeholder="Title (optional)" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className="px-4 py-2.5 border rounded-lg" placeholder="Subtitle (optional)" value={draft.subtitle || ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
        </div>
        <button disabled={busy} onClick={save} className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
          {busy ? "Uploading..." : editingId ? "Update Slide" : "Add Slide"}
        </button>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Existing Slides ({slides.length})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s, i) => (
            <div key={s.id} className={`bg-white rounded-xl shadow border overflow-hidden ${editingId === s.id ? "ring-2 ring-accent" : ""}`}>
              {s.video ? (
                <video src={s.video} className="w-full aspect-video object-cover" muted loop playsInline />
              ) : (
                <img src={s.desktop} alt="" className="w-full aspect-video object-cover" />
              )}
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium truncate">{s.title || "(no title)"}</div>
                <div className="text-xs text-muted-foreground truncate">{s.subtitle}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => setSlides(slides.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))} className="p-2 rounded hover:bg-muted" aria-label="Toggle visible">
                    {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => startEdit(s)} className="p-2 rounded hover:bg-accent/10 text-accent" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setSlides(slides.filter((x) => x.id !== s.id))} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadBox({ 
  label, 
  url, 
  onPick,
  aspect = "aspect-video",
  className = ""
}: { 
  label: string; 
  url?: string; 
  onPick: (f: File) => void;
  aspect?: string;
  className?: string;
}) {
  return (
    <div className={`block ${className}`}>
      <span className="text-sm font-semibold text-foreground/80 mb-1.5 block">{label}</span>
      <label className="relative block cursor-pointer group">
        <div className={`relative ${aspect} bg-slate-50/80 rounded-xl border-2 border-dashed border-border/80 overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:bg-primary/[0.01] shadow-sm`}>
          {url ? (
            <>
              <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {/* Premium Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 text-white font-bold text-xs">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Pencil className="h-4 w-4" />
                </div>
                <span>Change Image</span>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground space-y-1 select-none">
              <div className="p-3 rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition duration-300 inline-block">
                <Upload className="h-5 w-5 mx-auto" />
              </div>
              <p className="text-xs font-semibold text-foreground/75">Click to upload</p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG or WEBP</p>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
        </div>
      </label>
    </div>
  );
}

export function VideoUploadBox({ 
  label, 
  url, 
  onPick, 
  onClear,
  aspect = "aspect-video",
  className = ""
}: { 
  label: string; 
  url?: string; 
  onPick: (f: File) => void; 
  onClear: () => void;
  aspect?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-sm font-semibold text-foreground/80 mb-1.5 block">{label}</span>
      <div className={`relative ${aspect} bg-slate-50/80 rounded-xl border-2 border-dashed border-border/80 overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:bg-primary/[0.01] shadow-sm group`}>
        {url ? (
          <>
            <video src={url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline autoPlay />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
              <Play className="h-7 w-7 text-white" />
            </div>
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-destructive shadow-sm hover:bg-destructive hover:text-white transition duration-200"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4 text-center text-muted-foreground space-y-1 select-none">
            <div className="p-3 rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition duration-300 inline-block">
              <Upload className="h-5 w-5 mx-auto" />
            </div>
            <p className="text-xs font-semibold text-foreground/75">Click to upload video</p>
            <p className="text-[10px] text-muted-foreground">MP4 or WEBM (optional)</p>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
}
