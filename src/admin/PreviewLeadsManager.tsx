import { useState, useEffect } from "react";
import { useAdmin, uploadToCloudinary, PreviewLead } from "@/context/AdminContext";
import { Video, Upload, Trash2, Download, Search, Play, Phone, User, Calendar, Check, Sparkles, RefreshCw, FileText } from "lucide-react";
import { UploadBox } from "./CarouselManager";

export default function PreviewLeadsManager() {
  const { settings, setSettings, previewLeads, setPreviewLeads, markAllPreviewLeadsRead } = useAdmin();
  const [videoUrl, setVideoUrl] = useState(settings.previewVideoUrl || "");
  const [videoTitle, setVideoTitle] = useState(settings.previewVideoTitle || "Sri Sri Puri Jagannath Temple Preview");
  const [videoSubtitle, setVideoSubtitle] = useState(settings.previewVideoSubtitle || "Experience the divine preview of ISKCON Kurnool digital temple");
  
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setVideoUrl(settings.previewVideoUrl || "");
    setVideoTitle(settings.previewVideoTitle || "Sri Sri Puri Jagannath Temple Preview");
    setVideoSubtitle(settings.previewVideoSubtitle || "Experience the divine preview of ISKCON Kurnool digital temple");
  }, [settings]);

  const handleSaveVideoSettings = () => {
    setSettings({
      ...settings,
      previewVideoUrl: videoUrl.trim(),
      previewVideoTitle: videoTitle.trim(),
      previewVideoSubtitle: videoSubtitle.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setVideoUrl(url);
    } catch (err) {
      alert("Failed to upload video. Please check your internet connection or use a direct URL.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportCSV = () => {
    if (!previewLeads || previewLeads.length === 0) {
      alert("No lead entries to export.");
      return;
    }

    const headers = ["S.No", "Name", "Mobile Number", "Submission Date & Time", "ID"];
    const rows = previewLeads.map((lead, idx) => [
      idx + 1,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.phone}"`,
      `"${new Date(lead.date).toLocaleString("en-IN")}"`,
      `"${lead.id}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iskcon_kurnool_preview_unlock_leads_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Are you sure you want to remove this lead submission?")) {
      setPreviewLeads(previewLeads.filter((item) => item.id !== id));
    }
  };

  const handleClearAllLeads = () => {
    if (confirm("WARNING: Are you sure you want to clear ALL preview unlock submissions? Make sure you have exported CSV first!")) {
      setPreviewLeads([]);
    }
  };

  const filteredLeads = (previewLeads || []).filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* 1. Preview Video Management Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-primary">Coming Soon Preview Video</h3>
              <p className="text-xs text-muted-foreground">Upload or set the video shown when users unlock preview on the welcome screen.</p>
            </div>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 animate-pulse">
              <Check className="h-3.5 w-3.5" /> Saved Successfully
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-foreground/80 mb-1 block">Preview Video Title</span>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Sri Sri Puri Jagannath Temple Preview"
                className="w-full px-4 py-2.5 border rounded-lg text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground/80 mb-1 block">Preview Video Subtitle</span>
              <input
                type="text"
                value={videoSubtitle}
                onChange={(e) => setVideoSubtitle(e.target.value)}
                placeholder="e.g. Experience the divine preview of ISKCON Kurnool digital temple"
                className="w-full px-4 py-2.5 border rounded-lg text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground/80 mb-1 block">Video URL (MP4, Cloudinary, YouTube, or Vimeo)</span>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono text-xs"
              />
            </label>

            <div>
              <span className="text-sm font-semibold text-foreground/80 mb-1.5 block">Or Upload Video File (Cloudinary)</span>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary-foreground font-semibold text-xs cursor-pointer transition">
                  {isUploading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-4 w-4 text-primary" />
                  )}
                  {isUploading ? "Uploading Video..." : "Choose Video File (MP4)"}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-muted-foreground">Supported: MP4, WEBM, MOV</span>
              </div>
            </div>

            <button
              onClick={handleSaveVideoSettings}
              className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition cursor-pointer shadow"
            >
              Save Video Settings
            </button>
          </div>

          {/* Video Preview Box */}
          <div className="flex flex-col justify-center items-center bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white min-h-[220px]">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 text-accent" /> Live Video Preview
            </span>
            {videoUrl ? (
              videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-700">
                  <iframe
                    src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-[220px] rounded-xl object-contain bg-black border border-slate-700"
                />
              )
            ) : (
              <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl w-full">
                <Video className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No video uploaded yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Upload an MP4 file or paste a video link above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Preview Unlock Submissions Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-primary">Website Preview Unlock Submissions</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold text-xs">
                {previewLeads.length} Total Leads
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Name & Mobile Number submitted by visitors on the Welcome / Coming Soon screen.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {previewLeads.some((l) => !l.read) && (
              <button
                onClick={markAllPreviewLeadsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 text-xs shadow transition cursor-pointer animate-pulse"
                title="Mark all lead notifications as read"
              >
                <Check className="h-4 w-4 text-red-600" />
                <span>Mark All Read ({previewLeads.filter((l) => !l.read).length})</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={previewLeads.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>

            {previewLeads.length > 0 && (
              <button
                onClick={handleClearAllLeads}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm"
          />
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile Number</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    {previewLeads.length === 0
                      ? "No visitors have unlocked the preview yet."
                      : "No leads matched your search query."}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-900 font-semibold flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-xs shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{lead.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono">
                      <a
                        href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition"
                        title="Click to chat on WhatsApp"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(lead.date).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
