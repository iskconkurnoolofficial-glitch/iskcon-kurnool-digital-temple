import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { Music, BookOpen, Sun, Soup, Sparkles, Clock, ArrowRight, Calendar } from "lucide-react";

type SundayScheduleItem = {
  id: string;
  time: string;
  program: string;
};

const defaultSchedule: SundayScheduleItem[] = [
  { id: "s1", time: "11:00 AM – 11:30 AM", program: "Hari Nama Sankirtana" },
  { id: "s2", time: "11:30 AM – 12:30 PM", program: "Bhagavad Gita Pravachanam" },
  { id: "s3", time: "After 12:30 PM", program: "Raja Bhoga Arati" },
  { id: "s4", time: "After 12:30 PM", program: "Sudarshana Ashirvadam" },
  { id: "s5", time: "After 12:30 PM", program: "Prasada Vitarana" }
];

function getProgramIcon(program: string) {
  const name = program.toLowerCase();
  if (name.includes("sankirtan") || name.includes("kirtan") || name.includes("singing") || name.includes("chanting")) {
    return { icon: Music, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" };
  }
  if (name.includes("gita") || name.includes("pravachanam") || name.includes("lecture") || name.includes("class") || name.includes("discourse")) {
    return { icon: BookOpen, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  }
  if (name.includes("arati") || name.includes("harati") || name.includes("darshan")) {
    return { icon: Sun, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
  }
  if (name.includes("prasada") || name.includes("feast") || name.includes("vitaran") || name.includes("distrib")) {
    return { icon: Soup, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  }
  if (name.includes("sudarshana") || name.includes("ashirvadam") || name.includes("blessing")) {
    return { icon: Sparkles, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
  }
  return { icon: Clock, color: "text-secondary bg-secondary/10 border border-secondary/20" };
}

export default function SundayProgramSection() {
  const { sunday } = useAdmin();
  
  const scheduleList = sunday.schedule && sunday.schedule.length > 0 ? sunday.schedule : defaultSchedule;
  
  // Group schedule items by time
  const groupedSchedule: { time: string; programs: string[] }[] = [];
  scheduleList.forEach((item) => {
    const existing = groupedSchedule.find(
      (g) => g.time.trim().toLowerCase() === item.time.trim().toLowerCase()
    );
    if (existing) {
      existing.programs.push(item.program);
    } else {
      groupedSchedule.push({ time: item.time, programs: [item.program] });
    }
  });

  const fallbacks = [
    { url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80", label: "Devotional Kirtan" },
    { url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=600&q=80", label: "Bhagavad Gita Pravachanam" },
    { url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=600&q=80", label: "Delicious Prasadam" },
    { url: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=600&q=80", label: "Temple Devotion" }
  ];

  const adminImages = (sunday.gallery || []).map((img) => ({ url: img.url, label: img.label || img.label }));
  const displayImages = [...adminImages, ...fallbacks].slice(0, 4);

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-[#fffaf0] via-[#fdf3d1] to-[#fff8eb] overflow-hidden border-t border-border/40">
      {/* Decorative background shapes */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Heading and Details */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left animate-fade-up">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase text-xs tracking-wider">
              <Calendar className="h-4 w-4" /> Weekly Sunday Feast
            </span>
            
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-primary tracking-tight leading-tight">
              Sunday Feast <br className="hidden lg:block" />
              & Program
            </h2>
            
            <p className="text-muted-foreground text-sm font-sans leading-relaxed">
              {sunday.description || "Join us every Sunday for a spiritually rejuvenating experience. Immerse yourself in transcendental kirtan, hear profound Vedic wisdom, and honor a delicious free vegetarian feast (prasadam) with us."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                to="/temple/sunday"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/95 text-white font-semibold text-xs uppercase tracking-wider transition hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                View Full Program <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Modern Timeline Card (Extended) */}
          <div className="lg:col-span-8 animate-fade-up w-full">
            <div className="bg-gradient-to-br from-[#2a1154] via-[#1c083c] to-[#0e0222] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(42,17,84,0.3)] relative overflow-hidden">
              {/* Header inside Card */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-white">Program Schedule</h3>
                  <p className="text-sm text-white/60 mt-1">Every Sunday Afternoon</p>
                </div>
                <div className="px-4 py-2 bg-secondary/20 border border-secondary/30 rounded-full text-center">
                  <span className="text-secondary text-sm font-bold uppercase tracking-wide">Every Sunday</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Timeline list (Left Side) */}
                <div className="md:col-span-7 relative border-l border-white/10 pl-6 ml-4 space-y-8">
                  {groupedSchedule.map((item, idx) => {
                    // Determine best icon based on the first program in the group
                    const primaryProgram = item.programs[0] || "";
                    const { icon: ProgramIcon, color: iconColors } = getProgramIcon(primaryProgram);

                    return (
                      <div key={idx} className="relative group/item">
                        {/* Timeline dot */}
                        <span className="absolute -left-[35px] top-0 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#1c083c] border border-white/20 group-hover/item:border-secondary transition-all duration-300">
                          <span className="h-2 w-2 rounded-full bg-secondary" />
                        </span>

                        {/* Content */}
                        <div className="space-y-2">
                          <span className="inline-block text-sm font-semibold tracking-wide text-secondary font-sans bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                            {item.time}
                          </span>
                          
                          <div className="flex items-start gap-3 mt-2">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${iconColors}`}>
                              <ProgramIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {item.programs.map((prog, pIdx) => (
                                <h4 key={pIdx} className="font-semibold text-white text-lg leading-snug group-hover/item:text-secondary transition-colors">
                                  {prog}
                                </h4>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4 Images Bento Layout (Right Side) */}
                <div className="md:col-span-5 grid grid-cols-2 grid-rows-3 gap-2.5 h-[340px] sm:h-[380px] self-center">
                  
                  {/* Image 1 — tall left, spans 2 rows */}
                  {displayImages[0] && (
                    <div className="group/img relative row-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:border-secondary/50">
                      <img
                        src={displayImages[0].url}
                        alt={displayImages[0].label}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">{displayImages[0].label}</span>
                      </div>
                    </div>
                  )}

                  {/* Image 2 — top right, shorter */}
                  {displayImages[1] && (
                    <div className="group/img relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-md transition-all duration-500 hover:scale-[1.02] hover:border-secondary/50">
                      <img
                        src={displayImages[1].url}
                        alt={displayImages[1].label}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                        <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">{displayImages[1].label}</span>
                      </div>
                    </div>
                  )}

                  {/* Image 3 — middle right, shorter */}
                  {displayImages[2] && (
                    <div className="group/img relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-md transition-all duration-500 hover:scale-[1.02] hover:border-secondary/50">
                      <img
                        src={displayImages[2].url}
                        alt={displayImages[2].label}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                        <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">{displayImages[2].label}</span>
                      </div>
                    </div>
                  )}

                  {/* Image 4 — full-width wide panoramic bottom */}
                  {displayImages[3] && (
                    <div className="group/img relative col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg transition-all duration-500 hover:scale-[1.01] hover:border-secondary/50">
                      <img
                        src={displayImages[3].url}
                        alt={displayImages[3].label}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">{displayImages[3].label}</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
