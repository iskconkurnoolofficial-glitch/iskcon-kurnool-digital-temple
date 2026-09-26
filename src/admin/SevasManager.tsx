import { useState, useEffect, useMemo } from "react";
import { useAdmin, uploadToCloudinary, Seva, SevaPrice, getSevaCategories, getSevaFestivalIds } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, HandHeart, Pencil, X, Plus, 
  ArrowUp, ArrowDown, IndianRupee, Sparkles, Search,
  Tag, Check, ChevronRight, ChevronLeft, Image as ImageIcon,
  CheckCircle2, AlertCircle, LayoutGrid, HeartHandshake, Layers
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

const PRESET_DONATION_AMOUNTS = [516, 1008, 2100, 5000, 11000, 21000];

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
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [inlineNewCat, setInlineNewCat] = useState("");
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatInput, setEditCatInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Master Categories State (persisted in localStorage)
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
    toast.success(`Added "${clean}" to selected categories`);
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
      toast.success("Thumbnail uploaded successfully!");
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
    setWizardStep(1);
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
      toast.error("Please enter a Seva Title in Step 1");
      setWizardStep(1);
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
    setWizardStep(1);
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
      {/* Modern Banner Header */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shrink-0 shadow-md">
              <HandHeart className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl font-bold text-primary">Jagannath Sevas Manager</h2>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300 font-sans">
                  Nitya &amp; Festival Sevas
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed font-sans">
                Configure temple donation opportunities such as Bhoga Seva, Pushpalankara, Deepa Daan, Janmashtami, and Deity Abhishek in a quick, step-by-step wizard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-sans">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-[11px] text-muted-foreground block font-medium">Total Sevas</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-[11px] text-muted-foreground block font-medium">Active Sevas</span>
              <strong className="font-display text-lg text-green-600">{activeCount}</strong>
            </div>
            
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm border border-amber-300 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <Tag className="h-4 w-4 text-amber-600" /> Categories
            </button>

            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <Plus className="h-4 w-4" /> Add Seva
            </button>
            <a
              href="/donate"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer font-sans"
            >
              <Eye className="h-4 w-4 text-accent" /> Live View
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sevas by title, category, or description..."
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

      {/* Sevas Cards Grid */}
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
                    <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-amber-50/50 text-amber-400">
                      <HandHeart className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-sans text-xs font-bold px-2.5 py-1 rounded-full">
                    #{idx + 1}
                  </span>
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${s.active !== false ? "bg-green-600 text-white" : "bg-slate-700 text-white"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-colors cursor-pointer"
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

      {/* ================================================================= */}
      {/* STEP-BY-STEP SEVA WIZARD MODAL                                    */}
      {/* ================================================================= */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Jagannath Seva" : "Add New Jagannath Seva"}
        subtitle="Follow the step-by-step process to configure title, categories, donation pricing, and media"
        icon={HandHeart}
        maxWidth="2xl"
      >
        <div className="space-y-5 font-sans">
          
          {/* Wizard Step Indicator Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wizardStep === 1 
                    ? "bg-amber-500 text-white shadow-xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  wizardStep === 1 ? "bg-white text-amber-600" : "bg-slate-300 text-slate-700"
                }`}>1</span>
                <span>Basic Info &amp; Categories</span>
              </button>

              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block" />

              <button
                type="button"
                onClick={() => {
                  if (!draft.title?.trim()) {
                    toast.error("Please enter a Seva title first");
                    return;
                  }
                  setWizardStep(2);
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wizardStep === 2 
                    ? "bg-amber-500 text-white shadow-xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  wizardStep === 2 ? "bg-white text-amber-600" : "bg-slate-300 text-slate-700"
                }`}>2</span>
                <span>Donation Pricing</span>
              </button>

              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block" />

              <button
                type="button"
                onClick={() => {
                  if (!draft.title?.trim()) {
                    toast.error("Please enter a Seva title first");
                    return;
                  }
                  setWizardStep(3);
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wizardStep === 3 
                    ? "bg-amber-500 text-white shadow-xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  wizardStep === 3 ? "bg-white text-amber-600" : "bg-slate-300 text-slate-700"
                }`}>3</span>
                <span>Media &amp; Preview</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-5">
            
            {/* ============================================================== */}
            {/* STEP 1: BASIC INFO, CATEGORIES & FESTIVALS                      */}
            {/* ============================================================== */}
            {wizardStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                      Seva Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm font-sans focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      value={draft.title || ""}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Sri Jagannath Rajbhoga Seva"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                      Custom URL Slug
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border rounded-xl bg-white text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      value={draft.slug || ""}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      placeholder="e.g. rajbhoga-seva (leave blank to auto-generate)"
                    />
                  </div>
                </div>

                {/* Multi-Select Seva Categories */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold font-sans uppercase tracking-wider text-amber-950">
                        Seva Categories (Multi-Select) <span className="text-destructive">*</span>
                      </label>
                      <span className="text-[11px] text-amber-800/80">
                        Choose categories where this seva will be displayed
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 shrink-0">
                      {getSevaCategories(draft).length} Selected
                    </span>
                  </div>

                  {/* Selected Categories Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-xl border border-amber-200 min-h-[42px]">
                    {getSevaCategories(draft).map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white shadow-2xs"
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

                  {/* Category Selection Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Click to Select / Deselect Categories:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                      {modalCategoryOptions.map((cat) => {
                        const isPicked = getSevaCategories(draft).some(c => c.toLowerCase() === cat.toLowerCase());
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${isPicked
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
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

                  {/* Inline Category Quick Add */}
                  <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
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
                      placeholder="Create & add new category..."
                      className="flex-1 px-3 py-1.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addInlineCategory}
                      className="px-3.5 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Festival Linkage Section */}
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold font-sans uppercase tracking-wider text-purple-950">
                        Link to Festivals (Optional)
                      </label>
                      <span className="text-[11px] text-purple-800/80">
                        Link this seva to specific festival landing pages
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-700 text-white shrink-0">
                      {getSevaFestivalIds(draft).length} Linked
                    </span>
                  </div>

                  {/* Selected Festivals */}
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
                      No festivals linked — Nitya / General Seva.
                    </div>
                  )}

                  {/* Available Festival Pickers */}
                  {(festivals || []).length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Available Festivals:
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
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Published Status Toggle */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Visibility Status
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Make this seva visible immediately on the website
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={draft.active !== false}
                      onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>{draft.active !== false ? "Active (Live)" : "Inactive (Hidden)"}</span>
                  </label>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: PRICING & DONATION TIERS                               */}
            {/* ============================================================== */}
            {wizardStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground block">
                        Pricing Setup Mode <span className="text-destructive">*</span>
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Select single fixed donation or multi-tier offering levels
                      </span>
                    </div>

                    {/* Mode Switcher */}
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
                            ? "bg-amber-500 text-white shadow-2xs"
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
                            ? "bg-amber-500 text-white shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Multiple Tiers
                      </button>
                    </div>
                  </div>

                  {pricingMode === "single" ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <label className="block text-xs font-bold text-slate-700">
                        Fixed Donation Amount (₹)
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
                          className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-base font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                        />
                      </div>

                      {/* Quick Preset Amount Buttons */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Quick Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_DONATION_AMOUNTS.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setSingleAmount(amt);
                                setDraft((d) => ({ ...d, prices: [{ label: "", amount: amt }] }));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                                singleAmount === amt
                                  ? "bg-amber-100 text-amber-900 border-amber-400"
                                  : "bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Multiple Tiers Option */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Define Offering Tiers (e.g., 1 Day, 1 Month, Grand Sponsor)
                        </span>
                        <button
                          type="button"
                          onClick={addPrice}
                          className="text-xs text-amber-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Tier
                        </button>
                      </div>
                      <div className="space-y-2">
                        {prices.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                            <input
                              className="flex-1 px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                              value={p.label}
                              onChange={(e) => setPrice(i, { label: e.target.value })}
                              placeholder="Tier Label (e.g. 1 Day, 1 Month, Grand Sponsor)"
                            />
                            <div className="relative w-36">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">₹</span>
                              <input
                                type="number"
                                className="w-full pl-7 pr-3 py-2 border rounded-xl text-xs font-sans font-bold bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: MEDIA, DESCRIPTION & PREVIEW                           */}
            {/* ============================================================== */}
            {wizardStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid sm:grid-cols-[160px,1fr] gap-5 items-start">
                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                      Seva Thumbnail Image
                    </label>
                    <UploadBox
                      label="Thumbnail"
                      url={draft.thumbnail}
                      onPick={upload}
                      onSelectUrl={(url) => setDraft((d) => ({ ...d, thumbnail: url }))}
                      aspect="aspect-square"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                        Short Description / Spiritual Benefit
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-amber-500/20 focus:outline-none leading-relaxed"
                        value={draft.description || ""}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        placeholder="Describe the transcendental benefit of offering this sacred seva to Sri Sri Radha Govinda..."
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="bg-slate-900 p-4 rounded-2xl space-y-2 text-white">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Website Preview Card
                  </span>
                  <div className="bg-white text-slate-900 rounded-xl p-4 flex gap-4 items-center border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {draft.thumbnail ? (
                        <img src={draft.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-slate-300">
                          <HandHeart className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                        {getSevaCategories(draft).join(", ") || "Regular Sevas"}
                      </span>
                      <h4 className="font-bold text-sm truncate mt-1">{draft.title || "Untitled Seva"}</h4>
                      <p className="text-xs text-slate-500 truncate">{draft.description || "No description provided."}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-700 block">
                        ₹{pricingMode === "single" ? (singleAmount || 516) : (prices[0]?.amount || 516)}
                      </span>
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-md font-bold inline-block mt-0.5">
                        Donate
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation & Action Footer Buttons */}
            <div className="pt-4 border-t flex items-center justify-between gap-3">
              <div>
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-muted-foreground transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!draft.title?.trim()) {
                        toast.error("Please enter a Seva Title in Step 1");
                        return;
                      }
                      setWizardStep((s) => (s + 1) as 1 | 2 | 3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={busy}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>{busy ? "Saving..." : (editingId ? "Save Changes" : "Create Seva")}</span>
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      </AdminModal>

      {/* ================================================================= */}
      {/* MANAGE CATEGORIES MODAL                                           */}
      {/* ================================================================= */}
      <AdminModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Seva Categories"
        subtitle="Create custom categories, rename, or remove unused categories"
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
                const sevaCount = sevas.filter(s => getSevaCategories(s).some(c => c.toLowerCase() === cat.toLowerCase())).length;
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
                          className="flex-1 px-3 py-1.5 bg-white border-2 border-amber-500 rounded-xl text-xs sm:text-sm font-sans focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => renameCategory(cat, editCatInput)}
                          className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
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
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
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
