import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import CarouselManager from "@/admin/CarouselManager";
import GalleryManager from "@/admin/GalleryManager";
import SiteSettingsForm from "@/admin/SiteSettings";
import DailyClassesManager from "@/admin/DailyClassesManager";
import FestivalsManager from "@/admin/FestivalsManager";
import SevasManager from "@/admin/SevasManager";
import YouthManager from "@/admin/YouthManager";
import HarinamaManager from "@/admin/HarinamaManager";
import EkadashiManager from "@/admin/EkadashiManager";
import GitaCourseManager from "@/admin/GitaCourseManager";
import SundayManager from "@/admin/SundayManager";
import HeroBannersManager from "@/admin/HeroBannersManager";
import GoshalaManager from "@/admin/GoshalaManager";
import ContactsManager from "@/admin/ContactsManager";
import InstagramManager from "@/admin/InstagramManager";
import PrahladaBadiManager from "@/admin/PrahladaBadiManager";
import HouseProgrammesManager from "@/admin/HouseProgrammesManager";
import TempleScheduleManager from "@/admin/TempleScheduleManager";
import FeaturePopupManager from "@/admin/FeaturePopupManager";
import PaymentPagesManager from "@/admin/PaymentPagesManager";
import YouthYatraManager from "@/admin/YouthYatraManager";
import DailyDarshanManager from "@/admin/DailyDarshanManager";
import LiveProgrammeManager from "@/admin/LiveProgrammeManager";
import BhaktiStepsManager from "@/admin/BhaktiStepsManager";
import TermsManager from "@/admin/TermsManager";
import PrivacyManager from "@/admin/PrivacyManager";
import ReceiptSettingsManager from "@/admin/ReceiptSettingsManager";
import UpiSettingsManager from "@/admin/UpiSettingsManager";
import LiveLaunchManager from "@/admin/LiveLaunchManager";
import { LayoutDashboard, Image, Images, Settings, Palette, LogOut, Home, Radio, Sparkles, HandHeart, Users, Leaf, Music, BookOpen, Calendar, Heart, Mail, AlertTriangle, FileSpreadsheet, Instagram, Baby, Search, Clock, Menu, X, ArrowLeft, ChevronRight, Megaphone, CreditCard, Video, Bell, ShieldCheck, Compass, Sun, Tv, Award, FileText, Lock, FileCheck, QrCode, Eye, EyeOff, Rocket } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ISKCON Kurnool" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "welcome" | "liveLaunch" | "dailyDarshan" | "liveProgrammes" | "carousel" | "festivals" | "sevas" | "bhaktiSteps" | "youth" | "youthYatra" | "houseProgrammes" | "harinama" | "ekadashi" | "gita" | "sunday" | "classes" | "gallery" | "settings" | "upiSettings" | "receiptSettings" | "terms" | "privacy" | "heroBanners" | "goshala" | "contacts" | "instagram" | "prahladaBadi" | "templeSchedule" | "featurePopup" | "paymentPages";

