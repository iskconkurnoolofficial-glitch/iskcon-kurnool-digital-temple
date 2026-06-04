import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
] as const;

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

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const [lang, setLang] = useState<string>("en");

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

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden />
      <div className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 ${className}`}>
        <Languages className="h-3.5 w-3.5 text-muted-foreground mx-1.5 shrink-0" />
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchTo(l.code)}
            aria-label={`Switch to ${l.name}`}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              lang === l.code
                ? "bg-accent text-white shadow-sm"
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
