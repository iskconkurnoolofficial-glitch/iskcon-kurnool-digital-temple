import { useState } from "react";
import { useAdmin, PrivacyData, PrivacySection, defaultPrivacy } from "@/context/AdminContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Search,
  Sparkles,
  Info,
  Calendar
} from "lucide-react";

export default function PrivacyManager() {
  const { privacy, setPrivacy } = useAdmin();
  const [data, setData] = useState<PrivacyData>(() => privacy || defaultPrivacy);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setPrivacy(data);
      toast.success("Privacy Policy successfully saved to database!");
    } catch (err: any) {
      toast.error(`Save failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all Privacy Policy sections to the official default template? Any unsaved edits will be lost.")) {
      setData(defaultPrivacy);
      setPrivacy(defaultPrivacy);
      toast.success("Privacy Policy reset to official template!");
    }
  };

  const handleAddSection = () => {
    const nextNum = (data.sections.length + 1).toString();
    const newSec: PrivacySection = {
      id: `psec_${Date.now()}`,
      number: nextNum,
      title: "New Privacy Section",
      content: "Enter your privacy terms and details here.",
    };
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setActiveSectionId(newSec.id);
    toast.success(`Section ${nextNum} added!`);
  };

  const handleUpdateSection = (id: string, field: keyof PrivacySection, value: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec)),
    }));
  };

  const handleDeleteSection = (id: string, title: string) => {
    if (window.confirm(`Delete section "${title}"?`)) {
      setData((prev) => ({
        ...prev,
        sections: prev.sections.filter((sec) => sec.id !== id),
      }));
      toast.info("Section removed");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newSections = [...data.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setData((prev) => ({ ...prev, sections: newSections }));
  };

  const filteredSections = data.sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.number.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-[#5b2c9b]" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Privacy Policy Manager
          </h1>
          <p className="text-sm text-slate-500">
            Manage and customize the official public Privacy Policy with live instant database sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Public Page</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition cursor-pointer"
            title="Reset to default official privacy policy template"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Template</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5b2c9b] hover:bg-[#4a2380] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Global Meta Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="h-4 w-4 text-[#5b2c9b]" />
          <span>Policy Header &amp; Versioning</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Last Updated Date</span>
            </label>
            <input
              type="text"
              value={data.lastUpdated}
              onChange={(e) => setData({ ...data, lastUpdated: e.target.value })}
              placeholder="e.g. 24 August 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5b2c9b] text-sm font-semibold text-slate-900 transition outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Policy Heading Title
            </label>
            <input
              type="text"
              value={data.introTitle}
              onChange={(e) => setData({ ...data, introTitle: e.target.value })}
              placeholder="Privacy Policy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5b2c9b] text-sm font-semibold text-slate-900 transition outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Introduction Opening Statement
          </label>
          <textarea
            rows={4}
            value={data.introText}
            onChange={(e) => setData({ ...data, introText: e.target.value })}
            placeholder="ISKCON Kurnool respects your privacy..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5b2c9b] text-sm text-slate-800 transition outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Sections Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by section number or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:border-[#5b2c9b] text-xs sm:text-sm font-medium text-slate-900 transition outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            {data.sections.length} total sections ({filteredSections.length} shown)
          </span>

          <button
            type="button"
            onClick={handleAddSection}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Sections Accordion List */}
      <div className="space-y-4">
        {filteredSections.map((sec, idx) => {
          const isExpanded = activeSectionId === sec.id || searchQuery.length > 0;
          return (
            <div
              key={sec.id}
              className={`rounded-2xl border transition-all duration-200 bg-white ${
                isExpanded ? "border-[#5b2c9b]/50 shadow-md ring-1 ring-[#5b2c9b]/20" : "border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              {/* Section Header Accordion Bar */}
              <div className="p-4 flex items-center justify-between gap-3 select-none">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setActiveSectionId(isExpanded && searchQuery.length === 0 ? null : sec.id)}
                >
                  <span className="h-8 w-8 rounded-xl bg-purple-100 text-[#5b2c9b] font-black text-xs flex items-center justify-center shrink-0">
                    {sec.number}
                  </span>
                  <div className="font-bold text-slate-900 text-sm sm:text-base flex-1">
                    {sec.title || "Untitled Section"}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === data.sections.length - 1}
                    title="Move Down"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id, sec.title)}
                    title="Delete Section"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Section Expanded Editor */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Section Number / Prefix
                      </label>
                      <input
                        type="text"
                        value={sec.number}
                        onChange={(e) => handleUpdateSection(sec.id, "number", e.target.value)}
                        placeholder="1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-9 space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleUpdateSection(sec.id, "title", e.target.value)}
                        placeholder="e.g. Information We Collect"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Content Body (Supports bullet points • and bold **text**)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {sec.content.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={sec.content}
                      onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                      placeholder="Write privacy terms, policies, and details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5b2c9b] text-xs sm:text-sm text-slate-800 outline-none leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Quick Save Bar */}
      <div className="sticky bottom-6 flex items-center justify-between p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-white/10 z-30">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Keep your privacy policy clear and compliant.</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg transition cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
