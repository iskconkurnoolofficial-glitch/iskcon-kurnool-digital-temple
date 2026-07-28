import { useState, useEffect } from "react";
import { useAdmin, ContactEntry } from "@/context/AdminContext";
import { 
  MailOpen, 
  Mail, 
  Trash2, 
  Search, 
  Calendar, 
  Phone, 
  Inbox, 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  RotateCcw,
  MessageCircle,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

type FilterTab = "all" | "unread";

export default function ContactsManager() {
  const { contacts, setContacts } = useAdmin();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [mobileViewDetail, setMobileViewDetail] = useState(false);

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

  // Keep selected ID valid
  useEffect(() => {
    if (list.length > 0) {
      if (!selectedId || !list.some((c) => c.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [list, selectedId]);

  const selectedContact = (contacts || []).find((c) => c.id === selectedId);
  const unreadCount = (contacts || []).filter((c) => !c.read).length;

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
    if (selectedId === id) {
      const remaining = updated.filter((c) => c.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      setMobileViewDetail(false);
    }
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
    
    const headers = ["ID", "Name", "Email", "Phone", "Message", "Submission Date", "Status"];
    const rows = contacts.map((c) => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.message.replace(/"/g, '""'),
      new Date(c.date).toLocaleString(),
      c.read ? "Read" : "Unread"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))
    ].join("\n");
    
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

  // Helper for WhatsApp link
  const getWhatsAppUrl = (phoneStr: string, nameStr: string) => {
    const cleaned = phoneStr.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Hare Krishna ${nameStr}! Thank you for contacting ISKCON Kurnool. `);
    if (cleaned.length === 10) return `https://wa.me/91${cleaned}?text=${text}`;
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* 1. HEADER BANNER & STATS */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <Mail className="h-3.5 w-3.5" />
              <span>Inquiries &amp; Public Feedback</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Contact Messages</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              View and reply to messages, prayer requests, and queries sent from the website contact page.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Unread</span>
              <span className="text-xl font-extrabold text-amber-300">{unreadCount}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Total Messages</span>
              <span className="text-xl font-extrabold text-white">{(contacts || []).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATED 25-DAY RETENTION ALERT */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <p className="font-medium">
            <strong className="font-bold">Automated 25-Day Retention:</strong> Messages are automatically backed up and cleared after 25 days.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={(contacts || []).length === 0}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
        </button>
      </div>

      {/* 3. TOOLBAR CONTROLS */}
      <div className="bg-white rounded-2xl p-3.5 border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(["all", "unread"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMobileViewDetail(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tab === t
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? `All (${(contacts || []).length})` : `Unread (${unreadCount})`}
            </button>
          ))}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mark All Read
            </button>
          )}

          {(contacts || []).length > 0 && (
            <button
              onClick={() => setShowResetWarning(true)}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 rounded-xl transition flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            className="w-full pl-9 pr-7 py-1.5 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            placeholder="Search by name, email, phone, text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4. MASTER-DETAIL 2-COLUMN INBOX LAYOUT */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[500px] grid grid-cols-1 md:grid-cols-12">
        {/* LEFT COLUMN: MESSAGES LIST */}
        <div className={`md:col-span-5 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${
          mobileViewDetail ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-3 border-b border-slate-200/80 bg-slate-100/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Inquiry Submissions ({list.length})</span>
            {search && <span className="text-primary">Filtered</span>}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[550px] divide-y divide-slate-100">
            {list.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-600">No Messages Found</p>
                <p className="text-[11px] text-slate-400">
                  {search ? "Try searching for a different keyword." : "No inquiries submitted yet."}
                </p>
              </div>
            ) : (
              list.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileViewDetail(true);
                      if (!item.read) handleToggleRead(item.id);
                    }}
                    className={`p-3.5 transition cursor-pointer relative ${
                      isSelected
                        ? "bg-white border-l-4 border-primary shadow-xs"
                        : item.read
                        ? "hover:bg-white/80 text-slate-600"
                        : "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-amber-400 font-semibold"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 truncate">
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-pulse" title="Unread" />
                        )}
                        <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mb-1.5 font-normal">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="truncate">{item.email}</span>
                      <span>·</span>
                      <span className="shrink-0">{item.phone}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED MESSAGE DETAIL PANEL */}
        <div className={`md:col-span-7 flex flex-col bg-white ${
          !mobileViewDetail ? "hidden md:flex" : "flex"
        }`}>
          {selectedContact ? (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileViewDetail(false)}
                className="md:hidden inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-2 self-start bg-slate-100 px-3 py-1.5 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Inbox
              </button>

              {/* Sender Info Header Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-hero text-white font-display font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                    {selectedContact.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-primary leading-tight">
                      {selectedContact.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <a href={`mailto:${selectedContact.email}`} className="hover:text-primary font-medium underline decoration-slate-300">
                        {selectedContact.email}
                      </a>
                      <span>·</span>
                      <a href={`tel:${selectedContact.phone}`} className="flex items-center gap-1 hover:text-primary font-medium">
                        <Phone className="h-3 w-3" /> {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border shrink-0">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {new Date(selectedContact.date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              {/* Quick Reply Actions Bar */}
              <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                {/* WhatsApp Quick Chat */}
                <a
                  href={getWhatsAppUrl(selectedContact.phone, selectedContact.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" /> Reply via WhatsApp
                </a>

                {/* Email Reply */}
                <a
                  href={`mailto:${selectedContact.email}?subject=RE: Inquiry to ISKCON Kurnool&body=Hare Krishna ${encodeURIComponent(selectedContact.name)}!%0D%0A%0D%0AIn response to your query:%0D%0A"${encodeURIComponent(selectedContact.message)}"`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Mail className="h-4 w-4" /> Reply via Email
                </a>

                {/* Toggle Read */}
                <button
                  onClick={() => handleToggleRead(selectedContact.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer ml-auto"
                >
                  {selectedContact.read ? (
                    <>
                      <Mail className="h-3.5 w-3.5 text-slate-500" /> Mark Unread
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5 text-emerald-600" /> Mark Read
                    </>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>

              {/* Message Content Container */}
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Message Content / Query
                </label>
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans shadow-inner max-h-[280px] sm:max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                  {selectedContact.message}
                </div>
              </div>

              {/* Bottom Stamp */}
              <div className="pt-4 border-t flex items-center justify-between text-[11px] text-slate-400">
                <span>Message ID: {selectedContact.id}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Website Submission
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Inbox className="h-12 w-12 text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">Select a Message to View</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Click on any message from the left inbox list to view full details and reply via WhatsApp or Email.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RESET ALL CONFIRMATION MODAL */}
      {showResetWarning && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-destructive/20 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-14 w-14 bg-red-50 text-destructive rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-primary">Permanently Delete All Messages?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This action is irreversible. All stored inquiry submissions will be permanently erased.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetWarning(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContacts([]);
                  setShowResetWarning(false);
                  setSelectedId(null);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-600/10 hover:shadow-red-700/25 transition cursor-pointer"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
