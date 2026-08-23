import { Link } from "@tanstack/react-router";
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowUp 
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { safeUrl } from "@/lib/utils";
import InstallAppButton from "@/components/InstallAppButton";

export default function Footer() {
  const { settings } = useAdmin();
  const currentYear = new Date().getFullYear();

  const discoverLinks = [
    { label: "Home", href: "/" },
    { label: "Annual Youth Yatra", href: "/youth-yatra" },
    { label: "House Programmes", href: "/house-programmes" },
    { label: "About ISKCON", href: "/about/iskcon" },
    { label: "ISKCON Kurnool", href: "/about/kurnool" },
    { label: "Founder Acharya", href: "/about/founder" },
    { label: "Our Mission", href: "/about/mission" },
  ];

  const templeLinks = [
    { label: "Daily Darshan", href: "/daily-darshan" },
    { label: "Temple Timings", href: "/temple" },
    { label: "Sunday Program", href: "/temple/sunday" },
    { label: "Upcoming Festivals", href: "/festivals" },
    { label: "Goshala", href: "/goshala" },
    { label: "Shop", href: "/shop" },
  ];

  return (
    <footer className="relative bg-footer text-footer-foreground border-t border-white/5">
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Column 1: Brand Info & Maha Mantra (col-span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3.5">
              {settings.logo ? (
                <img src={settings.logo} alt="" className="h-14 w-14 rounded-full ring-2 ring-secondary/60 object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-hero grid place-items-center font-display font-bold text-white shadow-glow">
                  IK
                </div>
              )}
              <div>
                <div className="font-display font-bold text-xl text-white tracking-tight">ISKCON Kurnool</div>
                <div className="text-xs opacity-75">Sri Sri Puri Jagannath Temple</div>
              </div>
            </div>
            
            {/* Devotional Maha Mantra Block */}
            <div className="border-l-2 border-secondary bg-white/[0.02] p-4 rounded-r-2xl border-t border-r border-b border-white/[0.01]">
              <div className="text-[10px] uppercase tracking-wider text-secondary/80 font-bold mb-1.5">Maha Mantra</div>
              <p className="text-xs leading-relaxed opacity-90 font-serif italic text-white/90">
                Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare<br />
                Hare Rama, Hare Rama, Rama Rama, Hare Hare
              </p>
            </div>
          </div>

          {/* Column 2: Discover Links (col-span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-secondary text-sm uppercase tracking-wider mb-5">Discover</h4>
            <ul className="space-y-3.5 text-sm">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="group flex items-center text-footer-foreground/80 hover:text-secondary hover:translate-x-1.5 transition-all duration-300"
                  >
                    <ChevronRight className="h-3 w-3 text-secondary opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <InstallAppButton variant="footer" />
              </li>
            </ul>
          </div>

          {/* Column 3: Temple & Services Links (col-span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-secondary text-sm uppercase tracking-wider mb-5">Temple & Services</h4>
            <ul className="space-y-3.5 text-sm">
              {templeLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="group flex items-center text-footer-foreground/80 hover:text-secondary hover:translate-x-1.5 transition-all duration-300"
                  >
                    <ChevronRight className="h-3 w-3 text-secondary opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Connect (col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="font-display font-bold text-secondary text-sm uppercase tracking-wider mb-5">Connect With Us</h4>
              <div className="flex gap-2.5">
                <a href={safeUrl(settings.youtube, "https://youtube.com")} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-secondary hover:bg-secondary hover:text-primary flex items-center justify-center transition-all duration-300 hover:scale-105">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-secondary hover:bg-secondary hover:text-primary flex items-center justify-center transition-all duration-300 hover:scale-105">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={safeUrl(settings.instagram, "https://instagram.com")} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-secondary hover:bg-secondary hover:text-primary flex items-center justify-center transition-all duration-300 hover:scale-105">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={`https://wa.me/${(settings.whatsapp || "919505377520").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:border-secondary hover:bg-secondary hover:text-primary flex items-center justify-center transition-all duration-300 hover:scale-105">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-footer-foreground/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <span>ISKCON Kurnool, Andhra Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <span>+91 95053 77520</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <span>info@iskconkurnool.org</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Copyright & Utility Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-75">
          <div>
            © {currentYear} ISKCON Kurnool. All Rights Reserved.
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/connect" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/connect" className="hover:text-secondary transition-colors">Terms of Use</Link>
            <a href="#" className="hover:text-secondary flex items-center gap-1 transition-colors">
              Back to Top <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
