import { useState } from "react";
import { useAdmin, uploadToCloudinary, Seva, SevaPrice } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, Upload, HandHeart, Pencil, X, Plus, ArrowUp, ArrowDown, IndianRupee } from "lucide-react";

function emptyDraft(): Partial<Seva> {
  return { title: "", description: "", prices: [{ label: "Per Day", amount: 101 }], active: true };
}

export default function SevasManager() {
  const { sevas, setSevas } = useAdmin();
  const [draft, setDraft] = useState<Partial<Seva>>(emptyDraft());
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

  const prices = draft.prices || [];
  const setPrice = (i: number, p: Partial<SevaPrice>) =>
    setDraft({ ...draft, prices: prices.map((x, idx) => idx === i ? { ...x, ...p } : x) });
  const addPrice = () => setDraft({ ...draft, prices: [...prices, { label: "", amount: 0 }] });
  const removePrice = (i: number) => setDraft({ ...draft, prices: prices.filter((_, idx) => idx !== i) });

  const save = () => {
    if (!draft.title) { alert("Title is required"); return; }
    const cleanPrices = (draft.prices || []).filter((p) => p.label.trim() && Number(p.amount) > 0)
      .map((p) => ({ label: p.label.trim(), amount: Number(p.amount) }));
    if (cleanPrices.length === 0) { alert("Add at least one valid price option"); return; }

    if (editingId) {
      setSevas(sevas.map((s) => s.id === editingId ? { ...s, ...draft, prices: cleanPrices } as Seva : s));
    } else {
      const maxOrder = sevas.reduce((m, s) => Math.max(m, s.order ?? 0), 0);
      const item: Seva = {
        id: Date.now().toString(),
        thumbnail: draft.thumbnail || "",
        title: draft.title!,
        description: draft.description || "",
        prices: cleanPrices,
        order: maxOrder + 1,
        active: draft.active ?? true,
      };
      setSevas([...sevas, item]);
    }
    resetForm();
  };

  const startEdit = (s: Seva) => {
    setEditingId(s.id);
    setDraft({ ...s, prices: s.prices.map((p) => ({ ...p })) });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sorted = [...sevas].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const ao = a.order, bo = b.order;
    setSevas(sevas.map((s) => s.id === a.id ? { ...s, order: bo } : s.id === b.id ? { ...s, order: ao } : s));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-elegant p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-accent" /> {editingId ? "Edit Seva" : "Add Jagannath Seva"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><X className="h-4 w-4" /> Cancel</button>
          )}
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-foreground/80 mb-1 block">Thumbnail (1080 × 1080px)</span>
            <div className="relative aspect-square bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden grid place-items-center hover:border-primary transition">
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

          <div className="grid gap-3">
            <Field label="Title">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Sri Jagannath Bhoga Seva" />
            </Field>
            <Field label="Short Description">
              <textarea rows={2} className="w-full px-3 py-2.5 border rounded-lg resize-none" value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Offer sanctified food to the Lord..." />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground/80">Price Options</span>
                <button type="button" onClick={addPrice} className="text-xs text-primary inline-flex items-center gap-1 hover:underline"><Plus className="h-3 w-3" /> Add option</button>
              </div>
              <div className="space-y-2">
                {prices.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={p.label} onChange={(e) => setPrice(i, { label: e.target.value })} placeholder="Label (e.g. Per Day)" />
                    <div className="relative w-32">
                      <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input type="number" min={1} className="w-full pl-7 pr-2 py-2 border rounded-lg text-sm" value={p.amount || ""} onChange={(e) => setPrice(i, { amount: Number(e.target.value) })} placeholder="Amount" />
                    </div>
                    <button type="button" onClick={() => removePrice(i)} className="p-2 rounded hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button disabled={busy} onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                {busy ? "Uploading..." : editingId ? "Update Seva" : "Add Seva"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Sevas ({sevas.length})</h3>
        {sevas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border">No sevas yet. Add your first one above.</div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((s, idx) => (
              <div key={s.id} className="bg-white rounded-xl shadow border overflow-hidden flex flex-col">
                <div className="relative aspect-square bg-muted">
                  {s.thumbnail ? (
                    <img src={s.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground"><HandHeart className="h-8 w-8" /></div>
                  )}
                  {!s.active && <span className="absolute top-2 left-2 bg-muted-foreground/80 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">Hidden</span>}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <div className="font-semibold text-foreground line-clamp-1">{s.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.prices.map((p, i) => (
                      <span key={i} className="text-[11px] bg-secondary/20 text-foreground px-2 py-0.5 rounded-full">{p.label} · ₹{p.amount}</span>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-auto pt-2 items-center">
                    <button onClick={() => move(s.id, -1)} disabled={idx === 0} className="p-2 rounded hover:bg-muted disabled:opacity-30" aria-label="Up"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(s.id, 1)} disabled={idx === sorted.length - 1} className="p-2 rounded hover:bg-muted disabled:opacity-30" aria-label="Down"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={() => setSevas(sevas.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))} className="p-2 rounded hover:bg-muted" aria-label="Toggle">
                      {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => startEdit(s)} className="p-2 rounded hover:bg-accent/10 text-accent" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setSevas(sevas.filter((x) => x.id !== s.id))} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
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
