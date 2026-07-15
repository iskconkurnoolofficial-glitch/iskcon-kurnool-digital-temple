import { useState } from "react";
import { useAdmin, uploadToCloudinary, GitaCourseData } from "@/context/AdminContext";
import { Plus, Trash2 } from "lucide-react";
import { UploadBox } from "./CarouselManager";

export default function GitaCourseManager() {
  const { gitaCourse, setGitaCourse } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<GitaCourseData>) => setGitaCourse({ ...gitaCourse, ...patch });

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try { update({ heroImage: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const pickAboutImage = async (f: File) => {
    setBusy(true);
    try { update({ gitaAboutImage: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const pickWhyImage = async (f: File) => {
    setBusy(true);
    try { update({ gitaWhyImage: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const input = "w-full px-4 py-2.5 border rounded-lg";
  const label = "block text-sm font-medium mb-1";

  const setBadge = (i: number, v: string) => update({ badges: gitaCourse.badges.map((x, idx) => (idx === i ? v : x)) });
  const removeBadge = (i: number) => update({ badges: gitaCourse.badges.filter((_, idx) => idx !== i) });
  const addBadge = () => update({ badges: [...gitaCourse.badges, ""] });

  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Hero Image (1080 × 1350)</h3>
        <UploadBox label="Hero Image" url={gitaCourse.heroImage} onPick={pickHeroImage} aspect="aspect-[4/5]" className="max-w-[130px]" />
        {busy && <p className="text-sm text-muted-foreground">Uploading…</p>}
      </div>

      {/* Section images */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Section Images (2000 × 2000)</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">"How to Read Bhagavad Gita" Image</p>
            <UploadBox label="About Image" url={gitaCourse.gitaAboutImage} onPick={pickAboutImage} aspect="aspect-square" className="max-w-[130px]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">"Why Gita Classes Matter" Image</p>
            <UploadBox label="Why Image" url={gitaCourse.gitaWhyImage} onPick={pickWhyImage} aspect="aspect-square" className="max-w-[130px]" />
          </div>
        </div>
        {busy && <p className="text-sm text-muted-foreground">Uploading…</p>}
      </div>


      {/* Header text */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Hero Text</h3>
        <div>
          <label className={label}>Eyebrow</label>
          <input className={input} value={gitaCourse.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={gitaCourse.title} onChange={(e) => update({ title: e.target.value })} />
        </div>
        <div>
          <label className={label}>Tagline</label>
          <textarea className={input} rows={2} value={gitaCourse.tagline} onChange={(e) => update({ tagline: e.target.value })} />
        </div>
        <div>
          <label className={label}>Badges</label>
          <div className="space-y-2">
            {gitaCourse.badges.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={b} onChange={(e) => setBadge(i, e.target.value)} />
                <button onClick={() => removeBadge(i)} className="p-2 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addBadge} className="mt-2 px-4 py-2 rounded-lg bg-surface text-foreground hover:bg-muted text-sm font-medium inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add badge</button>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Course Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Registration Link</label>
            <input className={input} placeholder="https://…" value={gitaCourse.registerUrl} onChange={(e) => update({ registerUrl: e.target.value })} />
          </div>
          <div>
            <label className={label}>Date Range</label>
            <input className={input} value={gitaCourse.dateRange} onChange={(e) => update({ dateRange: e.target.value })} />
          </div>
          <div>
            <label className={label}>Time</label>
            <input className={input} value={gitaCourse.time} onChange={(e) => update({ time: e.target.value })} />
          </div>
          <div>
            <label className={label}>Mode</label>
            <input className={input} value={gitaCourse.mode} onChange={(e) => update({ mode: e.target.value })} />
          </div>
          <div>
            <label className={label}>Fee</label>
            <input className={input} value={gitaCourse.fee} onChange={(e) => update({ fee: e.target.value })} />
          </div>
          <div>
            <label className={label}>Contact (Call/WhatsApp)</label>
            <input className={input} value={gitaCourse.contact} onChange={(e) => update({ contact: e.target.value })} />
          </div>
          <div>
            <label className={label}>Start Label</label>
            <input className={input} value={gitaCourse.startLabel} onChange={(e) => update({ startLabel: e.target.value })} />
          </div>
          <div>
            <label className={label}>End Label</label>
            <input className={input} value={gitaCourse.endLabel} onChange={(e) => update({ endLabel: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Why Join (Built to Actually Finish) Cards */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-display text-xl font-bold text-primary">Why Join Cards (Built to Actually Finish)</h3>
          <button
            onClick={() => {
              const currentCards = gitaCourse.whyCards || [];
              update({
                whyCards: [...currentCards, { title: "New Card", desc: "Card description here.", iconName: "book-open" }]
              });
            }}
            className="px-4 py-2 bg-primary text-white hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Card
          </button>
        </div>
        
        {(!gitaCourse.whyCards || gitaCourse.whyCards.length === 0) ? (
          <p className="text-sm text-muted-foreground py-4">No custom cards added yet. Default cards are displayed on the site.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {gitaCourse.whyCards.map((card, i) => (
              <div key={i} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative animate-fade-in">
                <button
                  onClick={() => {
                    const currentCards = gitaCourse.whyCards || [];
                    update({ whyCards: currentCards.filter((_, idx) => idx !== i) });
                  }}
                  className="absolute top-2 right-2 text-rose-600 hover:text-rose-800 transition p-1 cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                  <input
                    className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
                    value={card.title}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], title: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-sans"
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
                    className="w-full px-3 py-2 bg-white border rounded-lg text-sm bg-white"
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
                    <option value="book">Book</option>
                    <option value="compass">Compass</option>
                    <option value="clock">Clock</option>
                    <option value="award">Award</option>
                    <option value="star">Star</option>
                    <option value="heart">Heart</option>
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
