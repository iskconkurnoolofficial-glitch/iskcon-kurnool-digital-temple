import { useState, useMemo } from "react";
import { 
  useAdmin, 
  PaymentRecord, 
  generateUpiUri 
} from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import { 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  ArrowUpRight, 
  CheckCircle2, 
  QrCode, 
  IndianRupee, 
  Search, 
  Trash2, 
  Check, 
  Copy, 
  Smartphone, 
  CreditCard,
  Sparkles,
  Clock,
  Filter,
  FileSpreadsheet,
  Image as ImageIcon,
  X,
  FileText,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

type TabMode = "overview" | "razorpay";

export default function PaymentPagesManager() {
  const { 
    paymentRecords, 
    setPaymentRecords, 
    deletePaymentRecord, 
    upiPayment, 
    setUpiPayment 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<TabMode>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Completed" | "Pending" | "Failed">("all");
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);

  const [receiptModalData, setReceiptModalData] = useState<ReceiptData | null>(null);
  const [editReceiptRecord, setEditReceiptRecord] = useState<PaymentRecord | null>(null);

  // Editable receipt fields state
  const [formReceiptNo, setFormReceiptNo] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDonorName, setFormDonorName] = useState("");
  const [formDonorPhone, setFormDonorPhone] = useState("");
  const [formDonorEmail, setFormDonorEmail] = useState("");
  const [formSevaTitle, setFormSevaTitle] = useState("");
  const [formAmount, setFormAmount] = useState(0);
  const [formPanNumber, setFormPanNumber] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("");

  const handleOpenReceiptEditor = (record?: PaymentRecord) => {
    if (record) {
      setEditReceiptRecord(record);
      const isAutoUpi = record.paymentId && record.paymentId.startsWith("UPI_");
      setFormReceiptNo(isAutoUpi ? "" : (record.paymentId || ""));
      setFormDate(record.date || new Date().toISOString());
      setFormDonorName(record.donorName || "");
      setFormDonorPhone(record.donorPhone || "");
      setFormDonorEmail(record.donorEmail || "");
      setFormSevaTitle(record.sevaOrPageTitle || record.category || "General Offering");
      setFormAmount(record.amount || 0);
      setFormPanNumber(record.panNumber || "");
      setFormNotes(record.notes || "");
      setFormPaymentMethod(record.paymentMethod || "Online");
    } else {
      setEditReceiptRecord({
        id: `custom_${Date.now()}`,
        paymentId: `REC-${Date.now()}`,
        date: new Date().toISOString(),
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        sevaOrPageTitle: "General Offering",
        category: "General Offering",
        amount: 1008,
        panNumber: "",
        notes: "",
        paymentMethod: "UPI QR Payment",
        status: "Completed",
        currency: "INR",
        read: true
      });
      setFormReceiptNo(`REC-${Date.now()}`);
      setFormDate(new Date().toISOString());
      setFormDonorName("");
      setFormDonorPhone("");
      setFormDonorEmail("");
      setFormSevaTitle("General Offering");
      setFormAmount(1008);
      setFormPanNumber("");
      setFormNotes("");
      setFormPaymentMethod("UPI QR Payment");
    }
  };

  // Quick stats
  const totalAmount = useMemo(() => {
    return (paymentRecords || [])
      .filter((r) => r.status === "Completed")
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [paymentRecords]);

  const upiCount = useMemo(() => {
    return (paymentRecords || []).filter((r) => (r.paymentMethod || "").toLowerCase().includes("upi")).length;
  }, [paymentRecords]);

  const rzpCount = useMemo(() => {
    return (paymentRecords || []).filter((r) => (r.paymentMethod || "").toLowerCase().includes("razorpay")).length;
  }, [paymentRecords]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (paymentRecords || []).filter((r) => {
      // Only show UPI/QR payments
      const isUpi = (r.paymentMethod || "").toLowerCase().includes("upi");
      if (!isUpi) return false;

      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (!q) return true;
      return (
        r.donorName.toLowerCase().includes(q) ||
        (r.donorEmail || "").toLowerCase().includes(q) ||
        (r.donorPhone || "").toLowerCase().includes(q) ||
        (r.paymentId || "").toLowerCase().includes(q) ||
        (r.sevaOrPageTitle || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q)
      );
    });
  }, [paymentRecords, search, statusFilter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleExportCSV = () => {
    if (!paymentRecords?.length) {
      toast.error("No payment records to export.");
      return;
    }
    const headers = [
      "Date",
      "Transaction / UTR ID",
      "Donor Name",
      "Donor Email",
      "Donor Phone",
      "PAN Number",
      "Seva / Campaign",
      "Amount",
      "Payment Mode",
      "Status",
      "Screenshot URL",
      "Devotee Notes",
    ];

    const rows = paymentRecords.map((r) => [
      new Date(r.date).toLocaleString(),
      r.paymentId,
      r.donorName,
      r.donorEmail || "",
      r.donorPhone || "",
      r.panNumber || "",
      r.sevaOrPageTitle || r.category || "",
      r.amount,
      r.paymentMethod || "Online",
      r.status,
      r.screenshotUrl || "",
      (r.notes || "").replace(/"/g, '""'),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ISKCON_Kurnool_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Payments exported to CSV successfully.");
  };

  const handleUpdateStatus = (id: string, newStatus: PaymentRecord["status"]) => {
    const updated = (paymentRecords || []).map((p) =>
      p.id === id ? { ...p, status: newStatus } : p
    );
    setPaymentRecords(updated);
    toast.success(`Payment status updated to ${newStatus === "Completed" ? "Verified ✓" : newStatus}.`);
  };

  const testUpiUri = generateUpiUri({
    upiId: (upiPayment.upiId || "").trim(),
    payeeName: upiPayment.payeeName || "ISKCON Kurnool",
    amount: 501,
    transactionNote: "Temple Seva Offering",
  });

  const previewQrUrl = upiPayment.useDynamicAmountQr !== false || !upiPayment.customQrImage
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(testUpiUri)}&margin=10`
    : upiPayment.customQrImage;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-6 font-sans animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 fill-amber-300" />
            <span>Dual Payment Architecture</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Donations &amp; Payment Gateway Center
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
            Accept donations through dynamic <strong>UPI QR Payment</strong> (amount auto-fill on Google Pay/PhonePe/Paytm) alongside secure <strong>Razorpay Online Gateway</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-primary hover:bg-amber-300 font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => setShowResetWarning(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Verified Collections</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 flex items-center">
              <IndianRupee className="h-6 w-6 stroke-[2.5]" />{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">UPI QR Payments</p>
            <p className="text-2xl sm:text-3xl font-black text-primary mt-1">
              {upiCount} <span className="text-xs font-semibold text-slate-500">records</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-primary flex items-center justify-center">
            <QrCode className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "overview" ? "bg-white text-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 QR Transactions ({paymentRecords?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("razorpay")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "razorpay" ? "bg-white text-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>Razorpay Dashboard</span>
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Status Filters */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 border text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter("Completed")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === "Completed" ? "bg-emerald-600 text-white shadow-2xs font-bold" : "text-emerald-700"
                }`}
              >
                Verified ({paymentRecords.filter((r) => r.status === "Completed").length})
              </button>
              <button
                onClick={() => setStatusFilter("Pending")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === "Pending" ? "bg-amber-500 text-white shadow-2xs font-bold" : "text-amber-700"
                }`}
              >
                Pending ({paymentRecords.filter((r) => r.status === "Pending").length})
              </button>
            </div>

            {/* Generate Custom Receipt Button */}
            <button
              onClick={() => handleOpenReceiptEditor()}
              className="md:ml-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Receipt</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ALL TRANSACTIONS DATA TABLE */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor name, phone, email, UTR reference, or seva..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-2xs"
            />
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 space-y-2">
              <QrCode className="h-10 w-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">No payment records found.</p>
              <p className="text-xs text-slate-400">All submissions made by devotees via UPI QR or Razorpay will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-4">Date / Time</th>
                      <th className="py-3.5 px-4">Donor &amp; Contact</th>
                      <th className="py-3.5 px-4">Seva / Purpose</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4">Payment Mode</th>
                      <th className="py-3.5 px-4">UTR / Ref No.</th>
                      <th className="py-3.5 px-4 text-center">Proof Screenshot</th>
                      <th className="py-3.5 px-4">Status &amp; Verification</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((r) => {
                      const isUpi = (r.paymentMethod || "").toLowerCase().includes("upi");
                      const isVerified = r.status === "Completed";
                      
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition group">
                          {/* 1. Date & Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                            {new Date(r.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="block text-[10px] text-slate-400">
                              {new Date(r.date).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>

                          {/* 2. Donor & Contact */}
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {r.donorName}
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                              {r.donorPhone && <div>{r.donorPhone}</div>}
                              {r.donorEmail && <div className="text-slate-400 truncate max-w-[180px]">{r.donorEmail}</div>}
                              {r.panNumber && (
                                <span className="inline-block px-1.5 py-0.2 bg-amber-50 border border-amber-200 text-amber-800 rounded font-mono text-[10px] font-bold">
                                  PAN: {r.panNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Seva / Purpose */}
                          <td className="py-3.5 px-4 min-w-[160px]">
                            <span className="font-bold text-slate-800 block text-xs">
                              {r.sevaOrPageTitle || r.category || "General Seva"}
                            </span>
                            {r.notes && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2" title={r.notes}>
                                “{r.notes}”
                              </p>
                            )}
                          </td>

                          {/* 4. Amount */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span className="text-base font-black text-primary font-display block">
                              ₹{(r.amount || 0).toLocaleString("en-IN")}
                            </span>
                            {r.platformFee ? (
                              <span className="text-[10px] text-slate-400 block">+ ₹{r.platformFee} fee</span>
                            ) : null}
                          </td>

                          {/* 5. Payment Mode */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                                isUpi
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {isUpi ? <QrCode className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                              {r.paymentMethod || "Online"}
                            </span>
                          </td>

                          {/* 6. UTR / Ref No. */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] select-all">
                                {r.paymentId}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(r.paymentId)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
                                title="Copy Ref ID"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>

                          {/* 7. Proof Screenshot */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {r.screenshotUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewScreenshotUrl(r.screenshotUrl!)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-extrabold transition cursor-pointer shadow-2xs"
                              >
                                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                                <span>View Proof</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No proof</span>
                            )}
                          </td>

                          {/* 8. Status & Interactive Verification Selector */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isUpi ? (
                                <>
                                  {/* Status Dropdown Selector */}
                                  <select
                                    value={r.status}
                                    onChange={(e) => handleUpdateStatus(r.id, e.target.value as PaymentRecord["status"])}
                                    className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition ${
                                      r.status === "Completed"
                                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                                        : r.status === "Pending"
                                        ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                                        : r.status === "Failed"
                                        ? "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200"
                                        : "bg-slate-100 text-slate-800 border-slate-300"
                                    }`}
                                  >
                                    <option value="Completed">✓ Verified</option>
                                    <option value="Pending">⏳ Pending</option>
                                    <option value="Failed">✕ Failed</option>
                                    <option value="Refunded">↩ Refunded</option>
                                  </select>

                                  {/* Quick 1-Click Verify Toggle */}
                                  {!isVerified && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(r.id, "Completed")}
                                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
                                      title="1-Click Verify Payment"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs font-extrabold px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl">
                                  ✓ Verified (Auto)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 9. Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenReceiptEditor(r)}
                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                title="Generate Receipt"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePaymentRecord(r.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}



      {/* TAB 3: RAZORPAY DASHBOARD CARD */}
      {activeTab === "razorpay" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden text-center relative p-8 sm:p-12 space-y-8">
          <div className="py-4 px-10 rounded-3xl bg-white border border-slate-200 shadow-md inline-flex items-center justify-center">
            <img 
              src="/razorpay-logo.png" 
              alt="Razorpay" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Razorpay Merchant Portal
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access your bank payouts, transaction disputes, settlement cycles, and webhook logs directly via the official Razorpay merchant dashboard.
            </p>
          </div>

          <div className="flex justify-center">
            <a
              href="https://dashboard.razorpay.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0C83FE] to-[#005bb8] hover:from-[#0070E0] hover:to-[#004a99] text-white font-extrabold text-base shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer group"
            >
              <span>Launch Razorpay Dashboard</span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      )}

      {/* PAYMENT SCREENSHOT PROOF LIGHTBOX MODAL */}
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
                <span className="font-bold text-sm">UPI Payment Proof Screenshot</span>
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
                alt="Payment Screenshot Proof"
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

      {/* GENERATE OFFICIAL RECEIPT / DEVOTEE DETAILS EDITOR MODAL */}
      {editReceiptRecord && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl relative my-auto">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-slate-950 rounded-t-3xl relative">
              <button
                type="button"
                onClick={() => setEditReceiptRecord(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-display text-lg sm:text-xl font-black flex items-center gap-2">
                <FileText className="h-5.5 w-5.5" />
                <span>Generate Official Receipt</span>
              </h3>
              <p className="text-xs font-semibold text-slate-900/80 mt-1">
                Edit donor details to generate high-resolution PNG receipt & 80G tax document.
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Devotee Details Warning if incomplete */}
              {(!formDonorName.trim() || !formDonorPhone.trim() || !formDonorEmail.trim()) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase">Devotee Details Incomplete</h4>
                    <p className="text-[11px] text-amber-800/90 leading-normal mt-0.5">
                      Some details are empty. You can enter them below now, or leave them empty as they are optional. No fields are mandatory.
                    </p>
                  </div>
                </div>
              )}

              {/* Editable Fields Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">DEVOTEE / DONOR NAME</label>
                  <input
                    type="text"
                    value={formDonorName}
                    onChange={(e) => setFormDonorName(e.target.value)}
                    placeholder="Devotee Name (e.g. Radhanath Das)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">WHATSAPP PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={formDonorPhone}
                    onChange={(e) => setFormDonorPhone(e.target.value)}
                    placeholder="+91 95053 XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={formDonorEmail}
                    onChange={(e) => setFormDonorEmail(e.target.value)}
                    placeholder="devotee@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">SEVA / PURPOSE OF DONATION</label>
                  <input
                    type="text"
                    value={formSevaTitle}
                    onChange={(e) => setFormSevaTitle(e.target.value)}
                    placeholder="Seva Name (e.g. Annadana Seva)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">DONATION AMOUNT (₹)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    placeholder="1008"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PAN CARD (FOR 80G TAX BENEFIT)</label>
                  <input
                    type="text"
                    value={formPanNumber}
                    onChange={(e) => setFormPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans uppercase font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">GOTRAM / SANKALPA NOTES</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Gotram or blessing notes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">RECEIPT / UTR TRANSACTION ID</label>
                  <input
                    type="text"
                    value={formReceiptNo}
                    onChange={(e) => setFormReceiptNo(e.target.value)}
                    placeholder="Ref ID"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PAYMENT MODE</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans cursor-pointer"
                  >
                    <option value="UPI QR Payment">UPI QR Payment</option>
                    <option value="Razorpay">Razorpay Gateway</option>
                    <option value="Direct Transfer">Bank Direct Transfer</option>
                    <option value="Cash Offering">Cash Offering</option>
                    <option value="Cheque / DD">Cheque / DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">RECEIPT DATE & TIME</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. 2026-08-28T19:07:08.000Z"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-sans font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-b-3xl border-t flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditReceiptRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptModalData({
                    receiptNo: formReceiptNo || "",
                    date: formDate || new Date().toISOString(),
                    donorName: formDonorName.trim() || "Devotee",
                    donorPhone: formDonorPhone.trim() || undefined,
                    donorEmail: formDonorEmail.trim() || undefined,
                    sevaTitle: formSevaTitle.trim() || "General Seva Offering",
                    amount: formAmount || 0,
                    panNumber: formPanNumber.trim() || undefined,
                    notes: formNotes.trim() || undefined,
                    paymentMethod: formPaymentMethod || "Online Payment",
                    category: "General Seva",
                  });
                  setEditReceiptRecord(null);
                  toast.success("Generating digital donation receipt preview...");
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC RECEIPT MODAL PREVIEW */}
      {receiptModalData && (
        <OfficialReceiptModal
          data={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {/* Devotional / Permanent DB Reset Warning Confirmation Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border text-center space-y-6 relative overflow-hidden text-slate-900">
            {/* Red Alert Header Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-rose-600" />
            
            <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-rose-600">
                CRITICAL WARNING
              </h3>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Irreversible Database Action
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
              You are about to permanently delete all <strong>{paymentRecords?.length || 0} QR transaction logs</strong> from the database. This action is irreversible.
            </p>

            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-800">
              <p className="font-bold text-amber-905 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Recommendation:</span>
              </p>
              <p className="leading-normal text-slate-700">
                Please make sure to click <strong>Export CSV</strong> to save a local backup copy of all donation history before resetting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetWarning(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer"
              >
                Cancel / Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentRecords([]);
                  setShowResetWarning(false);
                  toast.success("Database has been reset successfully!");
                }}
                className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                Yes, Reset QR Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

