import { useState } from "react";
import { useAdmin, uploadToCloudinary } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Plus, X, Pencil, Check, Image as ImageIcon, 
  Sparkles, Eye, Tag, Search 
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function GalleryManager() {
  const { photos, setPhotos, categories, setCategories } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0] || "Temple");
  const [newCat, setNewCat] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const onPick = async (f: File) => {
    setBusy(true);
    try { 
      const uploadedUrl = await uploadToCloudinary(f);
      setUrl(uploadedUrl); 
      toast.success("Photo uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setUrl("");
    setTitle("");
    setCat(categories[0] || "Temple");
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEdit = (p: { id: string; url: string; title: string; category: string }) => {
    setEditingId(p.id);
    setUrl(p.url);
    setTitle(p.title);
    setCat(p.category || categories[0] || "Temple");
    setIsModalOpen(true);
  };

  const save = () => {
    if (!url.trim()) {
      toast.error("Please upload or enter an image URL");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a photo caption / title");
      return;
    }

    if (editingId) {
      setPhotos(photos.map((p) => (p.id === editingId ? { ...p, url, title, category: cat } : p)));
      toast.success("Photo updated successfully!");
    } else {
      setPhotos([...photos, { id: Date.now().toString(), url, title, category: cat }]);
      toast.success("✨ New photo added to gallery!");
    }
    setIsModalOpen(false);
    resetForm();
  };

  const removePhoto = (id: string, photoTitle: string) => {
    if (confirm(`Delete "${photoTitle}" from gallery?`)) {
      setPhotos(photos.filter((p) => p.id !== id));
      if (editingId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      toast.success("Photo removed");
    }
  };

  const filteredPhotos = photos.filter((p) => {
    if (selectedCatFilter !== "all" && p.category !== selectedCatFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-purple-200/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-purple-500/20 text-purple-800 rounded-2xl shrink-0 shadow-xs">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Media & Temple Gallery</h2>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Photos & Visuals
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Upload and categorize high-resolution photos of temple festivities, deities, youth yatras, goshala, and harinama sankirtana.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Photos</span>
              <strong className="font-display text-lg text-primary">{photos.length}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Categories</span>
              <strong className="font-display text-lg text-indigo-600">{categories.length}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/90 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Photo
            </button>
            <a
              href="/gallery"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Gallery
            </a>
          </div>
        </div>
      </div>

      {/* Categories Manager Card */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-accent" /> Manage Gallery Categories
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-foreground text-xs font-semibold">
              {c}
              <button
                type="button"
                onClick={() => {
                  if (categories.length <= 1) {
                    toast.error("At least one category is required");
                    return;
                  }
                  setCategories(categories.filter((x) => x !== c));
                  toast.info(`Category "${c}" removed`);
                }}
                className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-md pt-1">
          <input
            className="flex-1 px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs"
            placeholder="New category name (e.g. Snana Yatra)..."
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCat.trim()) {
                e.preventDefault();
                if (!categories.includes(newCat.trim())) {
                  setCategories([...categories, newCat.trim()]);
                  toast.success(`Category "${newCat.trim()}" added!`);
                }
                setNewCat("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (newCat.trim()) {
                if (!categories.includes(newCat.trim())) {
                  setCategories([...categories, newCat.trim()]);
                  toast.success(`Category "${newCat.trim()}" added!`);
                }
                setNewCat("");
              }
            }}
            disabled={!newCat.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search photos by title..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none text-xs sm:text-sm shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="px-3.5 py-2.5 border rounded-xl bg-white text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="all">All Categories ({photos.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({photos.filter((p) => p.category === c).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPhotos.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
              <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {p.category}
              </span>
            </div>

            <div className="p-3 space-y-2">
              <h4 className="font-display font-bold text-xs text-foreground line-clamp-1">
                {p.title}
              </h4>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(p.id, p.title)}
                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP MODAL FOR ADD / EDIT PHOTO */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Gallery Photo" : "Add New Gallery Photo"}
        subtitle="Upload temple photos and assign categories"
        icon={ImageIcon}
        maxWidth="xl"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox
              label="Gallery Photo"
              url={url}
              onPick={onPick}
              aspect="aspect-square"
              className="w-full max-w-[200px]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Photo Title / Caption <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="e.g. Sri Sri Radha Govinda Jhulan Yatra Darshan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Category
              </label>
              <select
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : (editingId ? "Save Changes" : "Add Photo")}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>

    </div>
  );
}
