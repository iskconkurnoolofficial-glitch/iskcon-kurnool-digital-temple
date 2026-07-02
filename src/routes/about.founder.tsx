import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/about/founder")({
  head: () => ({ meta: [
    { title: "Founder Acharya — Srila Prabhupada — ISKCON Kurnool" },
    { name: "description", content: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, Founder Acharya of ISKCON." },
  ]}),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero 
        eyebrow="Founder Acharya" 
        title="Srila Prabhupada" 
        subtitle="His Divine Grace A.C. Bhaktivedanta Swami Prabhupada" 
        pageKey="aboutFounder" 
      />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-10 animate-fade-up">
          
          {/* Main Biography content */}
          <div className="space-y-6 text-lg text-foreground/80 leading-relaxed font-sans max-w-3xl mx-auto">
            <p>
              His Divine Grace A. C. Bhaktivedanta Swami Prabhupada, Founder-Acharya of International Society for Krishna Consciousness (ISKCON), was born Abhay Charan De, on the 1 September 1896, in Calcutta. In 1922 he met His Divine Grace Bhaktisiddanta Sarasvati Thakur, Founder of Gaudiya Math, who requested Abhay to broadcast Vedic knowledge in the English medium. In 1933, at Allahabad, Abhay was formally initiated and made it his life ambition to expound the Vedic conclusion that real freedom means liberation from the miseries of material life: birth, death, old age and disease, a state that can be permanently attained by awakening one’s pure love for God, Krishna-prema or Krishna-bhakti.
            </p>
            
            <p>
              In the ensuing years Abhay Charanaravinda (his initiated name), wrote a commentary on the Bhagavad-gita. In 1944 he started the Back to Godhead magazine, which to this day is being continued by his disciples.
            </p>

            {/* Accent Highlighted Biography Box */}
            <div className="bg-[#fdf6ec] border-l-4 border-secondary p-6 rounded-r-3xl my-8 shadow-sm">
              <p className="text-primary italic leading-relaxed font-medium">
                In recognition of his philosophical knowledge and devotion the Gaudiya Vaishnava Society honored him with the title Bhaktivedanta in 1947. Following his retirement from married life, A.C. Bhaktivedanta traveled to Vrindavan where he lived in the humble surrounding of the Radha Damodar temple. In 1959 he took the sannyasa order of life and, as A.C. Bhaktivedanta Swami, started his work on the multi-volume translation and commentary of the 18,000 verse Srimad Bhagavatam. In 1965, at the age of 69, when ordinary persons are thinking of retirement, he went to the United States to fulfill the mission of his spiritual master and founded ISKCON.
              </p>
            </div>

            <p>
              He brought to the West the divine teachings of Lord Caitanya Mahaprabhu who taught the public glorification of Hare Krishna mantra. Srila Prabhupada, (as he was affectionately called by his followers), taught on a non-sectarian level that every living being is an eternal servant of Lord Krishna with a dormant natural propensity to experience the eternal bliss of pure love of God.
            </p>
          </div>

          {/* Slogan or Quote Callout */}
          <div className="max-w-xl mx-auto rounded-3xl bg-gradient-soft border border-secondary/40 p-8 text-center shadow-gold">
            <p className="font-display font-bold text-xl md:text-2xl text-primary leading-relaxed">
              "Chant Hare Krishna and be happy."
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">— Srila Prabhupada</p>
          </div>

        </div>
      </section>
    </SiteLayout>
  );
}
