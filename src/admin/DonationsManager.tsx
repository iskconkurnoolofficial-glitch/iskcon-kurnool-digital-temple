import { useMemo, useState } from "react";
import { useAdmin, DonationEntry } from "@/context/AdminContext";
import { 
  IndianRupee, 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  Inbox, 
  CheckCircle2, 
  Clock, 
  Check, 
  QrCode, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  Copy
} from "lucide-react";
import { toast } from "sonner";

type FilterTab = "all" | "paid" | "initiated" | "failed";

export default function DonationsManager() {
  const { donations, setDonations, updateDonationStatus } = useAdmin();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (donations || []).filter((d) => {
      if (tab !== "all" && d.status !== tab) return false;
      if (!q) return true;
      return (
        d.donorName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.sevaTitle.toLowerCase().includes(q) ||
        (d.paymentRef || "").toLowerCase().includes(q)
      );
    });
  }, [donations, tab, search]);

  const totalPaid = (donations || [])
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    setDonations((donations || []).filter((d) => d.id !== id));
    toast.success("Donation record deleted.");
  };

  const handleExportCSV = () => {
    if (!donations?.length) { 
      toast.error("No donations to export"); 
      return; 
    }
    const headers = ["Date", "Donor", "Email", "Phone", "PAN", "Purpose", "Seva", "Option", "Amount", "Status", "Payment Ref", "Screenshot"];
    const rows = (donations || []).map((d: DonationEntry) => [
      new Date(d.date).toLocaleString(), 
      d.donorName, 
      d.email, 
      d.phone, 
      d.pan || "",
      (d.purpose || "").replace(/"/g, '""'), 
      d.sevaTitle, 
      d.optionLabel || "",
      d.amount, 
      d.status, 
      d.paymentRef || "", 
      d.screenshotUrl || ""
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ISKCON_Kurnool_Donations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Donations exported to CSV.");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Donation Submissions &amp; Verification</h2>
          <p className="text-xs text-slate-500">Track devotee seva offerings, verify payment proofs, and update receipt status.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-extrabold text-primary">{(donations || []).length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Verified / Paid Offerings</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {(donations || []).filter((d) => d.status === "paid").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Verified Amount</p>
          <p className="text-2xl font-extrabold text-accent flex items-center">
            <IndianRupee className="h-5 w-5 stroke-[2.5]" />{totalPaid.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-100 p-0.5 text-xs font-bold">
          {(["all", "paid", "initiated", "failed"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                tab === t 
                  ? t === "paid" 
                    ? "bg-emerald-600 text-white shadow-2xs" 
                    : t === "initiated" 
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "initiated" ? "Pending" : t === "paid" ? "Verified" : t.toUpperCase()} (
              {t === "all" ? (donations || []).length : (donations || []).filter((d) => d.status === t).length}
              )
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, email, phone, UTR or seva…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-primary shadow-2xs"
          />
        </div>
      </div>

      {/* Submissions Data Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 text-slate-400 bg-white">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-600">No donation submissions match your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Donor &amp; Contact</th>
                  <th className="py-3.5 px-4">Seva Offering</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Payment Ref / UTR</th>
                  <th className="py-3.5 px-4 text-center">Screenshot Proof</th>
                  <th className="py-3.5 px-4">Status &amp; Verification</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => {
                  const isVerified = d.status === "paid";
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition group">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                        {new Date(d.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(d.date).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Donor */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {d.donorName}
                        </div>
                        <div className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                          {d.phone && <div>{d.phone}</div>}
                          {d.email && <div className="text-slate-400 truncate max-w-[180px]">{d.email}</div>}
                          {d.pan && (
                            <span className="inline-block px-1.5 py-0.2 bg-amber-50 border border-amber-200 text-amber-800 rounded font-mono text-[10px] font-bold">
                              PAN: {d.pan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seva */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <span className="font-bold text-slate-800 block text-xs">
                          {d.sevaTitle}{d.optionLabel ? ` (${d.optionLabel})` : ""}
                        </span>
                        {d.purpose && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2" title={d.purpose}>
                            “{d.purpose}”
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-base font-black text-primary font-display block">
                          ₹{(d.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Ref */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {d.paymentRef ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] select-all">
                              {d.paymentRef}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(d.paymentRef!)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
                              title="Copy Ref ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Proof */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {d.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshotUrl(d.screenshotUrl!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-extrabold transition cursor-pointer shadow-2xs"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No proof</span>
                        )}
                      </td>

                      {/* Status & Verification Selector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={d.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as "paid" | "initiated" | "failed";
                              await updateDonationStatus(d.id, newStatus, d.paymentRef || `REF_${Date.now()}`);
                              toast.success(`Donation status updated to ${newStatus === "paid" ? "Verified ✓" : newStatus}`);
                            }}
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition ${
                              d.status === "paid"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                                : d.status === "initiated"
                                ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                                : "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200"
                            }`}
                          >
                            <option value="paid">✓ Verified</option>
                            <option value="initiated">⏳ Pending</option>
                            <option value="failed">✕ Failed</option>
                          </select>

                          {!isVerified && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateDonationStatus(d.id, "paid", d.paymentRef || `MANUAL_${Date.now()}`);
                                toast.success(`Donation for ${d.donorName} marked as Verified ✓`);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
                              title="1-Click Verify"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCREENSHOT PROOF LIGHTBOX MODAL */}
      {previewScreenshotUrl && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden border border-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm">Donation Payment Screenshot Proof</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewScreenshotUrl}
                alt="Donation Screenshot Proof"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 border-t flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Verify UTR and transaction timestamp against bank statement.</span>
              <a
                href={previewScreenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold flex items-center gap-1 hover:bg-primary/90 transition"
              >
                <span>Open Full Size</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
