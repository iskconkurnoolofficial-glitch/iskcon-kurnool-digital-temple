import { useState } from "react";
import { useAdmin, uploadToCloudinary, GitaCourseData } from "@/context/AdminContext";
import { Plus, Trash2, BookOpen, Eye, Sparkles, GraduationCap, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function GitaCourseManager() {
  const { gitaCourse, setGitaCourse } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<GitaCourseData>) => {
    setGitaCourse({ ...gitaCourse, ...patch });
    toast.success("Course details saved!");
  };

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ heroImage: url }); 
      toast.success("Hero image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickAboutImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ gitaAboutImage: url }); 
      toast.success("About image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickWhyImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ gitaWhyImage: url }); 
      toast.success("Why image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  const setBadge = (i: number, v: string) => update({ badges: gitaCourse.badges.map((x, idx) => (idx === i ? v : x)) });
  const removeBadge = (i: number) => update({ badges: gitaCourse.badges.filter((_, idx) => idx !== i) });
  const addBadge = () => update({ badges: [...gitaCourse.badges, ""] });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Gita Course & Education Portal</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Vedic Wisdom
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure the systematic Bhagavad Gita study course, syllabus modules, registration links, schedules, and promotional graphics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/gita-course"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Gita Course Page
            </a>
          </div>
        </div>
      </div>

      {/* Registration Status Selector Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Course Registration &amp; Enrollment Status
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control enrollment status. Selecting "Coming Soon" or "Closed" locks registration buttons with a lock icon 🔒 on the website.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            {(["Coming Soon", "Closed", "Registrations Opened"] as const).map((st) => {
              const currentStatus = gitaCourse.status || "Registrations Opened";
              const isActive = currentStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => update({ status: st })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isActive
                      ? st === "Coming Soon"
                        ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50"
                        : st === "Closed"
                        ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/50"
                        : "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/50"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {st === "Coming Soon" && "⏳ Coming Soon"}
                  {st === "Closed" && "🔒 Closed"}
                  {st === "Registrations Opened" && "✅ Registrations Opened"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Banners */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-6">
        <h3 className="font-display text-lg font-bold text-primary">Promotional Course Graphics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hero Portrait Banner (4:5)</p>
            <UploadBox label="Hero Banner" url={gitaCourse.heroImage} onPick={pickHeroImage} aspect="aspect-[4/5]" className="max-w-[150px]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How to Read Gita Graphic</p>
            <UploadBox label="About Graphic" url={gitaCourse.gitaAboutImage} onPick={pickAboutImage} aspect="aspect-square" className="max-w-[150px]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Why Gita Classes Graphic</p>
            <UploadBox label="Why Graphic" url={gitaCourse.gitaWhyImage} onPick={pickWhyImage} aspect="aspect-square" className="max-w-[150px]" />
          </div>
        </div>
      </div>

      {/* Hero Header & Badges */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Hero Section Headlines
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Eyebrow Badge</label>
            <input className={inputClass} value={gitaCourse.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Main Title</label>
            <input className={inputClass} value={gitaCourse.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tagline / Description</label>
            <textarea className={inputClass} rows={2} value={gitaCourse.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Course Badges / Highlights</label>
            <button
              type="button"
              onClick={addBadge}
              className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add Badge
            </button>
          </div>
          <div className="space-y-2">
            {gitaCourse.badges.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputClass} value={b} onChange={(e) => setBadge(i, e.target.value)} placeholder="e.g. 18 Chapters Systematic Study" />
                <button
                  type="button"
                  onClick={() => removeBadge(i)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details & Registration */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Registration & Schedule Meta</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Online Registration Form Link</label>
            <input className={inputClass} placeholder="https://forms.gle/..." value={gitaCourse.registerUrl} onChange={(e) => update({ registerUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Date Range</label>
            <input className={inputClass} value={gitaCourse.dateRange} onChange={(e) => update({ dateRange: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Timing</label>
            <input className={inputClass} value={gitaCourse.time} onChange={(e) => update({ time: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Mode</label>
            <input className={inputClass} value={gitaCourse.mode} onChange={(e) => update({ mode: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Course Fee</label>
            <input className={inputClass} value={gitaCourse.fee} onChange={(e) => update({ fee: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Contact Number / WhatsApp</label>
            <input className={inputClass} value={gitaCourse.contact} onChange={(e) => update({ contact: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Start Label</label>
            <input className={inputClass} value={gitaCourse.startLabel} onChange={(e) => update({ startLabel: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Why Join Cards */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-display text-lg font-bold text-primary">Why Join Course Cards</h3>
          <button
            type="button"
            onClick={() => {
              const currentCards = gitaCourse.whyCards || [];
              update({
                whyCards: [...currentCards, { title: "New Module", desc: "Module description here.", iconName: "book-open" }]
              });
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:opacity-90 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Card
          </button>
        </div>
        
        {(!gitaCourse.whyCards || gitaCourse.whyCards.length === 0) ? (
          <p className="text-xs text-muted-foreground py-4">No custom cards added yet. Default curriculum cards are displayed on the site.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {gitaCourse.whyCards.map((card, i) => (
              <div key={i} className="p-4 border rounded-2xl bg-slate-50/60 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    const currentCards = gitaCourse.whyCards || [];
                    update({ whyCards: currentCards.filter((_, idx) => idx !== i) });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                  <input
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold"
                    value={card.title}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], title: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs"
                    rows={2}
                    value={card.desc}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], desc: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Icon</label>
                  <select
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs"
                    value={card.iconName}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], iconName: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  >
                    <option value="book-open">Book Open</option>
                    <option value="languages">Languages</option>
                    <option value="timer">Timer/Clock</option>
                    <option value="sparkles">Sparkles</option>
                    <option value="award">Award</option>
                    <option value="star">Star</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
