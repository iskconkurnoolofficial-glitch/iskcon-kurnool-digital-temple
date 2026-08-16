import { useState } from "react";
import { useAdmin, defaultTempleSchedule, TempleScheduleItem } from "@/context/AdminContext";
import { Trash2, Plus, Clock, Sunrise, Sun, Sunset, AlertCircle } from "lucide-react";

export default function TempleScheduleManager() {
  const { templeSchedule, setTempleSchedule } = useAdmin();
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState<"Morning" | "Afternoon" | "Evening">("Morning");
  const [iconName, setIconName] = useState("sunrise");
  const [order, setOrder] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = templeSchedule && templeSchedule.length > 0 ? templeSchedule : defaultTempleSchedule;
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

  const save = () => {
    if (!name || !time) {
      alert("Name and Time are required");
      return;
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? { ...item, name, time, period, iconName, order: Number(order) || 1 }
          : item
      );
      setTempleSchedule(updated);
      setEditingId(null);
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
    }

    // Reset inputs
    setName("");
    setTime("");
    setPeriod("Morning");
    setIconName("sunrise");
    setOrder(items.length + 2);
  };

  const startEdit = (item: TempleScheduleItem) => {
    setEditingId(item.id);
    setName(item.name);
    setTime(item.time);
    setPeriod(item.period);
    setIconName(item.iconName);
    setOrder(item.order);
  };

  const remove = (id: string) => {
    setTempleSchedule(items.filter((item) => item.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* SECTION HEADER BANNER */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Daily Darshan &amp; Arati Schedule</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Temple Schedule Manager</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Configure daily Mangala Arati, Bhagavatam Pravachana, Rajbhoga Arati, and Gaura Arati timings.
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Total Timings</span>
            <span className="text-xl font-extrabold text-white">{items.length}</span>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2 border-b pb-3">
          <Clock className="h-5 w-5 text-accent" />
          {editingId ? "Edit Temple Schedule Activity" : "Add New Temple Schedule Activity"}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className={labelClass}>Activity Name</label>
            <input
              type="text"
              placeholder="e.g. Darshan Arati"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Time String</label>
            <input
              type="text"
              placeholder="e.g. 7:30 AM"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Period</label>
            <select
              className={inputClass}
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Icon</label>
            <select
              className={inputClass}
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
            >
              <option value="sunrise">Sunrise (Morning)</option>
              <option value="sun">Sun (Midday)</option>
              <option value="sunset">Sunset (Evening)</option>
              <option value="clock">Clock (Default)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Order Index</label>
            <input
              type="number"
              placeholder="e.g. 1"
              className={inputClass}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={save}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            {editingId ? "Save Activity Changes" : "Add Schedule Activity"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setName("");
                setTime("");
                setPeriod("Morning");
                setIconName("sunrise");
                setOrder(1);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* SCHEDULE TABLE LIST CARD */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Configured Daily Schedule ({sorted.length})</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Activity Name</th>
                <th className="py-3.5 px-4">Timing</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Icon</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-400">{item.order}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">{item.time}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{item.period}</td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-slate-500">{item.iconName}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
