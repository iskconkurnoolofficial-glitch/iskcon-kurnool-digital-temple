import { useState, useEffect, useRef } from "react";
import { YatraRegistration } from "@/context/AdminContext";
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import {
  Camera,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Volume2,
  VolumeX,
  ShieldCheck,
  Zap,
  XCircle,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface LiveYatraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: YatraRegistration[];
  onCheckInSuccess: (registration: YatraRegistration) => Promise<any> | void;
  deskStaffName: string;
  onUpdateSeatAndBatch?: (regId: string, batch: string, seatNumber: string) => Promise<void> | void;
}

export default function LiveYatraQrScannerModal({
  isOpen,
  onClose,
  registrations,
  onCheckInSuccess,
  deskStaffName,
  onUpdateSeatAndBatch,
}: LiveYatraQrScannerModalProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<{
    registration: YatraRegistration | null;
    scannedCode: string;
    isNewCheckIn: boolean;
  } | null>(null);
  const [lastScannedError, setLastScannedError] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Inline seat editing within scanner modal
  const [isEditingSeat, setIsEditingSeat] = useState(false);
  const [editSeatNumber, setEditSeatNumber] = useState("");
  const [editBatch, setEditBatch] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef(false);
  const registrationsRef = useRef(registrations);
  registrationsRef.current = registrations;

  // Play pleasant chime on successful scan (Double Tone Harmonious)
  const playSuccessBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  // Play distinctive warning/error buzzer sound for unregistered or invalid QR
  const playErrorBuzzer = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth"; // Distinctive buzzer wave
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext fallback
    }
  };

  // Process and match scanned code
  const handleScannedText = async (decodedText: string) => {
    if (!decodedText || isCooldownRef.current) return;
    const clean = decodedText.trim().toUpperCase();

    // Match by Registration ID, Boarding Pass ID, or Phone Number
    const matched = (registrationsRef.current || []).find(
      (r) =>
        r.id.toUpperCase() === clean ||
        r.boardingPassId?.toUpperCase() === clean ||
        r.phone.replace(/\D/g, "") === clean.replace(/\D/g, "") ||
        clean.includes(r.id.toUpperCase())
    );

    if (matched) {
      isCooldownRef.current = true;
      setLastScannedError(null);
      playSuccessBeep();

      setEditSeatNumber(matched.seatNumber || "01");
      setEditBatch(matched.batch || "Batch A (Coach 1)");
      setIsEditingSeat(false);

      if (!matched.checkedIn) {
        await onCheckInSuccess(matched);
        setLastScannedResult({
          registration: matched,
          scannedCode: clean,
          isNewCheckIn: true,
        });
        toast.success(`🎉 Checked In: ${matched.fullName} (${matched.id})`);
      } else {
        setLastScannedResult({
          registration: matched,
          scannedCode: clean,
          isNewCheckIn: false,
        });
        toast.info(`Already Boarded: ${matched.fullName} at ${new Date(matched.checkedInAt || "").toLocaleTimeString()}`);
      }

      // 2.5s cooldown before next scan
      setTimeout(() => {
        isCooldownRef.current = false;
      }, 2500);
    } else {
      // NOT REGISTERED / INVALID QR
      isCooldownRef.current = true;
      playErrorBuzzer();
      setLastScannedResult(null);
      setLastScannedError({
        code: clean,
        message: "This QR code is NOT REGISTERED in the Yatra database.",
      });
      toast.error(`❌ Not Registered: Code "${clean}" does not exist for this Yatra edition.`);

      // 2.5s cooldown
      setTimeout(() => {
        isCooldownRef.current = false;
      }, 2500);
    }
  };

  // Start Camera with html5-qrcode
  const startScanner = async (cameraIdOrFacingMode?: string) => {
    try {
      setErrorMessage(null);

      // Stop any running scanner first
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }

      const html5QrCode = new Html5Qrcode("yatra-qr-reader");
      scannerRef.current = html5QrCode;

      // Fetch cameras list
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
      }

      const scanConfig: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.75;
          return { width: Math.max(edge, 200), height: Math.max(edge, 200) };
        },
        aspectRatio: 1.0,
      };

      const cameraSource = cameraIdOrFacingMode
        ? { deviceId: { exact: cameraIdOrFacingMode } }
        : { facingMode: "environment" };

      await html5QrCode.start(
        cameraSource,
        scanConfig,
        (decodedText) => {
          handleScannedText(decodedText);
        },
        () => {
          // Ignored per-frame error
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("html5-qrcode start error:", err);
      setIsScanning(false);
      setErrorMessage(
        err?.message || "Camera permission denied or camera not accessible. Please enable permissions."
      );
    }
  };

  // Stop scanner
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      // ignore stop error
    }
    setIsScanning(false);
  };

  // Scan from uploaded file
  const handleImageFileScan = async (file: File) => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("yatra-qr-reader");
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      if (decodedText) {
        handleScannedText(decodedText);
      }
    } catch {
      playErrorBuzzer();
      setLastScannedError({
        code: file.name,
        message: "No valid QR code or registration found in the uploaded image.",
      });
      toast.error("Could not detect a valid QR code in the uploaded image.");
    }
  };

  // Save updated seat number & batch
  const handleSaveSeat = async () => {
    if (!lastScannedResult?.registration || !onUpdateSeatAndBatch) return;
    await onUpdateSeatAndBatch(lastScannedResult.registration.id, editBatch, editSeatNumber);
    setLastScannedResult({
      ...lastScannedResult,
      registration: {
        ...lastScannedResult.registration,
        batch: editBatch,
        seatNumber: editSeatNumber,
      },
    });
    setIsEditingSeat(false);
    toast.success(`Seat #${editSeatNumber} saved for ${lastScannedResult.registration.fullName}`);
  };

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        startScanner(selectedCameraId);
      }, 100);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, selectedCameraId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[2.5rem] max-w-lg w-full p-5 sm:p-7 space-y-4 border border-purple-500/40 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black grid place-items-center text-lg shadow-lg shrink-0">
              📷
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Live Check-In Desk
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-white">
                Live QR Code Scanner
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
              title={soundEnabled ? "Sound ON" : "Sound Muted"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Camera Viewport Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-square w-full border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center">
          {/* Target Element for html5-qrcode */}
          <div id="yatra-qr-reader" className="w-full h-full" />

          {/* Fallback Error Overlay */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3 z-20">
              <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
              <div className="font-bold text-sm text-white">Camera Access Notice</div>
              <p className="text-xs text-white/70 max-w-xs">{errorMessage}</p>
              <button
                type="button"
                onClick={() => startScanner(selectedCameraId)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Camera
              </button>
            </div>
          )}
        </div>

        {/* Camera Selector & Image Upload Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {cameras.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-white/70 font-medium text-[11px]">Camera:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startScanner(e.target.value);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-xs outline-none cursor-pointer"
              >
                {cameras.map((c, idx) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs font-semibold cursor-pointer transition">
            <Upload className="h-3.5 w-3.5" /> Upload Pass Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageFileScan(f);
              }}
            />
          </label>
        </div>

        {/* ========================================================================= */}
        {/* ERROR CARD: UNREGISTERED / INVALID QR CODE */}
        {/* ========================================================================= */}
        {lastScannedError && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500 shadow-2xl space-y-2 animate-scale-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white font-black grid place-items-center text-lg shadow shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <span>❌ NOT REGISTERED / INVALID PASS</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">
                    Scanned Code: <span className="font-mono text-amber-300">"{lastScannedError.code}"</span>
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLastScannedError(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed pl-12">
              {lastScannedError.message} Please check if the devotee registered under a different year or register them at the desk.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUCCESS CARD: SCANNED DEVOTEE RESULT WITH EDITABLE SEAT & COACH */}
        {/* ========================================================================= */}
        {lastScannedResult?.registration && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400 shadow-xl space-y-3 animate-scale-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-slate-950 font-black grid place-items-center text-lg shadow shrink-0">
                  ✅
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                    {lastScannedResult.isNewCheckIn ? "🎉 CHECK-IN CONFIRMED" : "ALREADY BOARDED"}
                  </div>
                  <h4 className="font-display font-bold text-base text-white">
                    {lastScannedResult.registration.fullName}
                  </h4>
                  <div className="text-[11px] text-white/80 font-mono">
                    ID: {lastScannedResult.registration.id} • {lastScannedResult.registration.gender} • {lastScannedResult.registration.phone}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold font-mono">
                {lastScannedResult.registration.batch?.split(" ")[0] || "Coach 1"}
              </span>
            </div>

            {/* Editable Seat & Coach Row */}
            <div className="bg-black/50 p-3 rounded-xl border border-white/15 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/70 font-semibold text-[11px]">Seat & Coach Assignment:</span>
                {!isEditingSeat ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditSeatNumber(lastScannedResult.registration?.seatNumber || "01");
                      setEditBatch(lastScannedResult.registration?.batch || "Batch A (Coach 1)");
                      setIsEditingSeat(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" /> Edit Seat #
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveSeat}
                    className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold cursor-pointer hover:bg-emerald-500"
                  >
                    <Check className="h-3 w-3" /> Save
                  </button>
                )}
              </div>

              {!isEditingSeat ? (
                <div className="flex items-center justify-between font-mono">
                  <div>
                    <span className="text-white/60">Seat: </span>
                    <strong className="text-amber-300 font-bold text-sm">
                      #{lastScannedResult.registration.seatNumber || "01"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-white/60">Coach: </span>
                    <strong className="text-emerald-300 font-bold">
                      {lastScannedResult.registration.batch || "Coach 1"}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-white/70 mb-0.5">Seat Number</label>
                    <input
                      type="text"
                      value={editSeatNumber}
                      onChange={(e) => setEditSeatNumber(e.target.value)}
                      placeholder="e.g. 01, 14A"
                      className="w-full px-2 py-1 bg-white/10 border border-amber-400 rounded-lg text-amber-300 font-mono font-bold text-xs"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/70 mb-0.5">Coach / Batch</label>
                    <select
                      value={editBatch}
                      onChange={(e) => setEditBatch(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-white/20 rounded-lg text-white text-xs font-semibold"
                    >
                      <option value="Batch A (Coach 1 - Boys)">Coach 1 (Boys)</option>
                      <option value="Batch B (Coach 2 - Girls)">Coach 2 (Girls)</option>
                      <option value="Coach 3 (AC Sleeper)">Coach 3 (AC Sleeper)</option>
                      <option value="Coach 4 (Tempo)">Coach 4 (Tempo)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-white/75 bg-white/5 p-2 rounded-xl border border-white/10 flex items-center justify-between">
              <span>Verified by <strong>{deskStaffName}</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Zap className="h-3 w-3" /> Ready for Boarding
              </span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-white/60 font-mono">
            {isScanning ? "🟢 Scanner ready" : "⚪ Scanner stopped"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
