import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import LiveClassBanner from "@/components/LiveClassBanner";
import LanguageToggle from "@/components/LanguageToggle";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = { label: string; href?: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", children: [
    { label: "About ISKCON", href: "/about/iskcon" },
    { label: "ISKCON Kurnool", href: "/about/kurnool" },
    { label: "Our Mission", href: "/about/mission" },
    { label: "Founder Acharya", href: "/about/founder" },
  ]},
  { label: "Temple", children: [
    { label: "Temple Timings", href: "/temple" },
    { label: "Sunday Program", href: "/temple/sunday" },
    { label: "Upcoming Festivals", href: "/festivals" },
    { label: "Goshala", href: "/goshala" },
    { label: "Shop", href: "/shop" },
  ]},
  { label: "Media", children: [
    { label: "Gallery", href: "/gallery" },
    { label: "Social Media", href: "/social-media" },
  ]},
  { label: "Activities", children: [
    { label: "Youth Program", href: "/youth" },
    { label: "Prahlada Badi", href: "/prahlada-badi" },
    { label: "Ekadashi Vratam", href: "/ekadashi" },
    { label: "Hari Nama Sankeerthana", href: "/harinama" },
  ]},
  { label: "Courses", children: [
    { label: "Bhagavad Gita", href: "/gita-course" },
    { label: "Daily Classes", href: "/courses" },
  ]},
  { label: "Connect", href: "/connect" },
];

export default function Navbar() {
  const { settings } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-[0_2px_12px_rgba(91,44,155,0.08)] border-b border-border/60">
      <LiveClassBanner />
      {/* Desktop Layout */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-8 items-center justify-between h-24">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="ISKCON Kurnool home">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary/60" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-lg shadow-glow">
              IK
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display font-bold text-lg xl:text-xl text-primary tracking-tight">ISKCON Kurnool</div>
            <div className="text-[10px] xl:text-xs text-muted-foreground tracking-wide uppercase">Sri Sri Puri Jagannath Temple</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const isChildActive = item.children?.some(c => c.href === currentPath);
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDrop(item.label)}
                onMouseLeave={() => setOpenDrop(null)}
              >
                {item.children ? (
                  <button 
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition relative hover:text-accent ${
                      isChildActive ? "text-accent font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:bg-secondary" : "text-primary"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    to={item.href!}
                    className="px-3 py-2 text-sm font-medium text-primary hover:text-accent transition relative"
                    activeProps={{ className: "px-3 py-2 text-sm font-medium text-accent relative after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:bg-secondary" }}
                    activeOptions={{ exact: true }}
                  >
                    {item.label}
                  </Link>
                )}
                <AnimatePresence>
                  {item.children && openDrop === item.label && (
                    <div className="absolute top-full left-0 pt-2 min-w-56">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="bg-card rounded-xl shadow-elegant border border-border overflow-hidden border-t-2 border-t-secondary backdrop-blur-md bg-white/95"
                      >
                        {item.children.map((c) => (
                          <Link
                            key={c.label}
                            to={c.href}
                            className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface hover:text-primary transition"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <LanguageToggle className="ml-3" />

          <Link
            to="/donate"
            className="ml-3 inline-flex items-center px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:scale-105 hover:shadow-lg transition-all"
          >
            DONATE
          </Link>
        </nav>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20 md:h-24">
        <button
          className="p-2 text-primary"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7" />
        </button>

        <Link to="/" className="flex-1 flex items-center justify-center" aria-label="ISKCON Kurnool home">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover ring-2 ring-secondary/60" />
          ) : (
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-lg shadow-glow">
              IK
            </div>
          )}
        </Link>

        <Link
          to="/donate"
          className="inline-flex items-center px-3.5 py-2 rounded-full bg-accent text-white font-semibold text-xs shadow-sm"
        >
          DONATE
        </Link>
      </div>

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
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600/5 to-transparent px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-white">
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

              {/* Navigation */}
              <nav className="py-4 px-4 space-y-2 flex-1">
                {NAV.map((item) => {
                  const isChildActive = item.children?.some(c => c.href === currentPath);
                  const isActive = item.href === currentPath || isChildActive;

                  return (
                    <div key={item.label} className="overflow-hidden">
                      {item.children ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setMobileGroupOpen((open) => (open === item.label ? null : item.label))}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-base font-medium transition-colors ${
                              isActive ? "bg-purple-50/70 text-primary" : "text-gray-650 hover:bg-gray-50"
                            }`}
                          >
                            <span className={isActive ? "font-semibold text-primary" : ""}>{item.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-500 transition-transform duration-250 ${mobileGroupOpen === item.label ? "rotate-180" : ""}`}
                            />
                          </button>
                          <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ${mobileGroupOpen === item.label ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="pl-4 pr-2 py-1.5 space-y-1 bg-surface/30 rounded-lg mt-1 border-l-2 border-primary/20">
                              {item.children.map((child) => {
                                const isSubActive = child.href === currentPath;
                                return (
                                  <Link
                                    key={child.label + child.href}
                                    to={child.href}
                                    onClick={() => {
                                      setMobileOpen(false);
                                      setMobileGroupOpen(null);
                                    }}
                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                      isSubActive ? "bg-primary text-white font-semibold shadow-sm" : "text-gray-600 hover:text-primary hover:bg-purple-50/40"
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          to={item.href!}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                            isActive ? "bg-primary text-white font-semibold shadow-sm" : "text-gray-600 hover:bg-purple-50/40 hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Footer Section */}
              <div className="border-t border-gray-150 bg-gray-50/60 p-4 space-y-4">
                <LanguageToggle className="w-full justify-center" />
                <Link
                  to="/donate"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  DONATE NOW
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
