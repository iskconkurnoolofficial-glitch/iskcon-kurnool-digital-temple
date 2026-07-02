import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Sunrise, Sun, Sunset } from "lucide-react";

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
  return (
    <SiteLayout>
      <PageHero eyebrow="Daily Worship" title="The Temple" subtitle="Timings, Programs, Festivals & Service" />
      
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 className="font-display text-4xl font-bold text-primary mb-4">Daily Temple Schedule</h2>
            <div className="h-1 w-24 bg-secondary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground text-lg">
              Join us for the daily worship, chanting, and spiritual discourses. All programs are open to the public.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant animate-fade-up">
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

          <div className="max-w-2xl mx-auto mt-12 rounded-2xl border border-secondary/30 bg-surface/50 p-6 md:p-8 text-center shadow-gold animate-fade-up">
            <h3 className="font-display text-2xl font-bold text-primary mb-3">Sunday Feast Program</h3>
            <p className="text-foreground text-lg">
              Every Sunday from <span className="font-bold text-accent">5:00 PM</span> onwards. 
              Join us for uplifting congregational kirtan, an inspiring lecture, and delicious prasadam.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
