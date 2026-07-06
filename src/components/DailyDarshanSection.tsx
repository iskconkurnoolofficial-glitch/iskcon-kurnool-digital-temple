import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Compass, Sun, Sunrise, Sunset, Moon, ArrowRight } from "lucide-react";

type TimingItem = {
  name: string;
  time: string;
  desc: string;
  icon: any;
  color: string;
};

export default function DailyDarshanSection() {
  const [darshan, setDarshan] = useState({ open: false, status: "Checking Altar Status..." });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hrs = now.getHours();
      const mins = now.getMinutes();
      const timeVal = hrs * 60 + mins;

      // 4:30 AM to 5:00 AM (Mangala)
      if (timeVal >= 270 && timeVal <= 300) {
        setDarshan({ open: true, status: "Open (Mangala Aarti)" });
      }
      // 7:30 AM to 1:00 PM (Morning Darshan)
      else if (timeVal >= 450 && timeVal <= 780) {
        setDarshan({ open: true, status: "Open (Morning Darshan)" });
      }
      // 4:30 PM to 8:30 PM (Evening Darshan)
      else if (timeVal >= 990 && timeVal <= 1230) {
        setDarshan({ open: true, status: "Open (Evening Darshan & Aarti)" });
      }
      // Closed times
      else {
        let nextTime = "4:30 AM";
        if (timeVal < 450 && timeVal > 300) nextTime = "7:30 AM";
        else if (timeVal < 990 && timeVal > 780) nextTime = "4:30 PM";
        setDarshan({ open: false, status: `Closed (Next Darshan: ${nextTime})` });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const timings: TimingItem[] = [
    {
      name: "Mangala Aarti",
      time: "04:30 AM",
      desc: "The auspicious first worship of the day at early dawn.",
      icon: Sunrise,
      color: "from-amber-500/10 to-orange-500/10 text-orange-600 border-orange-500/20",
    },
    {
      name: "Darshan Aarti",
      time: "07:30 AM",
      desc: "Lord's morning darshan, dressed in elegant fresh attire.",
      icon: Sun,
      color: "from-yellow-500/10 to-amber-500/10 text-amber-600 border-yellow-500/20",
    },
    {
      name: "Rajbhoga Aarti",
      time: "12:00 PM",
      desc: "Noon offering of exquisite bhoga items and worship.",
      icon: Clock,
      color: "from-orange-500/10 to-red-500/10 text-red-600 border-red-500/20",
    },
    {
      name: "Sandhya Gaura Aarti",
      time: "06:30 PM",
      desc: "Evening lamps offering accompanied by sweet kirtan tunes.",
      icon: Sunset,
      color: "from-indigo-500/10 to-purple-500/10 text-purple-600 border-indigo-500/20",
    },
  ];

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
          
          {/* Left Column: Live Altar Status Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-[32px] bg-white border border-border/80 shadow-elegant relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Live Tag */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darshan.open ? "bg-green-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${darshan.open ? "bg-green-500" : "bg-red-500"}`}></span>
                </span>
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase font-sans">
                  Live Altar Status
                </span>
              </div>

              {/* Status Header */}
              <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mt-4 mb-2">
                {darshan.open ? "Altar is Open" : "Altar is Closed"}
              </h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">
                Current State: <span className="font-semibold text-primary">{darshan.status}</span>
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

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/temple"
                className="flex-1 text-center py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all text-xs font-sans shadow-sm"
              >
                Detailed Daily Schedule
              </Link>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-3.5 rounded-2xl border hover:bg-surface/5 transition-all text-xs font-semibold text-foreground font-sans flex items-center justify-center gap-1.5"
              >
                Get Directions <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Aarti Timings List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {timings.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-border/80 hover:border-secondary/40 transition-all duration-300 hover:shadow-elegant group"
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`p-3.5 rounded-2xl border bg-gradient-to-tr ${t.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-display font-bold text-base md:text-lg text-primary">
                        {t.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-sans max-w-sm sm:max-w-md leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex self-start sm:self-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/5 text-accent font-bold text-xs font-sans tracking-wide">
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
