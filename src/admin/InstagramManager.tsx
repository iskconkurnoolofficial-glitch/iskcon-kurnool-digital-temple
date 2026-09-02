import { useState } from "react";
import { useAdmin, InstagramData, uploadToCloudinary } from "@/context/AdminContext";
import { Instagram, Youtube, Facebook, MessageCircle, Save, FileText, Globe, Hash, Upload, Trash2, Check, Link2, Twitter } from "lucide-react";
import { toast } from "sonner";

export default function InstagramManager() {
  const { instagram, setInstagram, settings, setSettings } = useAdmin();
  
  const [fullName, setFullName] = useState(instagram?.fullName || "");
  const [username, setUsername] = useState(instagram?.username || "");
  const [bio, setBio] = useState(instagram?.bio || "");
  const [hashtags, setHashtags] = useState(instagram?.hashtags || "");
  const [websiteUrl, setWebsiteUrl] = useState(instagram?.websiteUrl || "");

  const [instaLink, setInstaLink] = useState(settings?.instagram || "");
  const [ytLink, setYtLink] = useState(settings?.youtube || "");
  const [fbLink, setFbLink] = useState(settings?.facebook || "");
  const [waLink, setWaLink] = useState(settings?.whatsapp || "");
  const [twitterLink, setTwitterLink] = useState(settings?.twitter || "");
  
  // Clone reels list (exactly 8 slots)
  const [reels, setReels] = useState<string[]>(() => {
    const list = Array(8).fill("");
    (instagram?.reels || []).forEach((r, idx) => {
      if (idx < 8) list[idx] = r.url;
    });
    return list;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedReels = reels.map((url, idx) => ({
        id: `r${idx + 1}`,
        url: url.trim(),
      }));

      const payload: InstagramData = {
        fullName: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        hashtags: hashtags.trim(),
        websiteUrl: websiteUrl.trim(),
        reels: updatedReels,
      };

      await setInstagram(payload);

      // Save SiteSettings links
      const updatedSettings = {
        ...settings,
        instagram: instaLink.trim(),
        youtube: ytLink.trim(),
        facebook: fbLink.trim(),
        whatsapp: waLink.trim(),
        twitter: twitterLink.trim(),
      };
      await setSettings(updatedSettings);

      toast.success("Instagram and social links updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update Instagram settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReelChange = (idx: number, url: string) => {
    const next = [...reels];
    next[idx] = url;
    setReels(next);
  };

  return (
    <div className="space-y-8 max-w-4xl font-sans">
      {/* Bio / Profile Section */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="h-10 w-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Instagram Profile Info</h3>
            <p className="text-xs text-muted-foreground">Configure the profile header shown on the media page</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Instagram Full Name</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. ISKCON KURNOOL OFFICIAL"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Instagram Username</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-semibold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="iskcon_kurnool"
                className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Bio Hashtags</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#ISKCONKurnool #JagannathSeva"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Website URL Link</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. www.iskconkurnool.com"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Biography Description</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Welcome message or description of services..."
            className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
          />
        </div>
      </div>

      {/* Social Platform Channel Links */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Social Platform Card Links</h3>
            <p className="text-xs text-muted-foreground">Configure the destination links for the platform channels cards</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Instagram Link</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={instaLink}
                onChange={(e) => setInstaLink(e.target.value)}
                placeholder="e.g. https://instagram.com/username"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">YouTube Channel Link</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                placeholder="e.g. https://youtube.com/@channel"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Facebook Page Link</label>
            <div className="relative">
              <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                placeholder="e.g. https://facebook.com/page"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">WhatsApp Channel/Group Link</label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={waLink}
                onChange={(e) => setWaLink(e.target.value)}
                placeholder="e.g. https://chat.whatsapp.com/... or phone number"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Twitter / X Profile Link</label>
            <div className="relative">
              <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={twitterLink}
                onChange={(e) => setTwitterLink(e.target.value)}
                placeholder="e.g. https://twitter.com/username"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reels Upload Slots Grid */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Featured Reels Video Uploads (4 Columns × 2 Rows)</h3>
            <p className="text-xs text-muted-foreground">Upload mp4/mov video files directly to show and play in the Reels section</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {reels.map((url, idx) => (
            <ReelSlot
              key={idx}
              index={idx}
              url={url}
              onChange={(newUrl) => handleReelChange(idx, newUrl)}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
            saved
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:shadow-emerald-600/20"
              : "bg-primary hover:bg-primary/95 text-white shadow-primary/10 hover:shadow-primary/20"
          }`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 animate-scale-circle" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Instagram Settings"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ReelSlot({
  index,
  url,
  onChange,
}: {
  index: number;
  url: string;
  onChange: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handlePick = async (file: File) => {
    setLoading(true);
    try {
      const secureUrl = await uploadToCloudinary(file, "ISKCON-KURNOOL/Instagram");
      onChange(secureUrl);
      toast.success(`Video ${index + 1} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans text-center">
        Reel Slot {index + 1}
      </label>
      <div className="relative aspect-[9/16] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden grid place-items-center hover:border-primary transition group shadow-sm">
        {loading ? (
          <div className="text-center p-3 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <span className="text-[10px] text-primary font-bold block leading-tight">Uploading...</span>
          </div>
        ) : url ? (
          <>
            <video src={url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline autoPlay />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 p-1.5 text-xs font-medium text-destructive hover:bg-white shadow transition cursor-pointer"
              aria-label="Remove video"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <label className="absolute inset-0 grid place-items-center cursor-pointer">
            <div className="text-center text-muted-foreground p-3">
              <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] font-bold block leading-tight text-slate-500 uppercase tracking-wider">Upload Video</span>
              <span className="text-[8px] font-medium block text-slate-400 mt-1">MP4, WebM, MOV</span>
            </div>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePick(e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );
}
