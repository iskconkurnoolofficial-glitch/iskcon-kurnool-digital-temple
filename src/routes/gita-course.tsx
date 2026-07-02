import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { Calendar, Clock, Monitor, IndianRupee, Check, BookOpen, Languages, Timer, Sparkles, Phone } from "lucide-react";

export const Route = createFileRoute("/gita-course")({
  head: () => ({
    meta: [
      { title: "Bhagavad Gita Course — ISKCON Kurnool" },
      { name: "description", content: "18 days, 18 chapters — a complete online Bhagavad Gita course in Telugu. July 14–31, 2026, 7:30 PM daily. Free registration." },
      { property: "og:title", content: "Bhagavad Gita Course — ISKCON Kurnool" },
      { property: "og:description", content: "A complete journey through the Bhagavad Gita, one chapter each night. Free, online, daily." },
    ],
  }),
  component: Page,
});

const CHAPTERS: { sanskrit: string; english: string }[] = [
  { sanskrit: "Arjuna Vishada Yoga", english: "Arjuna's Dejection" },
  { sanskrit: "Sankhya Yoga", english: "The Yoga of Knowledge" },
  { sanskrit: "Karma Yoga", english: "The Yoga of Action" },
  { sanskrit: "Jnana Karma Sanyasa Yoga", english: "Knowledge & Renunciation of Action" },
  { sanskrit: "Karma Sanyasa Yoga", english: "Renunciation of Action" },
  { sanskrit: "Dhyana Yoga", english: "The Yoga of Meditation" },
  { sanskrit: "Jnana Vijnana Yoga", english: "Knowledge & Wisdom" },
  { sanskrit: "Akshara Brahma Yoga", english: "The Imperishable Brahman" },
  { sanskrit: "Raja Vidya Raja Guhya Yoga", english: "The Sovereign Science" },
  { sanskrit: "Vibhuti Yoga", english: "Divine Glories" },
  { sanskrit: "Vishvarupa Darshana Yoga", english: "Vision of the Universal Form" },
  { sanskrit: "Bhakti Yoga", english: "The Yoga of Devotion" },
  { sanskrit: "Kshetra Kshetrajna Vibhaga Yoga", english: "The Field & Its Knower" },
  { sanskrit: "Gunatraya Vibhaga Yoga", english: "The Three Gunas" },
  { sanskrit: "Purushottama Yoga", english: "The Supreme Person" },
  { sanskrit: "Daivasura Sampad Vibhaga Yoga", english: "The Divine & the Demoniac" },
  { sanskrit: "Shraddhatraya Vibhaga Yoga", english: "The Threefold Faith" },
  { sanskrit: "Moksha Sanyasa Yoga", english: "Liberation Through Renunciation" },
];

const WHY = [
  { icon: BookOpen, title: "Complete Gita", desc: "All 18 chapters, start to finish — nothing skipped." },
  { icon: Languages, title: "Plain Telugu", desc: "Explained the way you'd explain it to family, not a lecture hall." },
  { icon: Timer, title: "30–40 Min a Day", desc: "Fits into an evening. No long-term commitment beyond 18 days." },
  { icon: Sparkles, title: "ISKCON Guidance", desc: "Led by ISKCON Kurnool teachers, rooted in tradition." },
];

