import { useMemo, useState, useEffect } from "react";
import {
  useAdmin, uploadToCloudinary, slugify, normalizeFestival, isFestivalLive,
  Festival, Seva, SevaPrice,
} from "@/context/AdminContext";
import RichTextEditor from "@/components/RichTextEditor";
import AdminModal from "./AdminModal";
import {
  Plus, Trash2, Pencil, Eye, EyeOff, Upload, Calendar, Clock, Search,
  ArrowUp, ArrowDown, X, GripVertical, Sparkles, Save, CheckCircle2, CircleSlash,
  Flame, PartyPopper, ChevronRight, ChevronLeft, MapPin, Image as ImageIcon,
  FileText, ListOrdered, Check, ExternalLink, Info
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

function fmtDate(d: string) {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function newSeva(order: number): Seva {
  return { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), thumbnail: "", title: "", description: "", prices: [{ label: "Per Day", amount: 501 }], order, active: true };
}

function blankFestival(): Festival {
  return {
    id: Date.now().toString(),
    title: "", slug: "", date: "", thumbnail: "", desktopBanner: "", mobileBanner: "",
    description: "", shortDescription: "", sevas: [], status: "published", hidden: false,
    publishAt: undefined, unpublishAt: undefined, order: 0,
    schedule: "", location: "", locationAddress: "", locationLink: "", program: [],
    albumUrl: "",
  };
}

export default function FestivalsManager() {
  const { festivals, setFestivals } = useAdmin();
  const list = useMemo(() => festivals.map(normalizeFestival), [festivals]);

  const [draft, setDraft] = useState<Festival | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const [localList, setLocalList] = useState<Festival[]>([]);
  const [isOrderDirty, setIsOrderDirty] = useState(false);

  // Sync localList with DB list when DB list changes (unless unsaved order changes)
  useEffect(() => {
    if (!isOrderDirty) {
      setLocalList([...list].sort((a, b) => a.order - b.order));
    }
  }, [list, isOrderDirty]);

  const commit = (next: Festival[]) => {
    setFestivals(next.map(normalizeFestival));
    setIsOrderDirty(false);
  };

  const openNew = () => {
    const f = blankFestival();
    f.order = list.length;
    setDraft(f);
    setSlugEdited(false);
  };
  
  const openEdit = (f: Festival) => {
    setDraft({ ...f });
    setSlugEdited(true);
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.title.trim()) { toast.error("Festival title is required!"); return; }
    if (!draft.date) { toast.error("Festival date is required!"); return; }
    const finalSlug = (draft.slug || slugify(draft.title) || draft.id).trim();
    
    // unique slug check
    if (list.some((f) => f.id !== draft.id && f.slug === finalSlug)) { 
      toast.error("Slug must be unique — another festival uses it."); 
      return; 
    }
    
    const next = { ...draft, slug: finalSlug };
    const exists = list.some((f) => f.id === draft.id);
    commit(exists ? list.map((f) => (f.id === draft.id ? next : f)) : [...list, next]);
    setDraft(null);
    toast.success(exists ? "Festival updated successfully!" : "New festival created!");
  };

  // ----- list-level mutations -----
  const patch = (id: string, p: Partial<Festival>) => {
    const updated = localList.map((f) => (f.id === id ? { ...f, ...p } : f));
    setLocalList(updated);
    commit(updated);
  };

  const remove = (id: string) => {
    if (confirm("Are you sure you want to delete this festival?")) {
      const updated = localList.filter((f) => f.id !== id);
      setLocalList(updated);
      commit(updated);
      if (draft?.id === id) setDraft(null);
      toast.success("Festival deleted.");
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...localList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    sorted.forEach((item, idx) => {
      item.order = idx;
    });

    const i = sorted.findIndex((f) => f.id === id);
    if (i === -1) return;
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;

    const temp = sorted[i];
    sorted[i] = sorted[j];
    sorted[j] = temp;

    const updated = sorted.map((f, idx) => ({ ...f, order: idx }));
    setLocalList(updated);
    commit(updated);
    toast.success(`Moved "${temp.title}" ${dir === -1 ? "up" : "down"}`);
  };

  const saveOrder = () => {
    commit(localList);
    toast.success("Festival order saved!");
  };

  const resetOrder = () => {
    setLocalList([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setIsOrderDirty(false);
  };

  return (
    <>
      <FestivalList
        list={localList}
        isOrderDirty={isOrderDirty}
        onSaveOrder={saveOrder}
        onResetOrder={resetOrder}
        onNew={openNew}
        onEdit={openEdit}
        onPatch={patch}
        onRemove={remove}
        onMove={move}
      />

      {/* Step-by-Step Edit / Add Modal */}
      <AdminModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id && list.some((x) => x.id === draft.id) ? "Edit Festival" : "Add New Festival"}
        subtitle="Step-by-step setup guide for upcoming festival celebrations"
        icon={PartyPopper}
        maxWidth="4xl"
      >
        {draft && (
          <FestivalStepEditor
            draft={draft}
            setDraft={setDraft}
            slugEdited={slugEdited}
            setSlugEdited={setSlugEdited}
            onSave={saveDraft}
            onCancel={() => setDraft(null)}
          />
        )}
      </AdminModal>
    </>
  );
}

/* ============================ LIST / TABLE ============================ */
function FestivalList({ list, isOrderDirty, onSaveOrder, onResetOrder, onNew, onEdit, onPatch, onRemove, onMove }: {
  list: Festival[];
  isOrderDirty: boolean;
  onSaveOrder: () => void;
  onResetOrder: () => void;
  onNew: () => void;
  onEdit: (f: Festival) => void;
  onPatch: (id: string, p: Partial<Festival>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"custom" | "date-asc" | "date-desc">("custom");

  const rows = useMemo(() => {
    let r = [...list];
    const query = q.trim().toLowerCase();
    if (query) r = r.filter((f) => f.title.toLowerCase().includes(query) || f.slug.includes(query));
    if (statusFilter === "published") r = r.filter((f) => f.status === "published" && !f.hidden);
    if (statusFilter === "draft") r = r.filter((f) => f.status === "draft");
    if (statusFilter === "hidden") r = r.filter((f) => f.hidden);
    
    r.sort((a, b) => {
      if (sortBy === "custom") {
        return (a.order || 0) - (b.order || 0);
      }
      const t = (a.date || "").localeCompare(b.date || "");
      return sortBy === "date-asc" ? t : -t;
    });
    return r;
  }, [list, q, statusFilter, sortBy]);

  const totalCount = list.length;
  const publishedCount = list.filter((f) => f.status === "published" && !f.hidden).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-purple-200/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-purple-500/20 text-purple-800 rounded-2xl shrink-0 shadow-xs">
              <PartyPopper className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Festivals & Celebrations</h2>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Utsavas
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage grand temple celebrations like Janmashtami, Ratha Yatra, and Gaura Purnima using our simple step-by-step manager.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Festivals</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Published Live</span>
              <strong className="font-display text-lg text-green-600">{publishedCount}</strong>
            </div>
            <button
              type="button"
              onClick={onNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/90 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Festival
            </button>
          </div>
        </div>
      </div>

      {/* SAVE ORDER NOTIFICATION BAR */}
      {isOrderDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <span>You modified the festival order. Save to update on the live website.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onResetOrder}
              className="px-3.5 py-1.5 border border-amber-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={onSaveOrder}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save Order
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search festivals..." className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2.5 border rounded-xl bg-white text-xs font-bold">
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2.5 border rounded-xl bg-white text-xs font-bold">
          <option value="custom">Sort by Custom Order</option>
          <option value="date-asc">Date: Oldest First</option>
          <option value="date-desc">Date: Newest First</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-2xl border">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" /> No festivals found.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium text-center w-16">Order</th>
                  <th className="px-4 py-3 font-medium">Festival</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded bg-muted overflow-hidden shrink-0">
                          {f.thumbnail && <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground line-clamp-1">{f.title}</div>
                          <div className="text-xs text-muted-foreground">/{f.slug} · {f.sevas?.length || 0} sevas</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(f.date)}</td>
                    <td className="px-4 py-3"><StatusBadge f={f} /></td>
                    <td className="px-4 py-3"><LiveBadge f={f} /></td>
                    <td className="px-4 py-3">
                      <RowActions f={f} sortBy={sortBy} onEdit={onEdit} onPatch={onPatch} onRemove={onRemove} onMove={onMove} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {rows.map((f, idx) => (
              <div key={f.id} className="bg-white rounded-xl border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center h-6 px-2 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300">
                    Position #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onMove(f.id, -1)} className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onMove(f.id, 1)} className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-14 w-20 rounded bg-muted overflow-hidden shrink-0">
                    {f.thumbnail && <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold line-clamp-1">{f.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmtDate(f.date)}</div>
                    <div className="flex gap-1.5 mt-1.5"><StatusBadge f={f} /><LiveBadge f={f} /></div>
                  </div>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <RowActions f={f} sortBy={sortBy} onEdit={onEdit} onPatch={onPatch} onRemove={onRemove} onMove={onMove} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ f }: { f: Festival }) {
  if (f.status === "published") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3" /> Published</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700"><CircleSlash className="h-3 w-3" /> Draft</span>;
}

function LiveBadge({ f }: { f: Festival }) {
  if (f.hidden) return <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">Hidden</span>;
  const live = isFestivalLive(f);
  return live
    ? <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Live</span>
    : <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-muted-foreground">Offline</span>;
}

function RowActions({ f, sortBy, onEdit, onPatch, onRemove, onMove }: {
  f: Festival;
  sortBy: string;
  onEdit: (f: Festival) => void;
  onPatch: (id: string, p: Partial<Festival>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const iconBtn = "p-2 rounded hover:bg-muted transition cursor-pointer";
  return (
    <div className="flex items-center justify-end gap-1">
      <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-300/40 rounded-lg p-0.5 mr-1" title="Reorder Position">
        <button onClick={() => onMove(f.id, -1)} className="p-1 rounded hover:bg-amber-200 text-amber-900 transition cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
        <button onClick={() => onMove(f.id, 1)} className="p-1 rounded hover:bg-amber-200 text-amber-900 transition cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
      </div>

      {f.status === "published"
        ? <button onClick={() => onPatch(f.id, { status: "draft" })} className={`${iconBtn} text-amber-600`} title="Unpublish"><CircleSlash className="h-4 w-4" /></button>
        : <button onClick={() => onPatch(f.id, { status: "published", hidden: false })} className={`${iconBtn} text-green-600`} title="Publish"><CheckCircle2 className="h-4 w-4" /></button>}
      <button onClick={() => onPatch(f.id, { hidden: !f.hidden })} className={iconBtn} title={f.hidden ? "Show" : "Hide"}>
        {f.hidden ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4" />}
      </button>
      <button onClick={() => onEdit(f)} className={`${iconBtn} text-accent`} title="Edit"><Pencil className="h-4 w-4" /></button>
      <button onClick={() => onRemove(f.id)} className={`${iconBtn} text-destructive`} title="Delete"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

/* ============================ STEP-BY-STEP EDITOR ============================ */
function FestivalStepEditor({ draft, setDraft, slugEdited, setSlugEdited, onSave, onCancel }: {
  draft: Festival;
  setDraft: (f: Festival) => void;
  slugEdited: boolean;
  setSlugEdited: (b: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [busy, setBusy] = useState<string | null>(null);

  const upd = (p: Partial<Festival>) => setDraft({ ...draft, ...p });

  const uploadField = async (file: File, field: "thumbnail" | "desktopBanner" | "mobileBanner") => {
    setBusy(field);
    try { 
      const url = await uploadToCloudinary(file, "ISKCON-KURNOOL/Festivals");
      upd({ [field]: url } as Partial<Festival>); 
      toast.success("Image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    } finally {
      setBusy(null);
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", icon: Info, desc: "Name, Date & Location" },
    { id: 2, name: "Media & Gallery", icon: ImageIcon, desc: "Banner & Photo Carousel" },
    { id: 3, name: "Details & Timeline", icon: ListOrdered, desc: "Description & Program Schedule" },
    { id: 4, name: "Publish & Save", icon: CheckCircle2, desc: "Visibility & Live Status" },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* STEP INDICATOR HEADER */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id as any)}
                className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer text-left border ${
                  isActive
                    ? "bg-white border-primary text-primary shadow-sm ring-2 ring-primary/20"
                    : isCompleted
                    ? "bg-green-50/80 border-green-200 text-green-800"
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/70"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg grid place-items-center font-bold text-xs shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <div className="min-w-0 flex-1 hidden sm:block">
                  <span className="text-xs font-extrabold block truncate leading-tight">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {s.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: BASIC INFO */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <Section title="Step 1: Festival Basic Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Festival Title *">
                <input
                  className="inp font-semibold"
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    upd(slugEdited ? { title } : { title, slug: slugify(title) });
                  }}
                  placeholder="e.g. Sri Krishna Janmashtami 2026"
                />
              </Field>

              <Field label="Web Slug / URL Identifier">
                <input
                  className="inp font-mono text-xs"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    upd({ slug: slugify(e.target.value) });
                  }}
                  placeholder="janmashtami-2026"
                />
              </Field>

              <Field label="Festival Date *">
                <input
                  type="date"
                  className="inp font-bold"
                  value={draft.date}
                  onChange={(e) => upd({ date: e.target.value })}
                />
              </Field>

              <Field label="Short Description (Card Summary)">
                <input
                  className="inp"
                  value={draft.shortDescription}
                  onChange={(e) => upd({ shortDescription: e.target.value })}
                  placeholder="Celebrate the divine appearance of Lord Krishna with grand abhishekam & prasadam"
                />
              </Field>

              <Field label="Venue Location Name (Short)">
                <input
                  className="inp"
                  value={draft.location ?? ""}
                  onChange={(e) => upd({ location: e.target.value })}
                  placeholder="Main Temple Hall, ISKCON Kurnool"
                />
              </Field>

              <Field label="Google Maps Link">
                <input
                  className="inp"
                  value={draft.locationLink ?? ""}
                  onChange={(e) => upd({ locationLink: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Full Venue Address">
                  <textarea
                    className="inp min-h-[60px]"
                    value={draft.locationAddress ?? ""}
                    onChange={(e) => upd({ locationAddress: e.target.value })}
                    placeholder="Sri Sri Puri Jagannath Mandir, Somashila Road, Kurnool, Andhra Pradesh 518002"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Photo Album / Gallery Album URL (Google Photos, Drive, Flickr, iCloud)">
                  <input
                    className="inp"
                    value={draft.albumUrl ?? (draft as any).driveUrl ?? ""}
                    onChange={(e) => upd({ albumUrl: e.target.value })}
                    placeholder="https://photos.app.goo.gl/... or https://drive.google.com/..."
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* STEP 2: MEDIA & GALLERY */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <Section title="Step 2: Main Banner & Photo Carousel">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Main Festival Banner Image (1280 × 720)</span>
                <UploadBox
                  label="Click or drop Main Festival Banner"
                  url={draft.thumbnail}
                  onPick={(f) => uploadField(f, "thumbnail")}
                  aspect="aspect-video"
                  className="w-full max-w-lg"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-800 block">Sidebar Photo Gallery Carousel (Up to 6 photos)</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Upload high-res photos to feature in the festival page sidebar gallery modal.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const currentImages = draft.carouselImages || [];
                    const url = currentImages[idx] || "";
                    return (
                      <div key={idx} className="relative group">
                        <UploadBox
                          label={`Photo ${idx + 1}`}
                          url={url}
                          aspect="aspect-square"
                          className="w-full"
                          onPick={async (file) => {
                            setBusy(`carousel-${idx}`);
                            try {
                              const uploadedUrl = await uploadToCloudinary(file, "ISKCON-KURNOOL/Festivals");
                              const updatedCarousel = [...currentImages];
                              updatedCarousel[idx] = uploadedUrl;
                              upd({ carouselImages: updatedCarousel.filter(Boolean) });
                              toast.success(`Photo ${idx + 1} uploaded!`);
                            } catch {
                              toast.error("Upload failed");
                            } finally {
                              setBusy(null);
                            }
                          }}
                        />
                        {url && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedCarousel = [...currentImages];
                              updatedCarousel.splice(idx, 1);
                              upd({ carouselImages: updatedCarousel.filter(Boolean) });
                            }}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-colors cursor-pointer z-10"
                            title="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {busy === `carousel-${idx}` && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-semibold text-primary">
                            Uploading...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* STEP 3: DETAILS & TIMELINE */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <Section title="Step 3: Festival About Description">
            <RichTextEditor
              value={draft.description}
              onChange={(html) => upd({ description: html })}
            />
          </Section>

          <Section title="Festival General Schedule">
            <RichTextEditor
              value={draft.schedule ?? ""}
              onChange={(html) => upd({ schedule: html })}
            />
          </Section>

          <Section 
            title={`Program Timings & Event Timeline (${(draft.program ?? []).length})`} 
            action={
              <button 
                type="button"
                onClick={() => upd({ program: [...(draft.program ?? []), { time: "", title: "", description: "" }] })} 
                className="text-xs px-3.5 py-2 rounded-xl bg-accent text-white inline-flex items-center gap-1 cursor-pointer font-bold shadow-xs hover:bg-accent/90"
              >
                <Plus className="h-4 w-4" /> Add Program Event
              </button>
            }
          >
            {(draft.program ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-2xl">
                No timeline events added yet. Click "Add Program Event" above to build the festival schedule.
              </div>
            ) : (
              <div className="space-y-4">
                {(draft.program ?? []).map((item, idx) => (
                  <div key={idx} className="border rounded-2xl p-4 bg-slate-50/60 flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Event Slot #{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const nextProg = [...(draft.program ?? [])];
                            [nextProg[idx], nextProg[idx - 1]] = [nextProg[idx - 1], nextProg[idx]];
                            upd({ program: nextProg });
                          }}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (draft.program ?? []).length - 1}
                          onClick={() => {
                            const nextProg = [...(draft.program ?? [])];
                            [nextProg[idx], nextProg[idx + 1]] = [nextProg[idx + 1], nextProg[idx]];
                            upd({ program: nextProg });
                          }}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextProg = (draft.program ?? []).filter((_, i) => i !== idx);
                            upd({ program: nextProg });
                          }}
                          className="p-1 rounded hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-[160px,1fr] gap-4">
                      <Field label="Time (e.g. 04:30 AM)">
                        <input
                          className="inp font-bold"
                          placeholder="e.g. 04:30 AM"
                          value={item.time}
                          onChange={(e) => {
                            const nextProg = [...(draft.program ?? [])];
                            nextProg[idx] = { ...nextProg[idx], time: e.target.value };
                            upd({ program: nextProg });
                          }}
                        />
                      </Field>
                      <div className="space-y-3">
                        <Field label="Event Title">
                          <input
                            className="inp font-semibold"
                            placeholder="e.g. Grand Maha Abhishekam"
                            value={item.title}
                            onChange={(e) => {
                              const nextProg = [...(draft.program ?? [])];
                              nextProg[idx] = { ...nextProg[idx], title: e.target.value };
                              upd({ program: nextProg });
                            }}
                          />
                        </Field>
                        <Field label="Description (Optional)">
                          <textarea
                            className="inp min-h-[50px]"
                            placeholder="e.g. Bathing of Sri Sri Radha Govinda with holy waters, milk, fruit juices and honey."
                            value={item.description ?? ""}
                            onChange={(e) => {
                              const nextProg = [...(draft.program ?? [])];
                              nextProg[idx] = { ...nextProg[idx], description: e.target.value };
                              upd({ program: nextProg });
                            }}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* STEP 4: PUBLISH & SAVE */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <Section title="Step 4: Status & Live Visibility">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Publication Status">
                <select
                  className="inp font-bold"
                  value={draft.status}
                  onChange={(e) => upd({ status: e.target.value as Festival["status"] })}
                >
                  <option value="published">Published (Live on Website)</option>
                  <option value="draft">Draft (Private / Unsaved)</option>
                </select>
              </Field>

              <Field label="Visibility Toggle">
                <button
                  type="button"
                  onClick={() => upd({ hidden: !draft.hidden })}
                  className={`inp text-left inline-flex items-center gap-2 font-bold ${
                    draft.hidden ? "text-amber-800 bg-amber-50" : "text-green-800 bg-green-50"
                  }`}
                >
                  {draft.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {draft.hidden ? "Hidden from Public Website" : "Visible to Public Website"}
                </button>
              </Field>

              <Field label="Auto-Publish Date/Time (Optional)">
                <input
                  type="datetime-local"
                  className="inp"
                  value={draft.publishAt ?? ""}
                  onChange={(e) => upd({ publishAt: e.target.value || undefined })}
                />
              </Field>

              <Field label="Auto-Unpublish Date/Time (Optional)">
                <input
                  type="datetime-local"
                  className="inp"
                  value={draft.unpublishAt ?? ""}
                  onChange={(e) => upd({ unpublishAt: e.target.value || undefined })}
                />
              </Field>
            </div>
          </Section>

          {/* Quick Festival Summary Review Card */}
          <div className="bg-amber-500/10 border-2 border-amber-300/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span>Festival Summary Overview</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
              <div>
                <span className="text-muted-foreground block">Title:</span>
                <strong>{draft.title || "—"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Date:</span>
                <strong>{fmtDate(draft.date)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Program Events:</span>
                <strong>{(draft.program ?? []).length} event(s)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM STEP NAVIGATION FOOTER */}
      <div className="pt-4 border-t flex items-center justify-between gap-3 sticky bottom-0 bg-white py-3 z-10">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Step
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-sm inline-flex items-center gap-2 transition shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <Check className="h-4.5 w-4.5" /> Save &amp; Finish Festival
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

/* ============================ SMALL HELPERS ============================ */
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-elegant p-5 sm:p-6 border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/80 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
