import { useState } from "react";
import { useAdmin, uploadToCloudinary, DailyClass } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, Upload, Radio, Calendar, Clock, Globe2, Link as LinkIcon, Pencil, X } from "lucide-react";
import { UploadBox } from "./CarouselManager";

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
    if (!draft.title || !draft.startAt) { alert("Title and Start time are required"); return; }
    if (editingId) {
      setClasses(classes.map((c) => c.id === editingId ? { ...c, ...draft, durationMin: Number(draft.durationMin) || 60, everyday: !!draft.everyday } as DailyClass : c));
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
    }
    resetForm();
  };

  const startEdit = (c: DailyClass) => {
    setEditingId(c.id);
    setDraft({ ...c });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const now = Date.now();
  const sorted = [...classes].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-elegant p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Radio className="h-5 w-5 text-accent" /> {editingId ? "Edit Class" : "Schedule a Daily Class"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><X className="h-4 w-4" /> Cancel</button>
          )}
        </div>

        <div className="grid lg:grid-cols-[220px,1fr] gap-6">
          <UploadBox
            label="Class Thumbnail"
            url={draft.thumbnail}
            onPick={upload}
            aspect="aspect-video"
            className="w-full max-w-[180px]"
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Bhagavad Gita Class" />
            </Field>
            <Field label="Language">
              <select className="w-full px-3 py-2.5 border rounded-lg bg-white" value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Date & Time (IST)">
              <input type="datetime-local" className="w-full px-3 py-2.5 border rounded-lg" value={draft.startAt || ""} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })} />
            </Field>
            <Field label="Duration (minutes)">
              <input type="number" min={5} step={5} className="w-full px-3 py-2.5 border rounded-lg" value={draft.durationMin || 60} onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })} />
            </Field>
            <Field label="Join URL (Zoom / YouTube / Meet)" className="sm:col-span-2">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.joinUrl || ""} onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea className="w-full px-3 py-2.5 border rounded-lg resize-y min-h-[80px]" value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Brief summary, speaker name, or topic details..." />
            </Field>
            <div className="sm:col-span-2 flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="everyday" 
                checked={!!draft.everyday} 
                onChange={(e) => setDraft({ ...draft, everyday: e.target.checked })} 
                className="h-4.5 w-4.5 text-primary border-border rounded focus:ring-primary cursor-pointer" 
              />
              <label htmlFor="everyday" className="text-sm font-medium text-foreground/80 cursor-pointer select-none">
                Repeat Every Day (Daily Recurring Class)
              </label>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button disabled={busy} onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 cursor-pointer">
                {busy ? "Uploading..." : editingId ? "Update Class" : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Scheduled Classes ({classes.length})</h3>
        {classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border">No classes yet. Add your first one above.</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((c) => {
              let start = new Date(c.startAt).getTime();
              if (c.everyday) {
                const dt = new Date(c.startAt);
                const startToday = new Date(now);
                startToday.setHours(dt.getHours(), dt.getMinutes(), 0, 0);
                start = startToday.getTime();
              }
              const end = start + (c.durationMin || 60) * 60_000;
              const isLive = c.active && now >= start && now <= end;
              const isUpcoming = c.active && now < start;
              const isCompleted = c.active && now > end;
              return (
                <div key={c.id} className="bg-white rounded-xl shadow border overflow-hidden flex flex-col">
                  <div className="relative aspect-video bg-muted">
                    {c.thumbnail ? (
                      <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground"><Radio className="h-8 w-8" /></div>
                    )}
                    {isLive && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live Now
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Upcoming</span>
                    )}
                    {isCompleted && (
                      <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-green-200">Completed</span>
                    )}
                    {c.everyday && (
                      <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow">Daily</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <div className="font-semibold text-foreground line-clamp-1">{c.title}</div>
                    {c.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{c.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {c.everyday 
                          ? `Every day at ${new Date(c.startAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}` 
                          : fmt(c.startAt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.durationMin}m</span>
                      <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" /> {c.language}</span>
                    </div>
                    {c.joinUrl && (
                      <a href={c.joinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1 hover:underline truncate">
                        <LinkIcon className="h-3 w-3" /> {c.joinUrl}
                      </a>
                    )}
                    <div className="flex gap-1 mt-auto pt-2">
                      <button onClick={() => setClasses(classes.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))} className="p-2 rounded hover:bg-muted" aria-label="Toggle">
                        {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <button onClick={() => startEdit(c)} className="p-2 rounded hover:bg-accent/10 text-accent" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setClasses(classes.filter((x) => x.id !== c.id))} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
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
