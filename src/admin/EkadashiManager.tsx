import { useState } from "react";
import { useAdmin, uploadToCloudinary, EkadashiData } from "@/context/AdminContext";
import { Plus, Trash2, Moon, Eye, Save, Sparkles, AlertCircle, Leaf, Utensils, BookOpen } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function EkadashiManager() {
  const { ekadashi, setEkadashi } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<EkadashiData>) => {
    setEkadashi({ ...ekadashi, ...patch });
    toast.success("Changes saved!");
  };

  const pickImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ image: url }); 
      toast.success("Ekadashi banner uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-purple-200/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-purple-500/20 text-purple-800 rounded-2xl shrink-0 shadow-xs">
              <Moon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Ekadashi Mahatmya & Guidelines</h2>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Vrata Guide
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure guidelines for the holy day of Sri Hari: permitted items, grains to avoid, Tulsi mahatmya, chanting sankalpa, and parana breaking timings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/ekadashi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Ekadashi Page
            </a>
          </div>
        </div>
      </div>

      {/* Header & Titles Card */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Section Header & Badges
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Badge Label</label>
            <input className={inputClass} value={ekadashi.badge} onChange={(e) => update({ badge: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Main Title</label>
            <input className={inputClass} value={ekadashi.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input className={inputClass} value={ekadashi.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Image & Quote Card */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Banner & Sacred Quote</h3>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <UploadBox label="Ekadashi Visual Banner" url={ekadashi.image} onPick={pickImage} aspect="aspect-video" className="max-w-[240px]" />
          <div>
            <label className={labelClass}>Scriptural Quote / Message</label>
            <textarea className={inputClass} rows={4} value={ekadashi.imageQuote} onChange={(e) => update({ imageQuote: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <BulletCard
          title="Forbidden / Items to Avoid"
          icon={<Utensils className="h-4 w-4 text-red-500" />}
          heading={ekadashi.avoidTitle}
          onHeading={(v) => update({ avoidTitle: v })}
          items={ekadashi.avoidItems}
          onItems={(v) => update({ avoidItems: v })}
        />
        <BulletCard
          title="Permitted Food Items"
          icon={<Utensils className="h-4 w-4 text-green-600" />}
          heading={ekadashi.permitTitle}
          onHeading={(v) => update({ permitTitle: v })}
          items={ekadashi.permitItems}
          onItems={(v) => update({ permitItems: v })}
        />
      </div>

      {/* Tulsi & Purpose Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <TextCard
          title="Tulsi Devi Seva & Guidelines"
          icon={<Leaf className="h-4 w-4 text-emerald-600" />}
          heading={ekadashi.tulsiTitle}
          onHeading={(v) => update({ tulsiTitle: v })}
          body={ekadashi.tulsiBody}
          onBody={(v) => update({ tulsiBody: v })}
        />
        <TextCard
          title="Transcendental Purpose of Vrata"
          icon={<BookOpen className="h-4 w-4 text-primary" />}
          heading={ekadashi.purposeTitle}
          onHeading={(v) => update({ purposeTitle: v })}
          body={ekadashi.purposeBody}
          onBody={(v) => update({ purposeBody: v })}
        />
      </div>

      {/* Morning Practice & Mantra */}
      <div className="grid md:grid-cols-2 gap-6">
        <BulletCard
          title="Morning Sadhanas & Vrata Steps"
          heading={ekadashi.morningTitle}
          onHeading={(v) => update({ morningTitle: v })}
          items={ekadashi.morningSteps}
          onItems={(v) => update({ morningSteps: v })}
        />

        <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
          <h3 className="font-display text-lg font-bold text-primary">Maha Mantra Chanting Target</h3>
          <textarea className={inputClass} rows={4} value={ekadashi.mantra} onChange={(e) => update({ mantra: e.target.value })} />
          <p className="text-xs text-muted-foreground">One line per chant/round instruction.</p>
        </div>
      </div>

      {/* Warning & Dwadashi Parana */}
      <div className="grid md:grid-cols-2 gap-6">
        <TextCard
          title="Important Warning"
          icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
          heading={ekadashi.warningTitle}
          onHeading={(v) => update({ warningTitle: v })}
          body={ekadashi.warningBody}
          onBody={(v) => update({ warningBody: v })}
        />

        <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
          <h3 className="font-display text-lg font-bold text-primary">Dwadashi Parana Timing</h3>
          <div>
            <label className={labelClass}>Parana Title</label>
            <input className={inputClass} value={ekadashi.dwadashiTitle} onChange={(e) => update({ dwadashiTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Timing / Instructions</label>
            <textarea className={inputClass} rows={3} value={ekadashi.dwadashiBody} onChange={(e) => update({ dwadashiBody: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Important Note</label>
            <textarea className={inputClass} rows={2} value={ekadashi.dwadashiNote} onChange={(e) => update({ dwadashiNote: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TextCard({ title, icon, heading, onHeading, body, onBody }: {
  title: string; icon?: React.ReactNode; heading: string; onHeading: (v: string) => void; body: string; onBody: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
      <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
        {icon} {title}
      </h3>
      <div>
        <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Heading</label>
        <input className="w-full px-3.5 py-2 border rounded-xl bg-white text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none" value={heading} onChange={(e) => onHeading(e.target.value)} placeholder="Heading" />
      </div>
      <div>
        <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">Content Body</label>
        <textarea className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs resize-y focus:ring-2 focus:ring-primary/20 focus:outline-none" rows={4} value={body} onChange={(e) => onBody(e.target.value)} placeholder="Body" />
      </div>
    </div>
  );
}

function BulletCard({ title, icon, heading, onHeading, items, onItems }: {
  title: string; icon?: React.ReactNode; heading: string; onHeading: (v: string) => void; items: string[]; onItems: (v: string[]) => void;
}) {
  const setItem = (i: number, v: string) => onItems(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onItems(items.filter((_, idx) => idx !== i));
  const add = () => onItems([...items, ""]);

  return (
    <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          {icon} {title}
        </h3>
        <button
          type="button"
          onClick={add}
          className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Add Item
        </button>
      </div>
      <input className="w-full px-3.5 py-2 border rounded-xl bg-white text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none font-medium" value={heading} onChange={(e) => onHeading(e.target.value)} placeholder="Card Heading" />
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none" value={it} onChange={(e) => setItem(i, e.target.value)} placeholder="Item..." />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
