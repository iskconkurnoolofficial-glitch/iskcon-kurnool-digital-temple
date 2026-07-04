import { useState } from "react";
import { useAdmin, uploadToCloudinary, SundayData, SundayScheduleItem, SundayGalleryItem, SundayLinkButton, SundayActivityItem } from "@/context/AdminContext";
import { Trash2, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "schedule" | "activities" | "gallery" | "buttons";

export default function SundayManager() {
  const { sunday, setSunday } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<SundayData>) => setSunday({ ...sunday, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "schedule", "activities", "gallery", "buttons"] as Tab[]).map((t) => (
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
      {tab === "activities" && <ActivitiesTab sunday={sunday} update={update} />}
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

  const pickTimingsImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      update({ timingsImage: url });
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
          <UploadBox label="Sunday Program Logo (Optional)" url={sunday.logo} onPick={pickImage} aspect="aspect-square" className="w-full max-w-[100px]" />
          {sunday.logo && (
            <button
              onClick={() => update({ logo: "" })}
              className="text-xs text-destructive hover:underline flex items-center gap-1 mb-2"
            >
              <X className="h-3.5 w-3.5" /> Remove Custom Logo
            </button>
          )}

          <UploadBox label="Timings Section Image (Optional)" url={sunday.timingsImage} onPick={pickTimingsImage} aspect="aspect-video" className="w-full max-w-[180px]" />
          {sunday.timingsImage && (
            <button
              onClick={() => update({ timingsImage: "" })}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Remove Timings Image
            </button>
          )}
          {busy && <p className="text-xs text-muted-foreground animate-pulse mt-2">Uploading image…</p>}

          <div>
            <label className="block text-sm font-medium mb-1 mt-4">Visit Title</label>
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
        <div className="flex flex-col md:flex-row gap-6">
          <UploadBox label="Upload Image" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[140px] shrink-0" />
          <div className="flex-1 space-y-3">
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

function ActivitiesTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // States for adding a new activity
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addingBusy, setAddingBusy] = useState(false);

  const list = sunday.activities || [];

  const onPickNewImage = async (f: File) => {
    setAddingBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setNewUrl(url);
    } catch {
      alert("Upload failed");
    }
    setAddingBusy(false);
  };

  const addActivity = () => {
    if (!newTitle || !newDesc) {
      return alert("Title and Description are required");
    }
    if (list.length >= 6) {
      return alert("You can add a maximum of 6 activities");
    }

    const newItem: SundayActivityItem = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      image: newUrl
    };

    update({ activities: [...list, newItem] });
    
    // Reset states
    setNewTitle("");
    setNewDesc("");
    setNewUrl("");
  };

  const deleteActivity = (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      update({ activities: list.filter((x) => x.id !== id) });
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ activities: copy });
  };

  const onPickImage = async (id: string, f: File) => {
    setBusyId(id);
    try {
      const url = await uploadToCloudinary(f);
      const updated = list.map((x) =>
        x.id === id ? { ...x, image: url } : x
      );
      update({ activities: updated });
    } catch {
      alert("Upload failed");
    }
    setBusyId(null);
  };

  const removeImage = (id: string) => {
    const updated = list.map((x) =>
      x.id === id ? { ...x, image: "" } : x
    );
    update({ activities: updated });
  };

  const updateField = (id: string, field: "title" | "description", val: string) => {
    const updated = list.map((x) =>
      x.id === id ? { ...x, [field]: val } : x
    );
    update({ activities: updated });
  };

  return (
    <div className="space-y-6">
      {/* Add New Activity Card */}
      {list.length < 6 ? (
        <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
          <h3 className="font-display text-xl font-bold text-primary">Add New Feast Activity ({list.length}/6)</h3>
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <UploadBox 
                label="Activity Thumbnail" 
                url={newUrl} 
                onPick={onPickNewImage} 
                aspect="aspect-square"
                className="w-full max-w-[110px]"
              />
              {newUrl && (
                <button
                  onClick={() => setNewUrl("")}
                  className="text-xs text-destructive hover:underline flex items-center gap-1 mt-2"
                >
                  <X className="h-3.5 w-3.5" /> Remove Image
                </button>
              )}
              {addingBusy && (
                <p className="text-xs text-muted-foreground animate-pulse mt-2">Uploading image…</p>
              )}
            </div>

            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Activity Title</label>
                <input
                  className="w-full px-4 py-2.5 border rounded-lg"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Maha Prasadam Feast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2.5 border rounded-lg font-sans text-sm"
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the activity..."
                />
              </div>
            </div>
          </div>

          <button
            onClick={addActivity}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            Add Activity
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium">
          Maximum limit of 6 feast activities reached. Delete an existing activity to add a new one.
        </div>
      )}

      {/* List / Edit Existing Activities */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-2">Manage Current Activities ({list.length})</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Rearrange, edit, or delete activities. Dynamic layout automatically wraps and centers them cleanly (3 cards per row on desktop).
        </p>

        <div className="space-y-8 divide-y divide-border">
          {list.map((act, index) => (
            <div key={act.id} className={`pt-6 ${index === 0 ? "pt-0" : ""} space-y-4`}>
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-3 space-y-3">
                  <UploadBox 
                    label={`Image Thumbnail`} 
                    url={act.image} 
                    onPick={(f) => onPickImage(act.id, f)} 
                    aspect="aspect-square"
                    className="w-full max-w-[100px]"
                  />
                  {act.image && (
                    <button
                      onClick={() => removeImage(act.id)}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Remove Image
                    </button>
                  )}
                  {busyId === act.id && (
                    <p className="text-xs text-muted-foreground animate-pulse">Uploading image…</p>
                  )}
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Activity Title</label>
                    <input
                      className="w-full px-4 py-2.5 border rounded-lg font-semibold"
                      value={act.title || ""}
                      onChange={(e) => updateField(act.id, "title", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2.5 border rounded-lg font-sans text-sm"
                      rows={3}
                      value={act.description || ""}
                      onChange={(e) => updateField(act.id, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions for Ordering and Deleting */}
              <div className="flex items-center justify-end gap-1 pt-2">
                <button 
                  onClick={() => move(index, -1)} 
                  disabled={index === 0}
                  className="p-2 rounded hover:bg-muted disabled:opacity-30" 
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => move(index, 1)} 
                  disabled={index === list.length - 1}
                  className="p-2 rounded hover:bg-muted disabled:opacity-30" 
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteActivity(act.id)} 
                  className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto flex items-center gap-1 text-xs font-semibold" 
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" /> Delete Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
