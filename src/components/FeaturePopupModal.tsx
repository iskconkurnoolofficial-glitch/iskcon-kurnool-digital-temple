import { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { X, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function FeaturePopupModal() {
  const { featurePopup, ready } = useAdmin();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !featurePopup?.active) {
      setOpen(false);
      return;
    }

    // Skip pop-up if user is in admin dashboard
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      setOpen(false);
      return;
    }

    // Check if dismissed in this session
    const dismissedKey = `iskcon_popup_dismissed_${featurePopup.title || "default"}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dismissedKey)) {
      setOpen(false);
      return;
    }

    // Small delay for smooth entry after page load
    const timer = setTimeout(() => {
      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [ready, featurePopup]);

  if (!open || !featurePopup || !featurePopup.active) return null;

  const handleDismiss = () => {
    setOpen(false);
    const dismissedKey = `iskcon_popup_dismissed_${featurePopup.title || "default"}`;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(dismissedKey, "true");
    }
  };

  const isExternalLink = featurePopup.buttonLink?.startsWith("http://") || featurePopup.buttonLink?.startsWith("https://");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={handleDismiss} 
      />

      {/* Popup Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 flex flex-col z-10 animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-20 h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer active:scale-95 shadow-md"
          aria-label="Close Pop-up"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Banner Image (or decorative gradient if no image) */}
        {featurePopup.image ? (
          <div className="relative w-full h-48 sm:h-60 shrink-0 bg-slate-900 overflow-hidden">
            <img 
              src={featurePopup.image} 
              alt={featurePopup.title || "Announcement"} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/95 text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Announcement
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-32 bg-gradient-to-br from-primary via-[#3d1a6a] to-primary p-6 flex flex-col justify-end text-white shrink-0 overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/95 text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm self-start mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Announcement
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4 overflow-y-auto">
          {featurePopup.title && (
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary leading-tight">
              {featurePopup.title}
            </h2>
          )}

          {featurePopup.content && (
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
              {featurePopup.content}
            </div>
          )}

          {/* Action Button & Dismiss options */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            {featurePopup.buttonText && featurePopup.buttonLink ? (
              isExternalLink ? (
                <a
                  href={featurePopup.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDismiss}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#3d1a6a] hover:from-primary/95 hover:to-[#3d1a6a]/95 text-white font-bold text-sm text-center shadow-lg shadow-primary/20 hover:shadow-primary/35 transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>{featurePopup.buttonText}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  to={featurePopup.buttonLink as any}
                  onClick={handleDismiss}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#3d1a6a] hover:from-primary/95 hover:to-[#3d1a6a]/95 text-white font-bold text-sm text-center shadow-lg shadow-primary/20 hover:shadow-primary/35 transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>{featurePopup.buttonText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )
            ) : null}

            <button
              onClick={handleDismiss}
              className={`w-full ${featurePopup.buttonText && featurePopup.buttonLink ? "sm:w-auto px-5" : "w-full"} py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer text-center active:scale-[0.98]`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
