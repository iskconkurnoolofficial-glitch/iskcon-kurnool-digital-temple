import React, { useState, useRef, useEffect } from "react";
import { verifyAdminPinServer, generateAdminPinServer } from "@/lib/admin-pin.functions";
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface AdminPinGuardProps {
  children: React.ReactNode;
  sectionTitle?: string;
  sectionDescription?: string;
}

// 10-Minute Session Timeout Config
const SESSION_DURATION_SEC = 10 * 60; // 600 seconds
let globalSessionExpiryTime: number | null = null;

export default function AdminPinGuard({
  children,
  sectionTitle = "UPI Settings & Bank Details",
  sectionDescription = "Authenticate with a single-use 6-digit PIN to access UPI QR settings and bank details.",
}: AdminPinGuardProps) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!globalSessionExpiryTime) return false;
    return Date.now() < globalSessionExpiryTime;
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!globalSessionExpiryTime) return SESSION_DURATION_SEC;
    return Math.max(0, Math.floor((globalSessionExpiryTime - Date.now()) / 1000));
  });

  const [showPinInput, setShowPinInput] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [pin, setPin] = useState<string[]>(Array(6).fill(""));
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input box when fields are shown
  useEffect(() => {
    if (!unlocked && showPinInput && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [unlocked, showPinInput]);

  // 10-Minute Countdown Timer effect
  useEffect(() => {
    if (!unlocked) return;

    const interval = setInterval(() => {
      if (!globalSessionExpiryTime || Date.now() >= globalSessionExpiryTime) {
        globalSessionExpiryTime = null;
        setUnlocked(false);
        setShowPinInput(false);
        setGeneratedPin(null);
        setPin(Array(6).fill(""));
        toast.error("10-minute PIN session expired. Please generate a new PIN to unlock again.");
        clearInterval(interval);
      } else {
        setSecondsLeft(Math.floor((globalSessionExpiryTime - Date.now()) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlocked]);

  const handleGenerateClick = async () => {
    setBusy(true);
    try {
      const res = await generateAdminPinServer();
      if (res.success && res.pin) {
        toast.success("New 6-Digit PIN generated securely on server!");
      }
    } catch {
      // Fallback
    } finally {
      setBusy(false);
      setShowPinInput(true);
    }
  };

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const nextPin = [...pin];
      nextPin[index] = "";
      setPin(nextPin);
      setErrorMsg("");
      return;
    }

    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 6).split("");
      const nextPin = [...pin];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) {
          nextPin[index + i] = digit;
        }
      });
      setPin(nextPin);
      setErrorMsg("");
      const lastFilledIndex = Math.min(index + pastedDigits.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    const nextPin = [...pin];
    nextPin[index] = cleaned;
    setPin(nextPin);
    setErrorMsg("");

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullPin = pin.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullPin.length !== 6) {
      setErrorMsg("Please enter all 6 digits of your PIN.");
      return;
    }

    setBusy(true);
    setErrorMsg("");

    try {
      const res = await verifyAdminPinServer({ data: { pin: fullPin } });
      if (res.ok) {
        globalSessionExpiryTime = Date.now() + SESSION_DURATION_SEC * 1000;
        setSecondsLeft(SESSION_DURATION_SEC);
        setUnlocked(true);
        toast.success("Security PIN verified! Session unlocked for 10 minutes.");
      } else {
        setErrorMsg(res.error || "Invalid 6-digit PIN.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRelock = () => {
    globalSessionExpiryTime = null;
    setUnlocked(false);
    setShowPinInput(false);
    setPin(Array(6).fill(""));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (unlocked) {
    return (
      <div className="space-y-4">
        {/* Unlocked Session Banner with 10-Min Timer */}
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 font-semibold shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <div>
              <span>Authenticated for Sensitive Admin Operations</span>
              <span className="text-[11px] text-emerald-700 font-bold ml-2">
                (Single-use PIN consumed)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold">
              <Clock className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Session Expires in: {formatTimer(secondsLeft)}</span>
            </div>

            <button
              onClick={handleRelock}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Lock Section
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-8 animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-[#2d1254] via-[#1f0b3b] to-[#120426] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/15 relative overflow-hidden space-y-8">
        
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Lock Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl" />
            <div className="relative h-16 w-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 grid place-items-center mx-auto shadow-lg">
              <Lock className="h-8 w-8 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
              Protected Admin Section • 10-Min Session
            </span>
            <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
              {sectionDescription}
            </p>
          </div>
        </div>

        {/* STEP 1: INITIAL SCREEN - ONLY SHOW GENERATE PIN BUTTON */}
        {!showPinInput ? (
          <div className="space-y-6 text-center py-2 animate-fade-in">
            <button
              onClick={handleGenerateClick}
              disabled={busy}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Sparkles className={`h-4.5 w-4.5 text-slate-950 ${busy ? "animate-spin" : ""}`} />
              <span>{busy ? "Generating PIN..." : "Generate 6-Digit PIN"}</span>
            </button>
          </div>
        ) : (
          /* STEP 2: ENTER PIN FIELDS ONLY */
          <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-white/80 font-bold px-1">
                <span>Enter 6-Digit Security PIN:</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-amber-300 hover:text-amber-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPin ? "Hide" : "Show"}</span>
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black bg-white/10 border border-white/20 rounded-2xl text-white focus:bg-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={busy || fullPin.length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-98 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4.5 w-4.5 text-slate-950" />
                <span>{busy ? "Verifying PIN..." : "Authenticate & Access"}</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-amber-300/80">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={busy}
                  className="font-bold hover:text-amber-200 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Generate New PIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPinInput(false);
                    setGeneratedPin(null);
                  }}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
