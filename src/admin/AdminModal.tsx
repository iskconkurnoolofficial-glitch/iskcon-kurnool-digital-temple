import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  onSave?: (e: React.FormEvent) => void;
  saveLabel?: string;
  saveIcon?: React.ComponentType<{ className?: string }>;
  isSaving?: boolean;
  saveDisabled?: boolean;
  customFooter?: React.ReactNode;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = "2xl",
  onSave,
  saveLabel = "Save Changes",
  saveIcon: SaveIcon = Check,
  isSaving = false,
  saveDisabled = false,
  customFooter,
}: AdminModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isSaving && onClose()}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className={`relative w-full ${maxWidthMap[maxWidth]} bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[94vh] my-auto`}
          >
            {/* Header */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                {Icon && (
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 shadow-2xs border border-primary/15">
                    <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-xl font-bold text-foreground truncate">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 grid place-items-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            {onSave ? (
              <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
                <div className="px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 overscroll-contain">
                  {children}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  {customFooter ? (
                    customFooter
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving || saveDisabled}
                        className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/90 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <SaveIcon className="h-3.5 w-3.5" /> {saveLabel}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              <>
                <div className="px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 overscroll-contain">
                  {children}
                </div>
                {customFooter && (
                  <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                    {customFooter}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
