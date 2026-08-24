import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Leaf,
  XCircle,
  CheckCircle2,
  Sun,
  BookOpen,
  AlertTriangle,
  Sunrise,
  Sunset,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Check,
  ChevronRight,
  Flame,
  Search,
  Filter,
  Volume2,
  RotateCcw,
  Heart,
  Moon,
  Info,
  X,
  ExternalLink,
  ChevronDown,
  Building,
  Music,
  Utensils
} from "lucide-react";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import vishnuAsset from "@/assets/vishnu-ekadashi.png.asset.json";
import { useAdmin, EkadashiCalendarItem, EkadashiScheduleItem, defaultEkadashiTempleSchedule } from "@/context/AdminContext";
import { toast } from "sonner";

export const Route = createFileRoute("/ekadashi")({
  head: () => ({
    meta: [
      { title: "Ekadashi Vratam Calendar & Spiritual Guidelines | ISKCON Kurnool" },
      {
        name: "description",
        content:
          "Ekadashi — the Mother of Devotion. Complete ISKCON Kurnool Ekadashi calendar, exact Parana breaking timings, temple festival schedule, Tulsi seva rules, fasting guidelines, morning practice, and Maha Mantra.",
      },
      { property: "og:title", content: "Ekadashi Vratam Calendar & Spiritual Guidelines | ISKCON Kurnool" },
      {
        property: "og:description",
        content: "Exact Kurnool Ekadashi fast dates, Dwadashi Parana windows, temple day schedule, Tulsi rules, and authentic Vaishnava fasting guidelines.",
      },
    ],
  }),
  component: EkadashiPage,
});

