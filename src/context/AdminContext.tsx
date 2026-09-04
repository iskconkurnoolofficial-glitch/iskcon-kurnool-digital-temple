import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { finalizeDonationStatus } from "@/lib/donation-status.functions";
import { toast } from "sonner";

export type Slide = {
  id: string;
  desktop: string;
  mobile: string;
  title?: string;
  subtitle?: string;
  active: boolean;
  /** Optional video URL — when set, the slide plays a looping muted video instead of the image */
  video?: string;
};

export type GalleryPhoto = {
  id: string;
  url: string;
  title: string;
  category: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
};

export type DriveAlbum = {
  id: string;
  title: string;
  year: string;
  driveUrl: string;
  coverUrl?: string;
  active: boolean;
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
  category?: string;
  categories?: string[];
  prices: SevaPrice[];
  order: number;
  active: boolean;
  slug?: string;
  festivalId?: string;
  festivalIds?: string[];
};

export function getSevaFestivalIds(s?: Partial<Seva> | null): string[] {
  if (!s) return [];
  if (Array.isArray(s.festivalIds) && s.festivalIds.length > 0) {
    return s.festivalIds.filter(Boolean);
  }
  if (s.festivalId && s.festivalId.trim()) {
    return [s.festivalId.trim()];
  }
  return [];
}

export function getSevaCategories(s?: Partial<Seva> | null): string[] {
  if (!s) return ["Regular Sevas"];
  if (Array.isArray(s.categories) && s.categories.length > 0) {
    return s.categories.filter(Boolean);
  }
  if (s.category && s.category.trim()) {
    return s.category.split(",").map((c) => c.trim()).filter(Boolean);
  }
  return ["Regular Sevas"];
}

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "member";
  allowedTabs: string[];
  createdAt: string;
};

export type CurrentAdminUser = {
  role: "superadmin" | "member" | "admin";
  name: string;
  email: string;
  allowedTabs?: string[];
  member?: TeamMember;
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
  schedule?: string;
  location?: string;
  locationAddress?: string;
  locationLink?: string;
  program?: { time: string; title: string; description?: string }[];
  carouselImages?: string[];
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
    schedule: f.schedule ?? "",
    location: f.location ?? "",
    locationAddress: f.locationAddress ?? "",
    locationLink: f.locationLink ?? "",
    program: Array.isArray(f.program) ? f.program : [],
    carouselImages: Array.isArray(f.carouselImages) ? f.carouselImages : [],
  };
}

/** Whether a festival is publicly live, accounting for status, hidden flag and schedule */
export function isFestivalLive(f: Festival, now: number = Date.now()): boolean {
  if (f.hidden) return false;
  if (f.publishAt && new Date(f.publishAt).getTime() > now) return false;
  if (f.unpublishAt && new Date(f.unpublishAt).getTime() <= now) return false;
  return f.status === "published";
}

