import { useState, useMemo } from "react";
import { useAdmin, uploadToCloudinary, DailyDarshanItem } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import AdminModal from "./AdminModal";
import { 
  Sparkles, 
  Calendar, 
  Trash2, 
  Pencil, 
  Plus, 
  ExternalLink, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Image as ImageIcon,
  Link as LinkIcon,
  Info,
  Sun,
  Camera,
  X,
  Layers,
  Upload,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  HeartHandshake
} from "lucide-react";
import { toast } from "sonner";

export default function DailyDarshanManager() {
  const { 
    dailyDarshan, 
    setDailyDarshan, 
    addDailyDarshanEntry, 
    updateDailyDarshanEntry, 
    deleteDailyDarshanEntry 
  } = useAdmin();

  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("all");
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(false);

  // Helper for today's ISO date (YYYY-MM-DD)
  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [date, setDate] = useState(getTodayIso());
  const [title, setTitle] = useState("Sri Sri Jagannath Baladev Subhadra Sringara Darshan");
  const [imageUrl, setImageUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [extraImgInput, setExtraImgInput] = useState("");
  const [description, setDescription] = useState("");
  const [officialSourceName, setOfficialSourceName] = useState("Official Instagram (@iskconkurnool)");
  const [officialSourceUrl, setOfficialSourceUrl] = useState("https://instagram.com/iskconkurnool");
  const [photographerCredit, setPhotographerCredit] = useState("ISKCON Kurnool Media Team");
  const [published, setPublished] = useState(true);

  // Settings State
  const [headerTitle, setHeaderTitle] = useState(dailyDarshan.headerTitle || "Sri Sri Jagannath Baladev Subhadra Daily Darshan");
  const [headerSubtitle, setHeaderSubtitle] = useState(dailyDarshan.headerSubtitle || "Behold the transcendental beauty and divine blessings of Their Lordships at ISKCON Kurnool.");
  const [badgeText, setBadgeText] = useState(dailyDarshan.badgeText || "Nitya Darshan • Daily Deity Darshan");
  const [noticeBanner, setNoticeBanner] = useState(dailyDarshan.noticeBanner || "Darshan photos are refreshed every morning after Sringara Harati.");
  const [liveYoutubeUrl, setLiveYoutubeUrl] = useState(dailyDarshan.liveYoutubeUrl || "");

  const entries = dailyDarshan.entries || [];

  // Metrics
  const totalEntries = entries.length;
  const activeEntries = entries.filter((e) => e.published !== false).length;
  const multiPhotoEntries = entries.filter((e) => (e.additionalImages?.length || 0) > 0).length;

  // Available unique months for filtering
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.date) {
        const [y, m] = e.date.split("-");
        if (y && m) set.add(`${y}-${m}`);
      }
    });
    return Array.from(set);
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedMonthFilter !== "all" && !e.date?.startsWith(selectedMonthFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          e.title?.toLowerCase().includes(q) ||
          e.date?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.officialSourceName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, selectedMonthFilter, searchTerm]);

  // Upload Handlers
  const onPickMainImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setImageUrl(url);
      toast.success("Main Darshan cover image uploaded!");
    } catch {
      toast.error("Image upload failed. You can also paste a direct image URL.");
    } finally {
      setBusy(false);
    }
  };

  const onPickExtraImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setAdditionalImages((prev) => [...prev, url]);
      toast.success("Additional carousel photo added!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  // Form Reset
  const resetForm = () => {
    setEditingId(null);
    setDate(getTodayIso());
    setTitle("Sri Sri Jagannath Baladev Subhadra Sringara Darshan");
    setImageUrl("");
    setAdditionalImages([]);
    setExtraImgInput("");
    setDescription("");
    setOfficialSourceName("Official Instagram (@iskconkurnool)");
    setOfficialSourceUrl("https://instagram.com/iskconkurnool");
    setPhotographerCredit("ISKCON Kurnool Media Team");
    setPublished(true);
  };

  // Start Edit (opens modal dialog)
  const startEdit = (item: DailyDarshanItem) => {
    setEditingId(item.id);
    setDate(item.date);
    setTitle(item.title);
    setImageUrl(item.imageUrl);
    setAdditionalImages(item.additionalImages || []);
    setExtraImgInput("");
    setDescription(item.description || "");
    setOfficialSourceName(item.officialSourceName || "");
    setOfficialSourceUrl(item.officialSourceUrl || "");
    setPhotographerCredit(item.photographerCredit || "");
    setPublished(item.published !== false);
    setIsModalOpen(true);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Save / Update Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date.trim()) {
      toast.error("Please select a date for the Darshan");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Please upload or enter a primary Darshan image URL");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title for the Darshan");
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        // Update existing
        await updateDailyDarshanEntry(editingId, {
          date: date.trim(),
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          additionalImages: additionalImages.filter(Boolean),
          description: description.trim(),
          officialSourceName: officialSourceName.trim() || undefined,
          officialSourceUrl: officialSourceUrl.trim() || undefined,
          photographerCredit: photographerCredit.trim() || undefined,
          published,
        });
        toast.success("✨ Darshan entry updated successfully!");
      } else {
        // Create new
        await addDailyDarshanEntry({
          date: date.trim(),
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          additionalImages: additionalImages.filter(Boolean),
          description: description.trim(),
          officialSourceName: officialSourceName.trim() || undefined,
          officialSourceUrl: officialSourceUrl.trim() || undefined,
          photographerCredit: photographerCredit.trim() || undefined,
          published,
        });
        toast.success("✨ Today's Daily Darshan published successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save entry");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (confirm(`Are you sure you want to delete the Darshan for "${itemTitle}"?`)) {
      await deleteDailyDarshanEntry(id);
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Darshan entry removed");
    }
  };

  const saveHeaderSettings = async () => {
    const updated = {
      ...dailyDarshan,
      headerTitle,
      headerSubtitle,
      badgeText,
      noticeBanner,
      liveYoutubeUrl: liveYoutubeUrl.trim(),
    };
    setDailyDarshan(updated);
    toast.success("Page header & notice settings saved!");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Sun className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Daily Darshan Manager</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Nitya Seva
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Publish today's deity darshan photos with multi-image carousels, dates, captions, and official source links. The newest darshan is automatically highlighted first on the public website.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Darshans</span>
              <strong className="font-display text-lg text-primary">{totalEntries}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Live Published</span>
              <strong className="font-display text-lg text-green-600">{activeEntries}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Darshan
            </button>
            <a
              href="/daily-darshan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Live
            </a>
          </div>
        </div>
      </div>

      {/* Modal Edit / Add Dialog */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Daily Darshan Entry" : "Publish Today's Daily Darshan"}
        subtitle={editingId ? "Updating existing deity darshan record" : "Upload high-resolution photos and add devotional descriptions"}
        icon={Sun}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =============================================================== */}
            {/* LEFT COLUMN: VISUAL MEDIA & MULTI-PHOTO CAROUSEL               */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Primary Cover Image */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                    Main Deity Cover Photo <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-white px-2 py-0.5 rounded-md border">
                    Primary Aspect: 4:3
                  </span>
                </div>
                
                <UploadBox
                  label="Upload Primary Darshan Photo"
                  url={imageUrl}
                  onPick={onPickMainImage}
                  aspect="aspect-[4/3]"
                  className="w-full h-56 rounded-2xl"
                />

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" /> Or paste direct Image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Additional Multi-Photo Carousel Gallery */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-accent" /> Additional Carousel Photos
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add extra close-ups or deity angles to create a multi-photo carousel slider
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {additionalImages.length} Extra
                  </span>
                </div>

                {/* Upload Button for Additional Photo */}
                <div className="pt-1">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-foreground cursor-pointer shadow-2xs transition-colors w-full">
                    <Upload className="h-3.5 w-3.5 text-accent" />
                    <span>Upload & Add Photo to Carousel</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onPickExtraImage(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {/* Or paste extra image url */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Or paste extra image URL..."
                    value={extraImgInput}
                    onChange={(e) => setExtraImgInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (extraImgInput.trim()) {
                        setAdditionalImages((prev) => [...prev, extraImgInput.trim()]);
                        setExtraImgInput("");
                        toast.success("Additional image added to carousel!");
                      }
                    }}
                    disabled={!extraImgInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Additional Images Thumbnail Strip with Delete Action */}
                {additionalImages.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Carousel Photo Gallery ({additionalImages.length})
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {additionalImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-300 shadow-2xs bg-black">
                          <img src={img} alt={`Carousel ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalImages((prev) => prev.filter((_, i) => i !== idx));
                              toast.info("Photo removed from carousel");
                            }}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            #{idx + 2}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* =============================================================== */}
            {/* RIGHT COLUMN: TEXT CONTENT, DATES, PRESETS & SOURCE             */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Date & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-accent" /> Darshan Date <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setDate(getTodayIso())}
                      className="text-[11px] text-accent font-bold hover:underline"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl font-sans text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5">
                    Darshan Title / Sringara Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Sri Jagannath Baladev Subhadra Rajadhiraja Sringara Darshan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl font-sans text-xs sm:text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Title Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Quick Title Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Sri Sri Jagannath Baladev Subhadra Rajadhiraja Sringara Darshan",
                    "Sri Jagannath Mahaprabhu Snana Yatra Vishesha Darshan",
                    "Sri Sri Krishna Balarama Pushpalankara Sringara Darshan",
                    "Sri Sri Gauranga Mahaprabhu Mangala Harati Darshan",
                    "Sri Sri Jagannath Chandan Yatra Alankara Darshan",
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setTitle(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border text-foreground transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5 flex items-center justify-between">
                  <span>Devotional Description / Sringara Bhavam (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Supports verses & prayers</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details of today's deity alankara, colors, ornaments, flower garlands, or a sacred sloka..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none resize-y min-h-[100px] shadow-2xs"
                />
              </div>

              {/* Official Source Info */}
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-accent" />
                  <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                    Official Source Hyperlink (Optional)
                  </label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Source Name (e.g. Official Instagram, Facebook)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Official Instagram (@iskconkurnool)"
                      value={officialSourceName}
                      onChange={(e) => setOfficialSourceName(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Source URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/iskconkurnool"
                      value={officialSourceUrl}
                      onChange={(e) => setOfficialSourceUrl(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photographer Credit & Published Toggle */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                    Photo Credit
                  </label>
                  <input
                    type="text"
                    value={photographerCredit}
                    onChange={(e) => setPhotographerCredit(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">Published</span>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="pt-4 border-t flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  {busy ? "Saving..." : (editingId ? "Update Entry" : "Publish Darshan")}
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

          </div>

        </form>
      </AdminModal>

      {/* Page Header & Notice Settings (Collapsible Card) */}
      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSettingsAccordion(!showSettingsAccordion)}
          className="w-full px-6 sm:px-8 py-4 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="h-4 w-4 text-accent" />
            <h3 className="font-display font-bold text-base text-primary">
              Page Header, Notice Banner & SEO Settings
            </h3>
          </div>
          {showSettingsAccordion ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showSettingsAccordion && (
          <div className="p-6 sm:p-8 space-y-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Main Page Header Title
                </label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Header Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Header Subtitle
                </label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Morning Notice Banner
                </label>
                <input
                  type="text"
                  value={noticeBanner}
                  onChange={(e) => setNoticeBanner(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  YouTube Live Darshan Video / Stream URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={liveYoutubeUrl}
                  onChange={(e) => setLiveYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Enter a YouTube live link (or video ID). When set, a prominent YouTube player will telecast the Live Darshan on the top of the Daily Darshan screen. Leave empty to hide the Live telecast player.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={saveHeaderSettings}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer shadow-sm"
              >
                Save Page Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Darshan Archive / Entries Grid */}
      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <h3 className="font-display text-xl font-bold text-primary">
              All Darshan Entries ({entries.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Entries are automatically sorted chronologically (newest first)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter */}
            {availableMonths.length > 1 && (
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => {
                  const [yr, mo] = m.split("-");
                  const dateObj = new Date(parseInt(yr), parseInt(mo) - 1, 1);
                  const label = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by date or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-semibold">No Darshan entries found matching your filter.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedMonthFilter("all"); }}
              className="text-xs text-accent font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((item, index) => {
              const isToday = index === 0;
              const hasMultiPhotos = (item.additionalImages?.length || 0) > 0;
              const totalPhotos = 1 + (item.additionalImages?.length || 0);

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white ${
                    isToday
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200/80 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {isToday && (
                          <span className="bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Live Featured
                          </span>
                        )}
                        {hasMultiPhotos && (
                          <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Layers className="h-2.5 w-2.5 text-amber-400" /> {totalPhotos} Photos
                          </span>
                        )}
                      </div>

                      {/* Date Badge */}
                      <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white font-sans text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground line-clamp-1">
                        {item.title}
                      </h4>

                      {item.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          No description provided
                        </p>
                      )}

                      {item.officialSourceName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-accent font-medium pt-1 truncate">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.officialSourceName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition-colors cursor-pointer"
                        title="Edit this entry"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => updateDailyDarshanEntry(item.id, { published: item.published === false })}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          item.published !== false
                            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            : "bg-slate-100 border-slate-200 text-muted-foreground hover:bg-slate-200"
                        }`}
                        title={item.published !== false ? "Click to hide from website" : "Click to publish live"}
                      >
                        {item.published !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