export default function EkadashiPage() {
  const { ekadashi: e } = useAdmin();
  const imageSrc = e.image || vishnuAsset.url;

  // Selected Ekadashi for Mahatmya story modal
  const [selectedEkadashi, setSelectedEkadashi] = useState<EkadashiCalendarItem | null>(null);

  // Calendar search & filter state
  const [calendarTab, setCalendarTab] = useState<"upcoming" | "all" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaksha, setSelectedPaksha] = useState<string>("all");

  // Temple Schedule period filter
  const [schedulePeriod, setSchedulePeriod] = useState<string>("all");

  // Interactive Japa Bead counter
  const [japaBeads, setJapaBeads] = useState<number>(0);
  const [japaRounds, setJapaRounds] = useState<number>(0);

  const incrementBead = () => {
    if (japaBeads + 1 >= 108) {
      setJapaBeads(0);
      setJapaRounds((r) => r + 1);
      toast.success("Hare Krishna! Completed 1 Japa Round (108 beads)!");
    } else {
      setJapaBeads((b) => b + 1);
    }
  };

  const resetJapa = () => {
    setJapaBeads(0);
    setJapaRounds(0);
  };

  // Find the next upcoming published Ekadashi
  const now = new Date();
  const todayIso = now.toISOString().split("T")[0];

  const publishedCalendar = useMemo(() => {
    return (e.calendar || [])
      .filter((item) => item.isPublished)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [e.calendar]);

  const upcomingList = useMemo(() => {
    return publishedCalendar.filter((item) => item.date >= todayIso);
  }, [publishedCalendar, todayIso]);

  const pastList = useMemo(() => {
    return publishedCalendar.filter((item) => item.date < todayIso);
  }, [publishedCalendar, todayIso]);

  const nextEkadashi = upcomingList[0] || publishedCalendar[0];

  // Temple schedule items
  const templeScheduleItems = useMemo(() => {
    const list = e.templeSchedule && e.templeSchedule.length > 0 ? e.templeSchedule : defaultEkadashiTempleSchedule;
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [e.templeSchedule]);

  const filteredScheduleItems = useMemo(() => {
    if (schedulePeriod === "all") return templeScheduleItems;
    return templeScheduleItems.filter((it) => it.period === schedulePeriod);
  }, [templeScheduleItems, schedulePeriod]);

  // Countdown timer state for Next Ekadashi
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!nextEkadashi?.date) return;

    const targetDate = new Date(nextEkadashi.date + "T06:00:00").getTime();

    const updateTimer = () => {
      const difference = targetDate - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextEkadashi?.date]);

  // Filtered calendar items based on active tab & search
  const displayedCalendar = useMemo(() => {
    let list = publishedCalendar;
    if (calendarTab === "upcoming") list = upcomingList;
    if (calendarTab === "past") list = pastList;

    return list.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.vaishnavaMonth && item.vaishnavaMonth.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.date.includes(searchQuery);
      const matchesPaksha = selectedPaksha === "all" || item.paksha === selectedPaksha;
      return matchesSearch && matchesPaksha;
    });
  }, [publishedCalendar, upcomingList, pastList, calendarTab, searchQuery, selectedPaksha]);

  // Share Ekadashi details
  const shareEkadashi = (item: EkadashiCalendarItem) => {
    const text = `🕉️ ${item.name} (${item.date}, ${item.day})\n🌅 Kurnool Dwadashi Parana: ${item.paranaDate} between ${item.paranaStartTime} – ${item.paranaEndTime}\n🌿 Note: Do not pluck Tulsi on Ekadashi or Dwadashi.\n\nView complete guidelines at ISKCON Kurnool: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: item.name, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Ekadashi & Parana timings copied to clipboard!");
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (item: EkadashiCalendarItem) => {
    const startDate = item.date.replace(/-/g, "");
    const title = encodeURIComponent(`${item.name} — ISKCON Kurnool Fasting Day`);
    const details = encodeURIComponent(
      `Fast for ${item.name}.\n🌅 Dwadashi Parana Breaking: ${item.paranaDate} between ${item.paranaStartTime} – ${item.paranaEndTime}.\n🌿 Injunction: Do not pluck Tulsi leaves on Ekadashi or Dwadashi.\n\nMore info: https://iskconkurnool.org/ekadashi`
    );
    const location = encodeURIComponent("ISKCON Kurnool Temple, Andhra Pradesh");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T060000/${startDate}T200000&details=${details}&location=${location}`;
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow={e.badge || "Sacred Observance"}
        title={e.title || "Ekadashi — The Mother of Devotion"}
        subtitle={e.subtitle || "Rules, Spiritual Guidelines & Dynamic Vaishnava Calendar"}
        pageKey="ekadashi"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-12 md:space-y-16">
        {/* ========================================================================= */}
        {/* 1. NEXT EKADASHI & PARANA TIMING HERO SHOWCASE                            */}
        {/* ========================================================================= */}
        {nextEkadashi && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-amber-950 to-orange-950 text-white p-6 sm:p-10 md:p-12 shadow-2xl border border-amber-500/30">
            {/* Background Decorative Auras */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Ekadashi Info */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                  Upcoming Holy Vrata
                </div>

                <div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-amber-100 tracking-tight leading-tight">
                    {nextEkadashi.name}
                  </h2>
                  <p className="text-amber-200/90 text-sm sm:text-base font-medium mt-1">
                    {nextEkadashi.paksha} • {nextEkadashi.vaishnavaMonth || "Vaishnava Month"}
                  </p>
                </div>

                {/* Fast Date & Tithi Info */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider block">Fasting Day</span>
                    <span className="text-base sm:text-lg font-bold text-white block mt-0.5">
                      {nextEkadashi.date}
                    </span>
                    <span className="text-xs text-amber-200/80 font-medium">({nextEkadashi.day})</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider block">Fasting Type</span>
                    <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                      {nextEkadashi.fastingType}
                    </span>
                    <span className="text-xs text-amber-200/80 font-medium">Satvik Observance</span>
                  </div>
                </div>

                {/* HIGHLIGHTED PARANA BREAKING TIMING WINDOW */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/25 to-orange-500/20 border-2 border-amber-400/60 backdrop-blur-md shadow-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                    <Sunrise className="h-4 w-4 text-amber-400" />
                    Dwadashi Parana (Fast Breaking) Window
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {nextEkadashi.paranaStartTime} – {nextEkadashi.paranaEndTime}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-amber-200">
                      on {nextEkadashi.paranaDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 italic pt-0.5">
                    * Exact calculated Parana timing for Kurnool region. Fast must be broken within this window.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEkadashi(nextEkadashi)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm shadow-gold transition-all cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" /> Read Mahatmya
                  </button>

                  <a
                    href={getGoogleCalendarUrl(nextEkadashi)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 text-amber-300" /> Add to Calendar
                  </a>

                  <button
                    type="button"
                    onClick={() => shareEkadashi(nextEkadashi)}
                    className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    title="Share Ekadashi Timings"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Countdown & Sacred Visual */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-full bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-400" /> Countdown to Fasting Day
                  </span>

                  {timeLeft ? (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <span className="block text-2xl sm:text-3xl font-display font-extrabold text-white">
                          {timeLeft.days}
                        </span>
                        <span className="block text-[10px] sm:text-xs text-amber-300 font-semibold uppercase tracking-wider">
                          Days
                        </span>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <span className="block text-2xl sm:text-3xl font-display font-extrabold text-white">
                          {timeLeft.hours}
                        </span>
                        <span className="block text-[10px] sm:text-xs text-amber-300 font-semibold uppercase tracking-wider">
                          Hours
                        </span>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <span className="block text-2xl sm:text-3xl font-display font-extrabold text-white">
                          {timeLeft.minutes}
                        </span>
                        <span className="block text-[10px] sm:text-xs text-amber-300 font-semibold uppercase tracking-wider">
                          Mins
                        </span>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <span className="block text-2xl sm:text-3xl font-display font-extrabold text-amber-400 animate-pulse">
                          {timeLeft.seconds}
                        </span>
                        <span className="block text-[10px] sm:text-xs text-amber-300 font-semibold uppercase tracking-wider">
                          Secs
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-amber-200 text-sm">Calculating divine timing...</div>
                  )}

                  <div className="text-xs text-amber-200/80 border-t border-white/10 pt-3">
                    Tithi Starts: <span className="font-semibold text-white">{nextEkadashi.tithiStart}</span>
                    <br />
                    Tithi Ends: <span className="font-semibold text-white">{nextEkadashi.tithiEnd}</span>
                  </div>
                </div>

                <div className="text-center italic text-xs sm:text-sm text-amber-200/90 max-w-sm">
                  “Fasting on Ekadashi purifies the heart and cleanses millions of lifetimes of karma.”
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. CRUCIAL HOLY RULE: TULSI SEVA MAHATMYA (PROMINENT SPOTLIGHT)           */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 md:p-10 shadow-xl border-2 border-emerald-400/50">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <Leaf className="w-80 h-80 text-emerald-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 flex items-center justify-center shrink-0 shadow-lg">
                <Leaf className="h-7 w-7 text-emerald-300" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                  Crucial Scriptural Injunction
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-emerald-100">
                  {e.tulsiTitle || "Do Not Pluck Tulsi Leaves on Ekadashi or Dwadashi"}
                </h3>
                <p className="text-emerald-200 text-sm sm:text-base leading-relaxed max-w-3xl font-medium">
                  {e.tulsiBody ||
                    "Do not pluck Tulsi leaves on Ekadashi or Dwadashi. If Tulsi is required for worship, it should be picked the previous day."}
                </p>
              </div>
            </div>

            <div className="shrink-0 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/30 text-xs text-emerald-200 max-w-xs space-y-1">
              <span className="font-bold text-emerald-300 block uppercase tracking-wider text-[10px]">
                🌿 Devotional Tip
              </span>
              <span>
                Pick fresh Tulsi leaves on Dashami (the day before Ekadashi) with reverence and store them in clean water for the deity offerings.
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. PURPOSE OF EKADASHI                                                    */}
        {/* ========================================================================= */}
        <section className="bg-card rounded-3xl border border-border shadow-elegant p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/15 text-amber-800 dark:text-amber-400 rounded-2xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                Transcendental Meaning
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                {e.purposeTitle || "Purpose of Ekadashi"}
              </h2>
            </div>
          </div>

          <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-sans">
            {e.purposeBody ||
              "Ekadashi is a day to minimize bodily needs and increase our hearing, chanting, and remembrance of the Holy Name of the Lord. By simplifying eating and daily activity, the mind becomes more focused on devotional service and the glories of Krishna."}
          </p>

          {/* 3 Spiritual Pillars */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-2xl font-display font-bold text-amber-900 dark:text-amber-300">01</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Śravaṇam (Hearing)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spend ample time reading and listening to Srimad Bhagavatam, Bhagavad Gita, and pastimes of Lord Krishna.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
              <span className="text-2xl font-display font-bold text-orange-900 dark:text-orange-300">02</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Kīrtanam (Chanting)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Increase your daily japa rounds. Chant the Hare Krishna Maha Mantra with deep devotion and attentive listening.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <span className="text-2xl font-display font-bold text-purple-900 dark:text-purple-300">03</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Smaraṇam (Remembering)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Keep the mind anchored in meditation upon the transcendental beauty, qualities, and mercy of Sri Sri Radha Govinda.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. MORNING PRACTICE (3 SACRED STEPS)                                      */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-3xl border border-orange-500/20 p-6 sm:p-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 text-orange-900 dark:text-orange-300 rounded-2xl">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800 dark:text-orange-400 block">
                Daily Vrata Sadhana
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                {e.morningTitle || "Morning Practice"}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1: Worship */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-9 w-9 rounded-xl bg-orange-500 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  1
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Step One
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-primary">Worship</h3>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                Worship the deity of Krishna with devotion, offering your heart in surrender during Mangala and Sringara Harati.
              </p>
            </div>

            {/* Step 2: Offer */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-9 w-9 rounded-xl bg-amber-500 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  2
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Step Two
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-primary">Offer</h3>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                Offer incense, a ghee lamp, Tulsi picked the previous day, fresh seasonal fruits, and fragrant flowers.
              </p>
            </div>

            {/* Step 3: Pray */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  3
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Step Three
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-primary">Pray</h3>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                Pray sincerely for the mercy of Lord Vishnu, seeking pure devotional service and freedom from the illusion of material desires.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. 🏛️ SPECIAL EKADASHI TEMPLE SCHEDULE AT ISKCON KURNOOL                  */}
        {/* ========================================================================= */}
        <section className="bg-card rounded-3xl border border-border shadow-elegant p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 text-orange-800 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                <Building className="h-3.5 w-3.5" />
                Temple Timetable
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-primary">
                {e.templeScheduleTitle || "Special Ekadashi Temple Schedule"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {e.templeScheduleSubtitle ||
                  "Join us at Sri Sri Puri Jagannath Temple, ISKCON Kurnool for all-day kirtan, discourses, and phalahari prasadam."}
              </p>
            </div>

            {/* Filter by Period */}
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl border border-border overflow-x-auto shrink-0">
              {["all", "Morning", "Afternoon", "Evening", "Night"].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSchedulePeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    schedulePeriod === period
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period === "all" ? "All Day" : period}
                </button>
              ))}
            </div>
          </div>

          {/* Devotee Notice Banner */}
          {e.templeScheduleNotice && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{e.templeScheduleNotice}</p>
            </div>
          )}

          {/* Schedule Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredScheduleItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 flex flex-col justify-between ${
                  item.highlight
                    ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-card border-amber-500/40 shadow-xs"
                    : "bg-card border-border hover:border-amber-500/30"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                      {item.iconName === "sunrise" && <Sunrise className="h-4 w-4 text-orange-500" />}
                      {item.iconName === "sun" && <Sun className="h-4 w-4 text-amber-500" />}
                      {item.iconName === "sunset" && <Sunset className="h-4 w-4 text-purple-500" />}
                      {item.iconName === "moon" && <Moon className="h-4 w-4 text-indigo-500" />}
                      {item.iconName === "music" && <Music className="h-4 w-4 text-pink-500" />}
                      {item.iconName === "book" && <BookOpen className="h-4 w-4 text-blue-500" />}
                      {item.iconName === "utensils" && <Utensils className="h-4 w-4 text-emerald-500" />}
                      {!["sunrise", "sun", "sunset", "moon", "music", "book", "utensils"].includes(item.iconName) && (
                        <Clock className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    {item.highlight && (
                      <span className="bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30">
                        ★ Highlight
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-primary leading-snug">
                      {item.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 mt-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                  <span>{item.period} Programme</span>
                  <span className="text-amber-600 font-semibold">Temple Hall</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. THE MAHA MANTRA & INTERACTIVE JAPA MEDITATION COUNTER                  */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white p-8 sm:p-12 md:p-14 shadow-gold border border-amber-400/40 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            The Supreme Chant for Deliverance
          </div>

          <h3 className="text-xs sm:text-sm uppercase tracking-[0.3em] font-extrabold text-amber-200">
            The Maha Mantra
          </h3>

          <div className="py-2">
            <p className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-tight drop-shadow-md whitespace-pre-line tracking-tight">
              {e.mantra ||
                "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Rama Hare Rama, Rama Rama Hare Hare"}
            </p>
          </div>

          <p className="text-amber-100/90 text-xs sm:text-sm max-w-xl mx-auto italic">
            “In this age of Kali, there is no other way, no other way, no other way for spiritual deliverance than chanting the Holy Name of Lord Hari.”
          </p>

          {/* Interactive Ekadashi Japa Bead Counter */}
          <div className="max-w-md mx-auto bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 mt-4">
            <div className="flex items-center justify-between text-xs text-amber-200">
              <span className="font-bold uppercase tracking-wider">Ekadashi Japa Counter</span>
              <span>{japaRounds} Rounds Completed</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={incrementBead}
                className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm shadow-gold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Chant 1 Bead</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/20 text-amber-950 text-xs font-extrabold">
                  {japaBeads} / 108
                </span>
              </button>

              <button
                type="button"
                onClick={resetJapa}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Reset counter"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. DIETARY GUIDELINES & 🚫 STRICTLY AVOID                                 */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          {/* Strictly Avoid Warning Card */}
          <div className="rounded-3xl bg-red-500/10 border-2 border-red-500/30 p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-red-700 dark:text-red-400">
                {e.warningTitle || "Strictly Avoid"}
              </h3>
            </div>
            <p className="text-foreground/90 leading-relaxed font-sans text-sm sm:text-base">
              {e.warningBody ||
                "Meat, fish, eggs, mushrooms, alcohol, onion, garlic, intoxicants such as cigarettes and tobacco, and other tamasic substances should be strictly avoided—not only on Ekadashi, but as part of a life of pure devotional service."}
            </p>
          </div>

          {/* Two-Column Avoid vs Permitted Foods */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Foods to Avoid */}
            <div className="rounded-3xl bg-card border-l-4 border-l-red-600 border border-border shadow-elegant p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <h3 className="font-display font-bold text-xl sm:text-2xl text-red-700 dark:text-red-400">
                  {e.avoidTitle || "Avoid on Ekadashi"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Grains and lentils harbor sinful reactions on this holy day and must be strictly shunned:
              </p>
              <ul className="space-y-2.5 text-foreground/85 text-sm sm:text-base">
                {e.avoidItems.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Permitted Foods */}
            <div className="rounded-3xl bg-card border-l-4 border-l-emerald-600 border border-border shadow-elegant p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h3 className="font-display font-bold text-xl sm:text-2xl text-emerald-700 dark:text-emerald-400">
                  {e.permitTitle || "Permitted on Ekadashi"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Pure Satvik Phalahari prasadam suitable for fasting offerings:
              </p>
              <ul className="space-y-2.5 text-foreground/85 text-sm sm:text-base">
                {e.permitItems.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. IMAGE & SACRED SCRIPTURAL QUOTE BANNER                                 */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border">
          <img
            src={imageSrc}
            alt="Lord Sri Vishnu reclining on Ananta Shesha"
            className="w-full h-64 md:h-96 object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 text-center">
            <p className="font-display text-white text-xl sm:text-2xl md:text-3xl italic drop-shadow-lg max-w-3xl mx-auto">
              “{e.imageQuote || "Fasting on Ekadashi is dear to Lord Vishnu."}”
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 9. DWADASHI — BREAKING THE FAST (WITH DYNAMIC PARANA TIMING)              */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-card border-2 border-amber-500/30 p-6 sm:p-10 shadow-elegant space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-gold">
                <Sunrise className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  Vrata Completion
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-primary">
                  {e.dwadashiTitle || "🌸 Dwadashi — Breaking the Fast"}
                </h2>
              </div>
            </div>

            {nextEkadashi && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                Next Parana Window: {nextEkadashi.paranaStartTime} – {nextEkadashi.paranaEndTime} ({nextEkadashi.paranaDate})
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-2xs">
              <span className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-foreground">Wake Early</h4>
              <p className="text-xs text-muted-foreground">Arise during Brahma-Muhurta before sunrise with remembrance of Krishna.</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-2xs">
              <span className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-foreground">Bathe & Prepare</h4>
              <p className="text-xs text-muted-foreground">Take a sacred morning bath, apply Vaishnava Tilak, and put on clean clothes.</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 shadow-2xs">
              <span className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-foreground">Worship Lord Vishnu</h4>
              <p className="text-xs text-muted-foreground">Offer heartfelt prayers, ghee lamp, and seek blessings for steadfast devotion.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 space-y-1.5 shadow-2xs">
              <span className="h-7 w-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">Break the Fast</h4>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium">
                Honor grain prasadam or charanamrita strictly within the prescribed Parana time.
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground italic border-t border-border pt-4">
            {e.dwadashiNote ||
              "Note: The Parana timing changes for every Ekadashi — always check the calendar for the exact window."}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. INTERACTIVE ISKCON KURNOOL EKADASHI CALENDAR                          */}
        {/* ========================================================================= */}
        <section id="calendar" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar className="h-3.5 w-3.5" />
                Vaishnava Calendar
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-primary">
                ISKCON Kurnool Ekadashi Schedule
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete dynamic calendar with exact Kurnool sunrise, fasting dates, and Dwadashi Parana breaking timings.
              </p>
            </div>

            {/* Filter Tabs (Upcoming, All, Past) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setCalendarTab("upcoming")}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  calendarTab === "upcoming"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Upcoming ({upcomingList.length})
              </button>

              <button
                type="button"
                onClick={() => setCalendarTab("all")}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  calendarTab === "all"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All Year ({publishedCalendar.length})
              </button>

              <button
                type="button"
                onClick={() => setCalendarTab("past")}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  calendarTab === "past"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Past ({pastList.length})
              </button>
            </div>
          </div>

          {/* Search & Paksha Filter Bar */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Ekadashi name, date, month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 border border-border rounded-xl text-xs sm:text-sm bg-background focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
            </div>

            <select
              value={selectedPaksha}
              onChange={(e) => setSelectedPaksha(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 border border-border rounded-xl text-xs sm:text-sm bg-background font-medium cursor-pointer"
            >
              <option value="all">All Pakshas (Shukla & Krishna)</option>
              <option value="Gaura Paksha">Gaura Paksha (Waxing Moon)</option>
              <option value="Krishna Paksha">Krishna Paksha (Waning Moon)</option>
            </select>
          </div>

          {/* Calendar Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedCalendar.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-card rounded-3xl border border-border p-8">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="font-semibold text-base">No Ekadashi found for the selected criteria.</p>
                <p className="text-xs text-muted-foreground mt-1">Try changing search query or tab filters.</p>
              </div>
            ) : (
              displayedCalendar.map((item) => {
                const isUpcoming = item.date >= todayIso;
                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl bg-card border transition-all duration-300 p-6 flex flex-col justify-between shadow-elegant hover:shadow-xl hover:border-amber-500/40 relative overflow-hidden group ${
                      item.isFeatured ? "border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-card to-card" : "border-border"
                    }`}
                  >
                    {item.isFeatured && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                        ★ Maha Ekadashi
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Name & Paksha */}
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                          {item.paksha} • {item.vaishnavaMonth || "Vaishnava Month"}
                        </span>
                        <h3 className="font-display font-bold text-xl text-primary mt-0.5 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Fast Date Badge */}
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                            Fast Date
                          </span>
                          <span className="text-base font-bold text-foreground block">{item.date}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-2xs">
                          {item.day}
                        </span>
                      </div>

                      {/* Parana Timing Banner */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/25 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          <Sunrise className="h-3.5 w-3.5 text-amber-600" />
                          Dwadashi Parana Window
                        </div>
                        <div className="font-display font-bold text-base text-foreground">
                          {item.paranaStartTime} – {item.paranaEndTime}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">{item.paranaDate}</div>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-5 border-t border-border mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEkadashi(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Read Mahatmya <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={getGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-secondary hover:bg-amber-100 text-foreground transition-all cursor-pointer"
                          title="Add to Google Calendar"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => shareEkadashi(item)}
                          className="p-2 rounded-xl bg-secondary hover:bg-amber-100 text-foreground transition-all cursor-pointer"
                          title="Share details"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 11. EKADASHI MAHATMYA STORY MODAL DIALOG                                  */}
      {/* ========================================================================= */}
      {selectedEkadashi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {selectedEkadashi.paksha} • {selectedEkadashi.vaishnavaMonth}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                  {selectedEkadashi.name} Mahatmya
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEkadashi(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-secondary/60 rounded-2xl text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Fast Date</span>
                <span className="font-bold text-foreground text-sm">{selectedEkadashi.date}</span>
                <span className="text-muted-foreground block">({selectedEkadashi.day})</span>
              </div>
              <div>
                <span className="text-amber-700 dark:text-amber-400 block text-[10px] uppercase font-bold">
                  Parana Window
                </span>
                <span className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                  {selectedEkadashi.paranaStartTime} – {selectedEkadashi.paranaEndTime}
                </span>
                <span className="text-muted-foreground block">{selectedEkadashi.paranaDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Fasting Type</span>
                <span className="font-bold text-foreground text-sm">{selectedEkadashi.fastingType}</span>
              </div>
            </div>

            {/* Scriptural Glories Content */}
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 text-foreground/90 leading-relaxed font-sans text-sm sm:text-base">
              <div>
                <h4 className="font-display font-bold text-lg text-primary mb-1">
                  Glories & Scriptural Significance
                </h4>
                <p className="whitespace-pre-line">{selectedEkadashi.description}</p>
              </div>

              {selectedEkadashi.specialInstructions && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    Special Devotee Instructions
                  </span>
                  <p className="text-xs text-foreground/90">{selectedEkadashi.specialInstructions}</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-xs text-emerald-950 dark:text-emerald-300">
                <span className="font-bold uppercase tracking-wider block">🌿 Tulsi Reminder</span>
                <span>Do not pluck Tulsi leaves on Ekadashi or Dwadashi. Pick them the previous day.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => shareEkadashi(selectedEkadashi)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-amber-100 text-foreground font-bold text-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Timings
              </button>

              <button
                type="button"
                onClick={() => setSelectedEkadashi(null)}
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
