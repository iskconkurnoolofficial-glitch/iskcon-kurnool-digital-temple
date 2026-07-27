import { useState, useEffect } from "react";
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
  MessageCircle 
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
    { label: "Temple Timings", href: "/temple", subtitle: "Daily Darshan & Aarti schedules", icon: Clock },
    { label: "Sunday Program", href: "/temple/sunday", subtitle: "Weekly feast, kirtan & lecture", icon: Calendar },
    { label: "Upcoming Festivals", href: "/festivals", subtitle: "Celebrate sacred days with us", icon: Sparkles },
    { label: "Goshala", href: "/goshala", subtitle: "Cow protection & service", icon: Leaf },
    { label: "Shop", href: "/shop", subtitle: "Devotional books & puja items", icon: ShoppingBag },
  ]},
  { label: "Media", children: [
    { label: "Gallery", href: "/gallery", subtitle: "Photos of deities, events & festivals", icon: Image },
    { label: "Social Media", href: "/social-media", subtitle: "Connect with us online", icon: Share2 },
  ]},
  { label: "Activities", children: [
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
  const { settings, sunday, gitaCourse, templeSchedule } = useAdmin();
  const liveClass = useLiveClass();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(0);
  
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
      scrolled 
        ? "bg-white/90 backdrop-blur-md shadow-[0_4px_25px_rgba(91,44,155,0.06)] border-border/80" 
        : "bg-white/95 border-transparent"
    }`}>
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

        {/* Right: Donate CTA */}
        <div className="flex items-center shrink-0">
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

        <Link
          to="/donate"
          className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-xs tracking-wider uppercase animate-pulse-glow hover:scale-105 active:scale-95 transition-all duration-200 ring-2 ring-amber-300/30 overflow-hidden group"
        >
          <Heart className="h-3.5 w-3.5 fill-white/30 stroke-[2.5] text-white animate-heartbeat shrink-0" />
          <span className="relative z-10">DONATE</span>
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        </Link>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setMobileOpen(false)} 
            />
            
            {/* Sidebar Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/98 backdrop-blur-md shadow-2xl border-r border-border/50 overflow-y-auto flex flex-col"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5 flex justify-between items-center border-b border-border/40 bg-white/98 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  {settings.logo ? (
                    <img src={settings.logo} alt="ISKCON Kurnool" className="h-10 w-10 rounded-full object-cover ring-2 ring-secondary/40" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-hero grid place-items-center text-white font-display font-bold text-sm">
                      IK
                    </div>
                  )}
                  <span className="font-display font-bold text-gray-800">Menu</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <motion.nav 
                variants={listVariants}
                initial="closed"
                animate="open"
                className="py-4 px-4 space-y-2 flex-1"
              >
                {NAV.map((item) => {
                  const isChildActive = item.children?.some(c => c.href === currentPath);
                  const isActive = item.href === currentPath || isChildActive;

                  return (
                    <motion.div 
                      key={item.label}
                      variants={itemVariants}
                      className="overflow-hidden"
                    >
                      {item.children ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setMobileGroupOpen((open) => (open === item.label ? null : item.label))}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-base font-medium transition-colors ${
                              isActive ? "bg-primary/5 text-primary" : "text-gray-650 hover:bg-gray-50"
                            }`}
                          >
                            <span className={`flex items-center gap-1.5 ${isActive ? "font-semibold text-primary" : ""}`}>
                              {item.label}
                              {item.children.some(c => isLinkLive(c.href)) && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-500 transition-transform duration-250 ${mobileGroupOpen === item.label ? "rotate-180" : ""}`}
                            />
                          </button>
                          
                          {/* Collapsible Sub-menu Accordion using Framer Motion */}
                          <motion.div 
                            initial={false}
                            animate={{ 
                              height: mobileGroupOpen === item.label ? "auto" : 0, 
                              opacity: mobileGroupOpen === item.label ? 1 : 0 
                            }}
                            transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-3 pr-1 py-1.5 space-y-1 bg-muted/30 rounded-xl mt-1 border-l-2 border-primary/20">
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
                                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                      isSubActive 
                                        ? "bg-primary text-white font-semibold shadow-sm" 
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    <ChildIcon className={`h-4 w-4 shrink-0 ${isSubActive ? "text-white" : "text-primary/70"}`} />
                                    <span className="flex-1 flex items-center justify-between gap-1.5">
                                      <span>{child.label}</span>
                                      {isLinkLive(child.href) && (
                                        <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm animate-pulse">
                                          <span className="h-1 w-1 rounded-full bg-white" /> Live
                                        </span>
                                      )}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        </>
                      ) : (
                        <Link
                          to={item.href!}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                            isActive ? "bg-primary text-white font-semibold shadow-sm" : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </motion.nav>

              {/* Drawer Footer Section */}
              <div className="border-t border-border/80 bg-muted/30 p-5 space-y-4">
                <LanguageToggle className="w-full justify-center" />
                
                {/* Social Quick Links */}
                <div className="flex justify-center gap-4 py-2 border-b border-border/40 pb-4">
                  <a href={safeUrl(settings.youtube, "https://youtube.com")} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-secondary hover:text-primary grid place-items-center transition duration-200">
                    <Youtube className="h-4 w-4 text-primary" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-secondary hover:text-primary grid place-items-center transition duration-200">
                    <Facebook className="h-4 w-4 text-primary" />
                  </a>
                  <a href={safeUrl(settings.instagram, "https://instagram.com")} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-secondary hover:text-primary grid place-items-center transition duration-200">
                    <Instagram className="h-4 w-4 text-primary" />
                  </a>
                  <a href={`https://wa.me/${(settings.whatsapp || "919505377520").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-secondary hover:text-primary grid place-items-center transition duration-200">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </a>
                </div>

                <Link
                  to="/donate"
                  onClick={() => setMobileOpen(false)}
                  className="relative flex items-center justify-center gap-2 w-full text-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-sm tracking-wider uppercase animate-pulse-glow hover:scale-[1.02] active:scale-98 transition-all duration-200 ring-2 ring-amber-300/30 overflow-hidden group"
                >
                  <Heart className="h-4 w-4 fill-white/30 stroke-[2.5] text-white animate-heartbeat shrink-0" />
                  <span className="relative z-10">DONATE NOW</span>
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
