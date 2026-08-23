import { useState } from "react";
import { useAdmin, uploadToCloudinary, PrahladaBadiData, PrahladaBadiActivity } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Star, Pencil, X, 
  Baby, Sparkles, Image as ImageIcon, MessageSquareQuote 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

type Tab = "settings" | "activities" | "gallery" | "reviews";

export default function PrahladaBadiManager() {
  const { prahladaBadi, setPrahladaBadi } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<PrahladaBadiData>) => {
    setPrahladaBadi({ ...prahladaBadi, ...patch });
    toast.success("Prahlada Badi details saved!");
  };

  const activitiesCount = (prahladaBadi.activities || []).length;
  const galleryCount = (prahladaBadi.gallery || []).length;
  const reviewsCount = (prahladaBadi.reviews || []).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Baby className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Prahlada Badi Sunday School</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Kids Culture
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure children's spiritual education modules, sloka competitions, registrations, photos, and parent testimonials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Activities</span>
              <strong className="font-display text-lg text-primary">{activitiesCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Registration</span>
              <strong className={`font-display text-xs px-2 py-0.5 rounded-full ${prahladaBadi.regStatus === "Open" ? "bg-green-100 text-green-700 font-bold" : "bg-slate-100 text-slate-700 font-bold"}`}>
                {prahladaBadi.regStatus || "Open"}
              </strong>
            </div>
            <a
              href="/prahlada-badi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Kids Page
            </a>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: "settings", label: "Registration & Schedule" },
          { id: "activities", label: `Curriculum Activities (${activitiesCount})` },
          { id: "gallery", label: `Photos Gallery (${galleryCount})` },
          { id: "reviews", label: `Parent Reviews (${reviewsCount})` }
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
      toast.success("Hero banner uploaded!");
    } catch {
      toast.error("Hero image upload failed");
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Registration & Hero Banner
        </h3>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <UploadBox label="Hero Banner Image" url={data.heroImage} onPick={pickHeroImage} aspect="aspect-video" className="max-w-[240px]" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Registration Status</label>
              <select
                className={inputClass}
                value={data.regStatus}
                onChange={(e) => update({ regStatus: e.target.value as any })}
              >
                <option value="Open">Registrations Open</option>
                <option value="Closed">Registrations Closed</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Google Registration Form URL</label>
              <input
                type="text"
                className={inputClass}
                value={data.registerUrl || ""}
                onChange={(e) => update({ registerUrl: e.target.value })}
                placeholder="https://docs.google.com/forms/..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-primary">Program Schedule & Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.startDate || ""}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.endDate || ""}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Program Timings</label>
              <input
                className={inputClass}
                value={data.timings || ""}
                onChange={(e) => update({ timings: e.target.value })}
                placeholder="9:30 AM – 12:30 PM"
              />
            </div>
            <div>
              <label className={labelClass}>Program Dates Range</label>
              <input
                value={`${data.startDate || ""} to ${data.endDate || ""}`}
                disabled
                className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 text-slate-500 text-xs sm:text-sm font-sans"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Venue (English)</label>
              <input
                className={inputClass}
                value={data.venueEn || ""}
                onChange={(e) => update({ venueEn: e.target.value })}
                placeholder="ISKCON Kurnool Temple"
              />
            </div>
            <div>
              <label className={labelClass}>Venue (Telugu)</label>
              <input
                className={inputClass}
                value={data.venueTel || ""}
                onChange={(e) => update({ venueTel: e.target.value })}
                placeholder="ఇస్కాన్ కర్నూలు ఆలయం"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-primary">Fee Tiers & Contacts</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3.5 border rounded-2xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-xs text-foreground">Tier 1 (Lower Class)</h4>
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Label (e.g. Nursery - 4th)"
                value={data.feeTier1LabelEn || ""}
                onChange={(e) => update({ feeTier1LabelEn: e.target.value })}
              />
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Amount (e.g. 500)"
                value={data.feeTier1Amount || ""}
                onChange={(e) => update({ feeTier1Amount: e.target.value })}
              />
            </div>

            <div className="p-3.5 border rounded-2xl bg-slate-50 space-y-2">
              <h4 className="font-bold text-xs text-foreground">Tier 2 (Upper Class)</h4>
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Label (e.g. 5th - 10th)"
                value={data.feeTier2LabelEn || ""}
                onChange={(e) => update({ feeTier2LabelEn: e.target.value })}
              />
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Amount (e.g. 700)"
                value={data.feeTier2Amount || ""}
                onChange={(e) => update({ feeTier2Amount: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3.5 border rounded-2xl bg-slate-50 space-y-2">
            <h4 className="font-bold text-xs text-foreground">Contact Details</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Contact Name"
                value={data.contactName || ""}
                onChange={(e) => update({ contactName: e.target.value })}
              />
              <input
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                placeholder="Phone Number"
                value={data.phone1 || ""}
                onChange={(e) => update({ phone1: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitiesTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleTel, setTitleTel] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTel, setDescriptionTel] = useState("");
  const [icon, setIcon] = useState("📖");
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (act: PrahladaBadiActivity) => {
    setEditingId(act.id);
    setTitleEn(act.titleEn);
    setTitleTel(act.titleTel || "");
    setDescriptionEn(act.descriptionEn || "");
    setDescriptionTel(act.descriptionTel || "");
    setIcon(act.icon || "📖");
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleTel("");
    setDescriptionEn("");
    setDescriptionTel("");
    setIcon("📖");
    setIsModalOpen(true);
  };

  const save = () => {
    if (!titleEn.trim()) {
      toast.error("Enter English title");
      return;
    }
    
    if (editingId) {
      const activities = (data.activities || []).map((a) =>
        a.id === editingId 
          ? { 
              ...a, 
              titleEn: titleEn.trim(), 
              titleTel: titleTel.trim(), 
              descriptionEn: descriptionEn.trim(), 
              descriptionTel: descriptionTel.trim(), 
              icon: icon.trim() || "📖" 
            } 
          : a
      );
      update({ activities });
      toast.success("Activity updated!");
    } else {
      const order = (data.activities || []).length + 1;
      const newItem: PrahladaBadiActivity = {
        id: Date.now().toString(),
        titleEn: titleEn.trim(),
        titleTel: titleTel.trim(),
        descriptionEn: descriptionEn.trim(),
        descriptionTel: descriptionTel.trim(),
        icon: icon.trim() || "📖",
        order,
      };
      update({ activities: [...(data.activities || []), newItem] });
      toast.success("✨ New activity added!");
    }
    setIsModalOpen(false);
  };

  const remove = (id: string) => {
    const list = (data.activities || []).filter((x) => x.id !== id);
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    update({ activities: reordered });
    toast.success("Activity removed");
  };

  const move = (index: number, direction: -1 | 1) => {
    const list = [...(data.activities || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    update({ activities: reordered });
  };

  const list = data.activities || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Curriculum Activities ({list.length})</h3>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
        {list.sort((a, b) => a.order - b.order).map((act, i) => (
          <div key={act.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/80 transition">
            <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
              #{act.order}
            </div>
            <div className="text-2xl shrink-0 mt-0.5">{act.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground text-sm sm:text-base">{act.titleEn}</div>
              {act.titleTel && <div className="text-xs text-muted-foreground font-medium">{act.titleTel}</div>}
              {act.descriptionEn && <p className="text-xs text-slate-600 mt-1">{act.descriptionEn}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => startEdit(act)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition cursor-pointer" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => remove(act.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Kids Activity" : "Add Kids Activity"}
        subtitle="Configure title, emoji icon, and educational description"
        icon={Baby}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-[80px,1fr] gap-3">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Emoji</label>
              <input
                className="w-full px-3 py-2 border rounded-xl text-center text-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📖"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Activity Title (English) <span className="text-destructive">*</span></label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="e.g. Sloka Recitation & Vedic Stories"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Activity Title (Telugu)</label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. శ్లోక పఠనం మరియు వేద కథలు"
              value={titleTel}
              onChange={(e) => setTitleTel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Description (English)</label>
            <textarea
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              rows={2}
              placeholder="Details of what children will learn..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
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

function GalleryTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try {
      setUrl(await uploadToCloudinary(f));
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
    setBusy(false);
  };

  const add = () => {
    if (!url) {
      toast.error("Upload an image first");
      return;
    }
    update({ gallery: [...(data.gallery || []), { id: Date.now().toString(), url, label }] });
    setUrl("");
    setLabel("");
    setIsModalOpen(false);
    toast.success("Photo added to kids gallery!");
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
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Kids Camp Gallery ({list.length})</h3>
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setLabel("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Camp Photo
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
                <button onClick={() => update({ gallery: list.filter((x) => x.id !== g.id) })} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition ml-auto cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Kids Camp Photo"
        subtitle="Upload camp photos, celebrations, and drama performances"
        icon={ImageIcon}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox label="Camp Photo" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Caption / Year (Optional)
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Summer Camp 2025 Drama Performance"
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
              {busy ? "Saving..." : "Add Photo"}
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

function ReviewsTab({ data, update }: { data: PrahladaBadiData; update: (p: Partial<PrahladaBadiData>) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const add = () => {
    if (!name.trim() || !text.trim()) {
      toast.error("Enter reviewer name and feedback text");
      return;
    }
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
    setIsModalOpen(false);
    toast.success("Testimonial added!");
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
    toast.success("Review removed");
  };

  const list = data.reviews || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Parent Testimonials ({list.length})</h3>
        <button
          type="button"
          onClick={() => {
            setName("");
            setText("");
            setRating(5);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-foreground">{r.name}</span>
                <span className="flex">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{r.text}"</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.visible ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {r.visible ? "Visible on site" : "Hidden"}
              </span>
              <div className="flex gap-1">
                <button onClick={() => toggleVisible(r.id)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer" title="Toggle Visible">
                  {r.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Parent Review / Feedback"
        subtitle="Add inspiring parent testimonials about the kids Sunday school"
        icon={MessageSquareQuote}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Parent / Student Name</label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Smt. Radhika (Mother of Advait)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Feedback Quote</label>
            <textarea
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              rows={3}
              placeholder="Share the positive transformation noticed..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Star Rating</label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer"
                >
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={add}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Add Testimonial
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
