import { useState, useMemo } from "react";
import {
  useAdmin,
  uploadToCloudinary,
  HouseProgrammeData,
  HouseProgrammeActivity,
  HouseProgrammeGalleryItem,
  HouseProgrammeRequest,
} from "@/context/AdminContext";
import {
  Home,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  CheckCircle2,
  Clock3,
  XCircle,
  Navigation,
  Image as ImageIcon,
  Sparkles,
  Heart,
  FileText,
  Upload,
  Check,
  Eye,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type SubTab = "requests" | "settings" | "activities" | "gallery";

export default function HouseProgrammesManager() {
  const { houseProgrammes, setHouseProgrammes, updateHouseProgrammeRequestStatus, deleteHouseProgrammeRequest, markAllHouseProgrammeRequestsRead } = useAdmin();
  const [activeTab, setActiveTab] = useState<SubTab>("requests");

  const unreadCount = (houseProgrammes.requests || []).filter((r) => !r.read).length;

  const update = (patch: Partial<HouseProgrammeData>) => {
    setHouseProgrammes({ ...houseProgrammes, ...patch });
    toast.success("Changes saved successfully!");
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#6b21a8] to-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-secondary backdrop-blur-md mb-3">
              <Home className="h-3.5 w-3.5" /> Devotional Gatherings
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              House Programmes Management
            </h2>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Manage incoming home programme requests, customize devotional activities, edit hero banners, update gallery images, and view exact devotee locations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/house-programmes"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition border border-white/20 backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4" /> Live Page
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
            activeTab === "requests"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Requests & Bookings
          {unreadCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-secondary text-primary rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Hero & Content Settings
        </button>

        <button
          onClick={() => setActiveTab("activities")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
            activeTab === "activities"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          Activities ({houseProgrammes.activities?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
            activeTab === "gallery"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Photo Gallery ({houseProgrammes.gallery?.length || 0})
        </button>
      </div>

      {/* SubTab Content */}
      {activeTab === "requests" && (
        <RequestsTab
          requests={houseProgrammes.requests || []}
          onUpdateStatus={updateHouseProgrammeRequestStatus}
          onDelete={deleteHouseProgrammeRequest}
          onMarkAllRead={markAllHouseProgrammeRequestsRead}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab data={houseProgrammes} onUpdate={update} />
      )}

      {activeTab === "activities" && (
        <ActivitiesTab
          activities={houseProgrammes.activities || []}
          onUpdateActivities={(activities) => update({ activities })}
        />
      )}

      {activeTab === "gallery" && (
        <GalleryTab
          gallery={houseProgrammes.gallery || []}
          onUpdateGallery={(gallery) => update({ gallery })}
        />
      )}
    </div>
  );
}

// ==========================================
// 1. REQUESTS & BOOKINGS TAB
// ==========================================
function RequestsTab({
  requests,
  onUpdateStatus,
  onDelete,
  onMarkAllRead,
}: {
  requests: HouseProgrammeRequest[];
  onUpdateStatus: (id: string, status: HouseProgrammeRequest["status"]) => void;
  onDelete: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<HouseProgrammeRequest | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        search === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.phone.includes(search) ||
        r.locationArea.toLowerCase().includes(search.toLowerCase()) ||
        r.fullAddress.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      contacted: requests.filter((r) => r.status === "contacted").length,
      scheduled: requests.filter((r) => r.status === "scheduled").length,
      completed: requests.filter((r) => r.status === "completed").length,
      cancelled: requests.filter((r) => r.status === "cancelled").length,
    };
  }, [requests]);

  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast.error("No requests to export");
      return;
    }
    const headers = [
      "ID",
      "Devotee Name",
      "Phone",
      "Location / Area",
      "Preferred Date",
      "Preferred Time",
      "Participants",
      "Full Address",
      "Google Maps URL",
      "Latitude",
      "Longitude",
      "Special Message",
      "Status",
      "Requested Date",
    ];

    const rows = requests.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${r.locationArea.replace(/"/g, '""')}"`,
      `"${r.preferredDate}"`,
      `"${r.preferredTime || "Flexible"}"`,
      `"${r.participantsCount || "N/A"}"`,
      `"${r.fullAddress.replace(/"/g, '""')}"`,
      `"${r.googleMapsUrl || ""}"`,
      r.latitude || "",
      r.longitude || "",
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.status,
      new Date(r.createdAt).toLocaleString("en-IN"),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iskcon_kurnool_house_programmes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV successfully!");
  };

  const getStatusBadge = (status: HouseProgrammeRequest["status"]) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock3 className="h-3 w-3" /> Pending</span>;
      case "contacted":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Phone className="h-3 w-3" /> Contacted</span>;
      case "scheduled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Calendar className="h-3 w-3" /> Scheduled</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="h-3 w-3" /> Cancelled</span>;
    }
  };

  const getGoogleMapsLink = (req: HouseProgrammeRequest) => {
    if (req.googleMapsUrl && req.googleMapsUrl.startsWith("http")) {
      return req.googleMapsUrl;
    }
    if (req.latitude && req.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`;
    }
    const query = encodeURIComponent(`${req.fullAddress}, ${req.locationArea}, Kurnool`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getWhatsAppChatUrl = (req: HouseProgrammeRequest) => {
    const cleanPhone = req.phone.replace(/\D/g, "");
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hare Krishna ${req.name} ji 🙏,\nGreetings from ISKCON Kurnool!\n\nWe received your request for a House Programme on ${req.preferredDate} (${req.preferredTime || "Flexible time"}). We would be very delighted to conduct the devotional gathering at your home.\n\nCould you please let us know convenient timings to discuss the schedule? Haribol!`
    );
    return `https://wa.me/${phoneWithCode}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total Requests</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-800 uppercase">Pending</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-800 uppercase">Contacted</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.contacted}</div>
        </div>
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-800 uppercase">Scheduled</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{stats.scheduled}</div>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-800 uppercase">Completed</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.completed}</div>
        </div>
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-sm">
          <div className="text-xs font-semibold text-rose-800 uppercase">Cancelled</div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{stats.cancelled}</div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search devotee, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-xl bg-white font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-2 text-xs font-medium border rounded-xl hover:bg-muted transition text-foreground"
          >
            Mark all read
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-muted-foreground space-y-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto">
            <Home className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-foreground text-lg">No house programme requests found</h3>
          <p className="text-sm max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search filters"
              : "Requests submitted through the website will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition space-y-4 relative ${
                !req.read ? "border-l-4 border-l-secondary bg-secondary/[0.02]" : ""
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Devotee Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-display font-bold text-lg text-primary">{req.name}</span>
                    {getStatusBadge(req.status)}
                    {!req.read && (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-secondary text-primary rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary" /> {req.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-secondary" /> {req.locationArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Preferred: {req.preferredDate} ({req.preferredTime || "Flexible"})
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" /> ~{req.participantsCount || "10-20"} devotees
                    </span>
                    <span className="text-muted-foreground/70">
                      Requested: {new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Status selector & Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={req.status}
                    onChange={(e) => onUpdateStatus(req.id, e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg bg-surface hover:bg-muted outline-none transition"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <a
                    href={`tel:${req.phone}`}
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition"
                    title="Call devotee"
                  >
                    <Phone className="h-4 w-4" />
                  </a>

                  <a
                    href={getWhatsAppChatUrl(req)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 transition"
                    title="Message on WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>

                  <a
                    href={getGoogleMapsLink(req)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition border border-blue-200"
                    title="Open in Google Maps"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {req.latitude && req.longitude ? "Exact GPS Pin" : "Google Maps"}
                  </a>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                    title="View Full Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete request from ${req.name}?`)) {
                        onDelete(req.id);
                        toast.success("Request deleted");
                      }
                    }}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                    title="Delete Request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Address and message snippet */}
              <div className="bg-surface p-3 rounded-xl border text-xs text-foreground/80 space-y-1">
                <div>
                  <strong className="text-foreground">Full Address:</strong> {req.fullAddress}
                </div>
                {req.message && (
                  <div>
                    <strong className="text-foreground">Special Request / Message:</strong>{" "}
                    <span className="italic text-foreground/70 font-serif">"{req.message}"</span>
                  </div>
                )}
                {req.latitude && req.longitude && (
                  <div className="text-[11px] text-blue-600 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    Exact Coordinates: {req.latitude.toFixed(6)}, {req.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-secondary font-bold">Request Details</span>
                <h3 className="font-display text-2xl font-bold text-primary">{selectedRequest.name}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Phone Number</div>
                  <div className="font-bold text-foreground mt-1">{selectedRequest.phone}</div>
                </div>
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Preferred Date</div>
                  <div className="font-bold text-foreground mt-1">{selectedRequest.preferredDate}</div>
                </div>
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Preferred Time</div>
                  <div className="font-bold text-foreground mt-1">{selectedRequest.preferredTime || "Flexible"}</div>
                </div>
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Participants</div>
                  <div className="font-bold text-foreground mt-1">~{selectedRequest.participantsCount || "10-20"} devotees</div>
                </div>
                <div className="bg-surface p-3 rounded-xl border">
                  <div className="text-xs text-muted-foreground font-medium">Location / Area</div>
                  <div className="font-bold text-foreground mt-1">{selectedRequest.locationArea}</div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Full Address</div>
                <div className="font-medium text-foreground leading-relaxed">{selectedRequest.fullAddress}</div>
              </div>

              {selectedRequest.message && (
                <div className="bg-surface p-4 rounded-xl border space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Special Requirements / Message</div>
                  <div className="text-foreground/80 italic font-serif">"{selectedRequest.message}"</div>
                </div>
              )}

              {/* Exact Google Location Box */}
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Exact Google Map Location
                  </div>
                  {selectedRequest.latitude && selectedRequest.longitude && (
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-800">
                  {selectedRequest.latitude
                    ? "Devotee shared live GPS coordinates when submitting the request."
                    : "Opening Google Maps using address and area query."}
                </p>
                <a
                  href={getGoogleMapsLink(selectedRequest)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <a
                href={getWhatsAppChatUrl(selectedRequest)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <MessageCircle className="h-4 w-4" /> Message Devotee on WhatsApp
              </a>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 rounded-xl border bg-white hover:bg-muted text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. SETTINGS TAB
// ==========================================
function SettingsTab({
  data,
  onUpdate,
}: {
  data: HouseProgrammeData;
  onUpdate: (patch: Partial<HouseProgrammeData>) => void;
}) {
  const [draft, setDraft] = useState<HouseProgrammeData>({ ...data });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [uploadingAboutRight, setUploadingAboutRight] = useState(false);
  const [uploadingQuote, setUploadingQuote] = useState(false);
  const [uploadingKartika, setUploadingKartika] = useState(false);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, heroImage: url }));
      toast.success("Hero image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleAboutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAbout(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, aboutImage: url }));
      toast.success("Left About image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAbout(false);
    }
  };

  const handleAboutRightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutRight(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, aboutImageRight: url }));
      toast.success("Right About image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAboutRight(false);
    }
  };

  const handleQuoteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQuote(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, quoteImage: url }));
      toast.success("Quote card image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingQuote(false);
    }
  };

  const handleKartikaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKartika(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, kartikaImage: url }));
      toast.success("Kartika Special image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingKartika(false);
    }
  };

  const save = () => {
    onUpdate(draft);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero Section Card */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" /> Hero Banner & Typography
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Hero Badge Text</label>
            <input
              type="text"
              value={draft.badgeText}
              onChange={(e) => setDraft({ ...draft, badgeText: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Devotional Home Gatherings"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Hero Title</label>
            <input
              type="text"
              value={draft.heroTitle}
              onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. House Programmes"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Hero Subtitle / Description</label>
          <textarea
            rows={2}
            value={draft.heroSubtitle}
            onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Subheading explaining the divine gathering..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Hero Background Image</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="h-32 w-full sm:w-56 rounded-xl border bg-muted overflow-hidden relative group">
              {draft.heroImage ? (
                <img src={draft.heroImage} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
              )}
            </div>
            <div className="space-y-2 flex-1 w-full">
              <input
                type="text"
                value={draft.heroImage}
                onChange={(e) => setDraft({ ...draft, heroImage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                placeholder="https://images.unsplash.com/..."
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                {uploadingHero ? "Uploading..." : "Upload New Hero Image"}
                <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* About Section Card */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Heart className="h-5 w-5 text-secondary" /> "What is a House Programme?" Section
        </h3>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Section Title</label>
          <input
            type="text"
            value={draft.aboutTitle}
            onChange={(e) => setDraft({ ...draft, aboutTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. What is a House Programme?"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Section Description (Supports double line breaks)</label>
          <textarea
            rows={4}
            value={draft.aboutDesc}
            onChange={(e) => setDraft({ ...draft, aboutDesc: e.target.value })}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed"
            placeholder="Explain the devotional importance and warmth of home gatherings..."
          />
        </div>

        {/* Left and Right About Section Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Left Side Image (Kirtan / Gathering)</label>
            <div className="space-y-3">
              <div className="h-28 w-full rounded-xl border bg-muted overflow-hidden relative group">
                {draft.aboutImage ? (
                  <img src={draft.aboutImage} alt="Left About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
                )}
              </div>
              <input
                type="text"
                value={draft.aboutImage}
                onChange={(e) => setDraft({ ...draft, aboutImage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                placeholder="https://..."
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                {uploadingAbout ? "Uploading..." : "Upload Left Image"}
                <input type="file" accept="image/*" onChange={handleAboutUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Right Side Image (Puja / Prasadam)</label>
            <div className="space-y-3">
              <div className="h-28 w-full rounded-xl border bg-muted overflow-hidden relative group">
                {draft.aboutImageRight ? (
                  <img src={draft.aboutImageRight} alt="Right About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
                )}
              </div>
              <input
                type="text"
                value={draft.aboutImageRight || ""}
                onChange={(e) => setDraft({ ...draft, aboutImageRight: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                placeholder="https://..."
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                {uploadingAboutRight ? "Uploading..." : "Upload Right Image"}
                <input type="file" accept="image/*" onChange={handleAboutRightUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Kartika Damodara Month Settings Card */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary animate-pulse" /> Kartika Month Special Settings
        </h3>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Kartika Special House Programme Image (Left Side)</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="h-28 w-full sm:w-48 rounded-xl border bg-muted overflow-hidden relative group">
              {draft.kartikaImage ? (
                <img src={draft.kartikaImage} alt="Kartika Special" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
              )}
            </div>
            <div className="space-y-2 flex-1 w-full">
              <input
                type="text"
                value={draft.kartikaImage || ""}
                onChange={(e) => setDraft({ ...draft, kartikaImage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                placeholder="https://..."
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                {uploadingKartika ? "Uploading..." : "Upload Kartika Image"}
                <input type="file" accept="image/*" onChange={handleKartikaUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Closing Quote & Contact info */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Phone className="h-5 w-5 text-secondary" /> Closing Quote & Contact Information
        </h3>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Closing Spiritual Quote</label>
          <textarea
            rows={2}
            value={draft.closingQuote}
            onChange={(e) => setDraft({ ...draft, closingQuote: e.target.value })}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm italic font-serif focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="“Bring the joy of Krishna consciousness into your home...”"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Closing Quote Card Image (Right Side Banner)</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="h-28 w-full sm:w-48 rounded-xl border bg-muted overflow-hidden relative group">
              {draft.quoteImage ? (
                <img src={draft.quoteImage} alt="Quote Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
              )}
            </div>
            <div className="space-y-2 flex-1 w-full">
              <input
                type="text"
                value={draft.quoteImage || ""}
                onChange={(e) => setDraft({ ...draft, quoteImage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                placeholder="https://..."
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                {uploadingQuote ? "Uploading..." : "Upload Quote Card Image"}
                <input type="file" accept="image/*" onChange={handleQuoteUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Temple Contact Phone</label>
            <input
              type="text"
              value={draft.contactPhone}
              onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+91 95053 77520"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">WhatsApp Number for House Programmes</label>
            <input
              type="text"
              value={draft.whatsappNumber}
              onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+91 95053 77520"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition hover:scale-105 text-sm"
        >
          <Check className="h-4 w-4" /> Save Content Settings
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 3. ACTIVITIES TAB
// ==========================================
function ActivitiesTab({
  activities,
  onUpdateActivities,
}: {
  activities: HouseProgrammeActivity[];
  onUpdateActivities: (activities: HouseProgrammeActivity[]) => void;
}) {
  const [editingActivity, setEditingActivity] = useState<HouseProgrammeActivity | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startAdd = () => {
    setIsNew(true);
    setEditingActivity({
      id: "act_" + Date.now(),
      title: "",
      desc: "",
      icon: "🌸",
      order: activities.length + 1,
      image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80",
    });
  };

  const handleSave = () => {
    if (!editingActivity || !editingActivity.title.trim()) {
      toast.error("Please enter an activity title");
      return;
    }
    if (isNew) {
      onUpdateActivities([...activities, editingActivity]);
      toast.success("Activity added!");
    } else {
      onUpdateActivities(
        activities.map((a) => (a.id === editingActivity.id ? editingActivity : a))
      );
      toast.success("Activity updated!");
    }
    setEditingActivity(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      onUpdateActivities(activities.filter((a) => a.id !== id));
      toast.success("Activity deleted");
    }
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activities.length) return;
    const copy = [...activities];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    onUpdateActivities(copy);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingActivity) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditingActivity({ ...editingActivity, image: url });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-primary">Activities Included</h3>
          <p className="text-sm text-muted-foreground">
            Devotional activities presented on the house programme page. Devotees can request any combination.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act, index) => (
          <div
            key={act.id}
            className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-2xl grid place-items-center shrink-0">
                {act.icon || "🌸"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-base text-primary truncate">{act.title}</h4>
                  <span className="text-[11px] font-mono text-muted-foreground">#{index + 1}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{act.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === activities.length - 1}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditingActivity({ ...act });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface hover:bg-muted text-xs font-semibold transition border"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(act.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Activity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-xl font-bold text-primary">
                {isNew ? "Add Activity" : "Edit Activity"}
              </h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-foreground mb-1">Icon/Emoji</label>
                  <input
                    type="text"
                    value={editingActivity.icon}
                    onChange={(e) => setEditingActivity({ ...editingActivity, icon: e.target.value })}
                    className="w-full px-3 py-2 text-center text-xl border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="🎶"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-foreground mb-1">Activity Title</label>
                  <input
                    type="text"
                    value={editingActivity.title}
                    onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Hare Krishna Kirtan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingActivity.desc}
                  onChange={(e) => setEditingActivity({ ...editingActivity, desc: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Describe the spiritual activity and benefit for families..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Card Background Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editingActivity.image || ""}
                    onChange={(e) => setEditingActivity({ ...editingActivity, image: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition shrink-0">
                    {uploading ? "..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingActivity(null)}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-muted text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition shadow-md"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. GALLERY TAB
// ==========================================
function GalleryTab({
  gallery,
  onUpdateGallery,
}: {
  gallery: HouseProgrammeGalleryItem[];
  onUpdateGallery: (gallery: HouseProgrammeGalleryItem[]) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewUrl(url);
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = () => {
    if (!newUrl.trim()) {
      toast.error("Please provide an image URL or upload a file");
      return;
    }
    const item: HouseProgrammeGalleryItem = {
      id: "gal_" + Date.now(),
      url: newUrl.trim(),
      title: newTitle.trim() || "House Programme Devotion",
      caption: newCaption.trim() || undefined,
    };
    onUpdateGallery([...gallery, item]);
    setNewUrl("");
    setNewTitle("");
    setNewCaption("");
    toast.success("Photo added to gallery!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this gallery image?")) {
      onUpdateGallery(gallery.filter((g) => g.id !== id));
      toast.success("Photo removed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Photo Form */}
      <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-4 max-w-2xl">
        <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add House Programme Photo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Photo Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Joyful Home Kirtan"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Caption (Optional)</label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Chanting together with family"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Image URL or Upload</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
              placeholder="https://images.unsplash.com/..."
            />
            <label className="px-3 py-2 rounded-xl bg-surface border hover:bg-muted text-xs font-semibold cursor-pointer transition shrink-0">
              {uploading ? "Uploading..." : "Upload File"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        <button
          onClick={handleAddPhoto}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add to Gallery
        </button>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition group relative flex flex-col"
          >
            <div className="aspect-[4/3] w-full bg-muted overflow-hidden relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
                title="Delete Photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-3">
              <div className="font-semibold text-xs text-foreground truncate">{photo.title}</div>
              {photo.caption && (
                <div className="text-[11px] text-muted-foreground truncate">{photo.caption}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
