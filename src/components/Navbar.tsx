import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "@tanstack/react-router";
import { 
  Globe, 
  Building, 
  Target, 
  Heart, 
  Clock, 
  Calendar, 
  Sparkles, 
  Leaf, 
  ShoppingBag, 
  Image, 
  Share2, 
  Users, 
  GraduationCap, 
  Moon, 
  Music, 
  BookOpen, 
  ChevronDown, 
  Menu, 
  X,
  Youtube, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Bell,
  Home,
  Compass,
  Sun
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import LiveClassBanner from "@/components/LiveClassBanner";
import LanguageToggle from "@/components/LanguageToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveClass } from "@/hooks/useLiveClass";
import { isTimeStrLive } from "@/lib/scheduleUtils";
import { safeUrl } from "@/lib/utils";

type SubItem = { 
  label: string; 
  href: string; 
  subtitle: string; 
  icon: React.ComponentType<{ className?: string }> 
};

type NavItem = { 
  label: string; 
  href?: string; 
  children?: SubItem[] 
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", children: [
    { label: "About ISKCON", href: "/about/iskcon", subtitle: "Our global spiritual movement", icon: Globe },
    { label: "ISKCON Kurnool", href: "/about/kurnool", subtitle: "Our local temple community", icon: Building },
    { label: "Our Mission", href: "/about/mission", subtitle: "Spiritual education & food relief", icon: Target },
    { label: "Founder Acharya", href: "/about/founder", subtitle: "His Divine Grace Srila Prabhupada", icon: Heart },
  ]},
  { label: "Temple", children: [
    { label: "Daily Darshan", href: "/daily-darshan", subtitle: "Today's deity sringara & blessings", icon: Sun },
    { label: "Temple Timings", href: "/temple", subtitle: "Daily Darshan & Aarti schedules", icon: Clock },
    { label: "Sunday Program", href: "/temple/sunday", subtitle: "Weekly feast, kirtan & lecture", icon: Calendar },
    { label: "Upcoming Festivals", href: "/festivals", subtitle: "Celebrate sacred days with us", icon: Sparkles },
    { label: "Goshala", href: "/goshala", subtitle: "Cow protection & service", icon: Leaf },
    { label: "Shop", href: "/shop", subtitle: "Devotional books & puja items", icon: ShoppingBag },
  ]},
  { label: "Media", children: [
    { label: "Daily Darshan", href: "/daily-darshan", subtitle: "Daily high-res deity photos", icon: Sun },
    { label: "Gallery", href: "/gallery", subtitle: "Photos of deities, events & festivals", icon: Image },
    { label: "Social Media", href: "/social-media", subtitle: "Connect with us online", icon: Share2 },
  ]},
  { label: "Activities", children: [
    { label: "Annual Youth Yatra", href: "/youth-yatra", subtitle: "5-day sacred youth pilgrimage", icon: Compass },
    { label: "House Programmes", href: "/house-programmes", subtitle: "Devotional gatherings at your home", icon: Home },
    { label: "Youth Program", href: "/youth", subtitle: "Inspiring the next generation", icon: Users },
    { label: "Prahlada Badi", href: "/prahlada-badi", subtitle: "Spiritual education for children", icon: GraduationCap },
    { label: "Ekadashi Vratam", href: "/ekadashi", subtitle: "Fast days & spiritual guidance", icon: Moon },
    { label: "Hari Nama Sankeerthana", href: "/harinama", subtitle: "Congregational chanting", icon: Music },
  ]},
  { label: "Courses", children: [
    { label: "Bhagavad Gita", href: "/gita-course", subtitle: "Journey into self-realization", icon: BookOpen },
    { label: "Daily Classes", href: "/courses", subtitle: "Srimad Bhagavatam & classes", icon: Calendar },
  ]},
  { label: "Connect", href: "/connect" },
];

