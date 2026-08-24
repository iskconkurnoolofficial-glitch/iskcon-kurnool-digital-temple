import { useState, useMemo } from "react";
import {
  useAdmin,
  uploadToCloudinary,
  EkadashiData,
  EkadashiCalendarItem,
  EkadashiScheduleItem,
  defaultEkadashiCalendar,
  defaultEkadashiTempleSchedule
} from "@/context/AdminContext";
import {
  Plus,
  Trash2,
  Moon,
  Eye,
  Sparkles,
  AlertCircle,
  Leaf,
  Utensils,
  BookOpen,
  Calendar,
  Clock,
  Sunrise,
  Sunset,
  CheckCircle2,
  XCircle,
  Edit3,
  Search,
  RotateCcw,
  Sun,
  Star,
  Flame,
  Info,
  Check,
  X,
  Share2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Music,
  Building
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function EkadashiManager() {
  const { ekadashi, setEkadashi } = useAdmin();
  const [activeTab, setActiveTab] = useState<"calendar" | "templeSchedule" | "spiritual" | "dietary" | "hero">("calendar");
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaksha, setFilterPaksha] = useState<string>("all");

  // Modal State for adding/editing an Ekadashi Calendar Item
  const [editingCalendarItem, setEditingCalendarItem] = useState<EkadashiCalendarItem | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Modal State for adding/editing an Ekadashi Temple Schedule Item
  const [editingScheduleItem, setEditingScheduleItem] = useState<EkadashiScheduleItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const update = (patch: Partial<EkadashiData>) => {
    setEkadashi({ ...ekadashi, ...patch });
    toast.success("Changes saved successfully!");
  };

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      update({ image: url });
      toast.success("Ekadashi hero banner uploaded!");
    } catch {
      toast.error("Banner upload failed");
    }
    setBusy(false);
  };

  const pickItemImage = async (f: File) => {
    if (!editingCalendarItem) return;
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      setEditingCalendarItem({ ...editingCalendarItem, image: url });
      toast.success("Deity image uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
    setBusy(false);
  };

  // Helper to calculate day name from ISO date string YYYY-MM-DD
  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday: "long" });
    } catch {
      return "";
    }
  };

  // --- CALENDAR MODAL HANDLERS ---
  const openAddCalendarModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    const newItem: EkadashiCalendarItem = {
      id: "ek_" + Date.now(),
      name: "",
      date: todayStr,
      day: getDayName(todayStr),
      paksha: "Gaura Paksha",
      vaishnavaMonth: "Madhava",
      tithiStart: "06:00 AM",
      tithiEnd: "04:30 AM",
      paranaDate: tomorrowStr,
      paranaStartTime: "06:15 AM",
      paranaEndTime: "10:15 AM",
      fastingType: "Phalahari Fast (Fruits & Milk)",
      description: "Fasting on this sacred Ekadashi cleanses all sinful reactions and awakens spontaneous devotional love for Lord Sri Krishna.",
      specialInstructions: "Do not pluck Tulsi leaves on Ekadashi or Dwadashi. Pick Tulsi the previous day. Break fast during the Parana window.",
      isPublished: true,
      isFeatured: false,
      order: (ekadashi.calendar?.length || 0) + 1,
    };
    setEditingCalendarItem(newItem);
    setIsCalendarModalOpen(true);
  };

  const openEditCalendarModal = (item: EkadashiCalendarItem) => {
    setEditingCalendarItem({ ...item });
    setIsCalendarModalOpen(true);
  };

  const saveCalendarModalItem = () => {
    if (!editingCalendarItem) return;
    if (!editingCalendarItem.name.trim()) {
      toast.error("Please enter Ekadashi name");
      return;
    }
    if (!editingCalendarItem.date) {
      toast.error("Please select a date");
      return;
    }

    const currentCalendar = ekadashi.calendar || [];
    const exists = currentCalendar.some((x) => x.id === editingCalendarItem.id);

    let updatedCalendar: EkadashiCalendarItem[];
    if (exists) {
      updatedCalendar = currentCalendar.map((x) => (x.id === editingCalendarItem.id ? editingCalendarItem : x));
      toast.success(`Updated ${editingCalendarItem.name}`);
    } else {
      updatedCalendar = [...currentCalendar, editingCalendarItem];
      toast.success(`Added ${editingCalendarItem.name}`);
    }

    // Sort by date ascending
    updatedCalendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    update({ calendar: updatedCalendar });
    setIsCalendarModalOpen(false);
    setEditingCalendarItem(null);
  };

  const deleteCalendarItem = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the Ekadashi calendar?`)) return;
    const filtered = (ekadashi.calendar || []).filter((x) => x.id !== id);
    update({ calendar: filtered });
    toast.success(`Deleted ${name}`);
  };

  const togglePublished = (id: string) => {
    const updated = (ekadashi.calendar || []).map((x) => (x.id === id ? { ...x, isPublished: !x.isPublished } : x));
    update({ calendar: updated });
  };

  const restoreDefaultCalendar = () => {
    if (confirm("Restore all 20+ standard Vaishnava 2026 Ekadashis? Any custom changes to dates/timings will be reset to default.")) {
      update({ calendar: defaultEkadashiCalendar });
      toast.success("Restored full 2026 Vaishnava Ekadashi Calendar!");
    }
  };

  // --- TEMPLE SCHEDULE HANDLERS ---
  const currentSchedule = ekadashi.templeSchedule || defaultEkadashiTempleSchedule;

  const openAddScheduleModal = () => {
    const newItem: EkadashiScheduleItem = {
      id: "ek_sch_" + Date.now(),
      time: "06:00 PM – 07:00 PM",
      title: "",
      description: "",
      period: "Evening",
      iconName: "sunset",
      highlight: false,
      order: currentSchedule.length + 1,
    };
    setEditingScheduleItem(newItem);
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (item: EkadashiScheduleItem) => {
    setEditingScheduleItem({ ...item });
    setIsScheduleModalOpen(true);
  };

  const saveScheduleModalItem = () => {
    if (!editingScheduleItem) return;
    if (!editingScheduleItem.title.trim()) {
      toast.error("Please enter Programme title");
      return;
    }
    if (!editingScheduleItem.time.trim()) {
      toast.error("Please enter Timing");
      return;
    }

    const exists = currentSchedule.some((x) => x.id === editingScheduleItem.id);
    let updated: EkadashiScheduleItem[];

    if (exists) {
      updated = currentSchedule.map((x) => (x.id === editingScheduleItem.id ? editingScheduleItem : x));
      toast.success(`Updated "${editingScheduleItem.title}"`);
    } else {
      updated = [...currentSchedule, editingScheduleItem];
      toast.success(`Added "${editingScheduleItem.title}"`);
    }

    update({ templeSchedule: updated });
    setIsScheduleModalOpen(false);
    setEditingScheduleItem(null);
  };

  const deleteScheduleItem = (id: string, title: string) => {
    if (!confirm(`Delete "${title}" from Ekadashi Temple Schedule?`)) return;
    const filtered = currentSchedule.filter((x) => x.id !== id);
    update({ templeSchedule: filtered });
    toast.success(`Deleted "${title}"`);
  };

  const moveScheduleItem = (index: number, direction: "up" | "down") => {
    const list = [...currentSchedule];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-index order
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    update({ templeSchedule: updated });
  };

  const restoreDefaultSchedule = () => {
    if (confirm("Reset Ekadashi Temple Schedule to standard ISKCON temple timings?")) {
      update({ templeSchedule: defaultEkadashiTempleSchedule });
      toast.success("Restored standard Ekadashi Temple Schedule!");
    }
  };

  // Find currently detected Next Ekadashi
  const now = new Date();
  const todayIso = now.toISOString().split("T")[0];
  const upcomingEkadashis = useMemo(() => {
    return (ekadashi.calendar || [])
      .filter((it) => it.isPublished && it.date >= todayIso)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ekadashi.calendar, todayIso]);

  const nextEkadashi = upcomingEkadashis[0] || (ekadashi.calendar || []).find((it) => it.isPublished);

  // Filtered calendar list
  const filteredCalendar = useMemo(() => {
    return (ekadashi.calendar || []).filter((it) => {
      const matchesSearch =
        it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.vaishnavaMonth && it.vaishnavaMonth.toLowerCase().includes(searchQuery.toLowerCase())) ||
        it.date.includes(searchQuery);
      const matchesPaksha = filterPaksha === "all" || it.paksha === filterPaksha;
      return matchesSearch && matchesPaksha;
    });
  }, [ekadashi.calendar, searchQuery, filterPaksha]);

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-2xs transition-all";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-slate-700 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Overview */}
      <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-orange-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-900 rounded-2xl shrink-0 shadow-xs border border-amber-300/40">
              <Moon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-2xl font-bold text-slate-900">Ekadashi Calendar & Vrata Management</h2>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300 shadow-xs">
                  Dynamic Vaishnava Engine
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Configure every Ekadashi in the calendar, Kurnool Parana breaking windows, temple day schedule, fasting types, and spiritual guidelines. All changes automatically update the public website in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/ekadashi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-amber-600" /> View Public Page
            </a>
          </div>
        </div>
      </div>

      {/* Live "Next Ekadashi & Parana Timing" Indicator Card */}
      {nextEkadashi && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white rounded-3xl p-5 sm:p-6 border border-amber-300/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-gold shrink-0">
              <Sunrise className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                  Currently Live as "Next Ekadashi"
                </span>
                <span className="text-xs text-slate-500 font-medium">{nextEkadashi.paksha}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                {nextEkadashi.name} — {nextEkadashi.date} ({nextEkadashi.day})
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-700">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-900">
                  <Clock className="h-3.5 w-3.5 text-amber-600" /> Parana Window: {nextEkadashi.paranaStartTime} – {nextEkadashi.paranaEndTime}
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> On Dwadashi: {nextEkadashi.paranaDate}
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Utensils className="h-3.5 w-3.5 text-slate-400" /> {nextEkadashi.fastingType}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openEditCalendarModal(nextEkadashi)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit Next Ekadashi
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "calendar" ? "bg-white text-amber-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Calendar className="h-4 w-4 text-amber-600" />
          Ekadashi Calendar ({ekadashi.calendar?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templeSchedule")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "templeSchedule" ? "bg-white text-amber-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Building className="h-4 w-4 text-orange-600" />
          Ekadashi Temple Schedule ({currentSchedule.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("spiritual")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "spiritual" ? "bg-white text-amber-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Leaf className="h-4 w-4 text-emerald-600" />
          Tulsi & Spiritual Sadhana
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dietary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "dietary" ? "bg-white text-amber-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Utensils className="h-4 w-4 text-red-500" />
          Fasting & Strictly Avoid Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "hero" ? "bg-white text-amber-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sparkles className="h-4 w-4 text-purple-600" />
          Hero & Banner
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DYNAMIC EKADASHI CALENDAR & PARANA TIMINGS                          */}
      {/* ========================================================================= */}
      {activeTab === "calendar" && (
        <div className="space-y-5">
          {/* Action Bar: Search, Filter, Add & Restore */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Ekadashi name, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <select
                value={filterPaksha}
                onChange={(e) => setFilterPaksha(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Pakshas</option>
                <option value="Gaura Paksha">Gaura Paksha (Waxing)</option>
                <option value="Krishna Paksha">Krishna Paksha (Waning)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={restoreDefaultCalendar}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
                title="Reset/Populate default 20+ Vaishnava Ekadashis"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Default List
              </button>

              <button
                type="button"
                onClick={openAddCalendarModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Ekadashi
              </button>
            </div>
          </div>

          {/* Ekadashis Table / Cards List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-elegant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-5">Ekadashi Name & Month</th>
                    <th className="py-4 px-4">Fast Date & Day</th>
                    <th className="py-4 px-4">Tithi Timings</th>
                    <th className="py-4 px-4 text-amber-900 font-extrabold">Parana Window (Dwadashi)</th>
                    <th className="py-4 px-4">Fasting Type</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalendar.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No Ekadashi found matching your filter. Click <strong>Add Ekadashi</strong> to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredCalendar.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <Moon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {item.name}
                                {item.isFeatured && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                    ★ Featured
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {item.paksha} • {item.vaishnavaMonth || "Vaishnava Month"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">{item.date}</div>
                          <span className="text-[11px] text-slate-500 font-medium">{item.day}</span>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-600">
                          <div><span className="text-slate-400">Start:</span> {item.tithiStart}</div>
                          <div><span className="text-slate-400">End:</span> {item.tithiEnd}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 font-bold text-xs border border-amber-200">
                            <Sunrise className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>{item.paranaStartTime} – {item.paranaEndTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.paranaDate}</div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {item.fastingType}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => togglePublished(item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              item.isPublished
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {item.isPublished ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {item.isPublished ? "Published" : "Draft"}
                          </button>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCalendarModal(item)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Ekadashi"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteCalendarItem(item.id, item.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete from calendar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EKADASHI TEMPLE SCHEDULE MANAGEMENT                                */}
      {/* ========================================================================= */}
      {activeTab === "templeSchedule" && (
        <div className="space-y-6">
          {/* Header Info & Devotee Notice Card */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/15 text-orange-800 rounded-xl">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    🏛️ Ekadashi Temple Schedule Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure the special temple day timetable, kirtans, and katha at ISKCON Kurnool.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={restoreDefaultSchedule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restore Default Schedule
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Section Title</label>
                <input
                  className={inputClass}
                  value={ekadashi.templeScheduleTitle || "Special Ekadashi Temple Schedule"}
                  onChange={(e) => update({ templeScheduleTitle: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  className={inputClass}
                  value={ekadashi.templeScheduleSubtitle || "Join us at Sri Sri Puri Jagannath Temple, ISKCON Kurnool for all-day kirtan, discourses, and phalahari prasadam."}
                  onChange={(e) => update({ templeScheduleSubtitle: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Temple Notice / Devotee Welcome Announcement</label>
              <textarea
                className={inputClass}
                rows={2}
                value={ekadashi.templeScheduleNotice || "Devotees are cordially invited to participate in the transcendental Mangala Harati, Akhanda Japa, and Evening Bhajan Sandhya."}
                onChange={(e) => update({ templeScheduleNotice: e.target.value })}
              />
            </div>
          </div>

          {/* Schedule Items List */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Temple Programmes & Darshan Timetable ({currentSchedule.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Add, edit, or reorder programmes for the sacred Ekadashi festival day.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddScheduleModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Programme
              </button>
            </div>

            <div className="space-y-3">
              {currentSchedule.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.highlight
                      ? "bg-amber-50/60 border-amber-300 shadow-2xs"
                      : "bg-slate-50/70 border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-amber-700 shrink-0 shadow-2xs">
                      {item.iconName === "sunrise" && <Sunrise className="h-5 w-5 text-orange-500" />}
                      {item.iconName === "sun" && <Sun className="h-5 w-5 text-amber-500" />}
                      {item.iconName === "sunset" && <Sunset className="h-5 w-5 text-purple-500" />}
                      {item.iconName === "moon" && <Moon className="h-5 w-5 text-indigo-500" />}
                      {item.iconName === "music" && <Music className="h-5 w-5 text-pink-500" />}
                      {item.iconName === "book" && <BookOpen className="h-5 w-5 text-blue-500" />}
                      {item.iconName === "utensils" && <Utensils className="h-5 w-5 text-emerald-500" />}
                      {!["sunrise", "sun", "sunset", "moon", "music", "book", "utensils"].includes(item.iconName) && (
                        <Clock className="h-5 w-5 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        {item.highlight && (
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                            ★ Key Programme
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                          {item.period}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-600" /> {item.time}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveScheduleItem(idx, "up")}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentSchedule.length - 1}
                      onClick={() => moveScheduleItem(idx, "down")}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditScheduleModal(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Edit programme"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteScheduleItem(item.id, item.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete programme"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TULSI DEVI RULES & SPIRITUAL SADHANA                               */}
      {/* ========================================================================= */}
      {activeTab === "spiritual" && (
        <div className="space-y-6">
          {/* Tulsi Warning Rule Callout */}
          <div className="bg-emerald-50/70 rounded-3xl p-6 border-2 border-emerald-300/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-emerald-950">
                  Critical Holy Rule: Tulsi Seva Mahatmya
                </h3>
                <p className="text-xs text-emerald-800">
                  Highlighted with topmost prominence across the entire Ekadashi website.
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Section Title</label>
              <input
                className={inputClass}
                value={ekadashi.tulsiTitle}
                onChange={(e) => update({ tulsiTitle: e.target.value })}
                placeholder="Crucial Tulsi Seva Rule"
              />
            </div>

            <div>
              <label className={labelClass}>Tulsi Leaf Plucking Injunction (Scriptural Directive)</label>
              <textarea
                className={inputClass}
                rows={3}
                value={ekadashi.tulsiBody}
                onChange={(e) => update({ tulsiBody: e.target.value })}
                placeholder="Do not pluck Tulsi leaves on Ekadashi or Dwadashi. If Tulsi is required for worship, it should be picked the previous day."
              />
            </div>
          </div>

          {/* Purpose of Ekadashi */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/15 text-amber-800 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                🕉️ Transcendental Purpose of Ekadashi
              </h3>
            </div>

            <div>
              <label className={labelClass}>Heading</label>
              <input
                className={inputClass}
                value={ekadashi.purposeTitle}
                onChange={(e) => update({ purposeTitle: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Spiritual Purpose Statement</label>
              <textarea
                className={inputClass}
                rows={4}
                value={ekadashi.purposeBody}
                onChange={(e) => update({ purposeBody: e.target.value })}
              />
            </div>
          </div>

          {/* Morning Practice (3 Steps) */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/15 text-orange-800 rounded-xl">
                  <Sun className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  🌅 Morning Practice (3 Sacred Steps)
                </h3>
              </div>
            </div>

            <div>
              <label className={labelClass}>Section Title</label>
              <input
                className={inputClass}
                value={ekadashi.morningTitle}
                onChange={(e) => update({ morningTitle: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Steps (Worship, Offer, Pray)</label>
              {ekadashi.morningSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                    value={step}
                    onChange={(e) => {
                      const updated = [...ekadashi.morningSteps];
                      updated[idx] = e.target.value;
                      update({ morningSteps: updated });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = ekadashi.morningSteps.filter((_, i) => i !== idx);
                      update({ morningSteps: updated });
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Remove step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update({ morningSteps: [...ekadashi.morningSteps, "New morning sadhana step"] })}
                className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold hover:underline cursor-pointer pt-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Another Step
              </button>
            </div>
          </div>

          {/* The Maha Mantra Target & Sanctuary */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-3xl shadow-elegant p-6 border border-amber-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-amber-950">
                🕉️ The Maha Mantra Sanctuary
              </h3>
            </div>

            <div>
              <label className={labelClass}>Maha Mantra Verses (One per line)</label>
              <textarea
                className="w-full px-3.5 py-2.5 border border-amber-300/80 rounded-xl bg-white text-sm font-display font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20 focus:outline-none leading-relaxed"
                rows={3}
                value={ekadashi.mantra}
                onChange={(e) => update({ mantra: e.target.value })}
              />
            </div>
          </div>

          {/* Dwadashi Breaking the Fast Guidelines */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/15 text-purple-800 rounded-xl">
                <Sunrise className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  🌸 Dwadashi — Breaking the Fast Section
                </h3>
                <p className="text-xs text-slate-500">
                  Admin-entered Parana timings for the active Ekadashi automatically appear in this section on the public site.
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Section Title</label>
              <input
                className={inputClass}
                value={ekadashi.dwadashiTitle}
                onChange={(e) => update({ dwadashiTitle: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Dwadashi Morning Procedure</label>
              <textarea
                className={inputClass}
                rows={3}
                value={ekadashi.dwadashiBody}
                onChange={(e) => update({ dwadashiBody: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Important Parana Time Window Note</label>
              <textarea
                className={inputClass}
                rows={2}
                value={ekadashi.dwadashiNote}
                onChange={(e) => update({ dwadashiNote: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FASTING & STRICTLY AVOID RULES                                     */}
      {/* ========================================================================= */}
      {activeTab === "dietary" && (
        <div className="space-y-6">
          {/* Strictly Avoid Warning Card */}
          <div className="bg-red-50/80 rounded-3xl p-6 border-2 border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-red-950">
                  🚫 Strictly Avoid (Tamasic Substances)
                </h3>
                <p className="text-xs text-red-700">
                  Core Vaishnava regulative principles strictly observed on Ekadashi & throughout pure devotional life.
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Warning Title</label>
              <input
                className={inputClass}
                value={ekadashi.warningTitle}
                onChange={(e) => update({ warningTitle: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Strictly Avoid Statement</label>
              <textarea
                className={inputClass}
                rows={3}
                value={ekadashi.warningBody}
                onChange={(e) => update({ warningBody: e.target.value })}
              />
            </div>
          </div>

          {/* Avoid vs Permitted Foods Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <BulletManagerCard
              title="Grains & Foods to Avoid on Ekadashi"
              badge="Forbidden on Ekadashi"
              badgeColor="bg-red-100 text-red-800"
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              heading={ekadashi.avoidTitle}
              onHeading={(v) => update({ avoidTitle: v })}
              items={ekadashi.avoidItems}
              onItems={(v) => update({ avoidItems: v })}
            />

            <BulletManagerCard
              title="Permitted Ekadashi Prasadam"
              badge="Phalahari Allowed"
              badgeColor="bg-emerald-100 text-emerald-800"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              heading={ekadashi.permitTitle}
              onHeading={(v) => update({ permitTitle: v })}
              items={ekadashi.permitItems}
              onItems={(v) => update({ permitItems: v })}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HERO & BANNER                                                      */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" /> Section Header & Badges
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Badge Label</label>
                <input className={inputClass} value={ekadashi.badge} onChange={(e) => update({ badge: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Main Title</label>
                <input className={inputClass} value={ekadashi.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input className={inputClass} value={ekadashi.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Hero Visual & Sacred Quote</h3>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <UploadBox
                label="Ekadashi Deity Banner"
                url={ekadashi.image}
                onPick={pickHeroImage}
                aspect="aspect-video"
                className="max-w-[280px]"
              />
              <div>
                <label className={labelClass}>Scriptural Quote / Message</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={ekadashi.imageQuote}
                  onChange={(e) => update({ imageQuote: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT EKADASHI CALENDAR MODAL                                        */}
      {/* ========================================================================= */}
      {isCalendarModalOpen && editingCalendarItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-900 rounded-xl">
                  <Moon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {editingCalendarItem.id.startsWith("ek_") && ekadashi.calendar?.some((x) => x.id === editingCalendarItem.id)
                      ? "Edit Ekadashi"
                      : "Add New Ekadashi"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure timings, fasting requirements, and Mahatmya details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Row 1: Name & Fast Date */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ekadashi Name *</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Mokshada Ekadashi"
                    value={editingCalendarItem.name}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fast Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={editingCalendarItem.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setEditingCalendarItem({
                        ...editingCalendarItem,
                        date: newDate,
                        day: getDayName(newDate),
                      });
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Day of Week & Paksha */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Day of Week</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Friday"
                    value={editingCalendarItem.day}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, day: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Paksha</label>
                  <select
                    className={inputClass}
                    value={editingCalendarItem.paksha || "Gaura Paksha"}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, paksha: e.target.value })}
                  >
                    <option value="Gaura Paksha">Gaura Paksha (Shukla / Waxing)</option>
                    <option value="Krishna Paksha">Krishna Paksha (Waning)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Vaishnava Month</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Damodara (Kartika)"
                    value={editingCalendarItem.vaishnavaMonth || ""}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, vaishnavaMonth: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Tithi Start & End */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tithi Start Time</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. 05:14 AM, 14 Mar 2026"
                    value={editingCalendarItem.tithiStart}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, tithiStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tithi End Time</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. 03:42 AM, 15 Mar 2026"
                    value={editingCalendarItem.tithiEnd}
                    onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, tithiEnd: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4: Dwadashi Parana Timings (Crucial) */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-amber-700" />
                  <span className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                    Dwadashi Parana Breaking Window (Appears on Website)
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Parana Date (Dwadashi)</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. 16 Mar 2026"
                      value={editingCalendarItem.paranaDate}
                      onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, paranaDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Parana Start Time</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. 06:28 AM"
                      value={editingCalendarItem.paranaStartTime}
                      onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, paranaStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Parana End Time</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. 10:18 AM"
                      value={editingCalendarItem.paranaEndTime}
                      onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, paranaEndTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Fasting Category */}
              <div>
                <label className={labelClass}>Fasting Type / Notes</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Phalahari Fast (Fruits & Milk) or Strict Nirjala Fast"
                  value={editingCalendarItem.fastingType}
                  onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, fastingType: e.target.value })}
                />
              </div>

              {/* Description & Mahatmya */}
              <div>
                <label className={labelClass}>Ekadashi Description & Spiritual Glories (Mahatmya)</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Explain the glories, scriptural story from Padma/Brahma-vaivarta Purana..."
                  value={editingCalendarItem.description}
                  onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, description: e.target.value })}
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className={labelClass}>Special Instructions for Devotees</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Do not pluck Tulsi leaves today. Recite Bhagavad Gita."
                  value={editingCalendarItem.specialInstructions || ""}
                  onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, specialInstructions: e.target.value })}
                />
              </div>

              {/* Image & Switches */}
              <div className="grid sm:grid-cols-2 gap-4 items-center pt-2">
                <UploadBox
                  label="Deity Image (Optional)"
                  url={editingCalendarItem.image || ""}
                  onPick={pickItemImage}
                  aspect="aspect-video"
                  className="max-w-[200px]"
                />

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingCalendarItem.isPublished}
                      onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">Publish on Website</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingCalendarItem.isFeatured || false}
                      onChange={(e) => setEditingCalendarItem({ ...editingCalendarItem, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">Mark as Featured / Maha-Ekadashi</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCalendarModalItem}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Save Ekadashi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT EKADASHI TEMPLE SCHEDULE MODAL                                 */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && editingScheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/20 text-orange-900 rounded-xl">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {currentSchedule.some((x) => x.id === editingScheduleItem.id)
                      ? "Edit Temple Programme"
                      : "Add Temple Programme"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure timing and program details for Ekadashi day.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Programme Title *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Mangala Harati & Tulsi Puja"
                  value={editingScheduleItem.title}
                  onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, title: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Time Window *</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. 04:30 AM – 05:00 AM"
                    value={editingScheduleItem.time}
                    onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Period of Day</label>
                  <select
                    className={inputClass}
                    value={editingScheduleItem.period}
                    onChange={(e) =>
                      setEditingScheduleItem({
                        ...editingScheduleItem,
                        period: e.target.value as "Morning" | "Afternoon" | "Evening" | "Night",
                      })
                    }
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Icon Theme</label>
                <select
                  className={inputClass}
                  value={editingScheduleItem.iconName}
                  onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, iconName: e.target.value })}
                >
                  <option value="sunrise">Sunrise (Mangala / Early Morning)</option>
                  <option value="sun">Sun (Darshan / Mid-Morning)</option>
                  <option value="utensils">Utensils (Bhoga / Prasadam)</option>
                  <option value="sunset">Sunset (Sandhya Harati / Evening)</option>
                  <option value="moon">Moon (Shayana Harati / Night)</option>
                  <option value="book">Book (Bhagavatam / Gita Katha)</option>
                  <option value="music">Music (Harinama / Kirtan / Japa)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Description / Highlights</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  placeholder="e.g. Start the auspicious Ekadashi day with Mangala Harati and Tulsi Parikrama."
                  value={editingScheduleItem.description}
                  onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, description: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingScheduleItem.highlight}
                    onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, highlight: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Highlight as Key Programme (Special Badge)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveScheduleModalItem}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Save Programme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BulletManagerCard({
  title,
  badge,
  badgeColor,
  icon,
  heading,
  onHeading,
  items,
  onItems,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  icon?: React.ReactNode;
  heading: string;
  onHeading: (v: string) => void;
  items: string[];
  onItems: (v: string[]) => void;
}) {
  const setItem = (i: number, v: string) => onItems(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onItems(items.filter((_, idx) => idx !== i));
  const add = () => onItems([...items, ""]);

  return (
    <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
        </div>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Card Heading</label>
        <input
          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          value={heading}
          onChange={(e) => onHeading(e.target.value)}
          placeholder="Card Heading"
        />
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        <div className="flex items-center justify-between pb-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item List ({items.length})</label>
          <button
            type="button"
            onClick={add}
            className="text-xs text-amber-800 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Add Food Item
          </button>
        </div>
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              value={it}
              onChange={(e) => setItem(i, e.target.value)}
              placeholder="e.g. Sabudana, Samalu..."
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
