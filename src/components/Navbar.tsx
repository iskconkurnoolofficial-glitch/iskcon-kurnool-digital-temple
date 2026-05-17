import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import LiveClassBanner from "@/components/LiveClassBanner";

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

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-[0_2px_12px_rgba(91,44,155,0.08)] border-b border-border/60">
      <LiveClassBanner />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-20 md:h-24">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover ring-2 ring-secondary/60" />
          ) : (
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-lg shadow-glow">
              IK
            </div>
          )}
          <div className="leading-tight min-w-0">
            <div className="font-display font-bold text-primary text-sm sm:text-lg md:text-xl truncate">ISKCON Kurnool</div>
            <div className="hidden sm:block text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground truncate">
              International Society for Krishna Consciousness
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
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

        <div className="lg:hidden flex items-center gap-2">
          <Link
            to="/donate"
            className="inline-flex items-center px-3.5 py-2 rounded-full bg-accent text-white font-semibold text-xs shadow-sm"
          >
            DONATE
          </Link>
          <button
            className="p-2 text-primary"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-elegant overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-display font-bold text-primary">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <nav className="p-2">
              {NAV.flatMap((item) =>
                item.children
                  ? item.children.map((c) => ({ label: c.label, href: c.href }))
                  : [{ label: item.label, href: item.href! }],
              ).map((link) => (
                <Link
                  key={link.label + link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-primary font-medium border-b border-border/50 hover:bg-surface hover:text-accent transition"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setMobileOpen(false)}
                className="mt-4 block text-center px-6 py-3 rounded-full bg-accent text-white font-semibold"
              >
                DONATE
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
