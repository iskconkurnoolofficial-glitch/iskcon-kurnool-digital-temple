import { useState } from "react";
import { useAdmin, uploadToCloudinary, HeroBannersData } from "@/context/AdminContext";
import { UploadBox } from "./CarouselManager";
import { X } from "lucide-react";

export default function HeroBannersManager() {
  const { heroBanners, setHeroBanners } = useAdmin();
  const [busy, setBusy] = useState<string | null>(null);

  const update = (key: keyof HeroBannersData, url: string) => {
    setHeroBanners({ ...heroBanners, [key]: url });
  };

  const pickImage = async (key: keyof HeroBannersData, file: File) => {
    setBusy(key);
    try {
      const url = await uploadToCloudinary(file);
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
    <div className="bg-white rounded-2xl shadow p-6 border space-y-6">
      <div className="border-b pb-4">
        <h3 className="font-display text-xl font-bold text-primary">Hero Section Banner Images</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload custom hero banner images for each page/section. Recommended size: 1350px * 1080px.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pages.map((p) => (
          <div key={p.key} className="space-y-3 border border-border p-4 rounded-xl bg-surface/5 flex flex-col justify-between hover:shadow-sm transition">
            <div>
              <span className="text-sm font-semibold text-foreground/80 block mb-2">{p.label}</span>
              <UploadBox 
                label="Upload Hero Image" 
                url={heroBanners[p.key]} 
                onPick={(f) => pickImage(p.key, f)} 
              />
              {busy === p.key && <p className="text-xs text-muted-foreground animate-pulse mt-1.5">Uploading...</p>}
            </div>
            {heroBanners[p.key] && (
              <button
                onClick={() => update(p.key, "")}
                className="text-xs text-destructive hover:underline flex items-center gap-1 mt-2 self-start"
              >
                <X className="h-3.5 w-3.5" /> Remove Image
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
