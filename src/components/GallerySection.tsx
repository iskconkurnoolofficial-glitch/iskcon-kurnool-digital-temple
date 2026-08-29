import { useEffect, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Download, FolderOpen, Image as ImageIcon } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const downloadAsPng = async (url: string, filename: string) => {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const imageObjectURL = URL.createObjectURL(blob);
    
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageObjectURL;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${filename.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
          }
        }, "image/png");
      }
      URL.revokeObjectURL(imageObjectURL);
    };
  } catch (error) {
    console.error("Direct fetch failed, falling back to new window", error);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = `${filename.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function GallerySection() {
  const { photos, categories, driveAlbums } = useAdmin();
  const [activeTab, setActiveTab] = useState<"stream" | "albums">("stream");
  const [filter, setFilter] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filteredPhotos = filter === "All" ? photos : photos.filter((p) => p.category === filter);
  const activeAlbums = (driveAlbums || []).filter((a) => a.active);

  // Group albums by year
  const albumsByYear = useMemo(() => {
    const groups: { [year: string]: typeof activeAlbums } = {};
    activeAlbums.forEach((a) => {
      if (!groups[a.year]) groups[a.year] = [];
      groups[a.year].push(a);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        albums: groups[year],
      }));
  }, [activeAlbums]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % filteredPhotos.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + filteredPhotos.length) % filteredPhotos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filteredPhotos.length]);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-gradient-to-b from-surface to-background border-t relative overflow-hidden">
      {/* Soft glowing decorations */}
      <div className="absolute top-12 left-10 h-72 w-72 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-10 h-72 w-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 font-sans">
        
        {/* Toggle Switch Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs">
            <button
              onClick={() => setActiveTab("stream")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "stream"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gallery View
            </button>
            <button
              onClick={() => setActiveTab("albums")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "albums"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Festival Albums
            </button>
          </div>
        </div>

        {activeTab === "stream" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header controls: category switchers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6 border-slate-200/60">
              {/* Category Filter buttons */}
              <div className="flex flex-wrap gap-2 max-w-3xl">
                {["All", ...categories].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`px-5 py-2 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      filter === c
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 border border-dashed rounded-3xl max-w-md mx-auto">
                <ImageIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No photos available in this category.</p>
              </div>
            ) : (
              /* CSS Columns Masonry layout for original sizes */
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 animate-fade-in">
                {filteredPhotos.map((p, idx) => (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden relative break-inside-avoid w-full inline-block"
                  >
                    <button
                      onClick={() => setLightbox(idx)}
                      className="w-full block cursor-zoom-in overflow-hidden relative"
                    >
                      <img src={p.url} alt={p.title} loading="lazy" className="w-full h-auto group-hover:scale-105 transition-transform duration-500 rounded-3xl" />
                    </button>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-between p-4 pointer-events-none z-10 rounded-3xl">
                      <span className="text-white font-bold text-xs line-clamp-2 text-left pr-4">
                        {p.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAsPng(p.url, p.title || "gallery_photo");
                        }}
                        className="p-2 bg-white/20 hover:bg-white/45 backdrop-blur-md rounded-xl text-white transition pointer-events-auto shadow-sm shrink-0 cursor-pointer"
                        title="Download as PNG"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "albums" && (
          <div className="space-y-12 animate-fade-in">
            {activeAlbums.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 border border-dashed rounded-3xl max-w-md mx-auto">
                <FolderOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No festival albums available yet.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {albumsByYear.map(({ year, albums }) => (
                  <div key={year} className="space-y-6">
                    <h3 className="font-display font-black text-2xl text-primary border-b pb-2.5 flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
                        {year}
                      </span>
                      Festival Archives
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {albums.map((a) => (
                        <a
                          key={a.id}
                          href={a.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-left group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex flex-col justify-between h-full cursor-pointer"
                        >
                          <div className="space-y-4 w-full">
                            {/* Card Cover */}
                            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-50 border relative shrink-0 flex items-center justify-center">
                              {a.coverUrl ? (
                                <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-103" />
                              ) : (
                                <div className="text-primary/30 flex flex-col items-center">
                                  <FolderOpen className="h-12 w-12 text-amber-500 fill-amber-200" />
                                </div>
                              )}
                              <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                {year}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="font-display font-extrabold text-sm text-slate-900 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                                {a.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-sans line-clamp-1">
                                Click to open Google Drive folder
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-primary w-full">
                            <span>Open Drive Folder</span>
                            <FolderOpen className="h-3.5 w-3.5 text-accent" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {lightbox !== null && filteredPhotos[lightbox] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white p-2 cursor-pointer animate-scale-in" aria-label="Close"><X className="h-7 w-7" /></button>
          <button onClick={() => setLightbox((i) => (i! - 1 + filteredPhotos.length) % filteredPhotos.length)} className="absolute left-4 text-white p-3 cursor-pointer" aria-label="Previous"><ChevronLeft className="h-8 w-8" /></button>
          <button onClick={() => setLightbox((i) => (i! + 1) % filteredPhotos.length)} className="absolute right-4 text-white p-3 cursor-pointer" aria-label="Next"><ChevronRight className="h-8 w-8" /></button>
          <figure className="max-w-6xl max-h-[85vh] flex flex-col items-center gap-4">
            <img src={filteredPhotos[lightbox].url} alt={filteredPhotos[lightbox].title} className="max-h-[75vh] w-auto rounded-lg shadow-2xl border border-white/10" />
            <figcaption className="text-white/90 text-sm flex items-center gap-3 bg-white/10 backdrop-blur-md py-1.5 px-4 rounded-full border border-white/15">
              <span>{filteredPhotos[lightbox].title}</span>
              <button
                onClick={() => downloadAsPng(filteredPhotos[lightbox].url, filteredPhotos[lightbox].title || "gallery_photo")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Download as PNG"
              >
                <Download className="h-3.5 w-3.5" /> Download PNG
              </button>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
