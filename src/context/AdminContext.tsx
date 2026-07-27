import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  slug?: string;
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
  aboutText: string;
  aboutImage: string;
  gallery: HarinamaGalleryItem[];
};

export const defaultHarinama: HarinamaData = {
  whatsappUrl: "https://chat.whatsapp.com/LhB20hR5J1T7xVvH7Hk9y3",
  instagramHandle: "iskconkurnool",
  scheduleDay: "Every Saturday",
  scheduleTime: "5:00 PM onwards",
  meetingPoint: "ISKCON Kurnool Temple, Sri Sri Puri Jagannath Temple",
  aboutText: "Hari Nama Sankeerthana is the congregational chanting of the holy names of Krishna — Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare — carried out loudly, joyfully, and publicly, usually while walking through streets, markets, and neighborhoods.\n\nThis practice was given special emphasis by Sri Chaitanya Mahaprabhu, who taught that in this age, chanting the names of God together, in public, is the easiest and most powerful way to purify the heart and connect with the Divine. It doesn't require Sanskrit knowledge, ritual expertise, or any qualification — anyone who joins, chants, or even simply hears, benefits.\n\nAt ISKCON Kurnool, Hari Nama Sankeerthana is not a performance — it's an offering. Devotees walk together with mridangam and karatalas, singing, dancing, and inviting the whole town to taste a moment of transcendence in the middle of an ordinary day.",
  aboutImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
  gallery: [],
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
};

export const defaultSunday: SundayData = {
  description: "Experience a spiritually uplifting Sunday at ISKCON Kurnool. Join devotees for devotional chanting, enlightening Bhagavad Gita discourse, darshan, and delicious prasadam. Everyone is welcome.",
  scheduleTitle: "Weekly Schedule (Every Sunday)",
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
  ]
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
  gallery: string;
  goshala: string;
  prahladaBadi: string;
  sunday: string;
  harinama: string;
  youth: string;
  donate: string;
  ekadashi: string;
  shop: string;
  temple: string;
  socialMedia: string;
};

export const defaultHeroBanners: HeroBannersData = {
  aboutKurnool: "",
  aboutFounder: "",
  aboutIskcon: "",
  aboutMission: "",
  connect: "",
  courses: "",
  festivals: "",
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
};

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
};

export const defaultEkadashi: EkadashiData = {
  badge: "Sacred Observance",
  title: "Ekadashi — The Mother of Devotion",
  subtitle: "Rules and Guidelines for Observance",
  image: "",
  imageQuote: "Fasting on Ekadashi is dear to Lord Vishnu.",
  avoidTitle: "Avoid on Ekadashi",
  avoidItems: [
    "Grains, lentils / pulses, chickpeas, corn",
    "Certain vegetables (ridge gourd, beans)",
    "Peas",
  ],
  permitTitle: "Permitted on Ekadashi",
  permitItems: [
    "Fruits, milk",
    "Dry fruits (cashew, almond, pistachio, raisins)",
    "Root vegetables / tubers",
    "Sabudana (sago), Samalu (barnyard millet)",
  ],
  tulsiTitle: "About Tulsi",
  tulsiBody:
    "Do not pluck Tulsi leaves on Ekadashi or on Dwadashi (the day after). If Tulsi is needed for worship, it should be picked the day before.",
  purposeTitle: "Purpose of Ekadashi",
  purposeBody:
    "Ekadashi is a day to minimize our bodily needs and instead increase our hearing, chanting, and remembrance of the Holy Name of the Lord. By simplifying eating and daily activity, the mind becomes free to absorb itself in devotional service and the glories of Krishna.",
  morningTitle: "Morning Practice",
  morningSteps: [
    "Worship the deity of Krishna with devotion.",
    "Offer incense, a lamp, Tulsi (picked the day before), fruits, and flowers.",
    "Pray sincerely for the mercy of Lord Vishnu.",
  ],
  mantra:
    "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Rama Hare Rama, Rama Rama Hare Hare",
  warningTitle: "Strictly Avoid",
  warningBody:
    "Meat, fish, eggs, mushrooms, alcohol, onion, garlic, intoxicants (cigarettes, tobacco), and other tamasic substances should be strictly avoided — not only on Ekadashi, but as a practice of pure devotional life.",
  dwadashiTitle: "Dwadashi — Breaking the Fast",
  dwadashiBody:
    "On Dwadashi (the day after Ekadashi), wake early, bathe, and worship Lord Vishnu. Break the fast at the prescribed Parana time.",
  dwadashiNote:
    "Note: The Parana timing changes for every Ekadashi — always check the calendar for the correct window.",
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
};

export const defaultGitaCourse: GitaCourseData = {
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
};

