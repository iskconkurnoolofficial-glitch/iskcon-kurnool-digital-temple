import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Sparkles, Compass, CheckCircle2, Heart } from "lucide-react";

export const Route = createFileRoute("/about/kurnool")({
  head: () => ({
    meta: [
      { title: "About ISKCON Kurnool — Sri Sri Puri Jagannath Temple" },
      { name: "description", content: "Learn about ISKCON Kurnool, our presiding Deities Sri Sri Jagannath, Baladeva, and Subhadra Maharani, and our spiritual mission." },
    ]
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our Temple"
        title="ISKCON Kurnool"
        subtitle="A Spiritual Sanctuary of Bhakti, Devotion & Wisdom"
        pageKey="aboutKurnool"
      />

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-background">
        <div className="max-w-4xl mx-auto px-6 space-y-12 animate-fade-up">

          {/* Main Description text */}
          <div className="space-y-6 text-lg text-foreground/80 leading-relaxed font-sans max-w-3xl mx-auto">
            <p>
              Welcome to ISKCON Kurnool, a spiritual sanctuary dedicated to spreading the timeless teachings of Lord Sri Krishna through Bhakti Yoga. As a center of the International Society for Krishna Consciousness (ISKCON), founded by His Divine Grace A. C. Bhaktivedanta Swami Prabhupada, our mission is to inspire individuals and families to lead a life of devotion, wisdom, compassion, and spiritual fulfillment.
            </p>
            <p>
              At ISKCON Kurnool, the presiding Deities are Sri Sri Jagannath, Baladeva, and Subhadra Maharani, whose divine presence blesses devotees with love, protection, and spiritual inspiration. The temple provides a peaceful atmosphere where everyone—regardless of age, background, or nationality—is warmly welcomed to experience Krishna consciousness.
            </p>
            <p>
              Our temple hosts daily Darshan, Mangala Arati, Bhagavad-gita and Srimad Bhagavatam classes, Harinama Sankirtana, Sunday spiritual programs, festivals, youth activities, and prasadam distribution. Through these devotional activities, we strive to nourish both the heart and the soul while preserving the rich heritage of Vedic culture.
            </p>
          </div>

          {/* Motto Quote Card */}
          <div className="bg-[#fdf6ec] border-2 border-secondary/40 rounded-3xl p-6 md:p-8 shadow-gold relative overflow-hidden max-w-2xl mx-auto text-center animate-scale-in">
            <span className="absolute top-2 left-4 text-6xl text-secondary/20 font-serif select-none pointer-events-none">“</span>
            <p className="text-primary font-display italic text-lg md:text-xl leading-relaxed relative z-10 font-bold">
              Serving the Lord with devotion and serving humanity with compassion.
            </p>
            <span className="absolute bottom-1 right-4 text-6xl text-secondary/20 font-serif select-none pointer-events-none">”</span>
          </div>

          {/* Mission Section */}
          <div className="pt-10">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="h-3.5 w-3.5" /> Compass
              </span>
              <h2 className="font-display text-3xl font-bold text-primary">Our Mission</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                { title: "Spread teachings of Bhagavad-gita", desc: "Spread the teachings of the Bhagavad-gita and Vedic wisdom." },
                { title: "Encourage holy name chanting", desc: "Encourage the chanting of the Hare Krishna Mahamantra." },
                { title: "Foster a supportive community", desc: "Foster a compassionate and spiritually enriched community." },
                { title: "Devotional service opportunities", desc: "Offer opportunities for devotional service, learning, and personal transformation." }
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground text-base md:text-lg">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maha-Mantra Focal Callout */}
          <div className="max-w-xl mx-auto rounded-3xl bg-[#fdf6ec] border border-secondary/30 p-8 md:p-10 text-center shadow-elegant relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-secondary/10 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-primary/5 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2">
                <Heart className="h-3.5 w-3.5 fill-accent/20" /> Maha-Mantra
              </span>

              <div className="space-y-3 font-display text-lg sm:text-xl md:text-2xl text-primary font-bold leading-relaxed max-w-md mx-auto">
                <div className="bg-white/80 border border-secondary/20 rounded-2xl px-5 py-3 shadow-sm text-gradient">
                  Hare Krishna, Hare Krishna,{"\n"}Krishna Krishna, Hare Hare
                </div>
                <div className="bg-white/80 border border-secondary/20 rounded-2xl px-5 py-3 shadow-sm text-gradient">
                  Hare Rama, Hare Rama,{"\n"}Rama Rama, Hare Hare
                </div>
              </div>

              <p className="text-xs uppercase tracking-widest text-[#6b5c54] font-sans font-semibold mt-4">
                Chant and be happy
              </p>
            </div>
          </div>

        </div>
      </section>
    </SiteLayout>
  );
}
