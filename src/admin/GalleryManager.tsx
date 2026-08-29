import { useState } from "react";
import { useAdmin, uploadToCloudinary, DriveAlbum } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Trash2, Plus, X, Pencil, Check, Image as ImageIcon, 
  Sparkles, Eye, Tag, Search, FolderOpen, ExternalLink, Globe, EyeOff, Folder
} from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export function extractGoogleDriveFolderId(url: string): string | null {
  if (!url) return null;
  const matchFolders = url.match(/\/folders\/([a-zA-Z0-9-_]{25,})([?#].*)?$/);
  if (matchFolders) return matchFolders[1];
  
  const matchFoldersMid = url.match(/\/folders\/([a-zA-Z0-9-_]{25,})/);
  if (matchFoldersMid) return matchFoldersMid[1];

  const matchId = url.match(/[?&]id=([a-zA-Z0-9-_]{25,})/);
  if (matchId) return matchId[1];

  const cleanUrl = url.trim();
  if (/^[a-zA-Z0-9-_]{25,45}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return null;
}

export default function GalleryManager() {
  const { photos, setPhotos, categories, setCategories, driveAlbums, setDriveAlbums } = useAdmin();
  const [tab, setTab] = useState<"stream" | "albums">("stream");

  // State for Photo Stream Form
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0] || "Temple");
  const [newCat, setNewCat] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // State for Drive Albums Form
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumYear, setAlbumYear] = useState(new Date().getFullYear().toString());
  const [albumDriveUrl, setAlbumDriveUrl] = useState("");
  const [albumCoverUrl, setAlbumCoverUrl] = useState("");
  const [albumActive, setAlbumActive] = useState(true);
  const [albumBusy, setAlbumBusy] = useState(false);

  // Photo Stream Handlers
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

  // Drive Album Handlers
  const resetAlbumForm = () => {
    setEditingAlbumId(null);
    setAlbumTitle("");
    setAlbumYear(new Date().getFullYear().toString());
    setAlbumDriveUrl("");
    setAlbumCoverUrl("");
    setAlbumActive(true);
  };

  const openNewAlbum = () => {
    resetAlbumForm();
    setIsAlbumModalOpen(true);
  };

  const startEditAlbum = (a: DriveAlbum) => {
    setEditingAlbumId(a.id);
    setAlbumTitle(a.title);
    setAlbumYear(a.year);
    setAlbumDriveUrl(a.driveUrl);
    setAlbumCoverUrl(a.coverUrl || "");
    setAlbumActive(a.active);
    setIsAlbumModalOpen(true);
  };

  const saveAlbum = () => {
    if (!albumTitle.trim()) {
      toast.error("Please enter an album title");
      return;
    }
    if (!albumDriveUrl.trim()) {
      toast.error("Please enter a Google Drive folder URL");
      return;
    }

    const folderId = extractGoogleDriveFolderId(albumDriveUrl);
    if (!folderId) {
      toast.error("Invalid Google Drive folders link. Please paste a valid shared folders link.");
      return;
    }

    const nextAlbum: DriveAlbum = {
      id: editingAlbumId || "da_" + Date.now(),
      title: albumTitle.trim(),
      year: albumYear.trim(),
      driveUrl: albumDriveUrl.trim(),
      coverUrl: albumCoverUrl.trim() || undefined,
      active: albumActive,
    };

    if (editingAlbumId) {
      setDriveAlbums(driveAlbums.map((a) => (a.id === editingAlbumId ? nextAlbum : a)));
      toast.success("Drive album updated successfully!");
    } else {
      setDriveAlbums([...driveAlbums, nextAlbum]);
      toast.success("✨ New Google Drive album added!");
    }
    setIsAlbumModalOpen(false);
    resetAlbumForm();
  };

  const removeAlbum = (id: string, titleStr: string) => {
    if (confirm(`Delete Google Drive album "${titleStr}"?`)) {
      setDriveAlbums(driveAlbums.filter((a) => a.id !== id));
      toast.success("Album deleted");
    }
  };

  const onAlbumCoverPick = async (f: File) => {
    setAlbumBusy(true);
    try {
      const uploadedUrl = await uploadToCloudinary(f);
      setAlbumCoverUrl(uploadedUrl);
      toast.success("Album cover uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setAlbumBusy(false);
  };

  // Filter lists
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
                Upload photos to the Gallery View or manage Google Drive Folders containing thousands of festival archives for devotees to explore.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Photos</span>
              <strong className="font-display text-lg text-primary">{photos.length}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Drive Folders</span>
              <strong className="font-display text-lg text-amber-600">{driveAlbums.length}</strong>
            </div>
            
            {tab === "stream" ? (
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/90 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={openNewAlbum}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Drive Folder
              </button>
            )}

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

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b pb-1 font-sans">
        <button
          onClick={() => setTab("stream")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[6px] ${
            tab === "stream" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Gallery View
        </button>
        <button
          onClick={() => setTab("albums")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[6px] ${
            tab === "albums" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Festival Albums ({driveAlbums.length})
        </button>
      </div>

      {tab === "stream" && (
        <div className="space-y-6">
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
        </div>
      )}

      {tab === "albums" && (
        <div className="space-y-6">

          {driveAlbums.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-white">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-primary" />
              No Google Drive folders linked yet. Click <strong>Add Drive Folder</strong> to link bulk photo folders.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {driveAlbums.map((a) => {
                const folderId = extractGoogleDriveFolderId(a.driveUrl);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-elegant overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all p-4 relative"
                  >
                    {!a.active && (
                      <span className="absolute top-2 right-2 bg-gray-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                        <EyeOff className="h-2.5 w-2.5" /> Inactive
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Cover Preview */}
                      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center relative">
                        {a.coverUrl ? (
                          <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-primary/40 flex flex-col items-center">
                            <Folder className="h-10 w-10 text-amber-500 fill-amber-200" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Year {a.year}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-black text-sm text-primary line-clamp-1 leading-snug group-hover:text-amber-600 transition-colors">
                          {a.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold truncate font-sans">
                          Drive Folder ID: <span className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{folderId || "Invalid"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => startEditAlbum(a)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={a.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="Open Drive Link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAlbum(a.id, a.title)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Album"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {/* POPUP MODAL FOR ADD / EDIT GOOGLE DRIVE ALBUM */}
      <AdminModal
        isOpen={isAlbumModalOpen}
        onClose={() => {
          setIsAlbumModalOpen(false);
          resetAlbumForm();
        }}
        title={editingAlbumId ? "Edit Google Drive Album" : "Add Google Drive Album"}
        subtitle="Link shared Google Drive folders containing photo archives"
        icon={FolderOpen}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <UploadBox
              label="Album Cover Image (Optional)"
              url={albumCoverUrl}
              onPick={onAlbumCoverPick}
              aspect="aspect-video"
              className="w-full max-w-[240px]"
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Album / Folder Title <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="e.g. Sri Krishna Janmashtami 2026"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                  Year <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="e.g. 2026"
                  value={albumYear}
                  onChange={(e) => setAlbumYear(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Google Drive Folder URL / Share Link <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="https://drive.google.com/drive/folders/your-folder-id..."
                value={albumDriveUrl}
                onChange={(e) => setAlbumDriveUrl(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Ensure the Google Drive folder is set to <strong>"Anyone with the link can view"</strong> so visitors can browse the images.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold font-sans uppercase tracking-wider text-foreground">
                Active / Public Visibility
              </label>
              <button
                type="button"
                onClick={() => setAlbumActive(!albumActive)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide cursor-pointer transition ${
                  albumActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {albumActive ? "Visible on Site" : "Hidden"}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={saveAlbum}
              disabled={albumBusy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {albumBusy ? "Saving..." : (editingAlbumId ? "Save Changes" : "Link Folder")}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAlbumModalOpen(false);
                resetAlbumForm();
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
