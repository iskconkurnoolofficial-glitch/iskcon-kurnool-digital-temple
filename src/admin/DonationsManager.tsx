import { useMemo, useState } from "react";
import { useAdmin, DonationEntry } from "@/context/AdminContext";
import { IndianRupee, Search, Trash2, FileSpreadsheet, Inbox, CheckCircle2, Clock } from "lucide-react";

type FilterTab = "all" | "paid" | "initiated";

export default function DonationsManager() {
  const { donations, setDonations } = useAdmin();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (donations || []).filter((d) => {
      if (tab !== "all" && d.status !== tab) return false;
      if (!q) return true;
      return (
        d.donorName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.sevaTitle.toLowerCase().includes(q)
      );
    });
  }, [donations, tab, search]);

  const totalPaid = (donations || [])
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const handleDelete = (id: string) => {
    setDonations((donations || []).filter((d) => d.id !== id));
  };

  const handleExportCSV = () => {
    if (!donations?.length) { alert("No donations to export"); return; }
    const headers = ["Date", "Donor", "Email", "Phone", "PAN", "Purpose", "Seva", "Option", "Amount", "Status", "Payment Ref"];
    const rows = (donations || []).map((d: DonationEntry) => [
      new Date(d.date).toLocaleString(), d.donorName, d.email, d.phone, d.pan || "",
      (d.purpose || "").replace(/"/g, '""'), d.sevaTitle, d.optionLabel || "",
      d.amount, d.status, d.paymentRef || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-primary">Donation Submissions</h2>
          <p className="text-sm text-muted-foreground">Every seva form submitted on the website is stored here.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Total Submissions</p>
          <p className="text-2xl font-extrabold text-primary">{donations?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Completed Payments</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {(donations || []).filter((d) => d.status === "paid").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Amount Received</p>
          <p className="text-2xl font-extrabold text-accent flex items-center">
            <IndianRupee className="h-5 w-5" />{totalPaid.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {(["all", "paid", "initiated"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize cursor-pointer ${tab === t ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {t === "initiated" ? "Pending" : t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, email, phone or seva…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <Inbox className="h-10 w-10 mx-auto mb-3" />
          <p className="font-semibold">No donation submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-4 justify-between">
              <div className="space-y-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-primary">{d.donorName}</h4>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${d.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {d.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {d.status === "initiated" ? "Pending" : d.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{d.email} · {d.phone}{d.pan ? ` · PAN ${d.pan}` : ""}</p>
                <p className="text-xs text-slate-500">{d.sevaTitle}{d.optionLabel ? ` — ${d.optionLabel}` : ""}</p>
                {d.purpose && <p className="text-xs text-slate-400 italic">“{d.purpose}”</p>}
                <p className="text-[11px] text-slate-400">{new Date(d.date).toLocaleString()}{d.paymentRef ? ` · Ref ${d.paymentRef}` : ""}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-lg text-primary">₹{(d.amount || 0).toLocaleString("en-IN")}</span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
