import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";

const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
] as const;

const listVariants = {
  open: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 }
  },
  closed: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 }
  }
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  closed: {
    y: -15,
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function setGoogTrans(lang: string) {
  // googtrans cookie format: /<source>/<target>
  const value = lang === "en" ? "" : `/en/${lang}`;
  const domains = [
    window.location.hostname,
    "." + window.location.hostname,
    "",
  ];
  domains.forEach((d) => {
    const domainPart = d ? `;domain=${d}` : "";
    if (value) {
      document.cookie = `googtrans=${value};path=/${domainPart}`;
    } else {
      document.cookie = `googtrans=;path=/${domainPart};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
}

let scriptLoaded = false;

function loadGoogleTranslate() {
  if (scriptLoaded || typeof window === "undefined") return;
  scriptLoaded = true;

  (window as any).googleTranslateElementInit = () => {
    const g = (window as any).google;
    if (g?.translate?.TranslateElement) {
      // eslint-disable-next-line no-new
      new g.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element",
      );
    }
  };

  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

export default function LanguageToggle({ 
  className = "", 
  variant = "light",
  layout = "horizontal"
}: { 
  className?: string;
  variant?: "light" | "dark";
  layout?: "horizontal" | "vertical-sticky";
}) {
  const [lang, setLang] = useState<string>("en");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    loadGoogleTranslate();
    const current = getCookie("googtrans");
    if (current && current.includes("/te")) setLang("te");
    else if (current && current.includes("/hi")) setLang("hi");
  }, []);

  const switchTo = (code: string) => {
    if (code === lang) return;
    setLang(code);
    setGoogTrans(code);
    window.location.reload();
  };

  if (layout === "vertical-sticky") {
    return (
      <>
        <div id="google_translate_element" className="hidden" aria-hidden />
        <motion.div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ top: "calc(50vh - 22px)" }}
          animate={{
            height: hovered ? "200px" : "44px",
            backgroundColor: hovered ? "#fbe9cf" : "#ffffff", // transition to brand gold cream
            borderColor: hovered ? "#f5c518" : "#ece6f5",     // transition to brand gold border
          }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed left-0 z-50 flex flex-col items-center bg-white shadow-[2px_0_15px_rgba(91,44,155,0.08)] border border-l-0 w-11 rounded-r-2xl overflow-hidden cursor-pointer p-1 hidden lg:flex"
        >
          {/* Circular icon trigger */}
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <Languages className="h-4.5 w-4.5 text-primary" />
          </div>
          
          {/* Slid-out language selector list (top to bottom) */}
          <motion.div
            variants={listVariants}
            initial="closed"
            animate={hovered ? "open" : "closed"}
            className="flex flex-col items-center gap-1.5 w-full mt-1 shrink-0"
          >
            <div className="h-[1px] w-full bg-border/60 mb-1" />
            {LANGS.map((l) => {
              const shortLabel = l.code === "en" ? "EN" : l.code === "te" ? "తె" : "हि";
              return (
                <motion.button
                  key={l.code}
                  variants={itemVariants}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    switchTo(l.code);
                  }}
                  aria-label={`Switch to ${l.name}`}
                  className={`w-8 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all duration-200 ${
                    lang === l.code
                      ? "bg-accent text-white shadow-sm scale-105"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:scale-105"
                  }`}
                >
                  {shortLabel}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden />
      <div className={`inline-flex items-center rounded-full border p-0.5 transition-colors ${
        variant === "dark" 
          ? "border-white/10 bg-white/5 text-white" 
          : "border-border bg-surface"
      } ${className}`}>
        <Languages className={`h-3.5 w-3.5 mx-1.5 shrink-0 ${
          variant === "dark" ? "text-white/60" : "text-muted-foreground"
        }`} />
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchTo(l.code)}
            aria-label={`Switch to ${l.name}`}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              lang === l.code
                ? "bg-accent text-white shadow-sm"
                : variant === "dark"
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-primary"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </>
  );
}
