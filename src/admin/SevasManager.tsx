import { useState, useEffect, useMemo } from "react";
import { useAdmin, uploadToCloudinary, Seva, SevaPrice, getSevaCategories, getSevaFestivalIds } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, Upload, HandHeart, Pencil, X, Plus, 
  ArrowUp, ArrowDown, IndianRupee, Sparkles, HeartHandshake, Search,
  Tag, FolderPlus, Check
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export const DEFAULT_SEVA_CATEGORIES = [
  "Regular Sevas",
  "Janmashtami Sevas",
  "Radhashtami Sevas",
  "Gaur Purnima Sevas",
  "Ratha Yatra Sevas",
  "Annadana Sevas",
  "Deity Worship Sevas",
  "Temple Construction",
  "Special Occasions"
];

function emptyDraft(): Partial<Seva> {
  return { 
    title: "", 
    description: "", 
    category: "Regular Sevas",
    categories: ["Regular Sevas"],
    prices: [{ label: "", amount: 516 }], 
    active: true,
    thumbnail: "",
    slug: "",
    festivalId: undefined,
    festivalIds: []
  };
}

export default function SevasManager() {
  const { sevas, setSevas, festivals } = useAdmin();
  const [draft, setDraft] = useState<Partial<Seva>>(emptyDraft());
  const [pricingMode, setPricingMode] = useState<"single" | "multiple">("single");
  const [singleAmount, setSingleAmount] = useState<number>(516);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [inlineNewCat, setInlineNewCat] = useState("");
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatInput, setEditCatInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Master Categories State (persisted)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("iskcon_seva_custom_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SEVA_CATEGORIES;
  });

  const addExtraCategory = (name: string) => {
    const clean = name.trim();
    if (!clean) {
      toast.error("Please enter a category name");
      return;
    }
    if (customCategories.some(c => c.toLowerCase() === clean.toLowerCase())) {
      toast.error(`Category "${clean}" already exists`);
      return;
    }
    const updated = [...customCategories, clean];
    setCustomCategories(updated);
    try {
      localStorage.setItem("iskcon_seva_custom_categories", JSON.stringify(updated));
    } catch (e) {}
    toast.success(`✨ Category "${clean}" added!`);
    setNewCatInput("");
  };

  const toggleCategory = (cat: string) => {
    const current = getSevaCategories(draft);
    const exists = current.some(c => c.toLowerCase() === cat.toLowerCase());
    let next: string[];
    if (exists) {
      next = current.filter(c => c.toLowerCase() !== cat.toLowerCase());
      if (next.length === 0) next = ["Regular Sevas"];
    } else {
      next = [...current, cat];
    }
    setDraft({ ...draft, categories: next, category: next.join(", ") });
  };

  const addInlineCategory = () => {
    const clean = inlineNewCat.trim();
    if (!clean) return;
    if (!customCategories.some(c => c.toLowerCase() === clean.toLowerCase())) {
      const updated = [...customCategories, clean];
      setCustomCategories(updated);
      try {
        localStorage.setItem("iskcon_seva_custom_categories", JSON.stringify(updated));
      } catch (e) {}
    }
    const current = getSevaCategories(draft);
    if (!current.some(c => c.toLowerCase() === clean.toLowerCase())) {
      const next = [...current, clean];
      setDraft({ ...draft, categories: next, category: next.join(", ") });
    }
    setInlineNewCat("");
  };

  const renameCategory = (oldName: string, newName: string) => {
    const clean = newName.trim();
    if (!clean || clean.toLowerCase() === oldName.toLowerCase()) {
      setEditingCatName(null);
      return;
    }
    if (customCategories.some(c => c.toLowerCase() === clean.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {
      toast.error(`Category "${clean}" already exists`);
      return;
    }

    const updated = customCategories.map(c => c.toLowerCase() === oldName.toLowerCase() ? clean : c);
    setCustomCategories(updated);
    try {
      localStorage.setItem("iskcon_seva_custom_categories", JSON.stringify(updated));
    } catch (e) {}

    // Update all sevas that have this category
    const affectedCount = sevas.filter(s => getSevaCategories(s).some(c => c.toLowerCase() === oldName.toLowerCase())).length;
    if (affectedCount > 0) {
      setSevas(sevas.map(s => {
        const cats = getSevaCategories(s);
        if (cats.some(c => c.toLowerCase() === oldName.toLowerCase())) {
          const newCats = cats.map(c => c.toLowerCase() === oldName.toLowerCase() ? clean : c);
          return { ...s, categories: newCats, category: newCats.join(", ") };
        }
        return s;
      }));
    }

    if (categoryFilter.toLowerCase() === oldName.toLowerCase()) {
      setCategoryFilter(clean);
    }

    toast.success(`Category renamed to "${clean}"`);
    setEditingCatName(null);
    setEditCatInput("");
  };

  const deleteCategory = (name: string) => {
    if (customCategories.length <= 1) {
      toast.error("You must keep at least one category");
      return;
    }

    const sevasInCat = sevas.filter(s => getSevaCategories(s).some(c => c.toLowerCase() === name.toLowerCase()));
    const promptMsg = sevasInCat.length > 0
      ? `Delete category "${name}"?\n\n${sevasInCat.length} seva(s) in this category will be reassigned.`
      : `Delete category "${name}"?`;
    
    if (window.confirm(promptMsg)) {
      const updated = customCategories.filter(c => c.toLowerCase() !== name.toLowerCase());
      setCustomCategories(updated);
      try {
        localStorage.setItem("iskcon_seva_custom_categories", JSON.stringify(updated));
      } catch (e) {}

      // Reassign affected sevas
      const fallback = updated.find(c => c.toLowerCase() === "regular sevas") || updated[0] || "Regular Sevas";
      const updatedSevas = sevas.map(s => {
        const cats = getSevaCategories(s);
        if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
          const filteredCats = cats.filter(c => c.toLowerCase() !== name.toLowerCase());
          const finalCats = filteredCats.length > 0 ? filteredCats : [fallback];
          return { ...s, categories: finalCats, category: finalCats.join(", ") };
        }
        return s;
      });
      setSevas(updatedSevas);

      if (categoryFilter.toLowerCase() === name.toLowerCase()) {
        setCategoryFilter("All");
      }
      toast.success(`Category "${name}" deleted`);
    }
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file, "ISKCON-KURNOOL/Sevas");
      setDraft((d) => ({ ...d, thumbnail: url }));
      toast.success("Thumbnail uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const resetForm = () => { 
    setDraft(emptyDraft()); 
    setPricingMode("single");
    setSingleAmount(516);
    setEditingId(null); 
    setInlineNewCat("");
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const prices = draft.prices && draft.prices.length > 0 ? draft.prices : [{ label: "", amount: 516 }];
  const setPrice = (i: number, p: Partial<SevaPrice>) =>
    setDraft({ ...draft, prices: prices.map((x, idx) => idx === i ? { ...x, ...p } : x) });
  const addPrice = () => setDraft({ ...draft, prices: [...prices, { label: "Offering Tier", amount: 1008 }] });
  const removePrice = (i: number) => {
    const updated = prices.filter((_, idx) => idx !== i);
    setDraft({ ...draft, prices: updated.length > 0 ? updated : [{ label: "", amount: 516 }] });
  };

  const toggleFestivalLink = (fId: string) => {
    const current = getSevaFestivalIds(draft);
    const exists = current.includes(fId);
    let next: string[];
    if (exists) {
      next = current.filter((id) => id !== fId);
    } else {
      next = [...current, fId];
    }
    setDraft({
      ...draft,
      festivalIds: next,
      festivalId: next.length > 0 ? next[0] : undefined
    });
  };

  const save = () => {
    if (!draft.title?.trim()) { 
      toast.error("Please enter a Seva Title"); 
      return; 
    }

    let cleanPrices: SevaPrice[];
    if (pricingMode === "single") {
      const amt = Number(singleAmount) > 0 ? Number(singleAmount) : 516;
      cleanPrices = [{ label: "", amount: amt }];
    } else {
      cleanPrices = (draft.prices || [])
        .filter((p) => p && Number(p.amount) > 0)
        .map((p) => ({ label: (p.label || "").trim(), amount: Number(p.amount) }));
      if (cleanPrices.length === 0) { 
        cleanPrices = [{ label: "", amount: 516 }];
      }
    }

    const generatedSlug = draft.slug?.trim() || draft.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || Date.now().toString();
    
    // Multi-select categories
    const selectedCats = getSevaCategories(draft);
    const finalCategories = selectedCats.length > 0 ? selectedCats : ["Regular Sevas"];
    const finalCategory = finalCategories.join(", ");

    // Multi-select festival IDs
    const festIds = getSevaFestivalIds(draft);

    // Ensure all selected categories exist in customCategories
    let updatedMaster = [...customCategories];
    let masterChanged = false;
    for (const cat of finalCategories) {
      if (!updatedMaster.some(c => c.toLowerCase() === cat.toLowerCase())) {
        updatedMaster.push(cat);
        masterChanged = true;
      }
    }
    if (masterChanged) {
      setCustomCategories(updatedMaster);
      try {
        localStorage.setItem("iskcon_seva_custom_categories", JSON.stringify(updatedMaster));
      } catch (e) {}
    }

    if (editingId) {
      setSevas(sevas.map((s) => s.id === editingId ? { 
        ...s, 
        ...draft, 
        title: draft.title!.trim(),
        category: finalCategory, 
        categories: finalCategories,
        slug: generatedSlug, 
        prices: cleanPrices,
        festivalId: festIds.length > 0 ? festIds[0] : undefined,
        festivalIds: festIds
      } as Seva : s));
      toast.success("✨ Seva updated successfully!");
    } else {
      const maxOrder = sevas.reduce((m, s) => Math.max(m, s.order ?? 0), 0);
      const item: Seva = {
        id: "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        thumbnail: draft.thumbnail || "",
        title: draft.title.trim(),
        description: draft.description?.trim() || "",
        category: finalCategory,
        categories: finalCategories,
        prices: cleanPrices,
        order: maxOrder + 1,
        active: draft.active !== false,
        slug: generatedSlug,
        festivalId: festIds.length > 0 ? festIds[0] : undefined,
        festivalIds: festIds
      };
      setSevas([...sevas, item]);
      toast.success("✨ New seva added successfully!");
    }
    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (s: Seva) => {
    setEditingId(s.id);
    const cats = getSevaCategories(s);
    const festIds = getSevaFestivalIds(s);
    const isSingle = !s.prices || s.prices.length <= 1;
    setPricingMode(isSingle ? "single" : "multiple");
    setSingleAmount(s.prices?.[0]?.amount || 516);
    setDraft({ 
      ...s, 
      category: s.category || cats.join(", "), 
      categories: cats, 
      prices: (s.prices && s.prices.length > 0) ? s.prices.map((p) => ({ ...p })) : [{ label: "", amount: 516 }],
      festivalId: s.festivalId || (festIds.length > 0 ? festIds[0] : undefined),
      festivalIds: festIds
    });
    setIsModalOpen(true);
  };

  const sorted = [...sevas].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Master categories list for tabs & options
  const allCategories = useMemo(() => ["All", ...customCategories], [customCategories]);
  const modalCategoryOptions = customCategories;

  const filtered = sorted.filter((s) => {
    const sevaCats = getSevaCategories(s);
    const matchesCategory = categoryFilter === "All" || sevaCats.some(c => c.toLowerCase() === categoryFilter.toLowerCase());
    if (!matchesCategory) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)) || sevaCats.some(c => c.toLowerCase().includes(q));
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
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <HandHeart className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Jagannath Sevas Manager</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300 font-sans">
                  Nitya &amp; Festival Sevas
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed font-sans">
                Configure temple donation and seva opportunities such as Bhoga Seva, Pushpalankara, Deepa Daan, Janmashtami, and Deity Abhishek.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-sans">
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
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm border border-amber-300 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <Tag className="h-4 w-4 text-amber-600" /> Manage Categories
            </button>

            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <Plus className="h-4 w-4" /> Add New Seva
            </button>
            <a
              href="/donate"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer font-sans"
            >
              <Eye className="h-4 w-4 text-accent" /> View Live
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sevas by name, category, or description..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none text-xs sm:text-sm shadow-2xs"
          />
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {allCategories.map((cat) => {
            const isAct = categoryFilter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${isAct
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s, idx) => (
          <div
            key={s.id}
            className="p-[2px] rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:via-orange-500 hover:to-rose-500 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
          >
            <div className="bg-white rounded-[22px] overflow-hidden flex flex-col justify-between h-full">
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
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${s.active !== false ? "bg-green-600 text-white" : "bg-slate-700 text-white"
                    }`}>
                    {s.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getSevaCategories(s).map((cat) => (
                      <span key={cat} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 uppercase tracking-wider">
                        {cat}
                      </span>
                    ))}
                    {s.festivalId && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-primary border border-purple-300/80 uppercase tracking-wider">
                        Linked: {(festivals || []).find((f) => f.id === s.festivalId)?.title || "Festival"}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-bold text-base text-foreground line-clamp-1">
                    {s.title}
                  </h4>
                  {s.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(!s.prices || s.prices.length <= 1) ? (
                      <span className="text-xs font-black bg-amber-50 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-lg font-sans">
                        ₹{s.prices?.[0]?.amount || 516}
                      </span>
                    ) : (
                      s.prices.map((p, i) => (
                        <span key={i} className="text-[11px] font-bold bg-slate-50 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-lg font-sans">
                          {p.label ? `${p.label}: ` : ""}₹{p.amount}
                        </span>
                      ))
                    )}
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
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${s.active !== false ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-muted-foreground"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
        subtitle="Manage seva title, categories, cover thumbnail, description, and donation pricing"
        icon={HandHeart}
        maxWidth="2xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-5">
          <div className="grid sm:grid-cols-[140px,1fr] gap-5 items-start">
            <UploadBox
              label="Thumbnail"
              url={draft.thumbnail}
              onPick={upload}
              onSelectUrl={(url) => setDraft((d) => ({ ...d, thumbnail: url }))}
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

              {/* Multi-Select Link to Festivals */}
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 space-y-2.5 font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                      Link to Festivals (Multi-Select)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Select festivals where this seva will appear
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-700 text-white shrink-0">
                    {getSevaFestivalIds(draft).length} Linked
                  </span>
                </div>

                {/* Selected Festivals Chips */}
                {getSevaFestivalIds(draft).length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-purple-200 min-h-[38px]">
                    {getSevaFestivalIds(draft).map((fId) => {
                      const fest = (festivals || []).find((f) => f.id === fId);
                      return (
                        <span
                          key={fId}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-700 text-white shadow-2xs"
                        >
                          <span>{fest ? fest.title : fId}</span>
                          <button
                            type="button"
                            onClick={() => toggleFestivalLink(fId)}
                            className="hover:bg-white/20 rounded p-0.5 transition cursor-pointer"
                            title="Remove festival link"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] italic text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                    No festivals linked — General / Nitya Seva.
                  </div>
                )}

                {/* Clickable Multi-Select Festival Options */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Click to Select / Deselect Festivals:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                    {(festivals || []).map((f) => {
                      const isLinked = getSevaFestivalIds(draft).includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFestivalLink(f.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isLinked
                              ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                              : "bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isLinked && <Check className="h-3.5 w-3.5 shrink-0" />}
                          <span>{f.title}</span>
                          {f.date && (
                            <span className="opacity-75 text-[10px]">
                              ({new Date(f.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Select Seva Categories */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                  Seva Categories (Multi-Select) <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Select one or multiple categories where this seva will be shown
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {getSevaCategories(draft).length} Selected
              </span>
            </div>

            {/* Currently Selected Chips */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 min-h-[42px]">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Active:</span>
              {getSevaCategories(draft).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary text-white shadow-2xs"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="hover:bg-white/20 rounded p-0.5 transition cursor-pointer"
                    title={`Remove ${cat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Clickable Multi-Select Options */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Click to Select / Deselect Categories:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200/80">
                {modalCategoryOptions.map((cat) => {
                  const isPicked = getSevaCategories(draft).some(c => c.toLowerCase() === cat.toLowerCase());
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${isPicked
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200"
                        }`}
                    >
                      {isPicked && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Custom Category Inline */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
              <input
                type="text"
                value={inlineNewCat}
                onChange={(e) => setInlineNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInlineCategory();
                  }
                }}
                placeholder="Type new category & press Add..."
                className="flex-1 px-3 py-1.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={addInlineCategory}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
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

          {/* Pricing Section with Single Amount / Multiple Tiers Mode */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground block">
                  Seva Donation Amount <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Choose single amount or multiple offering tiers
                </span>
              </div>

              {/* Pricing Mode Switcher */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPricingMode("single");
                    const curAmt = draft.prices?.[0]?.amount || singleAmount || 516;
                    setSingleAmount(curAmt);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pricingMode === "single"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Single Amount
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("multiple")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pricingMode === "multiple"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Multiple Tiers
                </button>
              </div>
            </div>

            {/* Single Amount Option (NO "Per Day", Clean & Simple) */}
            {pricingMode === "single" ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Fixed Offering Amount (₹)
                </label>
                <div className="relative max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={singleAmount || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setSingleAmount(val);
                      setDraft((d) => ({ ...d, prices: [{ label: "", amount: val }] }));
                    }}
                    placeholder="e.g. 516"
                    className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Devotees will donate this exact amount directly without any confusing labels.
                </p>
              </div>
            ) : (
              /* Multiple Tiers Option */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Tier Options (e.g. 1 Day, 1 Month, Festival Sponsor)
                  </span>
                  <button
                    type="button"
                    onClick={addPrice}
                    className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {prices.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        value={p.label}
                        onChange={(e) => setPrice(i, { label: e.target.value })}
                        placeholder="Tier Label (e.g. 1 Day, 1 Month, Grand Sponsor)"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">₹</span>
                        <input
                          type="number"
                          className="w-full pl-7 pr-3 py-2 border rounded-xl text-xs font-sans font-bold bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          value={p.amount || ""}
                          onChange={(e) => setPrice(i, { amount: Number(e.target.value) || 0 })}
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
            )}
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
              type="submit"
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
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

        </form>
      </AdminModal>

      {/* ================================================================= */}
      {/* MANAGE CATEGORIES MODAL (CREATE EXTRA CATEGORIES / DELETE)         */}
      {/* ================================================================= */}
      <AdminModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Seva Categories"
        subtitle="Create extra custom categories or remove unused categories for temple sevas"
        icon={Tag}
        maxWidth="lg"
      >
        <div className="space-y-6 font-sans">
          
          {/* Add new category input */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 font-sans">
              Add Extra / New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtraCategory(newCatInput);
                  }
                }}
                placeholder="e.g. Kartik Sevas, Narasimha Caturdasi..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-sans focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addExtraCategory(newCatInput)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800/80 font-sans">
              Type any new category name. It will immediately appear on the donation website and in the admin selector.
            </p>
          </div>

          {/* List of active categories */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                Active Categories ({modalCategoryOptions.length})
              </label>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-80 overflow-y-auto">
              {modalCategoryOptions.map((cat) => {
                const sevaCount = sevas.filter(s => (s.category || "Regular Sevas").toLowerCase() === cat.toLowerCase()).length;
                const isEditing = editingCatName?.toLowerCase() === cat.toLowerCase();

                return (
                  <div key={cat} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editCatInput}
                          onChange={(e) => setEditCatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              renameCategory(cat, editCatInput);
                            } else if (e.key === "Escape") {
                              setEditingCatName(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 bg-white border-2 border-primary rounded-xl text-xs sm:text-sm font-sans focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => renameCategory(cat, editCatInput)}
                          className="p-2 rounded-xl bg-primary text-white hover:bg-[#4a2282] transition-colors cursor-pointer"
                          title="Save Rename"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{cat}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {sevaCount} {sevaCount === 1 ? "seva" : "sevas"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatName(cat);
                              setEditCatInput(cat);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Rename Category"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t flex justify-end">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </AdminModal>

    </div>
  );
}
