import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
  BookOpen,
  Heart,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Compass
} from "lucide-react";

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
    iconBg: string;
    border: string;
  };
};

export default function FeaturedOfferingsSection() {
  const offerings: Offering[] = [
    {
      title: "Prahlada Badi Kids Program",
      badge: "Values & Heritage",
      desc: "Giving children the opportunity to learn timeless Vedic values, sloka recitation, arts, and character building in a joyful spiritual atmosphere.",
      link: "/prahlada-badi",
      icon: GraduationCap,
      color: {
        bg: "from-amber-500/10 to-orange-500/5",
        text: "text-amber-900",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
        badgeText: "text-amber-900",
        btn: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        iconBg: "from-amber-500 to-orange-500 text-white shadow-amber-500/30",
        border: "border-amber-200 hover:border-amber-400",
      },
    },
    {
      title: "Bhagavad Gita Wisdom Courses",
      badge: "Systematic Vedic Study",
      desc: "Deepen your understanding of spiritual science. Explore the 18 chapters of Bhagavad Gita in an interactive, easy-to-apply way for daily life.",
      link: "/gita-course",
      icon: BookOpen,
      color: {
        bg: "from-purple-500/10 to-indigo-500/5",
        text: "text-purple-950",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
        badgeText: "text-purple-900",
        btn: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
        iconBg: "from-purple-500 to-indigo-600 text-white shadow-purple-500/30",
        border: "border-purple-200 hover:border-purple-400",
      },
    },
    {
      title: "Bhakti Steps Sadhana Journey",
      badge: "Spiritual Growth",
      desc: "Progress step-by-step through the 5 levels of devotional sadhana — Sraddhavan, Sevaka, Sadhaka, Vamsi, and Paramahamsa.",
      link: "/bhakti-steps",
      icon: Award,
      color: {
        bg: "from-rose-500/10 to-amber-500/5",
        text: "text-rose-950",
        badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
        badgeText: "text-rose-900",
        btn: "bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700",
        iconBg: "from-rose-500 to-amber-600 text-white shadow-rose-500/30",
        border: "border-rose-200 hover:border-rose-400",
      },
    },
    {
      title: "Gau Seva & Cow Sanctuary",
      badge: "Compassion & Protection",
      desc: "Participate in Gau-seva by supporting our temple goshala sanctuary. Help feed, serve, and protect cows with sincere devotion.",
      link: "/goshala",
      icon: Heart,
      color: {
        bg: "from-emerald-500/10 to-teal-500/5",
        text: "text-emerald-950",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
        badgeText: "text-emerald-900",
        btn: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
        iconBg: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
        border: "border-emerald-200 hover:border-emerald-400",
      },
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#fffdfa] via-[#fdf8f0] to-[#fffdf9] overflow-hidden border-t border-b border-amber-200/60">
      {/* Ambient background glows */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300/60 text-amber-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Community Initiatives &amp; Education</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#5b2c9b] tracking-tight leading-tight">
            Sacred Activities &amp; Services
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Explore diverse spiritual opportunities to learn, grow in devotion, engage children in cultural values, and render loving service.
          </p>
        </div>

        {/* 4-Column Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((o) => {
            const Icon = o.icon;
            return (
              <article
                key={o.title}
                className={`group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border-2 ${o.color.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5`}
              >
                <div className="space-y-4">
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${o.color.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${o.color.badgeBg}`}>
                      {o.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 group-hover:text-amber-800 transition-colors">
                      {o.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {o.desc}
                    </p>
                  </div>
                </div>

                {/* CTA Link */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <Link
                    to={o.link}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${o.color.btn} text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-300 hover:scale-102 cursor-pointer`}
                  >
                    <span>Explore Program</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
