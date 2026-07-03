import { useState } from "react";
import { useAdmin, ContactEntry } from "@/context/AdminContext";
import { MailOpen, Mail, Trash2, Search, Calendar, Phone, Inbox, ShieldCheck, AlertTriangle, FileSpreadsheet, RotateCcw } from "lucide-react";

type FilterTab = "all" | "unread";

export default function ContactsManager() {
  const { contacts, setContacts } = useAdmin();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showResetWarning, setShowResetWarning] = useState(false);

  const handleToggleRead = (id: string) => {
    const updated = (contacts || []).map((c) =>
      c.id === id ? { ...c, read: !c.read } : c
    );
    setContacts(updated);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    const updated = (contacts || []).filter((c) => c.id !== id);
    setContacts(updated);
  };

  const handleMarkAllRead = () => {
    if ((contacts || []).length === 0) return;
    const updated = (contacts || []).map((c) => ({ ...c, read: true }));
    setContacts(updated);
  };

  const handleExportCSV = () => {
    if (!contacts || contacts.length === 0) {
      alert("No contacts to export");
      return;
    }
    
    // CSV Header row
    const headers = ["ID", "Name", "Email", "Phone", "Message", "Submission Date", "Status"];
    
    // Format rows
    const rows = contacts.map((c) => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.message.replace(/"/g, '""'), // escape quotes in messages
      new Date(c.date).toLocaleString(),
      c.read ? "Read" : "Unread"
    ]);
    
    // Combine to string
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))
    ].join("\n");
    
    // Download Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `iskcon_kurnool_contact_messages_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter messages based on search & tab
  const list = (contacts || [])
    .filter((c) => {
      if (tab === "unread" && c.read) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first

  const unreadCount = (contacts || []).filter((c) => !c.read).length;

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-primary">Contact Enquiries &amp; Messages</h3>
          <p className="text-sm text-muted-foreground mt-1">
            View, filter and manage query submissions sent from the website contact page.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-secondary/15 text-primary rounded-xl border border-secondary/35 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider font-semibold block text-slate-500">Unread</span>
            <span className="text-2xl font-bold text-accent">{unreadCount}</span>
          </div>
          <div className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl border text-center shrink-0">
            <span className="text-xs uppercase tracking-wider font-semibold block text-slate-500">Total</span>
            <span className="text-2xl font-bold">{(contacts || []).length}</span>
          </div>
        </div>
      </div>

      {/* Warning note for 25-day auto reset */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
        <div className="space-y-1">
          <span className="font-semibold block text-amber-900">Automated 25-Day Reset Policy</span>
          <p className="text-amber-800/90 leading-relaxed font-medium">
            Contact queries are automatically pruned and deleted after <strong className="font-bold">25 days</strong>. Kindly export them to an Excel CSV sheet below if you wish to keep long-term backup archives.
          </p>
        </div>
      </div>

      {/* Controls: Search, Export & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {(["all", "unread"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-surface text-foreground hover:bg-muted border border-border/80"
              }`}
            >
              {t === "all" ? "All Messages" : `Unread (${unreadCount})`}
            </button>
          ))}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent hover:text-white transition flex items-center gap-1.5 ml-auto md:ml-0"
            >
              <ShieldCheck className="h-4 w-4" /> Mark All as Read
            </button>
          )}
          {(contacts || []).length > 0 && (
            <button
              onClick={() => setShowResetWarning(true)}
              className="px-4 py-2 text-xs font-semibold text-destructive border border-destructive/20 rounded-lg hover:bg-destructive hover:text-white transition flex items-center gap-1.5 ml-auto md:ml-0 cursor-pointer animate-fade-in"
            >
              <RotateCcw className="h-4 w-4" /> Reset All
            </button>
          )}
        </div>

        {/* Right Controls: Export & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <button
            onClick={handleExportCSV}
            disabled={(contacts || []).length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export to Excel
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              placeholder="Search queries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Messages List Container */}
      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-2xl flex flex-col items-center justify-center p-6">
            <Inbox className="h-12 w-12 text-slate-300 mb-3" />
            <h4 className="font-semibold text-primary text-lg">No Messages Found</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search
                ? "No entries match your search filter criteria. Try typing something else."
                : tab === "unread"
                ? "Excellent! You have read all submissions."
                : "No enquiries have been submitted through the Contact Form yet."}
            </p>
          </div>
        ) : (
          list.map((c) => (
            <div
              key={c.id}
              className={`p-6 rounded-2xl border transition duration-300 bg-white ${
                c.read
                  ? "border-border opacity-90 shadow-sm"
                  : "border-primary/45 shadow-[0_4px_16px_rgba(91,44,155,0.04)]"
              }`}
            >
              {/* Header Information */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    {!c.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse shrink-0" title="Unread Message" />
                    )}
                    <h4 className="font-display font-bold text-lg text-primary">{c.name}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <a href={`mailto:${c.email}`} className="hover:text-accent font-medium">{c.email}</a>
                    <span className="hidden md:inline text-slate-300">|</span>
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-accent">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 border px-3 py-1.5 rounded-lg select-none">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(c.date).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80 mb-4">
                <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans">
                  {c.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => handleToggleRead(c.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    c.read
                      ? "text-primary hover:bg-primary/5 border-primary/20"
                      : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {c.read ? (
                    <>
                      <Mail className="h-3.5 w-3.5" /> Mark as Unread
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5" /> Mark as Read
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/15 transition"
                  aria-label="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reset all messages custom warning modal */}
      {showResetWarning && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-destructive/20 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-14 w-14 bg-red-50 text-destructive rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-primary">Permanently Delete All Messages?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This action is irreversible. All your stored enquiry submissions and messages will be permanently deleted from the database.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetWarning(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContacts([]);
                  setShowResetWarning(false);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-600/10 hover:shadow-red-700/25 transition cursor-pointer"
              >
                Proceed &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