function AdminPage() {
  const { authed, login, logout, settings, contacts, setContacts, paymentRecords, houseProgrammes, markAllHouseProgrammeRequestsRead, markAllPaymentRecordsRead, youthYatra, markAllYatraRegistrationsRead, bhaktiSteps, markAllBhaktiStepsRegistrationsRead, currentUser } = useAdmin();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("welcome");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  // Automatically mark section notifications as read when admin opens that section
  useEffect(() => {
    if (tab === "contacts" && contacts && contacts.some((c) => !c.read)) {
      setContacts(contacts.map((c) => ({ ...c, read: true })));
    } else if (tab === "paymentPages" && paymentRecords && paymentRecords.some((p) => !p.read)) {
      markAllPaymentRecordsRead();
    } else if (tab === "houseProgrammes" && houseProgrammes?.requests && houseProgrammes.requests.some((r) => !r.read)) {
      markAllHouseProgrammeRequestsRead();
    } else if (tab === "youthYatra" && youthYatra?.registrations && youthYatra.registrations.some((r) => !r.read)) {
      markAllYatraRegistrationsRead();
    } else if (tab === "bhaktiSteps" && bhaktiSteps?.registrations && bhaktiSteps.registrations.some((r) => !r.read)) {
      markAllBhaktiStepsRegistrationsRead();
    }
  }, [tab]);

  const unreadMessagesCount = (contacts || []).filter((c) => !c.read).length;
  const unreadDonationsCount = (paymentRecords || []).filter((p) => !p.read).length;
  const unreadHouseProgrammesCount = (houseProgrammes?.requests || []).filter((r) => !r.read).length;
  const unreadYouthYatraCount = (youthYatra?.registrations || []).filter((r) => !r.read).length;
  const unreadBhaktiStepsCount = (bhaktiSteps?.registrations || []).filter((r) => !r.read).length;
  const totalUnreadCount = unreadMessagesCount + unreadDonationsCount + unreadHouseProgrammesCount + unreadYouthYatraCount + unreadBhaktiStepsCount;

  const getBadgeCount = (id: Tab): number => {
    if (id === "contacts") return unreadMessagesCount;
    if (id === "paymentPages") return unreadDonationsCount;
    if (id === "houseProgrammes") return unreadHouseProgrammesCount;
    if (id === "youthYatra") return unreadYouthYatraCount;
    if (id === "bhaktiSteps") return unreadBhaktiStepsCount;
    return 0;
  };

  const expiredContacts = (contacts || []).filter((c) => {
    const ageMs = Date.now() - new Date(c.date).getTime();
    return ageMs >= 25 * 24 * 60 * 60 * 1000;
  });
  const hasExpired = expiredContacts.length > 0;

  const handleForceExportAndReset = () => {
    if (!contacts || contacts.length === 0) return;
    
    // CSV export
    const headers = ["ID", "Name", "Email", "Phone", "Message", "Submission Date", "Status"];
    const rows = contacts.map((c) => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.message.replace(/"/g, '""'),
      new Date(c.date).toLocaleString(),
      c.read ? "Read" : "Unread"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `iskcon_kurnool_contact_messages_backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset contacts
    setContacts([]);
  };

  if (!authed) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2d1254] via-[#1a0836] to-[#0d031c] grid place-items-center px-4 py-12 font-sans">
        {/* Soft glowing ambient background light orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f5c518_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/30 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] space-y-6 animate-fade-in">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl group-hover:bg-amber-400/50 transition-all duration-300" />
              {settings.logo ? (
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
                Admin Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Sri Sri Puri Jagannath Temple, ISKCON Kurnool
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setErr("");
              const res = await login(email, pw);
              setBusy(false);
              if (res.ok) {
                setShowSplash(true);
              } else {
                setErr(res.error || "Invalid credentials");
              }
            }}
            className="space-y-4"
          >
            {/* Email Field */}
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

            {/* Password Field with Eye Toggle */}
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
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
              <ShieldCheck className="h-4 w-4 text-slate-950" />
              <span>{busy ? "Authenticating..." : "Sign In to Dashboard"}</span>
            </button>
          </form>

          {/* Footer Helper Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-amber-600 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Public Site</span>
            </Link>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Protected Portal
            </span>
          </div>
        </div>
      </div>
    );
  }

  const allGroups: {
    title: string;
    items: { id: Tab; label: string; icon: any }[];
  }[] = [
    {
      title: "Main Content",
      items: [
        { id: "featurePopup", label: "Feature Pop-Up", icon: Megaphone },
        { id: "carousel", label: "Carousel Banners", icon: Image },
        { id: "heroBanners", label: "Hero Banners", icon: Images },
        { id: "gallery", label: "Gallery Photos", icon: Images },
        { id: "instagram", label: "Instagram Feed", icon: Instagram },
      ]
    },

    {
      title: "Devotional & Programs",
      items: [
        { id: "dailyDarshan", label: "Daily Darshan", icon: Sun },
        { id: "liveProgrammes", label: "Live Broadcasts", icon: Tv },
        { id: "paymentPages", label: "Donations & Payment Records", icon: CreditCard },
        { id: "festivals", label: "Upcoming Festivals", icon: Sparkles },
        { id: "sevas", label: "Jagannath Sevas", icon: HandHeart },
        { id: "sunday", label: "Sunday Program", icon: Calendar },
        { id: "classes", label: "Daily Classes", icon: Radio },
        { id: "templeSchedule", label: "Temple Schedule", icon: Clock },
      ]
    },
    {
      title: "Community Focus",
      items: [
        { id: "bhaktiSteps", label: "Bhakti Steps (5 Levels)", icon: Award },
        { id: "houseProgrammes", label: "House Programmes", icon: Home },
        { id: "prahladaBadi", label: "Prahlada Badi", icon: Baby },
        { id: "youth", label: "Youth Festival", icon: Users },
        { id: "gita", label: "Gita Course", icon: BookOpen },
        { id: "harinama", label: "Harinama", icon: Music },
        { id: "ekadashi", label: "Ekadashi Vratam", icon: Leaf },
        { id: "goshala", label: "Goshala Seva", icon: Heart },
      ]
    },
    {
      title: "Site Settings",
      items: [
        { id: "liveLaunch", label: "🚀 Live Website Launch", icon: Rocket },
        { id: "contacts", label: "Contact Messages", icon: Mail },
        { id: "settings", label: "Site Settings", icon: Settings },
        { id: "upiSettings", label: "UPI QR & Bank Settings", icon: QrCode },
        { id: "receiptSettings", label: "Receipt & 80G Design", icon: FileCheck },
        { id: "terms", label: "Terms & Conditions", icon: FileText },
        { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
      ]
    }
  ];

  const groups = allGroups;
  const tabs = groups.flatMap((g) => g.items);

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-surface overflow-hidden relative">
      <AnimatePresence>
        {showSplash && <AdminIntroSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Forced Export Modal when 25-day limit reached */}
      {hasExpired && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-amber-200 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 animate-bounce text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-primary">Export Required</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contact submissions have reached the 25-day retention limit. You must export these submissions to Excel to reset the storage before accessing the dashboard.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl text-left text-xs text-muted-foreground space-y-1">
              <p><strong>Expired Messages:</strong> {expiredContacts.length}</p>
              <p><strong>Total Backup Size:</strong> {(contacts || []).length} entries</p>
            </div>
            <button
              onClick={handleForceExportAndReset}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/35 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-5 w-5" /> Export &amp; Reset Messages
            </button>
          </div>
        </div>
      )}

      {/* MOBILE STICKY TOP APP HEADER */}
      <header className="md:hidden bg-gradient-to-r from-primary via-[#3d1a6a] to-primary text-white border-b border-white/10 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-md z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1.5 rounded-xl text-white/90 hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>
          <div className="flex items-center gap-2">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-7 w-7 rounded-full object-cover ring-1 ring-secondary/60 shadow-sm" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-secondary text-primary font-bold text-xs flex items-center justify-center">IK</div>
            )}
            <div>
              <h1 className="font-display text-xs font-bold leading-tight tracking-wide">ISKCON ADMIN</h1>
              <p className="text-[10px] text-white/80 font-medium truncate max-w-[120px]">
                {tab === "welcome" ? "Dashboard" : tabs.find(t => t.id === tab)?.label}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {totalUnreadCount > 0 && (
            <button
              onClick={() => setTab("welcome")}
              className="relative p-2 rounded-xl text-white/90 hover:bg-white/10 active:bg-white/20 transition cursor-pointer"
              title={`${totalUnreadCount} unread notifications`}
            >
              <Bell className="h-4 w-4 text-amber-300 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-primary">
                {totalUnreadCount}
              </span>
            </button>
          )}
          <Link
            to="/"
            className="p-2 rounded-xl text-white/90 hover:bg-white/10 active:bg-white/20 transition cursor-pointer flex items-center gap-1 text-xs"
            title="View Public Site"
          >
            <Home className="h-4 w-4" />
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-rose-200 hover:bg-rose-500/20 active:bg-rose-500/30 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MOBILE HORIZONTAL SCROLL PILL TABS BAR */}
      <div 
        className="md:hidden bg-gradient-to-r from-[#2a114e] to-[#3b1767] border-b border-white/10 px-2.5 py-2 overflow-x-auto flex items-center gap-2 shrink-0 z-25 shadow-xs touch-pan-x no-scrollbar overscroll-x-contain" 
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        <button
          onClick={() => setTab("welcome")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            tab === "welcome"
              ? "bg-secondary text-primary shadow-sm ring-1 ring-white/20"
              : "bg-white/10 text-white/85 hover:bg-white/20"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        {tabs.map((t) => {
          const Icon = t.icon;
          const cnt = getBadgeCount(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                tab === t.id
                  ? "bg-secondary text-primary shadow-sm ring-1 ring-white/20"
                  : "bg-white/10 text-white/85 hover:bg-white/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
              {cnt > 0 && (
                <span className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-extrabold text-white">
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MOBILE SLIDE-OVER APP DRAWER SHEET */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer Container */}
          <div className="relative ml-0 mr-auto w-[85%] max-w-[310px] h-full bg-gradient-to-b from-primary via-[#3d1a6a] to-primary text-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/10">
              <div className="flex items-center gap-3">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-9 w-9 rounded-full object-cover ring-2 ring-secondary/60 shadow-md" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-secondary text-primary font-bold text-xs flex items-center justify-center shadow-md">IK</div>
                )}
                <div>
                  <h2 className="font-display font-bold text-sm">ISKCON Kurnool</h2>
                  <p className="text-[10px] text-white/70">Admin Mobile App</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition cursor-pointer text-white/90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Module Search */}
            <div className="p-3 border-b border-white/10 bg-black/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search admin modules..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-secondary/70"
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Scrollable Nav Items */}
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15">
              <button
                onClick={() => { setTab("welcome"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                  tab === "welcome"
                    ? "bg-secondary text-primary font-bold shadow-md"
                    : "hover:bg-white/10 active:bg-white/20 text-white/90"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
                  <span>Dashboard Home</span>
                </div>
                {totalUnreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
                    {totalUnreadCount}
                  </span>
                )}
              </button>

              {groups.map((group) => {
                const filteredItems = group.items.filter(item => 
                  item.label.toLowerCase().includes(drawerSearch.toLowerCase())
                );
                if (drawerSearch && filteredItems.length === 0) return null;

                return (
                  <div key={group.title} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 py-1 select-none">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {(drawerSearch ? filteredItems : group.items).map((t) => {
                        const cnt = getBadgeCount(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                              tab === t.id
                                ? "bg-white/15 text-secondary font-bold border-l-4 border-secondary pl-2.5 shadow-sm"
                                : "hover:bg-white/10 active:bg-white/15 text-white/85"
                            }`}
                          >
                            <t.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1 text-left">{t.label}</span>
                            {cnt > 0 && (
                              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                                {cnt}
                              </span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-white/10 bg-black/25 flex items-center justify-between text-xs">
              <Link to="/" className="text-white/80 hover:text-white flex items-center gap-1.5 font-medium">
                <Home className="h-3.5 w-3.5 text-secondary" /> Public Site
              </Link>
              <button onClick={logout} className="text-rose-300 hover:text-rose-200 flex items-center gap-1 font-medium cursor-pointer">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 h-full bg-gradient-to-b from-[#2d1254] via-[#381668] to-[#250d46] text-white flex-col shrink-0 shadow-2xl relative z-20 border-r border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-400/60 shadow-md" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">IK</div>
            )}
            <div>
              <h2 className="font-display font-bold text-sm tracking-wide text-white truncate max-w-[130px]">
                {currentUser?.name || "ISKCON Kurnool"}
              </h2>
              <span className="text-[10px] text-amber-300/90 font-semibold tracking-wider uppercase block">
                ★ Administrator
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15">
          <div className="space-y-0.5 border-b border-white/10 pb-3 mb-1">
            <button
              onClick={() => setTab("welcome")}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                tab === "welcome" 
                  ? "bg-amber-400 text-slate-950 shadow-md scale-[1.02]" 
                  : "hover:bg-white/10 text-white/85 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 shrink-0" /> 
                <span>Dashboard Home</span>
              </div>
              {totalUnreadCount > 0 && (
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold shadow-xs animate-pulse ${
                  tab === "welcome" ? "bg-slate-950 text-amber-300" : "bg-red-600 text-white"
                }`}>
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>

          {groups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/60 px-3 py-1 select-none">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((t) => {
                  const cnt = getBadgeCount(t.id);
                  const isActive = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? "bg-amber-400 text-slate-950 font-extrabold shadow-md scale-[1.02]" 
                          : "hover:bg-white/10 text-white/80 hover:translate-x-1"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <t.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-300/80"}`} /> 
                        <span className="truncate">{t.label}</span>
                      </div>
                      {cnt > 0 && (
                        <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold shadow-xs animate-pulse ${
                          isActive ? "bg-slate-950 text-amber-300" : "bg-red-600 text-white"
                        }`}>
                          {cnt}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs">
          <Link to="/" className="text-white/80 hover:text-white flex items-center gap-1.5 font-semibold transition">
            <Home className="h-3.5 w-3.5 text-amber-300" /> Public Site
          </Link>
          <button onClick={logout} className="text-rose-300 hover:text-rose-200 flex items-center gap-1 font-semibold cursor-pointer transition">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTENT AREA */}
      <main className="flex-1 h-full p-4 sm:p-6 lg:p-10 overflow-y-auto bg-surface pb-28 md:pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b pb-4">
          <div className="flex items-center gap-2">
            {tab !== "welcome" && (
              <button
                onClick={() => setTab("welcome")}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs"
                title="Back to Dashboard Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                {tab === "welcome" ? "Portal" : "Manage"}
              </div>
              <h1 className="font-display text-xl sm:text-3xl font-bold text-primary capitalize leading-tight">
                {tab === "welcome" ? "Welcome Dashboard" : tabs.find(t => t.id === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {totalUnreadCount > 0 && (
              <button
                onClick={() => setTab("welcome")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition rounded-xl text-xs font-bold shadow-sm cursor-pointer animate-pulse"
                title={`${totalUnreadCount} total unread items`}
              >
                <Bell className="h-4 w-4 text-red-600 fill-red-600/20" />
                <span>{totalUnreadCount} New</span>
              </button>
            )}
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200/80 bg-white hover:bg-slate-50 hover:text-primary transition rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
            >
              <Home className="h-3.5 w-3.5 text-muted-foreground" /> View Site
            </Link>
            <button 
              onClick={logout} 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-rose-100 bg-rose-50 hover:bg-rose-100 transition rounded-xl text-xs font-semibold text-rose-600 shadow-sm cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "welcome" && <WelcomeDashboard groups={groups} setTab={setTab} logoUrl={settings.logo} />}

            {tab === "dailyDarshan" && <DailyDarshanManager />}
            {tab === "liveProgrammes" && <LiveProgrammeManager />}
            {tab === "carousel" && <CarouselManager />}
            {tab === "festivals" && <FestivalsManager />}
            {tab === "sevas" && <SevasManager />}
            {tab === "bhaktiSteps" && <BhaktiStepsManager />}
            {tab === "youth" && <YouthManager />}
            {tab === "youthYatra" && <YouthYatraManager />}
            {tab === "houseProgrammes" && <HouseProgrammesManager />}
            {tab === "prahladaBadi" && <PrahladaBadiManager />}
            {tab === "harinama" && <HarinamaManager />}
            {tab === "ekadashi" && <EkadashiManager />}
            {tab === "gita" && <GitaCourseManager />}
            {tab === "sunday" && <SundayManager />}
            {tab === "goshala" && <GoshalaManager />}
            {tab === "contacts" && <ContactsManager />}
            {tab === "instagram" && <InstagramManager />}
            {tab === "classes" && <DailyClassesManager />}
            {tab === "gallery" && <GalleryManager />}
            {tab === "heroBanners" && <HeroBannersManager />}
            {tab === "liveLaunch" && <LiveLaunchManager />}
            {tab === "settings" && <SiteSettingsForm />}
            {tab === "upiSettings" && <UpiSettingsManager />}
            {tab === "receiptSettings" && <ReceiptSettingsManager />}
            {tab === "terms" && <TermsManager />}
            {tab === "privacy" && <PrivacyManager />}
            {tab === "templeSchedule" && <TempleScheduleManager />}
            {tab === "featurePopup" && <FeaturePopupManager />}
            {tab === "paymentPages" && <PaymentPagesManager />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => setTab("welcome")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            tab === "welcome" ? "text-primary font-bold scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <LayoutDashboard className={`h-5 w-5 ${tab === "welcome" ? "text-primary stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>

        <button
          onClick={() => setTab("liveProgrammes")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            tab === "liveProgrammes" ? "text-primary font-bold scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Radio className={`h-5 w-5 ${tab === "liveProgrammes" ? "text-primary stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 font-medium">LIVE</span>
        </button>

        <button
          onClick={() => setTab("festivals")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            tab === "festivals" ? "text-primary font-bold scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles className={`h-5 w-5 ${tab === "festivals" ? "text-primary stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5 font-medium">Festivals</span>
        </button>

        <button
          onClick={() => setTab("contacts")}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            tab === "contacts" ? "text-primary font-bold scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="relative">
            <Mail className={`h-5 w-5 ${tab === "contacts" ? "text-primary stroke-[2.5]" : ""}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Messages</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-700 transition-all active:scale-95 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">More</span>
        </button>
      </div>
    </div>
  );
}

function WelcomeDashboard({ 
  groups, 
  setTab, 
  logoUrl 
}: { 
  groups: { title: string; items: { id: Tab; label: string; icon: any }[] }[]; 
  setTab: (id: Tab) => void; 
  logoUrl?: string; 
}) {
  const { contacts, paymentRecords } = useAdmin();
  const [q, setQ] = useState("");
  
  const unreadMessagesCount = (contacts || []).filter((c) => !c.read).length;
  const unreadDonationsCount = (paymentRecords || []).filter((p) => !p.read).length;

  const getItemBadge = (id: Tab): number => {
    if (id === "contacts") return unreadMessagesCount;
    if (id === "paymentPages") return unreadDonationsCount;
    return 0;
  };

  const allItems = groups.flatMap((g) => g.items.map((item) => ({ ...item, category: g.title })));
  
  const filtered = allItems.filter((item) => 
    item.label.toLowerCase().includes(q.toLowerCase()) || 
    item.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-1 sm:px-4 flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-fade-in">
      {/* Big ISKCON Logo */}
      <div className="relative group">
        <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl group-hover:bg-secondary/35 transition duration-500"></div>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="ISKCON Logo" 
            className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full object-cover shadow-2xl border-4 border-secondary/60 transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-primary to-[#3d1a6a] border-4 border-secondary/60 flex items-center justify-center text-white text-2xl sm:text-3xl font-display font-bold shadow-2xl">
            IK
          </div>
        )}
      </div>

      {/* Greetings Card with Gradient Background & Abstract Glows */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-white via-white to-[#3d1a6a]/5 border border-slate-100/80 p-5 sm:p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.01)] text-center relative overflow-hidden space-y-2 sm:space-y-3">
        {/* Abstract Glow circles */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <h2 className="font-display text-xl sm:text-3xl font-bold text-primary relative z-10">
          Hare Krishna! Welcome to Admin
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto relative z-10 leading-relaxed">
          Manage carousel banners, sevas, class schedules, community modules, and temple settings in real-time.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-xl relative group">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground group-focus-within:text-primary transition" />
        <input 
          type="text" 
          placeholder="Search modules... (e.g. festivals, sevas, settings)" 
          value={q} 
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-11 pr-11 py-3 sm:py-3.5 bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus:border-primary/45 focus:ring-1 focus:ring-primary/20 rounded-2xl text-xs sm:text-sm outline-none transition-all duration-300 group-hover:border-slate-300/80"
        />
        {q && (
          <button 
            onClick={() => setQ("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search results or Category Grid */}
      <div className="w-full">
        {q ? (
          <div>
            <div className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Search Results ({filtered.length})
            </div>
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm bg-white rounded-2xl border border-dashed">
                No matching tabs found. Try searching for "festival", "seva", or "settings".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filtered.map((item) => {
                  const badge = getItemBadge(item.id);
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className="flex items-center justify-between p-3.5 sm:p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-primary/20 rounded-2xl text-left transition-all duration-200 shadow-[0_3px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-primary/5 text-primary flex items-center justify-center shrink-0 transition-colors duration-300">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors duration-300">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground/80 font-medium tracking-wide mt-0.5">{item.category}</div>
                        </div>
                      </div>
                      {badge > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {groups.map((group) => (
              <div key={group.title} className="space-y-2.5 sm:space-y-3">
                <div className="text-left text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {group.title}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
                  {group.items.map((item) => {
                    const badge = getItemBadge(item.id);
                    return (
                      <button 
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className="flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-slate-50 border border-slate-100/90 hover:border-primary/15 rounded-2xl text-left transition-all duration-200 shadow-[0_3px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-xl bg-slate-50 group-hover:bg-primary/5 text-primary flex items-center justify-center shrink-0 transition-colors duration-300">
                            <item.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-foreground/80 group-hover:text-primary transition-colors duration-300 truncate">{item.label}</span>
                        </div>
                        {badge > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white shadow-sm animate-pulse ml-1">
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminIntroSplash({ onComplete }: { onComplete: () => void }) {
  const { settings } = useAdmin();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + 2; // Increments by 2 every 65ms -> 3.25 seconds fill time
      });
    }, 65);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#1a0836] via-[#2d1254] to-[#120526] text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-purple-900/30 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Rotating Mandala Sunburst Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        className="absolute w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] rounded-full border border-amber-300/15 border-dashed pointer-events-none flex items-center justify-center"
      >
        <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-amber-400/10 border-dotted" />
      </motion.div>

      {/* Logo & Emblem */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
        className="relative z-10 mb-6"
      >
        <div className="relative group cursor-pointer" onClick={onComplete} title="Click to skip">
          <div className="absolute inset-0 rounded-full bg-amber-400/35 blur-2xl animate-pulse" />
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="ISKCON Kurnool"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-300/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] relative z-10"
            />
          ) : (
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 border-4 border-amber-300 flex items-center justify-center text-slate-950 font-display text-3xl font-extrabold shadow-[0_0_50px_rgba(245,158,11,0.4)] relative z-10">
              IK
            </div>
          )}
        </div>
      </motion.div>

      {/* Welcome Title Reveal */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-2 relative z-10 max-w-md"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
          <span>Hare Krishna · Admin Workspace</span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight">
          ISKCON Kurnool
        </h1>

        <p className="text-xs sm:text-sm text-white/75 font-medium">
          Sri Sri Puri Jagannath Digital Temple Portal
        </p>
      </motion.div>

      {/* Progress Fill Bar & Skip Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-56 sm:w-72 mt-7 space-y-3 relative z-10"
      >
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/15 p-0.5 backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-amber-200/80 tracking-wider">
          <span>Loading admin workspace...</span>
          <span>{progress}%</span>
        </div>

        <button
          onClick={onComplete}
          className="text-[10px] text-white/50 hover:text-white underline tracking-wider font-medium transition pt-1 cursor-pointer block mx-auto"
        >
          Click anywhere to skip intro
        </button>
      </motion.div>
    </motion.div>
  );
}
