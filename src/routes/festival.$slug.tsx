import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin, normalizeFestival, isFestivalLive, calculatePlatformFee, Festival, Seva } from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import { Calendar, Heart, HandHeart, ArrowLeft, Sparkles, ChevronDown, Check, Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/festival/$slug")({
  head: () => ({ meta: [
    { title: "Festival — ISKCON Kurnool" },
    { name: "description", content: "Participate in festival sevas at ISKCON Kurnool." },
  ]}),
  component: Page,
});

const RAZORPAY_KEY = "rzp_live_TTxJXHnvmVNCF8";

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
  const [quantity, setQuantity] = useState(1);
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);
  const standardPrice = seva.prices[sel] ?? seva.prices[0];
  const baseAmount = (standardPrice?.amount || 0) * quantity;

  const donate = async () => {
    if (!standardPrice || baseAmount <= 0) return;
    const ok = await loadRazorpay();
    if (!ok) { alert("Unable to load payment gateway. Please try again."); return; }

    const platformCharge = platformFee.enabled && coverPlatformFee ? calculatePlatformFee(baseAmount, platformFee) : 0;
    const totalPayable = baseAmount + platformCharge;
    const sevaLabel = quantity > 1 ? `${standardPrice.label} × ${quantity}` : standardPrice.label;

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(totalPayable * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${festival.title} — ${seva.title} (${sevaLabel})`,
      image: settings.logo || undefined,
      notes: { festival: festival.title, seva: seva.title, option: sevaLabel, baseDonation: baseAmount, platformFeeCovered: platformCharge },
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
            baseAmount: baseAmount,
            platformFee: platformCharge,
            currency: "INR",
            category: `Festival Seva: ${festival.title}`,
            sevaOrPageTitle: `${seva.title} (${sevaLabel})`,
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
          sevaTitle: `${seva.title} (${sevaLabel})`,
          category: `Festival: ${festival.title}`,
        });
      },
    });
    rzp.open();
  };

  const hasMultipleOptions = seva.prices && seva.prices.length > 1;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative font-sans">
      {/* Top Image Banner: Full, clear, uncropped image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-amber-50/60 via-slate-50 to-white p-3 flex items-center justify-center border-b border-slate-100">
        <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
          {seva.thumbnail ? (
            <img 
              src={seva.thumbnail} 
              alt={seva.title} 
              loading="lazy" 
              className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-primary/30 bg-primary/5 rounded-2xl">
              <HandHeart className="h-14 w-14" />
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 font-sans">
        <div className="space-y-1.5">
          <h3 className="font-display font-extrabold text-lg text-primary line-clamp-1 leading-snug group-hover:text-amber-600 transition-colors">
            {seva.title}
          </h3>
          {seva.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[34px] font-sans">
              {seva.description}
            </p>
          )}
        </div>

        {/* Option Selector */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 font-sans">
          {hasMultipleOptions ? (
            <div>
              {seva.prices.length <= 2 ? (
                <div className="grid grid-cols-2 gap-1.5 font-sans">
                  {seva.prices.map((p, i) => {
                    const isSel = i === sel;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSel(i)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate flex flex-col items-center justify-center font-sans ${
                          isSel
                            ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                            : "bg-slate-50 hover:bg-amber-50 text-slate-700 border border-slate-200/80"
                        }`}
                      >
                        <span className="truncate w-full text-center text-[11px] font-sans">{p.label}</span>
                        <span className={`text-xs font-extrabold font-sans ${isSel ? "text-amber-300" : "text-primary"}`}>
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative font-sans">
                  <select
                    value={sel}
                    onChange={(e) => setSel(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 pr-9 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition font-sans"
                  >
                    {seva.prices.map((p, i) => (
                      <option key={i} value={i} className="text-slate-900 font-semibold py-1 font-sans">
                        {p.label} — ₹{p.amount.toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-sans">
              <span className="font-semibold text-slate-600 truncate font-sans">{standardPrice?.label}</span>
              <span className="font-extrabold text-primary shrink-0 font-sans">₹{standardPrice?.amount?.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-sans">
            <span className="text-xs font-bold text-slate-700">Count / Units</span>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center font-bold text-slate-700 cursor-pointer transition"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-[20px] text-center font-extrabold text-xs text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-6 w-6 rounded bg-primary hover:bg-[#4a2282] text-white flex items-center justify-center font-bold cursor-pointer transition"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Platform Fee Toggle */}
          {platformFee.enabled && baseAmount > 0 && (
            <div className="pt-1 text-xs text-slate-700 font-sans">
              <label className="flex items-start gap-2 cursor-pointer font-medium select-none text-[11px] font-sans">
                <input
                  type="checkbox"
                  checked={coverPlatformFee}
                  onChange={(e) => setCoverPlatformFee(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span className="font-sans">
                  {platformFee.label || "Cover gateway fee"}{" "}
                  <span className="text-emerald-600 font-bold font-sans">
                    (+₹{calculatePlatformFee(baseAmount, platformFee)})
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="pt-2 font-sans">
            <button
              onClick={donate}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/35 transition-all duration-300 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2 group/btn font-sans"
            >
              <Heart className="h-4 w-4 fill-white/20 text-white group-hover/btn:scale-125 transition-transform" />
              <span>Donate ₹{(baseAmount + (platformFee.enabled && coverPlatformFee ? calculatePlatformFee(baseAmount, platformFee) : 0)).toLocaleString("en-IN")}</span>
            </button>
          </div>
        </div>
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
