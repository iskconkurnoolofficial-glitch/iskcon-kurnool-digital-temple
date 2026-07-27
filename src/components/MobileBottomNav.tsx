import { Link } from "@tanstack/react-router";
import { Home, Image, Heart, BookOpen, Users, type LucideIcon } from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon; center?: boolean };

const items: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Gallery", href: "/gallery", icon: Image },
  { label: "Donate", href: "/donate", icon: Heart, center: true },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Connect", href: "/connect", icon: Users },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-border/70 shadow-[0_-4px_16px_rgba(91,44,155,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-around px-2 pt-1.5 pb-1">
        {items.map(({ label, href, icon: Icon, center }) => (
          <li key={label} className="flex-1">
            <Link
              to={href}
              activeOptions={{ exact: href === "/" }}
              className="flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-semibold text-accent" }}
            >
              {center ? (
                <span className="-mt-6 mb-0.5 grid place-items-center h-13 w-13 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_4px_18px_rgba(249,115,22,0.55)] ring-4 ring-white transition-transform duration-300 active:scale-95 animate-pulse-glow">
                  <Icon className="h-6 w-6 fill-white/20 stroke-[2.2] text-white transition-transform duration-300 group-hover:scale-125" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
