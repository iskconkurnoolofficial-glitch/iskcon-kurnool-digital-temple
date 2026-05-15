import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/temple")({
  head: () => ({ meta: [
    { title: "Temple — ISKCON Kurnool" },
    { name: "description", content: "Temple timings, Sunday programs, festivals and how to volunteer at ISKCON Kurnool." },
  ]}),
  component: Page,
});

const schedule = [
  ["Mangala Arati", "4:30 AM"],
  ["Tulsi Puja", "5:00 AM"],
  ["Darshan Arati", "7:15 AM"],
  ["Srimad Bhagavatam Class", "8:00 AM"],
  ["Raj Bhog Arati", "12:30 PM"],
  ["Sandhya Arati", "7:00 PM"],
  ["Shayan Arati", "8:30 PM"],
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Daily Worship" title="The Temple" subtitle="Timings, Programs, Festivals & Service" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-primary mb-6 text-center">Daily Temple Schedule</h2>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-elegant">
            {schedule.map(([k, v], i) => (
              <div key={k} className={`flex justify-between items-center px-6 py-4 ${i % 2 ? "bg-white" : ""}`}>
                <span className="font-medium text-foreground">{k}</span>
                <span className="text-accent font-display font-bold">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground">
            Sunday Feast Program — every Sunday from 5:00 PM with kirtan, lecture and prasadam.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
