import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { useAdmin, Seva, calculatePlatformFee } from "@/context/AdminContext";
import OfficialReceiptModal, { ReceiptData } from "@/components/OfficialReceiptModal";
import { Heart, Search, HandHeart, IndianRupee, Sparkles, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Sri Sri Jagannath Sevas | ISKCON Kurnool" },
      { name: "description", content: "Participate in divine service — offer Sri Sri Jagannath Sevas at ISKCON Kurnool. Every seva performed with love reaches the lotus feet of the Lord." },
    ]
  }),
  component: () => <Outlet />,
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

export default function Page({ initialSlug }: { initialSlug?: string }) {
  const { sevas, settings, theme, ready, addDonation, updateDonationStatus, platformFee, addPaymentRecord, sunday } = useAdmin();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [checkoutSeva, setCheckoutSeva] = useState<Seva | null>(null);

  // Success Receipt Modal State
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);
  const [coverPlatformFee, setCoverPlatformFee] = useState(true);

  // Form inputs
  const [donorName, setDonorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");

  useEffect(() => {
    if (initialSlug) {
      let found = sevas.find(s => s.slug === initialSlug || s.id === initialSlug);
      
      // Fallback for Sunday Feast Seva
      if (!found && (initialSlug === "sunday-feast-seva" || initialSlug === "sunday-feast")) {
        const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : 5001;
        const amt = isNaN(rawAmount) || rawAmount <= 0 ? 5001 : rawAmount;
        found = {
          id: "s_sunday_feast_fallback",
          title: sunday.donationCardTitle || "Sunday Feast Annadana Seva",
          slug: "sunday-feast-seva",
          description: sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.",
          thumbnail: sunday.donationCardImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
          prices: [
            { label: "Sunday Feast Sponsorship", amount: amt }
          ],
          order: 1,
          active: true
        };
      }

      if (found) {
        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const amountParam = searchParams?.get("amount") || searchParams?.get("amt");
        
        if (amountParam && !isNaN(Number(amountParam))) {
          const amt = Number(amountParam);
          let matchIdx = found.prices.findIndex(p => p.amount === amt);
          if (matchIdx === -1) {
            // Add custom amount to prices if not present
            found = {
              ...found,
              prices: [{ label: `Sponsorship Amount`, amount: amt }, ...found.prices]
            };
            matchIdx = 0;
          }
          setSelected(prev => ({ ...prev, [found!.id]: matchIdx }));
        }
        setCheckoutSeva(found);
      } else {
        setCheckoutSeva(null);
      }
    } else {
      setCheckoutSeva(null);
    }
  }, [initialSlug, sevas, sunday]);

  const active = useMemo(() => {
    let list = [...sevas].filter((s) => s.active);

    // Automatically ensure Sunday Feast Annadana Seva is present in common donations
    const hasSundayFeast = list.some(
      (s) => s.slug === "sunday-feast-seva" || s.slug === "sunday-feast" || s.title.toLowerCase().includes("sunday feast")
    );

    if (!hasSundayFeast && sunday.donationCardEnabled !== false) {
      const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : 5001;
      const amt = isNaN(rawAmount) || rawAmount <= 0 ? 5001 : rawAmount;
      const sundaySevaItem: Seva = {
        id: "s_sunday_feast_auto",
        title: sunday.donationCardTitle || "Sunday Feast Annadana Seva",
        slug: "sunday-feast-seva",
        description: sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.",
        thumbnail: sunday.donationCardImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80",
        prices: [
          { label: "Sunday Feast Sponsorship", amount: amt },
          { label: "50 Devotees Prasadam Seva", amount: 1500 },
          { label: "100 Devotees Prasadam Seva", amount: 3000 },
          { label: "Full Grand Feast Sponsorship", amount: 11000 },
        ],
        order: 0,
        active: true,
      };
      list = [sundaySevaItem, ...list];
    }

    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [sevas, sunday]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active;
    return active.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [active, query]);

  if (!ready) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </SiteLayout>
    );
  }

  const donate = async (seva: Seva, amount: number, label: string) => {
    // Store every submission in the admin panel before opening the gateway
    const enquiryId = await addDonation({
      donorName: donorName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      pan: pan.trim(),
      purpose: purpose.trim(),
      sevaTitle: seva.title,
      optionLabel: label,
      amount,
    });

    const ok = await loadRazorpay();
    if (!ok) { alert("Unable to load payment gateway. Please try again."); return; }

    const platformCharge = platformFee.enabled && coverPlatformFee ? calculatePlatformFee(amount, platformFee) : 0;
    const totalPayable = amount + platformCharge;

    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(totalPayable * 100),
      currency: "INR",
      name: "ISKCON Kurnool",
      description: `${seva.title} — ${label}`,
      image: settings.logo || undefined,
      notes: {
        seva: seva.title,
        option: label,
        baseDonation: amount,
        platformFeeCovered: platformCharge,
        donorName: donorName.trim(),
        purpose: purpose.trim(),
        email: email.trim(),
        phone: phone.trim(),
        pan: pan.trim()
      },
      prefill: {
        name: donorName.trim() || undefined,
        email: email.trim() || undefined,
        contact: phone.trim() || settings.phone?.replace(/\D/g, "") || undefined
      },
      theme: { color: theme.primary || "#5b2c9b" },
      handler: async (response: any) => {
        const pId = response?.razorpay_payment_id || `pay_${Date.now()}`;
        const currentDonorName = donorName.trim() || "Devotee";
        const currentEmail = email.trim();
        const currentPhone = phone.trim();
        const currentPan = pan.trim();
        const currentNotes = purpose.trim();

        if (enquiryId) {
          try {
            await updateDonationStatus(enquiryId, "paid", pId);
          } catch (e) {
            console.error("Failed to update donation status", e);
          }
        }

        try {
          await addPaymentRecord({
            paymentId: pId,
            donorName: currentDonorName,
            donorEmail: currentEmail,
            donorPhone: currentPhone,
            amount: totalPayable,
            baseAmount: amount,
            platformFee: platformCharge,
            currency: "INR",
            category: `General Seva: ${seva.title}`,
            sevaOrPageTitle: `${seva.title} (${label})`,
            status: "Completed",
            paymentMethod: "Razorpay",
            panNumber: currentPan || undefined,
            notes: currentNotes || undefined,
            taxReceiptRequested: !!currentPan,
          });
        } catch (err) {
          console.error("Failed to store payment record:", err);
        }

        // Show Official Downloadable Receipt Modal
        setReceiptSuccess({
          receiptNo: pId,
          date: new Date().toISOString(),
          donorName: currentDonorName,
          donorEmail: currentEmail,
          donorPhone: currentPhone,
          amount: totalPayable,
          sevaTitle: `${seva.title} (${label})`,
          category: "General Seva",
          notes: currentNotes,
          panNumber: currentPan,
        });

        setCheckoutSeva(null);
        setDonorName("");
        setPurpose("");
        setEmail("");
        setPhone("");
        setPan("");
      },
    });
    rzp.open();
  };

  if (checkoutSeva) {
    const selIdx = selected[checkoutSeva.id] ?? 0;
    const currentPrice = checkoutSeva.prices[selIdx] ?? checkoutSeva.prices[0];

    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!donorName.trim()) { alert("Please enter Donor Name."); return; }
      if (!email.trim()) { alert("Please enter Email Address."); return; }
      if (!phone.trim()) { alert("Please enter WhatsApp Phone Number."); return; }

      donate(checkoutSeva, currentPrice.amount, currentPrice.label);
    };

    return (
      <SiteLayout>
        <PageHero
          eyebrow="Offer Your Seva"
          title="Seva Checkout"
          subtitle={`Complete your offering details for ${checkoutSeva.title}.`}
          pageKey="donate"
        />

        <section className="py-12 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition mb-8 cursor-pointer font-sans"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sevas list
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Thumbnail and selection */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <div className="rounded-2xl overflow-hidden">
                    {checkoutSeva.thumbnail ? (
                      <img src={checkoutSeva.thumbnail} alt={checkoutSeva.title} className="w-full h-auto object-contain rounded-2xl shadow-sm border border-slate-100/50" />
                    ) : (
                      <div className="aspect-[4/3] w-full grid place-items-center text-primary/30 bg-primary/5 rounded-2xl">
                        <HandHeart className="h-16 w-16" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Selected Devotional Offering</span>
                    <h3 className="font-display font-extrabold text-2xl text-primary leading-tight">{checkoutSeva.title}</h3>
                    {checkoutSeva.description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{checkoutSeva.description}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Option / Amount</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {checkoutSeva.prices.map((p, i) => {
                        const isSel = i === selIdx;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelected((m) => ({ ...m, [checkoutSeva.id]: i }))}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${isSel
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                              : "border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                              }`}
                          >
                            <span className={`text-xs font-bold font-sans ${isSel ? "text-primary" : "text-slate-700"}`}>
                              {p.label}
                            </span>
                            <span className={`text-xs font-extrabold font-sans ${isSel ? "text-primary" : "text-slate-900"}`}>
                              ₹{p.amount.toLocaleString("en-IN")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4.5 space-y-2.5 border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                      <span>Selected Seva:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{checkoutSeva.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 font-sans">
                      <span>Option:</span>
                      <span className="font-semibold text-slate-800 text-right">{currentPrice.label}</span>
                    </div>
                    <div className="h-px bg-slate-200/60 my-2" />
                    <div className="flex justify-between items-center text-sm font-bold text-primary font-display">
                      <span>DONATE Amount:</span>
                      <span className="text-base text-accent">₹{currentPrice.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Donor Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h4 className="font-display font-extrabold text-xl text-primary">Donor & Receipt Information</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">Please provide your details below to process the offering receipt.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Donor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name of the donor"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Purpose of Donation</label>
                      <input
                        type="text"
                        placeholder="e.g. For good health, family welfare, birthdays..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="donor@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">WhatsApp Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">PAN Card (Optional)</label>
                        <span className="text-[10px] text-muted-foreground font-sans">For 80G Tax exemption benefits</span>
                      </div>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-sans tracking-wide uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Platform / Gateway Charges Checkbox & Donation Summary */}
                  {platformFee.enabled && currentPrice.amount > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none text-slate-700">
                        <input
                          type="checkbox"
                          checked={coverPlatformFee}
                          onChange={(e) => setCoverPlatformFee(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <span>
                          {platformFee.label || "I would like to cover the payment gateway charges"}{" "}
                          <span className="text-emerald-600 font-bold font-sans">
                            (+₹{calculatePlatformFee(currentPrice.amount, platformFee)})
                          </span>
                        </span>
                      </label>

                      {/* Summary Breakdown */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span>Donation Amount:</span>
                          <span className="font-bold font-sans text-slate-900">₹{currentPrice.amount.toLocaleString("en-IN")}.00</span>
                        </div>
                        {coverPlatformFee && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Platform Charge ({platformFee.type === "percentage" ? `${platformFee.value}%` : `₹${platformFee.value}`}):</span>
                            <span className="font-bold font-sans">+₹{calculatePlatformFee(currentPrice.amount, platformFee)}.00</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 text-slate-900 text-sm">
                          <span>Total Payable:</span>
                          <span className="font-sans text-primary">₹{(currentPrice.amount + (coverPlatformFee ? calculatePlatformFee(currentPrice.amount, platformFee) : 0)).toLocaleString("en-IN")}.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <button
                      type="submit"
                      className="relative group overflow-hidden w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 text-base tracking-wide uppercase shadow-[0_6px_22px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-98 ring-2 ring-amber-300/30"
                    >
                      <Lock className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                      <span className="relative z-10">
                        DONATE ₹{(currentPrice.amount + (platformFee.enabled && coverPlatformFee ? calculatePlatformFee(currentPrice.amount, platformFee) : 0)).toLocaleString("en-IN")}
                      </span>
                      <Heart className="h-4.5 w-4.5 fill-white/20 stroke-[2.5] text-white transition-transform duration-300 group-hover:scale-125 group-hover:fill-white" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                      <span>Secure Payments by Razorpay</span>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Participate in Divine Service"
        title="Sri Sri Jagannath Sevas"
        subtitle="Offer your devotion to Lord Jagannath and be blessed. Every seva performed with love reaches the lotus feet of the Lord."
        pageKey="donate"
      />

      <section className="py-14 md:py-16 bg-gradient-to-b from-[#fffbf0] via-[#fdf4d4] to-[#ffffff]">
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
                    <div className="relative aspect-square overflow-hidden flex items-center justify-center p-3">
                      {s.thumbnail ? (
                        <img src={s.thumbnail} alt={s.title} loading="lazy" className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500" />
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
                              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${isSel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-surface text-foreground border-border hover:border-primary/50"
                                }`}
                            >
                              {p.label} · ₹{p.amount.toLocaleString("en-IN")}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => navigate({ to: "/donate/$slug", params: { slug: s.slug || s.id } })}
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

      {/* Official Downloadable Receipt Modal */}
      {receiptSuccess && (
        <OfficialReceiptModal
          data={receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
        />
      )}
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
