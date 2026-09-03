import { useState, useMemo, useEffect, useRef } from "react";
import {
  useAdmin,
  uploadToCloudinary,
  YatraEvent,
  YatraTimelineDay,
  YatraPlace,
  YatraRegistration,
  YatraGalleryItem,
  YatraWhatToBringItem,
  YatraGuideline,
  YatraFaq,
  YatraCoordinator,
  YatraVehicle,
  YatraTravelStep,
  YatraPickupPoint,
  YatraTravelConfig,
  defaultYouthYatra2026,
} from "@/context/AdminContext";
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Edit2,
  CheckCircle2,
  Clock3,
  XCircle,
  Image as ImageIcon,
  Sparkles,
  Heart,
  FileText,
  Upload,
  Check,
  Eye,
  X,
  AlertCircle,
  CreditCard,
  QrCode,
  Layers,
  Copy,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Send,
  HelpCircle,
  Save,
  RefreshCw,
  Bus,
  Train,
  Navigation,
  Camera,
  CameraOff,
  Video,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Web Audio API Synth Sounds (Zero external asset download, 0ms latency)
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    // High melodic chime: Note 1 (587 Hz / D5) -> Note 2 (880 Hz / A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.45);

    if (navigator.vibrate) navigator.vibrate([60, 40, 90]);
  } catch {}
}

function playErrorBuzzer() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    // Low alert double buzzer (160 Hz sawtooth)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
  } catch {}
}

type SubTab = "registrations" | "checkin" | "travel" | "eventDetails" | "timeline" | "places" | "payments" | "gallery" | "content";

