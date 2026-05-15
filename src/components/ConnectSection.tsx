import { Phone, Mail, MapPin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function ConnectSection() {
  const { settings } = useAdmin();

  return (
    <section id="connect" className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <span className="text-secondary font-medium uppercase text-xs tracking-[0.3em]">Get in Touch</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-3">Connect With Us</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Visit the temple, join our programs, or reach out — we welcome you with open arms.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl shadow-elegant p-8 space-y-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><MapPin /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Address</h4>
                <p className="text-muted-foreground whitespace-pre-line">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><Phone /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Phone</h4>
                <a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-accent">{settings.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><Mail /></div>
              <div>
                <h4 className="font-display font-bold text-primary text-lg">Email</h4>
                <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-accent">{settings.email}</a>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-display font-bold text-primary text-lg mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-11 w-11 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center hover:scale-110 hover:shadow-gold transition"><Instagram className="h-5 w-5" /></a>
                <a href={settings.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-11 w-11 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center hover:scale-110 hover:shadow-gold transition"><Youtube className="h-5 w-5" /></a>
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-11 w-11 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center hover:scale-110 hover:shadow-gold transition"><MessageCircle className="h-5 w-5" /></a>
              </div>
            </div>

            <a id="donate" href="#donate" className="block text-center px-6 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:scale-[1.02] hover:shadow-gold transition">
              Donate to Support the Temple
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-elegant border border-border/50 min-h-[420px]">
            <iframe
              src={settings.mapEmbed}
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
