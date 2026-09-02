// Centralized Cloudinary Helper Utilities & Category-to-Folder Mapping

export const GALLERY_CATEGORY_FOLDER_MAP: Record<string, string> = {
  Temple: "ISKCON-KURNOOL/Gallery/Temple",
  Festivals: "ISKCON-KURNOOL/Gallery/Festivals",
  Events: "ISKCON-KURNOOL/Gallery/Events",
  Programs: "ISKCON-KURNOOL/Gallery/Programs",
  Janmashtami: "ISKCON-KURNOOL/Gallery/Janmashtami",
};

export const SITE_MODULE_FOLDER_MAP: Record<string, string> = {
  // Gallery Sub-categories
  Gallery: "ISKCON-KURNOOL/Gallery",
  Temple: "ISKCON-KURNOOL/Gallery/Temple",
  FestivalsGallery: "ISKCON-KURNOOL/Gallery/Festivals",
  Events: "ISKCON-KURNOOL/Gallery/Events",
  Programs: "ISKCON-KURNOOL/Gallery/Programs",
  Janmashtami: "ISKCON-KURNOOL/Gallery/Janmashtami",

  // Site Modules & Admin Managers
  Carousel: "ISKCON-KURNOOL/Carousel",
  Sliders: "ISKCON-KURNOOL/Carousel",
  DailyDarshan: "ISKCON-KURNOOL/DailyDarshan",
  Festivals: "ISKCON-KURNOOL/Festivals",
  Sevas: "ISKCON-KURNOOL/Sevas",
  Youth: "ISKCON-KURNOOL/Youth",
  YouthYatra: "ISKCON-KURNOOL/YouthYatra",
  PrahladaBadi: "ISKCON-KURNOOL/PrahladaBadi",
  HouseProgrammes: "ISKCON-KURNOOL/HouseProgrammes",
  Harinama: "ISKCON-KURNOOL/Harinama",
  Goshala: "ISKCON-KURNOOL/Goshala",
  GitaCourse: "ISKCON-KURNOOL/GitaCourse",
  Ekadashi: "ISKCON-KURNOOL/Ekadashi",
  SundayFeast: "ISKCON-KURNOOL/SundayFeast",
  DailyClasses: "ISKCON-KURNOOL/DailyClasses",
  LiveProgrammes: "ISKCON-KURNOOL/LiveProgrammes",
  HeroBanners: "ISKCON-KURNOOL/HeroBanners",
  Settings: "ISKCON-KURNOOL/Settings",
  Receipts: "ISKCON-KURNOOL/Receipts",
  Upi: "ISKCON-KURNOOL/Upi",
  PaymentScreenshots: "ISKCON-KURNOOL/PaymentScreenshots",
  FeaturePopups: "ISKCON-KURNOOL/FeaturePopups",
  BhaktiSteps: "ISKCON-KURNOOL/BhaktiSteps",
  Instagram: "ISKCON-KURNOOL/Instagram",
  Leads: "ISKCON-KURNOOL/Leads",
  MediaLibrary: "ISKCON-KURNOOL/MediaLibrary",
};

/**
 * Returns the exact Cloudinary folder path for a given category name.
 * Centralized mapping per project specifications.
 */
export function getGalleryCloudinaryFolder(category: string): string {
  if (!category) return "ISKCON-KURNOOL/Gallery/Temple";
  
  const trimmed = category.trim();
  if (GALLERY_CATEGORY_FOLDER_MAP[trimmed]) {
    return GALLERY_CATEGORY_FOLDER_MAP[trimmed];
  }

  // Fallback for custom categories while keeping folder structure clean
  const cleanCat = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
  return `ISKCON-KURNOOL/Gallery/${cleanCat || "Temple"}`;
}

/**
 * Returns the exact Cloudinary folder path for any module or feature on the website.
 */
export function getModuleCloudinaryFolder(moduleName: string): string {
  if (!moduleName) return "ISKCON-KURNOOL/MediaLibrary";
  const trimmed = moduleName.trim();
  if (SITE_MODULE_FOLDER_MAP[trimmed]) {
    return SITE_MODULE_FOLDER_MAP[trimmed];
  }
  const cleanMod = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
  return `ISKCON-KURNOOL/${cleanMod || "MediaLibrary"}`;
}

export interface CloudinaryUploadResponse {
  url: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
}

/**
 * Uploads a file to Cloudinary with full detailed return attributes
 * including public_id, width, height, format, created_at, and optional target folder.
 */
export async function uploadToCloudinaryDetailed(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResponse> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsshk5xy";
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ISKCON_KURNOOL_CLOUDINARY";
  
  // Enforce automatic ISKCON-KURNOOL folder hierarchy for all present & future uploads
  const targetFolder = folder
    ? (folder.startsWith("ISKCON-KURNOOL/") ? folder : getModuleCloudinaryFolder(folder))
    : "ISKCON-KURNOOL/MediaLibrary";

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("folder", targetFolder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  const secureUrl = (data.secure_url || data.url) as string;

  if (secureUrl) {
    try {
      const raw = localStorage.getItem("iskcon_uploaded_images_history");
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(secureUrl)) {
        list.unshift(secureUrl);
        localStorage.setItem("iskcon_uploaded_images_history", JSON.stringify(list.slice(0, 300)));
      }
    } catch {}
  }

  return {
    url: secureUrl,
    secure_url: secureUrl,
    public_id: data.public_id || "",
    width: data.width,
    height: data.height,
    format: data.format,
    created_at: data.created_at || new Date().toISOString(),
  };
}

