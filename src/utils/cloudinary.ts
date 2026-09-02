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
 * Generates an optimized Cloudinary image URL with specified transformations.
 * - 'gallery': w_600,q_auto,f_auto
 * - 'lightbox': w_1200,q_auto,f_auto
 * - 'thumbnail': w_300,q_auto,f_auto
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  target: "gallery" | "lightbox" | "thumbnail" | string
): string {
  if (!url || typeof url !== "string") return "";

  // Return original URL as-is if it's not hosted on Cloudinary
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  let transformStr = "w_600,q_auto,f_auto";
  if (target === "lightbox") {
    transformStr = "w_1200,q_auto,f_auto";
  } else if (target === "thumbnail") {
    transformStr = "w_300,q_auto,f_auto";
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
