import { useState } from "react";
import { useAdmin, defaultTempleSchedule, TempleScheduleItem } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Plus, Clock, Sunrise, Sun, Sunset, Pencil, Eye 
} from "lucide-react";
import { toast } from "sonner";

export default function TempleScheduleManager() {
  const { templeSchedule, setTempleSchedule } = useAdmin();
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [iconName, setIconName] = useState("sunrise");
  const [order, setOrder] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const items = templeSchedule && templeSchedule.length > 0 ? templeSchedule : defaultTempleSchedule;
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

  const resetForm = () => {
    setName("");
    setTime("");
    setPeriod("Morning");
    setIconName("sunrise");
    setOrder(items.length + 1);
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const save = () => {
    if (!name.trim() || !time.trim()) {
      toast.error("Activity name and time are required");
      return;
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? { ...item, name, time, period, iconName, order: Number(order) || 1 }
          : item
      );
      setTempleSchedule(updated);
      toast.success("Schedule timing updated!");
    } else {
      const newItem: TempleScheduleItem = {
        id: "ts_" + Date.now().toString(),
        name,
        time,
        period,
        iconName,
        order: Number(order) || (items.length + 1),
      };
      setTempleSchedule([...items, newItem]);
      toast.success("✨ New schedule timing added!");
    }

    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (item: TempleScheduleItem) => {
    setEditingId(item.id);
    setName(item.name);
    setTime(item.time);
    setPeriod(item.period);
    setIconName(item.iconName);
    setOrder(item.order);
    setIsModalOpen(true);
  };

  const remove = (id: string, itemName: string) => {
    if (confirm(`Remove "${itemName}" from temple schedule?`)) {
      setTempleSchedule(items.filter((item) => item.id !== id));
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Schedule timing removed");
    }
  };

  const filteredItems = sorted.filter((item) => {
    if (periodFilter !== "all" && item.period !== periodFilter) return false;
    return true;
  });

  const getIcon = (ic: string) => {
    if (ic === "sun") return <Sun className="h-4 w-4 text-amber-500" />;
    if (ic === "sunset") return <Sunset className="h-4 w-4 text-orange-500" />;
    return <Sunrise className="h-4 w-4 text-rose-500" />;
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Daily Temple Schedule</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Nitya Seva Timings
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage daily darshan, arati, and discourse timings from Mangala Arati (4:30 AM) to Shayana Arati (8:30 PM).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Events</span>
              <strong className="font-display text-lg text-primary">{items.length}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Timing
            </button>
            <a
              href="/#schedule"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View on Homepage
            </a>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "Morning", "Afternoon", "Evening"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodFilter(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodFilter === p
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p === "all" ? "All Timings" : p}
          </button>
        ))}
      </div>

      {/* Schedule Timetable List */}
      <div className="bg-white rounded-3xl shadow-elegant border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
            Current Daily Schedule ({filteredItems.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200/60 shrink-0">
                  {getIcon(item.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm sm:text-base text-foreground">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.period}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-accent font-mono block mt-0.5">
                    {item.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-slate-50 rounded-lg">
                  Order: #{item.order}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground text-xs font-bold transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id, item.name)}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL FOR ADD / EDIT TIMING */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Schedule Activity" : "Add New Schedule Activity"}
        subtitle="Configure activity name, time slot, period, and display order"
        icon={Clock}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
              Activity Name <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g. Mangala Arati & Kirtan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Time (IST) <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="e.g. 04:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Period
              </label>
              <select
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Icon Style
              </label>
              <select
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
              >
                <option value="sunrise">Sunrise</option>
                <option value="sun">Sun</option>
                <option value="sunset">Sunset</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {editingId ? "Save Changes" : "Add Activity"}
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
      </AdminModal>

    </div>
  );
}
