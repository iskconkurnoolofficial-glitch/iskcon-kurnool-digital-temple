import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { safeUrl } from "@/lib/utils";

export default function Footer() {
  const { settings } = useAdmin();
  return (
    <footer className="relative bg-footer text-footer-foreground overflow-hidden">
      <svg className="absolute -bottom-20 -right-20 w-[500px] opacity-[0.06]" viewBox="0 0 200 200" aria-hidden>
        <g fill="currentColor" className="text-secondary">
          {[...Array(12)].map((_, i) => (
            <ellipse key={i} cx="100" cy="60" rx="14" ry="40" transform={`rotate(${i * 30} 100 100)`} />
          ))}
        </g>
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            {settings.logo ? (
              <img src={settings.logo} alt="" className="h-14 w-14 rounded-full ring-2 ring-secondary/60" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-hero grid place-items-center font-display font-bold">IK</div>
            )}
            <div>
              <div className="font-display font-bold text-xl text-white">ISKCON Kurnool</div>
              <div className="text-xs opacity-80">Sri Sri Puri Jagannath Temple</div>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed font-display italic">
            Hare Krishna! Hare Krishna!<br />
            Krishna Krishna! Hare Hare!<br />
            Hare Rama! Hare Rama!<br />
            Rama Rama! Hare Hare!
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold text-secondary mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link className="hover:text-secondary transition" to="/">Home</Link></li>
            <li><Link className="hover:text-secondary transition" to="/about/iskcon">About ISKCON</Link></li>
            <li><Link className="hover:text-secondary transition" to="/about/kurnool">About ISKCON Kurnool</Link></li>
            <li><Link className="hover:text-secondary transition" to="/about/founder">Founder Acharya</Link></li>
            <li><Link className="hover:text-secondary transition" to="/temple">Temple</Link></li>
            <li><Link className="hover:text-secondary transition" to="/gallery">Gallery</Link></li>
            <li><Link className="hover:text-secondary transition" to="/courses">Courses</Link></li>
            <li><Link className="hover:text-secondary transition" to="/connect">Connect</Link></li>
            <li><Link className="hover:text-secondary transition" to="/donate">Donate</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-secondary mb-4">Connect With Us</h4>
          <div className="flex gap-3 mb-5">
            <a href={settings.youtube || "https://youtube.com"} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><Youtube className="h-4 w-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><Facebook className="h-4 w-4" /></a>
            <a href={settings.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><Instagram className="h-4 w-4" /></a>
            <a href={`https://wa.me/${(settings.whatsapp || "919505377520").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><MessageCircle className="h-4 w-4" /></a>
          </div>
          <p className="text-sm opacity-80">ISKCON Kurnool, Andhra Pradesh, India</p>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-5 text-center text-xs opacity-70">
        © 2025 ISKCON Kurnool. All Rights Reserved.
      </div>
    </footer>
  );
}
