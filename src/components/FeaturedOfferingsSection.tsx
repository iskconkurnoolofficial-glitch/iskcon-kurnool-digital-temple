import { Link } from "@tanstack/react-router";
import { GraduationCap, BookOpen, Heart, ArrowRight } from "lucide-react";

type Offering = {
  title: string;
  badge: string;
  desc: string;
  link: string;
  icon: any;
  color: {
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    btn: string;
    btnHover: string;
    iconBg: string;
    border: string;
  };
};

export default function FeaturedOfferingsSection() {
  const offerings: Offering[] = [
    {
      title: "Prahlada Badi Kids Program",
      badge: "Values & Education",
      desc: "Giving children the opportunity to spend time learning timeless spiritual values, discovering hidden talents, and building character in a joyful spiritual environment.",
      link: "/prahlada-badi",
      icon: GraduationCap,
      color: {
        bg: "bg-amber-500/5",
        text: "text-amber-800",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
        btnHover: "hover:border-amber-500/40",
        iconBg: "from-amber-400 to-amber-500 text-white shadow-amber-500/30",
        border: "border-amber-500/10",
      },
    },
    {
      title: "Bhagavad Gita Wisdom Classes",
      badge: "Scriptures & Wisdom",
      desc: "Deepen your understanding of spiritual truths. Explore the 18 chapters of Bhagavad Gita in a systematic, easy-to-understand way, applicable to modern daily life.",
      link: "/gita-course",
      icon: BookOpen,
      color: {
        bg: "bg-purple-500/5",
        text: "text-purple-800",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-800",
        btn: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
        btnHover: "hover:border-purple-500/40",
        iconBg: "from-purple-400 to-purple-500 text-white shadow-purple-500/30",
        border: "border-purple-500/10",
      },
    },
    {
      title: "Goshala Cow Protection",
      badge: "Compassion & Seva",
      desc: "Participate in Gau-seva by supporting our cow care sanctuary. Help feed, serve, and protect cows, which is considered one of the highest forms of spiritual devotion.",
      link: "/goshala",
      icon: Heart,
      color: {
        bg: "bg-emerald-500/5",
        text: "text-emerald-800",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-800",
        btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
        btnHover: "hover:border-emerald-500/40",
        iconBg: "from-emerald-400 to-emerald-500 text-white shadow-emerald-500/30",
        border: "border-emerald-500/10",
      },
    },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-white overflow-hidden border-t border-border/40">
      {/* Subtle backdrop shapes */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase text-xs tracking-wider">
            Temple Initiatives
          </span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary tracking-tight">
            Sacred Activities & Services
          </h2>
          <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
            Discover the different opportunities to study, grow, and serve with our community.
          </p>
        </div>

        {/* 3-Column Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerings.map((o) => {
            const Icon = o.icon;
            return (
              <article
                key={o.title}
                className={`group flex flex-col justify-between p-7 rounded-[28px] bg-white border border-border/85 transition-all duration-350 hover:-translate-y-1.5 hover:shadow-elegant ${o.color.btnHover}`}
              >
                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${o.color.iconBg} grid place-items-center shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase font-sans ${o.color.badgeBg} ${o.color.badgeText}`}>
                      {o.badge}
                    </span>
                  </div>

                  {/* Copy content */}
                  <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary mb-3">
                    {o.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-sans mb-8">
                    {o.desc}
                  </p>
                </div>

                {/* Button Action CTA */}
                <Link
                  to={o.link}
                  className={`w-full py-3.5 rounded-2xl text-white text-xs font-semibold uppercase tracking-wider font-sans text-center transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${o.color.btn}`}
                >
                  Explore More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
