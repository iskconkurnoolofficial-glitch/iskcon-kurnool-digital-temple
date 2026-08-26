import { useState, useMemo } from "react";
import { useAdmin, uploadToCloudinary } from "@/context/AdminContext";
import AdminModal from "./AdminModal";
import { 
  Image as ImageIcon, 
  Search, 
  Check, 
  Upload, 
  Sparkles, 
  Layers, 
  Plus,
  Trash2,
  Copy
} from "lucide-react";
import { toast } from "sonner";

export interface MediaItem {
  url: string;
  title: string;
  category: "Sevas" | "Festivals" | "Sliders" | "Gallery" | "Programs" | "Settings" | "Uploaded";
}

// Persistent key for all uploaded images
const UPLOAD_HISTORY_KEY = "iskcon_uploaded_images_history";

export function recordUploadedMedia(url: string, title?: string) {
  if (!url || typeof url !== "string") return;
  try {
    const raw = localStorage.getItem(UPLOAD_HISTORY_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(url)) {
      list.unshift(url);
      localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
    }
  } catch {}
}

export function getRecordedUploadedMedia(): string[] {
  try {
    const raw = localStorage.getItem(UPLOAD_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  title = "Temple Media Library",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  title?: string;
}) {
  const adminState = useAdmin();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Harvest all images from the entire site state & local history
  const allMediaItems = useMemo(() => {
    const map = new Map<string, MediaItem>();

    const add = (url: string | undefined, title: string, category: MediaItem["category"]) => {
      if (!url || typeof url !== "string" || url.trim().length === 0) return;
      const cleanUrl = url.trim();
      // Exclude data URLs or empty placeholders
      if (cleanUrl.startsWith("data:") && cleanUrl.length < 50) return;
      if (!map.has(cleanUrl)) {
        map.set(cleanUrl, { url: cleanUrl, title, category });
      }
    };

    // 1. History of uploaded images
    getRecordedUploadedMedia().forEach((u, i) => {
      add(u, `Uploaded Image #${i + 1}`, "Uploaded");
    });

    // 2. Sevas
    (adminState.sevas || []).forEach((s) => {
      if (s.thumbnail) add(s.thumbnail, s.title || "Seva Thumbnail", "Sevas");
    });

    // 3. Festivals
    (adminState.festivals || []).forEach((f) => {
      if (f.thumbnail) add(f.thumbnail, `${f.title} (Thumbnail)`, "Festivals");
      if (f.desktopBanner) add(f.desktopBanner, `${f.title} (Banner)`, "Festivals");
      if (f.mobileBanner) add(f.mobileBanner, `${f.title} (Mobile)`, "Festivals");
    });

    // 4. Sliders / Carousel & Hero Banners
    (adminState.slides || []).forEach((sl) => {
      if (sl.desktop) add(sl.desktop, sl.title || "Carousel Desktop Slide", "Sliders");
      if (sl.mobile) add(sl.mobile, sl.title || "Carousel Mobile Slide", "Sliders");
    });

    if (adminState.heroBanners && typeof adminState.heroBanners === "object") {
      Object.entries(adminState.heroBanners).forEach(([key, val]) => {
        if (typeof val === "string" && val) {
          add(val, `Page Banner (${key})`, "Sliders");
        }
      });
    }

    // 5. Gallery Photos
    (adminState.photos || []).forEach((g) => {
      if (g.url) add(g.url, g.title || "Gallery Photo", "Gallery");
    });

    // 6. Sunday & Youth & Other Programs
    const sunday = adminState.sunday;
    if (sunday) {
      if (sunday.logo) add(sunday.logo, "Sunday Program Logo", "Programs");
      if (sunday.timingsImage) add(sunday.timingsImage, "Sunday Timings Image", "Programs");
      (sunday.gallery || []).forEach((g) => g.url && add(g.url, "Sunday Gallery Photo", "Programs"));
      (sunday.activities || []).forEach((a) => a.image && add(a.image, a.title, "Programs"));
    }

    const youth = adminState.youth;
    if (youth) {
      if (youth.logo) add(youth.logo, "Youth Logo", "Programs");
      (youth.gallery || []).forEach((g) => g.url && add(g.url, "Youth Photo", "Programs"));
    }

    const harinama = adminState.harinama;
    if (harinama) {
      if (harinama.aboutImage) add(harinama.aboutImage, "Harinama Section", "Programs");
      (harinama.gallery || []).forEach((g) => g.url && add(g.url, "Harinama Photo", "Programs"));
    }

    const goshala = adminState.goshala;
    if (goshala) {
      if (goshala.aboutImage) add(goshala.aboutImage, "Goshala Section", "Programs");
      (goshala.gallery || []).forEach((g) => g.url && add(g.url, "Goshala Photo", "Programs"));
    }

    const prahlada = adminState.prahladaBadi;
    if (prahlada) {
      if (prahlada.heroImage) add(prahlada.heroImage, "Prahlada Badi Banner", "Programs");
      (prahlada.gallery || []).forEach((g) => g.url && add(g.url, "Prahlada Badi Photo", "Programs"));
    }

    // 7. Site Settings
    const settings = adminState.settings;
    if (settings) {
      if (settings.logo) add(settings.logo, "Temple Official Logo", "Settings");
      if (settings.welcomeImage) add(settings.welcomeImage, "Welcome Section Image", "Settings");
      if (settings.quickDonateImage) add(settings.quickDonateImage, "Quick Donate Banner", "Settings");
    }

    return Array.from(map.values());
  }, [adminState]);

  // Categories list with counts
  const categoriesList = useMemo(() => {
    const cats = ["All", "Sevas", "Festivals", "Sliders", "Gallery", "Programs", "Settings", "Uploaded"];
    return cats.map((cat) => {
      const count = cat === "All" 
        ? allMediaItems.length 
        : allMediaItems.filter((m) => m.category === cat).length;
      return { label: cat, count };
    });
  }, [allMediaItems]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allMediaItems.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
    });
  }, [allMediaItems, activeCategory, search]);

  const handleSelect = (url: string) => {
    recordUploadedMedia(url);
    onSelectImage(url);
    toast.success("✨ Image selected from media library!");
    onClose();
  };

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      recordUploadedMedia(url, file.name);
      handleSelect(url);
    } catch {
      toast.error("Image upload failed");
    }
    setIsUploading(false);
  };

  const handleAddCustomUrl = () => {
    const clean = customUrlInput.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("/")) {
      toast.error("Please enter a valid image URL");
      return;
    }
    recordUploadedMedia(clean, "Custom URL");
    handleSelect(clean);
    setCustomUrlInput("");
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Browse, search, or pick any of the ${allMediaItems.length} previously uploaded images on this portal`}
      icon={ImageIcon}
      maxWidth="4xl"
    >
      <div className="space-y-5 font-sans">
        
        {/* Top Controls: Search Bar + Direct Upload + URL Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Upload New Image Button */}
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0">
            <Upload className="h-4 w-4" />
            <span>{isUploading ? "Uploading..." : "Upload New"}</span>
            <input 
              type="file" 
              accept="image/*" 
              disabled={isUploading}
              onChange={handleUploadNew} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none font-sans">
          {categoriesList.map((cat) => {
            const isAct = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isAct
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50/70"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isAct ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Images Grid */}
        <div className="min-h-[300px] max-h-[460px] overflow-y-auto pr-1 border border-slate-200/80 rounded-2xl p-3 bg-slate-50/60">
          {filtered.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm text-slate-700">No images found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                No images matched your query. You can upload a new photo using the button above or paste an image URL below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filtered.map((item, idx) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={`${item.url}-${idx}`}
                    onClick={() => setSelectedUrl(item.url)}
                    onDoubleClick={() => handleSelect(item.url)}
                    className={`group relative rounded-2xl overflow-hidden bg-white border-2 cursor-pointer transition-all duration-200 flex flex-col shadow-xs hover:shadow-md ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                        : "border-slate-200 hover:border-amber-400"
                    }`}
                  >
                    {/* Thumbnail View */}
                    <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Title & Select CTA */}
                    <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-1 truncate" title={item.title}>
                        {item.title}
                      </p>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item.url);
                        }}
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-primary to-purple-700 hover:from-primary/90 text-white rounded-xl text-[11px] font-bold shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Select</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Bar: Paste Direct URL Option + Selected Action */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomUrl()}
              placeholder="Or paste any direct image URL..."
              className="flex-1 px-3.5 py-2 border rounded-xl bg-white text-xs font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomUrl}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              Use URL
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {selectedUrl && (
              <button
                type="button"
                onClick={() => handleSelect(selectedUrl)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Selection</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </AdminModal>
  );
}