export default function YouthYatraManager() {
  const {
    youthYatra,
    setYouthYatra,
    updateYatraRegistrationStatus,
    deleteYatraRegistration,
    markAllYatraRegistrationsRead,
    saveYatraEvent,
    deleteYatraEvent,
    setActiveYatraEvent,
    checkInYatraParticipant,
    undoCheckInYatraParticipant,
    updateYatraSeatAndBatch,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<SubTab>("registrations");

  // Check-in Desk State
  const [checkInScanInput, setCheckInScanInput] = useState("");
  const [scannedPilgrim, setScannedPilgrim] = useState<YatraRegistration | null>(null);
  const [deskStaffName, setDeskStaffName] = useState("IYF Desk Staff");
  const [checkInFilter, setCheckInFilter] = useState<"all" | "boarded" | "pending">("all");
  const [checkInBatchFilter, setCheckInBatchFilter] = useState<string>("all");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [autoCheckInOnScan, setAutoCheckInOnScan] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Real-time camera QR scanner effect
  useEffect(() => {
    let qrScanner: any = null;
    let isMounted = true;

    if (isCameraActive && activeTab === "checkin") {
      setCameraError(null);
      const scannerId = "yatra-live-qr-scanner-box";

      const timer = setTimeout(async () => {
        try {
          const scannerElement = document.getElementById(scannerId);
          if (!scannerElement) return;

          const { Html5Qrcode } = await import("html5-qrcode");
          if (!isMounted) return;

          qrScanner = new Html5Qrcode(scannerId);

          qrScanner
            .start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              async (decodedText: string) => {
                if (!isMounted) return;
                const clean = decodedText.trim().toUpperCase();
                setCheckInScanInput(clean);

                const found = (youthYatra.registrations || []).find(
                  (r) =>
                    r.id.toUpperCase() === clean ||
                    r.boardingPassId?.toUpperCase() === clean ||
                    r.phone.replace(/\D/g, "") === clean.replace(/\D/g, "") ||
                    (r.email && r.email.toUpperCase() === clean)
                );

                if (found) {
                  playSuccessChime();
                  setScannedPilgrim(found);
                  if (autoCheckInOnScan && !found.checkedIn) {
                    const res = await checkInYatraParticipant(found.id, deskStaffName);
                    if (res.success && res.registration) {
                      setScannedPilgrim(res.registration);
                      toast.success(`🎉 ${res.message}`);
                    }
                  } else {
                    toast.info(`Scanned: ${found.fullName}`);
                  }
                } else {
                  playErrorBuzzer();
                  toast.error(`Unregistered QR pass: "${clean.slice(0, 25)}"`);
                }
              },
              () => {}
            )
            .catch((err: any) => {
              console.error("Camera scanner error:", err);
              if (isMounted) {
                setCameraError("Camera access denied or unavailable. Please enable camera permission in your browser or use manual ID lookup.");
                setIsCameraActive(false);
              }
            });
        } catch (e: any) {
          console.error("Scanner init error:", e);
          if (isMounted) {
            setCameraError(e.message || "Failed to initialize camera.");
            setIsCameraActive(false);
          }
        }
      }, 250);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (qrScanner) {
          qrScanner
            .stop()
            .then(() => qrScanner?.clear())
            .catch(() => {});
        }
      };
    }
  }, [isCameraActive, activeTab, youthYatra.registrations, autoCheckInOnScan, deskStaffName]);

  // Selected event to edit
  const events = youthYatra.events || [];
  const activeEventId = youthYatra.activeEventId || events[0]?.id || "";
  const [selectedEventId, setSelectedEventId] = useState<string>(activeEventId || events[0]?.id || "");

  const currentEvent: YatraEvent | undefined =
    events.find((e) => e.id === selectedEventId) || events[0] || defaultYouthYatra2026;

  // Registrations search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<YatraRegistration | null>(null);

  // New Event Modal State
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventYear, setNewEventYear] = useState<number>(new Date().getFullYear() + 1);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [cloneFromActive, setCloneFromActive] = useState(true);

  // Day editor modal state
  const [editingDay, setEditingDay] = useState<YatraTimelineDay | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Place editor modal state
  const [editingPlace, setEditingPlace] = useState<YatraPlace | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  // New Photo modal state
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("kirtan");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Vehicle editor modal state
  const [editingVehicle, setEditingVehicle] = useState<YatraVehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Travel Step editor modal state
  const [editingTravelStep, setEditingTravelStep] = useState<YatraTravelStep | null>(null);
  const [isTravelStepModalOpen, setIsTravelStepModalOpen] = useState(false);

  // Pickup Point modal state
  const [editingPickup, setEditingPickup] = useState<YatraPickupPoint | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  // Unread registrations counter
  const unreadCount = (youthYatra.registrations || []).filter((r) => !r.read).length;

  // Filtered registrations for current event
  const eventRegistrations = useMemo(() => {
    return (youthYatra.registrations || []).filter((r) => {
      const matchesEvent = r.eventId === currentEvent?.id;
      if (!matchesEvent) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || r.paymentStatus === paymentFilter;

      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [youthYatra.registrations, currentEvent?.id, searchQuery, statusFilter, paymentFilter]);

  // Save Event Update Helper
  const updateCurrentEvent = (patch: Partial<YatraEvent>) => {
    if (!currentEvent) return;
    const updated = { ...currentEvent, ...patch };
    saveYatraEvent(updated);
    toast.success("Yatra event updated successfully!");
  };

  // Create New Year Event Handler
  const handleCreateNewEvent = () => {
    if (!newEventYear) {
      toast.error("Please enter a valid year.");
      return;
    }
    const newId = `yatra_${newEventYear}`;
    const base = cloneFromActive && currentEvent ? currentEvent : defaultYouthYatra2026;
    const created: YatraEvent = {
      ...base,
      id: newId,
      year: newEventYear,
      title: newEventTitle.trim() || `Annual Youth Yatra ${newEventYear}`,
      startDate: `${newEventYear}-10-15`,
      endDate: `${newEventYear}-10-19`,
      registrationOpen: true,
      isPublished: true,
      isArchived: false,
    };

    saveYatraEvent(created);
    setSelectedEventId(newId);
    setIsCreatingEvent(false);
    toast.success(`Created Annual Youth Yatra ${newEventYear} successfully!`);
  };

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (eventRegistrations.length === 0) {
      toast.error("No registration records to export.");
      return;
    }

    const headers = [
      "Registration ID",
      "Full Name",
      "Age",
      "Gender",
      "Phone",
      "Email",
      "City",
      "Emergency Contact Name",
      "Emergency Contact Phone",
      "Category",
      "Payment Mode",
      "Amount Paid",
      "Payment Status",
      "Transaction ID",
      "Registration Status",
      "Registration Date",
    ];

    const rows = eventRegistrations.map((r) => [
      r.id,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.age,
      r.gender,
      r.phone,
      r.email,
      `"${r.city.replace(/"/g, '""')}"`,
      `"${r.emergencyContactName.replace(/"/g, '""')}"`,
      r.emergencyContactPhone,
      r.registrationCategory,
      r.paymentMode,
      r.amountPaid,
      r.paymentStatus,
      r.transactionId || "N/A",
      r.status,
      new Date(r.registeredAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Youth_Yatra_${currentEvent?.year || "2026"}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  // Image Upload helper
  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      toast.loading("Uploading image to Cloudinary...");
      const url = await uploadToCloudinary(file, "ISKCON-KURNOOL/YouthYatra");
      callback(url);
      toast.dismiss();
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to upload image.");
    }
  };

  if (!currentEvent) {
    return (
      <div className="p-8 text-center space-y-4">
        <Compass className="h-12 w-12 text-primary mx-auto animate-spin" />
        <h3 className="font-bold text-lg">Loading Youth Yatra console...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#20083c] via-[#48127c] to-[#20083c] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-md mb-3">
              <Compass className="h-3.5 w-3.5" /> Reusable Event Management System
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Annual Youth Yatra Console
            </h2>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Configure multi-year Yatra editions, edit day-wise itineraries, manage route places, review participant registrations, verify UPI payments, and export devotee rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const nextState = youthYatra.yatraActive === false ? true : false;
                setYouthYatra({ ...youthYatra, yatraActive: nextState });
                toast.success(nextState ? "Youth Yatra Registration enabled & Active!" : "Youth Yatra set to Coming Soon mode.");
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer ${
                youthYatra.yatraActive !== false
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-amber-400 hover:bg-amber-500 text-slate-950"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{youthYatra.yatraActive !== false ? "Yatra Available & Open" : "Registration Coming Soon Mode"}</span>
            </button>

            <a
              href="/youth-yatra"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition border border-white/20 backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4" /> Live Public Page
            </a>
          </div>
        </div>

        {/* Year / Event Selector Bar */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-amber-300 font-bold uppercase tracking-wider">Select Edition:</span>
            {events.map((evt) => {
              const isSelected = evt.id === currentEvent.id;
              const isActive = evt.id === youthYatra.activeEventId;
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 shadow-md scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>{evt.year}</span>
                  {isActive && (
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                      Live Active
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setIsCreatingEvent(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New Yatra Year
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentEvent.id !== youthYatra.activeEventId && (
              <button
                onClick={() => {
                  setActiveYatraEvent(currentEvent.id);
                  toast.success(`Set ${currentEvent.title} as the default active event!`);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-300/40 font-semibold transition cursor-pointer"
              >
                Set as Default Live Event
              </button>
            )}

            {events.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${currentEvent.title}?`)) {
                    deleteYatraEvent(currentEvent.id);
                    toast.success("Event deleted.");
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-300/30 font-semibold transition cursor-pointer"
              >
                Delete Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("registrations");
            markAllYatraRegistrationsRead();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "registrations"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Registrations
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-secondary text-primary rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("checkin")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "checkin"
              ? "bg-emerald-600 text-white shadow-md font-bold"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200"
          }`}
        >
          <QrCode className="h-4 w-4 text-emerald-600" />
          Live Check-In Desk
          <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white text-emerald-800 rounded-full shadow-xs">
            {eventRegistrations.filter((r) => r.checkedIn).length}/{eventRegistrations.length} Boarded
          </span>
        </button>

        <button
          onClick={() => setActiveTab("travel")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "travel"
              ? "bg-amber-500 text-slate-950 shadow-md font-bold"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <Bus className="h-4 w-4 text-amber-600" />
          Travel Means &amp; Where to Come ({currentEvent.travelConfig?.vehicles?.length || 0} Coaches)
        </button>

        <button
          onClick={() => setActiveTab("eventDetails")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "eventDetails"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Event Details &amp; Theme
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "timeline"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Timeline Itinerary ({currentEvent.timeline?.length || 0} Days)
        </button>

        <button
          onClick={() => setActiveTab("places")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "places"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Route &amp; Places ({currentEvent.places?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "payments"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Payment Config ({currentEvent.paymentConfig?.mode?.toUpperCase()})
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "gallery"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Gallery Albums ({currentEvent.gallery?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "content"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-surface hover:bg-muted text-foreground"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Guidelines, FAQs &amp; Team
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: REGISTRATIONS DASHBOARD & PAYMENT VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
          {/* Quick Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-xs space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Total Registrations</div>
              <div className="font-display font-extrabold text-2xl text-primary">
                {eventRegistrations.length} / {currentEvent.maxSeats || 120}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {Math.max(0, (currentEvent.maxSeats || 120) - eventRegistrations.length)} seats left
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-xs space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Confirmed Devotees</div>
              <div className="font-display font-extrabold text-2xl text-emerald-600">
                {eventRegistrations.filter((r) => r.status === "confirmed").length}
              </div>
              <div className="text-[11px] text-muted-foreground">Ready for travel</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-xs space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Pending Payment Verification</div>
              <div className="font-display font-extrabold text-2xl text-amber-600">
                {eventRegistrations.filter((r) => r.paymentStatus === "pending").length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Needs admin review</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-xs space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Total Revenue Collected</div>
              <div className="font-display font-extrabold text-2xl text-purple-900">
                ₹
                {eventRegistrations
                  .filter((r) => r.paymentStatus === "verified" || r.paymentStatus === "completed")
                  .reduce((acc, r) => acc + (r.amountPaid || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground">Verified accounts</div>
            </div>
          </div>

          {/* Search, Filter & Export Controls */}
          <div className="bg-white p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Devotee Name, Phone, City, Registration ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlist">Waitlist</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="verified">Payment Verified</option>
                <option value="pending">Payment Pending</option>
                <option value="completed">Free / Completed</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export to CSV / Excel
              </button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            {eventRegistrations.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <p className="font-semibold text-sm">No registrations found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-foreground/80 border-b font-semibold">
                      <th className="p-3.5 pl-4">Reg ID &amp; Devotee</th>
                      <th className="p-3.5">Age / Gender</th>
                      <th className="p-3.5">Contact &amp; City</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Payment Details</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eventRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-muted/30 transition">
                        <td className="p-3.5 pl-4">
                          <div className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md inline-block mb-1">
                            {reg.id}
                          </div>
                          <div className="font-bold text-foreground text-sm">{reg.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(reg.registeredAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold">{reg.age} yrs</div>
                          <div className="text-muted-foreground">{reg.gender}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-primary">{reg.phone}</div>
                          <div className="text-muted-foreground">{reg.city}</div>
                          <div className="text-[10px] text-muted-foreground">{reg.email}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-md bg-surface text-foreground font-medium border">
                            {reg.registrationCategory}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-foreground">₹{reg.amountPaid}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">
                            Mode: {reg.paymentMode}
                          </div>
                          {reg.transactionId && (
                            <div className="text-[10px] font-mono text-purple-900">
                              UTR: {reg.transactionId}
                            </div>
                          )}
                          <div className="mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                reg.paymentStatus === "verified" || reg.paymentStatus === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : reg.paymentStatus === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {reg.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              reg.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : reg.status === "waitlist"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right pr-4 space-x-1.5">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-lg border hover:bg-muted text-primary cursor-pointer"
                            title="View Full Devotee Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {reg.paymentStatus === "pending" && (
                            <button
                              onClick={() => {
                                updateYatraRegistrationStatus(reg.id, "confirmed", "verified");
                                toast.success(`Payment verified for ${reg.fullName}!`);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer"
                              title="Mark Payment Verified & Confirm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete registration for ${reg.fullName}?`)) {
                                deleteYatraRegistration(reg.id);
                                toast.success("Registration deleted.");
                              }
                            }}
                            className="p-1.5 rounded-lg border hover:bg-rose-50 text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: LIVE CHECK-IN & BOARDING DESK */}
      {/* ========================================================================= */}
      {activeTab === "checkin" && (
        <div className="space-y-6">
          {/* Live Boarding Statistics Banner */}
          {(() => {
            const total = eventRegistrations.length;
            const boarded = eventRegistrations.filter((r) => r.checkedIn).length;
            const awaiting = total - boarded;
            const percent = total > 0 ? Math.round((boarded / total) * 100) : 0;
            const coach1Boarded = eventRegistrations.filter((r) => r.checkedIn && (r.batch?.includes("Coach 1") || r.batch?.includes("Batch A"))).length;
            const coach2Boarded = eventRegistrations.filter((r) => r.checkedIn && (r.batch?.includes("Coach 2") || r.batch?.includes("Batch B"))).length;

            return (
              <div className="bg-gradient-to-r from-[#1c0834] via-[#2f0e54] to-[#1c0834] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-400/30 space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-widest border border-emerald-400/30 mb-2">
                      <QrCode className="h-3.5 w-3.5 text-emerald-400" /> Real-time Pilgrim Verification
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                      Live Departure Boarding Desk
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                      Scan pilgrim QR codes or search by Registration ID to verify payment, assign seats, and confirm boarding.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/15 backdrop-blur-md">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-amber-300">Desk Staff</div>
                      <input
                        type="text"
                        value={deskStaffName}
                        onChange={(e) => setDeskStaffName(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white outline-none border-b border-white/30 text-right w-28"
                        placeholder="Staff Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Big Boarding Progress Indicator */}
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Boarding Completion Rate
                    </span>
                    <span className="font-mono text-base text-white">
                      {boarded} / {total} Boarded ({percent}%)
                    </span>
                  </div>
                  <div className="h-4 bg-white/15 rounded-full overflow-hidden p-0.5 backdrop-blur-md">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* 4 Micro Breakdown Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs relative z-10">
                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-white/70">Total Registered</div>
                    <div className="font-display font-bold text-xl text-white mt-1">{total} Devotees</div>
                  </div>
                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-emerald-300 font-bold">🟢 Boarded &amp; Seated</div>
                    <div className="font-display font-bold text-xl text-emerald-400 mt-1">{boarded}</div>
                  </div>
                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-amber-300 font-bold">⚪ Awaiting Arrival</div>
                    <div className="font-display font-bold text-xl text-amber-300 mt-1">{awaiting}</div>
                  </div>
                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-white/70">Coach 1 / Coach 2</div>
                    <div className="font-display font-bold text-base text-white mt-1">
                      C1: {coach1Boarded} • C2: {coach2Boarded}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* QUICK SCAN & SEARCH VERIFICATION BOX */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-secondary" /> Scan Pilgrim Boarding Pass
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use device live camera, 2D barcode scanner gun, or enter Registration ID / Devotee Phone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoCheckInOnScan}
                    onChange={(e) => setAutoCheckInOnScan(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                  />
                  <Zap className={`h-3.5 w-3.5 ${autoCheckInOnScan ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                  <span>Instant Auto-Board on Scan</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsCameraActive((active) => !active)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                    isCameraActive
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                  }`}
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="h-4 w-4" /> Stop Camera Scanner
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" /> 📷 Open Camera Scanner
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Camera Viewfinder Stream */}
            {isCameraActive && (
              <div className="p-4 bg-slate-950 rounded-3xl border-2 border-emerald-500/80 shadow-2xl space-y-3 animate-scale-in text-center">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold px-2">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Video QR Scanner Active
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Aim at Pilgrim QR Code</span>
                </div>

                <div className="relative max-w-sm mx-auto overflow-hidden rounded-2xl bg-black border border-slate-700">
                  <div id="yatra-live-qr-scanner-box" className="w-full min-h-[260px] bg-black" />
                </div>

                <p className="text-[11px] text-slate-300">
                  Align the QR code from the devotee's physical or digital boarding pass within the center box.
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Quick Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = checkInScanInput.trim().toUpperCase();
                if (!clean) return;
                const found = (youthYatra.registrations || []).find(
                  (r) =>
                    r.id.toUpperCase() === clean ||
                    r.boardingPassId?.toUpperCase() === clean ||
                    r.phone.replace(/\D/g, "") === clean.replace(/\D/g, "")
                );
                if (found) {
                  playSuccessChime();
                  setScannedPilgrim(found);
                } else {
                  playErrorBuzzer();
                  toast.error(`No pilgrim record found for "${checkInScanInput}".`);
                }
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <QrCode className="h-5 w-5 absolute left-3.5 top-3.5 text-primary" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Scan QR or enter Registration ID (e.g. YY26-00482) / Devotee Phone..."
                  value={checkInScanInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCheckInScanInput(val);
                    const clean = val.trim().toUpperCase();
                    if (clean.length >= 6) {
                      const found = (youthYatra.registrations || []).find(
                        (r) =>
                          r.id.toUpperCase() === clean ||
                          r.boardingPassId?.toUpperCase() === clean ||
                          r.phone.replace(/\D/g, "") === clean.replace(/\D/g, "")
                      );
                      if (found) setScannedPilgrim(found);
                    }
                  }}
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono font-bold border-2 border-primary/40 rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none bg-surface"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition shadow-md cursor-pointer shrink-0"
              >
                Lookup Pilgrim
              </button>
            </form>

            {/* Scanned Match Display Card */}
            {scannedPilgrim && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-purple-50/40 border-2 border-amber-400 shadow-md space-y-4 animate-scale-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-purple-900 text-amber-300 font-display font-extrabold text-2xl grid place-items-center shadow-md">
                      {scannedPilgrim.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-purple-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                          {scannedPilgrim.id}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {scannedPilgrim.boardingPassId || "PASS"}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-2xl text-primary mt-0.5">
                        {scannedPilgrim.fullName}
                      </h4>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    {scannedPilgrim.checkedIn ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ✅ BOARDED
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs uppercase tracking-wider">
                        <Clock className="h-4 w-4 text-amber-600" />
                        ⚪ NOT CHECKED IN
                      </div>
                    )}
                  </div>
                </div>

                {/* Pilgrim Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Age / Gender
                    </span>
                    <span className="font-bold text-foreground">
                      {scannedPilgrim.age} yrs • {scannedPilgrim.gender}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Phone Number
                    </span>
                    <span className="font-bold text-primary font-mono">{scannedPilgrim.phone}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Assigned Coach
                    </span>
                    <span className="font-bold text-emerald-700">
                      {scannedPilgrim.batch || "Batch A (Coach 1)"}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Assigned Seat
                    </span>
                    <span className="font-mono font-black text-sm text-purple-900">
                      Seat #{scannedPilgrim.seatNumber || "01"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border">
                  <div>
                    <strong>Emergency Contact:</strong> {scannedPilgrim.emergencyContactName} (
                    {scannedPilgrim.emergencyContactRelation}) - {scannedPilgrim.emergencyContactPhone}
                  </div>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Payment: {scannedPilgrim.paymentStatus.toUpperCase()} (₹{scannedPilgrim.amountPaid})
                  </div>
                </div>

                {/* Action Confirmation Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {!scannedPilgrim.checkedIn ? (
                    <button
                      onClick={async () => {
                        const res = await checkInYatraParticipant(scannedPilgrim.id, deskStaffName);
                        if (res.success && res.registration) {
                          playSuccessChime();
                          setScannedPilgrim(res.registration);
                          toast.success(res.message);
                        }
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="h-5 w-5" /> [ CONFIRM BOARDING ]
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="text-xs text-emerald-800 font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                        Boarded at {new Date(scannedPilgrim.checkedInAt || "").toLocaleTimeString()} by{" "}
                        {scannedPilgrim.checkedInBy || deskStaffName}
                      </div>
                      <button
                        onClick={async () => {
                          await undoCheckInYatraParticipant(scannedPilgrim.id);
                          setScannedPilgrim({ ...scannedPilgrim, checkedIn: false });
                          toast.info(`Check-in reverted for ${scannedPilgrim.fullName}.`);
                        }}
                        className="px-3 py-2 rounded-xl border hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                      >
                        Undo Check-In
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setScannedPilgrim(null);
                      setCheckInScanInput("");
                    }}
                    className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-muted text-muted-foreground"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* LIVE CHECK-IN ROSTER TABLE */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h4 className="font-display font-bold text-lg text-primary">
                  Pilgrim Check-In Roster ({eventRegistrations.length})
                </h4>
                <p className="text-xs text-muted-foreground">
                  View check-in status, assign coach/seat numbers, or confirm boarding manually.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={checkInFilter}
                  onChange={(e) => setCheckInFilter(e.target.value as any)}
                  className="px-3 py-1.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer font-semibold"
                >
                  <option value="all">All Check-In Statuses</option>
                  <option value="boarded">🟢 Boarded Only</option>
                  <option value="pending">⚪ Awaiting Arrival Only</option>
                </select>

                <select
                  value={checkInBatchFilter}
                  onChange={(e) => setCheckInBatchFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer font-semibold"
                >
                  <option value="all">All Coaches</option>
                  <option value="Coach 1">Coach 1 (Boys)</option>
                  <option value="Coach 2">Coach 2 (Girls)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-foreground/80 border-b font-semibold">
                    <th className="p-3 pl-4">Reg ID &amp; Pilgrim</th>
                    <th className="p-3">Coach / Batch</th>
                    <th className="p-3">Seat #</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Boarding Status</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventRegistrations
                    .filter((r) => {
                      if (checkInFilter === "boarded" && !r.checkedIn) return false;
                      if (checkInFilter === "pending" && r.checkedIn) return false;
                      if (checkInBatchFilter !== "all" && !r.batch?.includes(checkInBatchFilter)) return false;
                      return true;
                    })
                    .map((r) => (
                      <tr key={r.id} className={`hover:bg-muted/30 transition ${r.checkedIn ? "bg-emerald-50/30" : ""}`}>
                        <td className="p-3 pl-4">
                          <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                            {r.id}
                          </span>
                          <div className="font-bold text-foreground text-sm">{r.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">{r.gender} • {r.age} yrs</div>
                        </td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={r.batch || "Batch A (Coach 1)"}
                            onChange={(e) => updateYatraSeatAndBatch(r.id, e.target.value, r.seatNumber || "01")}
                            className="px-2 py-1 text-xs border rounded-lg bg-white w-36 font-semibold"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={r.seatNumber || "01"}
                            onChange={(e) => updateYatraSeatAndBatch(r.id, r.batch || "Batch A", e.target.value)}
                            className="px-2 py-1 text-xs border rounded-lg bg-white w-16 font-mono font-bold text-center"
                          />
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-primary">{r.phone}</div>
                          <div className="text-[10px] text-muted-foreground">{r.city}</div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            PAID (₹{r.amountPaid})
                          </span>
                        </td>

                        <td className="p-3">
                          {r.checkedIn ? (
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                ✅ BOARDED
                              </span>
                              <div className="text-[10px] text-emerald-800 mt-0.5 font-medium">
                                {new Date(r.checkedInAt || "").toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              ⚪ Not Boarded
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right pr-4">
                          {!r.checkedIn ? (
                            <button
                              onClick={() => {
                                playSuccessChime();
                                checkInYatraParticipant(r.id, deskStaffName);
                                toast.success(`Boarded: ${r.fullName}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition hover:scale-105"
                            >
                              Check In
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                undoCheckInYatraParticipant(r.id);
                                toast.info(`Check-in reverted: ${r.fullName}`);
                              }}
                              className="px-2.5 py-1 rounded-lg border hover:bg-rose-50 text-rose-600 text-[11px] font-semibold cursor-pointer"
                            >
                              Undo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TRAVEL MEANS & REPORTING MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "travel" && (
        <div className="space-y-8 animate-fade-in">
          {/* Section 1: Travel Mode & Departure Point Master Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
            <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                  <Bus className="h-5 w-5 text-secondary" /> Yatra Travel Mode &amp; Reporting Location
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define primary transit vehicle types, reporting landmark, address, Google Maps link, and luggage policies.
                </p>
              </div>

              <button
                onClick={() => {
                  updateCurrentEvent({ travelConfig: currentEvent.travelConfig });
                  toast.success("Travel configuration saved.");
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition cursor-pointer shrink-0"
              >
                <Save className="h-4 w-4" /> Save Travel Settings
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Primary Travel Mode</label>
                <input
                  type="text"
                  placeholder="e.g. Twin 2+2 AC Deluxe Luxury Pushback Coaches"
                  value={currentEvent.travelConfig?.primaryMode || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          departureLocationName: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          reportingTime: "05:00 AM",
                          departureTime: "06:00 AM Sharp",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        primaryMode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Reporting Time</label>
                <input
                  type="text"
                  placeholder="e.g. 05:00 AM (Mangala Harati)"
                  value={currentEvent.travelConfig?.reportingTime || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationName: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          departureTime: "",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        reportingTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Departure Time</label>
                <input
                  type="text"
                  placeholder="e.g. 06:00 AM Sharp"
                  value={currentEvent.travelConfig?.departureTime || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationName: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          reportingTime: "",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        departureTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl font-mono font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Departure Location / Temple Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Sri Puri Jagannath Temple, ISKCON Kurnool"
                  value={currentEvent.travelConfig?.departureLocationName || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          reportingTime: "",
                          departureTime: "",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        departureLocationName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Google Maps Location Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://maps.google.com/?q=ISKCON+Kurnool"
                  value={currentEvent.travelConfig?.departureGoogleMapUrl || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationName: "",
                          departureLocationAddress: "",
                          reportingTime: "",
                          departureTime: "",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        departureGoogleMapUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Complete Landmark &amp; Address</label>
              <input
                type="text"
                placeholder="e.g. NH-44 Highway, Near Birla Compound, Kurnool, Andhra Pradesh 518002"
                value={currentEvent.travelConfig?.departureLocationAddress || ""}
                onChange={(e) =>
                  updateCurrentEvent({
                    travelConfig: {
                      ...(currentEvent.travelConfig || {
                        primaryMode: "",
                        departureLocationName: "",
                        departureGoogleMapUrl: "",
                        reportingTime: "",
                        departureTime: "",
                        pickupPoints: [],
                        luggagePolicy: "",
                        vehicles: [],
                        stepByStepGuide: [],
                      }),
                      departureLocationAddress: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Train &amp; Outstation Devotee Transit Info</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Direct trains to Kurnool City (KNL) from Hyderabad/Bangalore. Auto ride takes 10 mins."
                  value={currentEvent.travelConfig?.trainOptionDetails || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationName: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          reportingTime: "",
                          departureTime: "",
                          pickupPoints: [],
                          luggagePolicy: "",
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        trainOptionDetails: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Luggage &amp; Baggage Policy</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1 Main Stowed Duffel Bag (Max 15 kg) + 1 Small Shoulder bag for bus cabin."
                  value={currentEvent.travelConfig?.luggagePolicy || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      travelConfig: {
                        ...(currentEvent.travelConfig || {
                          primaryMode: "",
                          departureLocationName: "",
                          departureLocationAddress: "",
                          departureGoogleMapUrl: "",
                          reportingTime: "",
                          departureTime: "",
                          pickupPoints: [],
                          vehicles: [],
                          stepByStepGuide: [],
                        }),
                        luggagePolicy: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Coach & Vehicle Fleet Manager */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <Bus className="h-5 w-5 text-secondary" /> Coach &amp; Vehicle Fleet ({currentEvent.travelConfig?.vehicles?.length || 0})
                </h4>
                <p className="text-xs text-muted-foreground">
                  Configure bus types (AC BharatBenz, Sleeper, Train 3AC), registration numbers, driver contacts, and amenities.
                </p>
              </div>

              <button
                onClick={() => {
                  const newV: YatraVehicle = {
                    id: `veh_${Date.now()}`,
                    vehicleName: `Coach #${(currentEvent.travelConfig?.vehicles?.length || 0) + 1} — Luxury AC Coach`,
                    type: "AC Luxury Coach",
                    registrationNumber: "AP 21 TZ ",
                    seatCapacity: 50,
                    driverName: "",
                    driverPhone: "",
                    coachInChargeName: "",
                    coachInChargePhone: "",
                    batchTag: `Batch ${(currentEvent.travelConfig?.vehicles?.length || 0) === 0 ? "A (Boys)" : "B (Girls)"}`,
                    amenities: [
                      "Full Air-Conditioning",
                      "Pushback 2+2 Recliner Seats",
                      "Mobile USB Charging",
                      "Dedicated Kirtan PA Sound System",
                      "Lockable Luggage Boot",
                    ],
                  };
                  setEditingVehicle(newV);
                  setIsVehicleModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Vehicle / Coach
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(currentEvent.travelConfig?.vehicles || []).map((veh) => (
                <div
                  key={veh.id}
                  className="bg-surface rounded-3xl border border-border p-5 space-y-4 hover:shadow-md transition relative"
                >
                  <div className="flex items-start justify-between gap-3 border-b pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                          {veh.type}
                        </span>
                        <span className="font-mono font-extrabold text-xs text-purple-950 bg-white px-2 py-0.5 rounded border">
                          {veh.registrationNumber || "NO REG"}
                        </span>
                      </div>
                      <h5 className="font-display font-bold text-base text-primary">
                        {veh.vehicleName}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingVehicle(veh);
                          setIsVehicleModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border hover:bg-muted text-primary cursor-pointer"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${veh.vehicleName}?`)) {
                            const updatedV = (currentEvent.travelConfig?.vehicles || []).filter((v) => v.id !== veh.id);
                            updateCurrentEvent({
                              travelConfig: {
                                ...(currentEvent.travelConfig as any),
                                vehicles: updatedV,
                              },
                            });
                            toast.success("Vehicle deleted.");
                          }
                        }}
                        className="p-1.5 rounded-lg border hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase">Seating Capacity</span>
                      <span className="font-bold text-foreground font-mono">{veh.seatCapacity} Confirmed Seats</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase">Assigned Batch</span>
                      <span className="font-bold text-emerald-700">{veh.batchTag}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase">Captain / Driver</span>
                      <span className="font-bold text-foreground truncate block">{veh.driverName || "Assigned Driver"}</span>
                      <span className="text-[10px] text-primary font-mono">{veh.driverPhone}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase">Coach In-Charge</span>
                      <span className="font-bold text-foreground truncate block">{veh.coachInChargeName || "Assigned Devotee"}</span>
                      <span className="text-[10px] text-primary font-mono">{veh.coachInChargePhone}</span>
                    </div>
                  </div>

                  {veh.amenities && veh.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {veh.amenities.map((am, i) => (
                        <span key={i} className="text-[10px] bg-white px-2.5 py-1 rounded-md border text-muted-foreground flex items-center gap-1 font-medium">
                          <Check className="h-3 w-3 text-emerald-600" /> {am}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Step-by-Step Reporting & Departure Process Guide */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-secondary" /> Step-by-Step Departure Timeline Guide ({currentEvent.travelConfig?.stepByStepGuide?.length || 0} Steps)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Step-by-step reporting instructions shown to devotees: Arrival time, Mangala Harati, Luggage token, Coach boarding &amp; Flag-off.
                </p>
              </div>

              <button
                onClick={() => {
                  const stepNum = (currentEvent.travelConfig?.stepByStepGuide?.length || 0) + 1;
                  const newS: YatraTravelStep = {
                    id: `step_${Date.now()}`,
                    stepNumber: stepNum,
                    time: "05:00 AM",
                    title: `Step ${stepNum}: Reporting Instruction`,
                    location: "ISKCON Kurnool Main Altar",
                    description: "Describe what devotees should do during this step.",
                    instructions: "Special guidelines for coordinators.",
                  };
                  setEditingTravelStep(newS);
                  setIsTravelStepModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Departure Step
              </button>
            </div>

            <div className="space-y-3">
              {(currentEvent.travelConfig?.stepByStepGuide || []).map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-purple-900 text-amber-300 font-display font-black text-sm grid place-items-center shrink-0 shadow-xs">
                      #{step.stepNumber || idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {step.time}
                        </span>
                        <h5 className="font-display font-bold text-sm text-foreground">
                          {step.title}
                        </h5>
                        <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-secondary" /> {step.location}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {step.instructions && (
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                          <strong>Note:</strong> {step.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingTravelStep(step);
                        setIsTravelStepModalOpen(true);
                      }}
                      className="p-2 rounded-lg border hover:bg-muted text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        const updated = (currentEvent.travelConfig?.stepByStepGuide || []).filter((s) => s.id !== step.id);
                        updateCurrentEvent({
                          travelConfig: {
                            ...(currentEvent.travelConfig as any),
                            stepByStepGuide: updated,
                          },
                        });
                        toast.success("Step removed.");
                      }}
                      className="p-2 rounded-lg border hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: En-Route Pickup Points */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h4 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" /> Highway En-Route Pickup Points ({currentEvent.travelConfig?.pickupPoints?.length || 0})
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pickup stops along the highway for outstation devotees (e.g. Dhone, Gooty, Anantapur).
                </p>
              </div>

              <button
                onClick={() => {
                  const newP: YatraPickupPoint = {
                    id: `p_${Date.now()}`,
                    location: "New Highway Junction",
                    time: "06:30 AM",
                    landmark: "Toll Plaza / Hotel Bypass",
                  };
                  setEditingPickup(newP);
                  setIsPickupModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Pickup Point
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(currentEvent.travelConfig?.pickupPoints || []).map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-surface border flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded inline-block">
                      {p.time}
                    </div>
                    <div className="font-display font-bold text-sm text-foreground">{p.location}</div>
                    <div className="text-[11px] text-muted-foreground">{p.landmark}</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setEditingPickup(p);
                        setIsPickupModalOpen(true);
                      }}
                      className="p-1 rounded border hover:bg-muted text-primary cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = (currentEvent.travelConfig?.pickupPoints || []).filter((item) => item.id !== p.id);
                        updateCurrentEvent({
                          travelConfig: {
                            ...(currentEvent.travelConfig as any),
                            pickupPoints: updated,
                          },
                        });
                        toast.success("Pickup point removed.");
                      }}
                      className="p-1 rounded border hover:bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: EVENT DETAILS & THEME MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "eventDetails" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">
                Annual Yatra Edition Details ({currentEvent.year})
              </h3>
              <p className="text-xs text-muted-foreground">
                Update the main theme, tagline, dates, poster images, and seating capacity for this edition.
              </p>
            </div>
            <button
              onClick={() => updateCurrentEvent({})}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" /> Save Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Yatra Year</label>
              <input
                type="number"
                value={currentEvent.year}
                onChange={(e) => updateCurrentEvent({ year: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Event Title</label>
              <input
                type="text"
                value={currentEvent.title}
                onChange={(e) => updateCurrentEvent({ title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Theme / Slogan</label>
              <input
                type="text"
                value={currentEvent.theme}
                onChange={(e) => updateCurrentEvent({ theme: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl font-serif italic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Duration Text</label>
              <input
                type="text"
                value={currentEvent.durationText}
                onChange={(e) => updateCurrentEvent({ durationText: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tagline</label>
            <input
              type="text"
              value={currentEvent.tagline}
              onChange={(e) => updateCurrentEvent({ tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={currentEvent.startDate}
                onChange={(e) => updateCurrentEvent({ startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={currentEvent.endDate}
                onChange={(e) => updateCurrentEvent({ endDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Max Seating Capacity</label>
              <input
                type="number"
                value={currentEvent.maxSeats}
                onChange={(e) => updateCurrentEvent({ maxSeats: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Age Group</label>
              <input
                type="text"
                value={currentEvent.ageGroup}
                onChange={(e) => updateCurrentEvent({ ageGroup: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Organised By</label>
              <input
                type="text"
                value={currentEvent.organizedBy}
                onChange={(e) => updateCurrentEvent({ organizedBy: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={currentEvent.description}
              onChange={(e) => updateCurrentEvent({ description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Divine Purpose</label>
              <textarea
                rows={2}
                value={currentEvent.purpose}
                onChange={(e) => updateCurrentEvent({ purpose: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Who Can Participate</label>
              <textarea
                rows={2}
                value={currentEvent.whoCanJoin}
                onChange={(e) => updateCurrentEvent({ whoCanJoin: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          {/* Poster & Banner URLs */}
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Main Poster URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentEvent.posterUrl}
                  onChange={(e) => updateCurrentEvent({ posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl"
                />
                <label className="px-3 py-2 rounded-xl bg-surface border hover:bg-muted cursor-pointer shrink-0 text-xs font-semibold flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f, (url) => updateCurrentEvent({ posterUrl: url }));
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Hero Banner URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentEvent.heroBannerUrl}
                  onChange={(e) => updateCurrentEvent({ heroBannerUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl"
                />
                <label className="px-3 py-2 rounded-xl bg-surface border hover:bg-muted cursor-pointer shrink-0 text-xs font-semibold flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f, (url) => updateCurrentEvent({ heroBannerUrl: url }));
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="regOpen"
                checked={currentEvent.registrationOpen}
                onChange={(e) => updateCurrentEvent({ registrationOpen: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="regOpen" className="text-xs font-bold cursor-pointer">
                Allow Online Public Registrations (Registration Open)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TIMELINE / ITINERARY MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">
                Day-by-Day Journey Itinerary ({currentEvent.timeline?.length || 0} Days)
              </h3>
              <p className="text-xs text-muted-foreground">
                Add, reorder, or edit daily schedules, morning programs, travel routes, and satsangs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextDay = (currentEvent.timeline?.length || 0) + 1;
                  const newDay: YatraTimelineDay = {
                    id: "day_" + Date.now(),
                    dayNumber: nextDay,
                    date: `Oct ${14 + nextDay}, ${currentEvent.year}`,
                    title: `Day 0${nextDay}: Divine Darshan & Pilgrimage`,
                    location: "Sacred Temple Kshetra",
                    morningProgram: "5:00 AM Mangala Harati, Tulasi Puja & Japa Meditation",
                    travelDetails: "Travel via Luxury AC Deluxe Coaches",
                    sessions: "Bhagavad Gita Wisdom Class & Youth Interactive Workshop",
                    activities: ["Temple Darshan", "Ecstatic Kirtan & Harinama", "Prasadam Feast"],
                    accommodation: "Verified Devotee Hotel Stay (AC)",
                    meals: "3x Pure Satvik Krishna Prasadam",
                  };
                  const updatedTimeline = [...(currentEvent.timeline || []), newDay].map((d, idx) => ({
                    ...d,
                    dayNumber: idx + 1,
                  }));
                  const totalDays = updatedTimeline.length;
                  const totalNights = Math.max(1, totalDays - 1);
                  const durationText = `${totalDays} Days & ${totalNights} Nights`;
                  const updatedTagline = currentEvent.tagline.replace(/\b\d+-Day\b/gi, `${totalDays}-Day`);

                  updateCurrentEvent({
                    timeline: updatedTimeline,
                    durationText,
                    tagline: updatedTagline,
                  });
                  toast.success(`Increased to ${totalDays} Days! All duration text and itineraries updated.`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Add Day {(currentEvent.timeline?.length || 0) + 1}
              </button>

              <button
                onClick={() => {
                  const nextDay = (currentEvent.timeline?.length || 0) + 1;
                  setEditingDay({
                    id: "day_" + Date.now(),
                    dayNumber: nextDay,
                    date: `Oct ${14 + nextDay}, ${currentEvent.year}`,
                    title: `Day ${nextDay} Itinerary`,
                    location: "Location Kshetra",
                    morningProgram: "5:00 AM Mangala Harati & Japa Meditation",
                    travelDetails: "Travel via AC Coaches",
                    sessions: "Spiritual discourse & workshop",
                    activities: ["Temple Darshan", "Kirtan"],
                    accommodation: "Hotel Stay",
                    meals: "Satvik Prasadam",
                  });
                  setIsDayModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" /> Custom Day Form
              </button>
            </div>
          </div>

          {/* Quick Duration Live Sync Notice Banner */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-xl bg-amber-400 text-slate-950 font-bold grid place-items-center shrink-0">
                ⚡
              </span>
              <div>
                <span className="font-bold text-amber-950">Dynamic Duration Auto-Sync: </span>
                <span className="text-amber-800">
                  Current total is <strong>{currentEvent.timeline?.length || 0} Days &amp; {Math.max(1, (currentEvent.timeline?.length || 1) - 1)} Nights</strong>. When you add or remove days, all website badges, hero tagline, inclusions, and boarding pass duration texts automatically adapt.
                </span>
              </div>
            </div>

            <div className="font-mono font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-amber-950 shrink-0 shadow-2xs">
              {currentEvent.durationText || `${currentEvent.timeline?.length || 5} Days & ${Math.max(1, (currentEvent.timeline?.length || 5) - 1)} Nights`}
            </div>
          </div>

          <div className="space-y-4">
            {(currentEvent.timeline || []).map((day, idx) => (
              <div
                key={day.id}
                className="p-5 rounded-2xl border bg-surface/50 hover:bg-surface transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-950 font-display font-extrabold text-sm grid place-items-center shrink-0">
                    D{String(day.dayNumber || idx + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold text-accent">
                      <span>{day.date}</span> • <span>{day.location}</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-primary">{day.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {day.morningProgram || day.travelDetails}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingDay(day);
                      setIsDayModalOpen(true);
                    }}
                    className="p-2 rounded-xl border bg-white hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete Day ${day.dayNumber}? This will automatically adjust the Yatra duration.`)) {
                        const remaining = (currentEvent.timeline || [])
                          .filter((d) => d.id !== day.id)
                          .map((d, i) => ({ ...d, dayNumber: i + 1 }));
                        const totalDays = remaining.length;
                        const totalNights = Math.max(1, totalDays - 1);
                        const durationText = `${totalDays} Days & ${totalNights} Nights`;
                        const updatedTagline = currentEvent.tagline.replace(/\b\d+-Day\b/gi, `${totalDays}-Day`);

                        updateCurrentEvent({
                          timeline: remaining,
                          durationText,
                          tagline: updatedTagline,
                        });
                        toast.success(`Day deleted. Duration updated to ${durationText}.`);
                      }
                    }}
                    className="p-2 rounded-xl border bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PLACES & ROUTE MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "places" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">
                Yatra Destinations &amp; Holy Dhams ({currentEvent.places?.length || 0})
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage holy places, temple details, distances, descriptions, and Google Maps integration.
              </p>
            </div>
            <button
              onClick={() => {
                const nextOrder = (currentEvent.places?.length || 0) + 1;
                setEditingPlace({
                  id: "place_" + Date.now(),
                  name: "New Kshetra / Temple",
                  tagline: "Sacred Holy Abode",
                  description: "Historic temple steeped in transcendental pastimes.",
                  image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
                  highlights: ["Holy Darshan", "Temple Kirtan"],
                  order: nextOrder,
                });
                setIsPlaceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4" /> Add Destination Place
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentEvent.places || []).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border bg-surface/40 flex items-start gap-4 hover:border-amber-300 transition"
              >
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="font-display font-bold text-base text-primary">{p.name}</div>
                  <div className="text-xs text-accent font-medium">{p.tagline}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPlace(p);
                        setIsPlaceModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border bg-white text-xs font-semibold hover:bg-muted cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) {
                          const updated = currentEvent.places.filter((pl) => pl.id !== p.id);
                          updateCurrentEvent({ places: updated });
                          toast.success("Place removed.");
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: PAYMENTS & PRICING CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">
                Payment Mode &amp; Registration Fee Settings
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure whether this Yatra edition is free, UPI QR based, Razorpay gateway based, or hybrid.
              </p>
            </div>
            <button
              onClick={() => updateCurrentEvent({})}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" /> Save Payments
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: "both", label: "Both UPI QR + Razorpay (Recommended)", icon: CreditCard },
              { id: "qr", label: "Only UPI QR Code Payment", icon: QrCode },
              { id: "razorpay", label: "Only Razorpay Gateway", icon: CreditCard },
              { id: "free", label: "Free / Complimentary Registration", icon: CheckCircle2 },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() =>
                  updateCurrentEvent({
                    paymentConfig: { ...currentEvent.paymentConfig, mode: mode.id as any },
                  })
                }
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  currentEvent.paymentConfig.mode === mode.id
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface hover:bg-muted text-foreground"
                }`}
              >
                <mode.icon className="h-5 w-5" />
                <span className="text-xs font-bold">{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-xs font-semibold mb-1">Registration Fee Amount (₹)</label>
              <input
                type="number"
                value={currentEvent.paymentConfig.fee}
                onChange={(e) =>
                  updateCurrentEvent({
                    paymentConfig: { ...currentEvent.paymentConfig, fee: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2 text-xs border rounded-xl font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Temple UPI ID</label>
              <input
                type="text"
                value={currentEvent.paymentConfig.upiId || ""}
                onChange={(e) =>
                  updateCurrentEvent({
                    paymentConfig: { ...currentEvent.paymentConfig, upiId: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 text-xs border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Fee Inclusions Description</label>
            <input
              type="text"
              value={currentEvent.paymentConfig.feeDescription || ""}
              onChange={(e) =>
                updateCurrentEvent({
                  paymentConfig: { ...currentEvent.paymentConfig, feeDescription: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold mb-1">QR Code Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentEvent.paymentConfig.qrImageUrl || ""}
                  onChange={(e) =>
                    updateCurrentEvent({
                      paymentConfig: { ...currentEvent.paymentConfig, qrImageUrl: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border rounded-xl"
                />
                <label className="px-3 py-2 rounded-xl bg-surface border hover:bg-muted cursor-pointer shrink-0 text-xs font-semibold flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        handleImageUpload(f, (url) =>
                          updateCurrentEvent({
                            paymentConfig: { ...currentEvent.paymentConfig, qrImageUrl: url },
                          })
                        );
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Payment Instructions</label>
              <textarea
                rows={2}
                value={currentEvent.paymentConfig.paymentInstructions || ""}
                onChange={(e) =>
                  updateCurrentEvent({
                    paymentConfig: { ...currentEvent.paymentConfig, paymentInstructions: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: GALLERY MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "gallery" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-primary">
                Photo Gallery Albums ({currentEvent.gallery?.length || 0})
              </h3>
              <p className="text-xs text-muted-foreground">
                Upload and organize moments from this Yatra edition.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition">
              <Upload className="h-4 w-4" /> Upload New Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    handleImageUpload(f, (url) => {
                      const newPhoto: YatraGalleryItem = {
                        id: "yg_" + Date.now(),
                        url,
                        title: "Yatra Photo",
                        albumCategory: "kirtan",
                      };
                      updateCurrentEvent({ gallery: [newPhoto, ...(currentEvent.gallery || [])] });
                    });
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(currentEvent.gallery || []).map((photo) => (
              <div key={photo.id} className="group relative rounded-2xl overflow-hidden border shadow-xs aspect-[4/3]">
                <img src={photo.url} alt={photo.title || "Photo"} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => {
                      const updated = currentEvent.gallery.filter((p) => p.id !== photo.id);
                      updateCurrentEvent({ gallery: updated });
                      toast.success("Photo removed.");
                    }}
                    className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 7: GUIDELINES, CHECKLIST, FAQS & TEAM */}
      {/* ========================================================================= */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* FAQs Manager */}
          <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-display font-bold text-lg text-primary">Frequently Asked Questions</h4>
                <p className="text-xs text-muted-foreground">Manage accordion FAQs displayed on the Yatra page.</p>
              </div>
              <button
                onClick={() => {
                  const newFaq: YatraFaq = {
                    id: "faq_" + Date.now(),
                    question: "New FAQ Question?",
                    answer: "Detailed answer goes here.",
                  };
                  updateCurrentEvent({ faqs: [...(currentEvent.faqs || []), newFaq] });
                }}
                className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {(currentEvent.faqs || []).map((faq, idx) => (
                <div key={faq.id} className="p-3.5 rounded-xl border bg-surface/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = currentEvent.faqs.map((f) =>
                          f.id === faq.id ? { ...f, question: e.target.value } : f
                        );
                        updateCurrentEvent({ faqs: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs font-bold border rounded-lg bg-white"
                      placeholder="Question..."
                    />
                    <button
                      onClick={() => {
                        const updated = currentEvent.faqs.filter((f) => f.id !== faq.id);
                        updateCurrentEvent({ faqs: updated });
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = currentEvent.faqs.map((f) =>
                        f.id === faq.id ? { ...f, answer: e.target.value } : f
                      );
                      updateCurrentEvent({ faqs: updated });
                    }}
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
                    placeholder="Answer..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Coordinators Contact Cards */}
          <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-display font-bold text-lg text-primary">Yatra Coordinators &amp; Helpdesk</h4>
                <p className="text-xs text-muted-foreground">Contact cards for youth devotees and queries.</p>
              </div>
              <button
                onClick={() => {
                  const newCoord: YatraCoordinator = {
                    id: "coord_" + Date.now(),
                    name: "Coordinator Devotee",
                    role: "Youth Forum Coordinator",
                    phone: "+91 95053 77520",
                    whatsapp: "919505377520",
                  };
                  updateCurrentEvent({ coordinators: [...(currentEvent.coordinators || []), newCoord] });
                }}
                className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Coordinator
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(currentEvent.coordinators || []).map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border bg-surface/50 space-y-2 relative">
                  <button
                    onClick={() => {
                      const updated = currentEvent.coordinators.filter((co) => co.id !== c.id);
                      updateCurrentEvent({ coordinators: updated });
                    }}
                    className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => {
                      const updated = currentEvent.coordinators.map((co) =>
                        co.id === c.id ? { ...co, name: e.target.value } : co
                      );
                      updateCurrentEvent({ coordinators: updated });
                    }}
                    className="w-full px-2.5 py-1 text-xs font-bold border rounded-lg bg-white"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={c.role}
                    onChange={(e) => {
                      const updated = currentEvent.coordinators.map((co) =>
                        co.id === c.id ? { ...co, role: e.target.value } : co
                      );
                      updateCurrentEvent({ coordinators: updated });
                    }}
                    className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={c.phone}
                    onChange={(e) => {
                      const updated = currentEvent.coordinators.map((co) =>
                        co.id === c.id ? { ...co, phone: e.target.value, whatsapp: e.target.value.replace(/\D/g, "") } : co
                      );
                      updateCurrentEvent({ coordinators: updated });
                    }}
                    className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white"
                    placeholder="Phone"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW YATRA EVENT CREATION */}
      {/* ========================================================================= */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary">Create New Yatra Edition</h4>
              <button onClick={() => setIsCreatingEvent(false)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Yatra Year</label>
                <input
                  type="number"
                  value={newEventYear}
                  onChange={(e) => setNewEventYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder={`Annual Youth Yatra ${newEventYear}`}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cloneCheck"
                  checked={cloneFromActive}
                  onChange={(e) => setCloneFromActive(e.target.checked)}
                  className="h-4 w-4 rounded text-primary"
                />
                <label htmlFor="cloneCheck" className="text-xs text-muted-foreground cursor-pointer">
                  Clone itinerary &amp; template data from active {currentEvent.year} edition
                </label>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsCreatingEvent(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button onClick={handleCreateNewEvent} className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90">
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW FULL DEVOTEE REGISTRATION & PAYMENT PROOF */}
      {/* ========================================================================= */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                  {selectedReg.id}
                </span>
                <h4 className="font-display font-bold text-xl text-primary mt-1">{selectedReg.fullName}</h4>
              </div>
              <button onClick={() => setSelectedReg(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-surface">
                <div>
                  <span className="text-muted-foreground">Age / Gender:</span>
                  <div className="font-bold">{selectedReg.age} yrs • {selectedReg.gender}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">City:</span>
                  <div className="font-bold">{selectedReg.city}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="font-bold text-primary">{selectedReg.phone}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-bold">{selectedReg.email || "N/A"}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface space-y-1">
                <div className="font-bold text-primary">Emergency Contact</div>
                <div>{selectedReg.emergencyContactName} ({selectedReg.emergencyContactRelation}) - {selectedReg.emergencyContactPhone}</div>
              </div>

              <div className="p-3 rounded-2xl bg-surface space-y-1">
                <div className="font-bold text-primary">Preferences &amp; Category</div>
                <div>Category: <strong>{selectedReg.registrationCategory}</strong></div>
                <div>Accommodation: {selectedReg.accommodationRequired ? "Required ✓" : "Not required"}</div>
                {selectedReg.specialRequirements && <div>Notes: {selectedReg.specialRequirements}</div>}
              </div>

              {/* Payment Proof Section */}
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Payment: ₹{selectedReg.amountPaid}</span>
                  <span className="font-bold uppercase text-[10px] bg-purple-200 px-2 py-0.5 rounded-full">
                    {selectedReg.paymentStatus}
                  </span>
                </div>
                {selectedReg.transactionId && <div>UTR / Transaction ID: <strong className="font-mono">{selectedReg.transactionId}</strong></div>}

                {selectedReg.paymentScreenshotUrl && (
                  <div className="mt-2">
                    <span className="text-muted-foreground block mb-1 font-semibold">Payment Receipt Screenshot:</span>
                    <a href={selectedReg.paymentScreenshotUrl} target="_blank" rel="noreferrer">
                      <img
                        src={selectedReg.paymentScreenshotUrl}
                        alt="Proof"
                        className="max-h-48 rounded-xl border object-contain bg-white"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <a
                href={`https://wa.me/${selectedReg.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hare Krishna ${selectedReg.fullName} ji! 🙏 Regarding your Youth Yatra Registration (${selectedReg.id})...`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Devotee
              </a>

              <div className="flex items-center gap-2">
                {selectedReg.paymentStatus === "pending" && (
                  <button
                    onClick={() => {
                      updateYatraRegistrationStatus(selectedReg.id, "confirmed", "verified");
                      setSelectedReg({ ...selectedReg, status: "confirmed", paymentStatus: "verified" });
                      toast.success("Payment verified!");
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
                  >
                    Mark Verified
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TIMELINE DAY EDITOR */}
      {/* ========================================================================= */}
      {isDayModalOpen && editingDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary">
                Edit Day {editingDay.dayNumber} Itinerary
              </h4>
              <button onClick={() => setIsDayModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Day Number</label>
                  <input
                    type="number"
                    value={editingDay.dayNumber}
                    onChange={(e) => setEditingDay({ ...editingDay, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input
                    type="text"
                    value={editingDay.date}
                    onChange={(e) => setEditingDay({ ...editingDay, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Day Title</label>
                <input
                  type="text"
                  value={editingDay.title}
                  onChange={(e) => setEditingDay({ ...editingDay, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editingDay.location}
                  onChange={(e) => setEditingDay({ ...editingDay, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Morning Program / Sadhana</label>
                <textarea
                  rows={2}
                  value={editingDay.morningProgram || ""}
                  onChange={(e) => setEditingDay({ ...editingDay, morningProgram: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Travel &amp; Sightseeing Details</label>
                <textarea
                  rows={2}
                  value={editingDay.travelDetails || ""}
                  onChange={(e) => setEditingDay({ ...editingDay, travelDetails: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Gita Session / Workshop</label>
                <textarea
                  rows={2}
                  value={editingDay.sessions || ""}
                  onChange={(e) => setEditingDay({ ...editingDay, sessions: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Accommodation</label>
                  <input
                    type="text"
                    value={editingDay.accommodation || ""}
                    onChange={(e) => setEditingDay({ ...editingDay, accommodation: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Prasadam Meals</label>
                  <input
                    type="text"
                    value={editingDay.meals || ""}
                    onChange={(e) => setEditingDay({ ...editingDay, meals: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsDayModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  const exists = currentEvent.timeline.some((d) => d.id === editingDay.id);
                  const rawList = exists
                    ? currentEvent.timeline.map((d) => (d.id === editingDay.id ? editingDay : d))
                    : [...currentEvent.timeline, editingDay];

                  const sortedTimeline = rawList
                    .sort((a, b) => a.dayNumber - b.dayNumber)
                    .map((d, idx) => ({ ...d, dayNumber: idx + 1 }));

                  const totalDays = sortedTimeline.length;
                  const totalNights = Math.max(1, totalDays - 1);
                  const durationText = `${totalDays} Days & ${totalNights} Nights`;
                  const updatedTagline = currentEvent.tagline.replace(/\b\d+-Day\b/gi, `${totalDays}-Day`);

                  updateCurrentEvent({
                    timeline: sortedTimeline,
                    durationText,
                    tagline: updatedTagline,
                  });
                  setIsDayModalOpen(false);
                  toast.success(`Day saved! Yatra duration synced to ${durationText}.`);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90 cursor-pointer"
              >
                Save Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PLACE / DESTINATION EDITOR */}
      {/* ========================================================================= */}
      {isPlaceModalOpen && editingPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary">
                Edit Destination Place
              </h4>
              <button onClick={() => setIsPlaceModalOpen(false)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Place / Temple Name</label>
                <input
                  type="text"
                  value={editingPlace.name}
                  onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingPlace.tagline || ""}
                  onChange={(e) => setEditingPlace({ ...editingPlace, tagline: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingPlace.description}
                  onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPlace.image}
                    onChange={(e) => setEditingPlace({ ...editingPlace, image: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                  <label className="px-3 py-1.5 rounded-xl bg-surface border hover:bg-muted cursor-pointer shrink-0 text-xs font-semibold flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, (url) => setEditingPlace({ ...editingPlace, image: url }));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Visit Date / Day</label>
                  <input
                    type="text"
                    value={editingPlace.visitDate || ""}
                    onChange={(e) => setEditingPlace({ ...editingPlace, visitDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Distance / Travel Info</label>
                  <input
                    type="text"
                    value={editingPlace.distanceInfo || ""}
                    onChange={(e) => setEditingPlace({ ...editingPlace, distanceInfo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Google Maps Location Link</label>
                <input
                  type="text"
                  value={editingPlace.mapLocationUrl || ""}
                  onChange={(e) => setEditingPlace({ ...editingPlace, mapLocationUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsPlaceModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  const exists = currentEvent.places.some((p) => p.id === editingPlace.id);
                  const updatedPlaces = exists
                    ? currentEvent.places.map((p) => (p.id === editingPlace.id ? editingPlace : p))
                    : [...currentEvent.places, editingPlace];
                  updateCurrentEvent({ places: updatedPlaces });
                  setIsPlaceModalOpen(false);
                  toast.success("Place saved.");
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90"
              >
                Save Destination Place
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VEHICLE / COACH FLEET MODAL */}
      {/* ========================================================================= */}
      {isVehicleModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Bus className="h-5 w-5 text-secondary" /> {editingVehicle.id ? "Edit Vehicle / Coach" : "Add Vehicle"}
              </h4>
              <button onClick={() => setIsVehicleModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Vehicle Name / Label</label>
                  <input
                    type="text"
                    value={editingVehicle.vehicleName}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, vehicleName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-bold"
                    placeholder="e.g. Coach #1 — Luxury AC BharatBenz"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Transit Vehicle Type</label>
                  <select
                    value={editingVehicle.type}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-semibold cursor-pointer"
                  >
                    <option value="AC Luxury Coach">AC Luxury Coach (BharatBenz / Volvo)</option>
                    <option value="AC Sleeper Bus">AC Sleeper Bus</option>
                    <option value="AC Semi-Sleeper">AC Semi-Sleeper Coach</option>
                    <option value="Train (3AC / Sleeper)">Train (3AC / Sleeper)</option>
                    <option value="Tempo Traveller">Tempo Traveller (12-26 Seater)</option>
                    <option value="Flight">Flight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Reg Plate / Train No.</label>
                  <input
                    type="text"
                    value={editingVehicle.registrationNumber}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold"
                    placeholder="e.g. AP 21 TZ 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    value={editingVehicle.seatCapacity}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, seatCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Assigned Batch</label>
                  <input
                    type="text"
                    value={editingVehicle.batchTag}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, batchTag: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-bold text-emerald-700"
                    placeholder="e.g. Batch A (Boys)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Driver / Captain Name</label>
                  <input
                    type="text"
                    value={editingVehicle.driverName}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, driverName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                    placeholder="e.g. M. Srinivas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Driver Phone Number</label>
                  <input
                    type="tel"
                    value={editingVehicle.driverPhone}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
                    placeholder="e.g. +91 98480 12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Coach In-Charge Devotee</label>
                  <input
                    type="text"
                    value={editingVehicle.coachInChargeName}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, coachInChargeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                    placeholder="e.g. Ramanuja Dasa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">In-Charge Phone Number</label>
                  <input
                    type="tel"
                    value={editingVehicle.coachInChargePhone}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, coachInChargePhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
                    placeholder="e.g. +91 95053 77520"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Onboard Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={(editingVehicle.amenities || []).join(", ")}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      amenities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="e.g. AC Air-Suspension, 2+2 Pushback, Mobile Charging, Kirtan Sound System"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Special Notes</label>
                <textarea
                  rows={2}
                  value={editingVehicle.notes || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="e.g. First aid kit stored under seat #1. Front row reserved for senior devotees."
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsVehicleModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  const currentVehicles = currentEvent.travelConfig?.vehicles || [];
                  const exists = currentVehicles.some((v) => v.id === editingVehicle.id);
                  const updatedV = exists
                    ? currentVehicles.map((v) => (v.id === editingVehicle.id ? editingVehicle : v))
                    : [...currentVehicles, editingVehicle];
                  updateCurrentEvent({
                    travelConfig: {
                      ...(currentEvent.travelConfig as any),
                      vehicles: updatedV,
                    },
                  });
                  setIsVehicleModalOpen(false);
                  toast.success("Vehicle saved.");
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90 cursor-pointer"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEPARTURE STEP MODAL */}
      {/* ========================================================================= */}
      {isTravelStepModalOpen && editingTravelStep && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Navigation className="h-5 w-5 text-secondary" /> Edit Departure Step
              </h4>
              <button onClick={() => setIsTravelStepModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Step #</label>
                  <input
                    type="number"
                    value={editingTravelStep.stepNumber}
                    onChange={(e) => setEditingTravelStep({ ...editingTravelStep, stepNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={editingTravelStep.time}
                    onChange={(e) => setEditingTravelStep({ ...editingTravelStep, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold"
                    placeholder="e.g. 05:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Step Title</label>
                <input
                  type="text"
                  value={editingTravelStep.title}
                  onChange={(e) => setEditingTravelStep({ ...editingTravelStep, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl font-bold"
                  placeholder="e.g. Reporting at ISKCON Kurnool Main Altar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location Landmark</label>
                <input
                  type="text"
                  value={editingTravelStep.location}
                  onChange={(e) => setEditingTravelStep({ ...editingTravelStep, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="e.g. Sri Sri Puri Jagannath Temple, Kurnool"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Step Description</label>
                <textarea
                  rows={3}
                  value={editingTravelStep.description}
                  onChange={(e) => setEditingTravelStep({ ...editingTravelStep, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="Describe step details clearly for pilgrims..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={editingTravelStep.instructions || ""}
                  onChange={(e) => setEditingTravelStep({ ...editingTravelStep, instructions: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="e.g. Have digital boarding pass QR ready on phone."
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsTravelStepModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  const currentSteps = currentEvent.travelConfig?.stepByStepGuide || [];
                  const exists = currentSteps.some((s) => s.id === editingTravelStep.id);
                  const updatedS = exists
                    ? currentSteps.map((s) => (s.id === editingTravelStep.id ? editingTravelStep : s))
                    : [...currentSteps, editingTravelStep];
                  updateCurrentEvent({
                    travelConfig: {
                      ...(currentEvent.travelConfig as any),
                      stepByStepGuide: updatedS,
                    },
                  });
                  setIsTravelStepModalOpen(false);
                  toast.success("Departure step saved.");
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90 cursor-pointer"
              >
                Save Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PICKUP POINT MODAL */}
      {/* ========================================================================= */}
      {isPickupModalOpen && editingPickup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" /> Edit En-Route Pickup Point
              </h4>
              <button onClick={() => setIsPickupModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Pickup Location Name</label>
                <input
                  type="text"
                  value={editingPickup.location}
                  onChange={(e) => setEditingPickup({ ...editingPickup, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl font-bold"
                  placeholder="e.g. Dhone Bypass Junction"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Expected Pickup Time</label>
                <input
                  type="text"
                  value={editingPickup.time}
                  onChange={(e) => setEditingPickup({ ...editingPickup, time: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold"
                  placeholder="e.g. 06:45 AM"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Landmark / Stop Description</label>
                <input
                  type="text"
                  value={editingPickup.landmark}
                  onChange={(e) => setEditingPickup({ ...editingPickup, landmark: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                  placeholder="e.g. Hotel Haritha / AP Tourism Crossing"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsPickupModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  const currentPickups = currentEvent.travelConfig?.pickupPoints || [];
                  const exists = currentPickups.some((p) => p.id === editingPickup.id);
                  const updatedP = exists
                    ? currentPickups.map((p) => (p.id === editingPickup.id ? editingPickup : p))
                    : [...currentPickups, editingPickup];
                  updateCurrentEvent({
                    travelConfig: {
                      ...(currentEvent.travelConfig as any),
                      pickupPoints: updatedP,
                    },
                  });
                  setIsPickupModalOpen(false);
                  toast.success("Pickup point saved.");
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90 cursor-pointer"
              >
                Save Pickup Point
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