function safeUrl(u: string): string | undefined {
  if (!u) return undefined;
  try {
    const url = new URL(u, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function RegisterButton({ url, label = "Register Now" }: { url?: string; label?: string }) {
  const safe = typeof window !== "undefined" ? safeUrl(url ?? "") : url;
  if (!safe) {
    return (
      <button disabled className="inline-flex items-center px-8 py-3.5 rounded-full bg-muted text-muted-foreground font-semibold cursor-not-allowed">
        Registration opening soon
      </button>
    );
  }
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center px-8 py-3.5 rounded-full bg-accent text-white font-semibold hover:scale-105 hover:shadow-lg transition-all">
      {label}
    </a>
  );
}

function Page() {
  const { gitaCourse: g } = useAdmin();

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-40" />
        {/* decorative glow orbs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-28 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="animate-fade-up text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 text-secondary font-medium uppercase text-[11px] tracking-[0.25em]">
              <BookOpen className="h-3.5 w-3.5" /> {g.eyebrow}
            </span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
              {g.badges.filter(Boolean).map((b) => (
                <span key={b} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/15 text-xs font-medium">{b}</span>
              ))}
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl mt-6 leading-[1.05] tracking-tight">
              {g.title}
            </h1>
            <p className="mt-5 text-lg opacity-90 max-w-md mx-auto md:mx-0">{g.tagline}</p>
            <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 text-sm"><Calendar className="h-4 w-4 text-secondary" /> {g.dateRange}</span>
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 text-sm"><Clock className="h-4 w-4 text-secondary" /> {g.time}</span>
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 text-sm"><Monitor className="h-4 w-4 text-secondary" /> {g.mode}</span>
            </div>
            <div className="mt-8">
              <RegisterButton url={g.registerUrl} />
              <p className="mt-2.5 text-xs opacity-75">Takes less than a minute. No fee, ever.</p>
            </div>
          </div>

          {g.heroImage && (
            <div className="animate-fade-up">
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-secondary/40 to-accent/30 blur-xl opacity-70" />
                <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-white/25">
                  <img src={g.heroImage} alt="Bhagavad Gita Course" className="w-full h-auto object-cover" style={{ aspectRatio: "1080 / 1350" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ABOUT */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-accent font-medium uppercase text-xs tracking-[0.25em]">About the Course</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-3">Ancient wisdom, explained for how you actually live</h2>
          <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p>The Bhagavad Gita is not a relic to admire from a distance — it's a conversation between Krishna and Arjuna that speaks directly to doubt, duty, fear, and purpose. The questions Arjuna asked on the battlefield are the same ones we quietly carry today.</p>
            <p>Over 18 evenings, we'll go through the Gita exactly as it was taught — one chapter each night — explained simply, in Telugu, with real-life context. No prior knowledge needed. Just eighteen nights, and eighteen chapters, start to finish.</p>
          </div>
          <blockquote className="mt-8 border-l-4 border-secondary pl-5 italic text-primary font-display text-lg">
            "Whenever there is a decline in righteousness and an increase in unrighteousness, I manifest myself."
            <footer className="mt-2 text-sm not-italic text-muted-foreground">— Bhagavad Gita, Chapter 4</footer>
          </blockquote>
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-accent font-medium uppercase text-xs tracking-[0.25em]">Why Join</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-3">Built to actually finish</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((w) => (
              <div key={w.title} className="p-6 rounded-2xl bg-white border border-border hover:shadow-elegant hover:-translate-y-1 transition">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center mb-4 shadow-glow">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-primary mb-1.5">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE STRIP */}
      <section className="py-12 bg-gradient-hero text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Calendar, k: "Starts", v: g.startLabel },
            { icon: Calendar, k: "Ends", v: g.endLabel },
            { icon: Clock, k: "Time", v: g.time },
            { icon: IndianRupee, k: "Fee", v: g.fee },
          ].map((s) => (
            <div key={s.k}>
              <s.icon className="h-6 w-6 mx-auto text-secondary" />
              <div className="mt-2 text-xs uppercase tracking-widest opacity-75">{s.k}</div>
              <div className="font-display font-bold text-lg mt-0.5">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-accent font-medium uppercase text-xs tracking-[0.25em]">The Journey</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-3">Eighteen Chapters, Eighteen Nights</h2>
            <p className="mt-3 text-muted-foreground">Hover or tap a mark on the wheel to reveal that night's chapter.</p>
          </div>
          <div className="mt-12">
            <ChapterWheel chapters={CHAPTERS} />
          </div>

        </div>
      </section>

      {/* REGISTRATION */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="text-accent font-medium uppercase text-xs tracking-[0.25em]">Registration</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-3">Reserve your seat for the journey</h2>
          <p className="mt-4 text-muted-foreground">Registration is free and open through July 14. Once you register, you'll receive the daily session link directly.</p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <RegisterButton url={g.registerUrl} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" /> {g.fee} · {g.mode} · Daily
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <section className="py-10 bg-gradient-hero text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="font-display font-bold text-xl">ISKCON KURNOOL</h3>
          <a href={`tel:${g.contact.replace(/\s+/g, "")}`} className="mt-2 inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100">
            <Phone className="h-4 w-4 text-secondary" /> Questions? Call/WhatsApp {g.contact}
          </a>
          <p className="mt-2 text-xs opacity-70">Telugu Gita Online Course · {g.dateRange}</p>
        </div>
      </section>
    </SiteLayout>
  );
}
