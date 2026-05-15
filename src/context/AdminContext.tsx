import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Slide = {
  id: string;
  desktop: string;
  mobile: string;
  title?: string;
  subtitle?: string;
  active: boolean;
};

export type GalleryPhoto = {
  id: string;
  url: string;
  title: string;
  category: string;
};

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  youtube: string;
  mapEmbed: string;
  address: string;
  footer: string;
  logo: string;
};

export type ThemeSettings = {
  primary: string;
  secondary: string;
  accent: string;
};

type AdminState = {
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  photos: GalleryPhoto[];
  setPhotos: (p: GalleryPhoto[]) => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  theme: ThemeSettings;
  setTheme: (t: ThemeSettings) => void;
  authed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
};

const ADMIN_PASSWORD = "iskcon2025";

const defaultSettings: SiteSettings = {
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "info@iskconkurnool.org",
  instagram: "https://instagram.com/iskconkurnool",
  youtube: "https://youtube.com/@iskconkurnool",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3849.123!2d78.0373!3d15.8281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDQ5JzQxLjIiTiA3OMKwMDInMTQuMyJF!5e0!3m2!1sen!2sin!4v1700000000000",
  address: "ISKCON Kurnool\nSri Sri Jagannath Baladev Subhadra Temple\nKurnool, Andhra Pradesh\nIndia",
  footer: "© 2025 ISKCON Kurnool. All Rights Reserved.",
  logo: "",
};

const defaultTheme: ThemeSettings = {
  primary: "#5b2c9b",
  secondary: "#f5c518",
  accent: "#e8670c",
};

const defaultCategories = ["Temple", "Festival", "Programs", "Deity"];

const defaultSlides: Slide[] = [
  {
    id: "s1",
    desktop: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=2400&q=80",
    mobile: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1080&q=80",
    title: "Hare Krishna",
    subtitle: "Welcome to the abode of Sri Sri Jagannath Baladev Subhadra",
    active: true,
  },
  {
    id: "s2",
    desktop: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=2400&q=80",
    mobile: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1080&q=80",
    title: "Divine Grace",
    subtitle: "Experience the spiritual heritage of Bhakti",
    active: true,
  },
];

function useLocal<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useLocal<Slide[]>("iskcon_slides", defaultSlides);
  const [photos, setPhotos] = useLocal<GalleryPhoto[]>("iskcon_photos", []);
  const [categories, setCategories] = useLocal<string[]>("iskcon_categories", defaultCategories);
  const [settings, setSettings] = useLocal<SiteSettings>("iskcon_settings", defaultSettings);
  const [theme, setTheme] = useLocal<ThemeSettings>("iskcon_theme", defaultTheme);
  const [authed, setAuthed] = useLocal<boolean>("iskcon_authed", false);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--primary-hex", theme.primary);
    r.style.setProperty("--secondary-hex", theme.secondary);
    r.style.setProperty("--accent-hex", theme.accent);
  }, [theme]);

  const login = (pw: string) => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); return true; }
    return false;
  };
  const logout = () => setAuthed(false);

  return (
    <Ctx.Provider value={{ slides, setSlides, photos, setPhotos, categories, setCategories, settings, setSettings, theme, setTheme, authed, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be inside AdminProvider");
  return c;
}

// Cloudinary upload helper
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsshk5xy";
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ISKCON_KURNOOL_CLOUDINARY";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url as string;
}
