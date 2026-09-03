import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";

export const Route = createFileRoute("/youth-yatra")({
  head: () => ({
    meta: [
      { title: "Youth Program — ISKCON Kurnool" },
      { name: "description", content: "Explore the ISKCON Kurnool Youth Program." },
    ],
  }),
  component: YouthYatraPage,
});

function YouthYatraPage() {
  return (
    <SiteLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in max-w-xl mx-auto">
        <div className="h-20 w-20 rounded-3xl bg-amber-100 text-amber-800 grid place-items-center text-3xl font-bold shadow-md">
          🚩
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-primary">Youth Yatra Section Removed</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This section is currently unavailable. Please explore our active Youth Program and weekly youth satsang events.
          </p>
        </div>
        <a
          href="/youth"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:scale-105 transition cursor-pointer"
        >
          <span>Explore ISKCON Youth Program</span>
          <span>→</span>
        </a>
      </div>
    </SiteLayout>
  );
}