export type PreviewLead = {
  id: string;
  name: string;
  phone: string;
  date: string;
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
  facebook?: string;
  welcomeImage?: string;
  launchPageActive?: boolean;
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
  type: "text" | "email" | "phone" | "number" | "select";
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

export const defaultPaymentPages: PaymentPage[] = [
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
  previewLeads: PreviewLead[];
  setPreviewLeads: (leads: PreviewLead[]) => void;
  addPreviewLead: (lead: { name: string; phone: string }) => Promise<void>;
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
  facebook: "https://facebook.com/iskconkurnool",
  welcomeImage: "",
  launchPageActive: false,
  launchDate: "2026-07-15T09:00:00",
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

const defaultSlides: Slide[] = [];

// Keys used in the site_data table
const KEYS = {
  slides: "slides",
  photos: "photos",
  categories: "categories",
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
  templeSchedule: "templeSchedule",
  featurePopup: "featurePopup",
  paymentPages: "paymentPages",
  previewLeads: "previewLeads",
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
  const [harinama, setHarinamaState] = useState<HarinamaData>(defaultHarinama);
  const [ekadashi, setEkadashiState] = useState<EkadashiData>(defaultEkadashi);
  const [gitaCourse, setGitaCourseState] = useState<GitaCourseData>(defaultGitaCourse);
  const [sunday, setSundayState] = useState<SundayData>(defaultSunday);
  const [prahladaBadi, setPrahladaBadiState] = useState<PrahladaBadiData>(defaultPrahladaBadi);
  const [settings, setSettingsState] = useState<SiteSettings>(defaultSettings);
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [heroBanners, setHeroBannersState] = useState<HeroBannersData>(defaultHeroBanners);
  const [goshala, setGoshalaState] = useState<GoshalaData>(defaultGoshala);
  const [contacts, setContactsState] = useState<ContactEntry[]>([]);
  const [instagram, setInstagramState] = useState<InstagramData>(defaultInstagram);
  const [templeSchedule, setTempleScheduleState] = useState<TempleScheduleItem[]>(defaultTempleSchedule);
  const [featurePopup, setFeaturePopupState] = useState<FeaturePopupData>(defaultFeaturePopup);
  const [paymentPages, setPaymentPagesState] = useState<PaymentPage[]>(defaultPaymentPages);
  const [previewLeads, setPreviewLeadsState] = useState<PreviewLead[]>([]);
  const [donations, setDonationsState] = useState<DonationEntry[]>([]);
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
      setContactsState(
        (data ?? []).map((r) => ({
          id: r.id, name: r.name, email: r.email, phone: r.phone,
          message: r.message, read: r.read, date: r.created_at,
        })),
      );
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
      case KEYS.sevas: {
        const list = Array.isArray(value) ? value.map((s: any) => ({
          ...s,
          slug: s.slug || s.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || s.id
        })) : [];
        setSevasState(list);
        break;
      }
      case KEYS.youth: setYouthState({ ...defaultYouth, ...value }); break;
      case KEYS.harinama: setHarinamaState({ ...defaultHarinama, ...value }); break;
      case KEYS.ekadashi: setEkadashiState({ ...defaultEkadashi, ...value }); break;
      case KEYS.gitaCourse: setGitaCourseState({ ...defaultGitaCourse, ...value }); break;
      case KEYS.sunday: setSundayState({ ...defaultSunday, ...value }); break;
      case KEYS.prahladaBadi: setPrahladaBadiState({ ...defaultPrahladaBadi, ...value }); break;
      case KEYS.settings: setSettingsState({ ...defaultSettings, ...value }); break;
      case KEYS.theme: setThemeState(value); break;
      case KEYS.heroBanners: setHeroBannersState({ ...defaultHeroBanners, ...value }); break;
      case KEYS.goshala: setGoshalaState({ ...defaultGoshala, ...value }); break;
      // contacts now live in their own table (contact_messages)
      case KEYS.instagram: setInstagramState({ ...defaultInstagram, ...value }); break;
      case KEYS.templeSchedule: setTempleScheduleState(value || defaultTempleSchedule); break;
      case KEYS.featurePopup: setFeaturePopupState({ ...defaultFeaturePopup, ...value }); break;
      case KEYS.paymentPages: setPaymentPagesState(Array.isArray(value) ? value : defaultPaymentPages); break;
      
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
  const setHarinama = (v: HarinamaData) => { setHarinamaState(v); persist(KEYS.harinama, v); };
  const setEkadashi = (v: EkadashiData) => { setEkadashiState(v); persist(KEYS.ekadashi, v); };
  const setGitaCourse = (v: GitaCourseData) => { setGitaCourseState(v); persist(KEYS.gitaCourse, v); };
  const setSunday = (v: SundayData) => { setSundayState(v); persist(KEYS.sunday, v); };
  const setPrahladaBadi = (v: PrahladaBadiData) => { setPrahladaBadiState(v); persist(KEYS.prahladaBadi, v); };
  const setSettings = (v: SiteSettings) => { setSettingsState(v); persist(KEYS.settings, v); };
  const setTheme = (v: ThemeSettings) => { setThemeState(v); persist(KEYS.theme, v); };
  const setHeroBanners = (v: HeroBannersData) => { setHeroBannersState(v); persist(KEYS.heroBanners, v); };
  const setGoshala = (v: GoshalaData) => { setGoshalaState(v); persist(KEYS.goshala, v); };
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
    return id;
  };


  const updateDonationStatus: AdminState["updateDonationStatus"] = async (id, status, paymentRef) => {
    const { error } = await supabase
      .from("donation_enquiries")
      .update({ status, payment_ref: paymentRef ?? null })
      .eq("id", id);
    if (error) console.error("[donation_enquiries] status update failed", error);
  };

  const setInstagram = (v: InstagramData) => { setInstagramState(v); persist(KEYS.instagram, v); };
  const setTempleSchedule = (v: TempleScheduleItem[]) => { setTempleScheduleState(v); persist(KEYS.templeSchedule, v); };
  const setFeaturePopup = (fp: FeaturePopupData) => { setFeaturePopupState(fp); persist(KEYS.featurePopup, fp); };
  const setPaymentPages = (p: PaymentPage[]) => { setPaymentPagesState(p); persist(KEYS.paymentPages, p); };
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
        harinama, setHarinama,
        ekadashi, setEkadashi,
        gitaCourse, setGitaCourse,
        sunday, setSunday,
        prahladaBadi, setPrahladaBadi,
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
        previewLeads, setPreviewLeads, addPreviewLead,
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
