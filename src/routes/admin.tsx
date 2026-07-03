import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import CarouselManager from "@/admin/CarouselManager";
import GalleryManager from "@/admin/GalleryManager";
import SiteSettingsForm from "@/admin/SiteSettings";
import ThemeSettings from "@/admin/ThemeSettings";
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
import { LayoutDashboard, Image, Images, Settings, Palette, LogOut, Home, Radio, Sparkles, HandHeart, Users, Leaf, Music, BookOpen, Calendar, Heart, Mail, AlertTriangle, FileSpreadsheet, Instagram } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ISKCON Kurnool" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "carousel" | "festivals" | "sevas" | "youth" | "harinama" | "ekadashi" | "gita" | "sunday" | "classes" | "gallery" | "settings" | "theme" | "heroBanners" | "goshala" | "contacts" | "instagram";

function AdminPage() {
  const { authed, login, logout, settings, contacts, setContacts } = useAdmin();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("carousel");

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
      <div className="min-h-screen bg-gradient-soft grid place-items-center px-4">
        <div className="bg-white rounded-2xl shadow-elegant p-8 w-full max-w-md border">
          <div className="text-center mb-6">
            {settings.logo ? (
              <img src={settings.logo} alt="ISKCON Kurnool" className="h-20 w-20 rounded-full object-cover mx-auto mb-3 ring-2 ring-secondary/60 shadow-glow" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground font-display font-bold text-2xl mx-auto mb-3 shadow-glow">IK</div>
            )}
            <h1 className="font-display text-2xl font-bold text-primary">Admin Login</h1>
            <p className="text-sm text-muted-foreground">ISKCON Kurnool</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setErr("");
              const res = await login(email, pw);
              setBusy(false);
              if (!res.ok) setErr(res.error || "Invalid credentials");
            }}
          >
            <input
              type="email"
              autoFocus
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErr(""); }}
              className="w-full px-4 py-3 border rounded-lg mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              className="w-full px-4 py-3 border rounded-lg mb-3"
            />
            {err && <p className="text-destructive text-sm mb-3">{err}</p>}
            <button disabled={busy} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-60">
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <Link to="/" className="block text-center mt-4 text-sm text-muted-foreground hover:text-primary">← Back to site</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "carousel", label: "Carousel", icon: Image },
    { id: "festivals", label: "Upcoming Festivals", icon: Sparkles },
    { id: "sevas", label: "Jagannath Sevas", icon: HandHeart },
    { id: "youth", label: "Youth Festival", icon: Users },
    { id: "harinama", label: "Harinama Sankeerthan", icon: Music },
    { id: "ekadashi", label: "Ekadashi Vratam", icon: Leaf },
    { id: "gita", label: "Gita Course", icon: BookOpen },
    { id: "sunday", label: "Sunday Program", icon: Calendar },
    { id: "goshala", label: "Goshala Seva", icon: Heart },
    { id: "contacts", label: "Contact Messages", icon: Mail },
    { id: "instagram", label: "Instagram Feed", icon: Instagram },
    { id: "classes", label: "Daily Classes", icon: Radio },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "heroBanners", label: "Hero Banners", icon: Images },
    { id: "settings", label: "Site Settings", icon: Settings },
    { id: "theme", label: "Theme", icon: Palette },
  ];

  return (
    <div className="min-h-screen flex bg-surface relative">
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

      <aside className="w-64 bg-gradient-to-b from-primary to-[#3d1a6a] text-primary-foreground flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-display font-bold">Admin Panel</span>
          </div>
          <div className="text-xs opacity-70 mt-1">ISKCON Kurnool</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                tab === t.id ? "bg-white text-primary shadow-sm font-semibold" : "hover:bg-white/10 text-white/80"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 text-white/80"><Home className="h-4 w-4" /> View Site</Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 text-white/80"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Manage</div>
          <h1 className="font-display text-3xl font-bold text-primary capitalize">{tabs.find(t => t.id === tab)?.label}</h1>
        </div>
        {tab === "carousel" && <CarouselManager />}
        {tab === "festivals" && <FestivalsManager />}
        {tab === "sevas" && <SevasManager />}
        {tab === "youth" && <YouthManager />}
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
        {tab === "settings" && <SiteSettingsForm />}
        {tab === "theme" && <ThemeSettings />}
      </main>
    </div>
  );
}