export default function Navbar() {
  const { settings, sunday, gitaCourse, templeSchedule, contacts, paymentRecords, previewLeads, liveProgrammes } = useAdmin();
  const liveClass = useLiveClass();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(0);

  // Active live broadcast detection
  const activeLiveProgramme = (() => {
    if (!liveProgrammes || !liveProgrammes.enabled) return null;
    const nowMs = Date.now();
    const list = (liveProgrammes.programmes || []).filter((p) => p.published !== false);
    for (const item of list) {
      if (item.isManualLiveOverride) return item;
      try {
        const [y, m, d] = item.date.split("-").map(Number);
        const [sh, sm] = (item.startTime || "00:00").split(":").map(Number);
        const [eh, em] = (item.endTime || "23:59").split(":").map(Number);

        const startMs = new Date(y, m - 1, d, sh, sm, 0).getTime();
        const endMs = new Date(y, m - 1, d, eh, em, 0).getTime();

        if (nowMs >= startMs && nowMs < endMs) {
          return item;
        }
      } catch {}
    }
    return null;
  })();
  
  const location = useLocation();
  const currentPath = location.pathname;

  const unreadMessagesCount = (contacts || []).filter((c) => !c.read).length;
  const unreadDonationsCount = (paymentRecords || []).filter((p) => !p.read).length;
  const unreadLeadsCount = (previewLeads || []).filter((l) => !l.read).length;
  const totalUnreadNotifications = unreadMessagesCount + unreadDonationsCount + unreadLeadsCount;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const isLinkLive = (href: string): boolean => {
    if (href === "/courses") {
      return !!liveClass;
    }
    if (href === "/temple/sunday") {
      return sunday.schedule?.some(item => isTimeStrLive(item.time, 0)) || false;
    }
    if (href === "/youth") {
      return isTimeStrLive("6:30 PM – 8:30 PM", 6);
    }
    if (href === "/gita-course") {
      try {
        if (!gitaCourse.startLabel || !gitaCourse.endLabel) return false;
        const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const nowIst = new Date(nowStr);
        const start = new Date(gitaCourse.startLabel);
        const end = new Date(gitaCourse.endLabel);
        end.setHours(23, 59, 59, 999);
        if (nowIst >= start && nowIst <= end) {
          return isTimeStrLive(gitaCourse.time || "7:30 PM");
        }
      } catch {}
      return false;
    }
    if (href === "/temple") {
      const scheduleList = templeSchedule && templeSchedule.length > 0 ? templeSchedule : [
        { time: "4:30 AM" },
        { time: "5:15 AM – 7:00 AM" },
        { time: "7:30 AM" },
        { time: "8:15 AM" },
        { time: "12:00 PM" },
        { time: "6:30 PM" }
      ];
      return scheduleList.some(item => isTimeStrLive(item.time));
    }
    return false;
  };

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    const handleOpenDrawer = () => {
      setMobileOpen(true);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("open-mobile-drawer", handleOpenDrawer);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("open-mobile-drawer", handleOpenDrawer);
    };
  }, []);

  // Dynamically update root --site-header-height CSS variable so layout never overlaps
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty("--site-header-height", `${h}px`);
      }
    };

    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);

    window.addEventListener("resize", updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Lock background body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Animations variants for mobile staggered list items
  const listVariants = {
    open: {
      transition: { staggerChildren: 0.04, delayChildren: 0.08 }
    },
    closed: {
      transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { y: { stiffness: 1000, velocity: -100 } }
    },
    closed: {
      y: 15,
      opacity: 0,
      transition: { y: { stiffness: 1000 } }
    }
  };

  return (
    <>
      <header 
        ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-md shadow-[0_4px_25px_rgba(91,44,155,0.06)] border-border/80" 
          : "bg-white/95 border-transparent"
      }`}
    >
      <LiveClassBanner />
      
      {/* Desktop Layout */}
      <div className={`hidden lg:flex max-w-7xl mx-auto px-6 xl:px-8 items-center justify-between transition-all duration-300 ${
        scrolled ? "h-20" : "h-24"
      }`}>
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 xl:gap-3 shrink-0" aria-label="ISKCON Kurnool home">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className="h-12 w-12 xl:h-14 xl:w-14 rounded-full object-cover ring-2 ring-secondary/60 transition-all duration-300" />
          ) : (
            <div className="h-12 w-12 xl:h-14 xl:w-14 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-sm shadow-glow transition-all duration-300">
              IK
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display font-bold text-base xl:text-lg text-primary tracking-tight">ISKCON Kurnool</div>
            <div className="text-[9px] xl:text-[10px] text-muted-foreground tracking-wide uppercase">Sri Sri Puri Jagannath Temple</div>
          </div>
        </Link>

        {/* Center: Main Nav Links */}
        <nav 
          className="flex items-center gap-0.5 xl:gap-1.5"
          onMouseLeave={() => setHoveredLabel(null)}
        >
          {NAV.map((item) => {
            const isChildActive = item.children?.some(c => c.href === currentPath);
            const isActive = item.href ? currentPath === item.href : isChildActive;
            const isRightAligned = item.label === "Courses" || item.label === "Activities" || item.label === "Connect";

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDrop(item.label)}
                onMouseLeave={() => setOpenDrop(null)}
              >
                {item.children ? (
                  <button 
                    className={`flex items-center gap-0.5 xl:gap-1 px-2.5 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium transition-colors duration-200 relative rounded-full ${
                      isChildActive ? "text-accent font-semibold" : "text-primary"
                    }`}
                    onMouseEnter={() => {
                      setOpenDrop(item.label);
                      setHoveredLabel(item.label);
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.label}
                      {item.children.some(c => isLinkLive(c.href)) && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 relative z-10 transition-transform duration-200" style={{ transform: openDrop === item.label ? 'rotate(180deg)' : 'none' }} />
                    
                    {hoveredLabel === item.label && (
                      <motion.div
                        layoutId="hoverPill"
                        className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeUnderline"
                        className="absolute bottom-[-2px] left-2.5 right-2.5 xl:left-4 xl:right-4 h-0.5 bg-secondary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.href!}
                    onMouseEnter={() => setHoveredLabel(item.label)}
                    className="px-2.5 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium text-primary hover:text-accent transition-colors duration-200 relative rounded-full block"
                    activeProps={{ className: "px-2.5 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-semibold text-accent relative rounded-full block" }}
                    activeOptions={{ exact: true }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {hoveredLabel === item.label && (
                      <motion.div
                        layoutId="hoverPill"
                        className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeUnderline"
                        className="absolute bottom-[-2px] left-2.5 right-2.5 xl:left-4 xl:right-4 h-0.5 bg-secondary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </Link>
                )}

                {/* Submenu Dropdown Card */}
                <AnimatePresence>
                  {item.children && openDrop === item.label && (
                    <div className={`absolute top-full pt-3 w-[360px] z-50 ${
                      isRightAligned ? "right-0" : "left-0 xl:left-1/2 xl:-translate-x-1/2"
                    }`}>
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-white/98 backdrop-blur-md rounded-2xl shadow-elegant border border-border/70 overflow-hidden"
                      >
                        {/* Top Decorative Gradient Accent line */}
                        <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
                        
                        <div className="p-3 grid gap-1">
                          {item.children.map((c) => {
                            const Icon = c.icon;
                            const isSubActive = c.href === currentPath;
                            return (
                              <Link
                                key={c.label}
                                to={c.href}
                                className={`group flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 ${
                                  isSubActive 
                                    ? "bg-primary/5 text-primary" 
                                    : "hover:bg-primary/[0.03] text-foreground"
                                }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 transition-all duration-300 ${
                                  isSubActive 
                                    ? "bg-primary text-white" 
                                    : "bg-muted text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110"
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="leading-tight">
                                  <div className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                                    isSubActive ? "text-primary" : "text-foreground group-hover:text-primary"
                                  }`}>
                                    {c.label}
                                    {isLinkLive(c.href) && (
                                      <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
                                    {c.subtitle}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right: Live Now & Donate CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeLiveProgramme && (
            <a
              href={activeLiveProgramme.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] xl:text-xs tracking-wider uppercase shadow-md shadow-red-600/40 hover:scale-105 active:scale-95 transition-all border border-white/20"
              title="Watch Live Stream"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>LIVE NOW</span>
            </a>
          )}

          <Link
            to="/donate"
            className="relative inline-flex items-center justify-center gap-2 px-4 py-2 xl:px-6 xl:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xs xl:text-sm tracking-wider uppercase overflow-hidden group animate-pulse-glow transition-all duration-300 hover:scale-105 active:scale-95 ring-2 ring-amber-300/40 ring-offset-1 ring-offset-white"
          >
            <Heart className="h-4 w-4 fill-white/30 stroke-[2.5] text-white animate-heartbeat shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:fill-white" />
            <span className="relative z-10 font-bold">DONATE</span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className={`lg:hidden max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between transition-all duration-300 ${
        scrolled ? "h-16" : "h-20 md:h-24"
      }`}>
        <button
          className="p-2 text-primary hover:bg-muted/50 rounded-full transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7" />
        </button>

        <Link to="/" className="flex-1 flex items-center justify-center" aria-label="ISKCON Kurnool home">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className={`rounded-full object-cover ring-2 ring-secondary/60 transition-all duration-300 ${
              scrolled ? "h-10 w-10" : "h-14 w-14 md:h-16 md:w-16"
            }`} />
          ) : (
            <div className={`rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold shadow-glow transition-all duration-300 ${
              scrolled ? "h-10 w-10 text-xs" : "h-14 w-14 md:h-16 md:w-16 text-lg"
            }`}>
              IK
            </div>
          )}
        </Link>

        <div className="flex items-center gap-1.5">
          {activeLiveProgramme && (
            <a
              href={activeLiveProgramme.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-sm border border-white/20"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span>LIVE</span>
            </a>
          )}

          <Link
            to="/donate"
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xs tracking-wider uppercase animate-pulse-glow hover:scale-105 active:scale-95 transition-all duration-200 ring-2 ring-amber-300/30 overflow-hidden group"
          >
            <Heart className="h-3.5 w-3.5 fill-white/30 stroke-[2.5] text-white animate-heartbeat shrink-0" />
            <span className="relative z-10">DONATE</span>
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </Link>
        </div>
      </div>

      </header>

      {/* Mobile Sidebar Navigation Drawer rendered directly to document.body via Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setMobileOpen(false)} 
              />
              
              {/* Sidebar Drawer Container */}
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed left-0 top-0 bottom-0 h-full w-[310px] max-w-[85vw] bg-white shadow-2xl border-r border-slate-200 overflow-hidden flex flex-col z-[101]"
              >
                {/* Drawer Header */}
                <div className="bg-slate-50 px-5 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
                  <div className="flex items-center gap-3">
                    {settings.logo ? (
                      <img src={settings.logo} alt="ISKCON Kurnool" className="h-9 w-9 rounded-full object-cover ring-2 ring-secondary/50 shadow-xs" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary text-secondary grid place-items-center font-display font-bold text-xs shadow-xs">
                        IK
                      </div>
                    )}
                    <div>
                      <span className="font-display font-bold text-sm text-slate-900 block leading-tight">ISKCON Kurnool</span>
                      <span className="text-[10px] text-slate-500 font-medium tracking-tight">Main Navigation Menu</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileOpen(false)} 
                    className="h-8 w-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 grid place-items-center transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Drawer Navigation Links Scroll Area */}
                <nav className="py-3 px-3 space-y-1.5 flex-1 overflow-y-auto overscroll-contain">
                  {NAV.map((item) => {
                    const isChildActive = item.children?.some(c => c.href === currentPath);
                    const isActive = item.href === currentPath || isChildActive;
                    const isGroupOpen = mobileGroupOpen === item.label;

                    return (
                      <div key={item.label} className="w-full">
                        {item.children ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => setMobileGroupOpen((open) => (open === item.label ? null : item.label))}
                              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-sm font-semibold transition-all select-none active:scale-[0.99] cursor-pointer ${
                                isActive 
                                  ? "bg-primary/10 text-primary border border-primary/20" 
                                  : "text-slate-700 hover:bg-slate-100/80 active:bg-primary/5"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.children.some(c => isLinkLive(c.href)) && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                  </span>
                                )}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isGroupOpen ? "rotate-180 text-primary" : ""}`}
                              />
                            </button>
                            
                            {/* Smooth CSS Grid Accordion Container */}
                            <div 
                              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                                isGroupOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="pl-2 pr-1 py-1 space-y-1 bg-slate-50/90 rounded-xl border border-slate-200/60 my-1">
                                  {item.children.map((child) => {
                                    const isSubActive = child.href === currentPath;
                                    const ChildIcon = child.icon;
                                    return (
                                      <Link
                                        key={child.label + child.href}
                                        to={child.href}
                                        onClick={() => {
                                          setMobileOpen(false);
                                          setMobileGroupOpen(null);
                                        }}
                                        className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-all duration-150 active:scale-[0.98] ${
                                          isSubActive 
                                            ? "bg-primary text-white font-bold shadow-xs" 
                                            : "text-slate-700 hover:bg-white hover:text-primary active:bg-slate-200/60"
                                        }`}
                                      >
                                        <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${isSubActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                                          <ChildIcon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-1.5 font-semibold leading-snug">
                                            <span className="truncate">{child.label}</span>
                                            {isLinkLive(child.href) && (
                                              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded shadow-xs shrink-0 animate-pulse">
                                                Live
                                              </span>
                                            )}
                                          </div>
                                          <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSubActive ? "text-white/80" : "text-slate-500"}`}>
                                            {child.subtitle}
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={item.href!}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.99] select-none ${
                              isActive 
                                ? "bg-primary text-white font-bold shadow-xs" 
                                : "text-slate-700 hover:bg-slate-100/80 active:bg-primary/5"
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Drawer Footer Section */}
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3 shrink-0">
                  <LanguageToggle className="w-full justify-center" />
                  
                  {/* Social Quick Links */}
                  <div className="flex justify-center gap-3 py-1 border-b border-slate-200/80 pb-3">
                    <a href={safeUrl(settings.youtube, "https://youtube.com")} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-8.5 w-8.5 rounded-full bg-white border border-slate-200 text-primary hover:bg-secondary hover:text-primary grid place-items-center transition duration-200 shadow-2xs">
                      <Youtube className="h-4 w-4" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-8.5 w-8.5 rounded-full bg-white border border-slate-200 text-primary hover:bg-secondary hover:text-primary grid place-items-center transition duration-200 shadow-2xs">
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a href={safeUrl(settings.instagram, "https://instagram.com")} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-8.5 w-8.5 rounded-full bg-white border border-slate-200 text-primary hover:bg-secondary hover:text-primary grid place-items-center transition duration-200 shadow-2xs">
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a href={`https://wa.me/${(settings.whatsapp || "919505377520").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-8.5 w-8.5 rounded-full bg-white border border-slate-200 text-primary hover:bg-secondary hover:text-primary grid place-items-center transition duration-200 shadow-2xs">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>

                  <Link
                    to="/donate"
                    onClick={() => setMobileOpen(false)}
                    className="relative flex items-center justify-center gap-2 w-full text-center px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xs tracking-wider uppercase animate-pulse-glow hover:scale-[1.01] active:scale-98 transition-all duration-200 ring-2 ring-amber-300/30 overflow-hidden group shadow-md"
                  >
                    <Heart className="h-4 w-4 fill-white/30 stroke-[2.5] text-white animate-heartbeat shrink-0" />
                    <span className="relative z-10 font-bold">DONATE NOW</span>
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
