import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Compass, Sun, Sunrise, Sunset, ArrowRight } from "lucide-react";
import { useAdmin, defaultTempleSchedule } from "@/context/AdminContext";
import { isTimeStrLive } from "@/lib/scheduleUtils";

export default function DailyDarshanSection() {
  const { templeSchedule } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const rawItems = templeSchedule && templeSchedule.length > 0 ? templeSchedule : defaultTempleSchedule;
  
  const filtered = [...rawItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeLiveItem = filtered.find(item => isTimeStrLive(item.time));
  const isOpen = !!activeLiveItem;
  const statusStr = isOpen ? `Open (${activeLiveItem.name})` : "Closed (Check daily schedule)";

  const getTimingDescription = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("mangala")) return "The auspicious first worship of the day at early dawn.";
    if (n.includes("darshan")) return "Lord's morning darshan, dressed in elegant fresh attire.";
    if (n.includes("rajbhoga") || n.includes("bhoga")) return "Noon offering of exquisite bhoga items and worship.";
    if (n.includes("gaura") || n.includes("sandhya") || n.includes("evening")) return "Evening lamps offering accompanied by sweet kirtan tunes.";
    if (n.includes("tulasi")) return "Worship of the sacred Tulasi plant for devotional growth.";
    if (n.includes("class") || n.includes("lectur") || n.includes("discourse") || n.includes("bhagavatam")) return "Daily study of sacred scriptures and spiritual discourses.";
    return "Daily devotional worship service and prayers.";
  };

  const getTimingColor = (iconName: string, isLive: boolean) => {
    if (isLive) {
      return "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-500/30";
    }
    switch (iconName?.toLowerCase()) {
      case "sunrise": return "from-amber-500/10 to-orange-500/10 text-orange-600 border-orange-500/20";
      case "sun": return "from-yellow-500/10 to-amber-500/10 text-amber-600 border-yellow-500/20";
      case "sunset": return "from-indigo-500/10 to-purple-500/10 text-purple-600 border-indigo-500/20";
      default: return "from-orange-500/10 to-red-500/10 text-red-600 border-red-500/20";
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "sunrise": return Sunrise;
      case "sun": return Sun;
      case "sunset": return Sunset;
      default: return Clock;
    }
  };

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-[#fffdf5] via-[#fdf3d1] to-[#ffffff] overflow-hidden">
      {/* Decorative backdrop graphics */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase text-xs tracking-wider">
            Daily Temple Schedule
          </span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary tracking-tight">
            Daily Darshan & Aarti Timings
          </h2>
          <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
            Plan your visit to the temple to experience high-vibrational morning prayers, noon offerings, and evening kirtans.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Live Temple Status Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-[32px] bg-white border border-border/80 shadow-elegant relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Live Tag */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? "bg-green-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
                </span>
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase font-sans">
                  Live Temple Status
                </span>
              </div>

              {/* Status Header */}
              <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mt-4 mb-2">
                {isOpen ? "Temple is Open" : "Temple is Closed"}
              </h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">
                Current State: <span className="font-semibold text-primary">{statusStr}</span>
              </p>

              <div className="h-px bg-border/80 w-full my-6" />

              {/* Timings Info details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-foreground/80">Temple Opening Hours</h4>
                    <p className="text-sm text-muted-foreground">04:30 AM to 01:00 PM <span className="text-xs text-muted-foreground/60">(Morning)</span></p>
                    <p className="text-sm text-muted-foreground">04:30 PM to 08:30 PM <span className="text-xs text-muted-foreground/60">(Evening)</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Compass className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-foreground/80">Temple Address</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      Sri Sri Jagannath Baladev Subhadra Temple,{"\n"}Kurnool, Andhra Pradesh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2.5">
              <Link
                to="/daily-darshan"
                className="w-full text-center py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold hover:scale-[1.01] transition-all text-xs font-sans shadow-gold flex items-center justify-center gap-1.5"
              >
                <Sun className="h-4 w-4" /> View Today's Daily Darshan Photos
              </Link>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  to="/temple"
                  className="flex-1 text-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all text-xs font-sans shadow-2xs"
                >
                  Daily Schedule
                </Link>
                <a
                  href="https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-3 rounded-xl border hover:bg-surface/5 transition-all text-xs font-semibold text-foreground font-sans flex items-center justify-center gap-1.5"
                >
                  Get Directions <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Aarti Timings List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {filtered.map((t) => {
              const isLive = isTimeStrLive(t.time);
              const Icon = getIcon(t.iconName);
              const color = getTimingColor(t.iconName, isLive);
              const desc = getTimingDescription(t.name);
              
              return (
                <div
                  key={t.id || t.name}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 hover:shadow-elegant group ${
                    isLive 
                      ? "bg-amber-50/70 border-amber-500 dark:bg-amber-950/20" 
                      : "bg-white border-border/80 hover:border-secondary/40"
                  }`}
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`p-3.5 rounded-2xl border bg-gradient-to-tr ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base md:text-lg text-primary">
                          {t.name}
                        </h3>
                        {isLive && (
                          <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-sans max-w-sm sm:max-w-md leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex self-start sm:self-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs font-sans tracking-wide ${
                      isLive ? "bg-amber-500/15 text-amber-700" : "bg-amber-500/5 text-accent"
                    }`}>
                      <Clock className="h-3.5 w-3.5" />
                      {t.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
