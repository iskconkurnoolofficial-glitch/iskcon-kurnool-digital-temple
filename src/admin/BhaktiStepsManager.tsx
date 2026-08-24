import { useState } from "react";
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

type SubTab = "overview" | "levels" | "registrations" | "contacts";

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

  // Registrations Filter & Search
  const [regSearch, setRegSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const levels = bhaktiSteps.levels || [];
  const registrations = bhaktiSteps.registrations || [];

  const unreadRegistrationsCount = registrations.filter((r) => !r.read).length;

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

  const filteredRegistrations = registrations.filter((r) => {
    const q = regSearch.toLowerCase().trim();
    const matchesQ =
      !q ||
      r.fullName.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);

    const matchesLevel = levelFilter === "all" || r.level === levelFilter;
    return matchesQ && matchesLevel;
  });

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.error("No registrations available to export.");
      return;
    }

    const headers = ["Registration ID", "Full Name", "Phone", "Email", "Age", "City", "Level", "Contact Method", "Message", "Submission Date"];
    const rows = registrations.map((r) => [
      r.id,
      r.fullName,
      r.phone,
      r.email || "",
      r.age || "",
      r.city,
      r.level,
      r.contactMethod,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      new Date(r.submittedAt).toLocaleString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bhakti_steps_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported registrations to CSV!");
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
          onClick={() => setActiveTab("registrations")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "registrations"
              ? "bg-primary text-white shadow-sm"
              : "bg-white border text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Registrations ({registrations.length})</span>
          {unreadRegistrationsCount > 0 && (
            <span className="h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white text-[9px] font-black grid place-items-center">
              {unreadRegistrationsCount}
            </span>
          )}
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
          <span>Helpline Phones &amp; Links</span>
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
      {/* TAB 2: REGISTRATIONS ROSTER */}
      {/* ========================================================================= */}
      {activeTab === "registrations" && (
        <div className="bg-white rounded-3xl border shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Devotee Registrations ({filteredRegistrations.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                View submitted registrations, filter by level, and export data for devotee mentors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={markAllBhaktiStepsRegistrationsRead}
                className="px-3 py-1.5 rounded-xl border hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Mark All Read
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, city, or ID..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs bg-surface/30 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border rounded-xl text-xs bg-white font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              {levels.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Registrations Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="h-10 w-10 mx-auto opacity-40" />
              <p className="text-sm font-semibold">No devotee registrations match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b text-slate-700 font-bold">
                    <th className="p-3">Devotee</th>
                    <th className="p-3">Target Level</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">City / Age</th>
                    <th className="p-3">Message / Details</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRegistrations.map((r) => (
                    <tr key={r.id} className={`hover:bg-slate-50/80 transition ${!r.read ? "bg-amber-50/40" : ""}`}>
                      <td className="p-3">
                        <div className="font-bold text-primary">{r.fullName}</div>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {r.id}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-accent bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                          {r.level}
                        </span>
                      </td>

                      <td className="p-3 space-y-0.5">
                        <div className="font-mono font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          <a href={`tel:+91${r.phone}`} className="hover:underline">{r.phone}</a>
                        </div>
                        {r.email && <div className="text-[10px] text-slate-500">{r.email}</div>}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{r.city}</div>
                        {r.age && <div className="text-[10px] text-slate-500">{r.age} yrs</div>}
                      </td>

                      <td className="p-3 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-[11px]">{r.message || "—"}</p>
                      </td>

                      <td className="p-3 text-[10px] text-slate-500">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete registration for ${r.fullName}?`)) {
                              deleteBhaktiStepsRegistration(r.id);
                              toast.info("Registration removed.");
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Delete Registration"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              <h3 className="font-display font-bold text-xl text-primary">Helplines &amp; External Links</h3>
              <p className="text-xs text-muted-foreground">Configure devotee assistance phone numbers and official source URLs.</p>
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
