import { useState } from "react";
import { useAdmin, uploadToCloudinary, SundayData, SundayScheduleItem, SundayGalleryItem, SundayLinkButton, SundayActivityItem, SundaySponsor } from "@/context/AdminContext";
import { Trash2, ArrowUp, ArrowDown, X, Check, Pencil, Plus, Eye, EyeOff, Sparkles, Calendar, Heart, Gift, Users } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "sponsors" | "schedule" | "activities" | "gallery";

export default function SundayManager() {
  const { sunday, setSunday } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<SundayData>) => setSunday({ ...sunday, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "sponsors", "schedule", "activities", "gallery"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-white text-foreground hover:bg-muted border border-border shadow-sm"
            }`}
          >
            {t === "sponsors" ? "Feast Sponsors" : t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab sunday={sunday} update={update} />}
      {tab === "sponsors" && <SponsorsTab sunday={sunday} update={update} />}
      {tab === "schedule" && <ScheduleTab sunday={sunday} update={update} />}
      {tab === "activities" && <ActivitiesTab sunday={sunday} update={update} />}
      {tab === "gallery" && <GalleryTab sunday={sunday} update={update} />}
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

      {/* Dedicated Sunday Feast Online Sponsorship Seva Configuration */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" /> Sunday Feast Online Sponsorship Seva (Single Amount)
            </h4>
            <p className="text-xs text-muted-foreground">
              Configure the single fixed sponsorship amount and details displayed on the website. Devotees clicking this will be taken directly to the dedicated Sunday Feast checkout page.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={sunday.donationCardEnabled !== false}
              onChange={(e) => update({ donationCardEnabled: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            Show Donation Section
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border">
          <div>
            <label className="block text-sm font-bold mb-1">
              Sponsorship Amount (₹) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                className="w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white font-sans text-base font-bold text-primary"
                value={sunday.donationCardAmount || "5001"}
                onChange={(e) => update({ donationCardAmount: e.target.value })}
                placeholder="5001"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              This exact amount will be pre-filled on the dedicated Sunday Feast checkout page.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Button Label</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white"
              value={sunday.donationCardButtonLabel || "Sponsor Sunday Feast Online"}
              onChange={(e) => update({ donationCardButtonLabel: e.target.value })}
              placeholder="e.g. Sponsor Sunday Feast Online"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">Seva Title</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white"
              value={sunday.donationCardTitle || "Sunday Feast Annadana Seva"}
              onChange={(e) => update({ donationCardTitle: e.target.value })}
              placeholder="e.g. Sunday Feast Annadana Seva"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">Seva Purpose & Description</label>
            <textarea
              className="w-full px-4 py-2.5 border rounded-lg bg-white font-sans text-sm"
              rows={3}
              value={sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family."}
              onChange={(e) => update({ donationCardDescription: e.target.value })}
              placeholder="Explain the significance and purpose of sponsoring the Sunday Feast prasadam..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">Dedicated Checkout Page Slug / Link (Optional)</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white text-sm font-mono"
              value={sunday.donationCardButtonUrl || "/donate/sunday-feast"}
              onChange={(e) => update({ donationCardButtonUrl: e.target.value })}
              placeholder="/donate/sunday-feast"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Default is <code className="text-primary font-bold">/donate/sunday-feast</code>
            </p>
          </div>
        </div>
      </div>

      {/* Live Announcement Ticker Configuration */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Moving Announcement Ticker
            </h4>
            <p className="text-xs text-muted-foreground">
              Displays a continuous moving banner directly below the Sunday Hero banner with sponsor details and a "View" scroll button.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={sunday.tickerEnabled !== false}
              onChange={(e) => update({ tickerEnabled: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            Enable Ticker
          </label>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border space-y-3">
          <label className="block text-sm font-bold mb-1">
            Custom Ticker Announcement Text (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full px-4 py-2.5 border rounded-lg bg-white font-sans text-sm"
            value={sunday.tickerText || ""}
            onChange={(e) => update({ tickerText: e.target.value })}
            placeholder="Leave empty to automatically display this week's active sponsor name, date, occasion, and blessings."
          />
          <p className="text-[11px] text-muted-foreground">
            💡 If left blank, it automatically shows: <em>"✨ This Sunday Feast Sponsored By: [Active Sponsor] • Date: [Feast Date] • Occasion: [Occasion] • May Sri Sri Puri Jagannath bestow abundant bhakti & peace!"</em>
          </p>
        </div>
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
    update({ activities: list.filter((x) => x.id !== id) });
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

function SponsorsTab({
  sunday,
  update,
}: {
  sunday: SundayData;
  update: (p: Partial<SundayData>) => void;
}) {
  const sponsors = sunday.sponsors || [];
  const [draft, setDraft] = useState<Partial<SundaySponsor>>({
    sponsorName: "",
    familyName: "",
    occasion: "Auspicious Occasion / General Seva",
    date: "",
    details: "Sunday Feast prasadam distribution lovingly sponsored as seva for the pleasure of Sri Sri Jagannath, Baladeva, Subhadra Maharani and all visiting devotees.",
    active: true,
    images: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const OCCASIONS = [
    "Birthday",
    "Wedding Anniversary",
    "Memorial / In Loving Memory",
    "Auspicious Milestone",
    "General Seva",
    "Custom"
  ];

  const resetForm = () => {
    setDraft({
      sponsorName: "",
      familyName: "",
      occasion: "Auspicious Occasion / General Seva",
      date: "",
      details: "Sunday Feast prasadam distribution lovingly sponsored as seva for the pleasure of Sri Sri Jagannath, Baladeva, Subhadra Maharani and all visiting devotees.",
      active: true,
      images: [],
    });
    setEditingId(null);
    setUploadingSlot(null);
  };

  const handleUploadImage = async (slotIndex: number, file: File) => {
    setUploadingSlot(slotIndex);
    try {
      const url = await uploadToCloudinary(file);
      const currentImages = [...(draft.images || [])];
      // Ensure array has enough elements
      while (currentImages.length <= slotIndex) {
        currentImages.push("");
      }
      currentImages[slotIndex] = url;
      setDraft({ ...draft, images: currentImages.filter(Boolean) });
    } catch (e) {
      console.error(e);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveImage = (slotIndex: number) => {
    const currentImages = [...(draft.images || [])];
    currentImages.splice(slotIndex, 1);
    setDraft({ ...draft, images: currentImages.filter(Boolean) });
  };

  const save = () => {
    if (!draft.sponsorName?.trim()) {
      alert("Please enter the Sponsor Name.");
      return;
    }

    const item: SundaySponsor = {
      id: editingId || `sponsor_${Date.now()}`,
      sponsorName: draft.sponsorName.trim(),
      familyName: draft.familyName?.trim() || "",
      occasion: draft.occasion?.trim() || "General Seva",
      date: draft.date?.trim() || "",
      details: draft.details?.trim() || "",
      active: draft.active !== false,
      images: (draft.images || []).filter(Boolean),
    };

    if (editingId) {
      update({ sponsors: sponsors.map((s) => (s.id === editingId ? item : s)) });
    } else {
      update({ sponsors: [item, ...sponsors] });
    }
    resetForm();
  };

  const startEdit = (s: SundaySponsor) => {
    setEditingId(s.id);
    setDraft({ ...s, images: s.images || [] });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleActive = (id: string) => {
    update({
      sponsors: sponsors.map((s) => (s.id === id ? { ...s, active: s.active === false ? true : false } : s)),
    });
  };

  const deleteSponsor = (id: string) => {
    update({ sponsors: sponsors.filter((s) => s.id !== id) });
    if (editingId === id) resetForm();
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sponsors.length) return;
    const next = [...sponsors];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    update({ sponsors: next });
  };

  return (
    <div className="space-y-8">
      {/* Form: Add / Edit Sponsor */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {editingId ? "Edit Sunday Feast Sponsor" : "Add Sunday Feast Sponsor"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
              <X className="h-4 w-4" /> Cancel Editing
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sponsor Name <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white"
              value={draft.sponsorName || ""}
              onChange={(e) => setDraft({ ...draft, sponsorName: e.target.value })}
              placeholder="e.g. Sri Radha Raman Das or Sri XYZ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Family Name (Optional)
            </label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white"
              value={draft.familyName || ""}
              onChange={(e) => setDraft({ ...draft, familyName: e.target.value })}
              placeholder="e.g. & Family or Sharma Family"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Occasion / Reason</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setDraft({ ...draft, occasion: occ === "Custom" ? "" : occ })}
                    className={`px-2.5 py-1 text-xs rounded-full border transition font-medium ${
                      draft.occasion === occ || (occ === "Custom" && !OCCASIONS.slice(0, 5).includes(draft.occasion || ""))
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-foreground hover:bg-muted border-border"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
              <input
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white"
                value={draft.occasion || ""}
                onChange={(e) => setDraft({ ...draft, occasion: e.target.value })}
                placeholder="e.g. 50th Birthday / Wedding Anniversary / In Loving Memory of..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              className="w-full px-4 py-2.5 border rounded-lg bg-white font-sans text-sm"
              value={draft.date || ""}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              placeholder="e.g. 23/08/2026 or Sunday, 23 August 2026"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Tip: You can write "Upcoming Sunday" or a specific date like "23/08/2026".
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Feast / Sponsorship Details</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2.5 border rounded-lg bg-white font-sans text-sm"
            value={draft.details || ""}
            onChange={(e) => setDraft({ ...draft, details: e.target.value })}
            placeholder="e.g. Sunday Feast sponsored as Seva for the pleasure of Sri Sri Jagannath..."
          />
        </div>

        {/* 4-Image Carousel Upload Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-primary">
                Sponsor Celebration / Seva Photos (Up to 4 Images for Carousel Slider)
              </label>
              <p className="text-xs text-muted-foreground">
                Upload photos of the family, deity arati, feast distribution, or occasion celebration to display in an auto-scrolling photo carousel.
              </p>
            </div>
            <span className="text-xs font-semibold text-accent px-2.5 py-1 bg-accent/10 rounded-full">
              {(draft.images || []).length}/4 Photos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((slotIdx) => {
              const imgUrl = (draft.images || [])[slotIdx];
              const isUploading = uploadingSlot === slotIdx;

              return (
                <div key={slotIdx} className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">Photo {slotIdx + 1}</span>
                  <div className="relative aspect-video sm:aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-border/80 overflow-hidden group hover:border-primary transition">
                    {imgUrl ? (
                      <>
                        <img src={imgUrl} alt={`Photo ${slotIdx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <label className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer shadow-sm" title="Change Photo">
                            <Pencil className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleUploadImage(slotIdx, e.target.files[0])}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(slotIdx)}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
                            title="Remove Photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-primary/5 transition">
                        {isUploading ? (
                          <div className="text-xs font-semibold text-primary animate-pulse">Uploading...</div>
                        ) : (
                          <>
                            <div className="p-2 rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition mb-1">
                              <Plus className="h-4 w-4 text-slate-500 group-hover:text-primary" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-600">Upload Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => e.target.files?.[0] && handleUploadImage(slotIdx, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={draft.active !== false}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            Active (Display on Website)
          </label>

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={save}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-semibold text-sm shadow-sm transition"
            >
              {editingId ? "Update Sponsor" : "Add Sponsor"}
            </button>
          </div>
        </div>
      </div>

      {/* Sponsors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-primary">
            Configured Sunday Feast Sponsors ({sponsors.length})
          </h3>
        </div>

        {sponsors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border text-muted-foreground text-sm">
            No Sunday Feast sponsors added yet. Use the form above to add the current or upcoming Sunday's sponsors.
          </div>
        ) : (
          <div className="grid gap-4">
            {sponsors.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  s.active === false ? "opacity-60 bg-slate-50" : ""
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display font-bold text-lg text-primary">
                      {s.sponsorName} {s.familyName && <span className="text-secondary font-semibold">{s.familyName}</span>}
                    </h4>
                    {s.active === false ? (
                      <span className="text-[10px] uppercase font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {s.occasion && (
                      <span className="font-medium text-foreground bg-surface border px-2.5 py-0.5 rounded-full">
                        {s.occasion}
                      </span>
                    )}
                    {s.date && <span>📅 Date: {s.date}</span>}
                  </div>

                  {s.details && (
                    <p className="text-xs text-slate-600 italic line-clamp-2 pt-1 font-sans">
                      "{s.details}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded hover:bg-muted disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === sponsors.length - 1}
                    className="p-2 rounded hover:bg-muted disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(s.id)}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title={s.active === false ? "Show on website" : "Hide from website"}
                  >
                    {s.active === false ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => startEdit(s)}
                    className="p-2 rounded hover:bg-accent/10 text-accent font-medium text-xs flex items-center gap-1"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => deleteSponsor(s.id)}
                    className="p-2 rounded hover:bg-destructive/10 text-destructive font-medium text-xs flex items-center gap-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

