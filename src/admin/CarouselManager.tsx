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
    <div className="space-y-6 font-sans animate-fade-in">
      {/* SECTION HEADER BANNER */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <Upload className="h-3.5 w-3.5" />
              <span>Homepage Media Slider</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Carousel Banners</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Add, reorder, edit titles, and manage desktop/mobile banners or looping video slides for the main homepage carousel.
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Total Slides</span>
            <span className="text-xl font-extrabold text-white">{slides.length}</span>
          </div>
        </div>
      </div>

      {/* EDIT / ADD SLIDE FORM CARD */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-display text-xl font-bold text-primary">
            {editingId ? "Edit Slide Configuration" : "Add New Hero Banner Slide"}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="h-4 w-4" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <UploadBox
            label="Desktop Image (4917×1750)"
            url={draft.desktop}
            onPick={(f) => upload(f, "desktop")}
            aspect="aspect-video"
            className="w-full"
          />
          <UploadBox
            label="Mobile Image (1080×1350)"
            url={draft.mobile}
            onPick={(f) => upload(f, "mobile")}
            aspect="aspect-[4/5]"
            className="w-full"
          />
          <VideoUploadBox
            label="Video Slide (Optional)"
            url={draft.video}
            onPick={(f) => upload(f, "video")}
            onClear={() => setDraft((d) => ({ ...d, video: undefined }))}
            aspect="aspect-video"
            className="w-full"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Slide Title (Optional)</label>
            <input
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Welcome to ISKCON Kurnool Digital Temple"
              value={draft.title || ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subtitle (Optional)</label>
            <input
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Sri Sri Puri Jagannath Temple"
              value={draft.subtitle || ""}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={busy}
            onClick={save}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {busy ? "Uploading Media..." : editingId ? "Update Slide" : "Add Slide to Carousel"}
          </button>
        </div>
      </div>

      {/* EXISTING SLIDES GRID */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Live Carousel Slides ({slides.length})</h3>
        {slides.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed text-center space-y-2">
            <p className="font-bold text-slate-600 text-sm">No Slides Created</p>
            <p className="text-xs text-slate-400">Use the editor form above to add image or video banners to the homepage carousel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                  editingId === s.id ? "ring-2 ring-primary border-primary shadow-md" : "hover:border-slate-300"
                }`}
              >
                <div className="relative">
                  {s.video ? (
                    <video src={s.video} className="w-full aspect-video object-cover" muted loop playsInline autoPlay />
                  ) : (
                    <img src={s.desktop} alt="" className="w-full aspect-video object-cover" />
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                      s.active ? "bg-emerald-600/90 text-white" : "bg-slate-900/80 text-white/80"
                    }`}>
                      {s.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{s.title || "(Untitled Slide)"}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.subtitle || "No subtitle"}</p>
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === slides.length - 1}
                      className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSlides(slides.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                      title="Toggle Visibility"
                    >
                      {s.active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => startEdit(s)}
                      className="p-2 rounded-xl hover:bg-primary/10 text-primary transition"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSlides(slides.filter((x) => x.id !== s.id))}
                      className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
