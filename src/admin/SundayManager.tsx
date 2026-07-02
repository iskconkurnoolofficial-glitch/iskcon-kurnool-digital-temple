import { useState } from "react";
import { useAdmin, uploadToCloudinary, SundayData, SundayScheduleItem, SundayGalleryItem, SundayLinkButton } from "@/context/AdminContext";
import { Trash2, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "schedule" | "gallery" | "buttons";

export default function SundayManager() {
  const { sunday, setSunday } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<SundayData>) => setSunday({ ...sunday, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "schedule", "gallery", "buttons"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-white text-foreground hover:bg-muted border border-border shadow-sm"
            }`}
          >
            {t === "buttons" ? "custom links" : t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab sunday={sunday} update={update} />}
      {tab === "schedule" && <ScheduleTab sunday={sunday} update={update} />}
      {tab === "gallery" && <GalleryTab sunday={sunday} update={update} />}
      {tab === "buttons" && <ButtonsTab sunday={sunday} update={update} />}
    </div>
  );
}

function SettingsTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [busy, setBusy] = useState(false);

  const pickImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      update({ logo: url });
    } catch {
      alert("Upload failed");
    }
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
      <h3 className="font-display text-xl font-bold text-primary mb-2">Sunday Program Settings</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <UploadBox label="Sunday Program Logo (Optional — defaults to main logo)" url={sunday.logo} onPick={pickImage} />
          {busy && <p className="text-xs text-muted-foreground animate-pulse">Uploading logo…</p>}
          {sunday.logo && (
            <button
              onClick={() => update({ logo: "" })}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Remove Custom Logo
            </button>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Visit Title</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={sunday.visitTitle || ""} 
              onChange={(e) => update({ visitTitle: e.target.value })} 
              placeholder="Visit ISKCON Kurnool" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Get Directions Map URL (Google Maps link)</label>
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              value={sunday.directionsUrl || ""} 
              onChange={(e) => update({ directionsUrl: e.target.value })} 
              placeholder="https://maps.app.goo.gl/..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visit Description</label>
            <textarea 
              className="w-full px-4 py-2.5 border rounded-lg" 
              rows={3}
              value={sunday.visitDescription || ""} 
              onChange={(e) => update({ visitDescription: e.target.value })} 
              placeholder="Experience peace, devotion, and spiritual happiness..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temple Address</label>
            <textarea 
              className="w-full px-4 py-2.5 border rounded-lg font-sans" 
              rows={3}
              value={sunday.address || ""} 
              onChange={(e) => update({ address: e.target.value })} 
              placeholder="ISKCON Kurnool..."
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <label className="block text-sm font-medium mb-1">About Sunday Program Description</label>
        <textarea 
          className="w-full px-4 py-2.5 border rounded-lg font-sans" 
          rows={4}
          value={sunday.description || ""} 
          onChange={(e) => update({ description: e.target.value })} 
          placeholder="Experience a spiritually uplifting Sunday..."
        />
      </div>
    </div>
  );
}

function ScheduleTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [time, setTime] = useState("");
  const [program, setProgram] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editProgram, setEditProgram] = useState("");

  const add = () => {
    if (!time || !program) return alert("Please enter both Time and Program name");
    update({
      schedule: [
        ...(sunday.schedule || []),
        { id: Date.now().toString(), time, program }
      ]
    });
    setTime("");
    setProgram("");
  };

  const startEdit = (item: SundayScheduleItem) => {
    setEditingId(item.id);
    setEditTime(item.time);
    setEditProgram(item.program);
  };

  const saveEdit = () => {
    if (!editTime || !editProgram) return alert("Time and Program details are required");
    update({
      schedule: (sunday.schedule || []).map((x) =>
        x.id === editingId ? { ...x, time: editTime, program: editProgram } : x
      )
    });
    setEditingId(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!sunday.schedule) return;
    const j = i + dir;
    if (j < 0 || j >= sunday.schedule.length) return;
    const copy = [...sunday.schedule];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ schedule: copy });
  };

  const list = sunday.schedule || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Weekly Schedule Item</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Range</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg"
              placeholder="e.g. 11:00 AM – 11:30 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Program Details</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg"
              placeholder="e.g. Hari Nama Sankirtana"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={add}
          className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Current Weekly Schedule ({list.length})</h3>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No schedule items added yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {list.map((item, i) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {editingId === item.id ? (
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <input
                      className="px-3 py-1.5 border rounded text-sm"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />
                    <input
                      className="px-3 py-1.5 border rounded text-sm"
                      value={editProgram}
                      onChange={(e) => setEditProgram(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="font-semibold text-accent min-w-44 text-sm bg-surface px-3 py-1 rounded border border-border">
                      {item.time}
                    </span>
                    <span className="text-foreground font-medium">{item.program}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded border text-xs text-foreground"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1.5 rounded hover:bg-accent/15 text-accent text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => update({ schedule: list.filter((x) => x.id !== item.id) })}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      setUrl(await uploadToCloudinary(f)); 
    } catch { 
      alert("Upload failed"); 
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) return alert("Upload an image first");
    update({ gallery: [...(sunday.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!sunday.gallery) return;
    const j = i + dir;
    if (j < 0 || j >= sunday.gallery.length) return;
    const copy = [...sunday.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  const list = sunday.gallery || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Sunday moments Photo</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Upload Image" url={url} onPick={onPick} />
          <div className="space-y-3">
            <input 
              className="w-full px-4 py-2.5 border rounded-lg" 
              placeholder="Caption (optional)" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)} 
            />
            <button 
              disabled={busy} 
              onClick={add} 
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Add Image"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Sunday Gallery ({list.length})</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((g, i) => (
            <div key={g.id} className="bg-white rounded-xl shadow border overflow-hidden">
              <img src={g.url} alt={g.label} className="w-full aspect-square object-cover" />
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium truncate">{g.label || "(no caption)"}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => update({ gallery: list.filter((x) => x.id !== g.id) })} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ButtonsTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const add = () => {
    if (!label || !url) return alert("Please enter both Button Label and URL link");
    update({
      buttons: [
        ...(sunday.buttons || []),
        { id: Date.now().toString(), label, url }
      ]
    });
    setLabel("");
    setUrl("");
  };

  const startEdit = (item: SundayLinkButton) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const saveEdit = () => {
    if (!editLabel || !editUrl) return alert("Label and URL are required");
    update({
      buttons: (sunday.buttons || []).map((x) =>
        x.id === editingId ? { ...x, label: editLabel, url: editUrl } : x
      )
    });
    setEditingId(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!sunday.buttons) return;
    const j = i + dir;
    if (j < 0 || j >= sunday.buttons.length) return;
    const copy = [...sunday.buttons];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ buttons: copy });
  };

  const list = sunday.buttons || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Custom Action Button / Link</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Label (e.g. Register for Sunday Program)</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg"
              placeholder="e.g. Register Now"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Destination URL Link</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={add}
          className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Add Button Link
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Custom Buttons ({list.length})</h3>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No custom buttons added yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {list.map((item, i) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {editingId === item.id ? (
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <input
                      className="px-3 py-1.5 border rounded text-sm"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                    />
                    <input
                      className="px-3 py-1.5 border rounded text-sm"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="font-semibold text-primary min-w-36 text-sm bg-purple-50 border border-purple-200 px-3 py-1 rounded">
                      {item.label}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline truncate"
                    >
                      {item.url}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded border text-xs text-foreground"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1.5 rounded hover:bg-accent/15 text-accent text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => update({ buttons: list.filter((x) => x.id !== item.id) })}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