export type YouthFeature = { title: string; image: string; desc: string };
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
  whatsappUrl: "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3",
  instagramHandle: "Gaura_Bhaktas_Official",
  features: [
    { title: "Soulful Kirtan", desc: "Experience uplifting Hare Krishna mantra meditation through joyful music and collective chanting.", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=500&q=80" },
    { title: "Discourse of Bhagavad Gita", desc: "Explore practical teachings from the Bhagavad Gita and learn how they apply to studies, career, relationships, and habits.", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80" },
    { title: "Interactive Youth Sessions", desc: "Ask questions, exchange ideas, participate in discussions, and discover practical solutions for real-life challenges.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80" },
    { title: "Mind Management", desc: "Learn timeless principles to improve focus, manage stress, overcome distractions, build discipline, and develop positive habits.", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80" },
    { title: "Positive Youth Community", desc: "Meet like-minded students and young people from Kurnool, build meaningful friendships, and grow in a supportive environment.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80" },
    { title: "Krishna Prasadam", desc: "Conclude the program by honoring delicious, sanctified, healthy vegetarian food (prasadam) together.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80" },
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

export type PrahladaBadiActivity = {
  id: string;
  titleEn: string;
  titleTel: string;
  icon: string;
  order: number;
  descriptionEn?: string;
  descriptionTel?: string;
};

export type PrahladaBadiGalleryItem = {
  id: string;
  url: string;
  label: string;
};

export type PrahladaBadiReview = {
  id: string;
  name: string;
  text: string;
  rating: number;
  visible: boolean;
};

export type PrahladaBadiData = {
  regStatus: "Open" | "Closed" | "Coming Soon";
  registerUrl: string;
  startDate: string;
  endDate: string;
  timings: string;
  venueEn: string;
  venueTel: string;
  feeTier1LabelEn: string;
  feeTier1LabelTel: string;
  feeTier1Amount: string;
  feeTier2LabelEn: string;
  feeTier2LabelTel: string;
  feeTier2Amount: string;
  contactName: string;
  contactTitleEn: string;
  contactTitleTel: string;
  phone1: string;
  phone2: string;
  phone3: string;
  heroImage: string;
  footerNoteEn: string;
  footerNoteTel: string;
  activities: PrahladaBadiActivity[];
  gallery: PrahladaBadiGalleryItem[];
  reviews: PrahladaBadiReview[];
};

export const defaultPrahladaBadi: PrahladaBadiData = {
  regStatus: "Coming Soon",
  registerUrl: "",
  startDate: "2026-04-25",
  endDate: "2026-05-16",
  timings: "9:30 AM – 12:30 PM",
  venueEn: "ISKCON Kurnool Temple",
  venueTel: "ఇస్కాన్ కర్నూలు ఆలయం",
  feeTier1LabelEn: "Up to 5th Class",
  feeTier1LabelTel: "5 వ తరగతి వరకు",
  feeTier1Amount: "500",
  feeTier2LabelEn: "Above 5th Class",
  feeTier2LabelTel: "5 వ తరగతి పైన",
  feeTier2Amount: "700",
  contactName: "Temple Administration",
  contactTitleEn: "Program Coordinator",
  contactTitleTel: "కార్యక్రమ సమన్వయకర్త",
  phone1: "+91 98765 43210",
  phone2: "",
  phone3: "",
  heroImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
  footerNoteEn: "Many more cultural and traditional topics will be taught",
  footerNoteTel: "మరెన్నో సాంస్కృతిక మరియు సాంప్రదాయ విషయాలు బోధించబడతాయి",
  activities: [
    { id: "a1", titleEn: "Bhagavad Gita Slokas", titleTel: "భగవద్గీత శ్లోకాలు", icon: "📖", order: 1, descriptionEn: "Learn meaningful verses and timeless spiritual wisdom.", descriptionTel: "భగవద్గీత శ్లోకాలు మరియు అమూల్యమైన ఆధ్యాత్మిక జ్ఞానాన్ని నేర్చుకోండి." },
    { id: "a2", titleEn: "Annamacharya Keerthanas", titleTel: "అన్నమాచార్య కీర్తనలు", icon: "🎵", order: 2, descriptionEn: "Discover devotional music through beautiful traditional compositions.", descriptionTel: "సాంప్రదాయ కీర్తనల ద్వారా భక్తి సంగీతాన్ని అన్వేషించండి." },
    { id: "a3", titleEn: "Personality Development Stories", titleTel: "వ్యక్తిత్వ వికాస కథలు", icon: "📚", order: 3, descriptionEn: "Build confidence, discipline, kindness, leadership, and good character.", descriptionTel: "కథల ద్వారా ఆత్మవిశ్వాసం, క్రమశిక్షణ, నాయకత్వ లక్షణాలను పెంపొందించుకోండి." },
    { id: "a4", titleEn: "Short Skits & Drama", titleTel: "నాటికలు (డ్రామా)", icon: "🎭", order: 4, descriptionEn: "Develop creativity, teamwork, communication, and stage confidence.", descriptionTel: "నాటకాల ద్వారా సృజనాత్మకత, జట్టుకృషి మరియు సంభాషణ నైపుణ్యాలను పెంపొందించుకోండి." },
    { id: "a5", titleEn: "Drawing & Art", titleTel: "డ్రాయింగ్ & ఆర్ట్", icon: "🎨", order: 5, descriptionEn: "Encourage imagination and artistic expression through engaging activities.", descriptionTel: "చిత్రలేఖనం మరియు కళల ద్వారా సృజనాత్మకతను వ్యక్తపరచండి." },
    { id: "a6", titleEn: "Devotional Songs", titleTel: "భక్తి గీతాలు", icon: "🎶", order: 6, descriptionEn: "Experience joyful devotion through music and group singing.", descriptionTel: "సమూహ భక్తి గీతాల ఆలపన ద్వారా ఆనందాన్ని పొందండి." },
  ],
  gallery: [],
  reviews: [
    { id: "r1", name: "Srinivas (Parent)", text: "My daughter learned so many slokas in just one month. The environment was very spiritual and nurturing.", rating: 5, visible: true },
    { id: "r2", name: "Radha (Parent)", text: "Excellent summer program! The values taught here are very helpful for character building.", rating: 5, visible: true },
  ],
};

export type HarinamaGalleryItem = { id: string; url: string; label: string };
export type HarinamaData = {
  whatsappUrl: string;
  instagramHandle: string;
  scheduleDay: string;
  scheduleTime: string;
  meetingPoint: string;
  startingPoint?: string;
  endingPoint?: string;
  aboutText: string;
  aboutImage: string;
  gallery: HarinamaGalleryItem[];
};

export const defaultHarinama: HarinamaData = {
  whatsappUrl: "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3",
  instagramHandle: "iskconkurnool",
  scheduleDay: "Every Saturday & Every Ekadashi",
  scheduleTime: "5:00 PM onwards",
  meetingPoint: "ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple",
  startingPoint: "ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple",
  endingPoint: "Raj Vihar Circle & ISKCON Temple Premises",
  aboutText: "Hari Nama Sankeerthana is the congregational chanting of the holy names of Krishna — Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare — carried out loudly, joyfully, and publicly, usually while walking through streets, markets, and neighborhoods.\n\nThis practice was given special emphasis by Sri Chaitanya Mahaprabhu, who taught that in this age, chanting the names of God together, in public, is the easiest and most powerful way to purify the heart and connect with the Divine. It doesn't require Sanskrit knowledge, ritual expertise, or any qualification — anyone who joins, chants, or even simply hears, benefits.\n\nAt ISKCON Kurnool, Hari Nama Sankeerthana is not a performance — it's an offering. Devotees walk together with mridangam and karatalas, singing, dancing, and inviting the whole town to taste a moment of transcendence in the middle of an ordinary day.",
  aboutImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
  gallery: [],
};

export type DailyDarshanItem = {
  id: string;
  /** ISO date: YYYY-MM-DD */
  date: string;
  title: string;
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  officialSourceName?: string;
  officialSourceUrl?: string;
  photographerCredit?: string;
  published: boolean;
  order?: number;
  createdAt?: string;
};

export type DailyDarshanData = {
  headerTitle: string;
  headerSubtitle: string;
  badgeText: string;
  noticeBanner?: string;
  entries: DailyDarshanItem[];
  liveYoutubeUrl?: string;
};

export type LivePlatform = "YouTube" | "Facebook" | "Instagram" | "Other";

export type LiveProgrammeItem = {
  id: string;
  title: string;
  description?: string;
  /** ISO date: YYYY-MM-DD */
  date: string;
  /** 24-hr time string "HH:mm" e.g. "07:30" */
  startTime: string;
  /** 24-hr time string "HH:mm" e.g. "08:30" */
  endTime: string;
  thumbnailUrl?: string;
  platform: LivePlatform;
  streamUrl: string;
  /** When true, admin overrides smart schedule and forces "LIVE NOW" status */
  isManualLiveOverride?: boolean;
  enableReminders?: boolean;
  published: boolean;
  speakerOrPerformer?: string;
  order?: number;
  createdAt?: string;
};

export type LiveProgrammeData = {
  enabled: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  programmes: LiveProgrammeItem[];
};

export const defaultLiveProgrammes: LiveProgrammeData = {
  enabled: true,
  sectionTitle: "Live Temple Broadcast",
  sectionSubtitle: "Tune into daily transcendental discourses, ecstatic sankirtana, and sacred deity aartis live from Sri Sri Puri Jagannath Mandir, ISKCON Kurnool.",
  badgeText: "Temple Broadcast • Live Stream",
  programmes: []
};

export const defaultDailyDarshan: DailyDarshanData = {
  headerTitle: "Sri Sri Jagannath Baladev Subhadra Daily Darshan",
  headerSubtitle: "Behold the transcendental beauty and divine blessings of Their Lordships at ISKCON Kurnool.",
  badgeText: "Nitya Darshan • Daily Deity Darshan",
  noticeBanner: "Darshan photos are refreshed every morning after Sringara Harati.",
  liveYoutubeUrl: "",
  entries: [
    {
      id: "dd_today",
      date: "2026-08-23",
      title: "Sri Sri Jagannath, Baladeva & Subhadra Maharani Rajadhiraja Sringara Darshan",
      imageUrl: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1600&q=85",
      additionalImages: [
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600100397608-f010f444f4e7?auto=format&fit=crop&w=1200&q=80"
      ],
      description: "“jaya jaya jagannātha śacīra nandana, tribhuvana kare yāṅra caraṇa vandana” — Today Their Lordships are adorned in royal saffron silk, embellished with fragrant jasmine garlands, fresh tulasi manjari, and shimmering golden crowns. May the merciful glance of Lord Jagannath bestow devotion, protection, and eternal auspiciousness upon all devotees.",
      officialSourceName: "Official Instagram (@iskconkurnool)",
      officialSourceUrl: "https://instagram.com/iskconkurnool",
      photographerCredit: "ISKCON Kurnool Media Team",
      published: true,
      order: 1,
      createdAt: "2026-08-23T07:30:00.000Z"
    },
    {
      id: "dd_yesterday",
      date: "2026-08-22",
      title: "Sri Sri Radha Govinda & Jagannath Parivara Pushpalankara Sringara",
      imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85",
      additionalImages: [
        "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=1200&q=80"
      ],
      description: "Auspicious morning Sringara darshan adorned with sacred lotuses, rose garlands, and divine chandan tilak. Devotees gathered during Mangala Harati to chant the holy names of Hare Krishna.",
      officialSourceName: "Official Instagram (@iskconkurnool)",
      officialSourceUrl: "https://instagram.com/iskconkurnool",
      photographerCredit: "ISKCON Kurnool Media Team",
      published: true,
      order: 2,
      createdAt: "2026-08-22T07:30:00.000Z"
    },
    {
      id: "dd_day_before",
      date: "2026-08-21",
      title: "Sri Sri Jagannath Baladev Subhadra Pitambara Alankara",
      imageUrl: "https://images.unsplash.com/photo-1600100397608-f010f444f4e7?auto=format&fit=crop&w=1600&q=85",
      description: "Divine Friday darshan with velvet yellow silks, fragrant champaka flowers, and peacock feather crowns. Salutations to the Lord of the Universe.",
      officialSourceName: "Temple Media Channel",
      officialSourceUrl: "https://instagram.com/iskconkurnool",
      published: true,
      order: 3,
      createdAt: "2026-08-21T07:30:00.000Z"
    },
    {
      id: "dd_day_4",
      date: "2026-08-20",
      title: "Sri Sri Jagannath Swami Mangala Alankara & Tulasi Archana",
      imageUrl: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=1600&q=85",
      description: "Early morning Mangala Harati darshan with 108 fragrant Tulasi leaves offering and special sweet rice bhoga.",
      officialSourceName: "Official Instagram (@iskconkurnool)",
      officialSourceUrl: "https://instagram.com/iskconkurnool",
      published: true,
      order: 4,
      createdAt: "2026-08-20T07:30:00.000Z"
    }
  ]
};

export type HouseProgrammeActivity = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  image?: string;
  order: number;
};

export type HouseProgrammeStep = {
  step: number;
  title: string;
  desc: string;
  icon: string;
};

export type HouseProgrammeGalleryItem = {
  id: string;
  url: string;
  title: string;
  caption?: string;
};

export type HouseProgrammeRequest = {
  id: string;
  name: string;
  phone: string;
  locationArea: string;
  preferredDate: string;
  preferredTime: string;
  participantsCount: string;
  fullAddress: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  createdAt: string;
  read: boolean;
};

export type HouseProgrammeData = {
  badgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutDesc: string;
  aboutImage: string;
  aboutImageRight?: string;
  activities: HouseProgrammeActivity[];
  howItWorks: HouseProgrammeStep[];
  gallery: HouseProgrammeGalleryItem[];
  requests: HouseProgrammeRequest[];
  closingQuote: string;
  quoteImage?: string;
  contactPhone: string;
  whatsappNumber: string;
  kartikaImage?: string;
  status?: "Coming Soon" | "Closed" | "Registrations Opened";
};

export const defaultHouseProgramme: HouseProgrammeData = {
  status: "Registrations Opened",
  badgeText: "Devotional Home Gatherings",
  heroTitle: "House Programmes",
  heroSubtitle: "Bring the sacred atmosphere of the temple into your home with joyful chanting, spiritual discourses, and divine prasadam.",
  heroImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1350&q=80",
  aboutTitle: "What is a House Programme?",
  aboutDesc: "House Programmes are devotional gatherings conducted in devotees' homes, where families, neighbours, and friends come together to practice Krishna consciousness in a simple, joyful, and uplifting atmosphere.\n\nWhether you are celebrating a special occasion, an anniversary, birthday, house warming, or simply seeking divine peace and spiritual association, temple devotees visit your home to conduct sacred kirtans, discuss timeless wisdom from the Bhagavad Gita, and share delicious Krishna prasadam.",
  aboutImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
  aboutImageRight: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
  activities: [
    { id: "act_1", title: "Hare Krishna Kirtan", desc: "Group chanting and ecstatic singing of the Hare Krishna Mahamantra that purifies the atmosphere and fills hearts with spiritual joy.", icon: "🎶", order: 1, image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80" },
    { id: "act_2", title: "Bhagavad Gita Discussion", desc: "Reading, explaining, and contemplating essential verses in a simple, engaging, and practical way for everyday modern life.", icon: "📖", order: 2, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" },
    { id: "act_3", title: "Harati & Puja", desc: "Offering heartfelt prayers, sacred lamps, incense, and devotional worship to the Supreme Lord in your home altar.", icon: "🪔", order: 3, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
    { id: "act_4", title: "Nama Sankirtana", desc: "Congregational singing and musical glorification of Krishna's transcendental holy names with kartalas and mridanga.", icon: "🌸", order: 4, image: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=600&q=80" },
    { id: "act_5", title: "Spiritual Discussions", desc: "Interactive Q&A and practical insights on Krishna consciousness, mind management, positive living, and character building.", icon: "📚", order: 5, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" },
    { id: "act_6", title: "Bhajans & Devotional Songs", desc: "Soul-stirring bhajans and compositions written by exalted Vaishnava acharyas celebrating divine devotion.", icon: "🎵", order: 6, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
    { id: "act_7", title: "Prasadam Distribution", desc: "Honouring and sharing sanctified, pure vegetarian food (prasadam) prepared with devotion and blessed by Krishna.", icon: "🍚", order: 7, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80" },
    { id: "act_8", title: "Family Spiritual Activities", desc: "Fun, meaningful activities and storytelling designed to lovingly engage children, youth, and elders alike.", icon: "👨‍👩‍👧‍👦", order: 8, image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80" },
    { id: "act_9", title: "Japa & Meditation Guidance", desc: "Hands-on instruction on how to chant on Tulasi beads, develop focus, reduce stress, and cultivate inner peace.", icon: "🧘", order: 9, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" },
    { id: "act_10", title: "Festival Celebrations at Home", desc: "Special devotional celebrations for Janmashtami, Rama Navami, Gaura Purnima, Govardhana Puja, and family milestones.", icon: "🎉", order: 10, image: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=600&q=80" },
  ],
  howItWorks: [
    { step: 1, title: "Request a Programme", desc: "Submit your details, preferred date, time, and location using our simple online form.", icon: "📝" },
    { step: 2, title: "Connect with the Temple", desc: "Our friendly temple coordination team will contact you to confirm arrangements.", icon: "📞" },
    { step: 3, title: "Plan the Programme", desc: "We discuss your preferred activities, prasadam coordination, and program schedule.", icon: "🗓️" },
    { step: 4, title: "Devotees Visit Your Home", desc: "Temple devotees arrive at your home and conduct the devotional gathering with utmost love.", icon: "🚗" },
    { step: 5, title: "Chant • Learn • Celebrate • Honour Prasadam", desc: "Your home is transformed into a spiritual sanctuary filled with transcendental joy.", icon: "✨" },
  ],
  gallery: [
    { id: "g1", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80", title: "Joyful Home Kirtan", caption: "Family and friends chanting together" },
    { id: "g2", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", title: "Bhagavad Gita Discourse", caption: "Devotees sharing spiritual wisdom" },
    { id: "g3", url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", title: "Home Altar Harati", caption: "Offering prayers and sacred lamps" },
    { id: "g4", url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80", title: "Prasadam Distribution", caption: "Honouring sanctified food together" },
  ],
  requests: [],
  closingQuote: "“Bring the joy of Krishna consciousness into your home. Chant together, learn together, and experience the spiritual atmosphere of devotional service.”",
  quoteImage: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
  contactPhone: "+91 95053 77520",
  whatsappNumber: "+91 95053 77520",
  kartikaImage: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
};

// ============================================================================
// YOUTH YATRA — REUSABLE EVENT-DRIVEN SYSTEM TYPES & DEFAULT DATA
// ============================================================================
export type YatraTimelineDay = {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  location: string;
  morningProgram?: string;
  travelDetails?: string;
  sessions?: string;
  activities?: string[];
  accommodation?: string;
  meals?: string;
  specialEvents?: string;
  image?: string;
};

export type YatraPlace = {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  image: string;
  visitDate?: string;
  mapLocationUrl?: string;
  distanceInfo?: string;
  highlights: string[];
  order: number;
};

export type YatraRegistration = {
  id: string;
  eventId: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  city: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  accommodationRequired: boolean;
  foodPreference: string;
  specialRequirements?: string;
  registrationCategory: string;
  paymentMode: "free" | "qr" | "razorpay";
  paymentStatus: "pending" | "verified" | "completed" | "failed";
  amountPaid: number;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  registeredAt: string;
  read: boolean;
  status: "confirmed" | "waitlist" | "cancelled";
  // Boarding Pass & QR Check-In Fields
  boardingPassId?: string;
  batch?: string;
  seatNumber?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  participantPhotoUrl?: string;
};

export type YatraGalleryItem = {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  albumCategory?: string;
};

export type YatraWhatToBringItem = {
  id: string;
  item: string;
  category: string;
  mandatory: boolean;
};

export type YatraGuideline = {
  id: string;
  title: string;
  desc: string;
  type: "rule" | "emergency" | "policy";
};

export type YatraFaq = {
  id: string;
  question: string;
  answer: string;
  category?: string;
};

export type YatraCoordinator = {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email?: string;
  image?: string;
};

export type YatraVehicle = {
  id: string;
  vehicleName: string;
  type: "AC Luxury Coach" | "AC Sleeper Bus" | "AC Semi-Sleeper" | "Train (3AC / Sleeper)" | "Tempo Traveller" | "Flight";
  registrationNumber: string;
  seatCapacity: number;
  driverName: string;
  driverPhone: string;
  coachInChargeName: string;
  coachInChargePhone: string;
  amenities: string[];
  batchTag: string;
  notes?: string;
};

export type YatraTravelStep = {
  id: string;
  stepNumber: number;
  time: string;
  title: string;
  location: string;
  description: string;
  instructions?: string;
  googleMapUrl?: string;
};

export type YatraPickupPoint = {
  id: string;
  location: string;
  time: string;
  landmark: string;
};

export type YatraTravelConfig = {
  primaryMode: string;
  trainOptionDetails?: string;
  departureLocationName: string;
  departureLocationAddress: string;
  departureGoogleMapUrl: string;
  reportingTime: string;
  departureTime: string;
  pickupPoints: YatraPickupPoint[];
  luggagePolicy: string;
  vehicles: YatraVehicle[];
  stepByStepGuide: YatraTravelStep[];
};

export type YatraEvent = {
  id: string;
  year: number;
  title: string;
  theme: string;
  tagline: string;
  description: string;
  purpose: string;
  whoCanJoin: string;
  ageGroup: string;
  organizedBy: string;
  startDate: string;
  endDate: string;
  durationText: string;
  posterUrl: string;
  heroBannerUrl: string;
  registrationOpen: boolean;
  registrationDeadline?: string;
  maxSeats: number;
  startingPoint: string;
  endingPoint: string;
  routeSummary: string;
  paymentConfig: {
    mode: "free" | "qr" | "razorpay" | "both";
    fee: number;
    feeDescription?: string;
    upiId?: string;
    qrImageUrl?: string;
    paymentInstructions?: string;
    razorpayKeyId?: string;
  };
  timeline: YatraTimelineDay[];
  places: YatraPlace[];
  gallery: YatraGalleryItem[];
  whatToBring: YatraWhatToBringItem[];
  guidelines: YatraGuideline[];
  faqs: YatraFaq[];
  coordinators: YatraCoordinator[];
  travelConfig?: YatraTravelConfig;
  isPublished: boolean;
  isArchived: boolean;
};

export type YouthYatraState = {
  activeEventId: string;
  yatraActive?: boolean;
  events: YatraEvent[];
  registrations: YatraRegistration[];
};

export const defaultYouthYatra2026: YatraEvent = {
  id: "yatra_2026",
  year: 2026,
  title: "Annual Youth Yatra 2026",
  theme: "In the Footsteps of the Acharyas",
  tagline: "A 5-Day Divine Pilgrimage of Kirtan, Wisdom, Sacred Temples & Brotherhood",
  description: "Join over 100+ enthusiastic youth devotees from ISKCON Kurnool on an unforgettable transcendental journey across South India's most sacred dhams. Experience morning sadhana, soul-stirring kirtans, transformative Bhagavad Gita discourses, holy ocean dips, and sumptuous Krishna prasadam.",
  purpose: "To empower youth with spiritual culture, positive character, timeless Vedic wisdom, and deep devotional camaraderie in transcendental holy places.",
  whoCanJoin: "Open to unmarried youth, college students, and young working professionals seeking spiritual growth, mental clarity, and divine association.",
  ageGroup: "16 – 30 Years",
  organizedBy: "ISKCON Kurnool Youth Forum (IYF)",
  startDate: "2026-10-15",
  endDate: "2026-10-19",
  durationText: "5 Days & 4 Nights",
  posterUrl: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80",
  heroBannerUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80",
  registrationOpen: true,
  registrationDeadline: "2026-10-05",
  maxSeats: 120,
  startingPoint: "ISKCON Kurnool Temple, AP",
  endingPoint: "ISKCON Kurnool Temple, AP",
  routeSummary: "Kurnool → Hampi (Kishkindha) → Udupi Sri Krishna Kshetra → Murudeshwar → Gokarna Mahabaleshwar → Kurnool",
  paymentConfig: {
    mode: "both",
    fee: 2500,
    feeDescription: "Includes AC Deluxe Pushback Bus Travel, 4 Nights Hotel Accommodation (triple/quad sharing), 3 times Satvik Krishna Prasadam daily, Yatra Guide Kit, and Entry Passes.",
    upiId: "iskconkurnool@sbi",
    qrImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    paymentInstructions: "Scan the QR code with any UPI App (GPay, PhonePe, Paytm, BHIM), complete the ₹2,500 registration fee, enter the 12-digit UTR / Transaction ID below, and upload the payment screenshot.",
    razorpayKeyId: "rzp_live_TTxJXHnvmVNCF8",
  },
  timeline: [
    {
      id: "day_1",
      dayNumber: 1,
      date: "Oct 15, 2026",
      title: "Sacred Departure & The Wonders of Kishkindha (Hampi)",
      location: "Kurnool → Hampi, Karnataka",
      morningProgram: "5:00 AM Mangala Harati at ISKCON Kurnool, Yatra Kit Distribution & Blessings.",
      travelDetails: "Departure by AC Deluxe Coaches at 6:00 AM. Refreshments served on board.",
      sessions: "Evening Discourse: 'Lessons from the Ramayana & Sugriva's Surrender' on Anjanadri Hill.",
      activities: ["Pampa Sarovar Darshan", "Anjanadri Hill (Birthplace of Sri Hanuman)", "Ecstatic Sunset Kirtan at Tungabhadra River"],
      accommodation: "Comfortable Star Hotel at Hospet / Hampi",
      meals: "Satvik Breakfast, Sumptuous Afternoon Feast, Light Night Prasadam",
      specialEvents: "Grand Inaugural Kirtan & Devotee Introduction Circle",
      image: "https://images.unsplash.com/photo-1600100397608-f010f444f4e7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "day_2",
      dayNumber: 2,
      date: "Oct 16, 2026",
      title: "Historic Temples of Vijayanagara Empire & Travel to Udupi",
      location: "Hampi → Udupi Coastal Kshetra",
      morningProgram: "6:30 AM Japa Meditation session amidst ancient temple pillars.",
      travelDetails: "Scenic western ghats drive towards coastal Karnataka.",
      sessions: "Bus Satsang & Bhagavad Gita Quiz on Wheels.",
      activities: ["Virupaksha Temple Darshan", "Vittala Temple & Musical Stone Pillars", "Laxmi Narasimha Monolith Darshan"],
      accommodation: "Devotee Guest House / Hotel near Udupi Sri Krishna Matha",
      meals: "Hot Breakfast at Hampi, Traditional Packed Prasadam Lunch, Coastal Karnataka Dinner Feast",
      specialEvents: "Night Bhajan Sandhya welcoming Sri Krishna's holy abode",
      image: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "day_3",
      dayNumber: 3,
      date: "Oct 17, 2026",
      title: "Divine Darshan of Udupi Sri Krishna & Pajaka Kshetra",
      location: "Udupi & Pajaka (Birthplace of Sri Madhvacharya)",
      morningProgram: "4:30 AM Nirmalya Darshan through Kanakana Kindi window at Sri Krishna Matha.",
      travelDetails: "Local pilgrimage travel around Pajaka hills.",
      sessions: "Seminar by Senior Sannyasi: 'Pure Devotion in the Teachings of Sri Madhvacharya'.",
      activities: ["Sri Krishna Mahapooja & Darshan", "Pajaka Kshetra Madhva Mandira", "Malpe Beach Harinama & Ocean Sunset Japa"],
      accommodation: "Udupi Hotel Accommodation",
      meals: "Udupi Matha Maha Prasadam Feast, Evening Prasadam & Snacks",
      specialEvents: "Mega Beach Sankirtana with Mridangas and Karatalas at Malpe Beach",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "day_4",
      dayNumber: 4,
      date: "Oct 18, 2026",
      title: "Majestic Murudeshwar & Holy Gokarna Kshetra",
      location: "Udupi → Murudeshwar → Gokarna",
      morningProgram: "6:00 AM Japa Meditation by Arabian Sea coast.",
      travelDetails: "Coastal highway ride along coconut groves and ocean views.",
      sessions: "Spiritual Reflection Workshop: 'Building Unshakeable Faith in Difficult Times'.",
      activities: ["Murudeshwar Raja Gopura & Shiva Deity Darshan", "Gokarna Atmalinga Mahabaleshwar Temple", "Om Beach Devotional Walk"],
      accommodation: "Resort / Hotel in Gokarna",
      meals: "Satvik Breakfast, Temple Annadanam Feast, Special Farewell Dinner",
      specialEvents: "Heartwarming Yatra Realizations sharing session & Bonfire Bhajan",
      image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "day_5",
      dayNumber: 5,
      date: "Oct 19, 2026",
      title: "Tungabhadra Blessings & Blissful Return to Kurnool",
      location: "Gokarna → Hubli → ISKCON Kurnool",
      morningProgram: "7:00 AM Holy dip and morning prayers.",
      travelDetails: "Comfortable return journey to Kurnool with joyful kirtans and memories.",
      sessions: "Action Plan: 'Carrying the Spiritual Charge into Your Daily Life & Studies'.",
      activities: ["Concluding Japa Round Table", "Yatra Souvenir & Certification Distribution", "Grand Welcome at ISKCON Kurnool Altar"],
      accommodation: "Return to Home Residence",
      meals: "Special Travel Prasadam Breakfast, Highway Feast Lunch, Welcome Prasadam in Kurnool",
      specialEvents: "Welcoming Harati & Group Photo at ISKCON Kurnool",
      image: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80",
    },
  ],
  places: [
    {
      id: "place_1",
      name: "Hampi & Kishkindha Kshetra",
      tagline: "The Sacred Capital of Sugriva & Sri Rama's Alliance",
      description: "Steeped in Ramayana history, Kishkindha features the holy Pampa Sarovar, Anjanadri Hill (the divine birthplace of Sri Hanuman), and majestic stone temples that reflect eternal devotion.",
      image: "https://images.unsplash.com/photo-1600100397608-f010f444f4e7?auto=format&fit=crop&w=800&q=80",
      visitDate: "Day 1 (Oct 15)",
      mapLocationUrl: "https://maps.google.com/?q=Hampi,Karnataka",
      distanceInfo: "210 km from Kurnool (~4.5 hrs)",
      highlights: ["Pampa Sarovar Holy Lake", "Anjanadri Hanuman Temple", "Virupaksha Historic Mandir", "Stone Chariot at Vittala Temple"],
      order: 1,
    },
    {
      id: "place_2",
      name: "Udupi Sri Krishna Matha",
      tagline: "The World-Renowned Abode of Balakrishna",
      description: "Established by the great Vaishnava acharya Sri Madhvacharya in the 13th century, where Lord Krishna is lovingly worshipped through the nine-holed golden Kanakana Kindi window.",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      visitDate: "Day 2 & 3 (Oct 16 – 17)",
      mapLocationUrl: "https://maps.google.com/?q=Sri+Krishna+Matha+Udupi",
      distanceInfo: "320 km from Hampi (~6.5 hrs)",
      highlights: ["Nirmalya Darshan of Lord Krishna", "Ancient Madhwa Sarovara Tank", "Seven Daily Pujas & Traditional Harati", "World-famous Annadana Maha Prasadam"],
      order: 2,
    },
    {
      id: "place_3",
      name: "Pajaka Kshetra",
      tagline: "The Holy Birthplace of Sri Madhvacharya",
      description: "Nestled near the Kunjarugiri hills, Pajaka is where Sri Madhvacharya performed childhood pastimes, created holy ponds with his toe, and revealed divine Vedic truths.",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      visitDate: "Day 3 (Oct 17)",
      mapLocationUrl: "https://maps.google.com/?q=Pajaka+Kshetra+Udupi",
      distanceInfo: "12 km from Udupi",
      highlights: ["Ancient Madhva Shrine", "Four Sacred Ponds (Dhanus, Bana, Gada, Chakra)", "Vadiraja Mutt Association", "Scenic Spiritual Atmosphere"],
      order: 3,
    },
    {
      id: "place_4",
      name: "Murudeshwar Temple & Beach",
      tagline: "Colossal Deity on the Arabian Seashore",
      description: "Famous for the towering 123-foot Lord Shiva statue and the 20-storied Raja Gopura jutting into the blue Arabian Sea on three sides at Kanduka Giri hill.",
      image: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
      visitDate: "Day 4 (Oct 18)",
      mapLocationUrl: "https://maps.google.com/?q=Murudeshwar+Temple",
      distanceInfo: "105 km from Udupi (~2.5 hrs)",
      highlights: ["20-Story Raja Gopura Lift View", "Seashore Sunset Harinama", "Geeta Upadesha Chariot Sculpture", "Breathtaking Ocean Panorama"],
      order: 4,
    },
    {
      id: "place_5",
      name: "Gokarna Mahabaleshwar Kshetra",
      tagline: "Ancient Atmalinga Pilgrimage of Lord Shiva & Ganesha",
      description: "A sacred pilgrimage site where the divine Atmalinga was placed by Sri Ganesha. Devotees take holy dips in the sea and receive auspicious blessings for spiritual advancement.",
      image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
      visitDate: "Day 4 (Oct 18)",
      mapLocationUrl: "https://maps.google.com/?q=Mahabaleshwar+Temple+Gokarna",
      distanceInfo: "78 km from Murudeshwar (~1.5 hrs)",
      highlights: ["Atmalinga Temple Darshan", "Kotiteertha Sacred Water Tank", "Om Beach & Kudle Beach Nature Meditation", "Spiritual Realizations Campfire"],
      order: 5,
    },
  ],
  gallery: [
    { id: "yg1", url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80", title: "Joyful Harinama at Malpe Beach", caption: "Youth chanting the Holy Names together", albumCategory: "kirtan" },
    { id: "yg2", url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", title: "Darshan at Udupi Sri Krishna Matha", caption: "Seeking the divine blessings of Balakrishna", albumCategory: "temples" },
    { id: "yg3", url: "https://images.unsplash.com/photo-1600100397608-f010f444f4e7?auto=format&fit=crop&w=800&q=80", title: "Anjanadri Hill Trek", caption: "Climbing the sacred hill of Sri Hanuman", albumCategory: "places" },
    { id: "yg4", url: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80", title: "Bhagavad Gita Workshop", caption: "Interactive wisdom discourse by senior devotees", albumCategory: "sessions" },
    { id: "yg5", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", title: "Honouring Satvik Prasadam", caption: "Pure, delicious sanctified food served with love", albumCategory: "prasadam" },
    { id: "yg6", url: "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80", title: "Youth Brotherhood & Devotion", caption: "Lifelong spiritual friendships created on yatra", albumCategory: "group" },
  ],
  whatToBring: [
    { id: "wb1", item: "Government ID Proof (Aadhaar / Driving License / College ID) in original", category: "Documents", mandatory: true },
    { id: "wb2", item: "Traditional devotional attire (Dhoti-Kurta / Kurta-Pyjama / modest ethnic clothing)", category: "Clothing", mandatory: true },
    { id: "wb3", item: "Comfortable walking shoes & slip-on footwear for temple entries", category: "Footwear", mandatory: true },
    { id: "wb4", item: "Personal Tulasi Japa Mala and bead bag", category: "Puja Essentials", mandatory: false },
    { id: "wb5", item: "Reusable water bottle (1 Litre capacity)", category: "Essentials", mandatory: true },
    { id: "wb6", item: "Personal toiletries (Toothbrush, soap, towel, shampoo)", category: "Personal Care", mandatory: true },
    { id: "wb7", item: "Light bedsheet / blanket for AC travel & hotel use", category: "Bedding", mandatory: true },
    { id: "wb8", item: "Personal medicines & first-aid (motion sickness, headache, regular prescriptions)", category: "Medical", mandatory: false },
    { id: "wb9", item: "Mobile charger, power bank & small torch", category: "Electronics", mandatory: false },
    { id: "wb10", item: "Small backpack / sling bag for day trips", category: "Bags", mandatory: true },
  ],
  guidelines: [
    { id: "gl1", title: "Punctuality & Reporting", desc: "All participants must report at ISKCON Kurnool Temple by 5:00 AM on departure day. Please maintain strictly communicated timings at every temple stop.", type: "rule" },
    { id: "gl2", title: "Devotional Decorum & Conduct", desc: "The Yatra is a sacred pilgrimage, not a casual picnic. Smoking, alcohol, non-vegetarian food, and gambling are strictly prohibited. Modest and clean traditional dress is expected.", type: "rule" },
    { id: "gl3", title: "Participation in Sadhana", desc: "Active and joyful participation in morning Japa, kirtans, discourses, and group activities is an essential part of the Yatra experience.", type: "rule" },
    { id: "gl4", title: "Safety & Group Discipline", desc: "Always move in your assigned buddy pairs. Do not venture into deep ocean waters during beach visits. Always keep coordinators updated about your location.", type: "emergency" },
    { id: "gl5", title: "Accommodation Rules", desc: "Rooms are allotted on triple/quad sharing basis. Devotees are expected to keep rooms tidy, respect fellow roommates, and adhere to night curfew timings.", type: "rule" },
    { id: "gl6", title: "Cancellation & Refund Policy", desc: "Cancellations made up to 7 days prior to departure will receive a 75% refund. No refunds are possible within 7 days due to prepaid bus and hotel bookings.", type: "policy" },
  ],
  faqs: [
    { id: "faq1", question: "Who is eligible to participate in the Youth Yatra?", answer: "The Annual Youth Yatra is open to youth, students, and working professionals aged between 16 to 30 years. No prior formal training is required — only an open heart and desire to experience spiritual culture.", category: "Eligibility" },
    { id: "faq2", question: "What does the registration fee of ₹2,500 cover?", answer: "The fee is all-inclusive. It covers round-trip AC Deluxe coach travel, 4 nights hotel accommodation, 3 times unlimited pure Satvik Krishna Prasadam daily, Yatra kit, temple entry passes, and spiritual mentorship.", category: "Fee & Inclusions" },
    { id: "faq3", question: "How will room accommodation and food be arranged?", answer: "We arrange clean, verified hotels on a 3-4 sharing basis with separate blocks/rooms for boys and girls. Food is 100% pure vegetarian, freshly cooked Satvik Krishna Prasadam prepared under hygienic conditions.", category: "Logistics" },
    { id: "faq4", question: "How do I make the payment after filling the registration form?", answer: "You can choose either QR Code UPI payment (Google Pay, PhonePe, Paytm) or Razorpay on the form. For QR payments, submit your 12-digit UTR/Transaction ID and upload the receipt screenshot. You will receive an instant Registration ID.", category: "Payment" },
    { id: "faq5", question: "Can beginners or first-time devotees join?", answer: "Absolutely! Most participants are college students or working youth attending for the first time. The atmosphere is warm, friendly, engaging, and welcoming.", category: "Experience" },
    { id: "faq6", question: "What is the reporting location and departure schedule?", answer: "Departure is from ISKCON Kurnool Temple (Sri Sri Puri Jagannath Temple campus) on October 15, 2026 at 6:00 AM sharp. Reporting time is 5:00 AM for Mangala Harati.", category: "Schedule" },
    { id: "faq7", question: "Is there any age relaxation for young professionals?", answer: "Youth slightly outside the 16–30 range can contact the Yatra coordinators directly on WhatsApp for special consideration depending on seat availability.", category: "Eligibility" },
    { id: "faq8", question: "Whom can I contact if I have questions before registering?", answer: "You can reach out directly to our Youth Forum coordinators via WhatsApp or phone call using the contact section below.", category: "Support" },
  ],
  coordinators: [
    { id: "c1", name: "Ramanuja Dasa", role: "Youth Forum Head Coordinator", phone: "+91 95053 77520", whatsapp: "919505377520", email: "youth@iskconkurnool.org" },
    { id: "c2", name: "Damodara Chaitanya Dasa", role: "Yatra Logistics & Accommodation", phone: "+91 98765 43210", whatsapp: "919876543210", email: "yatra@iskconkurnool.org" },
    { id: "c3", name: "Keshav Krishna Dasa", role: "Registrations & Accounts Helpdesk", phone: "+91 94400 12345", whatsapp: "919440012345", email: "support@iskconkurnool.org" },
  ],
  travelConfig: {
    primaryMode: "Twin 2+2 AC Deluxe Luxury Pushback Coaches",
    trainOptionDetails: "For devotees traveling from Hyderabad/Bangalore: Direct trains to Kurnool City (KNL) available daily. Temple is 10 mins auto ride from railway station.",
    departureLocationName: "Sri Sri Puri Jagannath Temple, ISKCON Kurnool",
    departureLocationAddress: "NH-44 Highway, Near Birla Compound, Kurnool, Andhra Pradesh 518002",
    departureGoogleMapUrl: "https://maps.google.com/?q=ISKCON+Kurnool",
    reportingTime: "05:00 AM (Mangala Harati)",
    departureTime: "06:00 AM Sharp",
    pickupPoints: [
      { id: "p1", location: "ISKCON Kurnool Main Altar (Boarding Point)", time: "05:00 AM", landmark: "Sri Sri Puri Jagannath Temple Campus" },
      { id: "p2", location: "Dhone Bypass Junction", time: "06:45 AM", landmark: "Hotel Haritha / AP Tourism Crossing" },
      { id: "p3", location: "Gooty Toll Plaza", time: "07:15 AM", landmark: "NH-44 Flyover Highway Entry" },
      { id: "p4", location: "Anantapur Bypass (Raptadu)", time: "08:00 AM", landmark: "Raptadu Toll Gate, NH-44" },
    ],
    luggagePolicy: "1 Main Stowed Duffel Bag / Suitcase (Max 15 kg for coach under-chassis boot) + 1 Small Cabin/Backpack (for personal essentials, water bottle & Japa Mala inside bus).",
    vehicles: [
      {
        id: "veh_1",
        vehicleName: "Coach #1 — Luxury AC BharatBenz (Boys Batch)",
        type: "AC Luxury Coach",
        registrationNumber: "AP 21 TZ 4567",
        seatCapacity: 50,
        driverName: "M. Srinivas (Lead Captain)",
        driverPhone: "+91 98480 12345",
        coachInChargeName: "Ramanuja Dasa",
        coachInChargePhone: "+91 95053 77520",
        batchTag: "Batch A (Coach 1 - Boys)",
        amenities: [
          "Full Air-Conditioning with Individual Air Vents",
          "2+2 Pushback Recliner Seats",
          "USB Mobile Charging Ports at Every Seat",
          "Dedicated Kirtan Microphone & PA Sound System",
          "Large Under-Chassis Lockable Luggage Boot",
          "First Aid Kit & Emergency Toolkit",
          "Chilled RO Water Dispenser Onboard",
        ],
        notes: "Devotees seated in Coach 1 will be supervised by Ramanuja Dasa.",
      },
      {
        id: "veh_2",
        vehicleName: "Coach #2 — Luxury AC BharatBenz (Girls & Seniors Batch)",
        type: "AC Luxury Coach",
        registrationNumber: "AP 21 TZ 4568",
        seatCapacity: 50,
        driverName: "K. Narayana (Co-Captain)",
        driverPhone: "+91 98480 67890",
        coachInChargeName: "Damodara Chaitanya Dasa",
        coachInChargePhone: "+91 98765 43210",
        batchTag: "Batch B (Coach 2 - Girls & Seniors)",
        amenities: [
          "Full Air-Conditioning with Individual Air Vents",
          "2+2 Pushback Recliner Seats",
          "USB Mobile Charging Ports at Every Seat",
          "Dedicated Kirtan Microphone & PA Sound System",
          "Large Under-Chassis Lockable Luggage Boot",
          "First Aid Kit & Emergency Toolkit",
          "Chilled RO Water Dispenser Onboard",
        ],
        notes: "Dedicated female mataji coordinators present onboard Coach 2.",
      },
    ],
    stepByStepGuide: [
      {
        id: "step_1",
        stepNumber: 1,
        time: "05:00 AM",
        title: "Reporting at ISKCON Kurnool Main Altar",
        location: "Sri Sri Puri Jagannath Temple, Kurnool",
        description: "Arrive fresh at the temple sanctum. Outstation participants arriving by early morning train/bus can take autos directly to ISKCON Kurnool (10 mins from station).",
        instructions: "Devotees can freshen up in temple guest facilities. Have your digital boarding pass QR ready on phone.",
        googleMapUrl: "https://maps.google.com/?q=ISKCON+Kurnool",
      },
      {
        id: "step_2",
        stepNumber: 2,
        time: "05:15 AM",
        title: "Mangala Harati, Tulasi Puja & Yatra Sankalpa",
        location: "Main Deity Sanctum",
        description: "Seek transcendental blessings from Sri Sri Jagannath, Baladeva, Subhadra Maharani and Srila Prabhupada. Chanting the auspicious Yatra invocation mantras.",
        instructions: "Join collective Japa and receive prasadam breakfast snack pack.",
      },
      {
        id: "step_3",
        stepNumber: 3,
        time: "05:30 AM",
        title: "Luggage Tagging & Token Handover",
        location: "Luggage Desk (Temple Portico)",
        description: "Hand over your main travel suitcase/duffel bag to coach marshals for under-chassis luggage loading. Collect your physical badge and baggage token.",
        instructions: "Ensure your name and phone number tag is tied to your bag. Keep medicines and Japa Mala in your small shoulder bag.",
      },
      {
        id: "step_4",
        stepNumber: 4,
        time: "05:45 AM",
        title: "Board Assigned Coach & Settle in Seat",
        location: "Temple Bus Parking Bay",
        description: "Board Coach 1 (Batch A - Boys) or Coach 2 (Batch B - Girls). Settle into your assigned seat numbers as printed on your digital boarding pass.",
        instructions: "Coordinators will verify attendance and ensure AC & charging ports are operational.",
      },
      {
        id: "step_5",
        stepNumber: 5,
        time: "06:00 AM Sharp",
        title: "Grand Yatra Flag-Off & Mahamantra Chanting",
        location: "Temple Arch Gate (NH-44)",
        description: "Auspicious coconut breaking ceremony at temple gate. Coaches depart onto the highway with joyous Hare Krishna Mahamantra Sankeerthana!",
        instructions: "Strict departure time — buses will not wait past 06:00 AM.",
      },
    ],
  },
  isPublished: true,
  isArchived: false,
};

export const defaultYouthYatra: YouthYatraState = {
  activeEventId: "yatra_2026",
  yatraActive: true,
  events: [defaultYouthYatra2026],
  registrations: [
    {
      id: "YY26-00482",
      eventId: "yatra_2026",
      fullName: "Rahul Kumar",
      age: 22,
      gender: "Male",
      phone: "+91 98765 43210",
      email: "rahul.kumar@gmail.com",
      city: "Kurnool",
      emergencyContactName: "S. Venkat Rao",
      emergencyContactRelation: "Father",
      emergencyContactPhone: "+91 94400 12345",
      accommodationRequired: true,
      foodPreference: "Satvik Prasadam",
      specialRequirements: "Room with fellow college classmates",
      registrationCategory: "College Student",
      paymentMode: "qr",
      paymentStatus: "verified",
      amountPaid: 2500,
      transactionId: "UPI492019482012",
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      read: true,
      status: "confirmed",
      boardingPassId: "BP26-00482",
      batch: "Batch A (Coach 1 - Boys)",
      seatNumber: "24",
      checkedIn: false,
    },
    {
      id: "YY26-00015",
      eventId: "yatra_2026",
      fullName: "Priya Sharma",
      age: 21,
      gender: "Female",
      phone: "+91 98112 34567",
      email: "priya.sharma@gmail.com",
      city: "Hyderabad",
      emergencyContactName: "Ramesh Sharma",
      emergencyContactRelation: "Father",
      emergencyContactPhone: "+91 98112 00000",
      accommodationRequired: true,
      foodPreference: "Satvik Prasadam",
      specialRequirements: "No onion/garlic, front seat if possible",
      registrationCategory: "Working Professional",
      paymentMode: "qr",
      paymentStatus: "verified",
      amountPaid: 2500,
      transactionId: "UPI381029471920",
      registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      read: true,
      status: "confirmed",
      boardingPassId: "BP26-00015",
      batch: "Batch B (Coach 2 - Girls)",
      seatNumber: "08",
      checkedIn: false,
    },
    {
      id: "YY26-00102",
      eventId: "yatra_2026",
      fullName: "Aditya Varma",
      age: 24,
      gender: "Male",
      phone: "+91 95053 11223",
      email: "aditya.varma@gmail.com",
      city: "Nandyal",
      emergencyContactName: "K. Varma",
      emergencyContactRelation: "Brother",
      emergencyContactPhone: "+91 95053 99887",
      accommodationRequired: true,
      foodPreference: "Satvik Prasadam",
      registrationCategory: "Youth Devotee",
      paymentMode: "qr",
      paymentStatus: "verified",
      amountPaid: 2500,
      transactionId: "UPI910283746192",
      registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      read: true,
      status: "confirmed",
      boardingPassId: "BP26-00102",
      batch: "Batch A (Coach 1 - Boys)",
      seatNumber: "12",
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: "IYF Desk Staff",
    },
  ],
};


export type SundayScheduleItem = {
  id: string;
  time: string;
  program: string;
};

export type SundayGalleryItem = {
  id: string;
  url: string;
  label: string;
};

export type SundayLinkButton = {
  id: string;
  label: string;
  url: string;
};

export type SundayActivityItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

export type SundaySponsor = {
  id: string;
  sponsorName: string;
  name?: string;
  familyName?: string;
  familyMembers?: string;
  occasion: string;
  date: string;
  details: string;
  quote?: string;
  blessing?: string;
  active?: boolean;
  images?: string[];
  image?: string;
};

export type SundayData = {
  description: string;
  scheduleTitle: string;
  schedule: SundayScheduleItem[];
  gallery: SundayGalleryItem[];
  visitTitle: string;
  visitDescription: string;
  address: string;
  directionsUrl: string;
  logo: string;
  buttons: SundayLinkButton[];
  timingsImage?: string;
  activities?: SundayActivityItem[];
  sponsors?: SundaySponsor[];
  donationCardTitle?: string;
  donationCardDescription?: string;
  donationCardButtonLabel?: string;
  donationCardButtonUrl?: string;
  donationCardSupportingLine?: string;
  donationCardImage?: string;
  donationCardEnabled?: boolean;
  donationCardAmount?: string;
  tickerText?: string;
  tickerEnabled?: boolean;
};

export const defaultSunday: SundayData = {
  description: "Experience a spiritually uplifting Sunday at ISKCON Kurnool. Join devotees for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome.",
  scheduleTitle: "Weekly Schedule (Every Sunday)",
  tickerText: "",
  tickerEnabled: true,
  sponsors: [
    {
      id: "sp_default_1",
      sponsorName: "Sri XYZ",
      familyName: "& Family",
      occasion: "Auspicious Occasion / General Seva",
      date: "Upcoming Sunday",
      details: "Sunday Feast prasadam distribution lovingly sponsored as seva for the pleasure of Sri Sri Jagannath, Baladeva, Subhadra Maharani and all visiting devotees.",
      active: true,
      images: [
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1609137144813-7d7211bf7fc4?auto=format&fit=crop&w=800&q=80"
      ],
    }
  ],
  schedule: [
    { id: "s1", time: "11:00 AM – 11:30 AM", program: "Hari Nama Sankirtana" },
    { id: "s2", time: "11:30 AM – 12:30 PM", program: "Bhagavad Gita Pravachanam" },
    { id: "s3", time: "After 12:30 PM", program: "Raja Bhoga Arati" },
    { id: "s4", time: "After 12:30 PM", program: "Sudarshana Ashirvadam" },
    { id: "s5", time: "After 12:30 PM", program: "Prasada Vitarana" }
  ],
  gallery: [],
  visitTitle: "Visit ISKCON Kurnool",
  visitDescription: "Experience peace, devotion, and spiritual happiness. We warmly welcome you and your family every Sunday.",
  address: "ISKCON Kurnool\nSri Sri Puri Jagannath Temple\nKurnool, Andhra Pradesh\nIndia",
  directionsUrl: "https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9",
  logo: "",
  buttons: [],
  timingsImage: "",
  activities: [
    {
      id: "a1",
      title: "Hari Nama Sankirtana",
      description: "Congregational chanting of the holy names of Krishna, creating a joyful and purifying spiritual atmosphere.",
      image: ""
    },
    {
      id: "a2",
      title: "Bhagavad Gita Pravachanam",
      description: "Enlightening discourse on the timeless teachings of Bhagavad Gita and their practical application in daily life.",
      image: ""
    },
    {
      id: "a3",
      title: "Raja Bhoga Arati",
      description: "A grand midday arati offering with beautiful lamps, incense, flowers, and ecstatic congregational kirtan.",
      image: ""
    },
    {
      id: "a4",
      title: "Sudarshana Ashirvadam",
      description: "Sacred prayers and blessings of Lord Sudarshana for protection, health, and spiritual well-being.",
      image: ""
    },
    {
      id: "a5",
      title: "Prasada Vitarana",
      description: "A sumptuous, sanctified vegetarian feast (prasadam) served with love to all visiting guests and devotees.",
      image: ""
    }
  ],
  donationCardTitle: "Sponsor Sunday Feast",
  donationCardDescription: "Help us serve a nourishing prasadam feast to devotees and guests every Sunday. Your contribution supports the preparation and serving of prasadam.",
  donationCardButtonLabel: "Sponsor Sunday Feast",
  donationCardButtonUrl: "/donate/sunday-feast",
  donationCardSupportingLine: "Every contribution helps us serve more devotees.",
  donationCardImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
  donationCardEnabled: true,
  donationCardAmount: "5001"
};

export type GoshalaGalleryItem = { id: string; url: string; label: string };
export type GoshalaData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  buttonLabel: string;
  buttonUrl: string;
  gallery: GoshalaGalleryItem[];
  aboutImage: string;
};

export const defaultGoshala: GoshalaData = {
  eyebrow: "Our Goshala",
  title: "Goshala Seva",
  subtitle: "Maintained by ISKCON Kurnool & Narsaraopeta",
  aboutText1: "In the Vedic tradition, the cow is regarded as a mother a source of nourishment, gentleness, and grace. As part of our seva to Krishna and His creation, ISKCON Kurnool proudly maintains a Goshala at ISKCON Narsaraopeta, where cows are cared for with love, given proper shelter, feed, and medical attention, and allowed to live out their natural lives in peace.",
  aboutText2: "This Goshala is not just a shelter it is an extension of our devotional service, rooted in the understanding that caring for cows is caring for Krishna's own beloved companions. Devotees and well-wishers are welcome to visit, participate in seva, or contribute towards the Goshala's upkeep.",
  aboutText3: "We invite you to come see this seva in person and experience the quiet devotion behind it.",
  buttonLabel: "Visit Goshala",
  buttonUrl: "https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9",
  gallery: [
    { id: "g1", url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80", label: "Mother Cow at the Goshala" },
    { id: "g2", url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80", label: "Caring and feeding the cows" },
    { id: "g3", url: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80", label: "Fresh fodder for the cows" }
  ],
  aboutImage: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80",
};

export type InstagramReel = { id: string; url: string };
export type InstagramData = {
  username: string;
  fullName: string;
  bio: string;
  hashtags: string;
  websiteUrl: string;
  reels: InstagramReel[];
};

export const defaultInstagram: InstagramData = {
  username: "iskcon_kurnool",
  fullName: "ISKCON KURNOOL OFFICIAL",
  bio: "Hare Krishna! Welcome to the official page of ISKCON Kurnool, the abode of Sri Sri Jagannatha, Baladeva, and Subhadra Devi.",
  hashtags: "#ISKCONKurnool #JagannathSeva #DailyDarshan",
  websiteUrl: "www.iskconkurnool.com",
  reels: [
    { id: "r1", url: "https://www.instagram.com/reel/C8qK7gBvyjN/" },
    { id: "r2", url: "https://www.instagram.com/reel/C8S6u_ivS1u/" },
    { id: "r3", url: "https://www.instagram.com/reel/C72x6yAvt5V/" },
    { id: "r4", url: "https://www.instagram.com/reel/C7rV6oIvF2N/" },
    { id: "r5", url: "https://www.instagram.com/reel/C7UTd14PRyY/" },
    { id: "r6", url: "https://www.instagram.com/reel/C7B0Pievj2K/" },
    { id: "r7", url: "https://www.instagram.com/reel/C6p47vIvD1u/" },
    { id: "r8", url: "https://www.instagram.com/reel/C6I5q_iv2NL/" }
  ]
};

export type HeroBannersData = {
  aboutKurnool: string;
  aboutFounder: string;
  aboutIskcon: string;
  aboutMission: string;
  connect: string;
  courses: string;
  festivals: string;
  upcomingFestivals: string;
  gallery: string;
  goshala: string;
  prahladaBadi: string;
  sunday: string;
  harinama: string;
  youth: string;
  donate: string;
  ekadashi: string;
  shop?: string;
  temple: string;
  socialMedia: string;
  darshan: string;
};

export const defaultHeroBanners: HeroBannersData = {
  aboutKurnool: "",
  aboutFounder: "",
  aboutIskcon: "",
  aboutMission: "",
  connect: "",
  courses: "",
  festivals: "",
  upcomingFestivals: "",
  gallery: "",
  goshala: "",
  prahladaBadi: "",
  sunday: "",
  harinama: "",
  youth: "",
  donate: "",
  ekadashi: "",
  shop: "",
  temple: "",
  socialMedia: "",
  darshan: "",
};

export type EkadashiCalendarItem = {
  id: string;
  name: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Day name e.g. Sunday, Monday */
  day: string;
  /** e.g. Gaura Paksha / Krishna Paksha */
  paksha?: string;
  /** Vaishnava Month e.g. Chaitra, Damodara, Kartika, Margashirsha */
  vaishnavaMonth?: string;
  /** Tithi Start e.g. "05:14 AM, 14 Mar 2026" */
  tithiStart: string;
  /** Tithi End e.g. "03:42 AM, 15 Mar 2026" */
  tithiEnd: string;
  /** Dwadashi Parana Date e.g. "16 Mar 2026" */
  paranaDate: string;
  /** Parana Window Start Time e.g. "06:28 AM" */
  paranaStartTime: string;
  /** Parana Window End Time e.g. "10:18 AM" */
  paranaEndTime: string;
  /** Fasting category e.g. "Nirjala (Waterless) Fast", "Phalahari (Fruits & Milk)", "Sajala Fast", "Complete Fast" */
  fastingType: string;
  /** Spiritual Significance, Glories & Purana dialogues */
  description: string;
  /** Sacred Deity / Ekadashi Image Banner */
  image?: string;
  /** Special devotee instructions */
  specialInstructions?: string;
  /** Published status */
  isPublished: boolean;
  /** Highlight as featured */
  isFeatured?: boolean;
  order?: number;
};

export type EkadashiScheduleItem = {
  id: string;
  time: string;
  title: string;
  description: string;
  period: "Morning" | "Afternoon" | "Evening" | "Night";
  iconName: string;
  highlight: boolean;
  order: number;
};

export const defaultEkadashiTempleSchedule: EkadashiScheduleItem[] = [
  {
    id: "ek_sch_1",
    time: "04:30 AM – 05:00 AM",
    title: "Subha Mangala Harati & Tulsi Puja",
    description: "Start the auspicious Ekadashi day with Mangala Harati, Nrsimha prayers, and Sri Tulsi Parikrama.",
    period: "Morning",
    iconName: "sunrise",
    highlight: true,
    order: 1,
  },
  {
    id: "ek_sch_2",
    time: "05:15 AM – 07:15 AM",
    title: "Akhanda Harinama Japa Meditation",
    description: "Devotees gather for congregational chanting of the holy Hare Krishna Maha Mantra in the sanctum.",
    period: "Morning",
    iconName: "music",
    highlight: false,
    order: 2,
  },
  {
    id: "ek_sch_3",
    time: "07:30 AM – 08:15 AM",
    title: "Deity Sringara Darshan & Srila Prabhupada Guru Puja",
    description: "Grand morning darshan of Sri Sri Jagannath Baladev Subhadra in royal Ekadashi attire.",
    period: "Morning",
    iconName: "sun",
    highlight: true,
    order: 3,
  },
  {
    id: "ek_sch_4",
    time: "08:15 AM – 09:30 AM",
    title: "Special Srimad Bhagavatam & Ekadashi Katha",
    description: "Transcendental discourse narrating the scriptural glories (Mahatmya) of the day's Ekadashi vrata.",
    period: "Morning",
    iconName: "book",
    highlight: false,
    order: 4,
  },
  {
    id: "ek_sch_5",
    time: "12:00 PM – 12:30 PM",
    title: "Rajbhoga Harati & Phalahari Bhoga Offering",
    description: "Offering 56 pure satvik non-grain delicacies to Their Lordships followed by afternoon darshan.",
    period: "Afternoon",
    iconName: "utensils",
    highlight: false,
    order: 5,
  },
  {
    id: "ek_sch_6",
    time: "06:30 PM – 07:15 PM",
    title: "Sandhya Harati & Gauranga Kirtan",
    description: "Soulful evening worship and ecstatic kirtan with mridangas and karatalas filling the temple.",
    period: "Evening",
    iconName: "sunset",
    highlight: true,
    order: 6,
  },
  {
    id: "ek_sch_7",
    time: "07:15 PM – 08:30 PM",
    title: "Bhagavad Gita Discourse & Bhajan Sandhya",
    description: "Deep spiritual insights from the Gita and melodious Vaishnava bhajans glorifying Sri Hari.",
    period: "Evening",
    iconName: "book",
    highlight: false,
    order: 7,
  },
  {
    id: "ek_sch_8",
    time: "08:30 PM – 09:00 PM",
    title: "Shayana Harati & Ekadashi Phalahari Prasadam",
    description: "Concluding night darshan and distribution of delicious, sanctified Ekadashi phalahari prasadam.",
    period: "Night",
    iconName: "moon",
    highlight: true,
    order: 8,
  },
];

export type EkadashiData = {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  imageQuote: string;
  avoidTitle: string;
  avoidItems: string[];
  permitTitle: string;
  permitItems: string[];
  tulsiTitle: string;
  tulsiBody: string;
  purposeTitle: string;
  purposeBody: string;
  morningTitle: string;
  morningSteps: string[];
  mantra: string;
  warningTitle: string;
  warningBody: string;
  dwadashiTitle: string;
  dwadashiBody: string;
  dwadashiNote: string;
  templeScheduleTitle: string;
  templeScheduleSubtitle: string;
  templeScheduleNotice: string;
  templeSchedule: EkadashiScheduleItem[];
  calendar: EkadashiCalendarItem[];
};

export const defaultEkadashiCalendar: EkadashiCalendarItem[] = [
  {
    id: "ek_papamochani_2026",
    name: "Papamochani Ekadashi",
    date: "2026-03-15",
    day: "Sunday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Govinda (Chaitra)",
    tithiStart: "05:14 AM, 14 Mar 2026",
    tithiEnd: "03:42 AM, 15 Mar 2026",
    paranaDate: "16 Mar 2026",
    paranaStartTime: "06:28 AM",
    paranaEndTime: "10:18 AM",
    fastingType: "Phalahari Fast (Fruits & Milk)",
    description: "Papamochani Ekadashi dissolves all past sinful reactions and purifies the devotee's consciousness, awarding spiritual liberation and unalloyed devotion to Lord Sri Hari.",
    specialInstructions: "Do not pluck Tulsi leaves on Ekadashi or Dwadashi. Pick Tulsi the previous day. Break fast on Dwadashi within the Parana window.",
    isPublished: true,
    isFeatured: false,
    order: 1
  },
  {
    id: "ek_kamada_2026",
    name: "Kamada Ekadashi",
    date: "2026-03-29",
    day: "Sunday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Vishnu (Chaitra)",
    tithiStart: "07:30 PM, 28 Mar 2026",
    tithiEnd: "06:15 PM, 29 Mar 2026",
    paranaDate: "30 Mar 2026",
    paranaStartTime: "06:18 AM",
    paranaEndTime: "10:12 AM",
    fastingType: "Phalahari Fast",
    description: "The fulfiller of all pure spiritual desires. In the Brahmavairvarta Purana, Lord Krishna explains to Maharaja Yudhishthira how this fast removes all curses.",
    specialInstructions: "Offer fragrant flowers, tulsi manjaris picked on the previous day, and engage in continuous Nama Japa.",
    isPublished: true,
    isFeatured: false,
    order: 2
  },
  {
    id: "ek_varuthini_2026",
    name: "Varuthini Ekadashi",
    date: "2026-04-13",
    day: "Monday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Madhusudana (Vaisakha)",
    tithiStart: "01:25 AM, 13 Apr 2026",
    tithiEnd: "11:45 PM, 13 Apr 2026",
    paranaDate: "14 Apr 2026",
    paranaStartTime: "06:05 AM",
    paranaEndTime: "08:45 AM",
    fastingType: "Phalahari Fast",
    description: "Varuthini means 'protected by spiritual armor'. Observance protects the soul in this world and the next, turning fortune towards Krishna prema.",
    specialInstructions: "Break fast within the morning Dwadashi tithi with charanamrita or fruits.",
    isPublished: true,
    isFeatured: false,
    order: 3
  },
  {
    id: "ek_mohini_2026",
    name: "Mohini Ekadashi",
    date: "2026-04-27",
    day: "Monday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Madhusudana (Vaisakha)",
    tithiStart: "08:10 AM, 27 Apr 2026",
    tithiEnd: "06:50 AM, 28 Apr 2026",
    paranaDate: "28 Apr 2026",
    paranaStartTime: "06:45 AM",
    paranaEndTime: "10:05 AM",
    fastingType: "Phalahari Fast",
    description: "Celebrates Lord Vishnu assuming the captivating Mohini Murti. Removes illusions of Maya and grants supreme peace of mind.",
    specialInstructions: "Special worship of Sri Sri Radha Krishna with sandal paste (Chandan Yatra).",
    isPublished: true,
    isFeatured: false,
    order: 4
  },
  {
    id: "ek_apara_2026",
    name: "Apara Ekadashi",
    date: "2026-05-13",
    day: "Wednesday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Trivikrama (Jyeshtha)",
    tithiStart: "10:30 PM, 12 May 2026",
    tithiEnd: "08:45 PM, 13 May 2026",
    paranaDate: "14 May 2026",
    paranaStartTime: "05:48 AM",
    paranaEndTime: "09:55 AM",
    fastingType: "Phalahari Fast",
    description: "Apara means 'limitless'. The spiritual merit earned on this sacred day is boundless, erasing even the heaviest karma.",
    specialInstructions: "Chant at least 25 or 32 rounds of the Hare Krishna Maha Mantra.",
    isPublished: true,
    isFeatured: false,
    order: 5
  },
  {
    id: "ek_nirjala_2026",
    name: "Pandava Nirjala Ekadashi (Bhima Ekadashi)",
    date: "2026-05-26",
    day: "Tuesday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Trivikrama (Jyeshtha)",
    tithiStart: "04:15 PM, 25 May 2026",
    tithiEnd: "02:10 PM, 26 May 2026",
    paranaDate: "27 May 2026",
    paranaStartTime: "05:45 AM",
    paranaEndTime: "10:00 AM",
    fastingType: "Strict Nirjala (Total Fast without Water)",
    description: "The crown jewel of all Ekadashis. Established by Srila Vyasadeva for Bhimasena. Fasting completely without even a single drop of water on this day bestows the spiritual benefit of all 24 Ekadashis of the year.",
    specialInstructions: "Strict fast from sunrise to next day sunrise without water. If physically unable, one may take water or fruit juice. Parana is broken by drinking sacred charanamrita or water first, followed by prasadam.",
    isPublished: true,
    isFeatured: true,
    order: 6
  },
  {
    id: "ek_yogini_2026",
    name: "Yogini Ekadashi",
    date: "2026-06-11",
    day: "Thursday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Vamana (Ashadha)",
    tithiStart: "08:15 AM, 11 Jun 2026",
    tithiEnd: "06:30 AM, 12 Jun 2026",
    paranaDate: "12 Jun 2026",
    paranaStartTime: "06:30 AM",
    paranaEndTime: "09:58 AM",
    fastingType: "Phalahari Fast",
    description: "Purifies from bodily afflictions, cleanses the subtle heart, and connects the practitioner with the supreme yoga of Krishna bhakti.",
    specialInstructions: "Honor pure fruit offerings and perform Harinama Sankirtana.",
    isPublished: true,
    isFeatured: false,
    order: 7
  },
  {
    id: "ek_shayani_2026",
    name: "Devashayani Ekadashi (Chaturmasya Begins)",
    date: "2026-06-25",
    day: "Thursday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Vamana (Ashadha)",
    tithiStart: "02:40 PM, 24 Jun 2026",
    tithiEnd: "12:15 PM, 25 Jun 2026",
    paranaDate: "26 Jun 2026",
    paranaStartTime: "05:48 AM",
    paranaEndTime: "09:52 AM",
    fastingType: "Phalahari Fast",
    description: "Lord Sri Hari enters His yogic sleep (Yoga Nidra) on the milk ocean upon Ananta Shesha. Marks the auspicious inauguration of the 4-month Chaturmasya period.",
    specialInstructions: "Devotees take vows of increased sadhana, extra japa rounds, and scripture reading for the four months of Chaturmasya.",
    isPublished: true,
    isFeatured: true,
    order: 8
  },
  {
    id: "ek_kamika_2026",
    name: "Kamika Ekadashi",
    date: "2026-07-10",
    day: "Friday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Sridhara (Shravana)",
    tithiStart: "07:15 PM, 09 Jul 2026",
    tithiEnd: "05:40 PM, 10 Jul 2026",
    paranaDate: "11 Jul 2026",
    paranaStartTime: "05:54 AM",
    paranaEndTime: "10:04 AM",
    fastingType: "Phalahari Fast",
    description: "Observance of Kamika Ekadashi yields greater spiritual merit than visiting all holy tirthas. Lord Krishna states that offering Tulsi on this day pleases Him immensely.",
    specialInstructions: "Offer ghee lamps and Tulsi picked on Dashami to Sri Krishna.",
    isPublished: true,
    isFeatured: false,
    order: 9
  },
  {
    id: "ek_pavitra_2026",
    name: "Pavitropana (Pavitra) Ekadashi",
    date: "2026-07-24",
    day: "Friday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Sridhara (Shravana)",
    tithiStart: "11:20 PM, 23 Jul 2026",
    tithiEnd: "09:45 PM, 24 Jul 2026",
    paranaDate: "25 Jul 2026",
    paranaStartTime: "05:58 AM",
    paranaEndTime: "10:07 AM",
    fastingType: "Phalahari Fast",
    description: "Bestows auspicious children, peace in family life, and removes distress. Devotees offer silk threads and sacred garlands (Pavitra) to the Deities.",
    specialInstructions: "Jhulan Yatra festival prayers and offerings to Sri Sri Radha Govinda.",
    isPublished: true,
    isFeatured: false,
    order: 10
  },
  {
    id: "ek_annada_2026",
    name: "Annada (Aja) Ekadashi",
    date: "2026-08-09",
    day: "Sunday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Hrishikesha (Bhadrapada)",
    tithiStart: "08:50 AM, 08 Aug 2026",
    tithiEnd: "06:45 AM, 09 Aug 2026",
    paranaDate: "10 Aug 2026",
    paranaStartTime: "06:03 AM",
    paranaEndTime: "10:08 AM",
    fastingType: "Phalahari Fast",
    description: "King Harishchandra regained his lost kingdom and truthfulness by the mercy of this holy fast as instructed by sage Gautama.",
    specialInstructions: "Meditate on the transcendental truth and practice humility.",
    isPublished: true,
    isFeatured: false,
    order: 11
  },
  {
    id: "ek_parsva_2026",
    name: "Parsva Ekadashi (Vamana / Parivartini)",
    date: "2026-08-23",
    day: "Sunday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Hrishikesha (Bhadrapada)",
    tithiStart: "05:35 AM, 23 Aug 2026",
    tithiEnd: "04:10 AM, 24 Aug 2026",
    paranaDate: "24 Aug 2026",
    paranaStartTime: "06:07 AM",
    paranaEndTime: "10:09 AM",
    fastingType: "Phalahari Fast",
    description: "Lord Vishnu turns from His left side to His right side while resting on Ananta Shesha. Commemorates the divine appearance of Lord Vamanadeva.",
    specialInstructions: "Offer yogurt, non-grain bhoga, and yellow flowers to Lord Vamanadeva.",
    isPublished: true,
    isFeatured: true,
    order: 12
  },
  {
    id: "ek_indira_2026",
    name: "Indira Ekadashi",
    date: "2026-09-07",
    day: "Monday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Padmanabha (Ashvina)",
    tithiStart: "10:15 PM, 06 Sep 2026",
    tithiEnd: "08:40 PM, 07 Sep 2026",
    paranaDate: "08 Sep 2026",
    paranaStartTime: "06:10 AM",
    paranaEndTime: "10:08 AM",
    fastingType: "Phalahari Fast",
    description: "Occurring during Pitru Paksha, this sacred fast delivers ancestors and forefathers from lower planetary realms to the spiritual abode of Vaikuntha.",
    specialInstructions: "Offer heartfelt prayers for the spiritual deliverance of all departed ancestors to Lord Damodara.",
    isPublished: true,
    isFeatured: false,
    order: 13
  },
  {
    id: "ek_pasankusa_2026",
    name: "Pasankusa Ekadashi",
    date: "2026-09-22",
    day: "Tuesday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Padmanabha (Ashvina)",
    tithiStart: "09:20 AM, 21 Sep 2026",
    tithiEnd: "07:45 AM, 22 Sep 2026",
    paranaDate: "23 Sep 2026",
    paranaStartTime: "06:12 AM",
    paranaEndTime: "09:40 AM",
    fastingType: "Phalahari Fast",
    description: "Pasankusa acts as an elephant goad (ankusha) that tames and controls the wild elephant of material desires, awakening pure love of God.",
    specialInstructions: "Perform heartfelt japa and read Bhagavad Gita Chapter 9.",
    isPublished: true,
    isFeatured: false,
    order: 14
  },
  {
    id: "ek_rama_2026",
    name: "Rama Ekadashi",
    date: "2026-10-06",
    day: "Tuesday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Damodara (Kartika)",
    tithiStart: "02:30 PM, 05 Oct 2026",
    tithiEnd: "12:45 PM, 06 Oct 2026",
    paranaDate: "07 Oct 2026",
    paranaStartTime: "06:14 AM",
    paranaEndTime: "10:07 AM",
    fastingType: "Phalahari Fast",
    description: "Named after Rama (Goddess Lakshmi), this sacred Kartik Ekadashi unlocks boundless spiritual fortune and unalloyed devotion to Lord Yashoda-Damodara.",
    specialInstructions: "Kartika Damodara deepa (ghee lamp) offering in the evening while singing Sri Damodarashtakam.",
    isPublished: true,
    isFeatured: false,
    order: 15
  },
  {
    id: "ek_utthana_2026",
    name: "Utthana (Prabodhini) Ekadashi",
    date: "2026-10-21",
    day: "Wednesday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Damodara (Kartika)",
    tithiStart: "06:45 PM, 20 Oct 2026",
    tithiEnd: "04:50 PM, 21 Oct 2026",
    paranaDate: "22 Oct 2026",
    paranaStartTime: "06:17 AM",
    paranaEndTime: "10:08 AM",
    fastingType: "Phalahari Fast / Bhishma Panchaka Fast",
    description: "Lord Sri Hari awakens from His 4-month cosmic slumber. Marks the grand culmination of Chaturmasya and the start of the auspicious 5-day Bhishma Panchaka vrata.",
    specialInstructions: "Tulsi Vivaha (marriage ceremony of Tulsi Maharani and Sri Shaligram) is joyfully performed. Devotees fast and offer lamps.",
    isPublished: true,
    isFeatured: true,
    order: 16
  },
  {
    id: "ek_utpanna_2026",
    name: "Utpanna Ekadashi",
    date: "2026-11-05",
    day: "Thursday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Keshava (Margashirsha)",
    tithiStart: "05:15 AM, 05 Nov 2026",
    tithiEnd: "03:40 AM, 06 Nov 2026",
    paranaDate: "06 Nov 2026",
    paranaStartTime: "06:23 AM",
    paranaEndTime: "10:11 AM",
    fastingType: "Phalahari Fast",
    description: "The very birth and origin of Ekadashi Devi! She appeared from the body of Lord Vishnu to slay the demon Mura. Lord Vishnu granted her the boon that anyone who fasts on her day will be freed from all sins.",
    specialInstructions: "Listen to the transcendental origin story of Ekadashi Devi and chant with devotion.",
    isPublished: true,
    isFeatured: false,
    order: 17
  },
  {
    id: "ek_mokshada_2026",
    name: "Mokshada Ekadashi (Gita Jayanti / Vaikuntha Ekadashi)",
    date: "2026-11-20",
    day: "Friday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Keshava (Margashirsha)",
    tithiStart: "04:20 PM, 19 Nov 2026",
    tithiEnd: "02:30 PM, 20 Nov 2026",
    paranaDate: "21 Nov 2026",
    paranaStartTime: "06:29 AM",
    paranaEndTime: "10:16 AM",
    fastingType: "Phalahari Fast / Nirjala",
    description: "The glorious day Lord Sri Krishna spoke the Bhagavad Gita to Arjuna on the holy battlefield of Kurukshetra. The gates of Vaikuntha are wide open to receive devotional prayers.",
    specialInstructions: "Recitation of all 18 Chapters of the Bhagavad Gita and Vaikuntha Dwara darshan at the temple.",
    isPublished: true,
    isFeatured: true,
    order: 18
  },
  {
    id: "ek_saphala_2026",
    name: "Saphala Ekadashi",
    date: "2026-12-04",
    day: "Friday",
    paksha: "Krishna Paksha",
    vaishnavaMonth: "Narayana (Pausha)",
    tithiStart: "07:30 PM, 03 Dec 2026",
    tithiEnd: "05:40 PM, 04 Dec 2026",
    paranaDate: "05 Dec 2026",
    paranaStartTime: "06:36 AM",
    paranaEndTime: "10:22 AM",
    fastingType: "Phalahari Fast",
    description: "Saphala means 'fruitful & successful'. It turns every endeavor of devotional service fruitful, transforming lives in accordance with Krishna's divine will.",
    specialInstructions: "Offer seasonal fruits, nuts, and keep night vigil (Jagaran) in kirtan.",
    isPublished: true,
    isFeatured: false,
    order: 19
  },
  {
    id: "ek_putrada_2026",
    name: "Putrada Ekadashi (Pausha)",
    date: "2026-12-20",
    day: "Sunday",
    paksha: "Gaura Paksha",
    vaishnavaMonth: "Narayana (Pausha)",
    tithiStart: "12:15 PM, 19 Dec 2026",
    tithiEnd: "10:10 AM, 20 Dec 2026",
    paranaDate: "21 Dec 2026",
    paranaStartTime: "06:44 AM",
    paranaEndTime: "10:29 AM",
    fastingType: "Phalahari Fast",
    description: "Grants noble progeny, removes family hardships, and bestows the supreme blessing of pure love for Lord Narayana.",
    specialInstructions: "Family prayers and archana to Sri Sri Jagannath Baladev Subhadra.",
    isPublished: true,
    isFeatured: false,
    order: 20
  }
];

export const defaultEkadashi: EkadashiData = {
  badge: "Sacred Observance",
  title: "Ekadashi — The Mother of Devotion",
  subtitle: "Rules, Spiritual Guidelines & Dynamic Vaishnava Calendar",
  image: "",
  imageQuote: "Fasting on Ekadashi is dear to Lord Vishnu.",
  avoidTitle: "Avoid on Ekadashi",
  avoidItems: [
    "Grains (rice, wheat, barley, oats)",
    "Lentils, pulses, chickpeas, beans, peas",
    "Corn, mustard seeds, fenugreek",
    "Certain vegetables (ridge gourd, loki, eggplants)",
    "Non-pure spices or premade spice mixes with grain starch",
  ],
  permitTitle: "Permitted on Ekadashi",
  permitItems: [
    "Fresh seasonal fruits & pure fruit juices",
    "Milk, curd/yogurt, paneer, and pure ghee",
    "Dry fruits (cashews, almonds, pistachios, raisins, walnuts)",
    "Root vegetables (potatoes, sweet potatoes, colocasia/arbi)",
    "Sabudana (sago), Samalu / Sama rice (barnyard millet), buckwheat (kuttu), water chestnut flour (singhara)",
    "Pure rock salt (sendha namak), black pepper, cumin",
  ],
  tulsiTitle: "Crucial Tulsi Seva Rule",
  tulsiBody:
    "Do not pluck Tulsi leaves on Ekadashi or Dwadashi. If Tulsi is required for worship, it should be picked the previous day.",
  purposeTitle: "Purpose of Ekadashi",
  purposeBody:
    "Ekadashi is a day to minimize bodily needs and increase our hearing, chanting, and remembrance of the Holy Name of the Lord. By simplifying eating and daily activity, the mind becomes more focused on devotional service and the glories of Krishna.",
  morningTitle: "Morning Practice",
  morningSteps: [
    "1. Worship: Worship the deity of Krishna with devotion.",
    "2. Offer: Offer incense, a lamp, Tulsi picked the previous day, fruits, and flowers.",
    "3. Pray: Pray sincerely for the mercy of Lord Vishnu.",
  ],
  mantra:
    "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Rama Hare Rama, Rama Rama Hare Hare",
  warningTitle: "Strictly Avoid",
  warningBody:
    "Meat, fish, eggs, mushrooms, alcohol, onion, garlic, intoxicants such as cigarettes and tobacco, and other tamasic substances should be strictly avoided—not only on Ekadashi, but as part of a life of pure devotional service.",
  dwadashiTitle: "Dwadashi — Breaking the Fast",
  dwadashiBody:
    "On Dwadashi, the day after Ekadashi: Wake early, bathe and prepare for worship, worship Lord Vishnu, and break the fast during the prescribed Parana time.",
  dwadashiNote:
    "Important: Always break the Ekadashi fast during the prescribed Parana window on Dwadashi morning to receive the full spiritual benefit of the vrata.",
  templeScheduleTitle: "Special Ekadashi Temple Schedule",
  templeScheduleSubtitle: "Join us at Sri Sri Puri Jagannath Temple, ISKCON Kurnool for all-day kirtan, discourses, and phalahari prasadam.",
  templeScheduleNotice: "Devotees are cordially invited to participate in the transcendental Mangala Harati, Akhanda Japa, and Evening Bhajan Sandhya.",
  templeSchedule: defaultEkadashiTempleSchedule,
  calendar: defaultEkadashiCalendar,
};

export type GitaWhyCard = {
  title: string;
  desc: string;
  iconName: string;
};

export type GitaCourseData = {
  heroImage: string;
  gitaAboutImage: string;
  gitaWhyImage: string;
  eyebrow: string;
  title: string;
  tagline: string;
  badges: string[];
  registerUrl: string;
  dateRange: string;
  time: string;
  mode: string;
  fee: string;
  contact: string;
  startLabel: string;
  endLabel: string;
  whyCards?: GitaWhyCard[];
  status?: "Coming Soon" | "Closed" | "Registrations Opened";
};

export const defaultGitaCourse: GitaCourseData = {
  status: "Registrations Opened",
  heroImage: "",
  gitaAboutImage: "",
  gitaWhyImage: "",
  eyebrow: "ISKCON Kurnool — Bhagavad Gita Course",
  title: "18 Days, 18 Chapters",
  tagline: "A complete journey through the Bhagavad Gita, one chapter at a time",
  badges: ["Free", "Online", "Daily"],
  registerUrl: "",
  dateRange: "July 14 – 31, 2026",
  time: "7:30 PM Daily",
  mode: "Online",
  fee: "Free",
  contact: "+91 8500789687",
  startLabel: "July 14, 2026",
  endLabel: "July 31, 2026",
  whyCards: [
    { iconName: "book-open", title: "Complete Gita", desc: "All 18 chapters, start to finish — nothing skipped." },
    { iconName: "languages", title: "Plain Telugu", desc: "Explained simply, in Telugu, with real-life context." },
    { iconName: "timer", title: "30–40 Min a Day", desc: "Fits into an evening. No long-term commitment beyond 18 days." },
    { iconName: "sparkles", title: "ISKCON Guidance", desc: "Led by ISKCON Kurnool teachers, rooted in tradition." },
  ],
};

export type DailyClass = {
  id: string;
  thumbnail: string;
  title: string;
  description?: string;
  /** ISO datetime — class start (interpreted as IST when entered) */
  startAt: string;
  /** Duration minutes */
  durationMin: number;
  language: string;
  joinUrl: string;
  active: boolean;
  everyday?: boolean;
  startTimeStr?: string;
  endTimeStr?: string;
};

export type PreviewLead = {
  id: string;
  name: string;
  phone: string;
  date: string;
  read?: boolean;
};

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  youtube: string;
  mapEmbed: string;
  googleMapUrl?: string;
  address: string;
  footer: string;
  logo: string;
  facebook?: string;
  twitter?: string;
  welcomeImage?: string;
  quickDonateImage?: string;
  launchPageActive?: boolean;
  isLaunchingSequence?: boolean;
  lastLaunchedAt?: number;
  enableLaunchButton?: boolean;
  enableLaunchTimer?: boolean;
  launchDate?: string;
  launchBypassCode?: string;
  liveStreamLink?: string;
  liveStreamTitle?: string;
  previewVideoUrl?: string;
  previewVideoTitle?: string;
  previewVideoSubtitle?: string;
};

export type ThemeSettings = {
  primary: string;
  secondary: string;
  accent: string;
};

export type ContactEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
};

export type DonationEntry = {
  id: string;
  donorName: string;
  email: string;
  phone: string;
  pan?: string;
  purpose?: string;
  sevaTitle: string;
  optionLabel?: string;
  amount: number;
  status: "initiated" | "paid" | "failed";
  paymentRef?: string;
  screenshotUrl?: string;
  date: string;
};


export type TempleScheduleItem = {
  id: string;
  name: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  iconName: string;
  order: number;
};

export const defaultTempleSchedule: TempleScheduleItem[] = [
  { id: "ts1", name: "Subha Mangala Harati", time: "4:30 AM", period: "Morning", iconName: "sunrise", order: 1 },
  { id: "ts2", name: "Harinama Japa", time: "5:15 AM – 7:00 AM", period: "Morning", iconName: "sunrise", order: 2 },
  { id: "ts3", name: "Darshan Arati", time: "7:30 AM", period: "Morning", iconName: "sunrise", order: 3 },
  { id: "ts4", name: "Srimad Bhagavatam Class", time: "8:15 AM", period: "Morning", iconName: "sunrise", order: 4 },
  { id: "ts5", name: "Rajbhoga Arati", time: "12:00 PM", period: "Afternoon", iconName: "sun", order: 5 },
  { id: "ts6", name: "Gaura Arati", time: "6:30 PM", period: "Evening", iconName: "sunset", order: 6 },
];

export type ReceiptSettings = {
  templeName: string;
  deityName: string;
  address: string;
  phone: string;
  email: string;
  taxExemptionText: string;
  taxRegNumber: string;
  receiptTitle: string;
  blessingMessage: string;
  footerNotes: string;
  
  useNavLogo: boolean;
  customReceiptLogo: string;
  
  signatoryName: string;
  signatoryTitle: string;
  signatoryOrg: string;
  signatureImage: string;
  showSeal: boolean;
  sealImage: string;
  
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerBgStyle: "solid" | "gradient" | "ornate";
  fontFamily: "Inter" | "Cinzel" | "Outfit" | "Playfair" | "Geist";
  borderStyle: "royal_gold" | "classic_double" | "modern_clean" | "temple_arch";
  watermarkText: string;
  showWatermark: boolean;
};

export const defaultReceiptSettings: ReceiptSettings = {
  templeName: "ISKCON KURNOOL",
  deityName: "Sri Sri Jagannath Baladev Subhadra Temple",
  address: "Sri Sri Puri Jagannath Temple, Kurnool, Andhra Pradesh, India",
  phone: "+91 95053 77520",
  email: "iskconkurnool@gmail.com",
  taxExemptionText: "Eligible for 80G Income Tax Exemption · 100% Tax Deductible",
  taxRegNumber: "AAATI1234F / 80G / 2024-25",
  receiptTitle: "OFFICIAL DONATION RECEIPT",
  blessingMessage: "May Lord Sri Jagannath shower eternal blessings upon you and your family.",
  footerNotes: "All donations to ISKCON Kurnool are eligible for 80G tax exemption. This is a computer-generated official receipt.",
  
  useNavLogo: true,
  customReceiptLogo: "",
  
  signatoryName: "Vaishnava Krupa Das",
  signatoryTitle: "Temple President / Authorised Signatory",
  signatoryOrg: "ISKCON Kurnool",
  signatureImage: "",
  showSeal: true,
  sealImage: "",
  
  primaryColor: "#5b2c9b",
  secondaryColor: "#d97706",
  accentColor: "#059669",
  backgroundColor: "#ffffff",
  headerBgStyle: "gradient",
  fontFamily: "Inter",
  borderStyle: "royal_gold",
  watermarkText: "ISKCON KURNOOL",
  showWatermark: true,
};

export type FeaturePopupData = {
  active: boolean;
  image: string;
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
};

export const defaultFeaturePopup: FeaturePopupData = {
  active: false,
  image: "",
  title: "Special Announcement",
  content: "Welcome to ISKCON Kurnool Digital Temple. Stay connected for daily darshan, upcoming festivals, and spiritual discourses.",
  buttonText: "Learn More",
  buttonLink: "",
};

export type PaymentPageField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "pan";
  required: boolean;
  options?: string[];
};

export type PaymentPagePriceField = {
  id: string;
  label: string;
  amount: number;
  isCustom?: boolean;
};

export type PaymentPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerImage?: string;
  logoUrl?: string;
  isPrivate: boolean;
  active: boolean;
  enableGoalTracker?: boolean;
  goalAmount?: number;
  raisedAmount?: number;
  pricingType: "fixed" | "preset" | "custom";
  fixedAmount?: number;
  presetPrices?: PaymentPagePriceField[];
  contactEmail?: string;
  contactPhone?: string;
  termsAndConditions?: string;
  fields: PaymentPageField[];
  razorpayPageUrl?: string;
  bgStyle?: "gradient" | "geometric" | "mandala" | "minimal";
  layoutTheme?: "split" | "royal" | "centered";
};

export type PaymentRecord = {
  id: string;
  paymentId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  baseAmount?: number;
  platformFee?: number;
  currency?: string;
  category: string;
  sevaOrPageTitle?: string;
  date: string;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  paymentMethod?: string;
  screenshotUrl?: string;
  notes?: string;
  address?: string;
  panNumber?: string;
  taxReceiptRequested?: boolean;
  read?: boolean;
};

export const defaultPaymentRecords: PaymentRecord[] = [
  {
    id: "rec_1",
    paymentId: "pay_Pkl983210x",
    donorName: "Radha Raman Das",
    donorEmail: "radharaman@example.com",
    donorPhone: "+91 98765 12345",
    amount: 5555,
    currency: "INR",
    category: "Sharandev Seva",
    sevaOrPageTitle: "Sharandev Seva",
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "Completed",
    paymentMethod: "Razorpay",
    notes: "Nitya Annadanam contribution",
    taxReceiptRequested: true,
  },
  {
    id: "rec_2",
    paymentId: "pay_Mkl451092a",
    donorName: "Srinivas Rao",
    donorEmail: "srinivas.rao@example.com",
    donorPhone: "+91 99887 76655",
    amount: 2500,
    currency: "INR",
    category: "General Donation",
    sevaOrPageTitle: "Goshala Seva",
    date: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: "Completed",
    paymentMethod: "Razorpay",
    notes: "Fodder for Gau Mata",
  },
  {
    id: "rec_3",
    paymentId: "pay_Klp891234b",
    donorName: "Ananya Sharma",
    donorEmail: "ananya.s@example.com",
    donorPhone: "+91 94400 11223",
    amount: 1008,
    currency: "INR",
    category: "Festival Seva",
    sevaOrPageTitle: "Sri Rama Navami Seva",
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "Completed",
    paymentMethod: "UPI",
    notes: "Abhishekam Seva",
  }
];

export type UpiPaymentSettings = {
  enabled: boolean;
  upiId: string;
  payeeName: string;
  merchantCode?: string;
  customQrImage?: string;
  useDynamicAmountQr?: boolean;
  instructions?: string;
  notes?: string;
  requireUtrSubmission?: boolean;
  allowRazorpayGateway?: boolean;
};

export const defaultUpiPayment: UpiPaymentSettings = {
  enabled: true,
  upiId: "iskconkurnool@sbi",
  payeeName: "ISKCON Kurnool",
  merchantCode: "",
  customQrImage: "",
  useDynamicAmountQr: true,
  instructions: "Scan using Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI app. The amount is pre-filled automatically.",
  notes: "After completing your UPI payment, click 'Payment Completed' (or enter your 12-digit UTR) to instantly download your 80G tax receipt.",
  requireUtrSubmission: true,
  allowRazorpayGateway: true,
};

export function generateUpiUri({
  upiId,
  payeeName,
  amount,
  transactionNote,
  currency = "INR",
}: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  currency?: string;
}): string {
  const cleanUpi = (upiId || "").trim();
  const cleanName = (payeeName || "ISKCON Kurnool").trim();
  const amtFormatted = amount > 0 ? amount.toFixed(2) : "";
  const note = (transactionNote || "Donation to ISKCON Kurnool").slice(0, 50).trim();

  let uri = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&cu=${currency}`;
  if (amtFormatted) {
    uri += `&am=${amtFormatted}`;
  }
  if (note) {
    uri += `&tn=${encodeURIComponent(note)}`;
  }
  return uri;
}

export type PlatformFeeSettings = {
  enabled: boolean;
  type: "fixed" | "percentage";
  value: number;
  label: string;
};

export const defaultPlatformFee: PlatformFeeSettings = {
  enabled: false,
  type: "percentage",
  value: 2.36,
  label: "I would like to cover the payment gateway charges",
};

export function calculatePlatformFee(amount: number, feeSettings?: PlatformFeeSettings): number {
  if (!feeSettings?.enabled || amount <= 0) return 0;
  if (feeSettings.type === "fixed") {
    return Math.max(0, Math.round(feeSettings.value || 0));
  }
  return Math.max(0, Math.round((amount * (feeSettings.value || 0)) / 100));
}

export const defaultPaymentPages: PaymentPage[] = [
  {
    id: "p_sunday_feast",
    slug: "sunday-feast",
    title: "Sunday Feast Annadana Seva",
    description: "Feed hundreds of visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast is considered one of the highest forms of Annadana and brings immense spiritual blessings for birthdays, anniversaries, or in loving memory of family members.",
    bannerImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "",
    isPrivate: false,
    active: true,
    enableGoalTracker: true,
    goalAmount: 50000,
    raisedAmount: 18500,
    pricingType: "preset",
    presetPrices: [
      { id: "pr_1", label: "50 Devotees Sunday Feast", amount: 1500 },
      { id: "pr_2", label: "100 Devotees Sunday Feast", amount: 3000 },
      { id: "pr_3", label: "Half Sunday Feast Sponsorship", amount: 5500 },
      { id: "pr_4", label: "Full Grand Sunday Feast Sponsorship", amount: 11000 },
    ],
    contactEmail: "info@iskconkurnool.org",
    contactPhone: "+91 94916 89255",
    termsAndConditions: "All contributions support sacred prasadam distribution at ISKCON Kurnool. 80G tax exemption receipt is issued upon request.",
    fields: [
      { id: "f1", label: "Full Name", type: "text", required: true },
      { id: "f2", label: "Email Address", type: "email", required: true },
      { id: "f3", label: "WhatsApp Phone Number", type: "phone", required: true },
      { id: "f4", label: "Gotram & Nakshatra", type: "text", required: false },
      { id: "f5", label: "Occasion (Birthday / Anniversary / Memorial)", type: "text", required: false },
      { id: "f6", label: "PAN Card Number (for 80G)", type: "pan", required: false },
    ],
  },
  {
    id: "p1",
    slug: "sharandev",
    title: "Sharandev Seva",
    description: "Participate in divine seva for ISKCON Kurnool. Your generous contributions support daily deity worship, temple maintenance, and prasadam distribution.",
    bannerImage: "",
    logoUrl: "",
    isPrivate: true,
    active: true,
    enableGoalTracker: true,
    goalAmount: 100000,
    raisedAmount: 25555,
    pricingType: "fixed",
    fixedAmount: 5555,
    contactEmail: "info@iskconkurnool.org",
    contactPhone: "+91 98765 43210",
    termsAndConditions: "You agree to share information entered on this page with ISKCON Kurnool and Razorpay.",
    fields: [
      { id: "f1", label: "Full Name", type: "text", required: true },
      { id: "f2", label: "Email Address", type: "email", required: true },
      { id: "f3", label: "Phone Number", type: "phone", required: true },
      { id: "f4", label: "Gotram / Nakshatra", type: "text", required: false },
    ],
  },
];

export type BhaktiStepsLevel = {
  id: string;
  levelNumber: number;
  name: string;
  subtitle: string;
  badge: string;
  color: string;
  description: string;
  songs: string[];
  practices: string[];
  books: string[];
  learningOrCourses: string[];
  requirements: string[];
};

export type BhaktiStepsRegistration = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  age?: number | string;
  city?: string;
  level?: string;
  contactMethod?: string;
  currentLevelId?: string;
  targetLevelId?: string;
  roundsChantedDaily?: number;
  fourRegulativePrinciples?: boolean;
  cityArea?: string;
  preferredLanguage?: string;
  mentorPreference?: string;
  notes?: string;
  message?: string;
  submittedAt: string;
  read: boolean;
};

export type BhaktiStepsData = {
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  contactPhones: string[];
  officialUrl: string;
  booksUrl: string;
  founderQuote: string;
  founderImage: string;
  levels: BhaktiStepsLevel[];
  registrations: BhaktiStepsRegistration[];
  registrationStatus?: "Opened" | "Closed" | "Coming Soon";
  googleFormUrl?: string;
};

export const defaultBhaktiSteps: BhaktiStepsData = {
  enabled: true,
  heroTitle: "Bhakti Steps",
  heroSubtitle: "Recognize • Revitalize • Progress",
  heroDescription: "Bhakti Steps is a structured spiritual journey designed to help devotees gradually deepen their spiritual practices, scriptural understanding, devotional discipline, and loving connection with Krishna Consciousness.",
  registrationStatus: "Opened",
  googleFormUrl: "",
  heroImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1350&q=80",
  aboutTitle: "About Bhakti Steps",
  aboutDescription: "Bhakti Steps provides a systematic, step-by-step path for devotees to grow in Krishna Consciousness. Each level introduces progressive spiritual practices, devotional songs, regulative principles, courses, and sacred books.\n\nThe goal is not simply to complete levels, but to recognize one's spiritual progress, revitalize devotional practices, and progress steadily in devotional service back home, back to Godhead.",
  aboutImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80",
  contactPhones: ["9989147723", "9000002745", "9505377520"],
  officialUrl: "https://bhaktisteps.com/",
  booksUrl: "https://www.kihdedu.com/",
  founderQuote: "Krishna consciousness is not a manufactured thing. It is already there in the heart of everyone. Simply by chanting the Hare Krishna mantra and practicing devotional principles step by step, one revives their eternal loving relationship with the Supreme Lord.",
  founderImage: "https://upload.wikimedia.org/wikipedia/commons/4/4b/A.C._Bhaktivedanta_Swami_Prabhupada.jpg",
  levels: [
    {
      id: "level_1",
      levelNumber: 1,
      name: "SHRADDHAVAN",
      subtitle: "First Step of Faithful Inception",
      badge: "Level 1",
      color: "from-amber-500 to-yellow-600",
      description: "Cultivating primary faith (Shraddha) and beginning foundational chanting and daily association.",
      songs: [
        "Srila Prabhupada Pranama",
        "Panchatattva Mantra",
        "Hare Krishna Mahamantra"
      ],
      practices: [
        "One round Japa – Daily",
        "Krishna's Picture – At Home",
        "Weekly Once Satsanga"
      ],
      books: [
        "On the Way to Krishna",
        "Elevation to Krishna Consciousness",
        "Perfection of Yoga"
      ],
      learningOrCourses: [
        "Introduction to Japa Meditation",
        "Basic Altar Setup at Home"
      ],
      requirements: [
        "Chanting minimum 1 round of Hare Krishna Mahamantra daily",
        "Keeping a holy picture of Sri Sri Radha Krishna or Sri Chaitanya Mahaprabhu at home",
        "Attending weekly temple/satsanga program regularly"
      ]
    },
    {
      id: "level_2",
      levelNumber: 2,
      name: "KRISHNA SEVAKA",
      subtitle: "Dedicated Servant of the Lord",
      badge: "Level 2",
      color: "from-orange-500 to-amber-600",
      description: "Deepening your personal relationship with Sri Krishna through daily Tulasi seva and expanded Japa.",
      songs: [
        "Namaste Nrsimhaya – Song",
        "Jaya Radha Madhava – Song",
        "Vrindayai Tulasi Devyai – Mantra"
      ],
      practices: [
        "4 Rounds Japa & 1 Regulative Principle – Daily",
        "Travelling Altar – At Home",
        "Watering Tulasi – Daily"
      ],
      books: [
        "Matchless Gift",
        "Krishna the Reservoir of Pleasure",
        "The Topmost Yoga System"
      ],
      learningOrCourses: [
        "Tulasi Puja & Worship Etiquette",
        "Offering Bhoga with Devotion"
      ],
      requirements: [
        "Chanting minimum 4 rounds of Hare Krishna Mahamantra daily",
        "Following at least 1 regulative principle strictly (No Meat Eating / Vegetarianism)",
        "Daily Tulasi watering and maintaining a small travelling altar"
      ]
    },
    {
      id: "level_3",
      levelNumber: 3,
      name: "KRISHNA SADHAKA",
      subtitle: "Disciplined Devotional Practitioner",
      badge: "Level 3",
      color: "from-rose-500 to-orange-600",
      description: "Establishing firm spiritual discipline with regular Ekadasi observance, exclusive home altar, and 8 rounds.",
      songs: [
        "Tulasi Arati – Song",
        "Guru Ashtaka (Samsara Dava) – Song",
        "Gaura Arati – Song"
      ],
      practices: [
        "8 Rounds Japa & 2 Regulative Principles – Daily",
        "Exclusive Altar – At Home",
        "Fasting on Ekadasi & Festivals"
      ],
      books: [
        "Teachings of Prahlad Maharaj",
        "Coming Back – Book",
        "Civilization and Transcendence"
      ],
      learningOrCourses: [
        "Understanding Ekadasi & Fasting Principles",
        "Guru Ashtaka & Arati Mood"
      ],
      requirements: [
        "Chanting minimum 8 rounds of Hare Krishna Mahamantra daily",
        "Following at least 2 regulative principles strictly (No Meat Eating & No Intoxication)",
        "Observing all Ekadasis and major Vaishnava festival fasts"
      ]
    },
    {
      id: "level_4",
      levelNumber: 4,
      name: "PRABHUPADA ASHRAYA",
      subtitle: "Shelter of the Founder-Acharya",
      badge: "Level 4",
      color: "from-purple-600 to-indigo-600",
      description: "Surrendering fully under the lotus feet of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada with 16 rounds.",
      songs: [
        "Guru Vandana (Sri Guru Charana)",
        "Vibhavari Sesa – Song",
        "Yashomati Nandana – Song"
      ],
      practices: [
        "16 Rounds Japa & 4 Regulative Principles – Daily",
        "Tilaka Mantras",
        "ISKCON Disciple Course"
      ],
      books: [
        "Life and Teachings of Lord Chaitanya",
        "Nectar of Instruction – Book",
        "Srila Prabhupada Biography (Abridged)"
      ],
      learningOrCourses: [
        "ISKCON Disciple Course (IDC)",
        "Proper Tilaka Application with Mantras"
      ],
      requirements: [
        "Chanting full 16 rounds of Hare Krishna Mahamantra daily without fail",
        "Strictly following all 4 regulative principles (No Meat, No Intoxication, No Gambling, No Illicit Sex)",
        "Completing the authorized ISKCON Disciple Course (IDC)"
      ]
    },
    {
      id: "level_5",
      levelNumber: 5,
      name: "SRI GURU ASHRAYA",
      subtitle: "Shelter of Sri Guru & Initiation Preparation",
      badge: "Level 5",
      color: "from-emerald-600 to-teal-700",
      description: "Highest level of formal discipleship, completing foundational philosophical examinations and preparing for Harinama Diksha.",
      songs: [
        "Guru Pranama Mantra",
        "Gurudev Kripa Bindu Diya – Song",
        "Sikshastaka – Song",
        "Damodarastakam – Song"
      ],
      practices: [
        "Complete 15 Philosophical Q&A",
        "Avoid 10 Offences to the Holy Name",
        "Vaishnava Etiquette – Course",
        "16 Rounds Japa & 4 Regulative Principles"
      ],
      books: [
        "Nectar of Devotion (Part 1)",
        "Srimad Bhagavad Gita",
        "Srimad Bhagavatam – 1st Canto"
      ],
      learningOrCourses: [
        "Vaishnava Etiquette & Culture Course",
        "15 Philosophical Questions & Answers Examination"
      ],
      requirements: [
        "Steady practice of 16 rounds & 4 regulative principles for minimum 1 year",
        "Thorough knowledge of the 10 offences to the Holy Name and how to avoid them",
        "Passing the 15 Philosophical Questions assessment with temple authorities"
      ]
    }
  ],
  registrations: [
    {
      id: "BS-1001",
      fullName: "Srinivas Rao",
      phone: "9989147723",
      email: "srinivas.rao@gmail.com",
      age: 28,
      city: "Kurnool",
      level: "Krishna Sevaka",
      contactMethod: "WhatsApp",
      message: "I have been chanting 4 rounds daily and would love guidance on progressing to Krishna Sadhaka.",
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: true,
    }
  ]
};

export type TermsSection = {
  id: string;
  number: string;
  title: string;
  content: string;
};

export type TermsData = {
  lastUpdated: string;
  introTitle: string;
  introText: string;
  sections: TermsSection[];
};

export const defaultTerms: TermsData = {
  lastUpdated: "24 August 2026",
  introTitle: "Terms & Conditions",
  introText: "Welcome to the official website of ISKCON Kurnool / ISKCON Kurnool Temple. By accessing or using this website, you agree to be bound by these Terms & Conditions. Please read them carefully before using the website, making a donation, registering for a programme, or submitting any information.",
  sections: [
    {
      id: "sec_1",
      number: "1",
      title: "About These Terms",
      content: "These Terms & Conditions govern your use of the ISKCON Kurnool website and related features, including:\n\n• Website browsing and content\n• Online donations\n• Bank-transfer and UPI/QR donations\n• Event, course and programme registrations\n• Enquiries and contact forms\n• Digital receipts and acknowledgements\n• Photo and video submissions\n• Communications and notifications\n• Links to third-party services\n\nIf you do not agree with these Terms & Conditions, please do not use the website."
    },
    {
      id: "sec_2",
      number: "2",
      title: "Website Operator",
      content: "This website is operated by:\n\n**ISKCON Kurnool / ISKCON Kurnool Temple**\n\nThe website is intended to provide information about the temple, spiritual activities, festivals, programmes, courses, events, services, donations and other initiatives associated with ISKCON Kurnool.\n\nISKCON Kurnool may update, modify or discontinue any website feature or content when necessary."
    },
    {
      id: "sec_3",
      number: "3",
      title: "Eligibility and Use of the Website",
      content: "The website is generally available for people of all ages.\n\nUsers must:\n• Provide accurate information when submitting forms or registrations.\n• Use the website only for lawful purposes.\n• Respect the spiritual, devotional and community-oriented nature of the website.\n• Comply with applicable laws and these Terms & Conditions.\n\nMinors may browse the website and participate in suitable programmes where permitted. Parent or legal guardian consent may be required for certain activities, registrations or payments.\n\nDonations and paid registrations may require an adult or parent/legal guardian to complete the transaction.\n\nIndividual programmes may have additional age or eligibility requirements."
    },
    {
      id: "sec_4",
      number: "4",
      title: "Prohibited Activities",
      content: "You must not use the website to:\n\n• Submit false, misleading or fraudulent information.\n• Attempt unauthorized access to the website, server, database, administration system or other systems.\n• Introduce viruses, malware or other harmful code.\n• Interfere with the operation, security or availability of the website.\n• Abuse donation, registration, enquiry or other website functionality.\n• Upload unlawful, abusive, defamatory, offensive or harmful content.\n• Upload content that infringes another person's copyright, trademark, privacy or other rights.\n• Impersonate ISKCON Kurnool or another person or organization.\n• Use website content for unauthorized commercial purposes.\n• Attempt to manipulate, exploit or misuse payment or registration systems.\n\nISKCON Kurnool may restrict or terminate access to website features where misuse or violation of these Terms is identified."
    },
    {
      id: "sec_5",
      number: "5",
      title: "Donations",
      content: "ISKCON Kurnool may accept voluntary donations through multiple payment methods, including:\n\n• Razorpay and other authorized online payment methods\n• Direct bank transfer\n• UPI/QR payment\n\nDonation instructions and payment details displayed on the official website should be verified before making a payment.\n\nDonations may support temple activities, spiritual programmes, festivals, seva, development activities, charitable or community initiatives and other purposes associated with ISKCON Kurnool.\n\nA donor may be asked to select a preferred donation purpose."
    },
    {
      id: "sec_6",
      number: "6",
      title: "Use of Donations",
      content: "Where a donor selects a particular purpose, ISKCON Kurnool will make reasonable efforts to respect the selected purpose.\n\nHowever, circumstances may require the temple management to allocate or redirect funds towards related temple, spiritual, operational or community activities.\n\nBy making a donation, the donor acknowledges that the final allocation of funds may be determined by the authorized ISKCON Kurnool management in accordance with applicable requirements and organizational needs."
    },
    {
      id: "sec_7",
      number: "7",
      title: "Online Payment Processing",
      content: "Online donations may be processed through **Razorpay or other authorized third-party payment service providers**.\n\nPayment information may be processed directly by the relevant payment gateway, bank or financial institution.\n\nISKCON Kurnool does not request or intentionally store sensitive payment credentials such as:\n• UPI PIN\n• Internet banking password\n• Card PIN\n• CVV\n• Complete banking authentication credentials\n\nUsers should never share such confidential information with anyone claiming to represent ISKCON Kurnool."
    },
    {
      id: "sec_8",
      number: "8",
      title: "Bank Transfer and UPI/QR Donations",
      content: "For donations made through direct bank transfer or UPI/QR:\n\n1. The donor may be required to submit the transaction/reference number.\n2. The donor may be asked to upload a payment screenshot or proof of payment.\n3. The payment may be manually verified by the temple/admin team.\n4. The donation may be treated as confirmed only after successful verification.\n5. A receipt or acknowledgement may be issued after verification.\n\nDonors are responsible for entering the correct payment information and retaining their transaction records."
    },
    {
      id: "sec_9",
      number: "9",
      title: "Donation Receipts",
      content: "Where applicable, an electronic donation receipt or acknowledgement may be provided.\n\nFor successful online payments, the receipt may be generated automatically or made available through the website.\n\nFor bank-transfer and UPI/QR donations, a receipt may be issued after payment verification.\n\nDonors are responsible for providing accurate information, including where applicable:\n• Full name\n• Email address\n• Mobile/WhatsApp number\n• Address\n• Donation amount\n• Transaction/reference number\n• Other information required for receipt generation\n\nISKCON Kurnool may not be responsible for errors in a receipt caused by incorrect information supplied by the donor.\n\nAny tax-related benefit or documentation associated with a donation is subject to applicable Indian laws and the donor's eligibility."
    },
    {
      id: "sec_10",
      number: "10",
      title: "Donation Refunds",
      content: "Donations are generally treated as voluntary contributions and are normally **non-refundable** after successful completion.\n\nHowever, a refund or reversal may be considered in circumstances such as:\n• Duplicate payment\n• Technical/payment processing error\n• Unauthorized transaction\n• Other circumstances determined appropriate by ISKCON Kurnool\n\nRefund requests will be reviewed on a case-by-case basis.\n\nTo request a review, the donor may be required to provide:\n• Name\n• Contact information\n• Transaction/reference number\n• Date of transaction\n• Amount\n• Payment method\n• Relevant payment proof\n\nSubmitting a refund request does not automatically guarantee a refund."
    },
    {
      id: "sec_11",
      number: "11",
      title: "Events, Courses and Programme Registrations",
      content: "The website may provide registration for free and paid:\n\n• Spiritual programmes\n• Courses\n• Youth programmes\n• Festivals\n• Workshops\n• Yatras\n• Temple activities\n• Other events and initiatives\n\nWhere a fee applies, the applicable price or registration fee will be displayed before payment.\n\nFor paid registrations, participation is generally confirmed only after successful payment, subject to availability and the applicable programme requirements.\n\nEach programme may have its own terms regarding eligibility, capacity, cancellation and refunds. Where applicable, these terms will be displayed during registration."
    },
    {
      id: "sec_12",
      number: "12",
      title: "Changes to Programmes and Events",
      content: "ISKCON Kurnool may modify, postpone, reschedule or cancel a programme when necessary.\n\nChanges may include:\n• Date\n• Time\n• Venue\n• Speaker\n• Programme schedule\n• Registration availability\n• Programme format\n\nReasonable efforts may be made to communicate significant changes through official communication channels.\n\nISKCON Kurnool cannot guarantee that every programme will take place exactly as originally announced."
    },
    {
      id: "sec_13",
      number: "13",
      title: "Personal Information",
      content: "The website may collect information voluntarily provided by users, including:\n\n• Name\n• Mobile/WhatsApp number\n• Email address\n• Address\n• Donation/payment-related information\n• Event or course registration information\n• Enquiry/contact information\n• Photos or videos\n• Communication preferences\n• Other information submitted through website forms\n\nThe collection and use of personal information is governed by the **ISKCON Kurnool Privacy Policy**.\n\nUsers should review the Privacy Policy before submitting personal information."
    },
    {
      id: "sec_14",
      number: "14",
      title: "Communications and Notifications",
      content: "When users provide their email address or mobile/WhatsApp number, ISKCON Kurnool may use the information to communicate regarding:\n\n• Donations\n• Payment confirmations\n• Receipts\n• Registrations\n• Enquiries\n• Programme updates\n• Festival announcements\n• Temple activities\n• Spiritual events\n• Other relevant temple communications\n\nPromotional or marketing communications should be sent where appropriate and, where required, based on the user's consent or opt-in.\n\nUsers may request to stop receiving non-essential communications through the available unsubscribe or contact mechanisms."
    },
    {
      id: "sec_15",
      number: "15",
      title: "Photographs and Videos",
      content: "ISKCON Kurnool may photograph or record programmes, festivals, classes, yatras, celebrations and other temple activities.\n\nSuch photographs and videos may be published through:\n• Official website\n• Official social media\n• Digital publications\n• Promotional materials\n• Event documentation\n• Other official communication channels\n\nBecause temple events may involve general event photography, individual consent may not always be obtained for every photograph.\n\nIf an identifiable person has a reasonable concern regarding the publication of a photograph or video, they may contact ISKCON Kurnool and request a review or removal where appropriate."
    },
    {
      id: "sec_16",
      number: "16",
      title: "User-Submitted Content",
      content: "Users may submit photographs, testimonials, enquiries, feedback or other content through the website.\n\nBy submitting content, you confirm that:\n• You have the necessary rights or permission to submit it.\n• The content does not unlawfully infringe another person's rights.\n• The content is not fraudulent, defamatory, unlawful or harmful.\n\nUsers retain ownership of content they own.\n\nHowever, by submitting content to ISKCON Kurnool, you grant ISKCON Kurnool permission to use, reproduce, display or publish the submitted content for legitimate temple, devotional, informational, educational or communication purposes, including through official digital channels."
    },
    {
      id: "sec_17",
      number: "17",
      title: "Intellectual Property and Copyright",
      content: "Unless otherwise indicated, website content may include materials owned by or used with permission by ISKCON Kurnool or their respective rights holders.\n\nThis may include:\n• Logos and branding\n• Text\n• Photographs\n• Videos\n• Graphics\n• Designs\n• Digital documents\n• Website layouts\n• Educational and devotional materials\n\nSome content may belong to ISKCON, individual contributors or third parties and may be subject to separate copyright restrictions.\n\nContent may be shared for personal, devotional or non-commercial purposes where appropriate, provided that the original context and attribution are maintained.\n\nCommercial reproduction, modification, redistribution, resale or unauthorized publication requires appropriate permission from the relevant rights holder."
    },
    {
      id: "sec_18",
      number: "18",
      title: "Third-Party Services",
      content: "The website may use or link to third-party services, including:\n\n• Razorpay\n• Banks and payment providers\n• UPI services\n• Google Maps\n• YouTube\n• Instagram\n• Facebook\n• WhatsApp\n• Analytics services\n• Hosting and CDN services\n• Other external platforms\n\nThese services operate independently and may have their own terms, privacy policies and security practices.\n\nISKCON Kurnool does not control and cannot guarantee the availability, security, accuracy, privacy practices or policies of third-party services.\n\nUsers are responsible for reviewing the applicable terms and policies of third-party services before using them."
    },
    {
      id: "sec_19",
      number: "19",
      title: "Official Communication and Donation Security",
      content: "Users should rely only on payment instructions and contact information published through official ISKCON Kurnool communication channels.\n\nISKCON Kurnool is not responsible for fraudulent or unauthorized donation requests made through unofficial accounts, impersonators, fake websites, fake social-media profiles or unauthorized individuals.\n\nBefore making a donation, users should verify:\n• Bank account details\n• UPI/QR information\n• Payment links\n• Official contact information\n\nUsers should not make payments based solely on an unsolicited message, phone call or social-media communication claiming to represent ISKCON Kurnool."
    },
    {
      id: "sec_20",
      number: "20",
      title: "Website Availability",
      content: "ISKCON Kurnool aims to maintain the availability and functionality of the website but does not guarantee uninterrupted or error-free operation.\n\nThe website may become temporarily unavailable because of:\n• Maintenance\n• Technical problems\n• Hosting issues\n• Server failures\n• Internet/network problems\n• Security incidents\n• Third-party service failures\n• Software updates\n• Circumstances beyond reasonable control\n\nISKCON Kurnool may modify, suspend or discontinue any website feature when necessary."
    },
    {
      id: "sec_21",
      number: "21",
      title: "Accuracy of Information",
      content: "Reasonable efforts may be made to provide accurate and current information.\n\nHowever, programme timings, event dates, schedules, contact information, availability, fees and other details may change.\n\nUsers should verify important information with official ISKCON Kurnool channels before making travel, payment or other arrangements based on website information."
    },
    {
      id: "sec_22",
      number: "22",
      title: "Disclaimer",
      content: "The information provided on this website is primarily intended for **devotional, spiritual, educational and informational purposes**.\n\nNothing on the website should be interpreted as professional legal, financial, medical or other specialized advice where such advice would otherwise be required.\n\nISKCON Kurnool does not guarantee that all website content will always be complete, accurate, current or error-free.\n\nThird-party websites and services linked through the website are outside the direct control of ISKCON Kurnool."
    },
    {
      id: "sec_23",
      number: "23",
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by applicable law, ISKCON Kurnool shall not be responsible for losses or damages arising from:\n\n• Temporary website unavailability\n• Internet or network failures\n• Third-party payment gateway failures\n• Banking or UPI processing delays\n• Third-party service interruptions\n• Incorrect information submitted by users\n• Unauthorized activity outside reasonable control\n• Changes or cancellation of programmes\n• Reliance on outdated website information\n• Use of external websites or services\n\nNothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited under applicable law."
    },
    {
      id: "sec_24",
      number: "24",
      title: "Privacy and Data Protection",
      content: "The collection, use, storage and handling of personal information submitted through the website are governed by the **ISKCON Kurnool Privacy Policy**.\n\nThe Privacy Policy should be read together with these Terms & Conditions.\n\nWhere required by applicable law, ISKCON Kurnool may retain or disclose information to authorized entities for legal, regulatory, security, fraud-prevention or other legitimate purposes."
    },
    {
      id: "sec_25",
      number: "25",
      title: "Changes to These Terms",
      content: "ISKCON Kurnool may update these Terms & Conditions from time to time.\n\nChanges will be published on this page with an updated **\"Last Updated\"** date.\n\nUsers are encouraged to review this page periodically.\n\nContinued use of the website after updated Terms & Conditions are published may constitute acceptance of the revised terms, to the extent permitted by applicable law."
    },
    {
      id: "sec_26",
      number: "26",
      title: "Governing Law and Jurisdiction",
      content: "These Terms & Conditions shall be governed by and interpreted in accordance with the **laws of India**.\n\nSubject to applicable law, disputes relating to the website, donations, registrations or services covered by these Terms shall be subject to the jurisdiction of the appropriate courts in **Kurnool, Andhra Pradesh, India**."
    },
    {
      id: "sec_27",
      number: "27",
      title: "Contact Us",
      content: "For questions regarding these Terms & Conditions, donations, registrations, website usage or other matters, please contact ISKCON Kurnool through the official contact details published on the website.\n\n**ISKCON Kurnool / ISKCON Kurnool Temple**\n\n**Address:** Sri Sri Puri Jagannath Temple, Kurnool, Andhra Pradesh, India\n\n**Phone:** +91 95053 77520\n\n**Email:** iskconkurnool@gmail.com\n\n**Website:** https://iskconkurnool.org"
    }
  ]
};

export type PrivacySection = {
  id: string;
  number: string;
  title: string;
  content: string;
};

export type PrivacyData = {
  lastUpdated: string;
  introTitle: string;
  introText: string;
  sections: PrivacySection[];
};

export const defaultPrivacy: PrivacyData = {
  lastUpdated: "24 August 2026",
  introTitle: "Privacy Policy",
  introText: "**ISKCON Kurnool / ISKCON Kurnool Temple** respects your privacy and is committed to protecting the personal information you provide while using our website.\n\nThis Privacy Policy explains what information we may collect, why we collect it, how it may be used, how it may be shared, and the choices available to you.\n\nBy using the ISKCON Kurnool website, you acknowledge that you have read and understood this Privacy Policy.",
  sections: [
    {
      id: "psec_1",
      number: "1",
      title: "About This Privacy Policy",
      content: "This Privacy Policy applies to information collected through the official ISKCON Kurnool website, including information submitted through:\n\n• Contact and enquiry forms\n• Donation forms\n• Event registrations\n• Course registrations\n• Programme registrations\n• Yatra registrations\n• Newsletter or communication forms\n• Feedback and testimonial forms\n• Photo/video submission forms\n• Other forms and features available on the website\n\nIt also applies to information collected when you interact with certain website features and integrated services."
    },
    {
      id: "psec_2",
      number: "2",
      title: "Information We Collect",
      content: "Depending on how you use the website, we may collect the following information:\n\n**Personal Information**\n• Full name\n• Mobile number\n• WhatsApp number\n• Email address\n• Address\n• City/state/country\n• Date of birth or age, where required for a particular programme\n• Gender, where required for a specific registration\n• Emergency/contact information where required for an event or yatra\n• Other information voluntarily provided by you\n\n**Donation Information**\n• Donor name\n• Donation amount\n• Donation purpose\n• Email address\n• Mobile/WhatsApp number\n• Address, where required\n• Transaction/reference number\n• Payment method\n• Donation date\n• Payment status\n• Receipt-related information\n\nWe do not intentionally collect or store sensitive payment credentials such as UPI PINs, card PINs, CVV numbers or banking passwords.\n\n**Registration Information**\n• Name\n• Contact details\n• Age/date of birth where required\n• Address\n• Programme selected\n• Registration details\n• Payment information/status\n• Emergency contact information where required\n• Other information necessary to organize the programme\n\n**User-Submitted Content**\n• Photographs\n• Videos\n• Testimonials\n• Feedback\n• Enquiries\n• Other content"
    },
    {
      id: "psec_3",
      number: "3",
      title: "Automatically Collected Information",
      content: "When you visit the website, certain technical information may be collected automatically by the website, hosting provider, analytics tools or security services.\n\nThis may include:\n• IP address\n• Browser type\n• Device type\n• Operating system\n• Approximate location information\n• Pages visited\n• Date and time of access\n• Referring website\n• Website interaction information\n• Technical and security logs\n\nThis information may be used to maintain website security, improve performance, understand website usage and troubleshoot technical problems."
    },
    {
      id: "psec_4",
      number: "4",
      title: "How We Use Your Information",
      content: "Information collected through the website may be used for legitimate purposes including:\n\n**Donations**\n• Processing donations\n• Verifying payments\n• Recording donations\n• Generating receipts\n• Responding to donation-related enquiries\n• Resolving payment issues\n• Maintaining necessary financial and administrative records\n\n**Registrations**\n• Processing programme registrations\n• Confirming participation\n• Managing event capacity\n• Communicating programme updates\n• Organizing courses, yatras and activities\n• Handling cancellations or changes\n\n**Communication**\n• Respond to enquiries\n• Send registration confirmations\n• Send donation/payment confirmations\n• Provide receipts\n• Communicate programme changes\n• Share temple announcements\n• Send festival and event updates\n• Send other relevant communications\n\n**Website Improvement**\n• Improve website functionality\n• Improve user experience\n• Monitor website performance\n• Detect technical problems\n• Prevent fraud and misuse\n• Protect website security\n• Understand general website usage"
    },
    {
      id: "psec_5",
      number: "5",
      title: "Payment Information",
      content: "Online payments may be processed through **Razorpay or other authorized payment providers**.\n\nWhen you make an online payment, payment information may be processed directly by the relevant payment gateway, bank or financial institution.\n\nISKCON Kurnool does not intentionally store:\n• UPI PINs\n• Card PINs\n• Internet banking passwords\n• CVV numbers\n• Complete banking authentication credentials\n\nUsers should provide payment information only through the official payment interface.\n\nPlease review the applicable privacy policy of the payment provider for details regarding its handling of payment information."
    },
    {
      id: "psec_6",
      number: "6",
      title: "Bank Transfer and UPI/QR Payments",
      content: "If you make a donation through direct bank transfer or UPI/QR, we may request information necessary to identify and verify the transaction.\n\nThis may include:\n• Transaction/reference number\n• Transaction date\n• Amount\n• Donor name\n• Payment screenshot or proof of payment\n• Contact information\n\nThis information may be used to verify the payment and issue an appropriate receipt or acknowledgement."
    },
    {
      id: "psec_7",
      number: "7",
      title: "Donation Receipts",
      content: "Information provided by donors may be used to generate and deliver donation receipts.\n\nWhere required, receipt information may include:\n• Donor name\n• Donation amount\n• Donation purpose\n• Date\n• Transaction/reference information\n• Contact details\n• Address\n\nDonors are responsible for ensuring that the information they provide is accurate."
    },
    {
      id: "psec_8",
      number: "8",
      title: "Event, Course and Yatra Information",
      content: "Information collected during programme registration may be used only for legitimate purposes associated with organizing and managing the relevant programme.\n\nThis may include:\n• Registration management\n• Participant communication\n• Attendance\n• Payment verification\n• Accommodation or travel coordination, where applicable\n• Emergency communication\n• Programme administration\n• Safety and operational requirements\n\nSpecific programmes may have additional privacy requirements that will be communicated during registration where necessary."
    },
    {
      id: "psec_9",
      number: "9",
      title: "WhatsApp and Email Communication",
      content: "If you voluntarily provide your WhatsApp number or email address, ISKCON Kurnool may use it to communicate regarding:\n\n• Donations\n• Receipts\n• Registrations\n• Enquiries\n• Temple programmes\n• Festivals\n• Courses\n• Events\n• Important announcements\n\nWhere promotional communications require consent, they will be sent in accordance with applicable requirements.\n\nYou may request to stop receiving non-essential communications.\n\nPlease note that WhatsApp, email providers and mobile service providers operate their own systems and privacy policies."
    },
    {
      id: "psec_10",
      number: "10",
      title: "Photographs and Videos",
      content: "ISKCON Kurnool may photograph or record activities at temple programmes, festivals, classes, yatras, celebrations and other events.\n\nPhotographs and videos may be used on:\n• Official website\n• Official social media\n• Digital publications\n• Event documentation\n• Promotional materials\n• Other official communication channels\n\nGeneral event photography may capture people who attend public or temple programmes.\n\nIf you are identifiable in a photograph or video and have a reasonable privacy concern, you may contact ISKCON Kurnool and request a review or removal where appropriate."
    },
    {
      id: "psec_11",
      number: "11",
      title: "User-Submitted Photos, Videos and Content",
      content: "If you voluntarily upload or submit a photograph, video, testimonial, feedback or other content, you confirm that you have the necessary rights or permission to provide that content.\n\nBy submitting such content, you permit ISKCON Kurnool to use it for legitimate devotional, educational, informational, documentation or communication purposes.\n\nISKCON Kurnool may remove submitted content where it is considered inappropriate, unlawful, misleading, harmful or inconsistent with the purpose of the website."
    },
    {
      id: "psec_12",
      number: "12",
      title: "Cookies and Similar Technologies",
      content: "The website may use cookies or similar technologies to support:\n\n• Website functionality\n• Security\n• Session management\n• Performance\n• Analytics\n• User preferences\n\nThird-party services integrated into the website may also use cookies or similar technologies according to their own policies.\n\nYou may be able to control cookies through your browser settings. Disabling certain cookies may affect some website functionality."
    },
    {
      id: "psec_13",
      number: "13",
      title: "Analytics and Technical Services",
      content: "The website may use third-party services for analytics, security, hosting, performance monitoring or other technical purposes.\n\nThese services may collect technical information such as:\n• Device information\n• Browser information\n• IP address\n• Website usage information\n• Performance information\n\nSuch services may process information according to their own privacy policies."
    },
    {
      id: "psec_14",
      number: "14",
      title: "Third-Party Services",
      content: "The website may integrate or link to services such as:\n\n• Razorpay\n• Banks and payment providers\n• UPI services\n• Google Maps\n• YouTube\n• Instagram\n• Facebook\n• WhatsApp\n• Google services\n• Analytics services\n• Hosting/CDN providers\n• Other external services\n\nWhen you interact with these services, your information may be processed according to the respective third party's privacy policy.\n\nISKCON Kurnool does not control the privacy practices of independent third-party services.\n\nUsers should review the privacy policies of such services before providing information through them."
    },
    {
      id: "psec_15",
      number: "15",
      title: "How We Share Information",
      content: "ISKCON Kurnool may share information where reasonably necessary for legitimate purposes, including with:\n\n• Authorized temple administrators or staff\n• Payment gateways\n• Banks and financial institutions\n• Event or programme service providers\n• Hosting and technology providers\n• Communication service providers\n• Security or fraud-prevention services\n• Government authorities or law-enforcement agencies where legally required\n\nInformation will not be intentionally sold as a commercial mailing list."
    },
    {
      id: "psec_16",
      number: "16",
      title: "Legal and Security Disclosures",
      content: "Personal information may be disclosed where reasonably necessary to:\n\n• Comply with applicable law\n• Respond to lawful requests from authorities\n• Prevent fraud\n• Investigate misuse\n• Protect the website\n• Protect users\n• Protect the rights, property or safety of ISKCON Kurnool or others"
    },
    {
      id: "psec_17",
      number: "17",
      title: "Data Security",
      content: "Reasonable administrative, technical and organizational measures may be used to protect information against unauthorized access, misuse, alteration, disclosure or destruction.\n\nHowever, no internet-based system can be guaranteed to be completely secure.\n\nUsers should avoid sharing sensitive passwords, PINs, banking credentials or other confidential information through ordinary website forms, email, WhatsApp or social media."
    },
    {
      id: "psec_18",
      number: "18",
      title: "Data Retention",
      content: "Personal information may be retained for as long as reasonably necessary for the purposes for which it was collected, including:\n\n• Donation and financial records\n• Receipt records\n• Programme registrations\n• Administrative requirements\n• Legal and regulatory requirements\n• Security and fraud prevention\n• Resolving disputes\n• Maintaining necessary organizational records\n\nRetention periods may vary depending on the nature of the information and applicable requirements."
    },
    {
      id: "psec_19",
      number: "19",
      title: "Children's Privacy",
      content: "The website may contain information about children's, youth or educational programmes.\n\nWhere personal information about a minor is collected for registration or participation, parent or legal guardian involvement or consent may be required depending on the programme and applicable requirements.\n\nParents or legal guardians should ensure that information submitted on behalf of minors is accurate and appropriate."
    },
    {
      id: "psec_20",
      number: "20",
      title: "Your Choices and Rights",
      content: "Depending on applicable law, you may have rights regarding your personal information, including the ability to:\n\n• Request access to certain personal information.\n• Request correction of inaccurate information.\n• Request deletion where legally applicable.\n• Withdraw consent where processing is based on consent.\n• Opt out of certain non-essential communications.\n• Ask questions about how your information is used.\n\nRequests may be subject to reasonable verification requirements and applicable legal obligations."
    },
    {
      id: "psec_21",
      number: "21",
      title: "Unsubscribing from Communications",
      content: "You may request to stop receiving non-essential promotional or informational communications.\n\nYou may do this through:\n• An unsubscribe mechanism where provided\n• A communication preference option\n• Contacting ISKCON Kurnool using the official contact details\n\nCertain essential communications, such as payment confirmations, receipts, security notices or important registration information, may still be sent when necessary."
    },
    {
      id: "psec_22",
      number: "22",
      title: "External Links",
      content: "The website may contain links to websites, applications or platforms operated by third parties.\n\nISKCON Kurnool is not responsible for the privacy practices, security or content of external websites.\n\nYou should review the privacy policy of an external website before providing personal information."
    },
    {
      id: "psec_23",
      number: "23",
      title: "Fraud and Fake Communication Warning",
      content: "Users should be careful of fraudulent websites, social-media accounts, messages, phone calls or individuals impersonating ISKCON Kurnool.\n\nBefore making a donation:\n• Verify the website address.\n• Verify bank details.\n• Verify UPI/QR information.\n• Use payment links provided through official channels.\n• Do not share OTPs, UPI PINs, passwords or card credentials.\n\nISKCON Kurnool will not intentionally request confidential banking credentials such as UPI PINs, card PINs or passwords through ordinary communications."
    },
    {
      id: "psec_24",
      number: "24",
      title: "Changes to This Privacy Policy",
      content: "ISKCON Kurnool may update this Privacy Policy from time to time.\n\nChanges will be published on this page with an updated **Last Updated** date.\n\nUsers are encouraged to review this page periodically.\n\nContinued use of the website after changes are published may constitute acceptance of the updated Privacy Policy to the extent permitted by applicable law."
    },
    {
      id: "psec_25",
      number: "25",
      title: "Contact Us",
      content: "For privacy-related questions, requests or concerns, please contact:\n\n**ISKCON Kurnool / ISKCON Kurnool Temple**\n\n**Address:** Sri Sri Puri Jagannath Temple, Kurnool, Andhra Pradesh, India\n\n**Phone:** +91 95053 77520\n\n**Email:** iskconkurnool@gmail.com\n\n**Website:** https://iskconkurnool.org"
    }
  ]
};

type AdminState = {
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  photos: GalleryPhoto[];
  setPhotos: (p: GalleryPhoto[]) => void;
  driveAlbums: DriveAlbum[];
  setDriveAlbums: (da: DriveAlbum[]) => void;
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
  harinama: HarinamaData;
  setHarinama: (h: HarinamaData) => void;
  ekadashi: EkadashiData;
  setEkadashi: (e: EkadashiData) => void;
  gitaCourse: GitaCourseData;
  setGitaCourse: (g: GitaCourseData) => void;
  sunday: SundayData;
  setSunday: (s: SundayData) => void;
  prahladaBadi: PrahladaBadiData;
  setPrahladaBadi: (p: PrahladaBadiData) => void;
  houseProgrammes: HouseProgrammeData;
  setHouseProgrammes: (hp: HouseProgrammeData) => void;
  addHouseProgrammeRequest: (req: Omit<HouseProgrammeRequest, "id" | "createdAt" | "read" | "status">) => Promise<void>;
  updateHouseProgrammeRequestStatus: (id: string, status: HouseProgrammeRequest["status"]) => Promise<void>;
  deleteHouseProgrammeRequest: (id: string) => Promise<void>;
  markAllHouseProgrammeRequestsRead: () => void;
  dailyDarshan: DailyDarshanData;
  setDailyDarshan: (dd: DailyDarshanData) => void;
  addDailyDarshanEntry: (entry: Omit<DailyDarshanItem, "id" | "createdAt">) => Promise<string>;
  updateDailyDarshanEntry: (id: string, updates: Partial<DailyDarshanItem>) => Promise<void>;
  deleteDailyDarshanEntry: (id: string) => Promise<void>;
  liveProgrammes: LiveProgrammeData;
  setLiveProgrammesData: (lp: LiveProgrammeData) => void;
  addLiveProgramme: (prog: Omit<LiveProgrammeItem, "id" | "createdAt">) => Promise<string>;
  updateLiveProgramme: (id: string, updates: Partial<LiveProgrammeItem>) => Promise<void>;
  deleteLiveProgramme: (id: string) => Promise<void>;
  youthYatra: YouthYatraState;
  setYouthYatra: (y: YouthYatraState) => void;
  addYatraRegistration: (reg: Omit<YatraRegistration, "id" | "registeredAt" | "read" | "status" | "paymentStatus" | "checkedIn"> & { status?: YatraRegistration["status"]; paymentStatus?: YatraRegistration["paymentStatus"]; checkedIn?: boolean }) => Promise<string>;
  updateYatraRegistrationStatus: (id: string, status: YatraRegistration["status"], paymentStatus?: YatraRegistration["paymentStatus"]) => Promise<void>;
  deleteYatraRegistration: (id: string) => Promise<void>;
  markAllYatraRegistrationsRead: () => void;
  saveYatraEvent: (event: YatraEvent) => Promise<void>;
  deleteYatraEvent: (eventId: string) => Promise<void>;
  setActiveYatraEvent: (eventId: string) => Promise<void>;
  checkInYatraParticipant: (regIdOrQr: string, verifiedBy?: string) => Promise<{ success: boolean; registration?: YatraRegistration; message: string }>;
  undoCheckInYatraParticipant: (regId: string) => Promise<void>;
  updateYatraSeatAndBatch: (regId: string, batch: string, seatNumber: string) => Promise<void>;
  bhaktiSteps: BhaktiStepsData;
  setBhaktiSteps: (b: BhaktiStepsData) => void;
  updateBhaktiStepsConfig: (config: Partial<BhaktiStepsData>) => Promise<void>;
  addBhaktiStepsRegistration: (reg: Omit<BhaktiStepsRegistration, "id" | "submittedAt" | "read">) => Promise<string>;
  markAllBhaktiStepsRegistrationsRead: () => void;
  deleteBhaktiStepsRegistration: (id: string) => Promise<void>;
  saveBhaktiStepsLevel: (level: BhaktiStepsLevel) => Promise<void>;
  deleteBhaktiStepsLevel: (levelId: string) => Promise<void>;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  theme: ThemeSettings;
  setTheme: (t: ThemeSettings) => void;
  heroBanners: HeroBannersData;
  setHeroBanners: (h: HeroBannersData) => void;
  goshala: GoshalaData;
  setGoshala: (g: GoshalaData) => void;
  contacts: ContactEntry[];
  setContacts: (c: ContactEntry[]) => void;
  addContactMessage: (m: { name: string; email: string; phone: string; message: string }) => Promise<void>;
  donations: DonationEntry[];
  setDonations: (d: DonationEntry[]) => void;
  addDonation: (d: Omit<DonationEntry, "id" | "date" | "status"> & { status?: DonationEntry["status"] }) => Promise<string | null>;
  updateDonationStatus: (id: string, status: DonationEntry["status"], paymentRef?: string) => Promise<void>;
  instagram: InstagramData;
  setInstagram: (i: InstagramData) => void;
  templeSchedule: TempleScheduleItem[];
  setTempleSchedule: (s: TempleScheduleItem[]) => void;
  featurePopup: FeaturePopupData;
  setFeaturePopup: (fp: FeaturePopupData) => void;
  paymentPages: PaymentPage[];
  setPaymentPages: (p: PaymentPage[]) => void;
  paymentRecords: PaymentRecord[];
  setPaymentRecords: (records: PaymentRecord[]) => void;
  addPaymentRecord: (record: Omit<PaymentRecord, "id" | "date"> & { date?: string }) => Promise<void>;
  deletePaymentRecord: (id: string) => Promise<void>;
  markAllPaymentRecordsRead: () => void;
  upiPayment: UpiPaymentSettings;
  setUpiPayment: (u: UpiPaymentSettings) => void;
  platformFee: PlatformFeeSettings;
  setPlatformFee: (pf: PlatformFeeSettings) => void;
  previewLeads: PreviewLead[];
  setPreviewLeads: (leads: PreviewLead[]) => void;
  addPreviewLead: (lead: { name: string; phone: string }) => Promise<void>;
  markAllPreviewLeadsRead: () => void;

  receiptSettings: ReceiptSettings;
  setReceiptSettings: (r: ReceiptSettings) => void;

  terms: TermsData;
  setTerms: (t: TermsData) => void;
  privacy: PrivacyData;
  setPrivacy: (p: PrivacyData) => void;
  changeSuperAdminPassword: (newPass: string) => Promise<void>;
  currentUser: CurrentAdminUser | null;
  authed: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
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
  googleMapUrl: "https://maps.app.goo.gl/yJpP11F8Q8ZqT76W9",
  address: "ISKCON Kurnool\nSri Sri Jagannath Baladev Subhadra Temple\nKurnool, Andhra Pradesh\nIndia",
  footer: "© 2025 ISKCON Kurnool. All Rights Reserved.",
  logo: "",
  facebook: "https://facebook.com/iskconkurnool",
  twitter: "",
  welcomeImage: "",
  quickDonateImage: "",
  launchPageActive: false,
  isLaunchingSequence: false,
  enableLaunchButton: false,
  enableLaunchTimer: true,
  launchDate: "2026-09-04T00:00:00",
  launchBypassCode: "108",
  liveStreamLink: "",
  liveStreamTitle: "",
  previewVideoUrl: "",
  previewVideoTitle: "Sri Sri Puri Jagannath Temple Preview",
  previewVideoSubtitle: "Experience the divine preview of ISKCON Kurnool digital temple",
};

const defaultTheme: ThemeSettings = {
  primary: "#5b2c9b",
  secondary: "#f5c518",
  accent: "#e8670c",
};

const defaultCategories = ["Temple", "Festival", "Programs", "Deity"];

export const defaultDriveAlbums: DriveAlbum[] = [];

const defaultSlides: Slide[] = [];

// Keys used in the site_data table
const KEYS = {
  slides: "slides",
  photos: "photos",
  categories: "categories",
  driveAlbums: "driveAlbums",
  classes: "classes",
  festivals: "festivals",
  sevas: "sevas",
  youth: "youth",
  harinama: "harinama",
  ekadashi: "ekadashi",
  gitaCourse: "gitaCourse",
  sunday: "sunday",
  settings: "settings",
  theme: "theme",
  heroBanners: "heroBanners",
  goshala: "goshala",
  contacts: "contacts",
  instagram: "instagram",
  prahladaBadi: "prahladaBadi",
  houseProgrammes: "houseProgrammes",
  dailyDarshan: "dailyDarshan",
  liveProgrammes: "liveProgrammes",
  youthYatra: "youthYatra",
  bhaktiSteps: "bhaktiSteps",
  templeSchedule: "templeSchedule",
  featurePopup: "featurePopup",
  paymentPages: "paymentPages",
  paymentRecords: "paymentRecords",
  upiPayment: "upiPayment",
  platformFee: "platformFee",
  previewLeads: "previewLeads",
  terms: "terms",
  privacy: "privacy",
  receiptSettings: "receiptSettings",
  teamMembers: "team_members",
  superAdminPass: "super_admin_pass",
} as const;

const Ctx = createContext<AdminState | null>(null);

export const defaultSevas: Seva[] = [
  {
    id: "s_default_sunday_feast",
    title: "Sunday Feast Annadana Seva",
    slug: "sunday-feast",
    description: "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.",
    thumbnail: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
    prices: [
      { label: "50 Devotees Prasadam Seva", amount: 1500 },
      { label: "100 Devotees Prasadam Seva", amount: 3000 },
      { label: "Half Sunday Feast Sponsorship", amount: 5500 },
      { label: "Full Grand Sunday Feast Sponsorship", amount: 11000 },
    ],
    order: 1,
    active: true
  },
  {
    id: "s_default_pushpalankara",
    title: "Nitya Pushpalankara Seva",
    slug: "nitya-pushpalankara-seva",
    description: "Daily decoration of the Lord with fresh flowers — a fragrant offering of love and devotion.",
    thumbnail: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    prices: [
      { label: "One Day Flower Seva", amount: 516 },
      { label: "One Week Flower Seva", amount: 3500 },
      { label: "One Month Pushpalankara", amount: 15000 },
    ],
    order: 2,
    active: true
  },
  {
    id: "s_default_goshala",
    title: "Goshala Cow Service (Go-Seva)",
    slug: "goshala-seva",
    description: "Support cow protection and care at our temple goshala. Your contribution provides food, medical care, and shelter for Mother Cow.",
    thumbnail: "https://images.unsplash.com/photo-1599422315802-911e3b6a978f?auto=format&fit=crop&w=800&q=80",
    prices: [
      { label: "Fodder for Cows (One Day)", amount: 501 },
      { label: "Cow Care & Medical Support (Monthly)", amount: 2500 },
      { label: "Adopt a Cow (Annual Support)", amount: 15000 }
    ],
    order: 3,
    active: true
  }
];

function getCached<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem("iskcon_cache_" + key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (key === KEYS.liveProgrammes && parsed?.programmes) {
        parsed.programmes = parsed.programmes.filter((p: any) => p.id !== "live_sandhya_arati" && p.id !== "live_sb_class" && p.id !== "live_sunday_feast");
      }
      return parsed;
    }
  } catch {}
  return fallback;
}

function setCache(key: string, value: any) {
  if (typeof window === "undefined" || value == null) return;
  try {
    localStorage.setItem("iskcon_cache_" + key, JSON.stringify(value));
  } catch {}
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [slides, setSlidesState] = useState<Slide[]>(() => getCached(KEYS.slides, defaultSlides));
  const [photos, setPhotosState] = useState<GalleryPhoto[]>(() => getCached(KEYS.photos, []));
  const [driveAlbums, setDriveAlbumsState] = useState<DriveAlbum[]>(() => getCached(KEYS.driveAlbums, defaultDriveAlbums));
  const [categories, setCategoriesState] = useState<string[]>(() => getCached(KEYS.categories, defaultCategories));
  const [classes, setClassesState] = useState<DailyClass[]>(() => getCached(KEYS.classes, []));
  const [festivals, setFestivalsState] = useState<Festival[]>(() => getCached(KEYS.festivals, []));
  const [sevas, setSevasState] = useState<Seva[]>(() => getCached(KEYS.sevas, defaultSevas));
  const [youth, setYouthState] = useState<YouthData>(() => getCached(KEYS.youth, defaultYouth));
  const [harinama, setHarinamaState] = useState<HarinamaData>(() => getCached(KEYS.harinama, defaultHarinama));
  const [ekadashi, setEkadashiState] = useState<EkadashiData>(() => {
    const cached = getCached<Partial<EkadashiData>>(KEYS.ekadashi, defaultEkadashi);
    return {
      ...defaultEkadashi,
      ...cached,
      templeSchedule: Array.isArray(cached?.templeSchedule) && cached.templeSchedule.length > 0 ? cached.templeSchedule : defaultEkadashi.templeSchedule,
      calendar: Array.isArray(cached?.calendar) && cached.calendar.length > 0 ? cached.calendar : defaultEkadashi.calendar,
    };
  });
  const [gitaCourse, setGitaCourseState] = useState<GitaCourseData>(() => getCached(KEYS.gitaCourse, defaultGitaCourse));
  const [sunday, setSundayState] = useState<SundayData>(() => getCached(KEYS.sunday, defaultSunday));
  const [prahladaBadi, setPrahladaBadiState] = useState<PrahladaBadiData>(() => getCached(KEYS.prahladaBadi, defaultPrahladaBadi));
  const [houseProgrammes, setHouseProgrammesState] = useState<HouseProgrammeData>(() => getCached(KEYS.houseProgrammes, defaultHouseProgramme));
  const [dailyDarshan, setDailyDarshanState] = useState<DailyDarshanData>(() => getCached(KEYS.dailyDarshan, defaultDailyDarshan));
  const [liveProgrammes, setLiveProgrammesState] = useState<LiveProgrammeData>(() => getCached(KEYS.liveProgrammes, defaultLiveProgrammes));
  const [youthYatra, setYouthYatraState] = useState<YouthYatraState>(() => getCached(KEYS.youthYatra, defaultYouthYatra));
  const [bhaktiSteps, setBhaktiStepsState] = useState<BhaktiStepsData>(() => getCached(KEYS.bhaktiSteps, defaultBhaktiSteps));
  const [settings, setSettingsState] = useState<SiteSettings>(() => getCached(KEYS.settings, defaultSettings));
  const [theme, setThemeState] = useState<ThemeSettings>(() => getCached(KEYS.theme, defaultTheme));
  const [heroBanners, setHeroBannersState] = useState<HeroBannersData>(() => getCached(KEYS.heroBanners, defaultHeroBanners));
  const [goshala, setGoshalaState] = useState<GoshalaData>(() => getCached(KEYS.goshala, defaultGoshala));
  const [contacts, setContactsState] = useState<ContactEntry[]>([]);
  const [instagram, setInstagramState] = useState<InstagramData>(() => getCached(KEYS.instagram, defaultInstagram));
  const [templeSchedule, setTempleScheduleState] = useState<TempleScheduleItem[]>(() => getCached(KEYS.templeSchedule, defaultTempleSchedule));
  const [featurePopup, setFeaturePopupState] = useState<FeaturePopupData>(() => getCached(KEYS.featurePopup, defaultFeaturePopup));
  const [paymentPages, setPaymentPagesState] = useState<PaymentPage[]>(() => getCached(KEYS.paymentPages, defaultPaymentPages));
  const [paymentRecords, setPaymentRecordsState] = useState<PaymentRecord[]>(() => getCached(KEYS.paymentRecords, defaultPaymentRecords));
  const [upiPayment, setUpiPaymentState] = useState<UpiPaymentSettings>(() => getCached(KEYS.upiPayment, defaultUpiPayment));
  const [platformFee, setPlatformFeeState] = useState<PlatformFeeSettings>(() => getCached(KEYS.platformFee, defaultPlatformFee));
  const [previewLeads, setPreviewLeadsState] = useState<PreviewLead[]>(() => getCached(KEYS.previewLeads, []));
  const [terms, setTermsState] = useState<TermsData>(() => getCached(KEYS.terms, defaultTerms));
  const [privacy, setPrivacyState] = useState<PrivacyData>(() => getCached(KEYS.privacy, defaultPrivacy));
  const [receiptSettings, setReceiptSettingsState] = useState<ReceiptSettings>(() => getCached(KEYS.receiptSettings, defaultReceiptSettings));

  const [superAdminPass, setSuperAdminPassState] = useState<string>("iskcon@1982");
  const [currentUser, setCurrentUser] = useState<CurrentAdminUser | null>(null);
  const [authed, setAuthed] = useState(false);
  const [donations, setDonationsState] = useState<DonationEntry[]>([]);

  const establishAdminState = async (userId: string, email?: string) => {
    const { data: role, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !role) {
      setAuthed(false);
      setCurrentUser(null);
      return false;
    }

    setCurrentUser({
      role: "superadmin",
      name: "Admin",
      email: email ?? "admin@iskconkurnool.org",
      allowedTabs: ["*"],
    });
    setAuthed(true);
    return true;
  };

  // The backend session is the only source of truth. The auth client persists it
  // across reloads, so no password or parallel browser-only login flag is stored.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setAuthed(false);
        setCurrentUser(null);
        return;
      }
      await establishAdminState(data.user.id, data.user.email);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setAuthed(false);
        setCurrentUser(null);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void establishAdminState(session.user.id, session.user.email);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load contact messages + donation enquiries (admin-only readable), kept live
  useEffect(() => {
    if (!authed) {
      setContactsState([]);
      setDonationsState([]);
      return;
    }
    let mounted = true;

    const loadContacts = async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id,name,email,phone,message,read,created_at")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) { console.error("[contact_messages] load failed", error); return; }

      const normalContacts: ContactEntry[] = [];
      const hpRequests: HouseProgrammeRequest[] = [];

      (data ?? []).forEach((r) => {
        let parsedHp: any = null;
        if (r.message) {
          if (typeof r.message === "object") {
            parsedHp = r.message;
          } else if (typeof r.message === "string") {
            try {
              parsedHp = JSON.parse(r.message);
            } catch {
              // not json
            }
          }
        }

        const isHp =
          (parsedHp && typeof parsedHp === "object" && (parsedHp.isHouseProgramme || parsedHp.locationArea || parsedHp.preferredDate)) ||
          r.email === "houseprogramme@iskconkurnool.org" ||
          (typeof r.message === "string" && r.message.toLowerCase().includes("house programme"));

        if (isHp) {
          hpRequests.push({
            id: r.id,
            name: r.name || "Devotee",
            phone: r.phone || "",
            locationArea: (parsedHp && parsedHp.locationArea) || "Kurnool",
            preferredDate: (parsedHp && parsedHp.preferredDate) || (r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : ""),
            preferredTime: (parsedHp && parsedHp.preferredTime) || "Flexible",
            participantsCount: (parsedHp && parsedHp.participantsCount) || "10 – 25 Devotees",
            fullAddress: (parsedHp && parsedHp.fullAddress) || r.message || "Kurnool",
            googleMapsUrl: parsedHp && parsedHp.googleMapsUrl ? parsedHp.googleMapsUrl : undefined,
            latitude: parsedHp && typeof parsedHp.latitude === "number" ? parsedHp.latitude : undefined,
            longitude: parsedHp && typeof parsedHp.longitude === "number" ? parsedHp.longitude : undefined,
            message: (parsedHp && parsedHp.message) || (typeof parsedHp !== "object" ? r.message : undefined),
            status: (parsedHp && parsedHp.status) || "pending",
            createdAt: r.created_at || new Date().toISOString(),
            read: r.read ?? false,
          });
        } else {
          normalContacts.push({
            id: r.id, name: r.name, email: r.email, phone: r.phone,
            message: r.message, read: r.read, date: r.created_at,
          });
        }
      });

      setContactsState(normalContacts);

      if (hpRequests.length > 0) {
        setHouseProgrammesState((prev) => {
          const hpMap = new Map<string, HouseProgrammeRequest>();
          (prev.requests || []).forEach((req) => { if (req && req.id) hpMap.set(req.id, req); });
          let hasNew = false;
          hpRequests.forEach((req) => {
            if (req && req.id && !hpMap.has(req.id)) {
              hasNew = true;
            }
            if (req && req.id) hpMap.set(req.id, req);
          });
          const merged = Array.from(hpMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const updated = { ...prev, requests: merged };
          if (hasNew) {
            persist(KEYS.houseProgrammes, updated);
          }
          return updated;
        });
      }
    };

    const loadDonations = async () => {
      const { data, error } = await supabase
        .from("donation_enquiries")
        .select("id,donor_name,email,phone,pan,purpose,seva_title,option_label,amount,status,payment_ref,created_at")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) { console.error("[donation_enquiries] load failed", error); return; }
      setDonationsState(
        (data ?? []).map((r) => ({
          id: r.id,
          donorName: r.donor_name,
          email: r.email,
          phone: r.phone,
          pan: r.pan ?? undefined,
          purpose: r.purpose ?? undefined,
          sevaTitle: r.seva_title,
          optionLabel: r.option_label ?? undefined,
          amount: Number(r.amount ?? 0),
          status: (r.status as DonationEntry["status"]) ?? "initiated",
          paymentRef: r.payment_ref ?? undefined,
          date: r.created_at,
        })),
      );
    };

    loadContacts();
    loadDonations();

    const channel = supabase
      .channel("form_submissions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => loadContacts())
      .on("postgres_changes", { event: "*", schema: "public", table: "donation_enquiries" }, () => loadDonations())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [authed]);

  // Load lead submissions (admin-only readable) and keep them live
  useEffect(() => {
    if (!authed) {
      setPreviewLeadsState([]);
      return;
    }
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("preview_leads")
        .select("id,name,phone,created_at")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) {
        console.error("[preview_leads] load failed", error);
        return;
      }
      setPreviewLeadsState(
        (data ?? []).map((r) => ({ id: r.id, name: r.name, phone: r.phone, date: r.created_at })),
      );
    };
    load();
    const channel = supabase
      .channel("preview_leads_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "preview_leads" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [authed]);
  const [ready, setReady] = useState(false);

  // Tracks keys we just wrote locally so realtime echo doesn't overwrite optimistic state.
  const pendingWrites = useRef<Map<string, number>>(new Map());
  // Contact details of enquiries created in this browser session, used to prove
  // ownership when finalizing a donation status server-side.
  const donorContacts = useRef<Map<string, { email: string; phone: string }>>(new Map());

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
    setCache(key, value);
    switch (key) {
      case KEYS.slides: setSlidesState(value); break;
      case KEYS.photos: setPhotosState(value); break;
      case KEYS.driveAlbums: setDriveAlbumsState(value || []); break;
      case KEYS.categories: setCategoriesState(value); break;
      case KEYS.classes: setClassesState(value); break;
      case KEYS.festivals: setFestivalsState(value); break;
      case KEYS.sevas: {
        const list = Array.isArray(value) ? value
          .map((s: any) => ({
            ...s,
            slug: s.slug || s.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || s.id
          })) : [];
        
        // If saved list is missing Sunday Feast or Pushpalankara, merge defaults
        if (list.length > 0) {
          const hasSunday = list.some((s: any) => s.slug === "sunday-feast" || s.id === "s_default_sunday_feast");
          const hasPushpa = list.some((s: any) => s.slug === "nitya-pushpalankara-seva" || s.id === "s_default_pushpalankara");
          let merged = [...list];
          if (!hasSunday) merged = [defaultSevas[0], ...merged];
          if (!hasPushpa) merged = [...merged, defaultSevas[1]];
          setSevasState(merged);
        } else {
          setSevasState(defaultSevas);
        }
        break;
      }
      case KEYS.youth: setYouthState({ ...defaultYouth, ...value }); break;
      case KEYS.harinama: setHarinamaState({ ...defaultHarinama, ...value }); break;
      case KEYS.ekadashi:
        setEkadashiState({
          ...defaultEkadashi,
          ...value,
          templeSchedule: Array.isArray(value?.templeSchedule) && value.templeSchedule.length > 0 ? value.templeSchedule : defaultEkadashi.templeSchedule,
          calendar: Array.isArray(value?.calendar) && value.calendar.length > 0 ? value.calendar : defaultEkadashi.calendar,
        });
        break;
      case KEYS.gitaCourse: setGitaCourseState({ ...defaultGitaCourse, ...value }); break;
      case KEYS.sunday: setSundayState({ ...defaultSunday, ...value }); break;
      case KEYS.prahladaBadi: setPrahladaBadiState({ ...defaultPrahladaBadi, ...value }); break;
      case KEYS.houseProgrammes: {
        let valObj = value;
        if (typeof value === "string") {
          try {
            valObj = JSON.parse(value);
          } catch {
            valObj = {};
          }
        }
        const incoming = { ...defaultHouseProgramme, ...(valObj || {}) };
        setHouseProgrammesState((prev) => {
          const map = new Map<string, HouseProgrammeRequest>();
          (incoming.requests || []).forEach((r: HouseProgrammeRequest) => {
            if (r && r.id) map.set(r.id, r);
          });
          (prev.requests || []).forEach((r: HouseProgrammeRequest) => {
            if (r && r.id && !map.has(r.id)) map.set(r.id, r);
          });
          return {
            ...incoming,
            requests: Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          };
        });
        break;
      }
      case KEYS.dailyDarshan: setDailyDarshanState({ ...defaultDailyDarshan, ...value, entries: Array.isArray(value?.entries) ? value.entries : defaultDailyDarshan.entries }); break;
      case KEYS.liveProgrammes: {
        const rawProgs = Array.isArray(value?.programmes) ? value.programmes : [];
        const cleanedProgs = rawProgs.filter((p: any) => p.id !== "live_sandhya_arati" && p.id !== "live_sb_class" && p.id !== "live_sunday_feast");
        setLiveProgrammesState({ ...defaultLiveProgrammes, ...value, programmes: cleanedProgs });
        break;
      }
      case KEYS.youthYatra: setYouthYatraState({ ...defaultYouthYatra, ...value }); break;
      case KEYS.bhaktiSteps: setBhaktiStepsState({ ...defaultBhaktiSteps, ...value, levels: Array.isArray(value?.levels) && value.levels.length > 0 ? value.levels : defaultBhaktiSteps.levels }); break;
      case KEYS.settings: setSettingsState({ ...defaultSettings, ...value }); break;
      case KEYS.theme: setThemeState(value); break;
      case KEYS.heroBanners: setHeroBannersState({ ...defaultHeroBanners, ...value }); break;
      case KEYS.goshala: setGoshalaState({ ...defaultGoshala, ...value }); break;
      // contacts now live in their own table (contact_messages)
      case KEYS.instagram: setInstagramState({ ...defaultInstagram, ...value }); break;
      case KEYS.templeSchedule: setTempleScheduleState(value || defaultTempleSchedule); break;
      case KEYS.featurePopup: setFeaturePopupState({ ...defaultFeaturePopup, ...value }); break;
      case KEYS.paymentPages: setPaymentPagesState(Array.isArray(value) ? value : defaultPaymentPages); break;
      case KEYS.paymentRecords: setPaymentRecordsState(Array.isArray(value) ? value : defaultPaymentRecords); break;
      case KEYS.upiPayment: setUpiPaymentState({ ...defaultUpiPayment, ...value }); break;
      case KEYS.platformFee: setPlatformFeeState({ ...defaultPlatformFee, ...value }); break;
      case KEYS.previewLeads: setPreviewLeadsState(Array.isArray(value) ? value : []); break;
      case KEYS.terms: setTermsState({ ...defaultTerms, ...value, sections: Array.isArray(value?.sections) ? value.sections : defaultTerms.sections }); break;
      case KEYS.privacy: setPrivacyState({ ...defaultPrivacy, ...value, sections: Array.isArray(value?.sections) ? value.sections : defaultPrivacy.sections }); break;
      case KEYS.receiptSettings: setReceiptSettingsState({ ...defaultReceiptSettings, ...value }); break;

      case KEYS.superAdminPass: if (typeof value === "string") setSuperAdminPassState(value); break;
    }
  }

  async function persist(key: string, value: any) {
    setCache(key, value);
    pendingWrites.current.set(key, Date.now());
    const { error } = await supabase
      .from("site_data")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      pendingWrites.current.delete(key);
      console.error("[site_data] upsert failed", key, error);
      toast.error(`Database save failed for ${key}: ${error.message || error}`);
      return false;
    }
    pendingWrites.current.delete(key);
    return true;
  }

  const setSlides = (v: Slide[]) => { setSlidesState(v); persist(KEYS.slides, v); };
  const setPhotos = (v: GalleryPhoto[]) => { setPhotosState(v); persist(KEYS.photos, v); };
  const setDriveAlbums = (v: DriveAlbum[]) => { setDriveAlbumsState(v); persist(KEYS.driveAlbums, v); };
  const setCategories = (v: string[]) => { setCategoriesState(v); persist(KEYS.categories, v); };
  const setClasses = (v: DailyClass[]) => { setClassesState(v); persist(KEYS.classes, v); };
  const setFestivals = (v: Festival[]) => { setFestivalsState(v); persist(KEYS.festivals, v); };
  const setSevas = (v: Seva[]) => { setSevasState(v); persist(KEYS.sevas, v); };
  const setYouth = (v: YouthData) => { setYouthState(v); persist(KEYS.youth, v); };
  const setHarinama = (v: HarinamaData) => { setHarinamaState(v); persist(KEYS.harinama, v); };
  const setEkadashi = (v: EkadashiData) => { setEkadashiState(v); persist(KEYS.ekadashi, v); };
  const setGitaCourse = (v: GitaCourseData) => { setGitaCourseState(v); persist(KEYS.gitaCourse, v); };
  const setSunday = (v: SundayData) => { setSundayState(v); persist(KEYS.sunday, v); };
  const setPrahladaBadi = (v: PrahladaBadiData) => { setPrahladaBadiState(v); persist(KEYS.prahladaBadi, v); };
  const setHouseProgrammes = (v: HouseProgrammeData) => { setHouseProgrammesState(v); persist(KEYS.houseProgrammes, v); };

  const setDailyDarshan = (v: DailyDarshanData) => { setDailyDarshanState(v); persist(KEYS.dailyDarshan, v); };

  const addDailyDarshanEntry = async (entry: Omit<DailyDarshanItem, "id" | "createdAt">): Promise<string> => {
    const id = "dd_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const newEntry: DailyDarshanItem = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...(dailyDarshan.entries || [])].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    const updated: DailyDarshanData = {
      ...dailyDarshan,
      entries: updatedEntries,
    };
    setDailyDarshanState(updated);
    await persist(KEYS.dailyDarshan, updated);
    return id;
  };

  const updateDailyDarshanEntry = async (id: string, updates: Partial<DailyDarshanItem>) => {
    const updatedEntries = (dailyDarshan.entries || []).map((e) =>
      e.id === id ? { ...e, ...updates } : e
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const updated: DailyDarshanData = {
      ...dailyDarshan,
      entries: updatedEntries,
    };
    setDailyDarshanState(updated);
    await persist(KEYS.dailyDarshan, updated);
  };

  const deleteDailyDarshanEntry = async (id: string) => {
    const updatedEntries = (dailyDarshan.entries || []).filter((e) => e.id !== id);
    const updated: DailyDarshanData = {
      ...dailyDarshan,
      entries: updatedEntries,
    };
    setDailyDarshanState(updated);
    await persist(KEYS.dailyDarshan, updated);
  };

  const setLiveProgrammesData = (v: LiveProgrammeData) => {
    setLiveProgrammesState(v);
    persist(KEYS.liveProgrammes, v);
  };

  const addLiveProgramme = async (prog: Omit<LiveProgrammeItem, "id" | "createdAt">): Promise<string> => {
    const id = "live_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const newProg: LiveProgrammeItem = {
      ...prog,
      id,
      createdAt: new Date().toISOString(),
    };
    // If new programme has manual live override, clear override on all others (only 1 live at a time)
    const existingProgrammes = (liveProgrammes.programmes || []).map((p) =>
      newProg.isManualLiveOverride ? { ...p, isManualLiveOverride: false } : p
    );
    const updatedProgrammes = [newProg, ...existingProgrammes].sort((a, b) => {
      return new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime();
    });
    const updated: LiveProgrammeData = {
      ...liveProgrammes,
      programmes: updatedProgrammes,
    };
    setLiveProgrammesState(updated);
    await persist(KEYS.liveProgrammes, updated);
    return id;
  };

  const updateLiveProgramme = async (id: string, updates: Partial<LiveProgrammeItem>) => {
    const updatedProgrammes = (liveProgrammes.programmes || []).map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      // If setting this programme to manual live override, turn off manual override on all other items (only 1 live at a time)
      if (updates.isManualLiveOverride) {
        return { ...p, isManualLiveOverride: false };
      }
      return p;
    }).sort((a, b) => {
      return new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime();
    });
    const updated: LiveProgrammeData = {
      ...liveProgrammes,
      programmes: updatedProgrammes,
    };
    setLiveProgrammesState(updated);
    await persist(KEYS.liveProgrammes, updated);
  };

  const deleteLiveProgramme = async (id: string) => {
    const updatedProgrammes = (liveProgrammes.programmes || []).filter((p) => p.id !== id);
    const updated: LiveProgrammeData = {
      ...liveProgrammes,
      programmes: updatedProgrammes,
    };
    setLiveProgrammesState(updated);
    await persist(KEYS.liveProgrammes, updated);
  };

  const addHouseProgrammeRequest = async (req: Omit<HouseProgrammeRequest, "id" | "createdAt" | "read" | "status">) => {
    const id = "hp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const createdAt = new Date().toISOString();
    const newEntry: HouseProgrammeRequest = {
      ...req,
      id,
      status: "pending",
      createdAt,
      read: false,
    };

    const updated: HouseProgrammeData = {
      ...houseProgrammes,
      requests: [newEntry, ...(houseProgrammes.requests || [])],
    };

    setHouseProgrammesState(updated);

    // Call server function to persist securely via admin client (bypasses RLS)
    try {
      const { submitHouseProgrammeRequestServer } = await import("@/lib/house-programme.functions");
      const res = await submitHouseProgrammeRequestServer({ data: req });
      if (res?.ok) {
        return;
      }
    } catch (e) {
      console.error("Server submission fallback for House Programme:", e);
    }

    // Direct fallback persist to site_data
    await persist(KEYS.houseProgrammes, updated);

    // Redundant client-side contact_messages backup
    try {
      await supabase.from("contact_messages").insert({
        id,
        name: req.name,
        email: "houseprogramme@iskconkurnool.org",
        phone: req.phone,
        message: JSON.stringify({
          isHouseProgramme: true,
          locationArea: req.locationArea,
          preferredDate: req.preferredDate,
          preferredTime: req.preferredTime,
          participantsCount: req.participantsCount,
          fullAddress: req.fullAddress,
          googleMapsUrl: req.googleMapsUrl,
          latitude: req.latitude,
          longitude: req.longitude,
          message: req.message,
          status: "pending",
        }),
        read: false,
      });
    } catch {
      // non-critical
    }
  };

  const updateHouseProgrammeRequestStatus = async (id: string, status: HouseProgrammeRequest["status"]) => {
    const updatedRequests = (houseProgrammes.requests || []).map((r) =>
      r.id === id ? { ...r, status, read: true } : r
    );
    const updated: HouseProgrammeData = {
      ...houseProgrammes,
      requests: updatedRequests,
    };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);

    try {
      const { data: row } = await supabase.from("contact_messages").select("message").eq("id", id).maybeSingle();
      if (row && row.message) {
        try {
          const parsed = JSON.parse(row.message);
          parsed.status = status;
          await supabase.from("contact_messages").update({ message: JSON.stringify(parsed), read: true }).eq("id", id);
        } catch {
          await supabase.from("contact_messages").update({ read: true }).eq("id", id);
        }
      }
    } catch {
      // non-critical
    }
  };

  const deleteHouseProgrammeRequest = async (id: string) => {
    const updatedRequests = (houseProgrammes.requests || []).filter((r) => r.id !== id);
    const updated: HouseProgrammeData = {
      ...houseProgrammes,
      requests: updatedRequests,
    };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);

    try {
      await supabase.from("contact_messages").delete().eq("id", id);
    } catch {
      // non-critical
    }
  };

  const markAllHouseProgrammeRequestsRead = async () => {
    if (!houseProgrammes.requests || houseProgrammes.requests.length === 0) return;
    const updatedRequests = houseProgrammes.requests.map((r) => ({ ...r, read: true }));
    const updated: HouseProgrammeData = {
      ...houseProgrammes,
      requests: updatedRequests,
    };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);

    try {
      const unreadIds = houseProgrammes.requests.filter((r) => !r.read).map((r) => r.id);
      if (unreadIds.length > 0) {
        await supabase.from("contact_messages").update({ read: true }).in("id", unreadIds);
      }
    } catch {
      // non-critical
    }
  };

  const setYouthYatra = (v: YouthYatraState) => { setYouthYatraState(v); persist(KEYS.youthYatra, v); };

  const addYatraRegistration = async (reg: Omit<YatraRegistration, "id" | "registeredAt" | "read" | "status" | "paymentStatus" | "checkedIn"> & { status?: YatraRegistration["status"]; paymentStatus?: YatraRegistration["paymentStatus"]; checkedIn?: boolean }): Promise<string> => {
    const regYear = youthYatra.events.find(e => e.id === reg.eventId)?.year || new Date().getFullYear();
    const shortYear = String(regYear).slice(-2);
    const count = (youthYatra.registrations || []).filter(r => r.eventId === reg.eventId).length + 1;
    const regId = `YY${shortYear}-${String(count).padStart(5, "0")}`;
    const boardingPassId = `BP${shortYear}-${String(count).padStart(5, "0")}`;
    
    const newEntry: YatraRegistration = {
      ...reg,
      id: regId,
      boardingPassId,
      batch: reg.batch || (reg.gender === "Female" ? "Batch B (Coach 2 - Girls)" : "Batch A (Coach 1 - Boys)"),
      seatNumber: reg.seatNumber || String(count),
      checkedIn: false,
      status: reg.status || (reg.paymentMode === "free" ? "confirmed" : "confirmed"),
      paymentStatus: reg.paymentStatus || (reg.paymentMode === "free" ? "completed" : "pending"),
      registeredAt: new Date().toISOString(),
      read: false,
    };
    
    const updated: YouthYatraState = {
      ...youthYatra,
      registrations: [newEntry, ...(youthYatra.registrations || [])],
    };
    setYouthYatraState(updated);

    try {
      const { submitYatraRegistrationServer } = await import("@/lib/youth-yatra.functions");
      const res = await submitYatraRegistrationServer({ data: reg });
      if (res?.ok && res.regId) {
        return res.regId;
      }
    } catch (e) {
      console.error("Server submission fallback for Youth Yatra:", e);
    }

    await persist(KEYS.youthYatra, updated);
    return regId;
  };

  const updateYatraRegistrationStatus = async (id: string, status: YatraRegistration["status"], paymentStatus?: YatraRegistration["paymentStatus"]) => {
    const updatedRegs = (youthYatra.registrations || []).map((r) =>
      r.id === id ? { ...r, status, ...(paymentStatus ? { paymentStatus } : {}), read: true } : r
    );
    const updated: YouthYatraState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updated);
    await persist(KEYS.youthYatra, updated);
  };

  const deleteYatraRegistration = async (id: string) => {
    const updatedRegs = (youthYatra.registrations || []).filter((r) => r.id !== id);
    const updated: YouthYatraState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updated);
    await persist(KEYS.youthYatra, updated);
  };

  const markAllYatraRegistrationsRead = () => {
    if (!youthYatra.registrations || youthYatra.registrations.length === 0) return;
    const updatedRegs = youthYatra.registrations.map((r) => ({ ...r, read: true }));
    const updated: YouthYatraState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updated);
    persist(KEYS.youthYatra, updated);
  };

  const saveYatraEvent = async (event: YatraEvent) => {
    const exists = youthYatra.events.some(e => e.id === event.id);
    const updatedEvents = exists
      ? youthYatra.events.map(e => e.id === event.id ? event : e)
      : [event, ...youthYatra.events];
    const updated: YouthYatraState = {
      ...youthYatra,
      events: updatedEvents,
      activeEventId: youthYatra.activeEventId || event.id,
    };
    setYouthYatraState(updated);
    await persist(KEYS.youthYatra, updated);
  };

  const deleteYatraEvent = async (eventId: string) => {
    const updatedEvents = youthYatra.events.filter(e => e.id !== eventId);
    const nextActive = updatedEvents[0]?.id || "";
    const updated: YouthYatraState = {
      ...youthYatra,
      events: updatedEvents,
      activeEventId: youthYatra.activeEventId === eventId ? nextActive : youthYatra.activeEventId,
    };
    setYouthYatraState(updated);
    await persist(KEYS.youthYatra, updated);
  };

  const setActiveYatraEvent = async (eventId: string) => {
    const updated: YouthYatraState = {
      ...youthYatra,
      activeEventId: eventId,
    };
    setYouthYatraState(updated);
    await persist(KEYS.youthYatra, updated);
  };

  const checkInYatraParticipant = async (regIdOrQr: string, verifiedBy: string = "IYF Desk Staff"): Promise<{ success: boolean; registration?: YatraRegistration; message: string }> => {
    const clean = regIdOrQr.trim().toUpperCase();
    const found = (youthYatra.registrations || []).find(
      (r) =>
        r.id.toUpperCase() === clean ||
        r.boardingPassId?.toUpperCase() === clean ||
        r.phone.replace(/\D/g, "") === clean.replace(/\D/g, "")
    );
    if (!found) {
      return { success: false, message: `No pilgrim registration found matching "${regIdOrQr}".` };
    }
    if (found.checkedIn) {
      return {
        success: true,
        registration: found,
        message: `Pilgrim ${found.fullName} is ALREADY checked in (at ${new Date(found.checkedInAt || "").toLocaleTimeString()} by ${found.checkedInBy || "Desk"}).`,
      };
    }
    const updatedRegs = (youthYatra.registrations || []).map((r) =>
      r.id === found.id
        ? {
            ...r,
            checkedIn: true,
            checkedInAt: new Date().toISOString(),
            checkedInBy: verifiedBy,
            status: "confirmed" as const,
          }
        : r
    );
    const updatedState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updatedState);
    await persist(KEYS.youthYatra, updatedState);
    const confirmedDevotee = updatedRegs.find((r) => r.id === found.id);
    return {
      success: true,
      registration: confirmedDevotee,
      message: `Boarding Confirmed! Welcome aboard, ${found.fullName} (${found.batch || "Batch A"}, Seat #${found.seatNumber || "Assigned"}).`,
    };
  };

  const undoCheckInYatraParticipant = async (regId: string) => {
    const updatedRegs = (youthYatra.registrations || []).map((r) =>
      r.id === regId
        ? {
            ...r,
            checkedIn: false,
            checkedInAt: undefined,
            checkedInBy: undefined,
          }
        : r
    );
    const updatedState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updatedState);
    await persist(KEYS.youthYatra, updatedState);
  };

  const updateYatraSeatAndBatch = async (regId: string, batch: string, seatNumber: string) => {
    const updatedRegs = (youthYatra.registrations || []).map((r) =>
      r.id === regId
        ? {
            ...r,
            batch,
            seatNumber,
          }
        : r
    );
    const updatedState = { ...youthYatra, registrations: updatedRegs };
    setYouthYatraState(updatedState);
    await persist(KEYS.youthYatra, updatedState);
  };

  const setBhaktiSteps = (v: BhaktiStepsData) => { setBhaktiStepsState(v); persist(KEYS.bhaktiSteps, v); };

  const updateBhaktiStepsConfig = async (config: Partial<BhaktiStepsData>) => {
    const updated: BhaktiStepsData = { ...bhaktiSteps, ...config };
    setBhaktiStepsState(updated);
    await persist(KEYS.bhaktiSteps, updated);
  };

  const addBhaktiStepsRegistration = async (reg: Omit<BhaktiStepsRegistration, "id" | "submittedAt" | "read">): Promise<string> => {
    const count = (bhaktiSteps.registrations || []).length + 1;
    const regId = `BS-${1000 + count}`;
    const newEntry: BhaktiStepsRegistration = {
      ...reg,
      id: regId,
      submittedAt: new Date().toISOString(),
      read: false,
    };
    const updated: BhaktiStepsData = {
      ...bhaktiSteps,
      registrations: [newEntry, ...(bhaktiSteps.registrations || [])],
    };
    setBhaktiStepsState(updated);

    try {
      const { submitBhaktiStepsRegistrationServer } = await import("@/lib/bhakti-steps.functions");
      const res = await submitBhaktiStepsRegistrationServer({ data: reg });
      if (res?.ok && res.regId) {
        return res.regId;
      }
    } catch (e) {
      console.error("Server submission fallback for Bhakti Steps:", e);
    }

    await persist(KEYS.bhaktiSteps, updated);
    return regId;
  };

  const markAllBhaktiStepsRegistrationsRead = () => {
    if (!bhaktiSteps.registrations || bhaktiSteps.registrations.length === 0) return;
    const updatedRegs = bhaktiSteps.registrations.map((r) => ({ ...r, read: true }));
    const updated: BhaktiStepsData = { ...bhaktiSteps, registrations: updatedRegs };
    setBhaktiStepsState(updated);
    persist(KEYS.bhaktiSteps, updated);
  };

  const deleteBhaktiStepsRegistration = async (id: string) => {
    const updatedRegs = (bhaktiSteps.registrations || []).filter((r) => r.id !== id);
    const updated: BhaktiStepsData = { ...bhaktiSteps, registrations: updatedRegs };
    setBhaktiStepsState(updated);
    await persist(KEYS.bhaktiSteps, updated);
  };

  const saveBhaktiStepsLevel = async (level: BhaktiStepsLevel) => {
    const exists = (bhaktiSteps.levels || []).some((l) => l.id === level.id);
    const updatedLevels = exists
      ? (bhaktiSteps.levels || []).map((l) => (l.id === level.id ? level : l))
      : [...(bhaktiSteps.levels || []), level];
    updatedLevels.sort((a, b) => (a.levelNumber || 0) - (b.levelNumber || 0));
    const updated: BhaktiStepsData = { ...bhaktiSteps, levels: updatedLevels };
    setBhaktiStepsState(updated);
    await persist(KEYS.bhaktiSteps, updated);
  };

  const deleteBhaktiStepsLevel = async (levelId: string) => {
    const updatedLevels = (bhaktiSteps.levels || []).filter((l) => l.id !== levelId);
    const updated: BhaktiStepsData = { ...bhaktiSteps, levels: updatedLevels };
    setBhaktiStepsState(updated);
    await persist(KEYS.bhaktiSteps, updated);
  };

  const setSettings = (v: SiteSettings) => { setSettingsState(v); persist(KEYS.settings, v); };
  const setTheme = (v: ThemeSettings) => { setThemeState(v); persist(KEYS.theme, v); };
  const setHeroBanners = (v: HeroBannersData) => { setHeroBannersState(v); persist(KEYS.heroBanners, v); };
  const setGoshala = (v: GoshalaData) => { setGoshalaState(v); persist(KEYS.goshala, v); };
  const setReceiptSettings = (v: ReceiptSettings) => { setReceiptSettingsState(v); persist(KEYS.receiptSettings, v); };
  // Contact messages live in their own table: anyone can submit, only admins read/update/delete.
  const setContacts = async (v: ContactEntry[]) => {
    const prev = contacts;
    setContactsState(v);
    const keepIds = new Set(v.map((c) => c.id));
    const removed = prev.filter((c) => !keepIds.has(c.id)).map((c) => c.id);
    if (removed.length) {
      const { error } = await supabase.from("contact_messages").delete().in("id", removed);
      if (error) console.error("[contact_messages] delete failed", error);
    }
    const prevById = new Map(prev.map((c) => [c.id, c]));
    for (const c of v) {
      const before = prevById.get(c.id);
      if (before && before.read !== c.read) {
        const { error } = await supabase.from("contact_messages").update({ read: c.read }).eq("id", c.id);
        if (error) console.error("[contact_messages] update failed", error);
      }
    }
  };

  const addContactMessage = async (m: { name: string; email: string; phone: string; message: string }) => {
    const { error } = await supabase.from("contact_messages").insert({
      name: m.name.trim().slice(0, 100),
      email: m.email.trim().slice(0, 200),
      phone: m.phone.trim().slice(0, 20),
      message: m.message.trim().slice(0, 5000),
    });
    if (error) {
      console.error("[contact_messages] insert failed", error);
      throw error;
    }
  };

  // Donation enquiries: anyone can submit, only admins read/update/delete.
  const setDonations = async (v: DonationEntry[]) => {
    const prev = donations;
    setDonationsState(v);
    const keepIds = new Set(v.map((d) => d.id));
    const removed = prev.filter((d) => !keepIds.has(d.id)).map((d) => d.id);
    if (removed.length) {
      const { error } = await supabase.from("donation_enquiries").delete().in("id", removed);
      if (error) console.error("[donation_enquiries] delete failed", error);
    }
  };

  const addDonation: AdminState["addDonation"] = async (d) => {
    // anon cannot read rows back, so generate the id client-side
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await supabase
      .from("donation_enquiries")
      .insert({
        id,
        donor_name: d.donorName.trim().slice(0, 100),
        email: d.email.trim().slice(0, 200),
        phone: d.phone.trim().slice(0, 20),
        pan: d.pan?.trim().slice(0, 20) || null,
        purpose: d.purpose?.trim().slice(0, 500) || null,
        seva_title: d.sevaTitle.trim().slice(0, 200),
        option_label: d.optionLabel?.trim().slice(0, 200) || null,
        amount: d.amount,
        status: d.status ?? "initiated",
      });
    if (error) {
      console.error("[donation_enquiries] insert failed", error);
      return null;
    }
    donorContacts.current.set(id, {
      email: d.email.trim().slice(0, 200),
      phone: d.phone.trim().slice(0, 20),
    });
    return id;
  };


  const updateDonationStatus: AdminState["updateDonationStatus"] = async (id, status, paymentRef) => {
    // Admins update directly (allowed by their own access rules).
    if (authed) {
      const { error } = await supabase
        .from("donation_enquiries")
        .update({ status, payment_ref: paymentRef ?? null })
        .eq("id", id);
      if (error) console.error("[donation_enquiries] status update failed", error);
      return;
    }

    // Visitors finalize through the server, which verifies they own the enquiry.
    if (status === "initiated") return;
    const contact = donorContacts.current.get(id);
    if (!contact) return;
    try {
      const res = await finalizeDonationStatus({
        data: { id, email: contact.email, phone: contact.phone, status, paymentRef },
      });
      if (!res?.ok) console.error("[donation_enquiries] status update rejected");
    } catch (e) {
      console.error("[donation_enquiries] status update failed", e);
    }
  };

  const setInstagram = (v: InstagramData) => { setInstagramState(v); persist(KEYS.instagram, v); };
  const setTempleSchedule = (v: TempleScheduleItem[]) => { setTempleScheduleState(v); persist(KEYS.templeSchedule, v); };
  const setFeaturePopup = (fp: FeaturePopupData) => { setFeaturePopupState(fp); persist(KEYS.featurePopup, fp); };
  const setPaymentPages = (p: PaymentPage[]) => { setPaymentPagesState(p); persist(KEYS.paymentPages, p); };
  const setPaymentRecords = (v: PaymentRecord[]) => { setPaymentRecordsState(v); persist(KEYS.paymentRecords, v); };
  const setUpiPayment = (u: UpiPaymentSettings) => { setUpiPaymentState(u); persist(KEYS.upiPayment, u); };
  const setPlatformFee = (pf: PlatformFeeSettings) => { setPlatformFeeState(pf); persist(KEYS.platformFee, pf); };
  
  const addPaymentRecord = async (record: Omit<PaymentRecord, "id" | "date"> & { date?: string }) => {
    const newRecord: PaymentRecord = {
      ...record,
      status: record.status || "Pending",
      id: "payrec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      date: record.date || new Date().toISOString(),
      currency: record.currency || "INR",
      read: false,
    };
    
    let current: PaymentRecord[] = paymentRecords;
    try {
      const { data } = await supabase.from("site_data").select("value").eq("key", KEYS.paymentRecords).maybeSingle();
      if (data && Array.isArray(data.value)) {
        current = data.value as unknown as PaymentRecord[];
      }
    } catch {
      // fallback
    }

    const updated = [newRecord, ...current.filter((item) => item.id !== newRecord.id)];
    setPaymentRecordsState(updated);
    await persist(KEYS.paymentRecords, updated);
  };

  const deletePaymentRecord = async (id: string) => {
    const updated = paymentRecords.filter((item) => item.id !== id);
    setPaymentRecordsState(updated);
    await persist(KEYS.paymentRecords, updated);
  };

  const markAllPaymentRecordsRead = () => {
    if (!paymentRecords || paymentRecords.length === 0) return;
    const updated = paymentRecords.map((r) => ({ ...r, read: true }));
    setPaymentRecordsState(updated);
    persist(KEYS.paymentRecords, updated);
  };

  // Preview leads live in their own table: anyone can submit, only admins can read/delete.
  const setPreviewLeads = async (v: PreviewLead[]) => {
    const keepIds = new Set(v.map((l) => l.id));
    const removed = previewLeads.filter((l) => !keepIds.has(l.id)).map((l) => l.id);
    setPreviewLeadsState(v);
    if (removed.length) {
      const { error } = await supabase.from("preview_leads").delete().in("id", removed);
      if (error) console.error("[preview_leads] delete failed", error);
    }
  };

  const addPreviewLead = async (lead: { name: string; phone: string }) => {
    const { error } = await supabase
      .from("preview_leads")
      .insert({ name: lead.name.trim().slice(0, 100), phone: lead.phone.trim().slice(0, 20) });
    if (error) {
      console.error("[preview_leads] insert failed", error);
      throw error;
    }
  };

  const markAllPreviewLeadsRead = async () => {
    if (!previewLeads || previewLeads.length === 0) return;
    const updated = previewLeads.map((l) => ({ ...l, read: true }));
    setPreviewLeadsState(updated);
  };



  const setTerms = (v: TermsData) => { setTermsState(v); persist(KEYS.terms, v); };
  const setPrivacy = (v: PrivacyData) => { setPrivacyState(v); persist(KEYS.privacy, v); };

  const changeSuperAdminPassword = async (newPass: string) => {
    setSuperAdminPassState(newPass);
    await persist(KEYS.superAdminPass, newPass);
  };

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;
    const r = document.documentElement;
    r.style.setProperty("--primary-hex", theme.primary);
    r.style.setProperty("--secondary-hex", theme.secondary);
    r.style.setProperty("--accent-hex", theme.accent);
  }, [theme]);

  const login = async (emailInput: string, passwordInput: string) => {
    const emailClean = emailInput.trim().toLowerCase();
    const passClean = passwordInput.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailClean,
      password: passClean,
    });
    if (error || !data.user || !data.session) {
      console.error("[admin] login failed", error);
      return { ok: false, error: "Invalid email or password" };
    }

    const isAdmin = await establishAdminState(data.user.id, data.user.email);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return { ok: false, error: "This account does not have administrator access" };
    }
    return { ok: true as const };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setCurrentUser(null);
  };

  return (
    <Ctx.Provider
      value={{
        slides, setSlides,
        photos, setPhotos,
        driveAlbums, setDriveAlbums,
        categories, setCategories,
        classes, setClasses,
        festivals, setFestivals,
        sevas, setSevas,
        youth, setYouth,
        harinama, setHarinama,
        ekadashi, setEkadashi,
        gitaCourse, setGitaCourse,
        sunday, setSunday,
        prahladaBadi, setPrahladaBadi,
        houseProgrammes, setHouseProgrammes, addHouseProgrammeRequest, updateHouseProgrammeRequestStatus, deleteHouseProgrammeRequest, markAllHouseProgrammeRequestsRead,
        dailyDarshan, setDailyDarshan, addDailyDarshanEntry, updateDailyDarshanEntry, deleteDailyDarshanEntry,
        liveProgrammes, setLiveProgrammesData, addLiveProgramme, updateLiveProgramme, deleteLiveProgramme,
        youthYatra, setYouthYatra, addYatraRegistration, updateYatraRegistrationStatus, deleteYatraRegistration, markAllYatraRegistrationsRead, saveYatraEvent, deleteYatraEvent, setActiveYatraEvent,
        checkInYatraParticipant, undoCheckInYatraParticipant, updateYatraSeatAndBatch,
        bhaktiSteps, setBhaktiSteps, updateBhaktiStepsConfig, addBhaktiStepsRegistration, markAllBhaktiStepsRegistrationsRead, deleteBhaktiStepsRegistration, saveBhaktiStepsLevel, deleteBhaktiStepsLevel,
        settings, setSettings,
        theme, setTheme,
        heroBanners, setHeroBanners,
        goshala, setGoshala,
        contacts, setContacts, addContactMessage,
        donations, setDonations, addDonation, updateDonationStatus,
        instagram, setInstagram,
        templeSchedule, setTempleSchedule,
        featurePopup, setFeaturePopup,
        paymentPages, setPaymentPages,
        paymentRecords, setPaymentRecords, addPaymentRecord, deletePaymentRecord, markAllPaymentRecordsRead,
        upiPayment, setUpiPayment,
        platformFee, setPlatformFee,
        previewLeads, setPreviewLeads, addPreviewLead, markAllPreviewLeadsRead,
        terms, setTerms,
        privacy, setPrivacy,
        receiptSettings, setReceiptSettings,
        changeSuperAdminPassword, currentUser,
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

// Cloudinary upload helpers re-exported from @/utils/cloudinary
export { uploadToCloudinary, uploadToCloudinaryDetailed } from "@/utils/cloudinary";
