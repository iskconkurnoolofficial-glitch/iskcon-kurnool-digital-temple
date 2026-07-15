import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Radio, Link2, FileText, CheckCircle } from "lucide-react";

export default function LiveDashboardManager() {
  const { settings, setSettings } = useAdmin();
  const [title, setTitle] = useState(settings.liveStreamTitle || "");
  const [link, setLink] = useState(settings.liveStreamLink || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSettings({
      ...settings,
      liveStreamTitle: title.trim(),
      liveStreamLink: link.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-4 py-2.5 border rounded-lg text-sm bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Live Stream Panel Card */}
      <div className="bg-white rounded-2xl shadow p-6 border space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-600 animate-pulse" />
            LIVE Dashboard
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Control the global live stream notification banner across the website in real-time.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Live Stream Title / Announcement</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FileText className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Sri Krishna Janmashtami Maha Abhishekam Live"
                className={`${inputClass} pl-10`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Leave empty to display default title: "Join the Live Temple Stream now".
            </span>
          </div>

          <div>
            <label className={labelClass}>Live Broadcast URL / Link</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="url"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                className={`${inputClass} pl-10`}
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Provide a valid link (e.g. YouTube Live, Facebook Live). If left empty, the LIVE banner and buttons will be hidden.
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={save}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            Update Live Stream
          </button>
          
          {saved && (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1 animate-fade-in">
              <CheckCircle className="h-4.5 w-4.5" />
              Live settings updated successfully!
            </span>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      {(title.trim() || link.trim()) && (
        <div className="bg-slate-50/50 rounded-2xl p-6 border space-y-4 animate-fade-up">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Real-time Banner Preview</h4>
          <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white rounded-xl p-3 shadow flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="font-bold tracking-wider uppercase bg-white/15 px-1.5 py-0.5 rounded text-[9px]">
                Live Stream
              </span>
              <span className="font-semibold truncate max-w-[200px] sm:max-w-sm">
                {title.trim() || "Join the Live Temple Stream now"}
              </span>
            </div>
            {link.trim() && (
              <span className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-[10px] whitespace-nowrap">
                Watch LIVE
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
