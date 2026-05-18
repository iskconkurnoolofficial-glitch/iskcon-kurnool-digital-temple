import { useState } from "react";
import { useAdmin, uploadToCloudinary, DailyClass } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, Upload, Radio, Calendar, Clock, Globe2, Link as LinkIcon, Pencil, X } from "lucide-react";

const LANGUAGES = ["Telugu", "English", "Hindi", "Sanskrit", "Tamil", "Kannada"];

function emptyDraft(): Partial<DailyClass> {
  return { title: "", durationMin: 60, language: "Telugu", joinUrl: "", active: true };
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

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, thumbnail: url }));
    } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const add = () => {
    if (!draft.title || !draft.startAt) { alert("Title and Start time are required"); return; }
    const item: DailyClass = {
      id: Date.now().toString(),
      thumbnail: draft.thumbnail || "",
      title: draft.title!,
      startAt: draft.startAt!,
      durationMin: Number(draft.durationMin) || 60,
      language: draft.language || "Telugu",
      joinUrl: draft.joinUrl || "",
      active: draft.active ?? true,
    };
    setClasses([item, ...classes]);
    setDraft(emptyDraft());
  };

  const now = Date.now();
  const sorted = [...classes].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-elegant p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Radio className="h-5 w-5 text-accent" /> Schedule a Daily Class
        </h3>

        <div className="grid lg:grid-cols-[260px,1fr] gap-6">
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-foreground/80 mb-1 block">Class Thumbnail</span>
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
            <Field label="Join URL (Zoom / YouTube)" className="sm:col-span-2">
              <input className="w-full px-3 py-2.5 border rounded-lg" value={draft.joinUrl || ""} onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <button disabled={busy} onClick={add} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                {busy ? "Uploading..." : "Add Class"}
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
              const start = new Date(c.startAt).getTime();
              const end = start + (c.durationMin || 60) * 60_000;
              const isLive = c.active && now >= start && now <= end;
              const isUpcoming = c.active && now < start;
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
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <div className="font-semibold text-foreground line-clamp-1">{c.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(c.startAt)}</div>
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
                      <button onClick={() => setClasses(classes.filter((x) => x.id !== c.id))} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"><Trash2 className="h-4 w-4" /></button>
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
