import { useState } from "react";
import { useAdmin, uploadToCloudinary, Seva, SevaPrice } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, Upload, HandHeart, Pencil, X, Plus, 
  ArrowUp, ArrowDown, IndianRupee, Sparkles, HeartHandshake, Search 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

function emptyDraft(): Partial<Seva> {
  return { title: "", description: "", prices: [{ label: "Per Day", amount: 101 }], active: true };
}

export default function SevasManager() {
  const { sevas, setSevas } = useAdmin();
  const [draft, setDraft] = useState<Partial<Seva>>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, thumbnail: url }));
      toast.success("Thumbnail uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const resetForm = () => { 
    setDraft(emptyDraft()); 
    setEditingId(null); 
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const prices = draft.prices || [];
  const setPrice = (i: number, p: Partial<SevaPrice>) =>
    setDraft({ ...draft, prices: prices.map((x, idx) => idx === i ? { ...x, ...p } : x) });
  const addPrice = () => setDraft({ ...draft, prices: [...prices, { label: "", amount: 0 }] });
  const removePrice = (i: number) => setDraft({ ...draft, prices: prices.filter((_, idx) => idx !== i) });

  const save = () => {
    if (!draft.title?.trim()) { 
      toast.error("Title is required"); 
      return; 
    }
    const cleanPrices = (draft.prices || []).filter((p) => p.label.trim() && Number(p.amount) > 0)
      .map((p) => ({ label: p.label.trim(), amount: Number(p.amount) }));
    if (cleanPrices.length === 0) { 
      toast.error("Add at least one valid price option"); 
      return; 
    }

    const generatedSlug = draft.slug?.trim() || draft.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || Date.now().toString();

    if (editingId) {
      setSevas(sevas.map((s) => s.id === editingId ? { ...s, ...draft, slug: generatedSlug, prices: cleanPrices } as Seva : s));
      toast.success("Seva updated successfully!");
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
        slug: generatedSlug,
      };
      setSevas([...sevas, item]);
      toast.success("✨ New seva added successfully!");
    }
    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (s: Seva) => {
    setEditingId(s.id);
    setDraft({ ...s, prices: s.prices.map((p) => ({ ...p })) });
    setIsModalOpen(true);
  };

  const sorted = [...sevas].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filtered = sorted.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const ao = a.order, bo = b.order;
    setSevas(sevas.map((s) => s.id === a.id ? { ...s, order: bo } : s.id === b.id ? { ...s, order: ao } : s));
  };

  const remove = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setSevas(sevas.filter((s) => s.id !== id));
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Seva removed");
    }
  };

  const totalCount = sevas.length;
  const activeCount = sevas.filter((s) => s.active !== false).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <HandHeart className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Jagannath Sevas Manager</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Nitya Sevas
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure temple donation and seva opportunities such as Bhoga Seva, Pushpalankara, Deepa Daan, and Deity Abhishek.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Sevas</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Active Sevas</span>
              <strong className="font-display text-lg text-green-600">{activeCount}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Seva
            </button>
            <a
              href="/sevas"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Live
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sevas by name or description..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none text-xs sm:text-sm shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s, idx) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-slate-100 text-slate-400">
                    <HandHeart className="h-10 w-10 opacity-40" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-sans text-xs font-bold px-2.5 py-1 rounded-full">
                  #{idx + 1}
                </span>
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  s.active !== false ? "bg-green-600 text-white" : "bg-slate-700 text-white"
                }`}>
                  {s.active !== false ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h4 className="font-display font-bold text-base text-foreground line-clamp-1">
                  {s.title}
                </h4>
                {s.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {s.prices?.map((p, i) => (
                    <span key={i} className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg">
                      {p.label}: ₹{p.amount}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(s.id, -1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(s.id, 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setSevas(sevas.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    s.active !== false ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-muted-foreground"
                  }`}
                  title={s.active !== false ? "Hide from website" : "Make active"}
                >
                  {s.active !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startEdit(s)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(s.id, s.title)}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Seva"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Jagannath Seva" : "Add New Jagannath Seva"}
        subtitle="Manage seva title, cover thumbnail, description, and donation pricing tiers"
        icon={HandHeart}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-[140px,1fr] gap-5 items-start">
            <UploadBox
              label="Thumbnail"
              url={draft.thumbnail}
              onPick={upload}
              aspect="aspect-square"
              className="w-full max-w-[130px]"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Seva Title <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={draft.title || ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Sri Jagannath Rajbhoga Seva"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Custom URL Slug
                </label>
                <input
                  className="w-full px-3.5 py-2 border rounded-xl bg-white text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={draft.slug || ""}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="e.g. rajbhoga-seva"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Short Description / Significance
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={draft.description || ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Describe the transcendental benefit of offering this sacred seva..."
            />
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                Pricing & Donation Options
              </label>
              <button
                type="button"
                onClick={addPrice}
                className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {prices.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={p.label}
                    onChange={(e) => setPrice(i, { label: e.target.value })}
                    placeholder="Tier Label (e.g. 1 Day / 1 Month / Special)"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">₹</span>
                    <input
                      type="number"
                      className="w-full pl-7 pr-3 py-2 border rounded-xl text-xs font-sans font-bold bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      value={p.amount}
                      onChange={(e) => setPrice(i, { amount: Number(e.target.value) })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrice(i)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove Tier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>Published Live on Website</span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : (editingId ? "Save Seva Changes" : "Add Seva")}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
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
