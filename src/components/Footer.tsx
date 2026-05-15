import { Instagram, Youtube, MessageCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

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
              <img src={settings.logo} alt="" className="h-12 w-12 rounded-full ring-2 ring-secondary/60" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-hero grid place-items-center font-display font-bold">IK</div>
            )}
            <div>
              <div className="font-display font-bold text-lg text-secondary">ISKCON Kurnool</div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">Hare Krishna</div>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            International Society for Krishna Consciousness — spreading the chanting of the holy name and the
            teachings of Lord Sri Krishna.
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold text-secondary mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><a className="hover:text-secondary transition" href="/#home">Home</a></li>
            <li><a className="hover:text-secondary transition" href="/#welcome">About Temple</a></li>
            <li><a className="hover:text-secondary transition" href="/#gallery">Gallery</a></li>
            <li><a className="hover:text-secondary transition" href="/#connect">Connect</a></li>
            <li><a className="hover:text-secondary transition" href="/admin">Admin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-secondary mb-4">Connect</h4>
          <p className="text-sm opacity-80 whitespace-pre-line mb-3">{settings.address}</p>
          <div className="flex gap-3">
            <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><Instagram className="h-4 w-4" /></a>
            <a href={settings.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><Youtube className="h-4 w-4" /></a>
            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-10 w-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary grid place-items-center transition"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5 text-center text-xs opacity-70">
        {settings.footer}
      </div>
    </footer>
  );
}
