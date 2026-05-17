import { Link } from "@tanstack/react-router";

export default function WelcomeSection() {
  return (
    <section id="welcome" className="relative py-20 md:py-28 bg-white">
      <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-up">
        <span className="inline-flex items-center gap-3 text-secondary font-semibold uppercase text-[11px] tracking-[0.35em]">
          <span className="h-px w-10 bg-secondary/70" />
          Sri Sri Puri Jagannath
          <span className="h-px w-10 bg-secondary/70" />
        </span>

        <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-primary mt-6 mb-2 tracking-[-0.02em] leading-[0.95]">
          Hare <span className="italic font-light text-accent">Krishna!</span>
        </h1>

        <h2 className="font-display font-medium text-2xl md:text-3xl text-foreground/70 mb-8 tracking-tight">
          Welcome to ISKCON Kurnool
        </h2>

        <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
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
