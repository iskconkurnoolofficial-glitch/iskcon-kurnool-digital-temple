import { Phone, Mail, MapPin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { safeUrl, safeMapEmbed } from "@/lib/utils";

export default function ConnectSection() {
  const { settings } = useAdmin();

  return (
    <section id="connect" className="py-20 md:py-28 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <span className="text-accent font-medium uppercase text-xs tracking-[0.3em]">Get in Touch</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3">Connect With Us</h2>
          <p className="text-foreground/70 mt-3 max-w-2xl mx-auto">Visit the temple, join our programs, or reach out — we welcome you with open arms.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-elegant p-8 space-y-6 border-2 border-secondary/40">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center shrink-0"><MapPin /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Address</h4>
                <p className="text-foreground/70 whitespace-pre-line">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center shrink-0"><Phone /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Phone</h4>
                <a href={`tel:${settings.phone}`} className="text-foreground/70 hover:text-accent">{settings.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center shrink-0"><Mail /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Email</h4>
                <a href={`mailto:${settings.email}`} className="text-foreground/70 hover:text-accent">{settings.email}</a>
              </div>
            </div>

            <div className="pt-4 border-t border-secondary/40">
              <h4 className="font-display font-bold text-primary text-lg mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href={safeUrl(settings.instagram, "https://instagram.com")} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center hover:bg-accent hover:text-white hover:scale-110 transition"><Instagram className="h-5 w-5" /></a>
                <a href={safeUrl(settings.youtube, "https://youtube.com")} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center hover:bg-accent hover:text-white hover:scale-110 transition"><Youtube className="h-5 w-5" /></a>
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-11 w-11 rounded-full bg-secondary text-primary grid place-items-center hover:bg-accent hover:text-white hover:scale-110 transition"><MessageCircle className="h-5 w-5" /></a>
              </div>
            </div>

            <a id="donate" href="/donate" className="block text-center px-6 py-4 rounded-full bg-accent text-white font-semibold hover:scale-[1.02] hover:shadow-lg transition">
              Donate to Support the Temple
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-elegant border-2 border-secondary/40 min-h-[420px]">
            <iframe
              src={safeMapEmbed(settings.mapEmbed)}
              title="ISKCON Kurnool Location"
              className="w-full h-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
