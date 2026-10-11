import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  Heart, 
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface DeveloperCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperCreditModal({ isOpen, onClose }: DeveloperCreditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const phoneNumber = "+917013906671";
  const displayPhone = "+91 70139 06671";
  const whatsappUrl = `https://wa.me/917013906671?text=${encodeURIComponent("Hare Krishna Devesh! I visited the ISKCON Kurnool digital website.")}`;

  const handleCopyPhone = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      toast.success("Phone number copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="dev-modal-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-b from-[#1b0826] via-[#240b33] to-[#12041a] text-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_30px_rgba(236,72,153,0.2)] border-2 border-amber-300/40 overflow-hidden z-10"
          >
            {/* Ambient Background Aura Lights */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-44 bg-gradient-to-b from-amber-400/25 via-pink-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-0 w-60 h-44 bg-gradient-to-t from-fuchsia-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Sacred Eyebrow Badge */}
            <div className="flex items-center justify-center mb-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/40 text-amber-200 text-[11px] font-bold tracking-widest uppercase backdrop-blur-md shadow-xs">
                <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                <span>Devotional Tech Craftsmanship</span>
              </div>
            </div>

            {/* Website Identity Title */}
            <div className="text-center relative z-10 mb-5">
              <h3 
                id="dev-modal-title"
                className="font-display text-2xl sm:text-[26px] font-black tracking-tight leading-tight bg-gradient-to-r from-amber-100 via-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
              >
                ISKCON Kurnool Website
              </h3>
              <p className="text-pink-200/80 text-xs mt-1 font-medium tracking-wide">
                Sri Sri Puri Jagannath Mandir • Official Portal
              </p>
            </div>

            {/* Developer Card Surface */}
            <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border border-white/15 shadow-inner mb-5">
              <div className="flex items-center gap-3.5 mb-3">
                {/* Monogram Avatar with Verified Glow */}
                <div className="relative shrink-0">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-600 p-[2px] shadow-[0_4px_16px_rgba(245,158,11,0.45)]">
                    <div className="w-full h-full rounded-[14px] bg-[#1a0824] flex items-center justify-center font-display font-black text-amber-200 text-lg tracking-wider">
                      KD
                    </div>
                  </div>
                  {/* Verified Devotional Tick */}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1a0824] flex items-center justify-center shadow-xs">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-pink-300/90 flex items-center gap-1">
                    <span>Designed &amp; Developed by</span>
                    <Heart className="h-3 w-3 fill-rose-500 text-rose-500 inline-block animate-pulse" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight truncate font-sans">
                    Kamisetty Devesh Kumar
                  </h4>
                </div>
              </div>

              {/* Developer Quote / Dedication */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11.5px] text-pink-100/85 leading-relaxed font-sans">
                "Humbly developed for the digital propagation of Krishna Consciousness and transcendental temple sevas."
              </div>
            </div>

            {/* Quick Contact & Interaction Actions */}
            <div className="relative z-10 space-y-2.5">
              {/* WhatsApp Direct Chat Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-[0_4px_18px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {/* Official WhatsApp SVG Icon */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 1.932.551 3.738 1.503 5.275L2 22l4.85-1.467c1.477.869 3.208 1.365 5.15 1.365 5.523 0 10-4.484 10-10.017C22 6.484 17.523 2 12 2zm0 18.25c-1.684 0-3.245-.487-4.56-1.328l-.328-.208-2.709.818.828-2.646-.226-.345c-.947-1.445-1.455-3.136-1.455-4.874 0-4.664 3.794-8.458 8.45-8.458 4.656 0 8.45 3.794 8.45 8.458 0 4.664-3.794 8.458-8.45 8.458z" />
                </svg>
                <span>Connect on WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Phone Direct Call & Copy Split Row */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 transition-all hover:border-amber-300/50 active:scale-98"
                >
                  <Phone className="h-4 w-4 text-amber-300 shrink-0" />
                  <span className="tracking-wide">{displayPhone}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  aria-label="Copy phone number"
                  title="Copy number"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/15 transition-all hover:border-amber-300/50 active:scale-90 cursor-pointer shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                  ) : (
                    <Copy className="h-4 w-4 text-amber-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer Bottom Note */}
            <div className="mt-5 pt-3.5 border-t border-white/10 text-center relative z-10">
              <p className="text-[11px] text-pink-200/60 font-medium">
                ISKCON Digital Evangelism • Kurnool, Andhra Pradesh
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
