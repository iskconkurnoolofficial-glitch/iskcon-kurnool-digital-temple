import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Check, Download, MessageCircle, ShieldCheck, Phone, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

export interface OnboardingData {
  paymentId: string;
  amount: number;
  date: string;
  patronName: string;
  patronPhone: string;
  patronEmail?: string;
  patronCity?: string;
  tierName: string;
}

interface Props {
  data: OnboardingData | null;
  onClose: () => void;
  onGenerateReceipt: (data: OnboardingData) => void;
}

export default function LifePatronOnboardingModal({ data, onClose, onGenerateReceipt }: Props) {
  const { lifePatron, settings } = useAdmin();

  useEffect(() => {
    if (data) {
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        colors: ["#f5c518", "#f97316", "#eab308", "#ffffff", "#ec4899", "#10b981"],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [data]);

  if (!data) return null;

  const handleDownloadApplicationPdf = () => {
    const pdfUrl = lifePatron.applicationPdfUrl;
    
    if (pdfUrl && pdfUrl.startsWith("http")) {
      window.open(pdfUrl, "_blank");
    } else {
      const content = `=====================================================
ISKCON KURNOOL - LIFE PATRON MEMBERSHIP APPLICATION FORM
Sri Sri Jagannath Baladev Subhadra Temple, Kurnool, Andhra Pradesh
=====================================================

PATRON DETAILS:
Full Name: ${data.patronName || "Sri Devotee Patron"}
Phone / WhatsApp: ${data.patronPhone || ""}
Email: ${data.patronEmail || "N/A"}
City: ${data.patronCity || "Kurnool"}

PAYMENT CONFIRMATION:
Membership Level: ${data.tierName || "Life Patron"}
Contribution Amount: ₹${(data.amount || 55555).toLocaleString()}
Payment ID / Receipt No: ${data.paymentId || "PAY-LP-880026"}
Date: ${data.date || new Date().toLocaleDateString("en-IN")}

INSTRUCTIONS:
1. Please review and verify your personal details above.
2. Fill in your details / sign the form.
3. Send the completed form on WhatsApp (+91 95053 77520).

Thank you for becoming a valued Life Patron of ISKCON Kurnool!
=====================================================`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ISKCON_Life_Patron_Application_${(data.patronName || "Form").replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success("Downloading Application Form!");
  };

  const handleOnboardingWhatsApp = () => {
    const phoneNum = (lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "");
    const msg = `Hare Krishna 🙏%0AI have successfully completed my ISKCON Kurnool Life Patron Membership payment.%0A%0A*Membership:* ${encodeURIComponent(data.tierName)}%0A*Amount:* ₹${data.amount.toLocaleString()}%0A*Payment ID:* ${encodeURIComponent(data.paymentId)}%0A*Name:* ${encodeURIComponent(data.patronName)}%0A*Phone:* ${encodeURIComponent(data.patronPhone)}%0A%0AI am sending my completed application form for further processing.`;

    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp to submit your completed application form!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 text-slate-100 overflow-hidden my-auto max-h-[92vh] overflow-y-auto space-y-6"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 1. Successful Header */}
          <div className="text-center space-y-3 relative pt-2">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Check className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Life Patron Enrollment Complete</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-amber-300 drop-shadow-md">
                Congratulations, Devotee! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 font-medium max-w-md mx-auto">
                Your Life Patron Membership contribution has been successfully received. Welcome to the ISKCON Global Family!
              </p>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-sm space-y-3 text-left">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-500/20 pb-2">
                <span>Payment Summary</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold text-[10px]">
                  SUCCESSFUL ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">Membership:</span>
                  <span className="font-bold text-white">{data.tierName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Amount Paid:</span>
                  <span className="font-extrabold text-amber-300 text-base font-sans">₹{data.amount.toLocaleString("en-IN")}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-200 text-[11px] sm:text-xs">{data.paymentId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Date:</span>
                  <span className="font-bold text-slate-200">{data.date}</span>
                </div>
              </div>
            </div>

            {/* 2 & 6. Next Step Section */}
            <div className="pt-2 text-left space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-amber-300">
                  One More Step to Complete Your Registration
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-lg mx-auto">
                  Download the application form, fill in your details, and send the completed form to our official WhatsApp number.
                </p>
              </div>

              {/* 3 Step Visual Guide */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs">1</span>
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-200 leading-tight">Download Form</p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs">2</span>
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-200 leading-tight">Fill Details</p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs">3</span>
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-200 leading-tight">Send on WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* MODERN SIMPLE PATRON CARD DISPLAY */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-4 sm:p-5 border border-amber-400/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Ticket className="h-4 w-4 text-amber-400" />
                <span>Official Patron Pass Preview</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Valid Worldwide
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-xl border border-amber-400/50 bg-slate-950 group">
              <img
                src={lifePatron.cardPassImage || lifePatron.heroImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80"}
                alt="Official ISKCON Life Patron Card"
                className="w-full h-64 sm:h-80 md:h-96 object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 sm:p-6 flex flex-col justify-between text-white">
                <div className="flex justify-end items-start">
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-amber-200/90 font-bold uppercase tracking-wider">
                    Patron Name
                  </div>
                  <div className="font-display font-black text-xl sm:text-3xl text-white tracking-wide drop-shadow-lg">
                    {data.patronName}
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-amber-100 font-mono pt-2 border-t border-white/20">
                    <span>ID: {data.paymentId}</span>
                    <span>Date: {data.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Large Premium Download Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-400/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-amber-200">
                    Life Patron Membership Application
                  </h4>
                  <p className="text-[11px] text-amber-100/70 font-mono">
                    {lifePatron.applicationPdfUrl ? "PDF • Application Form" : "Formatted Application Form Document"}
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Official Form
              </span>
            </div>

            {/* Download and WhatsApp Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadApplicationPdf}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
              >
                <Download className="h-4.5 w-4.5" />
                <span>Download Application PDF</span>
              </button>

              <button
                type="button"
                onClick={handleOnboardingWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4.5 w-4.5 text-emerald-200" />
                <span>Continue to WhatsApp →</span>
              </button>
            </div>
          </div>

          {/* AT LAST: GENERATE OFFICIAL RECEIPT BUTTON */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={() => onGenerateReceipt(data)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,197,24,0.35)] hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 border-2 border-amber-300"
            >
              <ShieldCheck className="h-5 w-5 text-slate-950" />
              <span>Generate Official 80G Tax Receipt 📄</span>
            </button>

            <p className="text-[11px] text-center text-amber-200/70">
              Official ISKCON Kurnool 80G tax exemption receipt for your <span className="font-sans font-bold">₹{data.amount.toLocaleString("en-IN")}</span> contribution.
            </p>
          </div>

          {/* Bottom Support Link & Dismiss */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/70 border-t border-white/10 pt-4 gap-3">
            <a
              href={`https://wa.me/${(lifePatron.whatsappNumber || settings.whatsapp || "+919505377520").replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 flex items-center gap-1.5 underline decoration-amber-400/50"
            >
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>Need help? Contact ISKCON Kurnool</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
