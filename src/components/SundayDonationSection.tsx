import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";
import { Sparkles, Heart, Gift, HandHeart, ShieldCheck, ArrowRight, CheckCircle2, IndianRupee } from "lucide-react";

export default function SundayDonationSection({ className = "" }: { className?: string }) {
  const { sunday, sevas } = useAdmin();

  // If admin toggled off the donation section
  if (sunday.donationCardEnabled === false) {
    return null;
  }

  // Find Sunday Feast Seva from Jagannath Sevas
  const sundaySeva = sevas.find(
    (s) => s.slug === "sunday-feast" || s.slug === "sunday-feast-seva" || s.title.toLowerCase().includes("sunday feast")
  ) || sevas[0];

  // Parse single editable sponsorship amount from Jagannath Sevas / Sunday settings
  const sevaPriceAmount = sundaySeva?.prices?.[0]?.amount;
  const rawAmount = sunday.donationCardAmount ? parseInt(sunday.donationCardAmount.replace(/\D/g, ""), 10) : sevaPriceAmount || 5001;
  const sponsorshipAmount = isNaN(rawAmount) || rawAmount <= 0 ? (sevaPriceAmount || 5001) : rawAmount;

  const title = sundaySeva?.title || sunday.donationCardTitle || "Sunday Feast Annadana Seva";
  const description = sundaySeva?.description || sunday.donationCardDescription || "Feed visiting devotees with sanctified Krishna prasadam every Sunday. Sponsoring the Sunday Feast brings immense spiritual peace, auspiciousness, and blessings for your family.";
  const buttonLabel = sunday.donationCardButtonLabel || `Sponsor Sunday Feast Online`;
  
  // Image directly synced with Jagannath Sevas admin panel
  const sevaImage = sundaySeva?.thumbnail || sunday.donationCardImage || "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80";

  // Determine target checkout URL (clean URL: /donate/sunday-feast)
  let targetUrl = sunday.donationCardButtonUrl?.trim() || "/donate/sunday-feast";
  if (!targetUrl.startsWith("/")) targetUrl = `/${targetUrl}`;
  const checkoutUrl = targetUrl;

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-[#180528] via-[#2a0e4b] to-[#120320] text-white border-t border-amber-400/20 relative overflow-hidden ${className}`}>
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 to-accent/15 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.75px,transparent_0.75px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="relative rounded-[36px] bg-gradient-to-br from-[#240b44]/95 via-[#371367]/95 to-[#1c0836]/95 backdrop-blur-2xl border-2 border-secondary/40 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] p-6 sm:p-10 lg:p-12 overflow-hidden">
          
          {/* Ambient Lighting inside Card */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header Row */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6 mb-8">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/25 border border-secondary/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> Sacred Annadana Seva
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {title}
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-amber-200 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full font-semibold shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>80G Tax Exemption Available</span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Devotional Seva Image uploaded in Jagannath Sevas */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-secondary/50 group">
                <img 
                  src={sevaImage} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                
                {/* Floating Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/25 text-white font-sans text-xs font-bold tracking-wide shadow-md">
                    Sri Sri Jagannath Annadana Seva
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Purpose, Inter Font Amount & Saffron Button */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-4">
                <p className="text-white/85 font-sans text-sm sm:text-base leading-relaxed">
                  {description}
                </p>

                {/* Auspicious Occasions List */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <h4 className="font-display font-bold text-sm text-amber-300 flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent" /> Auspicious Occasions to Sponsor:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-white/80 font-sans">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Birthdays & Milestones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Wedding Anniversaries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>In Loving Memory</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>General Devotional Gratitude</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Single Amount Box in Bold Inter Font in Dark Gradient */}
              <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-black/40 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-2 border-amber-400/45 text-center space-y-4 shadow-lg">
                
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest font-sans block">
                    Fixed Sunday Feast Sponsorship Amount
                  </span>
                  {/* Big Inter font amount in luminous golden amber */}
                  <div className="font-sans font-black text-5xl sm:text-6xl lg:text-7xl text-amber-300 tracking-tight flex items-center justify-center gap-1.5 leading-none py-1 drop-shadow-md">
                    <span>₹{sponsorshipAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <span className="text-xs text-amber-100/75 font-sans font-medium block pt-1">
                    One Sunday Complete Feast Prasadam Distribution
                  </span>
                </div>

                {/* Saffron Action Button */}
                <div className="pt-2">
                  <Link
                    to={checkoutUrl}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-sans font-bold text-base sm:text-lg shadow-[0_10px_25px_-5px_rgba(249,115,22,0.55)] hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.7)] transition-all duration-300 hover:scale-[1.02] border border-amber-300/50 cursor-pointer"
                  >
                    <HandHeart className="h-5 w-5 text-white" />
                    <span>{buttonLabel}</span>
                    <ArrowRight className="h-5 w-5 text-white ml-1" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-amber-100/70 px-2 pt-1 gap-2 font-sans">
                  <span>Special Archana prayers for sponsor family</span>
                  <Link
                    to="/donate"
                    className="font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1"
                  >
                    View All Temple Sevas <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