/**
 * Standard upload helper for backwards compatibility across all admin components.
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const res = await uploadToCloudinaryDetailed(file, folder);
  return res.secure_url;
}

/**
 * Extract Cloudinary public_id from a full Cloudinary URL.
 */
export function extractCloudinaryPublicId(url: string): string | undefined {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com") || !url.includes("/image/upload/")) {
    return undefined;
  }
  try {
    const afterUpload = url.split("/image/upload/")[1];
    let parts = afterUpload.split("/");
    
    // Skip transformation segment if present (starts with w_, h_, c_, q_, f_, etc.)
    if (
      parts[0] &&
      (parts[0].startsWith("w_") ||
        parts[0].startsWith("h_") ||
        parts[0].startsWith("c_") ||
        parts[0].startsWith("q_") ||
        parts[0].startsWith("f_"))
    ) {
      parts = parts.slice(1);
    }
    
    // Skip version segment if present (e.g. v1725255555)
    if (parts[0] && /^v\d+$/.test(parts[0])) {
      parts = parts.slice(1);
    }
    
    const fullPath = parts.join("/");
    // Strip extension (.jpg, .png, .webp, etc.)
    const lastDotIndex = fullPath.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return fullPath.substring(0, lastDotIndex);
    }
    return fullPath;
  } catch {
    return undefined;
  }
}

/**
 * Generates an optimized image URL for maximum loading speed and minimum payload.
 * Supports Cloudinary, Unsplash, and YouTube thumbnails.
 * - 'thumbnail': w_300 / w=300, q_auto/q=75, f_auto/auto=format
 * - 'gallery' / 'card': w_600 / w=600, q_auto/q=80, f_auto/auto=format
 * - 'banner' / 'hero': w_1200 / w=1200, q_auto/q=80, f_auto/auto=format
 * - 'lightbox' / 'full': w_1600 / w=1600, q_auto/q=85, f_auto/auto=format
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  target: "gallery" | "lightbox" | "thumbnail" | "card" | "banner" | "hero" | "full" | string
): string {
  if (!url || typeof url !== "string") return "";

  // 1. Unsplash Optimization
  if (url.includes("images.unsplash.com")) {
    try {
      const u = new URL(url);
      let targetWidth = 600;
      let targetQuality = 80;

      if (target === "thumbnail") {
        targetWidth = 300;
        targetQuality = 75;
      } else if (target === "card" || target === "gallery") {
        targetWidth = 600;
        targetQuality = 80;
      } else if (target === "banner" || target === "hero") {
        targetWidth = 1200;
        targetQuality = 80;
      } else if (target === "lightbox" || target === "full") {
        targetWidth = 1600;
        targetQuality = 85;
      } else if (typeof target === "number" || (!isNaN(Number(target)) && Number(target) > 0)) {
        targetWidth = Number(target);
      }

      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", String(targetWidth));
      u.searchParams.set("q", String(targetQuality));
      return u.toString();
    } catch {
      return url;
    }
  }

  // 2. YouTube Thumbnail Optimization
  if (url.includes("img.youtube.com") || url.includes("i.ytimg.com")) {
    if (target === "thumbnail") {
      return url.replace(/\/maxresdefault\.jpg|\/sddefault\.jpg|\/hqdefault\.jpg/, "/mqdefault.jpg");
    }
    if (target === "card" || target === "gallery") {
      return url.replace(/\/maxresdefault\.jpg|\/sddefault\.jpg/, "/hqdefault.jpg");
    }
  }

  // 3. Cloudinary Optimization
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  let transformStr = "w_600,q_auto,f_auto";
  if (target === "thumbnail") {
    transformStr = "w_300,q_auto,f_auto";
  } else if (target === "lightbox" || target === "full") {
    transformStr = "w_1600,q_auto,f_auto";
  } else if (target === "banner" || target === "hero") {
    transformStr = "w_1200,q_auto,f_auto";
  } else if (target === "gallery" || target === "card") {
    transformStr = "w_600,q_auto,f_auto";
  } else if (typeof target === "string" && target !== "gallery") {
    transformStr = target;
  }

  if (url.includes("/image/upload/")) {
    const parts = url.split("/image/upload/");
    const prefix = parts[0] + "/image/upload/";
    let rest = parts[1];

    // Remove any existing transformation segment if present
    const firstSegment = rest.split("/")[0];
    if (
      firstSegment.startsWith("w_") ||
      firstSegment.startsWith("h_") ||
      firstSegment.startsWith("c_") ||
      firstSegment.startsWith("q_") ||
      firstSegment.startsWith("f_")
    ) {
      rest = rest.substring(firstSegment.length + 1);
    }

    return `${prefix}${transformStr}/${rest}`;
  }

  return url;
}

export const getOptimizedImageUrl = getOptimizedCloudinaryUrl;


/**
 * Validate selected image file format (PNG, JPG, WEBP) and size limits.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: "No file selected." };

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Unsupported file type. Only PNG, JPG/JPEG, and WEBP images are allowed.",
    };
  }

  // Cloudinary free tier upload limit: 10 MB
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: "File size exceeds the maximum allowed limit of 10MB.",
    };
  }

  return { valid: true };
}
