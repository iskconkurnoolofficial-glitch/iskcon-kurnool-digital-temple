import { useState } from "react";
import { useAdmin, uploadToCloudinary, HeroBannersData } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import { Images, X, Image as ImageIcon } from "lucide-react";

export default function HeroBannersManager() {
  const { heroBanners, setHeroBanners } = useAdmin();
  const [busy, setBusy] = useState<string | null>(null);

  const update = (key: keyof HeroBannersData, url: string) => {
    setHeroBanners({ ...heroBanners, [key]: url });
  };

  const pickImage = async (key: keyof HeroBannersData, file: File) => {
    setBusy(key);
    try {
      const url = await uploadToCloudinary(file, "ISKCON-KURNOOL/HeroBanners");
      update(key, url);
    } catch {
      alert("Upload failed");
    }
    setBusy(null);
  };

  const pages: { key: keyof HeroBannersData; label: string }[] = [
    { key: "temple", label: "Temple Home Page" },
    { key: "aboutKurnool", label: "About — ISKCON Kurnool" },
    { key: "aboutFounder", label: "About — Srila Prabhupada" },
    { key: "aboutIskcon", label: "About — About ISKCON" },
    { key: "aboutMission", label: "About — Our Mission" },
    { key: "connect", label: "Connect Page" },
    { key: "socialMedia", label: "Social Media Page" },
    { key: "courses", label: "Courses Page" },
    { key: "festivals", label: "Festivals Page" },
    { key: "gallery", label: "Gallery Page" },
    { key: "darshan", label: "Daily Darshan Page" },
    { key: "goshala", label: "Goshala Page" },
    { key: "prahladaBadi", label: "Prahlada Badi" },
    { key: "sunday", label: "Sunday Program Page" },
    { key: "harinama", label: "Harinama Page" },
    { key: "youth", label: "Youth Festival Page" },
    { key: "donate", label: "Donate Page" },
    { key: "ekadashi", label: "Ekadashi Page" },
    { key: "shop", label: "Shop Page" },
  ];

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* SECTION HEADER BANNER */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <Images className="h-3.5 w-3.5" />
              <span>Page Top Header Visuals</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Hero Banners Manager</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Upload and manage custom top hero header graphics for individual site pages (Recommended size: 1350×1080px).
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Page Banners</span>
            <span className="text-xl font-extrabold text-white">{pages.length}</span>
          </div>
        </div>
      </div>

      {/* BANNERS GRID */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary">Configured Page Header Banners</h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pages.map((p) => (
            <div key={p.key} className="space-y-3 border border-slate-200/80 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition duration-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2 truncate">{p.label}</span>
                <UploadBox 
                  label="" 
                  url={heroBanners[p.key]} 
                  onPick={(f) => pickImage(p.key, f)} 
                  aspect="aspect-[5/4]"
                />
                {busy === p.key && <p className="text-xs text-primary font-semibold animate-pulse mt-1.5">Uploading Image...</p>}
              </div>
              {heroBanners[p.key] && (
                <button
                  onClick={() => update(p.key, "")}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-semibold transition flex items-center gap-1 self-start cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Remove Image
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
