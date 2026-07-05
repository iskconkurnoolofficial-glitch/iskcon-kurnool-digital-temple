import { useState } from "react";
import { useAdmin, uploadToCloudinary, YouthData } from "@/context/AdminContext";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Star } from "lucide-react";
import { UploadBox } from "./CarouselManager";

type Tab = "settings" | "gallery" | "reviews";

export default function YouthManager() {
  const { youth, setYouth } = useAdmin();
  const [tab, setTab] = useState<Tab>("settings");

  const update = (patch: Partial<YouthData>) => setYouth({ ...youth, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {(["settings", "gallery", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab youth={youth} update={update} />}
      {tab === "gallery" && <GalleryTab youth={youth} update={update} />}
      {tab === "reviews" && <ReviewsTab youth={youth} update={update} />}
    </div>
  );
}

function SettingsTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [busy, setBusy] = useState(false);

  const pickLogo = async (f: File) => {
    setBusy(true);
    try { update({ logo: await uploadToCloudinary(f) }); } catch { alert("Upload failed"); }
    setBusy(false);
  };
  const pickFeature = async (i: number, f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f);
      const features = youth.features.map((ft, idx) => idx === i ? { ...ft, image: url } : ft);
      update({ features });
    } catch { alert("Upload failed"); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
        <h3 className="font-display text-xl font-bold text-primary">General</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Logo" url={youth.logo} onPick={pickLogo} />
          <div className="space-y-3">
            <label className="block text-sm font-medium">WhatsApp Group URL</label>
            <input className="w-full px-4 py-2.5 border rounded-lg" value={youth.whatsappUrl} onChange={(e) => update({ whatsappUrl: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
            <label className="block text-sm font-medium">Instagram Handle</label>
            <input className="w-full px-4 py-2.5 border rounded-lg" value={youth.instagramHandle} onChange={(e) => update({ instagramHandle: e.target.value })} placeholder="Gaura_Bhaktas_Official" />
            <label className="block text-sm font-medium">Schedule</label>
            <input className="w-full px-4 py-2.5 border rounded-lg" value={youth.schedule} onChange={(e) => update({ schedule: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue Address</label>
          <textarea className="w-full px-4 py-2.5 border rounded-lg" rows={3} value={youth.venue} onChange={(e) => update({ venue: e.target.value })} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary">Feature Cards (Image, Title, Description)</h3>
          {youth.features.length < 6 && (
            <button
              onClick={() => {
                update({
                  features: [
                    ...youth.features,
                    { title: "New Activity", desc: "Description of the activity.", image: "" }
                  ]
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/95 font-semibold rounded-lg text-sm transition shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Activity Card
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {youth.features.map((ft, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-xl bg-slate-50/50 relative">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="text-xs font-bold text-primary">Card {i + 1}</span>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${ft.title || `Card ${i + 1}`}"?`)) {
                      update({ features: youth.features.filter((_, idx) => idx !== i) });
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 transition p-1"
                  title="Delete Card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <UploadBox label={`Card Image`} url={ft.image} onPick={(f) => pickFeature(i, f)} />

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
                <input
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm"
                  value={ft.title}
                  onChange={(e) => update({ features: youth.features.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x) })}
                  placeholder="Card Title"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm"
                  rows={3}
                  value={ft.desc || ""}
                  onChange={(e) => update({ features: youth.features.map((x, idx) => idx === i ? { ...x, desc: e.target.value } : x) })}
                  placeholder="Card Description"
                />
              </div>
            </div>
          ))}
        </div>
        {busy && <p className="text-sm text-muted-foreground mt-3">Uploading…</p>}
      </div>
    </div>
  );
}

function GalleryTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { setUrl(await uploadToCloudinary(f)); } catch { alert("Upload failed"); }
    setBusy(false);
  };
  const add = () => {
    if (!url) return alert("Upload an image first");
    update({ gallery: [...youth.gallery, { id: Date.now().toString(), url, label }] });
    setUrl(""); setLabel("");
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= youth.gallery.length) return;
    const copy = [...youth.gallery];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    update({ gallery: copy });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Gallery Image</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Image" url={url} onPick={onPick} />
          <div className="space-y-3">
            <input className="w-full px-4 py-2.5 border rounded-lg" placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
            <button disabled={busy} onClick={add} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
              {busy ? "Uploading…" : "Add Image"}
            </button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Gallery ({youth.gallery.length})</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {youth.gallery.map((g, i) => (
            <div key={g.id} className="bg-white rounded-xl shadow border overflow-hidden">
              <img src={g.url} alt={g.label} className="w-full aspect-square object-cover" />
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium truncate">{g.label || "(no label)"}</div>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} className="p-2 rounded hover:bg-muted" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-2 rounded hover:bg-muted" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => update({ gallery: youth.gallery.filter((x) => x.id !== g.id) })} className="p-2 rounded hover:bg-destructive/10 text-destructive ml-auto" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ youth, update }: { youth: YouthData; update: (p: Partial<YouthData>) => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const add = () => {
    if (!name.trim() || !text.trim()) return alert("Enter name and review");
    update({ reviews: [...youth.reviews, { id: Date.now().toString(), name: name.trim(), text: text.trim(), rating, visible: true }] });
    setName(""); setText(""); setRating(5);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Add Review</h3>
        <input className="w-full px-4 py-2.5 border rounded-lg" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full px-4 py-2.5 border rounded-lg" rows={3} placeholder="Review text" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-2">
          <span className="text-sm">Rating:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={`h-5 w-5 ${n <= rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <button onClick={add} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add Review</button>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold text-primary">Reviews ({youth.reviews.length})</h3>
        {youth.reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow border p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{r.name}</span>
                <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => update({ reviews: youth.reviews.map((x) => x.id === r.id ? { ...x, visible: !x.visible } : x) })} className="p-2 rounded hover:bg-muted" aria-label="Toggle visible">
                {r.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={() => update({ reviews: youth.reviews.filter((x) => x.id !== r.id) })} className="p-2 rounded hover:bg-destructive/10 text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
