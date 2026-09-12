import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { getActiveAdminPinServer } from "@/lib/admin-pin.functions";
import { 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bank-pin")({
  head: () => ({
    meta: [
      { title: "Bank Security PIN — ISKCON Kurnool" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BankPinPage,
});

function BankPinPage() {
  const { authed } = useAdmin();
  const navigate = useNavigate();

  const [activePin, setActivePin] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPin, setShowPin] = useState(true);

  const fetchPin = async () => {
    setBusy(true);
    try {
      const res = await getActiveAdminPinServer();
      if (res && res.pin) {
        setActivePin(res.pin);
      } else {
        setActivePin(null);
      }
    } catch {
      setActivePin(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (authed) {
      fetchPin();
    }
  }, [authed]);

  const handleCopy = () => {
    if (!activePin) return;
    navigator.clipboard.writeText(activePin);
    setCopied(true);
    toast.success("6-Digit PIN copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <Lock className="h-12 w-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold font-display">Authentication Required</h2>
          <p className="text-sm text-slate-300">
            You must be logged into the ISKCON Admin Portal to view security configuration.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-bold text-sm shadow-lg hover:bg-amber-300 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2d1254] via-[#1a0836] to-[#0d031c] text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background glowing ambient orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-white/95 text-slate-900 rounded-3xl border border-white/40 p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl space-y-8 animate-fade-in">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Bank Security PIN
          </span>
        </div>

        {/* Title Area */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 mx-auto">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bank Security PIN
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Active 6-digit PIN generated from the Admin Panel for unlocking <strong className="text-slate-900 font-bold">UPI QR Settings</strong> and <strong className="text-slate-900 font-bold">Bank Details</strong>.
          </p>
        </div>

        {/* PIN Display Box - NO GENERATE BUTTON ON THIS PAGE */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-inner space-y-6 text-center">
          {busy ? (
            <div className="py-8 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-slate-400">Loading PIN status...</p>
            </div>
          ) : activePin ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400">
                  ★ Active Generated 6-Digit Bank PIN
                </span>
                <p className="text-xs text-slate-400">
                  Provide this PIN to the admin user to unlock the sensitive settings.
                </p>
              </div>

              {/* Display Box */}
              <div className="relative bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 flex items-center justify-center gap-2 sm:gap-4 shadow-xl">
                {showPin ? (
                  <div className="flex items-center gap-2 sm:gap-3 tracking-widest font-mono text-3xl sm:text-5xl font-black text-amber-400 select-all">
                    {activePin.split("").map((digit, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-400/10 border border-amber-500/30 rounded-xl px-2 sm:px-4 py-1.5 shadow-sm"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-3xl sm:text-5xl text-slate-600 font-bold">
                    <span>••••••</span>
                  </div>
                )}

                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition p-2 rounded-xl hover:bg-white/5 cursor-pointer"
                  title={showPin ? "Hide digits" : "Show digits"}
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Copy Button Only */}
              <div className="flex justify-center">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition cursor-pointer"
                >
                  {copied ? <Check className="h-4 w-4 stroke-[3]" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy 6-Digit PIN"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <AlertCircle className="h-10 w-10 text-amber-400/70 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base">No Active PIN Generated</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click <strong className="text-amber-300 font-bold">"Generate PIN"</strong> inside the Admin Panel to generate a 6-digit PIN.
                </p>
              </div>
              <button
                onClick={fetchPin}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-300 transition pt-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
              </button>
            </div>
          )}
        </div>

        {/* Security Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-950">Single-Use Security Note</h4>
            <p className="text-amber-800/90 leading-relaxed">
              Once an admin user enters this PIN and unlocks the section, the PIN is <strong className="font-bold text-amber-950">automatically consumed and invalidated</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
