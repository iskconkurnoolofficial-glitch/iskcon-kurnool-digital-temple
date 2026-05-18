import { useState } from "react";
import { useAdmin, uploadToCloudinary, Festival } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, Upload, Sparkles, Calendar, Link as LinkIcon, Pencil, X } from "lucide-react";

function emptyDraft(): Partial<Festival> {
  return { title: "", date: "", donateUrl: "", active: true };
}

function fmt(d: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return d; }
}

export default function FestivalsManager() {
  const { festivals, setFestivals } = useAdmin();
  const [draft, setDraft] = useState<Partial<Festival>>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, thumbnail: url }));
    } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const resetForm = () => { setDraft(emptyDraft()); setEditingId(null); };

  const save = () => {
    if (!draft.title || !draft.date) { alert("Title and Date are required"); return; }
    if (editingId) {
      setFestivals(festivals.map((f) => f.id === editingId ? { ...f, ...draft } as Festival : f));
    } else {
      const item: Festival = {
        id: Date.now().toString(),
        thumbnail: draft.thumbnail || "",
        title: draft.title!,
        date: draft.date!,
        donateUrl: draft.donateUrl || "/donate",
        active: draft.active ?? true,
      };
      setFestivals([item, ...festivals]);
    }
    resetForm();
  };

  const startEdit = (f: Festival) => {
    setEditingId(f.id);
    setDraft({ ...f });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sorted = [...festivals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-elegant p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> {editingId ? "Edit Festival" : "Add Upcoming Festival"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><X className="h-4 w-4" /> Cancel</button>
          )}
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-foreground/80 mb-1 block">Thumbnail (1280 × 720px)</span>
            <div className="relative aspect-video bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden grid place-items-center hover:border-primary transition">
              {draft.thumbnail ? (
                <img src={draft.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </div>
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Janmashtami Celebration" />
            </Field>
            <Field label="Date">
              <input type="date" className="w-full px-3 py-2.5 border rounded-lg" value={draft.date || ""} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Donate URL" className="sm:col-span-2">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.donateUrl || ""} onChange={(e) => setDraft({ ...draft, donateUrl: e.target.value })} placeholder="/donate or https://..." />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <button disabled={busy} onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                {busy ? "Uploading..." : editingId ? "Update Festival" : "Add Festival"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Festivals ({festivals.length})</h3>
        {festivals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border">No festivals yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {sorted.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow border overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-muted">
                  {f.thumbnail ? (
                    <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground"><Sparkles className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <div className="font-semibold text-foreground line-clamp-1">{f.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(f.date)}</div>
                  {f.donateUrl && (
                    <div className="text-xs text-primary inline-flex items-center gap-1 truncate"><LinkIcon className="h-3 w-3" /> {f.donateUrl}</div>
                  )}
                  <div className="flex gap-1 mt-auto pt-2">
                    <button onClick={() => setFestivals(festivals.map((x) => x.id === f.id ? { ...x, active: !x.active } : x))} className="p-2 rounded hover:bg-muted" aria-label="Toggle">
                      {f.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => setFestivals(festivals.filter((x) => x.id !== f.id))} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"><Trash2 className="h-4 w-4" /></button>
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

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-foreground/80 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
