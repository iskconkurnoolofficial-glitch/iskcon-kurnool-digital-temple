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
};

export const defaultHouseProgramme: HouseProgrammeData = {
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
    razorpayKeyId: "",
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
  familyName?: string;
  occasion: string;
  date: string;
  details: string;
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
  read?: boolean;
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
  houseProgrammes: HouseProgrammeData;
  setHouseProgrammes: (hp: HouseProgrammeData) => void;
  addHouseProgrammeRequest: (req: Omit<HouseProgrammeRequest, "id" | "createdAt" | "read" | "status">) => Promise<void>;
  updateHouseProgrammeRequestStatus: (id: string, status: HouseProgrammeRequest["status"]) => Promise<void>;
  deleteHouseProgrammeRequest: (id: string) => Promise<void>;
  markAllHouseProgrammeRequestsRead: () => void;
  youthYatra: YouthYatraState;
  setYouthYatra: (y: YouthYatraState) => void;
  addYatraRegistration: (reg: Omit<YatraRegistration, "id" | "registeredAt" | "read" | "status" | "paymentStatus"> & { status?: YatraRegistration["status"]; paymentStatus?: YatraRegistration["paymentStatus"] }) => Promise<string>;
  updateYatraRegistrationStatus: (id: string, status: YatraRegistration["status"], paymentStatus?: YatraRegistration["paymentStatus"]) => Promise<void>;
  deleteYatraRegistration: (id: string) => Promise<void>;
  markAllYatraRegistrationsRead: () => void;
  saveYatraEvent: (event: YatraEvent) => Promise<void>;
  deleteYatraEvent: (eventId: string) => Promise<void>;
  setActiveYatraEvent: (eventId: string) => Promise<void>;
  checkInYatraParticipant: (regIdOrQr: string, verifiedBy?: string) => Promise<{ success: boolean; registration?: YatraRegistration; message: string }>;
  undoCheckInYatraParticipant: (regId: string) => Promise<void>;
  updateYatraSeatAndBatch: (regId: string, batch: string, seatNumber: string) => Promise<void>;
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
  platformFee: PlatformFeeSettings;
  setPlatformFee: (pf: PlatformFeeSettings) => void;
  previewLeads: PreviewLead[];
  setPreviewLeads: (leads: PreviewLead[]) => void;
  addPreviewLead: (lead: { name: string; phone: string }) => Promise<void>;
  markAllPreviewLeadsRead: () => void;

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
  houseProgrammes: "houseProgrammes",
  youthYatra: "youthYatra",
  templeSchedule: "templeSchedule",
  featurePopup: "featurePopup",
  paymentPages: "paymentPages",
  paymentRecords: "paymentRecords",
  platformFee: "platformFee",
  previewLeads: "previewLeads",
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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [slides, setSlidesState] = useState<Slide[]>(defaultSlides);
  const [photos, setPhotosState] = useState<GalleryPhoto[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(defaultCategories);
  const [classes, setClassesState] = useState<DailyClass[]>([]);
  const [festivals, setFestivalsState] = useState<Festival[]>([]);
  const [sevas, setSevasState] = useState<Seva[]>(defaultSevas);
  const [youth, setYouthState] = useState<YouthData>(defaultYouth);
  const [harinama, setHarinamaState] = useState<HarinamaData>(defaultHarinama);
  const [ekadashi, setEkadashiState] = useState<EkadashiData>(defaultEkadashi);
  const [gitaCourse, setGitaCourseState] = useState<GitaCourseData>(defaultGitaCourse);
  const [sunday, setSundayState] = useState<SundayData>(defaultSunday);
  const [prahladaBadi, setPrahladaBadiState] = useState<PrahladaBadiData>(defaultPrahladaBadi);
  const [houseProgrammes, setHouseProgrammesState] = useState<HouseProgrammeData>(defaultHouseProgramme);
  const [youthYatra, setYouthYatraState] = useState<YouthYatraState>(defaultYouthYatra);
  const [settings, setSettingsState] = useState<SiteSettings>(defaultSettings);
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [heroBanners, setHeroBannersState] = useState<HeroBannersData>(defaultHeroBanners);
  const [goshala, setGoshalaState] = useState<GoshalaData>(defaultGoshala);
  const [contacts, setContactsState] = useState<ContactEntry[]>([]);
  const [instagram, setInstagramState] = useState<InstagramData>(defaultInstagram);
  const [templeSchedule, setTempleScheduleState] = useState<TempleScheduleItem[]>(defaultTempleSchedule);
  const [featurePopup, setFeaturePopupState] = useState<FeaturePopupData>(defaultFeaturePopup);
  const [paymentPages, setPaymentPagesState] = useState<PaymentPage[]>(defaultPaymentPages);
  const [paymentRecords, setPaymentRecordsState] = useState<PaymentRecord[]>(defaultPaymentRecords);
  const [platformFee, setPlatformFeeState] = useState<PlatformFeeSettings>(defaultPlatformFee);
  const [previewLeads, setPreviewLeadsState] = useState<PreviewLead[]>([]);

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
    switch (key) {
      case KEYS.slides: setSlidesState(value); break;
      case KEYS.photos: setPhotosState(value); break;
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
      case KEYS.ekadashi: setEkadashiState({ ...defaultEkadashi, ...value }); break;
      case KEYS.gitaCourse: setGitaCourseState({ ...defaultGitaCourse, ...value }); break;
      case KEYS.sunday: setSundayState({ ...defaultSunday, ...value }); break;
      case KEYS.prahladaBadi: setPrahladaBadiState({ ...defaultPrahladaBadi, ...value }); break;
      case KEYS.houseProgrammes: setHouseProgrammesState({ ...defaultHouseProgramme, ...value }); break;
      case KEYS.youthYatra: setYouthYatraState({ ...defaultYouthYatra, ...value }); break;
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
      case KEYS.platformFee: setPlatformFeeState({ ...defaultPlatformFee, ...value }); break;
      case KEYS.previewLeads: setPreviewLeadsState(Array.isArray(value) ? value : []); break;

      case KEYS.superAdminPass: if (typeof value === "string") setSuperAdminPassState(value); break;
    }
  }

  async function persist(key: string, value: any) {
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

  const addHouseProgrammeRequest = async (req: Omit<HouseProgrammeRequest, "id" | "createdAt" | "read" | "status">) => {
    const newEntry: HouseProgrammeRequest = {
      ...req,
      id: "hp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      status: "pending",
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updated: HouseProgrammeData = {
      ...houseProgrammes,
      requests: [newEntry, ...(houseProgrammes.requests || [])],
    };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);
  };

  const updateHouseProgrammeRequestStatus = async (id: string, status: HouseProgrammeRequest["status"]) => {
    const updatedRequests = (houseProgrammes.requests || []).map((r) =>
      r.id === id ? { ...r, status, read: true } : r
    );
    const updated: HouseProgrammeData = { ...houseProgrammes, requests: updatedRequests };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);
  };

  const deleteHouseProgrammeRequest = async (id: string) => {
    const updatedRequests = (houseProgrammes.requests || []).filter((r) => r.id !== id);
    const updated: HouseProgrammeData = { ...houseProgrammes, requests: updatedRequests };
    setHouseProgrammesState(updated);
    await persist(KEYS.houseProgrammes, updated);
  };

  const markAllHouseProgrammeRequestsRead = () => {
    if (!houseProgrammes.requests || houseProgrammes.requests.length === 0) return;
    const updatedRequests = houseProgrammes.requests.map((r) => ({ ...r, read: true }));
    const updated: HouseProgrammeData = { ...houseProgrammes, requests: updatedRequests };
    setHouseProgrammesState(updated);
    persist(KEYS.houseProgrammes, updated);
  };

  const setYouthYatra = (v: YouthYatraState) => { setYouthYatraState(v); persist(KEYS.youthYatra, v); };

  const addYatraRegistration = async (reg: Omit<YatraRegistration, "id" | "registeredAt" | "read" | "status" | "paymentStatus"> & { status?: YatraRegistration["status"]; paymentStatus?: YatraRegistration["paymentStatus"] }): Promise<string> => {
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
  const setPlatformFee = (pf: PlatformFeeSettings) => { setPlatformFeeState(pf); persist(KEYS.platformFee, pf); };
  
  const addPaymentRecord = async (record: Omit<PaymentRecord, "id" | "date"> & { date?: string }) => {
    const newRecord: PaymentRecord = {
      ...record,
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
        youthYatra, setYouthYatra, addYatraRegistration, updateYatraRegistrationStatus, deleteYatraRegistration, markAllYatraRegistrationsRead, saveYatraEvent, deleteYatraEvent, setActiveYatraEvent,
        checkInYatraParticipant, undoCheckInYatraParticipant, updateYatraSeatAndBatch,
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
        platformFee, setPlatformFee,
        previewLeads, setPreviewLeads, addPreviewLead, markAllPreviewLeadsRead,
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
