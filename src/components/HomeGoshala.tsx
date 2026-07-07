import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { Heart, MapPin, ArrowRight, ShieldCheck, Sparkles, Sprout } from "lucide-react";

export default function HomeGoshala() {
  const { goshala } = useAdmin();

  const mainImg = goshala.aboutImage || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80";

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-background via-surface/20 to-background border-t border-border/40">
      {/* Decorative Rotating Mandala decoration */}
      <motion.img
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        src="/mandala.png"
        alt="Decorative Mandala"
        className="absolute -right-24 -top-24 w-64 sm:w-80 h-auto opacity-[0.06] pointer-events-none select-none filter drop-shadow-[0_0_50px_rgba(91,44,155,0.15)]"
      />
      <motion.img
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
        src="/mandala.png"
        alt="Decorative Mandala Left"
        className="absolute -left-32 -bottom-32 w-80 sm:w-96 h-auto opacity-[0.06] pointer-events-none select-none filter drop-shadow-[0_0_60px_rgba(232,103,12,0.12)]"
      />

      {/* Premium subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.4] pointer-events-none" />

      {/* Modern mesh-like glowing backdrops */}
      <div className="absolute top-12 right-1/4 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Content Details */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-3 text-accent font-semibold uppercase text-xs tracking-[0.35em]">
                <span className="h-px w-8 bg-accent/30" />
                {goshala.eyebrow || "Go-Seva"}
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-primary tracking-tight leading-tight">
                {goshala.title || "Goshala Seva"}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base font-sans tracking-wide">
                {goshala.subtitle || "Maintained by ISKCON Kurnool"}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <Link
                to="/goshala"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer text-sm font-sans"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              {goshala.buttonUrl && (
                <a
                  href={goshala.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card text-foreground/80 font-medium hover:bg-surface/50 hover:text-foreground transition duration-200 text-sm font-sans"
                >
                  <MapPin className="h-4 w-4 text-accent" />
                  {goshala.buttonLabel || "Visit Goshala"}
                </a>
              )}
            </div>

            {/* Elegant branded quote card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-6 sm:p-8 rounded-3xl border border-primary/10 bg-card/85 backdrop-blur-md shadow-elegant"
            >
              <div className="absolute -top-4 -left-3 text-6xl text-primary/10 font-serif pointer-events-none select-none">“</div>
              <p className="font-display text-sm sm:text-base md:text-lg text-foreground/90 italic leading-relaxed font-medium">
                {goshala.aboutText1}
              </p>
            </motion.div>

            {/* Dynamic key highlights with neat layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-primary">
                  <Sprout className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-foreground/90 font-semibold text-sm">Organic Nutrition</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">High-quality fodder and grains for good health.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-accent/5 border border-accent/10 text-accent">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-foreground/90 font-semibold text-sm">Sacred Protection</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Safe, spacious shelter with lifetime loving care.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Neat Arrangement Layout (Single high-impact image) */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[480px] aspect-[4/3]"
            >
              {/* Back glowing ambient ring */}
              <div className="absolute inset-4 rounded-[40px] bg-gradient-to-tr from-primary/5 to-accent/5 blur-xl pointer-events-none" />

              {/* Main large image */}
              <div className="absolute inset-0 rounded-[36px] overflow-hidden shadow-elegant border border-border group/img1 z-10">
                <img
                  src={mainImg}
                  alt="Mother Cow Protection"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img1:scale-103"
                  loading="lazy"
                />
              </div>

              {/* Floating golden premium label */}
              <div className="absolute -top-3 -right-2 bg-gradient-to-r from-accent to-accent/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-gold border border-accent/20 z-40">
                <Sparkles className="h-3 w-3 text-white animate-pulse" />
                Vrindavan Gokula Seva
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
