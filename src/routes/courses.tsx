import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { BookOpen, Users, Sunrise } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [
    { title: "Courses — ISKCON Kurnool" },
    { name: "description", content: "Bhagavad Gita courses, daily classes and youth programs at ISKCON Kurnool." },
  ]}),
  component: Page,
});

const courses = [
  { icon: BookOpen, title: "Bhagavad Gita Course", desc: "A guided journey through Lord Krishna's eternal wisdom, chapter by chapter." },
  { icon: Sunrise, title: "Daily Classes", desc: "Morning Srimad Bhagavatam class and evening Bhagavad Gita discourse." },
  { icon: Users, title: "Youth Program", desc: "Weekly gatherings for students and young professionals — kirtan, philosophy, prasadam." },
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Spiritual Learning" title="Courses & Classes" subtitle="Vedic wisdom for the modern seeker" pageKey="courses" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.title} className="p-8 rounded-2xl bg-surface border border-border hover:shadow-elegant hover:-translate-y-1 transition">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center mb-5 shadow-glow">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-primary mb-2">{c.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
