import { useState } from "react";
import { useAdmin, uploadToCloudinary, DailyClass } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, Radio, Calendar, Clock, Globe2, 
  Link as LinkIcon, Pencil, Plus, Search 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

const LANGUAGES = ["Telugu", "English", "Hindi", "Sanskrit", "Tamil", "Kannada"];

function emptyDraft(): Partial<DailyClass> {
  return { title: "", description: "", durationMin: 60, language: "Telugu", joinUrl: "", active: true, everyday: false };
}

function fmt(dt: string) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  } catch { return dt; }
}

export default function DailyClassesManager() {
  const { classes, setClasses } = useAdmin();
  const [draft, setDraft] = useState<Partial<DailyClass>>(emptyDraft());
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

  const save = () => {
    if (!draft.title?.trim() || !draft.startAt) { 
      toast.error("Title and Start time are required"); 
      return; 
    }
    if (editingId) {
      setClasses(classes.map((c) => c.id === editingId ? { ...c, ...draft, durationMin: Number(draft.durationMin) || 60, everyday: !!draft.everyday } as DailyClass : c));
      toast.success("Daily class updated successfully!");
    } else {
      const item: DailyClass = {
        id: Date.now().toString(),
        thumbnail: draft.thumbnail || "",
        title: draft.title!,
        description: draft.description || "",
        startAt: draft.startAt!,
        durationMin: Number(draft.durationMin) || 60,
        language: draft.language || "Telugu",
        joinUrl: draft.joinUrl || "",
        active: draft.active ?? true,
        everyday: !!draft.everyday,
      };
      setClasses([item, ...classes]);
      toast.success("✨ New daily class scheduled successfully!");
    }
    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (c: DailyClass) => {
    setEditingId(c.id);
    setDraft({ ...c });
    setIsModalOpen(true);
  };

  const remove = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      setClasses(classes.filter((c) => c.id !== id));
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Class removed");
    }
  };

  const sorted = [...classes].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const filtered = sorted.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)) || (c.language && c.language.toLowerCase().includes(q));
  });

  const totalCount = classes.length;
  const activeCount = classes.filter((c) => c.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Radio className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Daily Classes & Discourses</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Satsang
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Schedule morning Srimad Bhagavatam and Bhagavad Gita discourses with live streaming links, zoom sessions, and multi-language selections.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Classes</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Active</span>
              <strong className="font-display text-lg text-green-600">{activeCount}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Class
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search classes by title or language..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none text-xs sm:text-sm shadow-2xs"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => {
          let start = new Date(c.startAt).getTime();
          if (c.everyday) {
            const dt = new Date(c.startAt);
            const startToday = new Date();
            startToday.setHours(dt.getHours(), dt.getMinutes(), 0, 0);
            start = startToday.getTime();
          }
          const end = start + (c.durationMin || 60) * 60_000;
          const nowMs = Date.now();
          const isLive = c.active && nowMs >= start && nowMs <= end;
          const isUpcoming = c.active && nowMs < start;
          const isCompleted = c.active && nowMs > end;

          return (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-slate-100 text-slate-400">
                      <Radio className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white font-sans text-xs font-bold px-2.5 py-1 rounded-full">
                    {c.language}
                  </span>
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {isLive && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live Now
                      </span>
                    )}
                    {isUpcoming && !isLive && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Upcoming
                      </span>
                    )}
                    {c.everyday && (
                      <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Daily
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {fmt(c.startAt)} · {c.durationMin}m
                  </div>
                  <h4 className="font-display font-bold text-base text-foreground line-clamp-1">
                    {c.title}
                  </h4>
                  {c.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                  {c.joinUrl && (
                    <a
                      href={c.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline pt-1 truncate max-w-full"
                    >
                      <LinkIcon className="h-3 w-3 shrink-0" /> Open Class Link
                    </a>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => setClasses(classes.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    c.active !== false ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-muted-foreground"
                  }`}
                  title={c.active !== false ? "Hide from website" : "Make active"}
                >
                  {c.active !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => remove(c.id, c.title)}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Class"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL FOR ADD / EDIT CLASS */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Daily Class" : "Schedule New Daily Class"}
        subtitle="Configure class title, timings, streaming/zoom link, and language"
        icon={Radio}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-[160px,1fr] gap-5 items-start">
            <UploadBox
              label="Class Thumbnail"
              url={draft.thumbnail}
              onPick={upload}
              aspect="aspect-video"
              className="w-full max-w-[160px]"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Class Title <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={draft.title || ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Daily Srimad Bhagavatam Discourse"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Language
                </label>
                <select
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={draft.language}
                  onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Start Time (IST) <span className="text-destructive">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={draft.startAt ? draft.startAt.slice(0, 16) : ""}
                onChange={(e) => setDraft({ ...draft, startAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={draft.durationMin || 60}
                onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Join Link / Live Stream URL
            </label>
            <input
              type="url"
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={draft.joinUrl || ""}
              onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })}
              placeholder="https://zoom.us/j/... or https://youtube.com/live/..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Description / Speaker Details
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={draft.description || ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Topic, sloka chapter, speaker name..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.everyday ?? false}
                onChange={(e) => setDraft({ ...draft, everyday: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>Repeats Everyday</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>Active on Website</span>
            </label>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : (editingId ? "Save Class Changes" : "Schedule Class")}
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
