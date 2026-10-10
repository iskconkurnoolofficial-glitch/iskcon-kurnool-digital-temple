import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Image, 
  Images, 
  Sun, 
  Tv, 
  CreditCard, 
  Sparkles, 
  HandHeart, 
  Calendar, 
  Radio, 
  Clock, 
  Award, 
  Ticket, 
  Home, 
  Baby, 
  Users, 
  BookOpen, 
  Music, 
  Leaf, 
  Heart, 
  Mail, 
  Settings, 
  QrCode, 
  FileCheck, 
  FileText, 
  Instagram,
  Search,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

export const Route = createFileRoute("/manage-admin-items")({
  head: () => ({
    meta: [
      { title: "Manage Admin Items — ISKCON Kurnool" },
      { name: "description", content: "Private admin section locking controls." },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: ManageAdminItemsPage,
});

export type AdminSectionItem = {
  id: string;
  label: string;
  category: string;
  icon: any;
};

export const ALL_ADMIN_SECTIONS: AdminSectionItem[] = [
  // Main Content
  { id: "carousel", label: "Carousel Banners", category: "Main Content", icon: Image },
  { id: "heroBanners", label: "Hero Banners", category: "Main Content", icon: Images },
  { id: "gallery", label: "Gallery Photos", category: "Main Content", icon: Images },
  { id: "instagram", label: "Instagram Feed", category: "Main Content", icon: Instagram },

  // Devotional & Programs
  { id: "dailyDarshan", label: "Daily Darshan", category: "Devotional & Programs", icon: Sun },
  { id: "liveProgrammes", label: "Live Broadcasts", category: "Devotional & Programs", icon: Tv },
  { id: "paymentPages", label: "Donations & Payment Records", category: "Devotional & Programs", icon: CreditCard },
  { id: "festivals", label: "Upcoming Festivals", category: "Devotional & Programs", icon: Sparkles },
  { id: "sevas", label: "Jagannath Sevas", category: "Devotional & Programs", icon: HandHeart },
  { id: "sunday", label: "Sunday Program", category: "Devotional & Programs", icon: Calendar },
  { id: "classes", label: "Daily Classes", category: "Devotional & Programs", icon: Radio },
  { id: "templeSchedule", label: "Temple Schedule", category: "Devotional & Programs", icon: Clock },

  // Community Focus
  { id: "bhaktiSteps", label: "Bhakti Steps (5 Levels)", category: "Community Focus", icon: Award },
  { id: "lifePatron", label: "Life Patron Membership", category: "Community Focus", icon: Ticket },
  { id: "houseProgrammes", label: "House Programmes", category: "Community Focus", icon: Home },
  { id: "prahladaBadi", label: "Prahlada Badi", category: "Community Focus", icon: Baby },
  { id: "youth", label: "Youth Festival", category: "Community Focus", icon: Users },
  { id: "gita", label: "Gita Course", category: "Community Focus", icon: BookOpen },
  { id: "harinama", label: "Harinama", category: "Community Focus", icon: Music },
  { id: "ekadashi", label: "Ekadashi Vratam", category: "Community Focus", icon: Leaf },
  { id: "goshala", label: "Goshala Seva", category: "Community Focus", icon: Heart },

  // Site Settings
  { id: "contacts", label: "Contact Messages", category: "Site Settings", icon: Mail },
  { id: "settings", label: "Site Settings", category: "Site Settings", icon: Settings },
  { id: "upiSettings", label: "UPI QR & Bank Settings", category: "Site Settings", icon: QrCode },
  { id: "receiptSettings", label: "Donation Receipt Design", category: "Site Settings", icon: FileCheck },
  { id: "terms", label: "Terms & Conditions", category: "Site Settings", icon: FileText },
  { id: "privacy", label: "Privacy Policy", category: "Site Settings", icon: ShieldCheck },
];

function ManageAdminItemsPage() {
  const { authed, login, settings, toggleLockAdminSection, isSectionLocked } = useAdmin();
  
  // Login State for Private Access
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Section Management State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Main Content", "Devotional & Programs", "Community Focus", "Site Settings"];

  // Gate page: If user is not authenticated as admin, display private login screen
  if (!authed) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2d1254] via-[#1a0836] to-[#0d031c] grid place-items-center px-4 py-12 font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/30 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl group-hover:bg-amber-400/50 transition-all duration-300" />
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="ISKCON Kurnool Logo"
                  className="relative h-20 w-20 rounded-full object-cover mx-auto ring-4 ring-amber-400/80 shadow-xl"
                />
              ) : (
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 grid place-items-center text-slate-950 font-display font-black text-2xl mx-auto shadow-xl ring-4 ring-amber-400/80">
                  IK
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Private Admin Access
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Log in to manage section lock permissions
              </p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setErr("");
              const res = await login(email, pw);
              setBusy(false);
              if (!res.ok) {
                setErr(res.error || "Invalid credentials");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email / Username <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="superadmin@iskconkurnool.in"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter admin password"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setErr(""); }}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer rounded-lg hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{err}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>{busy ? "Authenticating..." : "Login to Permission Control"}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredSections = ALL_ADMIN_SECTIONS.filter((sec) => {
    const matchesSearch = sec.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sec.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sec.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCount = ALL_ADMIN_SECTIONS.length;
  const lockedCount = ALL_ADMIN_SECTIONS.filter((sec) => isSectionLocked(sec.id)).length;
  const unlockedCount = totalCount - lockedCount;

  const handleToggleLock = (sec: AdminSectionItem) => {
    const isCurrentlyLocked = isSectionLocked(sec.id);
    toggleLockAdminSection(sec.id);
    if (isCurrentlyLocked) {
      toast.success(`🔓 Unlocked "${sec.label}". Admin can now access this section.`);
    } else {
      toast.error(`🔒 Locked "${sec.label}". Admin access restricted.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* Private Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Panel
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">|</span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Private Permission Controls
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <Home className="h-3.5 w-3.5" /> Public Site
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        
        {/* Header Card with Logo & Stats */}
        <div className="bg-gradient-to-br from-[#2a0e4b] via-[#3a1366] to-[#1a0833] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            {settings.logo ? (
              <img
                src={getOptimizedCloudinaryUrl(settings.logo, "thumbnail")}
                alt="ISKCON Kurnool Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-400/80 shadow-2xl shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-2xl grid place-items-center ring-4 ring-amber-400/80 shadow-2xl shrink-0 font-display">
                IK
              </div>
            )}

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> Admin Permission Manager
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                Admin Panel Sections
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-sans">
                Click the lock icon on any section to lock or unlock admin access.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-200 block">Total Sections</span>
              <span className="text-xl font-black text-white font-mono">{totalCount}</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 block">Unlocked</span>
              <span className="text-xl font-black text-emerald-300 font-mono">{unlockedCount}</span>
            </div>
            <div className="bg-red-500/20 backdrop-blur-md border border-red-400/40 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-300 block">Locked</span>
              <span className="text-xl font-black text-red-300 font-mono">{lockedCount}</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search section name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-amber-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Items Grid: Logo, Title only, Lock Icon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredSections.map((sec) => {
            const IconComp = sec.icon;
            const locked = isSectionLocked(sec.id);

            return (
              <div
                key={sec.id}
                className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex items-center justify-between gap-3 shadow-xs ${
                  locked
                    ? "bg-gradient-to-br from-red-50/90 via-white to-amber-50/60 border-red-300/80 ring-2 ring-red-400/30"
                    : "bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-amber-500/30"
                }`}
              >
                {/* Left: Logo / Icon + Title Only */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                      locked
                        ? "bg-red-600 text-white"
                        : "bg-amber-100/80 text-amber-900 border border-amber-300/50"
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans font-extrabold text-xs sm:text-sm text-slate-900 leading-snug truncate">
                      {sec.label}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
                      locked ? "text-red-600" : "text-emerald-600"
                    }`}>
                      {locked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                </div>

                {/* Right: Interactive Lock Icon Button */}
                <button
                  type="button"
                  onClick={() => handleToggleLock(sec)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 shadow-sm active:scale-90 ${
                    locked
                      ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300 shadow-red-500/30"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                  }`}
                  title={locked ? `Click to Unlock ${sec.label}` : `Click to Lock ${sec.label}`}
                  aria-label={locked ? `Unlock ${sec.label}` : `Lock ${sec.label}`}
                >
                  {locked ? (
                    <Lock className="h-4.5 w-4.5 animate-pulse" />
                  ) : (
                    <Unlock className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Admin Sections Found</h4>
            <p className="text-xs text-slate-500">Try clearing your search term or selecting a different category filter.</p>
          </div>
        )}

      </main>
    </div>
  );
}
