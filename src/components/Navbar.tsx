import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import LiveClassBanner from "@/components/LiveClassBanner";
import LanguageToggle from "@/components/LanguageToggle";

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
    { label: "Sunday Program", href: "/temple" },
    { label: "Festival", href: "/temple" },
  ]},
  { label: "Media", children: [
    { label: "Gallery", href: "/gallery" },
    { label: "Social Media", href: "/connect" },
  ]},
  { label: "Activities", children: [
    { label: "Youth Program", href: "/courses" },
  ]},
  { label: "Courses", children: [
    { label: "Bhagavad Gita", href: "/courses" },
    { label: "Daily Classes", href: "/courses" },
  ]},
  { label: "Goshala", href: "/goshala" },
  { label: "Connect", href: "/connect" },
];

export default function Navbar() {
  const { settings } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);

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
          {NAV.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDrop(item.label)}
              onMouseLeave={() => setOpenDrop(null)}
            >
              {item.children ? (
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition">
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
              {item.children && openDrop === item.label && (
                <div className="absolute top-full left-0 pt-2 min-w-56">
                  <div className="bg-card rounded-xl shadow-elegant border border-border overflow-hidden border-t-2 border-t-secondary">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        to={c.href}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface hover:text-primary transition"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

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

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setMobileOpen(false)} 
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600/5 to-transparent px-6 py-5 flex justify-between items-center border-b border-gray-100">
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
            <nav className="py-2 px-3">
              {NAV.map((item) => (
                <div key={item.label} className="mb-1 rounded-2xl overflow-hidden border border-border bg-white">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileGroupOpen((open) => (open === item.label ? null : item.label))}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 font-medium hover:bg-purple-50 transition-colors duration-200"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${mobileGroupOpen === item.label ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ${mobileGroupOpen === item.label ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                        {item.children.map((child) => (
                          <Link
                            key={child.label + child.href}
                            to={child.href}
                            onClick={() => {
                              setMobileOpen(false);
                              setMobileGroupOpen(null);
                            }}
                            className="block px-5 py-3 text-sm text-gray-600 hover:text-primary hover:bg-purple-50 transition-colors duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.href!}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent hover:text-accent transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-4 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Donate Button */}
            <div className="px-4 pb-6">
              <Link
                to="/donate"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                DONATE NOW
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
