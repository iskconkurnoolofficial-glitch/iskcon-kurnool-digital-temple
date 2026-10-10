import { useState } from "react";
import { useAdmin, uploadToCloudinary, LifePatronData } from "@/context/AdminContext";
import { Award, Eye, Sparkles, Image as ImageIcon, Ticket, Phone, MessageCircle, ShieldCheck, Heart } from "lucide-react";
import { UploadBox } from "./CarouselManager";
import { toast } from "sonner";

export default function LifePatronManager() {
  const { lifePatron, setLifePatron } = useAdmin();
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<LifePatronData>) => {
    setLifePatron({ ...lifePatron, ...patch });
    toast.success("Life Patron settings updated!");
  };

  const pickHeroImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/LifePatron");
      update({ heroImage: url });
      toast.success("Life Patron Hero image uploaded successfully!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const pickSevaImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/LifePatron");
      update({ sevaCardImage: url });
      toast.success("Life Patron Benefits Seva image uploaded successfully!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const pickCardPassImage = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/LifePatron");
      update({ cardPassImage: url });
      toast.success("Life Patron Card Pass image uploaded successfully!");
    } catch {
      toast.error("Upload failed");
    }
    setBusy(false);
  };

  const pickApplicationPdf = async (f: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(f, "ISKCON-KURNOOL/LifePatron");
      update({ applicationPdfUrl: url });
      toast.success("Life Patron Application Form PDF uploaded successfully!");
    } catch {
      toast.error("PDF upload failed");
    }
    setBusy(false);
  };

  const inputClass = "w-full px-3.5 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-2xs";
  const labelClass = "block text-xs font-bold font-sans uppercase tracking-wider text-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/10 rounded-3xl p-6 sm:p-8 border border-amber-300/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-800 rounded-2xl shrink-0 shadow-xs">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-primary">Life Patron Membership Management</h2>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                  Premium Patron Section
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Upload custom right-side hero image, customize "Become an ISKCON Kurnool Life Member" headlines, and manage Bhakti Steps patron benefits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/temple/life-patron"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4 text-amber-600" /> View Life Patron Page
            </a>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 border border-slate-200/80 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-display text-lg font-bold text-primary">Hero Title & Admin Image Upload</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Top Badge Text</label>
              <input
                className={inputClass}
                value={lifePatron.badgeText || ""}
                onChange={(e) => update({ badgeText: e.target.value })}
                placeholder="✨ Sacred Life Patron Membership"
              />
            </div>

            <div>
              <label className={labelClass}>Hero Title (Right Side Image Layout)</label>
              <input
                className={inputClass}
                value={lifePatron.heroTitle || ""}
                onChange={(e) => update({ heroTitle: e.target.value })}
                placeholder="Become an ISKCON Kurnool Life Member"
              />
            </div>

            <div>
              <label className={labelClass}>Hero Subtitle</label>
              <textarea
                className={inputClass}
                rows={3}
                value={lifePatron.heroSubtitle || ""}
                onChange={(e) => update({ heroSubtitle: e.target.value })}
                placeholder="Join our global spiritual family as a Life Patron..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Phone</label>
                <input
                  className={inputClass}
                  value={lifePatron.contactPhone || ""}
                  onChange={(e) => update({ contactPhone: e.target.value })}
                  placeholder="+91 95053 77520"
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  className={inputClass}
                  value={lifePatron.whatsappNumber || ""}
                  onChange={(e) => update({ whatsappNumber: e.target.value })}
                  placeholder="+91 95053 77520"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Life Patron Application Form Softcopy PDF (Upload or URL)</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={lifePatron.applicationPdfUrl || ""}
                  onChange={(e) => update({ applicationPdfUrl: e.target.value })}
                  placeholder="https://example.com/forms/ISKCON_Life_Patron_Application_Form.pdf"
                />
                <label className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs">
                  <span>Upload PDF</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) pickApplicationPdf(file);
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                This softcopy PDF will be downloaded by patrons during the onboarding flow after payment completion.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <UploadBox
                label="Admin Hero Right-Side Image"
                url={lifePatron.heroImage}
                onPick={pickHeroImage}
                aspect="aspect-video"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground leading-normal">
                Featured on the right side of the main hero banner.
              </p>
            </div>

            <div className="space-y-2">
              <UploadBox
                label="Seva Card Image (Benefits)"
                url={lifePatron.sevaCardImage}
                onPick={pickSevaImage}
                aspect="aspect-video"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground leading-normal">
                Featured on "Seva – Opportunity to Serve" card.
              </p>
            </div>

            <div className="space-y-2">
              <UploadBox
                label="Official Life Patron Pass Image"
                url={lifePatron.cardPassImage}
                onPick={pickCardPassImage}
                aspect="aspect-video"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground leading-normal">
                Featured on the "Official ISKCON Life Patron Pass" section.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Membership Card Settings */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <h4 className="font-display text-base font-bold text-primary">Featured Membership Card Settings (Fest Card Style)</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Top Badge Text</label>
              <input
                className={inputClass}
                value={lifePatron.membershipCardBadge || ""}
                onChange={(e) => update({ membershipCardBadge: e.target.value })}
                placeholder="Official Temple Membership • ISKCON Kurnool"
              />
            </div>

            <div>
              <label className={labelClass}>Membership Main Title</label>
              <input
                className={inputClass}
                value={lifePatron.membershipCardTitle || ""}
                onChange={(e) => update({ membershipCardTitle: e.target.value })}
                placeholder="ISKCON Kurnool Life Membership"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Membership Subtitle / Description</label>
              <textarea
                className={inputClass}
                rows={2}
                value={lifePatron.membershipCardDescription || ""}
                onChange={(e) => update({ membershipCardDescription: e.target.value })}
                placeholder="Become a recognized lifelong patron of Sri Sri Jagannath Baladev Subhadra Temple..."
              />
            </div>

            <div>
              <label className={labelClass}>Contribution Label</label>
              <input
                className={inputClass}
                value={lifePatron.membershipCardPriceLabel || ""}
                onChange={(e) => update({ membershipCardPriceLabel: e.target.value })}
                placeholder="One-Time Lifelong Devotional Contribution"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Membership Amount</label>
                <input
                  className={inputClass}
                  value={lifePatron.membershipCardAmount || ""}
                  onChange={(e) => update({ membershipCardAmount: e.target.value })}
                  placeholder="₹55,555"
                />
              </div>
              <div>
                <label className={labelClass}>Amount Suffix</label>
                <input
                  className={inputClass}
                  value={lifePatron.membershipCardAmountSuffix || ""}
                  onChange={(e) => update({ membershipCardAmountSuffix: e.target.value })}
                  placeholder="Only (Lifetime Membership)"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Installment Badge Title</label>
              <input
                className={inputClass}
                value={lifePatron.membershipCardInstallmentTitle || ""}
                onChange={(e) => update({ membershipCardInstallmentTitle: e.target.value })}
                placeholder="Flexible Installment Options Available"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Enroll Online Button Redirect Link / URL</label>
              <input
                className={inputClass}
                value={lifePatron.enrollRedirectUrl || ""}
                onChange={(e) => update({ enrollRedirectUrl: e.target.value })}
                placeholder="/donate/life-patron-membership or https://payment-gateway-link.com"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter an internal page path (e.g. <code className="font-mono">/donate/life-patron-membership</code>) or an external Razorpay/UPI checkout URL.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Management Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h4 className="font-display text-base font-bold text-primary">Life Patron FAQs (Admin Managed)</h4>
            </div>
            <button
              type="button"
              onClick={() => {
                const currentFaqs = lifePatron.faqs || [];
                const updated = [
                  ...currentFaqs,
                  { question: "New Patron Question?", answer: "Clear detailed answer regarding Life Patron membership." }
                ];
                update({ faqs: updated });
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>+ Add New FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {(lifePatron.faqs || []).map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    FAQ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (lifePatron.faqs || []).filter((_, i) => i !== idx);
                      update({ faqs: updated });
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer"
                  >
                    Delete FAQ
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Question</label>
                    <input
                      className={inputClass}
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...(lifePatron.faqs || [])];
                        updated[idx] = { ...updated[idx], question: e.target.value };
                        update({ faqs: updated });
                      }}
                      placeholder="Enter question..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Answer</label>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...(lifePatron.faqs || [])];
                        updated[idx] = { ...updated[idx], answer: e.target.value };
                        update({ faqs: updated });
                      }}
                      placeholder="Enter detailed answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
