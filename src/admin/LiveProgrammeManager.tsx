import { useState, useMemo } from "react";
import { useAdmin, uploadToCloudinary, LiveProgrammeItem, LivePlatform } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import AdminModal from "./AdminModal";
import { 
  Radio, 
  Sparkles, 
  Calendar, 
  Clock, 
  Trash2, 
  Pencil, 
  Plus,
  ExternalLink, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Link as LinkIcon, 
  Tv, 
  Play, 
  Bell, 
  Sliders, 
  X, 
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const PLATFORMS: LivePlatform[] = ["YouTube", "Facebook", "Instagram", "Other"];

export default function LiveProgrammeManager() {
  const { 
    liveProgrammes, 
    setLiveProgrammesData, 
    addLiveProgramme, 
    updateLiveProgramme, 
    deleteLiveProgramme 
  } = useAdmin();

  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(false);

  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [title, setTitle] = useState("Daily Srimad Bhagavatam Discourse & Morning Darshan");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayIso());
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("08:30");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [platform, setPlatform] = useState<LivePlatform>("YouTube");
  const [streamUrl, setStreamUrl] = useState("https://www.youtube.com/@iskconkurnool/live");
  const [speakerOrPerformer, setSpeakerOrPerformer] = useState("Temple Sannyasis & Senior Devotees");
  const [isManualLiveOverride, setIsManualLiveOverride] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  const [published, setPublished] = useState(true);

  // Settings State
  const [sectionTitle, setSectionTitle] = useState(liveProgrammes.sectionTitle || "Live Temple Broadcast");
  const [sectionSubtitle, setSectionSubtitle] = useState(liveProgrammes.sectionSubtitle || "Tune into daily transcendental discourses, ecstatic sankirtana, and sacred deity aartis live from Sri Sri Puri Jagannath Mandir, ISKCON Kurnool.");
  const [badgeText, setBadgeText] = useState(liveProgrammes.badgeText || "Temple Broadcast • Live Stream");
  const [enabled, setEnabled] = useState(liveProgrammes.enabled !== false);

  const programmes = liveProgrammes.programmes || [];

  // Metrics
  const totalCount = programmes.length;
  const publishedCount = programmes.filter((p) => p.published !== false).length;

  const filteredProgrammes = useMemo(() => {
    return programmes.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.date?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.platform?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [programmes, searchTerm]);

  const onPickThumbnail = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setThumbnailUrl(url);
      toast.success("Broadcast thumbnail uploaded!");
    } catch {
      toast.error("Upload failed. You can also paste an image URL.");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("Daily Srimad Bhagavatam Discourse & Morning Darshan");
    setDescription("");
    setDate(getTodayIso());
    setStartTime("07:30");
    setEndTime("08:30");
    setThumbnailUrl("");
    setPlatform("YouTube");
    setStreamUrl("https://www.youtube.com/@iskconkurnool/live");
    setSpeakerOrPerformer("Temple Sannyasis & Senior Devotees");
    setIsManualLiveOverride(false);
    setEnableReminders(true);
    setPublished(true);
  };

  const startEdit = (item: LiveProgrammeItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setDate(item.date);
    setStartTime(item.startTime || "07:30");
    setEndTime(item.endTime || "08:30");
    setThumbnailUrl(item.thumbnailUrl || "");
    setPlatform(item.platform || "YouTube");
    setStreamUrl(item.streamUrl || "");
    setSpeakerOrPerformer(item.speakerOrPerformer || "");
    setIsManualLiveOverride(!!item.isManualLiveOverride);
    setEnableReminders(item.enableReminders !== false);
    setPublished(item.published !== false);
    setIsModalOpen(true);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a programme title");
      return;
    }
    if (!date.trim()) {
      toast.error("Please select a date");
      return;
    }
    if (!streamUrl.trim()) {
      toast.error("Please enter a livestream URL");
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        await updateLiveProgramme(editingId, {
          title: title.trim(),
          description: description.trim() || undefined,
          date: date.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          platform,
          streamUrl: streamUrl.trim(),
          speakerOrPerformer: speakerOrPerformer.trim() || undefined,
          isManualLiveOverride,
          enableReminders,
          published,
        });
        toast.success("Live programme updated successfully!");
      } else {
        await addLiveProgramme({
          title: title.trim(),
          description: description.trim() || undefined,
          date: date.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          platform,
          streamUrl: streamUrl.trim(),
          speakerOrPerformer: speakerOrPerformer.trim() || undefined,
          isManualLiveOverride,
          enableReminders,
          published,
        });
        toast.success("✨ New live programme scheduled successfully!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save programme");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (confirm(`Are you sure you want to remove "${itemTitle}"?`)) {
      await deleteLiveProgramme(id);
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Programme removed");
    }
  };

  const saveSettings = () => {
    setLiveProgrammesData({
      ...liveProgrammes,
      enabled,
      sectionTitle,
      sectionSubtitle,
      badgeText,
    });
    toast.success("Live programme section settings saved!");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600/10 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-red-600/20 text-red-700 rounded-2xl shrink-0 shadow-xs">
              <Radio className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Live Programme Manager</h2>
                <span className="bg-red-100 text-red-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-300">
                  Smart Live Engine
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Schedule temple livestreams for YouTube, Facebook, and other channels. The homepage automatically transitions between <strong>Upcoming → LIVE NOW → Ended</strong> based on your schedule, or you can force Live Now manually.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-red-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Scheduled Streams</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-red-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Active Live</span>
              <strong className="font-display text-lg text-green-600">{publishedCount}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Broadcast
            </button>
            <a
              href="/#live-programme"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Homepage
            </a>
          </div>
        </div>
      </div>

            {/* Modal Add / Edit Dialog */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Live Programme" : "Schedule New Live Programme"}
        subtitle={editingId ? "Update broadcast timing, stream URL, and live status" : "Configure streaming platform URL, thumbnail, and reminder settings"}
        icon={Tv}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =============================================================== */}
            {/* LEFT COLUMN: STREAM PLATFORM, THUMBNAIL & DIRECT OVERRIDES      */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Platform Selector */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                  Streaming Platform <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => {
                        setPlatform(p);
                        if (p === "YouTube" && !streamUrl) setStreamUrl("https://www.youtube.com/@iskconkurnool/live");
                        if (p === "Facebook" && !streamUrl) setStreamUrl("https://www.facebook.com/iskconkurnool/live");
                        if (p === "Instagram" && !streamUrl) setStreamUrl("https://www.instagram.com/iskconkurnool/live");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        platform === p
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {p === "YouTube" && "🔴 YouTube Live"}
                      {p === "Facebook" && "🔵 Facebook Live"}
                      {p === "Instagram" && "📸 Instagram Live"}
                      {p === "Other" && "🌐 Other Stream"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream URL */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                  Live Stream / Channel URL <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/@iskconkurnool/live"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The "Watch LIVE" button on homepage directly opens this link.
                </p>
              </div>

              {/* Thumbnail Frame */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                    Live Stream Thumbnail / Poster
                  </label>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-white px-2 py-0.5 rounded-md border">
                    16:9 Aspect Ratio
                  </span>
                </div>

                <UploadBox
                  label="Upload 16:9 Thumbnail"
                  url={thumbnailUrl}
                  onPick={onPickThumbnail}
                  aspect="aspect-[16/9]"
                  className="w-full h-44 rounded-2xl"
                />

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" /> Or paste direct Image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* =============================================================== */}
            {/* RIGHT COLUMN: PROGRAMME TITLE, TIMINGS, SPEAKER & CONTROLS      */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Title & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                  Programme Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Srimad Bhagavatam Discourse & Deity Darshan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs font-display font-bold text-foreground"
                  required
                />
              </div>

              {/* Date & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-accent" /> Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setDate(new Date().toISOString().split("T")[0])}
                      className="text-[11px] text-accent font-bold hover:underline"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-accent" /> Start Time (IST)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-accent" /> End Time (IST)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Speaker / Performer & Description */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5">
                  Speaker / Guest / Kirtan Leader (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Temple Sannyasis & Senior Devotees"
                  value={speakerOrPerformer}
                  onChange={(e) => setSpeakerOrPerformer(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1.5">
                  Programme Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of today's live discourse or broadcast highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none resize-y min-h-[80px] shadow-2xs"
                />
              </div>

              {/* Advanced Toggles (Force Live Now, Enable Reminder, Published) */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isManualLiveOverride}
                      onChange={(e) => setIsManualLiveOverride(e.target.checked)}
                      className="h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                        <Radio className="h-3.5 w-3.5 animate-pulse" /> Force "LIVE NOW" (Single Live Stream Override)
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Immediately displays this programme as LIVE NOW across the entire website. Only 1 programme can be active at a time (saving this deactivates any other forced live streams).
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableReminders}
                      onChange={(e) => setEnableReminders(e.target.checked)}
                      className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Enable "Set Reminder" CTA button
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded border-slate-300 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Published (Active on site)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  {busy ? (
                    "Saving..."
                  ) : editingId ? (
                    <>
                      <Check className="h-4 w-4" /> Save Broadcast Changes
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Schedule Live Programme
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
                >
                  Reset Form
                </button>
              </div>

            </div>

          </div>

        </form>
      </AdminModal>

      {/* Page Header & Section Settings Accordion */}
      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSettingsAccordion(!showSettingsAccordion)}
          className="w-full px-6 sm:px-8 py-4 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="h-4 w-4 text-accent" />
            <h3 className="font-display font-bold text-base text-primary">
              Homepage Section Header & Display Settings
            </h3>
          </div>
          {showSettingsAccordion ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showSettingsAccordion && (
          <div className="p-6 sm:p-8 space-y-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={sectionSubtitle}
                  onChange={(e) => setSectionSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-xs bg-white"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="section-enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="section-enabled" className="text-xs font-bold text-foreground cursor-pointer">
                  Show Live Programme section on Homepage
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={saveSettings}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer shadow-sm"
              >
                Save Header Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Programme Schedule / Archive List */}
      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <h3 className="font-display text-xl font-bold text-primary">
              All Scheduled Programmes ({programmes.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live engine dynamically activates streams on the homepage based on start/end time
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
            />
          </div>
        </div>

        {filteredProgrammes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Tv className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-semibold">No live programmes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.map((item) => {
              const isOverride = !!item.isManualLiveOverride;

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white ${
                    isOverride
                      ? "border-red-500 ring-2 ring-red-500/20 shadow-md"
                      : "border-slate-200/80 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      <img
                        src={item.thumbnailUrl || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {isOverride ? (
                          <span className="bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Radio className="h-3 w-3 animate-pulse" /> Forced Live Now
                          </span>
                        ) : (
                          <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {item.platform}
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white font-sans text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {item.date} • {item.startTime}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2">
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.startTime} – {item.endTime} IST
                      </div>

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

                      {item.speakerOrPerformer && (
                        <p className="text-[11px] text-muted-foreground truncate pt-1">
                          🎙️ {item.speakerOrPerformer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition-colors cursor-pointer"
                        title="Edit programme"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>

                      <button
                        onClick={async () => {
                          const nextState = !item.isManualLiveOverride;
                          await updateLiveProgramme(item.id, { isManualLiveOverride: nextState });
                          if (nextState) {
                            toast.success(`🔴 "${item.title}" is now LIVE NOW on website! (Other live streams deactivated)`);
                          } else {
                            toast.info(`Live override deactivated for "${item.title}"`);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${
                          item.isManualLiveOverride
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                        title="Toggle manual Live Now override"
                      >
                        {item.isManualLiveOverride ? "🔴 Live Now: ON" : "Make Live Now"}
                      </button>

                      <button
                        onClick={() => updateLiveProgramme(item.id, { published: item.published === false })}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          item.published !== false
                            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            : "bg-slate-100 border-slate-200 text-muted-foreground hover:bg-slate-200"
                        }`}
                        title={item.published !== false ? "Hide stream from site" : "Publish stream live"}
                      >
                        {item.published !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete stream"
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
