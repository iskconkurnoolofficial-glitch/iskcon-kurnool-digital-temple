import { useState } from "react";
import { useAdmin, uploadToCloudinary } from "@/context/AdminContext";
import { Trash2, Plus, X } from "lucide-react";
import { UploadBox } from "./CarouselManager";

export default function GalleryManager() {
  const { photos, setPhotos, categories, setCategories } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0] || "Temple");
  const [newCat, setNewCat] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { setUrl(await uploadToCloudinary(f)); } catch { alert("Upload failed"); }
    setBusy(false);
  };

  const add = () => {
    if (!url || !title) return alert("Upload image and enter title");
    setPhotos([...photos, { id: Date.now().toString(), url, title, category: cat }]);
    setUrl(""); setTitle("");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Add Photo</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <UploadBox label="Photo" url={url} onPick={onPick} />
          <div className="space-y-3">
            <input className="w-full px-4 py-2.5 border rounded-lg" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="w-full px-4 py-2.5 border rounded-lg" value={cat} onChange={(e) => setCat(e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button disabled={busy} onClick={add} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
              {busy ? "Uploading..." : "Add Photo"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface text-foreground text-sm">
              {c}
              <button onClick={() => setCategories(categories.filter((x) => x !== c))} aria-label={`Remove ${c}`}><X className="h-3.5 w-3.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 px-4 py-2 border rounded-lg" placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <button onClick={() => { if (newCat.trim()) { setCategories([...categories, newCat.trim()]); setNewCat(""); } }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-primary mb-4">Photos ({photos.length})</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow border overflow-hidden group relative">
              <img src={p.url} alt={p.title} className="w-full aspect-square object-cover" />
              <div className="p-3">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.category}</div>
              </div>
              <button onClick={() => setPhotos(photos.filter((x) => x.id !== p.id))} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
