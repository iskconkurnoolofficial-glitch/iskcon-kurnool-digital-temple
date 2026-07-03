import { useState } from "react";
import { useAdmin, uploadToCloudinary, PrahladaBadiData, PrahladaBadiActivity } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Star, Pencil, X } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "activities" | "gallery" | "reviews";

export default function PrahladaBadiManager() {
  const { prahladaBadi, setPrahladaBadi } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<PrahladaBadiData>) => {
    setPrahladaBadi({ ...prahladaBadi, ...patch });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "activities", "gallery", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab data={prahladaBadi} update={update} />}
      {tab === "activities" && <ActivitiesTab data={prahladaBadi} update={update} />}
      {tab === "gallery" && <GalleryTab data={prahladaBadi} update={update} />}
      {tab === "reviews" && <ReviewsTab data={prahladaBadi} update={update} />}
    </div>
  );
}

function SettingsTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [busy, setBusy] = useState(false);

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      update({ heroImage: url });
    } catch {
      alert("Hero image upload failed");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Registration Settings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Hero Banner Image (Cloudinary)" url={data.heroImage} onPick={pickHeroImage} />
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Registration Status</label>
              <select
                className="w-full px-4 py-2.5 border rounded-lg bg-white"
                value={data.regStatus}
                onChange={(e) => update({ regStatus: e.target.value as any })}
              >
                <option value="Open">Registrations Open</option>
                <option value="Closed">Registrations Closed</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Form URL</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border rounded-lg"
                value={data.registerUrl || ""}
                onChange={(e) => update({ registerUrl: e.target.value })}
                placeholder="https://docs.google.com/forms/..."
              />
            </div>
          </div>
        </div>
        {busy && <p className="text-xs text-muted-foreground animate-pulse">Uploading banner image…</p>}
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-primary">Program Schedule & Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border rounded-lg"
                value={data.startDate || ""}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border rounded-lg"
                value={data.endDate || ""}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timings (e.g. 8:00 AM – 11:30 AM)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-lg"
              value={data.timings || ""}
              onChange={(e) => update({ timings: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue Address (English)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-lg"
              value={data.venueEn || ""}
              onChange={(e) => update({ venueEn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue Address (Telugu)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-lg"
              value={data.venueTel || ""}
              onChange={(e) => update({ venueTel: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Note (English)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-lg"
              value={data.footerNoteEn || ""}
              onChange={(e) => update({ footerNoteEn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Note (Telugu)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border rounded-lg"
              value={data.footerNoteTel || ""}
              onChange={(e) => update({ footerNoteTel: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-primary">Fees & Contact Details</h3>
          <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
            <h4 className="font-semibold text-sm">Fee Tier 1 (Lower Class)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Label En"
                value={data.feeTier1LabelEn}
                onChange={(e) => update({ feeTier1LabelEn: e.target.value })}
              />
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Label Tel"
                value={data.feeTier1LabelTel}
                onChange={(e) => update({ feeTier1LabelTel: e.target.value })}
              />
            </div>
            <input
              className="w-full px-3 py-2 border rounded-lg text-xs"
              placeholder="Amount (e.g. 500)"
              value={data.feeTier1Amount}
              onChange={(e) => update({ feeTier1Amount: e.target.value })}
            />
          </div>

          <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
            <h4 className="font-semibold text-sm">Fee Tier 2 (Upper Class)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Label En"
                value={data.feeTier2LabelEn}
                onChange={(e) => update({ feeTier2LabelEn: e.target.value })}
              />
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Label Tel"
                value={data.feeTier2LabelTel}
                onChange={(e) => update({ feeTier2LabelTel: e.target.value })}
              />
            </div>
            <input
              className="w-full px-3 py-2 border rounded-lg text-xs"
              placeholder="Amount (e.g. 700)"
              value={data.feeTier2Amount}
              onChange={(e) => update({ feeTier2Amount: e.target.value })}
            />
          </div>

          <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
            <h4 className="font-semibold text-sm">Contact Person</h4>
            <input
              className="w-full px-3 py-2 border rounded-lg text-xs"
              placeholder="Name"
              value={data.contactName}
              onChange={(e) => update({ contactName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Title En"
                value={data.contactTitleEn}
                onChange={(e) => update({ contactTitleEn: e.target.value })}
              />
              <input
                className="px-3 py-2 border rounded-lg text-xs"
                placeholder="Title Tel"
                value={data.contactTitleTel}
                onChange={(e) => update({ contactTitleTel: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                className="px-2 py-2 border rounded-lg text-[10px]"
                placeholder="Phone 1"
                value={data.phone1}
                onChange={(e) => update({ phone1: e.target.value })}
              />
              <input
                className="px-2 py-2 border rounded-lg text-[10px]"
                placeholder="Phone 2"
                value={data.phone2 || ""}
                onChange={(e) => update({ phone2: e.target.value })}
              />
              <input
                className="px-2 py-2 border rounded-lg text-[10px]"
                placeholder="Phone 3"
                value={data.phone3 || ""}
                onChange={(e) => update({ phone3: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitiesTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [titleEn, setTitleEn] = useState("");
  const [titleTel, setTitleTel] = useState("");
  const [icon, setIcon] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (act: PrahladaBadiActivity) => {
    setEditingId(act.id);
    setTitleEn(act.titleEn);
    setTitleTel(act.titleTel);
    setIcon(act.icon);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleTel("");
    setIcon("");
  };

  const save = () => {
    if (!titleEn.trim() || !titleTel.trim()) return alert("Enter English and Telugu titles");
    
    if (editingId) {
      const activities = (data.activities || []).map((a) =>
        a.id === editingId ? { ...a, titleEn: titleEn.trim(), titleTel: titleTel.trim(), icon: icon.trim() } : a
      );
      update({ activities });
    } else {
      const order = (data.activities || []).length + 1;
      const newItem: PrahladaBadiActivity = {
        id: Date.now().toString(),
        titleEn: titleEn.trim(),
        titleTel: titleTel.trim(),
        icon: icon.trim() || "📖",
        order,
      };
      update({ activities: [...(data.activities || []), newItem] });
    }
    cancelEdit();
  };

  const remove = (id: string) => {
    const list = (data.activities || []).filter((x) => x.id !== id);
    // Recalculate order
    const activities = list.map((x, idx) => ({ ...x, order: idx + 1 }));
    update({ activities });
  };

  const move = (i: number, dir: -1 | 1) => {
    const list = data.activities || [];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    // Update order values
    const activities = copy.map((x, idx) => ({ ...x, order: idx + 1 }));
    update({ activities });
  };

  const list = data.activities || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">
          {editingId ? "Edit Activity" : "Add Activity"}
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="px-4 py-2.5 border rounded-lg"
            placeholder="English Title"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
          <input
            className="px-4 py-2.5 border rounded-lg"
            placeholder="Telugu Title"
            value={titleTel}
            onChange={(e) => setTitleTel(e.target.value)}
          />
          <input
            className="px-4 py-2.5 border rounded-lg"
            placeholder="Emoji / Icon (e.g. 📖)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-1"
          >
            {editingId ? "Save Changes" : <><Plus className="h-4 w-4" /> Add Activity</>}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2.5 rounded-lg bg-muted text-foreground font-medium flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Activities List ({list.length})</h3>
        <div className="bg-white rounded-2xl shadow border overflow-hidden divide-y">
          {list.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">No activities listed. Add some above.</p>
          ) : (
            list
              .sort((a, b) => a.order - b.order)
              .map((act, i) => (
                <div key={act.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition">
                  <div className="h-10 w-10 rounded-full bg-secondary text-primary font-bold flex items-center justify-center shrink-0">
                    {act.order}
                  </div>
                  <div className="text-2xl shrink-0">{act.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-primary">{act.titleEn}</div>
                    <div className="text-sm text-muted-foreground truncate">{act.titleTel}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => move(i, -1)}
                      className="p-2 rounded hover:bg-muted"
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      className="p-2 rounded hover:bg-muted"
                      disabled={i === list.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startEdit(act)}
                      className="p-2 rounded hover:bg-accent/10 text-accent"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(act.id)}
                      className="p-2 rounded hover:bg-destructive/10 text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try {
      setUrl(await uploadToCloudinary(f));
    } catch {
      alert("Image upload failed");
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) return alert("Upload an image first");
    update({ gallery: [...(data.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl("");
    setLabel("");
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!data.gallery) return;
    const j = i + dir;
    if (j < 0 || j >= data.gallery.length) return;
    const copy = [...data.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  const list = data.gallery || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Past Year Image</h3>
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
        <h3 className="font-display text-xl font-bold text-primary mb-4">Gallery ({list.length})</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((g, i) => (
            <div key={g.id} className="bg-white rounded-xl shadow border overflow-hidden">
              <img src={g.url} alt={g.label} className="w-full aspect-square object-cover" />
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium truncate">{g.label || "(no caption)"}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => update({ gallery: list.filter((x) => x.id !== g.id) })}
                    className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const add = () => {
    if (!name.trim() || !text.trim()) return alert("Enter reviewer name and text");
    const reviews = data.reviews || [];
    update({
      reviews: [
        ...reviews,
        { id: Date.now().toString(), name: name.trim(), text: text.trim(), rating, visible: true },
      ],
    });
    setName("");
    setText("");
    setRating(5);
  };

  const toggleVisible = (id: string) => {
    const list = data.reviews || [];
    update({
      reviews: list.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)),
    });
  };

  const remove = (id: string) => {
    const list = data.reviews || [];
    update({ reviews: list.filter((x) => x.id !== id) });
  };

  const list = data.reviews || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Add Review / Testimonial</h3>
        <input
          className="w-full px-4 py-2.5 border rounded-lg"
          placeholder="Parent / Participant Name (e.g. Srinivas (Parent))"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full px-4 py-2.5 border rounded-lg"
          rows={3}
          placeholder="Review text content"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rating:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={`h-5 w-5 ${n <= rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <button
          onClick={add}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Reviews & Feedback ({list.length})</h3>
        {list.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow border p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{r.name}</span>
                <span className="flex">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{r.text}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggleVisible(r.id)} className="p-2 rounded hover:bg-muted" aria-label="Toggle visible">
                {r.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={() => remove(r.id)} className="p-2 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
