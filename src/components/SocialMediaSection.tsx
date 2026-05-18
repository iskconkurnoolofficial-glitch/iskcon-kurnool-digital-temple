import { Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";

type Platform = {
  name: string;
  href: string;
  icon: typeof Instagram;
  desc: string;
  cta: string;
  brand: string; // tailwind classes for icon bg
};

const PLATFORMS: Platform[] = [
  {
    name: "Instagram",
    href: "https://instagram.com/iskcon_kurnool",
    icon: Instagram,
    desc: "Daily darshan, reels & festival highlights",
    cta: "Follow",
    brand: "from-[#feda75] via-[#fa7e1e] to-[#d62976]",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@iskconkurnool",
    icon: Youtube,
    desc: "Lectures, kirtans & live programs",
    cta: "Subscribe",
    brand: "from-[#ff0000] to-[#cc0000]",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/iskconkurnool",
    icon: Facebook,
    desc: "Community updates & event invites",
    cta: "Follow",
    brand: "from-[#1877f2] to-[#0a5dc2]",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/919505377520",
    icon: MessageCircle,
    desc: "Get temple updates on your phone",
    cta: "Chat Now",
    brand: "from-[#25d366] to-[#128c7e]",
  },
];

export default function SocialMediaSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/10 via-white to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent font-semibold">
            <span className="h-px w-8 bg-secondary" /> Social <span className="h-px w-8 bg-secondary" />
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary mt-4">
            Follow Us on Social Media
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
            Stay connected with ISKCON Kurnool — daily darshan, festivals, kirtans &amp; spiritual content
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white rounded-2xl border-2 border-secondary/30 p-6 flex flex-col items-center text-center hover:border-secondary hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(245,197,24,0.5)] transition-all duration-300"
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${p.brand} grid place-items-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.desc}</p>
                <span className="mt-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-secondary text-primary font-bold text-sm w-full group-hover:bg-accent group-hover:text-white transition-colors">
                  {p.cta}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
