import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, Seva } from "@/context/AdminContext";
import { Heart, Search, HandHeart, IndianRupee, Sparkles } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [
    { title: "Donate — Sri Sri Jagannath Sevas | ISKCON Kurnool" },
    { name: "description", content: "Participate in divine service — offer Sri Sri Jagannath Sevas at ISKCON Kurnool. Every seva performed with love reaches the lotus feet of the Lord." },
  ]}),
  component: Page,
});

const RAZORPAY_KEY = "rzp_test_SwEw3kkyiffJww";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Page() {
  const { sevas, settings, theme } = useAdmin();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});

  const active = useMemo(
    () => [...sevas].filter((s) => s.active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sevas],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active;
    return active.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [active, query]);

  const donate = async (seva: Seva, amount: number, label: string) => {
    const ok = await loadRazorpay();
    if (!ok) { alert("Unable to load payment gateway. Please try again."); return; }
    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${seva.title} — ${label}`,
      image: settings.logo || undefined,
      notes: { seva: seva.title, option: label },
      prefill: { contact: settings.phone?.replace(/\D/g, "") || "" },
      theme: { color: theme.primary || "#5b2c9b" },
      handler: () => {
        alert(`🙏 Hare Krishna! Thank you for your ${seva.title} seva.`);
      },
    });
    rzp.open();
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Participate in Divine Service"
        title="Sri Sri Jagannath Sevas"
        subtitle="Offer your devotion to Lord Jagannath and be blessed. Every seva performed with love reaches the lotus feet of the Lord."
        pageKey="donate"
      />

      {/* Bhagavad Gita Quote Section */}
      <section className="-mt-8 md:-mt-12 relative z-10 max-w-4xl mx-auto px-5">
        <div className="bg-white rounded-3xl border border-border p-8 md:p-10 shadow-elegant text-center relative overflow-hidden">
          {/* Decorative background gradients or motifs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Sanskrit symbol or elegant divider */}
          <div className="flex justify-center mb-6">
            <span className="text-secondary font-display text-sm md:text-base tracking-[0.2em] uppercase divider-gold font-semibold">
              Bhagavad Gita 9.26
            </span>
          </div>

          {/* Sanskrit verse */}
          <blockquote className="space-y-4">
            <p className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-primary leading-relaxed tracking-wide">
              पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।<br />
              तदहं भक्त्युपहृतमश्नामि प्रयतात्मन: ॥
            </p>
            
            {/* Translation divider */}
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent mx-auto my-6" />

            {/* Translation */}
            <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed font-sans font-medium italic">
              "If one offers Me with love and devotion a leaf, a flower, fruit, or water, I will accept it."
            </p>
          </blockquote>

          {/* Icons/Emojis representation in a modern aesthetic way */}
          <div className="flex justify-center gap-6 md:gap-8 mt-8 text-2xl md:text-3xl">
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm border border-emerald-100/50">
                🌿
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Leaf</span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 grid place-items-center group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-300 shadow-sm border border-pink-100/50">
                🌸
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Flower</span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 grid place-items-center group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300 shadow-sm border border-rose-100/50">
                🍎
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Fruit</span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 grid place-items-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-sm border border-blue-100/50">
                💧
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Water</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-gradient-to-b from-surface to-background">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">

          {/* Search */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sevas..."
                className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
              />
            </div>
          </div>

          {/* Cards */}
          {active.length === 0 ? (
            <FallbackCauses />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No sevas match "{query}".</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((s) => {
                const selIdx = selected[s.id] ?? 0;
                const price = s.prices[selIdx] ?? s.prices[0];
                return (
                  <div key={s.id} className="group bg-white rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-elegant transition-all duration-300">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {s.thumbnail ? (
                        <img src={s.thumbnail} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-primary/40"><HandHeart className="h-12 w-12" /></div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-lg text-primary mb-1.5">{s.title}</h3>
                      {s.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{s.description}</p>}

                      {/* Price options */}
                      <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                        {s.prices.map((p, i) => {
                          const isSel = i === selIdx;
                          return (
                            <button
                              key={i}
                              onClick={() => setSelected((m) => ({ ...m, [s.id]: i }))}
                              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                                isSel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-surface text-foreground border-border hover:border-primary/50"
                              }`}
                            >
                              {p.label} · ₹{p.amount.toLocaleString("en-IN")}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => donate(s, price.amount, price.label)}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-hero text-primary-foreground font-semibold hover:shadow-gold transition-all"
                      >
                        <Heart className="h-4 w-4" /> Donate ₹{price.amount.toLocaleString("en-IN")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-12 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full">
            <Sparkles className="h-3.5 w-3.5 text-secondary" /> Secure payments powered by Razorpay
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function FallbackCauses() {
  const causes = [
    { icon: HandHeart, title: "Deity Seva", desc: "Sponsor daily worship, decoration and offerings to the Lord." },
    { icon: IndianRupee, title: "Annadana", desc: "Sponsor sanctified prasadam meals for devotees and guests." },
    { icon: Heart, title: "Temple Seva", desc: "Help build and maintain the sacred abode of Sri Sri Puri Jagannath." },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {causes.map((c) => (
        <div key={c.title} className="p-7 rounded-2xl bg-surface border border-border text-center">
          <div className="h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground grid place-items-center mx-auto mb-4 shadow-glow">
            <c.icon className="h-6 w-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-primary mb-1">{c.title}</h3>
          <p className="text-muted-foreground text-sm">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}
