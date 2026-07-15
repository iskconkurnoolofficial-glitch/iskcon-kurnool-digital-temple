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
    if (confirm("Are you sure you want to delete this schedule timing?")) {
      setTempleSchedule(items.filter((item) => item.id !== id));
    }
  };

  const inputClass = "w-full px-4 py-2 border rounded-lg text-sm bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          {editingId ? "Edit Timing" : "Add Temple Timing"}
        </h3>
        
        <div className="grid md:grid-cols-5 gap-4">
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

        <div className="mt-4 flex gap-2">
          <button
            onClick={save}
            className="px-5 py-2.5 bg-primary text-white hover:bg-primary/95 text-sm font-semibold rounded-lg shadow transition"
          >
            {editingId ? "Save Changes" : "Add Timing"}
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
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Temple Schedule Timings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Icon</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-500">{item.order}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-accent">{item.time}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.period}</td>
                  <td className="py-3.5 px-4 capitalize font-medium text-slate-500">{item.iconName}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-primary hover:underline text-xs font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-rose-600 hover:underline text-xs font-bold cursor-pointer"
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
