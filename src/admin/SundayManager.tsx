import { useState } from "react";
import { useAdmin, uploadToCloudinary, SundayData, SundayScheduleItem, SundayGalleryItem, SundayActivityItem, SundaySponsor } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, ArrowUp, ArrowDown, X, Pencil, Plus, Eye, EyeOff, Sparkles, 
  Calendar, Heart, Gift, Users, Clock, Image as ImageIcon, HeartHandshake 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

type Tab = "settings" | "sponsors" | "schedule" | "activities" | "gallery";

export default function SundayManager() {
  const { sunday, setSunday } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<SundayData>) => {
    setSunday({ ...sunday, ...patch });
    toast.success("Sunday program settings updated!");
  };

  const scheduleCount = (sunday.schedule || []).length;
  const sponsorsCount = (sunday.sponsors || []).length;
  const activitiesCount = (sunday.activities || []).length;
  const galleryCount = (sunday.gallery || []).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Sunday Love Feast & Satsang</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Weekly Festival
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage the Grand Sunday Feast, weekly program schedules, feast sponsorship announcements, activities, and devotional photo moments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Sponsors</span>
              <strong className="font-display text-lg text-primary">{sponsorsCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Schedule</span>
              <strong className="font-display text-lg text-amber-700">{scheduleCount}</strong>
            </div>
            <a
              href="/sunday-program"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Sunday Page
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "settings", label: "Hero & Ticker Settings" },
          { id: "sponsors", label: `Feast Sponsors (${sponsorsCount})` },
          { id: "schedule", label: `Program Schedule (${scheduleCount})` },
          { id: "activities", label: `Feast Activities (${activitiesCount})` },
          { id: "gallery", label: `Moments Gallery (${galleryCount})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              tab === t.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
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
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/SundayFeast");
      update({ logo: url });
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const pickTimingsImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/SundayFeast");
      update({ timingsImage: url });
      toast.success("Timings section image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Hero Section & Branding
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <UploadBox label="Sunday Program Custom Logo" url={sunday.logo} onPick={pickImage} aspect="aspect-square" className="w-full max-w-[120px]" />
            {sunday.logo && (
              <button
                type="button"
                onClick={() => update({ logo: "" })}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Remove Custom Logo
              </button>
            )}

            <div>
              <label className={labelClass}>Visit Title</label>
              <input 
                className={inputClass} 
                value={sunday.visitTitle || ""} 
                onChange={(e) => update({ visitTitle: e.target.value })} 
                placeholder="Visit ISKCON Kurnool" 
              />
            </div>
            <div>
              <label className={labelClass}>Schedule Section Title</label>
              <input 
                className={inputClass} 
                value={sunday.scheduleTitle || ""} 
                onChange={(e) => update({ scheduleTitle: e.target.value })} 
                placeholder="Weekly Schedule (Every Sunday)" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <UploadBox label="Timings Section Image" url={sunday.timingsImage} onPick={pickTimingsImage} aspect="aspect-video" className="w-full max-w-[200px]" />
            {sunday.timingsImage && (
              <button
                type="button"
                onClick={() => update({ timingsImage: "" })}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Remove Timings Image
              </button>
            )}

            <div>
              <label className={labelClass}>Temple Address / Location</label>
              <textarea 
                className={inputClass} 
                rows={2}
                value={sunday.address || ""} 
                onChange={(e) => update({ address: e.target.value })} 
                placeholder="ISKCON Kurnool, Sri Sri Radha Govinda Temple..." 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" /> Sunday Feast Annadana Seva Card
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Supporting Subtitle</label>
            <input
              className={inputClass}
              value={sunday.donationCardSupportingLine || "Auspicious Sunday Seva"}
              onChange={(e) => update({ donationCardSupportingLine: e.target.value })}
              placeholder="e.g. Receive unlimited spiritual merits..."
            />
          </div>
          <div>
            <label className={labelClass}>Button CTA Label</label>
            <input
              className={inputClass}
              value={sunday.donationCardButtonLabel || "Sponsor Sunday Feast Online"}
              onChange={(e) => update({ donationCardButtonLabel: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Seva Title</label>
            <input
              className={inputClass}
              value={sunday.donationCardTitle || "Sunday Feast Annadana Seva"}
              onChange={(e) => update({ donationCardTitle: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Purpose & Description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family."}
              onChange={(e) => update({ donationCardDescription: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Moving Announcement Ticker
            </h4>
            <p className="text-xs text-muted-foreground">
              Displays a continuous moving banner directly below the Sunday Hero banner with sponsor details.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={sunday.tickerEnabled !== false}
              onChange={(e) => update({ tickerEnabled: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            Enable Ticker
          </label>
        </div>

        <div>
          <label className={labelClass}>Custom Ticker Announcement Text (Optional)</label>
          <input
            className={inputClass}
            value={sunday.tickerText || ""}
            onChange={(e) => update({ tickerText: e.target.value })}
            placeholder="Leave empty to auto-generate from active sponsors, or enter custom broadcast text"
          />
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [time, setTime] = useState("");
  const [program, setProgram] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (item: SundayScheduleItem) => {
    setEditingId(item.id);
    setTime(item.time);
    setProgram(item.program);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setTime("");
    setProgram("");
    setIsModalOpen(true);
  };

  const save = () => {
    if (!time.trim() || !program.trim()) {
      toast.error("Time and Program details are required");
      return;
    }

    if (editingId) {
      update({
        schedule: (sunday.schedule || []).map((x) =>
          x.id === editingId ? { ...x, time: time.trim(), program: program.trim() } : x
        )
      });
      toast.success("Schedule timing updated!");
    } else {
      update({
        schedule: [
          ...(sunday.schedule || []),
          { id: Date.now().toString(), time: time.trim(), program: program.trim() }
        ]
      });
      toast.success("Schedule timing added!");
    }
    setIsModalOpen(false);
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
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Sunday Schedule Timings ({list.length})</h3>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Schedule Timing
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
        {list.length === 0 ? (
          <p className="text-muted-foreground text-center py-10 text-xs">No schedule items added yet.</p>
        ) : (
          list.map((item, i) => (
            <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  {item.time}
                </span>
                <span className="text-foreground font-bold text-sm">{item.program}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => startEdit(item)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition cursor-pointer" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => update({ schedule: list.filter((x) => x.id !== item.id) })} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Schedule Item" : "Add Schedule Item"}
        subtitle="Configure time slot and program activity"
        icon={Clock}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Time Range</label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. 5:00 PM – 5:45 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Program Details</label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Tulasi Arati & Hari Nama Sankirtana"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {editingId ? "Save Item" : "Add Item"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

function ActivitiesTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = sunday.activities || [];

  const onPickImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/SundayFeast");
      setImageUrl(url);
      toast.success("Activity image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const startEdit = (act: SundayActivityItem) => {
    setEditingId(act.id);
    setTitle(act.title);
    setDesc(act.description || "");
    setImageUrl(act.image || "");
    setIsModalOpen(true);
  };

  const openNew = () => {
    if (list.length >= 6) {
      toast.error("Maximum 6 activities reached. Delete an existing one to add more.");
      return;
    }
    setEditingId(null);
    setTitle("");
    setDesc("");
    setImageUrl("");
    setIsModalOpen(true);
  };

  const save = () => {
    if (!title.trim()) {
      toast.error("Activity title is required");
      return;
    }

    if (editingId) {
      update({
        activities: list.map((a) =>
          a.id === editingId ? { ...a, title: title.trim(), description: desc.trim(), image: imageUrl } : a
        )
      });
      toast.success("Activity updated!");
    } else {
      update({
        activities: [
          ...list,
          { id: Date.now().toString(), title: title.trim(), description: desc.trim(), image: imageUrl }
        ]
      });
      toast.success("Activity added!");
    }
    setIsModalOpen(false);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ activities: copy });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Feast Activities ({list.length}/6)</h3>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((act, index) => (
          <div key={act.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-4">
              {act.image ? (
                <img src={act.image} alt={act.title} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shrink-0">
                  <Gift className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground line-clamp-1">{act.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{act.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(index, 1)} disabled={index === list.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(act)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition cursor-pointer" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => update({ activities: list.filter((x) => x.id !== act.id) })} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Feast Activity" : "Add Feast Activity"}
        subtitle="Configure activity card thumbnail, title, and description"
        icon={Gift}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <UploadBox label="Activity Thumbnail" url={imageUrl} onPick={onPickImage} aspect="aspect-square" className="w-full max-w-[140px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Activity Title <span className="text-destructive">*</span></label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Maha Prasadam Feast"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Description</label>
            <textarea
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              rows={3}
              placeholder="Describe the activity..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {editingId ? "Save Activity" : "Add Activity"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

function SponsorsTab({
  sunday,
  update,
}: {
  sunday: SundayData;
  update: (p: Partial<SundayData>) => void;
}) {
  const sponsors = sunday.sponsors || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(false);
  };

  const handleUploadImage = async (slotIndex: number, file: File) => {
    setUploadingSlot(slotIndex);
    try {
      const url = await uploadToCloudinary(file, "ISKCON-KURNOOL/SundayFeast");
      const currentImages = [...(draft.images || [])];
      while (currentImages.length <= slotIndex) {
        currentImages.push("");
      }
      currentImages[slotIndex] = url;
      setDraft({ ...draft, images: currentImages.filter(Boolean) });
      toast.success(`Photo ${slotIndex + 1} uploaded!`);
    } catch {
      toast.error("Failed to upload image.");
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
      toast.error("Please enter the Sponsor Name.");
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
      toast.success("Sponsor details updated!");
    } else {
      update({ sponsors: [item, ...sponsors] });
      toast.success("✨ New Feast Sponsor added!");
    }
    resetForm();
  };

  const startEdit = (s: SundaySponsor) => {
    setEditingId(s.id);
    setDraft({ ...s, images: s.images || [] });
    setIsModalOpen(true);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const toggleActive = (id: string) => {
    update({
      sponsors: sponsors.map((s) => (s.id === id ? { ...s, active: s.active === false ? true : false } : s)),
    });
  };

  const deleteSponsor = (id: string) => {
    update({ sponsors: sponsors.filter((s) => s.id !== id) });
    toast.success("Sponsor removed");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">
          Sunday Feast Sponsors ({sponsors.length})
        </h3>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Feast Sponsor
        </button>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 text-muted-foreground text-xs shadow-elegant">
          No Sunday Feast sponsors added yet. Click "+ Add Feast Sponsor" to feature upcoming sponsors on the homepage & Sunday portal.
        </div>
      ) : (
        <div className="grid gap-4">
          {sponsors.map((s, idx) => (
            <div
              key={s.id || idx}
              className={`bg-white rounded-3xl border border-slate-200/80 p-5 shadow-elegant transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                s.active === false ? "opacity-60 bg-slate-50" : ""
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-display font-bold text-base text-primary">
                    {s.sponsorName} {s.familyName && <span className="text-amber-800 font-semibold">{s.familyName}</span>}
                  </h4>
                  {s.active === false ? (
                    <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                      Hidden
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                      Active on site
                    </span>
                  )}
                  {s.images && s.images.length > 0 && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      {s.images.length} Photos
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {s.occasion && (
                    <span className="font-bold text-foreground bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-xl">
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

              <div className="flex items-center gap-1 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === sponsors.length - 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggleActive(s.id)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer" title={s.active === false ? "Show on website" : "Hide from website"}>
                  {s.active === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-green-600" />}
                </button>
                <button onClick={() => startEdit(s)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition cursor-pointer" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteSponsor(s.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingId ? "Edit Feast Sponsor" : "Add Sunday Feast Sponsor"}
        subtitle="Configure sponsor name, occasion, seva photos, and announcement details"
        icon={HeartHandshake}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Sponsor Name <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={draft.sponsorName || ""}
                onChange={(e) => setDraft({ ...draft, sponsorName: e.target.value })}
                placeholder="e.g. Sri Radha Raman Das"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Family Name (Optional)
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={draft.familyName || ""}
                onChange={(e) => setDraft({ ...draft, familyName: e.target.value })}
                placeholder="e.g. & Family"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Occasion / Reason</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setDraft({ ...draft, occasion: occ === "Custom" ? "" : occ })}
                      className={`px-2.5 py-1 text-[11px] rounded-xl border transition font-bold cursor-pointer ${
                        draft.occasion === occ || (occ === "Custom" && !OCCASIONS.slice(0, 5).includes(draft.occasion || ""))
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
                <input
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  value={draft.occasion || ""}
                  onChange={(e) => setDraft({ ...draft, occasion: e.target.value })}
                  placeholder="e.g. 50th Birthday / Wedding Anniversary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Date</label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-sans text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={draft.date || ""}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                placeholder="e.g. 23/08/2026 or Sunday, 23 August"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Feast / Sponsorship Details</label>
            <textarea
              rows={2}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-sans text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={draft.details || ""}
              onChange={(e) => setDraft({ ...draft, details: e.target.value })}
              placeholder="e.g. Sunday Feast sponsored as Seva for the pleasure of Sri Sri Jagannath..."
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                Celebration / Seva Photos (Up to 4 Carousel Images)
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {(draft.images || []).length}/4 Photos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((slotIdx) => {
                const imgUrl = (draft.images || [])[slotIdx];
                const isUploading = uploadingSlot === slotIdx;

                return (
                  <div key={slotIdx} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Slot {slotIdx + 1}</span>
                    <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden group hover:border-primary transition">
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt={`Photo ${slotIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <label className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer shadow-sm" title="Change Photo">
                              <Pencil className="h-3.5 w-3.5" />
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
                              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-primary/5 transition">
                          {isUploading ? (
                            <div className="text-[10px] font-bold text-primary animate-pulse">Uploading...</div>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 text-slate-400 mb-1" />
                              <span className="text-[10px] font-bold text-slate-500">Upload</span>
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

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              Active (Display on Website)
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {editingId ? "Save Sponsor" : "Add Sponsor"}
              </button>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function GalleryTab({ sunday, update }: { sunday: SundayData; update: (p: Partial<SundayData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      const u = await uploadToCloudinary(f, "ISKCON-KURNOOL/SundayFeast");
      setUrl(u); 
      toast.success("Photo uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) {
      toast.error("Upload an image first");
      return;
    }
    update({ gallery: [...(sunday.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
    setIsModalOpen(false);
    toast.success("Photo added to Sunday gallery!");
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
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Sunday Moments Gallery ({list.length})</h3>
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setLabel("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Moment Photo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list.map((g, i) => (
          <div key={g.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
              <img src={g.url} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-foreground line-clamp-1">{g.label || "(untitled)"}</div>
              <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => update({ gallery: list.filter((x) => x.id !== g.id) })} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors ml-auto cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Sunday Moment Photo"
        subtitle="Upload photos of deity darshan, kirtan, and feast distribution"
        icon={ImageIcon}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox label="Moment Photo" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Caption / Note (Optional)
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Sunday Maha Kirtan & Dancing"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !url}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : "Add to Gallery"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
