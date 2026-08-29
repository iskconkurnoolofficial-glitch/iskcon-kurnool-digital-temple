import { useState, useEffect } from "react";
import {
  useAdmin,
  uploadToCloudinary,
  BhaktiStepsLevel,
  BhaktiStepsRegistration,
  BhaktiStepsData,
  defaultBhaktiSteps,
} from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import {
  Award,
  Layers,
  Users,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Save,
  Phone,
  MessageCircle,
  Mail,
  Compass,
  Music,
  BookOpen,
  GraduationCap,
  Flame,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import AdminModal from "@/admin/AdminModal";

type SubTab = "overview" | "levels" | "contacts";

export default function BhaktiStepsManager() {
  const {
    bhaktiSteps,
    updateBhaktiStepsConfig,
    saveBhaktiStepsLevel,
    deleteBhaktiStepsLevel,
    deleteBhaktiStepsRegistration,
    markAllBhaktiStepsRegistrationsRead,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<SubTab>("levels");

  // Config Form State
  const [configState, setConfigState] = useState<BhaktiStepsData>(bhaktiSteps || defaultBhaktiSteps);

  useEffect(() => {
    if (bhaktiSteps) {
      setConfigState(bhaktiSteps);
    }
  }, [bhaktiSteps]);

  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Level Editor Modal State
  const [editingLevel, setEditingLevel] = useState<BhaktiStepsLevel | null>(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Level Form Temporary States (Comma-separated or multiline text)
  const [songsText, setSongsText] = useState("");
  const [practicesText, setPracticesText] = useState("");
  const [booksText, setBooksText] = useState("");
  const [learningText, setLearningText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");

  const levels = bhaktiSteps.levels || [];

  const handleOpenLevelEditor = (level: BhaktiStepsLevel) => {
    setEditingLevel(level);
    setSongsText((level.songs || []).join("\n"));
    setPracticesText((level.practices || []).join("\n"));
    setBooksText((level.books || []).join("\n"));
    setLearningText((level.learningOrCourses || []).join("\n"));
    setRequirementsText((level.requirements || []).join("\n"));
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;

    const songs = songsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const practices = practicesText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    const books = booksText
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    const learningOrCourses = learningText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
    const requirements = requirementsText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

      const updated: BhaktiStepsLevel = {
      ...editingLevel,
      songs,
      practices,
      books,
      learningOrCourses,
      requirements,
    };

    try {
      await saveBhaktiStepsLevel(updated);
      setIsLevelModalOpen(false);
      toast.success(`Saved level: ${updated.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save level.");
    }
  };

  const pickAboutImage = async (file: File) => {
    try {
      const url = await uploadToCloudinary(file);
      setConfigState((prev) => ({ ...prev, aboutImage: url }));
      toast.success("About section image uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleSaveGeneralConfig = async () => {
    setIsSavingConfig(true);
    try {
      await updateBhaktiStepsConfig(configState);
      toast.success("Bhakti Steps general settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#2e104e] via-[#431971] to-[#1c0833] text-white p-6 sm:p-8 rounded-3xl border border-amber-400/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-xs uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Progression CMS
            </span>
            <span className="text-xs text-amber-200 font-semibold font-mono">/bhakti-steps</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Bhakti Steps Management
          </h2>
          <p className="text-white/80 text-xs sm:text-sm">
            Manage the 5 progressive levels, syllabus, practices, literature, and devotee registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/bhakti-steps"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition cursor-pointer"
          >
            <span>View Public Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Sub-Tab Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab("levels")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "levels"
              ? "bg-primary text-white shadow-sm"
              : "bg-white border text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>5 Levels Syllabus ({levels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "overview"
              ? "bg-primary text-white shadow-sm"
              : "bg-white border text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Hero &amp; About Text</span>
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "contacts"
              ? "bg-primary text-white shadow-sm"
              : "bg-white border text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>Registration &amp; Helplines</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 5 LEVELS SYLLABUS EDITOR */}
      {/* ========================================================================= */}
      {activeTab === "levels" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {levels.map((lvl, index) => (
              <div
                key={lvl.id}
                className="bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3">
                    <span className="h-9 w-9 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm grid place-items-center shadow-xs">
                      {lvl.levelNumber || index + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-accent bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {lvl.badge || `Level ${lvl.levelNumber}`}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl text-primary">{lvl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">{lvl.subtitle}</p>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 text-pink-600 font-semibold">
                      <Music className="h-3.5 w-3.5" />
                      <span>{lvl.songs?.length || 0} Songs / Mantras</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                      <Flame className="h-3.5 w-3.5" />
                      <span>{lvl.practices?.length || 0} Daily Practices</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{lvl.books?.length || 0} Books</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{lvl.learningOrCourses?.length || 0} Modules</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLevelEditor(lvl)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Edit2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Edit Level Details &amp; Syllabus</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERAL OVERVIEW & TEXT CONFIG */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-3xl border shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-primary">Hero &amp; About Copy</h3>
              <p className="text-xs text-muted-foreground">Edit titles, subtitles, and descriptions on the public page.</p>
            </div>

            <button
              type="button"
              disabled={isSavingConfig}
              onClick={handleSaveGeneralConfig}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingConfig ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hero Section Title</label>
                <input
                  type="text"
                  value={configState.heroTitle}
                  onChange={(e) => setConfigState({ ...configState, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hero Subtitle</label>
                <input
                  type="text"
                  value={configState.heroSubtitle}
                  onChange={(e) => setConfigState({ ...configState, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hero Description</label>
              <textarea
                rows={3}
                value={configState.heroDescription}
                onChange={(e) => setConfigState({ ...configState, heroDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">About Section Title</label>
              <input
                type="text"
                value={configState.aboutTitle}
                onChange={(e) => setConfigState({ ...configState, aboutTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">About Section Description</label>
              <textarea
                rows={4}
                value={configState.aboutDescription}
                onChange={(e) => setConfigState({ ...configState, aboutDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <UploadBox
                label="About Section Graphic / Image (Displayed on the Right)"
                url={configState.aboutImage || ""}
                onPick={pickAboutImage}
                aspect="aspect-[4/3]"
                className="max-w-[280px]"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                This image replaces the side card on the public "About Bhakti Steps" section, rendered cleanly without borders or shadows.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HELPLINE PHONES & RESOURCE LINKS */}
      {/* ========================================================================= */}
      {activeTab === "contacts" && (
        <div className="bg-white rounded-3xl border shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-primary">Registration &amp; Helplines</h3>
              <p className="text-xs text-muted-foreground">Configure registration status, Google Form link, devotee assistance phone numbers, and official source URLs.</p>
            </div>

            <button
              type="button"
              disabled={isSavingConfig}
              onClick={handleSaveGeneralConfig}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingConfig ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Registration Status & Google Form URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Registration Status
                </label>
                <select
                  value={configState.registrationStatus || "Opened"}
                  onChange={(e) =>
                    setConfigState({
                      ...configState,
                      registrationStatus: e.target.value as "Opened" | "Closed" | "Coming Soon",
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold outline-none cursor-pointer"
                >
                  <option value="Opened">Opened</option>
                  <option value="Closed">Closed</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Google Form Link (Optional)
                </label>
                <input
                  type="url"
                  value={configState.googleFormUrl || ""}
                  onChange={(e) => setConfigState({ ...configState, googleFormUrl: e.target.value })}
                  placeholder="e.g. https://forms.gle/..."
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-mono outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  If inserted, the public registration button will link to this form instead of the local form.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Registration Contact Phone Numbers (Comma-separated)</label>
              <input
                type="text"
                value={(configState.contactPhones || []).join(", ")}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    contactPhones: e.target.value
                      .split(",")
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="9989147723, 9000002745, 9505377520"
                className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 font-mono outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Bhakti Steps URL</label>
                <input
                  type="url"
                  value={configState.officialUrl}
                  onChange={(e) => setConfigState({ ...configState, officialUrl: e.target.value })}
                  placeholder="https://bhaktisteps.com/"
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Books &amp; Study Materials URL</label>
                <input
                  type="url"
                  value={configState.booksUrl}
                  onChange={(e) => setConfigState({ ...configState, booksUrl: e.target.value })}
                  placeholder="https://www.kihdedu.com/"
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-surface/30 font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL DETAILS MODAL */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title={`Edit Level ${editingLevel?.levelNumber || ""}: ${editingLevel?.name || ""}`}
        subtitle="Update songs, daily practices, required books, and study modules (one item per line)."
        maxWidth="3xl"
      >
        {editingLevel && (
          <form onSubmit={handleSaveLevel} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Level Name</label>
                <input
                  type="text"
                  required
                  value={editingLevel.name}
                  onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  required
                  value={editingLevel.subtitle}
                  onChange={(e) => setEditingLevel({ ...editingLevel, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                rows={2}
                value={editingLevel.description}
                onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            {/* Multiline Lists Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-600 flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" /> Songs / Mantras to Learn (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={songsText}
                  onChange={(e) => setSongsText(e.target.value)}
                  placeholder="Srila Prabhupada Pranama&#10;Panchatattva Mantra&#10;Hare Krishna Mahamantra"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> Daily Practices &amp; Principles (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={practicesText}
                  onChange={(e) => setPracticesText(e.target.value)}
                  placeholder="One round Japa – Daily&#10;Krishna's Picture – At Home&#10;Weekly Once Satsanga"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> Books to Read (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={booksText}
                  onChange={(e) => setBooksText(e.target.value)}
                  placeholder="On the Way to Krishna&#10;Elevation to Krishna Consciousness&#10;Perfection of Yoga"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Courses / Learning (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={learningText}
                  onChange={(e) => setLearningText(e.target.value)}
                  placeholder="Introduction to Japa Meditation&#10;Basic Altar Setup at Home"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Milestone Requirements (1 per line)
              </label>
              <textarea
                rows={3}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Chanting minimum 1 round of Hare Krishna Mahamantra daily&#10;Keeping a holy picture of Sri Sri Radha Krishna at home"
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Level
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
