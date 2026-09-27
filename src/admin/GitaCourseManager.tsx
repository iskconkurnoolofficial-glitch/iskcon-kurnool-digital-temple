import { useState } from "react";
import { useAdmin, uploadToCloudinary, GitaCourseData } from "@/context/AdminContext";
import { Plus, Trash2, BookOpen, Eye, Sparkles, GraduationCap, Lock, CheckCircle2, Download, FileText, Upload, MessageSquare, Search, Users, ExternalLink, FileSpreadsheet, RefreshCw } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function GitaCourseManager() {
  const {
    gitaCourse,
    setGitaCourse,
    gitaDownloadLeads,
    deleteGitaDownloadLead,
    clearAllGitaDownloadLeads,
  } = useAdmin();

  const [busy, setBusy] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  const update = (patch: Partial<GitaCourseData>) => {
    setGitaCourse({ ...gitaCourse, ...patch });
    toast.success("Gita settings saved!");
  };

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ heroImage: url }); 
      toast.success("Hero image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickAboutImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ gitaAboutImage: url }); 
      toast.success("About image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickWhyImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ gitaWhyImage: url }); 
      toast.success("Why image uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const pickDownloadImage = async (f: File) => {
    setBusy(true);
    try { 
      const url = await uploadToCloudinary(f);
      update({ gitaDownloadImage: url }); 
      toast.success("Download cover graphic uploaded!");
    } catch { 
      toast.error("Upload failed"); 
    }
    setBusy(false);
  };

  const uploadPdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    toast.loading("Uploading Bhagavad Gita PDF file...");
    try {
      const url = await uploadToCloudinary(file);
      update({ gitaPdfUrl: url });
      toast.dismiss();
      toast.success("Bhagavad Gita PDF uploaded successfully!");
    } catch {
      toast.dismiss();
      toast.error("PDF upload failed. You can also paste direct URL.");
    }
    setBusy(false);
  };

  const exportCSV = () => {
    if (!gitaDownloadLeads || gitaDownloadLeads.length === 0) {
      toast.error("No download leads available to export.");
      return;
    }
    const headers = ["ID", "Name", "Gender", "WhatsApp Number", "Email", "Submission Date"];
    const rows = gitaDownloadLeads.map((l) => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.gender}"`,
      `"${l.whatsapp}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bhagavad_Gita_Download_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads exported to CSV successfully!");
  };

  const handleClearAllLeads = async () => {
    if (confirm("Are you sure you want to clear all Bhagavad Gita download leads? This action cannot be undone.")) {
      await clearAllGitaDownloadLeads();
      toast.success("All download leads cleared.");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  const setBadge = (i: number, v: string) => update({ badges: gitaCourse.badges.map((x, idx) => (idx === i ? v : x)) });
  const removeBadge = (i: number) => update({ badges: gitaCourse.badges.filter((_, idx) => idx !== i) });
  const addBadge = () => update({ badges: [...gitaCourse.badges, ""] });

  // Filtered Leads
  const filteredLeads = (gitaDownloadLeads || []).filter((l) => {
    const matchesSearch =
      !leadSearch ||
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.whatsapp.includes(leadSearch) ||
      (l.email && l.email.toLowerCase().includes(leadSearch.toLowerCase()));
    const matchesGender = genderFilter === "All" || l.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const totalDownloads = (gitaDownloadLeads || []).length;
  const maleCount = (gitaDownloadLeads || []).filter((l) => l.gender === "Male").length;
  const femaleCount = (gitaDownloadLeads || []).filter((l) => l.gender === "Female").length;
  const otherCount = (gitaDownloadLeads || []).filter((l) => l.gender === "Other").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Gita Course & Download Portal</h2>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Vedic Wisdom
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage Bhagavad Gita course details, free PDF downloads, cover graphics, and review all download request leads submitted by devotees.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/gita-course"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-accent" /> View Gita Course Page
            </a>
          </div>
        </div>
      </div>

      {/* BHAGAVAD GITA FREE PDF & DOWNLOAD SECTION MANAGER */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 rounded-3xl p-6 sm:p-8 border-2 border-amber-400/40 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                Download Bhagavad Gita Section &amp; PDF File Upload
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure the gold-themed download section on the Bhagavad Gita page and upload your PDF file.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-800 font-extrabold text-xs rounded-full border border-amber-400/40">
            <Sparkles className="h-3.5 w-3.5" /> Gold Theme Section
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* PDF File Link / Upload */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <label className={labelClass}>Bhagavad Gita PDF File (Direct URL or Upload)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className={inputClass}
                placeholder="Paste direct PDF URL or upload file below..."
                value={gitaCourse.gitaPdfUrl || ""}
                onChange={(e) => update({ gitaPdfUrl: e.target.value })}
              />
              <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs transition">
                <Upload className="h-4 w-4" /> Upload PDF File
                <input type="file" accept=".pdf,application/pdf" onChange={uploadPdfFile} className="hidden" />
              </label>
            </div>
            {gitaCourse.gitaPdfUrl ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium truncate">Configured PDF URL: {gitaCourse.gitaPdfUrl}</span>
                <a href={gitaCourse.gitaPdfUrl} target="_blank" rel="noreferrer" className="ml-auto text-emerald-800 font-bold hover:underline shrink-0">
                  Test Download ↗
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-amber-800/80 italic">
                * If empty, clicking download will use the default Bhagavad Gita digital edition cover &amp; download link.
              </p>
            )}
          </div>

          {/* Section Titles & Details */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                className={inputClass}
                placeholder="Download Bhagavad Gita for Free"
                value={gitaCourse.gitaDownloadTitle || ""}
                onChange={(e) => update({ gitaDownloadTitle: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Gold Section Badge Text</label>
              <input
                className={inputClass}
                placeholder="Free Divine Gift 📖"
                value={gitaCourse.gitaDownloadBadge || ""}
                onChange={(e) => update({ gitaDownloadBadge: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>File Download Display Title</label>
              <input
                className={inputClass}
                placeholder="Bhagavad Gita As It Is (Complete PDF)"
                value={gitaCourse.gitaDownloadFileTitle || ""}
                onChange={(e) => update({ gitaDownloadFileTitle: e.target.value })}
              />
            </div>
          </div>

          {/* Description & Cover Image */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Compelling Section Description</label>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Unlock divine wisdom with the authentic Bhagavad Gita As It Is..."
                value={gitaCourse.gitaDownloadDescription || ""}
                onChange={(e) => update({ gitaDownloadDescription: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Right Side Cover Graphic Image</label>
              <div className="flex items-center gap-4">
                <UploadBox
                  label="Download Cover Graphic"
                  url={gitaCourse.gitaDownloadImage || "/gita-gold-cover.jpg"}
                  onPick={pickDownloadImage}
                  aspect="aspect-square"
                  className="max-w-[120px]"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-slate-800">Right Design Graphic</p>
                  <p>Displays in 3D golden glow frame on the right side of the Download section.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD REQUEST LEADS ADMIN PANEL TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="font-display font-bold text-xl text-slate-900">
                Bhagavad Gita Download Leads &amp; Devotee Register
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Devotees who requested and downloaded the Bhagavad Gita PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Leads CSV
            </button>
            {totalDownloads > 0 && (
              <button
                type="button"
                onClick={handleClearAllLeads}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Total Downloads</div>
            <div className="text-2xl font-extrabold text-amber-950 font-display mt-1">{totalDownloads}</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Male Devotees</div>
            <div className="text-2xl font-extrabold text-blue-950 font-display mt-1">{maleCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-pink-800">Female Devotees</div>
            <div className="text-2xl font-extrabold text-pink-950 font-display mt-1">{femaleCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">WhatsApp Leads</div>
            <div className="text-2xl font-extrabold text-emerald-950 font-display mt-1">{totalDownloads}</div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, WhatsApp number, or email..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            {(["All", "Male", "Female", "Other"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  genderFilter === g
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Download Leads Found</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalDownloads === 0
                ? "When visitors request and download the Bhagavad Gita PDF, their contact info will appear here."
                : "No entries match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-600">
                  <th className="py-3 px-4">Devotee Name</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">WhatsApp Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeads.map((lead) => {
                  const whatsappClean = lead.whatsapp.replace(/\D/g, "");
                  const whatsappUrl = `https://wa.me/91${whatsappClean}?text=${encodeURIComponent(
                    `Hari Om ${lead.name}, greetings from ISKCON Kurnool! Thank you for downloading the Bhagavad Gita.`
                  )}`;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {lead.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            lead.gender === "Female"
                              ? "bg-pink-100 text-pink-800 border-pink-300"
                              : lead.gender === "Male"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-purple-100 text-purple-800 border-purple-300"
                          }`}
                        >
                          {lead.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100 transition"
                          title="Click to chat on WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> +91 {lead.whatsapp}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {lead.email || <span className="text-slate-400 italic">Not Provided</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(lead.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Delete lead entry for ${lead.name}?`)) {
                              await deleteGitaDownloadLead(lead.id);
                              toast.success("Lead removed");
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Status Selector Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Course Registration &amp; Enrollment Status
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control enrollment status. Selecting "Coming Soon" or "Closed" locks registration buttons with a lock icon 🔒 on the website.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            {(["Coming Soon", "Closed", "Registrations Opened"] as const).map((st) => {
              const currentStatus = gitaCourse.status || "Registrations Opened";
              const isActive = currentStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => update({ status: st })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isActive
                      ? st === "Coming Soon"
                        ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50"
                        : st === "Closed"
                        ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/50"
                        : "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/50"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {st === "Coming Soon" && "⏳ Coming Soon"}
                  {st === "Closed" && "🔒 Closed"}
                  {st === "Registrations Opened" && "✅ Registrations Opened"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Banners */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-6">
        <h3 className="font-display text-lg font-bold text-primary">Promotional Course Graphics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hero Portrait Banner (4:5)</p>
            <UploadBox label="Hero Banner" url={gitaCourse.heroImage} onPick={pickHeroImage} aspect="aspect-[4/5]" className="max-w-[150px]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How to Read Gita Graphic</p>
            <UploadBox label="About Graphic" url={gitaCourse.gitaAboutImage} onPick={pickAboutImage} aspect="aspect-square" className="max-w-[150px]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Why Gita Classes Graphic</p>
            <UploadBox label="Why Graphic" url={gitaCourse.gitaWhyImage} onPick={pickWhyImage} aspect="aspect-square" className="max-w-[150px]" />
          </div>
        </div>
      </div>

      {/* Hero Header & Badges */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" /> Hero Section Headlines
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Eyebrow Badge</label>
            <input className={inputClass} value={gitaCourse.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Main Title</label>
            <input className={inputClass} value={gitaCourse.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tagline / Description</label>
            <textarea className={inputClass} rows={2} value={gitaCourse.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Course Badges / Highlights</label>
            <button
              type="button"
              onClick={addBadge}
              className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add Badge
            </button>
          </div>
          <div className="space-y-2">
            {gitaCourse.badges.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputClass} value={b} onChange={(e) => setBadge(i, e.target.value)} placeholder="e.g. 18 Chapters Systematic Study" />
                <button
                  type="button"
                  onClick={() => removeBadge(i)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details & Registration */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Registration & Schedule Meta</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Online Registration Form Link</label>
            <input className={inputClass} placeholder="https://forms.gle/..." value={gitaCourse.registerUrl} onChange={(e) => update({ registerUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Date Range</label>
            <input className={inputClass} value={gitaCourse.dateRange} onChange={(e) => update({ dateRange: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Timing</label>
            <input className={inputClass} value={gitaCourse.time} onChange={(e) => update({ time: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Mode</label>
            <input className={inputClass} value={gitaCourse.mode} onChange={(e) => update({ mode: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Course Fee</label>
            <input className={inputClass} value={gitaCourse.fee} onChange={(e) => update({ fee: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Contact Number / WhatsApp</label>
            <input className={inputClass} value={gitaCourse.contact} onChange={(e) => update({ contact: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Start Label</label>
            <input className={inputClass} value={gitaCourse.startLabel} onChange={(e) => update({ startLabel: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Why Join Cards */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 border border-slate-200/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-display text-lg font-bold text-primary">Why Join Course Cards</h3>
          <button
            type="button"
            onClick={() => {
              const currentCards = gitaCourse.whyCards || [];
              update({
                whyCards: [...currentCards, { title: "New Module", desc: "Module description here.", iconName: "book-open" }]
              });
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:opacity-90 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Card
          </button>
        </div>
        
        {(!gitaCourse.whyCards || gitaCourse.whyCards.length === 0) ? (
          <p className="text-xs text-muted-foreground py-4">No custom cards added yet. Default curriculum cards are displayed on the site.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {gitaCourse.whyCards.map((card, i) => (
              <div key={i} className="p-4 border rounded-2xl bg-slate-50/60 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    const currentCards = gitaCourse.whyCards || [];
                    update({ whyCards: currentCards.filter((_, idx) => idx !== i) });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                  <input
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold"
                    value={card.title}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], title: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs"
                    rows={2}
                    value={card.desc}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], desc: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Icon</label>
                  <select
                    className="w-full px-3 py-2 bg-white border rounded-xl text-xs"
                    value={card.iconName}
                    onChange={(e) => {
                      const currentCards = [...(gitaCourse.whyCards || [])];
                      currentCards[i] = { ...currentCards[i], iconName: e.target.value };
                      update({ whyCards: currentCards });
                    }}
                  >
                    <option value="book-open">Book Open</option>
                    <option value="languages">Languages</option>
                    <option value="timer">Timer/Clock</option>
                    <option value="sparkles">Sparkles</option>
                    <option value="award">Award</option>
                    <option value="star">Star</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
