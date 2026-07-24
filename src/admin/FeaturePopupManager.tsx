import { useState } from "react";
import { useAdmin, uploadToCloudinary, FeaturePopupData } from "@/context/AdminContext";
import { 
  Sparkles, 
  Upload, 
  Trash2, 
  Check, 
  Eye, 
  ExternalLink, 
  ArrowRight, 
  X, 
  Megaphone,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function FeaturePopupManager() {
  const { featurePopup, setFeaturePopup } = useAdmin();
  const [form, setForm] = useState<FeaturePopupData>({
    active: featurePopup?.active ?? false,
    image: featurePopup?.image ?? "",
    title: featurePopup?.title ?? "",
    content: featurePopup?.content ?? "",
    buttonText: featurePopup?.buttonText ?? "",
    buttonLink: featurePopup?.buttonLink ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUploadImage = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (e) {
      alert("Failed to upload image. Please try again.");
    }
    setBusy(false);
  };

  const handleSave = () => {
    setFeaturePopup(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isExternalLink = form.buttonLink?.startsWith("http://") || form.buttonLink?.startsWith("https://");

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-primary to-[#3d1a6a] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Megaphone className="h-3.5 w-3.5" /> Visitor Announcements
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Feature Pop-Up Manager</h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl">
            Configure a prominent popup banner to highlight upcoming festivals, special sevas, classes, or important temple announcements when visitors enter the site.
          </p>
        </div>

        {/* Global Active Toggle */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold">Pop-Up Status</div>
            <div className={`text-[11px] font-semibold ${form.active ? "text-emerald-300" : "text-white/60"}`}>
              {form.active ? "● ACTIVE ON SITE" : "○ INACTIVE"}
            </div>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer p-1 ${
              form.active ? "bg-emerald-500" : "bg-white/30"
            }`}
            aria-label="Toggle Pop-up status"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                form.active ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Configuration (Left Col - 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 pb-2 border-b">
            <Sparkles className="h-5 w-5 text-secondary" /> Pop-Up Content Settings
          </h3>

          {/* Banner Image Input & Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pop-Up Banner Image (Optional)
            </label>
            
            {form.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group max-h-52 bg-slate-900">
                <img src={form.image} alt="Preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="p-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-2xl p-6 text-center transition bg-slate-50/50 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">Upload a banner image</p>
                  <p className="text-[11px] text-muted-foreground">Recommended size: 1200x600 px (JPG, PNG, WebP)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadImage(e.target.files[0]);
                  }}
                  className="hidden"
                  id="popup-img-upload"
                  disabled={busy}
                />
                <label
                  htmlFor="popup-img-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-xs transition cursor-pointer shadow-sm hover:bg-primary/90 ${
                    busy ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {busy ? "Uploading image..." : "Browse File"}
                </label>
              </div>
            )}

            {/* Direct Image URL Alternative */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Or paste image URL (e.g. https://...)"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pop-Up Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sri Krishna Janmashtami 2026 Celebrations!"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>

          {/* Content Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pop-Up Content / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write the announcement description or invitation details..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-y"
            />
          </div>

          {/* Button Text & Optional Link */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Button Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Register for Seva"
                value={form.buttonText}
                onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Button Link / URL (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. /festivals or https://..."
                  value={form.buttonLink}
                  onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {form.active ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" /> Pop-up is currently active for all visitors
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  ⚠️ Pop-up is inactive (will not be shown to visitors)
                </span>
              )}
            </div>

            <button
              onClick={handleSave}
              className="py-3 px-7 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/35 transition cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-secondary" /> Saved Successfully!
                </>
              ) : (
                <>Save &amp; Update Pop-Up</>
              )}
            </button>
          </div>
        </div>

        {/* Live Interactive Preview (Right Col - 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-sm font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="h-4 w-4 text-primary" /> Visitor Live Preview
            </h3>
            <span className="text-[11px] text-muted-foreground bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
              Interactive Card
            </span>
          </div>

          {/* Simulated Modal Card */}
          <div className="bg-slate-900/80 p-4 sm:p-6 rounded-3xl backdrop-blur-md border border-slate-800 shadow-xl flex items-center justify-center min-h-[380px]">
            <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 flex flex-col relative animate-fade-in max-w-sm">
              {/* Close Button Mock */}
              <div className="absolute top-3.5 right-3.5 z-20 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center shadow-md">
                <X className="h-4 w-4" />
              </div>

              {/* Banner Preview */}
              {form.image ? (
                <div className="relative w-full h-40 bg-slate-900 overflow-hidden shrink-0">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      <Sparkles className="h-3 w-3" /> Announcement
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-24 bg-gradient-to-br from-primary to-[#3d1a6a] p-4 flex flex-col justify-end text-white shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider self-start">
                    <Sparkles className="h-3 w-3" /> Announcement
                  </span>
                </div>
              )}

              {/* Content Body Preview */}
              <div className="p-5 space-y-3">
                <h4 className="font-display text-lg font-bold text-primary leading-snug">
                  {form.title || "Announcement Title"}
                </h4>

                <p className="text-slate-600 text-xs leading-relaxed line-clamp-4 whitespace-pre-line">
                  {form.content || "Your announcement content text will display here..."}
                </p>

                {/* Button Preview */}
                <div className="pt-2 flex items-center gap-2">
                  {form.buttonText && form.buttonLink ? (
                    <div className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-[#3d1a6a] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <span>{form.buttonText}</span>
                      {isExternalLink ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    </div>
                  ) : null}
                  <div className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs text-center">
                    Close
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
