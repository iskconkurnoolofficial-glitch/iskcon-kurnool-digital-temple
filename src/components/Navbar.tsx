import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

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
    { label: "Shop", href: "/temple" },
    { label: "Volunteer", href: "/temple" },
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-elegant border-b border-border/60" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {settings.logo ? (
            <img src={settings.logo} alt="ISKCON Kurnool" className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary/60" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold shadow-glow">
              IK
            </div>
          )}
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-bold text-primary text-lg">ISKCON Kurnool</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
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
                  <div className="bg-card rounded-xl shadow-elegant border border-border overflow-hidden animate-fade-in border-t-2 border-t-secondary">
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
            className="ml-3 inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:scale-105 hover:shadow-gold transition-all"
          >
            DONATE
          </Link>
        </nav>

        <button
          className="lg:hidden p-2 text-primary"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-elegant overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-display font-bold text-primary">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2">
              {NAV.map((item) => (
                <details key={item.label} className="group border-b border-border/50">
                  {item.children ? (
                    <>
                      <summary className="flex justify-between items-center px-3 py-3 text-primary font-medium cursor-pointer list-none">
                        {item.label}
                        <ChevronDown className="h-4 w-4 group-open:rotate-180 transition" />
                      </summary>
                      <div className="pl-4 pb-2">
                        {item.children.map((c) => (
                          <Link key={c.label} to={c.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-accent">
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link to={item.href!} onClick={() => setMobileOpen(false)} className="block px-3 py-3 text-primary font-medium">
                      {item.label}
                    </Link>
                  )}
                </details>
              ))}
              <Link
                to="/donate"
                onClick={() => setMobileOpen(false)}
                className="mt-4 block text-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
              >
                DONATE
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
