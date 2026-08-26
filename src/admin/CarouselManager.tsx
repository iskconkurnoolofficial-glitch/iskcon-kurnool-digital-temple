import { useState } from "react";
import { useAdmin, uploadToCloudinary, Slide } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import MediaLibraryModal from "./MediaLibraryModal";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Pencil, X, Play, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CarouselManager() {
  const { slides, setSlides } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Slide>>({ title: "", subtitle: "", active: true });

  const upload = async (file: File, key: "desktop" | "mobile" | "video") => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraft((d) => ({ ...d, [key]: url }));
      toast.success(`${key.toUpperCase()} media uploaded!`);
    } catch (e) { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const resetForm = () => { 
    setDraft({ title: "", subtitle: "", active: true }); 
    setEditingId(null); 
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const save = () => {
    if (!draft.desktop && !draft.video) { 
      toast.error("Upload a desktop image or a video first"); 
      return; 
    }
    if (editingId) {
      setSlides(slides.map((s) => s.id === editingId ? { ...s, ...draft, desktop: draft.desktop || "", mobile: draft.mobile || draft.desktop || "" } as Slide : s));
      toast.success("Slide updated successfully!");
    } else {
      setSlides([...slides, {
        id: Date.now().toString(),
        desktop: draft.desktop || "",
        mobile: draft.mobile || draft.desktop || "",
        video: draft.video,
        title: draft.title, 
        subtitle: draft.subtitle,
        active: true,
      }]);
      toast.success("✨ New slide added successfully!");
    }
    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (s: Slide) => {
    setEditingId(s.id);
    setDraft({ ...s });
    setIsModalOpen(true);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const copy = [...slides];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setSlides(copy);
  };

  const totalCount = slides.length;
  const activeCount = slides.filter((s) => s.active !== false).length;

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* SECTION HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-purple-200/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-purple-500/20 text-purple-800 rounded-2xl shrink-0 shadow-xs">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Hero Carousel Banners</h2>
                <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
                  Homepage Media
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Add, reorder, and edit desktop & mobile banners or looping background video slides for the main homepage banner carousel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Total Slides</span>
              <strong className="font-display text-lg text-primary">{totalCount}</strong>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-2xs text-center">
              <span className="text-xs text-muted-foreground block font-medium">Active Slides</span>
              <strong className="font-display text-lg text-green-600">{activeCount}</strong>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 hover:from-primary/90 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Slide
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Homepage
            </a>
          </div>
        </div>
      </div>

      {/* POPUP MODAL FOR ADD / EDIT SLIDE */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Slide Configuration" : "Add New Hero Banner Slide"}
        subtitle="Upload desktop/mobile images or looping video and configure titles"
        icon={ImageIcon}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <UploadBox
              label="Desktop Image (4917×1750)"
              url={draft.desktop}
              onPick={(f) => upload(f, "desktop")}
              aspect="aspect-video"
              className="w-full"
            />
            <UploadBox
              label="Mobile Image (1080×1350)"
              url={draft.mobile}
              onPick={(f) => upload(f, "mobile")}
              aspect="aspect-[4/5]"
              className="w-full"
            />
            <UploadBox
              label="Video (optional .mp4)"
              url={draft.video}
              onPick={(f) => upload(f, "video")}
              aspect="aspect-video"
              className="w-full"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Slide Headline Title
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="e.g. Sri Sri Radha Govinda Mandir"
                value={draft.title || ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1">
                Subtitle / Description
              </label>
              <input
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="e.g. Experience Spiritual Serenity & Vedic Wisdom"
                value={draft.subtitle || ""}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>Active in Carousel</span>
            </label>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {busy ? "Saving..." : (editingId ? "Save Slide Changes" : "Add Slide")}
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

      {/* EXISTING SLIDES GRID */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Live Carousel Slides ({slides.length})</h3>
        {slides.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed text-center space-y-2">
            <p className="font-bold text-slate-600 text-sm">No Slides Created</p>
            <p className="text-xs text-slate-400">Use the editor form above to add image or video banners to the homepage carousel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                  editingId === s.id ? "ring-2 ring-primary border-primary shadow-md" : "hover:border-slate-300"
                }`}
              >
                <div className="relative">
                  {s.video ? (
                    <video src={s.video} className="w-full aspect-video object-cover" muted loop playsInline autoPlay />
                  ) : (
                    <img src={s.desktop} alt="" className="w-full aspect-video object-cover" />
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                      s.active ? "bg-emerald-600/90 text-white" : "bg-slate-900/80 text-white/80"
                    }`}>
                      {s.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{s.title || "(Untitled Slide)"}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.subtitle || "No subtitle"}</p>
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === slides.length - 1}
                      className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSlides(slides.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                      title="Toggle Visibility"
                    >
                      {s.active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => startEdit(s)}
                      className="p-2 rounded-xl hover:bg-primary/10 text-primary transition"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSlides(slides.filter((x) => x.id !== s.id))}
                      className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function UploadBox({ 
  label, 
  url, 
  onPick,
  onSelectUrl,
  aspect = "aspect-video",
  className = ""
}: { 
  label: string; 
  url?: string; 
  onPick: (f: File) => void;
  onSelectUrl?: (url: string) => void;
  aspect?: string;
  className?: string;
}) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleLibrarySelect = async (selectedUrl: string) => {
    if (onSelectUrl) {
      onSelectUrl(selectedUrl);
      return;
    }
    // Convert selected image URL to a File for backward compatibility with components using onPick
    try {
      const res = await fetch(selectedUrl);
      const blob = await res.blob();
      const filename = selectedUrl.split("/").pop() || "media-image.jpg";
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      onPick(file);
    } catch {
      // Fallback: create placeholder file with URL name if fetch fails
      const fallbackFile = new File([""], selectedUrl, { type: "image/jpeg" });
      onPick(fallbackFile);
    }
  };

  return (
    <div className={`block ${className}`}>
      {/* Label and Pick from Pre-Uploaded Library action */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs sm:text-sm font-semibold text-foreground/80 block truncate">{label}</span>
        <button
          type="button"
          onClick={() => setIsLibraryOpen(true)}
          className="text-[11px] font-bold text-primary hover:text-amber-800 inline-flex items-center gap-1 bg-amber-50/90 hover:bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-200/80 transition shadow-2xs cursor-pointer shrink-0"
          title="Choose from already uploaded temple images"
        >
          <ImageIcon className="h-3 w-3 text-amber-600" />
          <span>Library</span>
        </button>
      </div>

      <div className="relative group">
        <div className={`relative ${aspect} bg-slate-50/80 rounded-2xl border-2 border-dashed border-border/80 overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:bg-primary/[0.01] shadow-xs`}>
          {url ? (
            <>
              <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {/* Premium Hover Overlay with Upload & Library Actions */}
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 p-2 transition-opacity duration-300 text-white font-bold text-xs backdrop-blur-2xs">
                <label className="p-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm cursor-pointer flex items-center gap-1.5 transition">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLibraryOpen(true);
                  }}
                  className="p-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer flex items-center gap-1.5 transition shadow-xs"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Library</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground space-y-2 select-none w-full">
              <label className="cursor-pointer block space-y-1">
                <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition duration-300 inline-block">
                  <Upload className="h-4 w-4 mx-auto" />
                </div>
                <p className="text-xs font-semibold text-foreground/75">Click to upload</p>
                <p className="text-[10px] text-muted-foreground">PNG, JPG or WEBP</p>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
              </label>

              <div className="pt-1 border-t border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 border border-amber-300/80 rounded-lg transition cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Choose Pre-Uploaded</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Popup Modal */}
      {isLibraryOpen && (
        <MediaLibraryModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelectImage={handleLibrarySelect}
          title={`Select ${label || "Image"}`}
        />
      )}
    </div>
  );
}

export function VideoUploadBox({ 
  label, 
  url, 
  onPick, 
  onClear,
  aspect = "aspect-video",
  className = ""
}: { 
  label: string; 
  url?: string; 
  onPick: (f: File) => void; 
  onClear: () => void;
  aspect?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-sm font-semibold text-foreground/80 mb-1.5 block">{label}</span>
      <div className={`relative ${aspect} bg-slate-50/80 rounded-xl border-2 border-dashed border-border/80 overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:bg-primary/[0.01] shadow-sm group`}>
        {url ? (
          <>
            <video src={url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline autoPlay />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
              <Play className="h-7 w-7 text-white" />
            </div>
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-destructive shadow-sm hover:bg-destructive hover:text-white transition duration-200"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4 text-center text-muted-foreground space-y-1 select-none">
            <div className="p-3 rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition duration-300 inline-block">
              <Upload className="h-5 w-5 mx-auto" />
            </div>
            <p className="text-xs font-semibold text-foreground/75">Click to upload video</p>
            <p className="text-[10px] text-muted-foreground">MP4 or WEBM (optional)</p>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
}
