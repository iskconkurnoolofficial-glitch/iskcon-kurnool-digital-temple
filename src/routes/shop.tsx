import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [
    { title: "Shop — ISKCON Kurnool" },
    { name: "description", content: "Temple shop — books, deities, japa malas and devotional items at ISKCON Kurnool." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Temple Store" title="Shop" subtitle="Books, deities, japa malas & devotional items" />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center mx-auto mb-6 shadow-glow">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-3">Our Shop is Coming Soon</h2>
          <p className="text-muted-foreground leading-relaxed">
            Visit the temple to explore Srila Prabhupada's books, beautiful deities, japa malas, incense and
            other devotional items. Online ordering will be available here soon.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
