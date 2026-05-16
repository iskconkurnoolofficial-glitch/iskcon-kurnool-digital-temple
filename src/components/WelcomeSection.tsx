import { Link } from "@tanstack/react-router";

export default function WelcomeSection() {
  return (
    <section id="welcome" className="relative py-20 md:py-28 bg-surface overflow-hidden">
      <div className="absolute inset-0 bg-gradient-soft pointer-events-none" />

      {/* Decorative ornaments */}
      <img
        src="/decor/ornament-4.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -top-10 -left-16 w-64 md:w-96 opacity-20"
      />
      <img
        src="/decor/ornament-1.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -bottom-16 -right-16 w-64 md:w-96 opacity-15"
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-up">
        <span className="divider-gold text-secondary font-medium uppercase text-xs tracking-[0.3em]">Sri Sri Puri Jagannath</span>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-primary mt-6 mb-3 tracking-tight">HARE KRISHNA!</h1>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground/80 mb-8">WELCOME TO ISKCON KURNOOL!</h2>
        <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
          Welcome to the abode of Sri Sri Puri Jagannath, Baladeva, and Subhadra, where the most-benevolent Lord
          has come to receive your love and to fill your lives with His grace. As devotees of the Lord we are here
          to serve you and look forward to welcoming you at our temple.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/about/kurnool"
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-accent text-white font-semibold hover:scale-105 hover:shadow-lg transition-all"
          >
            Learn More About Sri Sri Puri Jagannath Temple
          </Link>
        </div>
      </div>
    </section>
  );
}
