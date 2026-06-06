import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export type SevaPrice = {
  label: string;
  amount: number;
};

export type Seva = {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  prices: SevaPrice[];
  order: number;
  active: boolean;
};

export type Festival = {
  id: string;
  title: string;
  slug: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Card thumbnail 1280x720 */
  thumbnail: string;
  /** Desktop banner 4917x1750 */
  desktopBanner: string;
  /** Mobile banner 1080x1080 */
  mobileBanner: string;
  /** Rich text HTML */
  description: string;
  shortDescription: string;
  sevas: Seva[];
  status: "draft" | "published";
  hidden: boolean;
  /** ISO datetime — auto publish */
  publishAt?: string;
  /** ISO datetime — auto unpublish */
  unpublishAt?: string;
  order: number;
  // legacy
  donateUrl?: string;
  active?: boolean;
};

/** Generate a URL-safe slug from a title */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalize a festival (handles legacy records) */
export function normalizeFestival(f: any): Festival {
  return {
    id: f.id,
    title: f.title ?? "",
    slug: f.slug || slugify(f.title ?? "") || f.id,
    date: f.date ?? "",
    thumbnail: f.thumbnail ?? "",
    desktopBanner: f.desktopBanner ?? f.thumbnail ?? "",
    mobileBanner: f.mobileBanner ?? f.thumbnail ?? "",
    description: f.description ?? "",
    shortDescription: f.shortDescription ?? "",
    sevas: Array.isArray(f.sevas) ? f.sevas : [],
    status: f.status ?? (f.active === false ? "draft" : "published"),
    hidden: f.hidden ?? false,
    publishAt: f.publishAt || undefined,
    unpublishAt: f.unpublishAt || undefined,
    order: typeof f.order === "number" ? f.order : 0,
    donateUrl: f.donateUrl,
    active: f.active,
  };
}

/** Whether a festival is publicly live, accounting for status, hidden flag and schedule */
export function isFestivalLive(f: Festival, now: number = Date.now()): boolean {
  if (f.hidden) return false;
  if (f.publishAt && new Date(f.publishAt).getTime() > now) return false;
  if (f.unpublishAt && new Date(f.unpublishAt).getTime() <= now) return false;
  return f.status === "published";
}

export type YouthFeature = { title: string; image: string };
export type YouthGalleryItem = { id: string; url: string; label: string };
export type YouthReview = { id: string; name: string; text: string; rating: number; visible: boolean };
export type YouthData = {
  logo: string;
  whatsappUrl: string;
  instagramHandle: string;
  features: YouthFeature[];
  venue: string;
  schedule: string;
  gallery: YouthGalleryItem[];
  reviews: YouthReview[];
};

export const defaultYouth: YouthData = {
  logo: "",
  whatsappUrl: "https://chat.whatsapp.com/",
  instagramHandle: "Gaura_Bhaktas_Official",
  features: [
    { title: "Bhagavad Gita", image: "" },
    { title: "Music & Dance", image: "" },
    { title: "Kirtan Beats", image: "" },
    { title: "Delicious Prasadam", image: "" },
  ],
  venue: "ISKCON Kurnool\nSri Sri Jagannath Baladev Subhadra Temple\nKurnool, Andhra Pradesh",
  schedule: "Every Saturday · 6:30 PM – 8:30 PM",
  gallery: [],
  reviews: [
    { id: "r1", name: "Arjun", text: "The kirtans and prasadam are amazing. I look forward to every Saturday!", rating: 5, visible: true },
    { id: "r2", name: "Rohit", text: "Learned so much from the Bhagavad Gita sessions. Truly life-changing.", rating: 5, visible: true },
    { id: "r3", name: "Karthik", text: "Great association of devotees. Music and dance fill you with joy.", rating: 5, visible: true },
  ],
};

export type DailyClass = {
  id: string;
  thumbnail: string;
  title: string;
  /** ISO datetime — class start (interpreted as IST when entered) */
  startAt: string;
  /** Duration minutes */
  durationMin: number;
  language: string;
  joinUrl: string;
  active: boolean;
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
  classes: DailyClass[];
  setClasses: (c: DailyClass[]) => void;
  festivals: Festival[];
  setFestivals: (f: Festival[]) => void;
  sevas: Seva[];
  setSevas: (s: Seva[]) => void;
  youth: YouthData;
  setYouth: (y: YouthData) => void;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  theme: ThemeSettings;
  setTheme: (t: ThemeSettings) => void;
  authed: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  ready: boolean;
};




