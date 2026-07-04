import { useState } from "react";
import { useAdmin, uploadToCloudinary, GitaCourseData } from "@/context/AdminContext";
import { Plus, Trash2 } from "lucide-react";
import { UploadBox } from "./CarouselManager";

export default function GitaCourseManager() {
  const { gitaCourse, setGitaCourse } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<GitaCourseData>) => setGitaCourse({ ...gitaCourse, ...patch });

  const pickImage = async (f: File) => {
    setBusy(true);
    try { update({ heroImage: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
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
        <UploadBox label="Hero Image" url={gitaCourse.heroImage} onPick={pickImage} aspect="aspect-[4/5]" className="max-w-[130px]" />
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
    </div>
  );
}
