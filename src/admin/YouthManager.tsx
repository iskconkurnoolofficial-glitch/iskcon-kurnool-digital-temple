import { useState } from "react";
import { useAdmin, uploadToCloudinary, YouthData } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Star, Pencil, 
  Users, Sparkles, Image as ImageIcon, MessageSquareQuote 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

type Tab = "settings" | "gallery" | "reviews";

export default function YouthManager() {
  const { youth, setYouth } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<YouthData>) => {
    setYouth({ ...youth, ...patch });
    toast.success("Youth forum details saved!");
  };

  const featureCount = (youth.features || []).length;
  const galleryCount = (youth.gallery || []).length;
  const reviewsCount = (youth.reviews || []).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-purple-200/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-purple-500/20 text-purple-800 rounded-2xl shrink-0 shadow-xs">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">IYF — ISKCON Youth Forum</h2>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Youth Empowerment
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure Gaura Bhaktas youth programs, student seminars, activity feature cards, retreat galleries, and testimonials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Activities</span>
              <strong className="font-display text-lg text-primary">{featureCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Photos</span>
              <strong className="font-display text-lg text-purple-700">{galleryCount}</strong>
            </div>
            <a
              href="/youth"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Youth Page
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "settings", label: `General & Activities (${featureCount})` },
          { id: "gallery", label: `Youth Gallery (${galleryCount})` },
          { id: "reviews", label: `Student Reviews (${reviewsCount})` }
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

      {tab === "settings" && <SettingsTab youth={youth} update={update} />}
      {tab === "gallery" && <GalleryTab youth={youth} update={update} />}
      {tab === "reviews" && <ReviewsTab youth={youth} update={update} />}
    </div>
  );
}

function SettingsTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardImage, setCardImage] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const pickLogo = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ logo: url }); 
      toast.success("Logo uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickModalImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setCardImage(url);
      toast.success("Activity card image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const openNewCard = () => {
    if (youth.features.length >= 6) {
      toast.error("Maximum 6 activity cards reached.");
      return;
    }
    setEditingIndex(null);
    setCardTitle("");
    setCardDesc("");
    setCardImage("");
    setIsModalOpen(true);
  };

  const startEditCard = (i: number) => {
    const feat = youth.features[i];
    setEditingIndex(i);
    setCardTitle(feat.title);
    setCardDesc(feat.desc);
    setCardImage(feat.image || "");
    setIsModalOpen(true);
  };

  const saveCard = () => {
    if (!cardTitle.trim()) {
      toast.error("Enter card title");
      return;
    }

    if (editingIndex !== null) {
      const updated = youth.features.map((ft, idx) =>
        idx === editingIndex ? { ...ft, title: cardTitle.trim(), desc: cardDesc.trim(), image: cardImage } : ft
      );
      update({ features: updated });
      toast.success("Activity card updated!");
    } else {
      update({
        features: [
          ...youth.features,
          { title: cardTitle.trim(), desc: cardDesc.trim(), image: cardImage }
        ]
      });
      toast.success("✨ Activity card added!");
    }
    setIsModalOpen(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Youth Forum General Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <UploadBox label="IYF Logo / Emblem" url={youth.logo} onPick={pickLogo} aspect="aspect-square" className="w-full max-w-[150px]" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>WhatsApp Community URL</label>
              <input className={inputClass} value={youth.whatsappUrl} onChange={(e) => update({ whatsappUrl: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input className={inputClass} value={youth.instagramHandle} onChange={(e) => update({ instagramHandle: e.target.value })} placeholder="Gaura_Bhaktas_Official" />
            </div>
            <div>
              <label className={labelClass}>Weekly Schedule Timing</label>
              <input className={inputClass} value={youth.schedule} onChange={(e) => update({ schedule: e.target.value })} placeholder="Every Saturday 6:00 PM" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Venue / Hall Address</label>
            <textarea className={inputClass} rows={2} value={youth.venue} onChange={(e) => update({ venue: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-lg font-bold text-primary">Youth Activity Cards ({youth.features.length}/6)</h3>
          <button
            type="button"
            onClick={openNewCard}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Activity Card
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {youth.features.map((ft, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200/80 shadow-elegant p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {ft.image ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
                    <img src={ft.image} alt={ft.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 font-bold text-xs">
                    No Image
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-foreground">{ft.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">{ft.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => startEditCard(i)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => update({ features: youth.features.filter((_, idx) => idx !== i) })}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? "Edit Youth Activity" : "Add Youth Activity"}
        subtitle="Configure feature card graphic, title, and seminar description"
        icon={Users}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <UploadBox label="Activity Image" url={cardImage} onPick={pickModalImage} aspect="aspect-video" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Card Title <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Weekly Mind Management Seminars"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              rows={3}
              placeholder="Summary of topics, interactions, and workshops..."
              value={cardDesc}
              onChange={(e) => setCardDesc(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={saveCard}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {editingIndex !== null ? "Save Card" : "Add Card"}
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

function GalleryTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      const u = await uploadToCloudinary(f);
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
    update({ gallery: [...youth.gallery, { id: Date.now().toString(), url, label }] });
    setUrl(""); 
    setLabel("");
    setIsModalOpen(false);
    toast.success("Photo added to youth gallery!");
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= youth.gallery.length) return;
    const copy = [...youth.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Youth Moments Gallery ({youth.gallery.length})</h3>
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setLabel("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Youth Photo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {youth.gallery.map((g, i) => (
          <div key={g.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
              <img src={g.url} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-foreground line-clamp-1">{g.label || "(untitled)"}</div>
              <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => update({ gallery: youth.gallery.filter((x) => x.id !== g.id) })} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors ml-auto cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Youth Photo"
        subtitle="Upload photos of youth seminars, kirtans, picnics, and workshops"
        icon={ImageIcon}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox label="Youth Photo" url={url} onPick={onPick} aspect="aspect-square" className="w-full max-w-[200px]" />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Caption / Location (Optional)
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Annual Youth Leadership Camp 2025"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !url}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
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

function ReviewsTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const add = () => {
    if (!name.trim() || !text.trim()) {
      toast.error("Enter student name and review");
      return;
    }
    update({ reviews: [...youth.reviews, { id: Date.now().toString(), name: name.trim(), text: text.trim(), rating, visible: true }] });
    setName(""); 
    setText(""); 
    setRating(5);
    setIsModalOpen(false);
    toast.success("Student review added!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Student Reviews ({youth.reviews.length})</h3>
        <button
          type="button"
          onClick={() => {
            setName("");
            setText("");
            setRating(5);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {youth.reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-foreground">{r.name}</span>
                <span className="flex">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
                <button onClick={() => update({ reviews: youth.reviews.map((x) => x.id === r.id ? { ...x, visible: !x.visible } : x) })} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer" title="Toggle visible">
                  {r.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => update({ reviews: youth.reviews.filter((x) => x.id !== r.id) })} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Delete">
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
        title="Add Student Testimonial"
        subtitle="Add inspiring feedback from university students and youth members"
        icon={MessageSquareQuote}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Student / Member Name</label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Sai Teja (Engineering Student)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Testimonial Quote</label>
            <textarea
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none"
              rows={3}
              placeholder="Share the personal impact and inspiration received..."
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
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Add Review
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
};
