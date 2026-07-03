import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { BookOpen, Sparkles, Sprout, Music, Landmark, Users, Scroll } from "lucide-react";

export const Route = createFileRoute("/about/mission")({
  head: () => ({ meta: [
    { title: "Our Mission — ISKCON Kurnool" },
    { name: "description", content: "The seven purposes of ISKCON as set forth by Srila Prabhupada." },
  ]}),
  component: Page,
});

const purposes = [
  {
    num: "01",
    title: "Systematic Education",
    desc: "To systematically propagate spiritual knowledge to society at large and educate all people in the techniques of spiritual life.",
    icon: BookOpen,
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  },
  {
    num: "02",
    title: "Krishna Consciousness",
    desc: "To propagate a consciousness of Krishna as revealed in the sacred texts of Bhagavad-gita and Srimad-Bhagavatam.",
    icon: Sparkles,
    color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400"
  },
  {
    num: "03",
    title: "Simple & Natural Living",
    desc: "To bring members closer together for the purpose of teaching a simpler, more natural, and sustainable way of life.",
    icon: Sprout,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
  },
  {
    num: "04",
    title: "Sankirtana Movement",
    desc: "To teach and encourage the sankirtana movement of congregational chanting of the holy names of God.",
    icon: Music,
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400"
  },
  {
    num: "05",
    title: "Transcendental Spaces",
    desc: "To erect for the members and society at large a holy place of transcendental pastimes dedicated to Krishna.",
    icon: Landmark,
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400"
  },
  {
    num: "06",
    title: "Spiritual Community",
    desc: "To bring members closer together for the purpose of developing a loving and cooperative Krishna conscious community.",
    icon: Users,
    color: "from-rose-500/10 to-orange-500/10 text-rose-600 dark:text-rose-400"
  },
  {
    num: "07",
    title: "Spiritual Literature",
    desc: "To publish and distribute periodicals, magazines, books, and other writings to nourish the spiritual growth of society.",
    icon: Scroll,
    color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400"
  }
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Purpose" title="Our Mission" subtitle="The Seven Purposes of ISKCON" pageKey="aboutMission" />
      
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-background relative overflow-hidden">
        {/* Soft background decor orbs */}
        <div className="absolute top-1/4 left-[10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-secondary/5 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Founding Vision</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-primary mt-3">The 7 Purposes of ISKCON</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Formulated by our Founder-Acharya, His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, in 1966 to guide the society's activities and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {purposes.map((p, i) => {
              const Icon = p.icon;
              const isLast = i === purposes.length - 1;
              return (
                <div 
                  key={p.num} 
                  className={`group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                    isLast ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* Backdrop glowing number */}
                  <span className="absolute right-6 top-4 font-display font-black text-6xl text-foreground/[0.03] select-none group-hover:text-primary/[0.06] transition-colors duration-300">
                    {p.num}
                  </span>

                  <div>
                    {/* Icon container */}
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${p.color.split(" ")[0]} ${p.color.split(" ")[1]} mb-6 shadow-inner`}>
                      <Icon className={`h-6 w-6 ${p.color.split(" ")[2]} group-hover:scale-110 transition-transform duration-300`} />
                    </div>

                    <h3 className="font-display font-bold text-xl text-primary group-hover:text-secondary-foreground transition-colors duration-300 mb-3">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {p.desc}
                    </p>
                  </div>

                  {/* Decorative card indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/30 to-secondary/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
