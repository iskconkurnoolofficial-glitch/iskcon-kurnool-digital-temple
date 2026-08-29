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
  Flame, PartyPopper, ChevronRight
} from "lucide-react";
import { UploadBox } from "./CarouselManager";

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
    schedule: "", location: "",
  };
}

export default function FestivalsManager() {
  const { festivals, setFestivals } = useAdmin();
  const list = useMemo(() => festivals.map(normalizeFestival), [festivals]);

  const [draft, setDraft] = useState<Festival | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const [localList, setLocalList] = useState<Festival[]>([]);
  const [isOrderDirty, setIsOrderDirty] = useState(false);

  // Sync localList with DB list when DB list changes (unless we have unsaved order changes)
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
    if (!draft.title.trim()) { alert("Festival title is required"); return; }
    if (!draft.date) { alert("Festival date is required"); return; }
    const finalSlug = (draft.slug || slugify(draft.title) || draft.id).trim();
    // unique slug check
    if (list.some((f) => f.id !== draft.id && f.slug === finalSlug)) { alert("Slug must be unique — another festival uses it."); return; }
    const next = { ...draft, slug: finalSlug };
    const exists = list.some((f) => f.id === draft.id);
    commit(exists ? list.map((f) => (f.id === draft.id ? next : f)) : [...list, next]);
    setDraft(null);
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
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...localList].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((f) => f.id === id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    
    // Swap orders
    const tempOrder = sorted[i].order;
    sorted[i].order = sorted[j].order;
    sorted[j].order = tempOrder;
    
    setLocalList(sorted.sort((a, b) => a.order - b.order));
    setIsOrderDirty(true);
  };

  const saveOrder = () => {
    commit(localList);
  };

  const resetOrder = () => {
    setLocalList([...list].sort((a, b) => a.order - b.order));
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

      {/* Popup Edit / Add Modal */}
      <AdminModal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id && list.some((x) => x.id === draft.id) ? "Edit Festival" : "Add New Festival"}
        subtitle="Manage festival details, dates, banners, and seva tiers"
        icon={PartyPopper}
        maxWidth="4xl"
      >
        {draft && (
          <FestivalEditor
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
                Manage grand temple celebrations like Janmashtami, Ratha Yatra, and Gaura Purnima. Configure banners, schedules, and sponsorship seva tiers.
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

      {/* 1. SAVE ORDER NOTIFICATION BAR */}
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
                  <th className="px-4 py-3 font-medium">Festival</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((f) => (
                  <tr key={f.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded bg-muted overflow-hidden shrink-0">
                          {f.thumbnail && <img src={f.thumbnail} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground line-clamp-1">{f.title}</div>
                          <div className="text-xs text-muted-foreground">/{f.slug} · {f.sevas.length} sevas</div>
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
            {rows.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border p-3">
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
                <div className="mt-3 pt-3 border-t flex justify-end">
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
  const iconBtn = "p-2 rounded hover:bg-muted transition";
  const isCustom = sortBy === "custom";
  return (
    <div className="flex items-center justify-end gap-0.5">
      {isCustom && (
        <>
          <button onClick={() => onMove(f.id, -1)} className={iconBtn} title="Move up"><ArrowUp className="h-4 w-4" /></button>
          <button onClick={() => onMove(f.id, 1)} className={iconBtn} title="Move down"><ArrowDown className="h-4 w-4" /></button>
        </>
      )}
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

/* ============================ EDITOR ============================ */
function FestivalEditor({ draft, setDraft, slugEdited, setSlugEdited, onSave, onCancel }: {
  draft: Festival;
  setDraft: (f: Festival) => void;
  slugEdited: boolean;
  setSlugEdited: (b: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const upd = (p: Partial<Festival>) => setDraft({ ...draft, ...p });

  const uploadField = async (file: File, field: "thumbnail" | "desktopBanner" | "mobileBanner") => {
    setBusy(field);
    try { upd({ [field]: await uploadToCloudinary(file) } as Partial<Festival>); }
    catch { alert("Upload failed"); }
    setBusy(null);
  };

  // ----- seva ops -----
  const setSevas = (sevas: Seva[]) => upd({ sevas });
  const addSeva = () => setSevas([...draft.sevas, newSeva(draft.sevas.length)]);
  const updSeva = (id: string, p: Partial<Seva>) => setSevas(draft.sevas.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const delSeva = (id: string) => setSevas(draft.sevas.filter((s) => s.id !== id));
  const moveSeva = (idx: number, dir: -1 | 1) => {
    const arr = [...draft.sevas];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setSevas(arr.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-surface/90 backdrop-blur py-2 -my-2">
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><X className="h-4 w-4" /> Back to list</button>
        <button onClick={onSave} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> Save Festival</button>
      </div>

      {/* Basic info */}
      <Section title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Festival Title">
            <input className="inp" value={draft.title}
              onChange={(e) => { const title = e.target.value; upd(slugEdited ? { title } : { title, slug: slugify(title) }); }}
              placeholder="Janmashtami 2026" />
          </Field>
          <Field label="Slug">
            <input className="inp" value={draft.slug}
              onChange={(e) => { setSlugEdited(true); upd({ slug: slugify(e.target.value) }); }}
              placeholder="janmashtami-2026" />
          </Field>
          <Field label="Festival Date">
            <input type="date" className="inp" value={draft.date} onChange={(e) => upd({ date: e.target.value })} />
          </Field>
          <Field label="Location">
            <input className="inp" value={draft.location ?? ""} onChange={(e) => upd({ location: e.target.value })} placeholder="e.g. Main Temple Hall, ISKCON Kurnool" />
          </Field>
          <Field label="Short Description (card)">
            <input className="inp" value={draft.shortDescription} onChange={(e) => upd({ shortDescription: e.target.value })} placeholder="Celebrate the divine appearance of Lord Krishna" />
          </Field>
        </div>
      </Section>

      {/* Images */}
      <Section title="Images">
        <div className="flex flex-wrap gap-6">
          <UploadBox label="Card Thumbnail (1280 × 720)" url={draft.thumbnail} onPick={(f) => uploadField(f, "thumbnail")} aspect="aspect-video" className="w-full max-w-[180px]" />
          <UploadBox label="Desktop Banner (4917 × 1750)" url={draft.desktopBanner} onPick={(f) => uploadField(f, "desktopBanner")} aspect="aspect-video" className="w-full max-w-[180px]" />
          <UploadBox label="Mobile Banner (1080 × 1080)" url={draft.mobileBanner} onPick={(f) => uploadField(f, "mobileBanner")} aspect="aspect-square" className="w-full max-w-[110px]" />
        </div>
      </Section>

      {/* Description */}
      <Section title="Festival Description (About)">
        <RichTextEditor value={draft.description} onChange={(html) => upd({ description: html })} />
      </Section>

      {/* Schedule */}
      <Section title="Festival Schedule">
        <RichTextEditor value={draft.schedule ?? ""} onChange={(html) => upd({ schedule: html })} />
      </Section>

      {/* Status & schedule */}
      <Section title="Status & Schedule">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Status">
            <select className="inp" value={draft.status} onChange={(e) => upd({ status: e.target.value as Festival["status"] })}>
              <option value="draft">Draft (not public)</option>
              <option value="published">Published (public)</option>
            </select>
          </Field>
          <Field label="Visibility">
            <button type="button" onClick={() => upd({ hidden: !draft.hidden })} className={`inp text-left inline-flex items-center gap-2 ${draft.hidden ? "text-muted-foreground" : ""}`}>
              {draft.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {draft.hidden ? "Hidden" : "Visible"}
            </button>
          </Field>
          <Field label="Schedule Publish (auto)">
            <input type="datetime-local" className="inp" value={draft.publishAt ?? ""} onChange={(e) => upd({ publishAt: e.target.value || undefined })} />
          </Field>
          <Field label="Schedule Unpublish (auto)">
            <input type="datetime-local" className="inp" value={draft.unpublishAt ?? ""} onChange={(e) => upd({ unpublishAt: e.target.value || undefined })} />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Festival auto-publishes/unpublishes at the scheduled times.</p>
      </Section>

      {/* Sevas */}
      <Section title={`Sevas (${draft.sevas.length})`} action={<button onClick={addSeva} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add Seva</button>}>
        {draft.sevas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">No sevas yet. Add one to let devotees donate.</div>
        ) : (
          <div className="space-y-4">
            {draft.sevas.map((s, i) => (
              <SevaEditor key={s.id} seva={s} index={i} total={draft.sevas.length}
                onChange={(p) => updSeva(s.id, p)} onDelete={() => delSeva(s.id)} onMove={(dir) => moveSeva(i, dir)} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function SevaEditor({ seva, index, total, onChange, onDelete, onMove }: {
  seva: Seva; index: number; total: number;
  onChange: (p: Partial<Seva>) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void;
}) {
  const [busy, setBusy] = useState(false);
  const upload = async (file: File) => {
    setBusy(true);
    try { onChange({ thumbnail: await uploadToCloudinary(file) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };
  const setPrice = (i: number, p: Partial<SevaPrice>) => onChange({ prices: seva.prices.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const addPrice = () => onChange({ prices: [...seva.prices, { label: "Per Day", amount: 501 }] });
  const delPrice = (i: number) => onChange({ prices: seva.prices.filter((_, j) => j !== i) });
  const movePrice = (i: number, dir: -1 | 1) => {
    const arr = [...seva.prices]; const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; onChange({ prices: arr });
  };

  return (
    <div className="border rounded-xl p-4 bg-surface/40">
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Seva #{index + 1}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
          <button onClick={() => onChange({ active: !seva.active })} className="p-1.5 rounded hover:bg-muted" title={seva.active ? "Hide" : "Show"}>
            {seva.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid sm:grid-cols-[100px,1fr] gap-4">
        <UploadBox
          label=""
          url={seva.thumbnail}
          onPick={upload}
          aspect="aspect-square"
          className="w-full max-w-[100px]"
        />

        <div className="space-y-3">
          <input className="inp" placeholder="Seva title (e.g. Go Seva)" value={seva.title} onChange={(e) => onChange({ title: e.target.value })} />
          <textarea className="inp min-h-[60px]" placeholder="Short description" value={seva.description} onChange={(e) => onChange({ description: e.target.value })} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-foreground/70">Price Options</span>
              <button onClick={addPrice} className="text-xs text-accent inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add option</button>
            </div>
            <div className="space-y-2">
              {seva.prices.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className="inp flex-1" placeholder="Label (Per Day)" value={p.label} onChange={(e) => setPrice(i, { label: e.target.value })} />
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <input type="number" className="inp pl-6" placeholder="501" value={p.amount} onChange={(e) => setPrice(i, { amount: Number(e.target.value) })} />
                  </div>
                  <button onClick={() => movePrice(i, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => movePrice(i, 1)} disabled={i === seva.prices.length - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button onClick={() => delPrice(i)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ small helpers ============================ */
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-elegant p-5 sm:p-6 border">
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
