import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin, normalizeFestival, isFestivalLive, calculatePlatformFee, Festival, Seva } from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import { Calendar, Heart, HandHeart, ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/festival/$slug")({
  head: () => ({ meta: [
    { title: "Festival — ISKCON Kurnool" },
    { name: "description", content: "Participate in festival sevas at ISKCON Kurnool." },
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

function fmt(d: string) {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }); }
  catch { return d; }
}

function Page() {
  const { slug } = useParams({ from: "/festival/$slug" });
  const { festivals, settings, theme, ready } = useAdmin();

  const festival = useMemo(() => {
    const f = festivals.map(normalizeFestival).find((x) => x.slug === slug);
    return f && isFestivalLive(f) ? f : null;
  }, [festivals, slug]);

  if (!festival) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] grid place-items-center px-6 text-center">
          <div>
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-display text-2xl font-bold text-primary mb-2">{ready ? "Festival not found" : "Loading…"}</h1>
            {ready && <Link to="/" className="text-accent inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Back to home</Link>}
          </div>
        </div>
      </SiteLayout>
    );
  }

  const sevas = festival.sevas.filter((s) => s.active).sort((a, b) => a.order - b.order);

  return (
    <SiteLayout>
      <FestivalBanner f={festival} />

      <section className="max-w-4xl mx-auto px-5 sm:px-6 pt-8 pb-4">
        <div className="inline-flex items-center gap-1.5 text-sm text-accent font-semibold mb-2">
          <Calendar className="h-4 w-4" /> {fmt(festival.date)}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-5">{festival.title}</h1>
        {festival.description && (
          <div className="prose-festival text-foreground/90 max-w-none" dangerouslySetInnerHTML={{ __html: festival.description }} />
        )}
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-10">
        {sevas.length > 0 && (
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary">Offer a Seva</h2>
            <p className="text-muted-foreground mt-1 text-sm">Select an amount and make your contribution.</p>
          </div>
        )}
        {sevas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No sevas available for this festival yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {sevas.map((s) => (
              <SevaCard key={s.id} seva={s} festival={festival} settings={settings} theme={theme} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full">
          <Sparkles className="h-3.5 w-3.5 text-secondary" /> Secure payments powered by Razorpay
        </p>
      </section>
    </SiteLayout>
  );
}

function FestivalBanner({ f }: { f: Festival }) {
  return (
    <div className="rounded-b-[35px] overflow-hidden bg-muted">
      {/* Desktop banner */}
      {f.desktopBanner && (
        <img src={f.desktopBanner} alt={f.title} className="hidden md:block w-full h-auto object-cover" />
      )}
      {/* Mobile banner */}
      {(f.mobileBanner || f.desktopBanner) && (
        <img src={f.mobileBanner || f.desktopBanner} alt={f.title} className="md:hidden w-full h-auto object-cover" />
      )}
    </div>
  );
}

function SevaCard({ seva, festival, settings, theme }: { seva: Seva; festival: Festival; settings: any; theme: any }) {
  const { addPaymentRecord, platformFee } = useAdmin();
  const [sel, setSel] = useState(0);
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);
  const price = seva.prices[sel] ?? seva.prices[0];

  const donate = async () => {
    if (!price) return;
    const ok = await loadRazorpay();
    if (!ok) { alert("Unable to load payment gateway. Please try again."); return; }

    const platformCharge = platformFee.enabled && coverPlatformFee ? calculatePlatformFee(price.amount, platformFee) : 0;
    const totalPayable = price.amount + platformCharge;

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(totalPayable * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${festival.title} — ${seva.title} (${price.label})`,
      image: settings.logo || undefined,
      notes: { festival: festival.title, seva: seva.title, option: price.label, baseDonation: price.amount, platformFeeCovered: platformCharge },
      prefill: { contact: settings.phone?.replace(/\D/g, "") || "" },
      theme: { color: theme.primary || "#5b2c9b" },
      handler: async (response: any) => {
        const pId = response?.razorpay_payment_id || `pay_${Date.now()}`;
        try {
          await addPaymentRecord({
            paymentId: pId,
            donorName: "Devotee",
            donorEmail: "",
            donorPhone: settings.phone || "",
            amount: totalPayable,
            baseAmount: price.amount,
            platformFee: platformCharge,
            currency: "INR",
            category: `Festival Seva: ${festival.title}`,
            sevaOrPageTitle: `${seva.title} (${price.label})`,
            status: "Completed",
            paymentMethod: "Razorpay",
          });
        } catch (err) {
          console.error("Failed to store festival payment record:", err);
        }

        setReceiptSuccess({
          receiptNo: pId,
          date: new Date().toISOString(),
          donorName: "Devotee",
          amount: totalPayable,
          sevaTitle: `${seva.title} (${price.label})`,
          category: `Festival: ${festival.title}`,
        });
      },
    });
    rzp.open();
  };

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-elegant transition-all duration-300">
      <div className="relative aspect-square bg-muted overflow-hidden">
        {seva.thumbnail ? (
          <img src={seva.thumbnail} alt={seva.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center text-primary/40"><HandHeart className="h-12 w-12" /></div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-primary mb-1.5">{seva.title}</h3>
        {seva.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{seva.description}</p>}

        <div className="flex flex-col gap-2 mb-4 mt-auto">
          {seva.prices.map((p, i) => (
            <button key={i} onClick={() => setSel(i)}
              className={`flex items-center justify-between text-sm font-medium px-3.5 py-2.5 rounded-xl border transition ${
                i === sel ? "bg-primary/5 border-primary text-primary shadow-sm" : "bg-surface border-border hover:border-primary/50"
              }`}>
              <span className="inline-flex items-center gap-2">
                <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${i === sel ? "border-primary" : "border-muted-foreground/40"}`}>
                  {i === sel && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                ₹{p.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-muted-foreground">{p.label}</span>
            </button>
          ))}
        </div>

        {platformFee.enabled && price && price.amount > 0 && (
          <div className="mb-3 space-y-1.5 text-xs text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={coverPlatformFee}
                onChange={(e) => setCoverPlatformFee(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span>
                {platformFee.label || "Cover gateway fee"}{" "}
                <span className="text-emerald-600 font-bold font-sans">
                  (+₹{calculatePlatformFee(price.amount, platformFee)})
                </span>
              </span>
            </label>
          </div>
        )}

        <button onClick={donate} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-hero text-primary-foreground font-semibold hover:shadow-gold transition-all">
          <Heart className="h-4 w-4" /> Donate {price ? `₹${(price.amount + (platformFee.enabled && coverPlatformFee ? calculatePlatformFee(price.amount, platformFee) : 0)).toLocaleString("en-IN")}` : "Now"}
        </button>
      </div>

      {receiptSuccess && (
        <OfficialReceiptModal
          data={receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
        />
      )}
    </div>
  );
}
