import { useState } from "react";
import { useAdmin, uploadToCloudinary, EkadashiData } from "@/context/AdminContext";
import { Plus, Trash2 } from "lucide-react";
import { UploadBox } from "./CarouselManager";

export default function EkadashiManager() {
  const { ekadashi, setEkadashi } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<EkadashiData>) => setEkadashi({ ...ekadashi, ...patch });

  const pickImage = async (f: File) => {
    setBusy(true);
    try { update({ image: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const input = "w-full px-4 py-2.5 border rounded-lg";
  const label = "block text-sm font-medium mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Header</h3>
        <div>
          <label className={label}>Badge</label>
          <input className={input} value={ekadashi.badge} onChange={(e) => update({ badge: e.target.value })} />
        </div>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={ekadashi.title} onChange={(e) => update({ title: e.target.value })} />
        </div>
        <div>
          <label className={label}>Subtitle</label>
          <input className={input} value={ekadashi.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">Image</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Image" url={ekadashi.image} onPick={pickImage} />
          <div>
            <label className={label}>Image Quote</label>
            <textarea className={input} rows={3} value={ekadashi.imageQuote} onChange={(e) => update({ imageQuote: e.target.value })} />
          </div>
        </div>
        {busy && <p className="text-sm text-muted-foreground">Uploading…</p>}
      </div>

      {/* Food cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <BulletCard
          title="Avoid Card"
          heading={ekadashi.avoidTitle}
          onHeading={(v) => update({ avoidTitle: v })}
          items={ekadashi.avoidItems}
          onItems={(v) => update({ avoidItems: v })}
        />
        <BulletCard
          title="Permitted Card"
          heading={ekadashi.permitTitle}
          onHeading={(v) => update({ permitTitle: v })}
          items={ekadashi.permitItems}
          onItems={(v) => update({ permitItems: v })}
        />
      </div>

      {/* Tulsi */}
      <TextCard
        title="About Tulsi"
        heading={ekadashi.tulsiTitle}
        onHeading={(v) => update({ tulsiTitle: v })}
        body={ekadashi.tulsiBody}
        onBody={(v) => update({ tulsiBody: v })}
      />

      {/* Purpose */}
      <TextCard
        title="Purpose"
        heading={ekadashi.purposeTitle}
        onHeading={(v) => update({ purposeTitle: v })}
        body={ekadashi.purposeBody}
        onBody={(v) => update({ purposeBody: v })}
      />

      {/* Morning practice */}
      <BulletCard
        title="Morning Practice (numbered steps)"
        heading={ekadashi.morningTitle}
        onHeading={(v) => update({ morningTitle: v })}
        items={ekadashi.morningSteps}
        onItems={(v) => update({ morningSteps: v })}
      />

      {/* Mantra */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Mantra</h3>
        <textarea className={input} rows={3} value={ekadashi.mantra} onChange={(e) => update({ mantra: e.target.value })} />
        <p className="text-xs text-muted-foreground">One line per row. Line breaks are preserved.</p>
      </div>

      {/* Warning */}
      <TextCard
        title="Warning"
        heading={ekadashi.warningTitle}
        onHeading={(v) => update({ warningTitle: v })}
        body={ekadashi.warningBody}
        onBody={(v) => update({ warningBody: v })}
      />

      {/* Dwadashi */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Dwadashi</h3>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={ekadashi.dwadashiTitle} onChange={(e) => update({ dwadashiTitle: e.target.value })} />
        </div>
        <div>
          <label className={label}>Body</label>
          <textarea className={input} rows={3} value={ekadashi.dwadashiBody} onChange={(e) => update({ dwadashiBody: e.target.value })} />
        </div>
        <div>
          <label className={label}>Note (italic)</label>
          <textarea className={input} rows={2} value={ekadashi.dwadashiNote} onChange={(e) => update({ dwadashiNote: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function TextCard({ title, heading, onHeading, body, onBody }: {
  title: string; heading: string; onHeading: (v: string) => void; body: string; onBody: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
      <h3 className="font-display text-xl font-bold text-primary">{title}</h3>
      <input className="w-full px-4 py-2.5 border rounded-lg" value={heading} onChange={(e) => onHeading(e.target.value)} placeholder="Heading" />
      <textarea className="w-full px-4 py-2.5 border rounded-lg" rows={4} value={body} onChange={(e) => onBody(e.target.value)} placeholder="Body" />
    </div>
  );
}

function BulletCard({ title, heading, onHeading, items, onItems }: {
  title: string; heading: string; onHeading: (v: string) => void; items: string[]; onItems: (v: string[]) => void;
}) {
  const setItem = (i: number, v: string) => onItems(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onItems(items.filter((_, idx) => idx !== i));
  const add = () => onItems([...items, ""]);

  return (
    <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
      <h3 className="font-display text-xl font-bold text-primary">{title}</h3>
      <input className="w-full px-4 py-2.5 border rounded-lg" value={heading} onChange={(e) => onHeading(e.target.value)} placeholder="Heading" />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={it} onChange={(e) => setItem(i, e.target.value)} />
            <button onClick={() => remove(i)} className="p-2 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="px-4 py-2 rounded-lg bg-surface text-foreground hover:bg-muted text-sm font-medium inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add item</button>
    </div>
  );
}
