import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Sunrise, Sun, Sunset, Heart, MapPin, Navigation } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const Route = createFileRoute("/temple/")({
  head: () => ({ meta: [
    { title: "Temple — ISKCON Kurnool" },
    { name: "description", content: "Temple timings, Sunday programs, festivals and how to volunteer at ISKCON Kurnool." },
  ]}),
  component: Page,
});

const schedule = [
  { name: "Subha Mangala Harati", time: "4:30 AM", period: "Morning", icon: Sunrise, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { name: "Harinama Japa", time: "5:15 AM – 7:00 AM", period: "Morning", icon: Sunrise, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { name: "Darshan Arati", time: "7:30 AM", period: "Morning", icon: Sunrise, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { name: "Srimad Bhagavatam Class", time: "8:15 AM", period: "Morning", icon: Sunrise, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { name: "Rajbhoga Arati", time: "12:00 PM", period: "Afternoon", icon: Sun, iconColor: "text-orange-500 bg-orange-50 dark:bg-orange-950/30" },
  { name: "Gaura Arati", time: "6:30 PM", period: "Evening", icon: Sunset, iconColor: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
];

function Page() {
  const { sunday, settings } = useAdmin();
  const logoUrl = sunday.logo || settings.logo;

  return (
    <SiteLayout>
      <PageHero eyebrow="Daily Worship" title="The Temple" subtitle="Timings, Programs, Festivals & Service" pageKey="temple" />
      
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 className="font-display text-4xl font-bold text-primary mb-4">Temple Daily Schedule</h2>
            <div className="h-1 w-24 bg-secondary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground text-lg">
              Join us for the daily worship, chanting, and spiritual discourses. All programs are open to the public.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-12">
            {/* Left Side: Daily Temple Schedule */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-card overflow-hidden shadow-elegant animate-fade-up">
              <div className="divide-y divide-border/60">
                {schedule.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.name} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 transition-colors hover:bg-muted/30 ${
                        i % 2 === 0 ? "bg-white" : "bg-background/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl border border-border/40 ${item.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-lg">{item.name}</h4>
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.period}</span>
                        </div>
                      </div>
                      <div className="flex items-center self-start sm:self-center">
                        <span className="text-accent font-sans font-semibold text-base sm:text-lg bg-surface/40 border border-secondary/20 px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Address & Directions Card */}
            <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elegant space-y-6 animate-fade-up flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Logo */}
              <div className="self-center mx-auto mb-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="ISKCON Kurnool Logo"
                    className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-4 ring-secondary/50 shadow-glow animate-fade-in"
                  />
                ) : (
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-xl md:text-2xl shadow-glow">
                    IK
                  </div>
                )}
              </div>

              <div className="space-y-3 w-full">
                <h3 className="font-display text-2xl font-bold text-primary flex items-center justify-center lg:justify-start gap-2.5">
                  <Heart className="h-6 w-6 text-accent shrink-0" />
                  {sunday.visitTitle || "Visit ISKCON Kurnool"}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {sunday.visitDescription || "Experience peace, devotion, and spiritual happiness. We warmly welcome you and your family."}
                </p>
              </div>

              <div className="flex items-start gap-3.5 pt-2 text-left w-full justify-center lg:justify-start">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-accent" />
                <p className="whitespace-pre-line text-sm leading-relaxed font-sans font-medium text-foreground">
                  {sunday.address || "ISKCON Kurnool\nSri Sri Puri Jagannath Temple\nKurnool, Andhra Pradesh\nIndia"}
                </p>
              </div>

              {sunday.directionsUrl && (
                <div className="pt-2 w-full flex justify-center lg:justify-start">
                  <a
                    href={sunday.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold shadow-gold transition hover:scale-[1.03]"
                  >
                    <Navigation className="h-4 w-4 shrink-0" />
                    Get Directions
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
