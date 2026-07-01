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
import EkadashiManager from "@/admin/EkadashiManager";
import { LayoutDashboard, Image, Images, Settings, Palette, LogOut, Home, Radio, Sparkles, HandHeart, Users, Leaf } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ISKCON Kurnool" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "carousel" | "festivals" | "sevas" | "youth" | "ekadashi" | "classes" | "gallery" | "settings" | "theme";

function AdminPage() {
  const { authed, login, logout, settings } = useAdmin();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("carousel");

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
    { id: "classes", label: "Daily Classes", icon: Radio },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "settings", label: "Site Settings", icon: Settings },
    { id: "theme", label: "Theme", icon: Palette },
  ];

  return (
    <div className="min-h-screen flex bg-surface">
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
        {tab === "classes" && <DailyClassesManager />}
        {tab === "gallery" && <GalleryManager />}
        {tab === "settings" && <SiteSettingsForm />}
        {tab === "theme" && <ThemeSettings />}
      </main>
    </div>
  );
}
