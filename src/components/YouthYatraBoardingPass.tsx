import { useState } from "react";
import { YatraEvent, YatraRegistration } from "@/context/AdminContext";
import {
  CheckCircle2,
  Download,
  Share2,
  MessageCircle,
  Printer,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CreditCard,
  Compass,
  Sparkles,
  Award,
  Check,
  QrCode,
  ArrowRight,
  Phone,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface YouthYatraBoardingPassProps {
  registration: YatraRegistration;
  event: YatraEvent;
  onRegisterAnother?: () => void;
}

export default function YouthYatraBoardingPass({
  registration,
  event,
  onRegisterAnother,
}: YouthYatraBoardingPassProps) {
  const [copied, setCopied] = useState(false);

  // Mask phone for privacy in boarding pass display
  const maskPhone = (ph: string) => {
    if (!ph || ph.length < 8) return ph;
    const clean = ph.replace(/\s+/g, "");
    return `${clean.slice(0, 4)} *** **${clean.slice(-2)}`;
  };

  const regYear = event.year || new Date().getFullYear();
  const shortYear = String(regYear).slice(-2);
  const regId = registration.id || `YY${shortYear}-00001`;
  const boardingPassId = registration.boardingPassId || `BP${shortYear}-00001`;

  // QR Code URL encoding strictly the unique identifier
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    regId
  )}`;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyDetails = () => {
    const text = `ISKCON KURNOOL YOUTH YATRA BOARDING PASS\n===================================\nEvent: ${event.title}\nPassenger: ${registration.fullName}\nReg ID: ${regId}\nBoarding Pass ID: ${boardingPassId}\nBatch: ${registration.batch || "Batch A"}\nSeat: #${registration.seatNumber || "Assigned"}\nDeparture: ${event.startDate} @ 05:00 AM\nReporting: ISKCON Kurnool Main Altar\nStatus: CONFIRMED / PAID`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Boarding pass details copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `*🎟️ ISKCON KURNOOL — YOUTH YATRA BOARDING PASS*\n\n🚩 *Event:* ${event.title}\n👤 *Passenger:* ${registration.fullName}\n🎫 *Reg ID:* ${regId}\n🚌 *Batch:* ${registration.batch || "Batch A"}\n💺 *Seat:* #${registration.seatNumber || "Assigned"}\n🗓️ *Dates:* ${event.startDate} to ${event.endDate}\n⏰ *Reporting:* 5:00 AM @ ISKCON Kurnool Temple\n\n_Hare Krishna! See you on the spiritual journey!_ 🙏`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in print:m-0 print:p-0">
      {/* Top Congratulatory Header */}
      <div className="text-center space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-widest shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          REGISTRATION CONFIRMED 🎉
        </div>
        <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-primary">
          Your Youth Yatra Boarding Pass is Ready!
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Please download, screenshot, or print this boarding pass. Present the QR code at the temple check-in desk on departure morning.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* MAIN DIGITAL BOARDING PASS (AIRLINE / SACRED DHAM STYLING) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-2 border-amber-400/80 overflow-hidden relative text-slate-900 print:border-none print:shadow-none">
        {/* Top Gold Gradient Accent Line */}
        <div className="h-3 bg-gradient-to-r from-purple-800 via-amber-400 via-orange-400 to-purple-900" />

        <div className="flex flex-col lg:flex-row">
          {/* ==================== LEFT / MAIN PASS BODY ==================== */}
          <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
            {/* Pass Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-300 pb-4 sm:pb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-purple-900 to-primary text-amber-300 grid place-items-center font-display font-black text-lg sm:text-xl shadow-md shrink-0">
                  🕉️
                </div>
                <div>
                  <div className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-600">
                    ISKCON Kurnool Youth Forum (IYF)
                  </div>
                  <div className="font-display font-black text-base sm:text-2xl text-purple-950">
                    {event.title}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-100 text-purple-900 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                  PILGRIM PASS
                </span>
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-medium">
                  Edition: {event.year}
                </div>
              </div>
            </div>

            {/* Flight / Circuit Path Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-[#3a1068] to-purple-950 text-white rounded-2xl p-3.5 sm:p-5 shadow-inner flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-4">
                <Compass className="h-32 w-32 text-white" />
              </div>

              <div className="space-y-0.5 sm:space-y-1 relative z-10">
                <div className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  ORIGIN
                </div>
                <div className="font-display font-black text-base sm:text-3xl text-white">
                  KURNOOL
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/70">KNL • AP Temple</div>
              </div>

              <div className="flex flex-col items-center justify-center px-2 sm:px-4 relative z-10 shrink-0">
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold uppercase tracking-wider whitespace-nowrap">
                  {event.durationText}
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400" />
                  <div className="w-6 sm:w-16 border-t-2 border-dashed border-amber-300/80" />
                  <Compass className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-amber-300 animate-spin shrink-0" />
                  <div className="w-6 sm:w-16 border-t-2 border-dashed border-amber-300/80" />
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400" />
                </div>
                <span className="text-[9px] sm:text-[10px] text-white/80 font-mono">AC DELUXE</span>
              </div>

              <div className="space-y-0.5 sm:space-y-1 text-right relative z-10">
                <div className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  DESTINATION
                </div>
                <div className="font-display font-black text-base sm:text-3xl text-white">
                  UDUPI / DHAM
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/70">South Circuit</div>
              </div>
            </div>

            {/* Devotee Passenger Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Passenger Name
                </span>
                <div className="font-display font-extrabold text-sm sm:text-lg text-primary uppercase truncate">
                  {registration.fullName}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Registration ID / PNR
                </span>
                <div className="font-mono font-black text-xs sm:text-sm text-purple-900 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                  {regId}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Boarding ID
                </span>
                <div className="font-mono font-bold text-xs sm:text-sm text-foreground truncate">
                  {boardingPassId}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Age / Gender
                </span>
                <div className="font-bold text-foreground">
                  {registration.age} Yrs • {registration.gender}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Contact Phone
                </span>
                <div className="font-bold text-foreground font-mono">
                  {maskPhone(registration.phone)}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Batch / Coach
                </span>
                <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                  {registration.batch || "Batch A (Coach 1)"}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Assigned Seat
                </span>
                <div className="font-mono font-black text-xs sm:text-sm text-purple-900">
                  Seat #{registration.seatNumber || "01"}
                </div>
              </div>
            </div>

            {/* Travel Logistics Bar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">
                    Reporting Time
                  </div>
                  <div className="font-bold text-foreground">05:00 AM (Mangala Harati)</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">
                    Departure Date
                  </div>
                  <div className="font-bold text-foreground">{event.startDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-amber-700 shrink-0" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">
                    Boarding Point
                  </div>
                  <div className="font-bold text-foreground truncate">
                    ISKCON Kurnool Main Altar
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency & Payment Trust Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t text-muted-foreground">
              <div className="text-[11px] sm:text-xs">
                <strong>Emergency:</strong> {registration.emergencyContactName} (
                {registration.emergencyContactRelation}) •{" "}
                {maskPhone(registration.emergencyContactPhone)}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] sm:text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>PAID: ₹{registration.amountPaid || event.paymentConfig?.fee || 2500}</span>
              </div>
            </div>
          </div>

          {/* ==================== PERFORATED TEAR-OFF DIVIDER ==================== */}
          <div className="relative flex lg:flex-col items-center justify-center bg-white my-1 lg:my-0">
            {/* Top and Bottom Circular Notches for desktop */}
            <div className="hidden lg:block absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-100 border-b-2 border-amber-400 z-10" />
            <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-100 border-t-2 border-amber-400 z-10" />

            {/* Horizontal Notches for mobile */}
            <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-100 border-r-2 border-amber-400 z-10" />
            <div className="lg:hidden absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-100 border-l-2 border-amber-400 z-10" />

            {/* Perforated Dotted Line */}
            <div className="w-full lg:w-0 lg:h-full border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-amber-300" />
          </div>

          {/* ==================== RIGHT / TEAR-OFF COUNTERFOIL STUB ==================== */}
          <div className="w-full lg:w-80 bg-slate-50/90 p-5 sm:p-8 flex flex-col justify-between items-center text-center space-y-4 sm:space-y-5">
            <div className="space-y-1 w-full">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
                BOARDING STUB
              </div>
              <div className="font-display font-bold text-sm sm:text-base text-purple-950 truncate">
                {registration.fullName}
              </div>
              <div className="font-mono font-extrabold text-xs text-purple-900 bg-amber-200/70 px-2.5 py-0.5 rounded-md inline-block">
                {regId}
              </div>
            </div>

            {/* Scannable Dynamic QR Code */}
            <div className="bg-white p-3 rounded-2xl border-2 border-purple-200 shadow-sm space-y-1 flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${regId}`}
                className="h-32 w-32 sm:h-36 sm:w-36 object-contain rounded-lg"
              />
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Scan for Boarding
              </div>
            </div>

            {/* Quick Details Stub */}
            <div className="w-full text-left bg-white p-3 rounded-xl border text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coach:</span>
                <span className="font-bold">{registration.batch?.split(" ")[0] || "Batch A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seat:</span>
                <span className="font-mono font-bold">#{registration.seatNumber || "01"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gate:</span>
                <span className="font-bold text-primary">Main Altar</span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground font-serif italic">
              Hare Krishna! Divine Pilgrimage Blessings 🙏
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION TOOLBAR: PRINT, DOWNLOAD, WHATSAPP, REGISTER ANOTHER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" /> Share on WhatsApp
        </button>

        <button
          type="button"
          onClick={handleCopyDetails}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border bg-white hover:bg-muted text-foreground font-semibold text-xs sm:text-sm transition cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Pass Text"}
        </button>

        {onRegisterAnother && (
          <button
            type="button"
            onClick={onRegisterAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border bg-white hover:bg-muted text-foreground font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            Register Another Participant
          </button>
        )}
      </div>
    </div>
  );
}