const defaultSettings: SiteSettings = {
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "info@iskconkurnool.org",
  instagram: "https://instagram.com/iskconkurnool",
  youtube: "https://youtube.com/@iskconkurnool",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3849.123!2d78.0373!3d15.8281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDQ5JzQxLjIiTiA3OMKwMDInMTQuMyJF!5e0!3m2!1sen!2sin!4v1700000000000",
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

// Keys used in the site_data table
const KEYS = {
  slides: "slides",
  photos: "photos",
  categories: "categories",
  classes: "classes",
  festivals: "festivals",
  sevas: "sevas",
  youth: "youth",
  settings: "settings",
  theme: "theme",
} as const;

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [slides, setSlidesState] = useState<Slide[]>(defaultSlides);
  const [photos, setPhotosState] = useState<GalleryPhoto[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(defaultCategories);
  const [classes, setClassesState] = useState<DailyClass[]>([]);
  const [festivals, setFestivalsState] = useState<Festival[]>([]);
  const [sevas, setSevasState] = useState<Seva[]>([]);
  const [youth, setYouthState] = useState<YouthData>(defaultYouth);
  const [settings, setSettingsState] = useState<SiteSettings>(defaultSettings);
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [authed, setAuthed] = useState<boolean>(false);

  // Track Supabase auth session for admin access
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const [ready, setReady] = useState(false);

  // Tracks keys we just wrote locally so realtime echo doesn't overwrite optimistic state.
  const pendingWrites = useRef<Map<string, number>>(new Map());

  // Initial load + realtime subscribe
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.from("site_data").select("key,value");
      if (!mounted) return;
      if (!error && data) {
        for (const row of data) applyRow(row.key, row.value);
      }
      setReady(true);
    })();

    const channel = supabase
      .channel("site_data_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_data" },
        (payload) => {
          const row: any = payload.new ?? payload.old;
          if (!row?.key) return;
          // Skip echo from our own recent write
          const pendingAt = pendingWrites.current.get(row.key);
          if (pendingAt && Date.now() - pendingAt < 1500) return;
          applyRow(row.key, (payload.new as any)?.value);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyRow(key: string, value: any) {
    if (value == null) return;
    switch (key) {
      case KEYS.slides: setSlidesState(value); break;
      case KEYS.photos: setPhotosState(value); break;
      case KEYS.categories: setCategoriesState(value); break;
      case KEYS.classes: setClassesState(value); break;
      case KEYS.festivals: setFestivalsState(value); break;
      case KEYS.sevas: setSevasState(value); break;
      case KEYS.youth: setYouthState({ ...defaultYouth, ...value }); break;
      case KEYS.settings: setSettingsState(value); break;
      case KEYS.theme: setThemeState(value); break;
    }
  }

  async function persist(key: string, value: any) {
    pendingWrites.current.set(key, Date.now());
    const { error } = await supabase
      .from("site_data")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) console.error("[site_data] upsert failed", key, error);
  }

  const setSlides = (v: Slide[]) => { setSlidesState(v); persist(KEYS.slides, v); };
  const setPhotos = (v: GalleryPhoto[]) => { setPhotosState(v); persist(KEYS.photos, v); };
  const setCategories = (v: string[]) => { setCategoriesState(v); persist(KEYS.categories, v); };
  const setClasses = (v: DailyClass[]) => { setClassesState(v); persist(KEYS.classes, v); };
  const setFestivals = (v: Festival[]) => { setFestivalsState(v); persist(KEYS.festivals, v); };
  const setSevas = (v: Seva[]) => { setSevasState(v); persist(KEYS.sevas, v); };
  const setYouth = (v: YouthData) => { setYouthState(v); persist(KEYS.youth, v); };
  const setSettings = (v: SiteSettings) => { setSettingsState(v); persist(KEYS.settings, v); };
  const setTheme = (v: ThemeSettings) => { setThemeState(v); persist(KEYS.theme, v); };

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;
    const r = document.documentElement;
    r.style.setProperty("--primary-hex", theme.primary);
    r.style.setProperty("--secondary-hex", theme.secondary);
    r.style.setProperty("--accent-hex", theme.accent);
  }, [theme]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    setAuthed(true);
    return { ok: true };
  };
  const logout = () => {
    supabase.auth.signOut();
    setAuthed(false);
  };

  return (
    <Ctx.Provider
      value={{
        slides, setSlides,
        photos, setPhotos,
        categories, setCategories,
        classes, setClasses,
        festivals, setFestivals,
        sevas, setSevas,
        youth, setYouth,
        settings, setSettings,
        theme, setTheme,
        authed, login, logout, ready,
      }}
    >
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
