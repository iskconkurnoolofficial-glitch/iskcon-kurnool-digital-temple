import { useState } from "react";
import { useAdmin, uploadToCloudinary, Slide } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Pencil, X } from "lucide-react";

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
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Desktop Image (4917×1750)" url={draft.desktop} onPick={(f) => upload(f, "desktop")} />
          <UploadBox label="Mobile Image (1080×1350)" url={draft.mobile} onPick={(f) => upload(f, "mobile")} />
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
              <img src={s.desktop} alt="" className="w-full aspect-video object-cover" />
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

export function UploadBox({ label, url, onPick }: { label: string; url?: string; onPick: (f: File) => void }) {
  return (
    <label className="block cursor-pointer">
      <span className="text-sm font-medium text-foreground/80 mb-1 block">{label}</span>
      <div className="relative aspect-video bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden grid place-items-center hover:border-primary transition">
        {url ? <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" /> : (
          <div className="text-center text-muted-foreground">
            <Upload className="h-6 w-6 mx-auto mb-1" />
            <span className="text-xs">Click to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
      </div>
    </label>
  );
}
