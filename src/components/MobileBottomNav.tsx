import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sun, Heart, Tv, Menu, Radio } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { liveProgrammes } = useAdmin();

  // Check if there is an active Live broadcast
  const isCurrentlyLive = (() => {
    if (!liveProgrammes || !liveProgrammes.enabled) return false;
    const nowMs = Date.now();
    const list = (liveProgrammes.programmes || []).filter((p) => p.published !== false);
    for (const item of list) {
      if (item.isManualLiveOverride) return true;
      try {
        const [y, m, d] = item.date.split("-").map(Number);
        const [sh, sm] = (item.startTime || "00:00").split(":").map(Number);
        const [eh, em] = (item.endTime || "23:59").split(":").map(Number);

        const startMs = new Date(y, m - 1, d, sh, sm, 0).getTime();
        const endMs = new Date(y, m - 1, d, eh, em, 0).getTime();

        if (nowMs >= startMs && nowMs < endMs) {
          return true;
        }
      } catch {}
    }
    return false;
  })();

  const handleOpenMenu = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-drawer"));
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}
      aria-label="Mobile Navigation"
    >
      <ul className="flex items-center justify-around px-1 pt-1.5 pb-0.5">
        
        {/* 1. HOME */}
        <li className="flex-1 text-center">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              currentPath === "/" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Home className={`h-5 w-5 mb-0.5 ${currentPath === "/" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] font-medium tracking-tight">Home</span>
          </Link>
        </li>

        {/* 2. DAILY DARSHAN */}
        <li className="flex-1 text-center">
          <Link
            to="/daily-darshan"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              currentPath.startsWith("/daily-darshan") ? "text-primary font-bold" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sun className={`h-5 w-5 mb-0.5 ${currentPath.startsWith("/daily-darshan") ? "stroke-[2.5] text-amber-500 fill-amber-400/30" : ""}`} />
            <span className="text-[10px] font-medium tracking-tight">Darshan</span>
          </Link>
        </li>

        {/* 3. DONATE / SEVAS (CENTER GLOWING BUTTON) */}
        <li className="flex-1 text-center flex justify-center">
          <Link
            to="/donate"
            className="flex flex-col items-center justify-center -mt-5 group active:scale-95 transition-transform"
            aria-label="Donate or Offer Seva"
          >
            <span className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white grid place-items-center shadow-[0_4px_16px_rgba(249,115,22,0.45)] ring-4 ring-white animate-pulse-glow group-hover:scale-105 transition-all">
              <Heart className="h-5.5 w-5.5 fill-white/20 stroke-[2.4] text-white animate-heartbeat" />
            </span>
            <span className="text-[10px] font-bold text-amber-800 tracking-tight mt-0.5">Donate</span>
          </Link>
        </li>

        {/* 4. LIVE / CLASSES */}
        <li className="flex-1 text-center">
          <Link
            to="/courses"
            className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              currentPath.startsWith("/courses") ? "text-primary font-bold" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="relative mb-0.5">
              {isCurrentlyLive ? (
                <>
                  <Radio className="h-5 w-5 text-red-600 animate-pulse stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                </>
              ) : (
                <Tv className={`h-5 w-5 ${currentPath.startsWith("/courses") ? "stroke-[2.5]" : ""}`} />
              )}
            </div>
            <span className={`text-[10px] tracking-tight ${isCurrentlyLive ? "text-red-600 font-extrabold" : "font-medium"}`}>
              {isCurrentlyLive ? "LIVE NOW" : "Live Class"}
            </span>
          </Link>
        </li>

        {/* 5. MENU DRAWER TRIGGER */}
        <li className="flex-1 text-center">
          <button
            type="button"
            onClick={handleOpenMenu}
            className="w-full flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-all active:scale-95 cursor-pointer"
            aria-label="Open Full Menu"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Menu</span>
          </button>
        </li>

      </ul>
    </nav>
  );
}
