import { useAdmin } from "@/context/AdminContext";

export default function ThemeSettings() {
  const { theme, setTheme } = useAdmin();

  const presets = [
    { name: "Royal Purple", primary: "#5b2c9b", secondary: "#f5c518", accent: "#e8670c" },
    { name: "Sacred Saffron", primary: "#c2410c", secondary: "#facc15", accent: "#7c2d12" },
    { name: "Krishna Blue", primary: "#1e3a8a", secondary: "#fbbf24", accent: "#dc2626" },
    { name: "Forest Sage", primary: "#166534", secondary: "#eab308", accent: "#b45309" },
    { name: "Rose Lotus", primary: "#9f1239", secondary: "#fde047", accent: "#7e22ce" },
  ];

  const update = (k: "primary" | "secondary" | "accent", v: string) => setTheme({ ...theme, [k]: v });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="font-display text-xl font-bold text-primary mb-1">Theme Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">Changes apply to the live site instantly.</p>

        <div className="grid md:grid-cols-3 gap-4">
          <ColorField label="Primary Color" value={theme.primary} onChange={(v) => update("primary", v)} />
          <ColorField label="Secondary Color" value={theme.secondary} onChange={(v) => update("secondary", v)} />
          <ColorField label="Accent Color" value={theme.accent} onChange={(v) => update("accent", v)} />
        </div>

        <div className="mt-8">
          <h4 className="font-medium mb-3">Preset Themes</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presets.map((p) => (
              <button key={p.name} onClick={() => setTheme({ primary: p.primary, secondary: p.secondary, accent: p.accent })} className="p-3 rounded-xl border hover:shadow-elegant transition text-left">
                <div className="flex gap-1 mb-2">
                  <div className="h-6 w-6 rounded-full" style={{ background: p.primary }} />
                  <div className="h-6 w-6 rounded-full" style={{ background: p.secondary }} />
                  <div className="h-6 w-6 rounded-full" style={{ background: p.accent }} />
                </div>
                <div className="text-sm font-medium">{p.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h4 className="font-display font-bold text-primary mb-3">Live Preview</h4>
        <div className="space-y-3">
          <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium">Primary Button</button>
          <span className="ml-3 inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">Secondary</span>
          <span className="ml-3 inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">Accent</span>
          <p className="text-gradient font-display text-3xl font-bold">Hare Krishna</p>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80 mb-1 block">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" className="h-12 w-16 rounded cursor-pointer border" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="text" className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
