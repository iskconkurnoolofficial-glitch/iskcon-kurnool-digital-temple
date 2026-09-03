import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileInstallBanner from "@/components/MobileInstallBanner";
import { useAdmin } from "@/context/AdminContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main 
        className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 transition-[padding] duration-300 w-full overflow-x-hidden"
        style={{ paddingTop: "var(--site-header-height, 6rem)" }}
      >
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <LanguageToggle layout="vertical-sticky" />
      <MobileBottomNav />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  pageKey,
  hideBottomRightGradient,
  logo,
  children
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  pageKey?: string;
  hideBottomRightGradient?: boolean;
  logo?: string;
  children?: ReactNode
}) {
  const { heroBanners } = useAdmin();

  // Resolve image: either explicit image prop, or from heroBanners using pageKey
  const resolvedImage =
    image ||
    (pageKey && heroBanners
      ? (heroBanners as any)[pageKey] ||
        (pageKey === "festivals" ? heroBanners.upcomingFestivals : undefined) ||
        (pageKey === "upcomingFestivals" ? heroBanners.festivals : undefined)
      : undefined);

  if (resolvedImage) {
    return (
      <section className={`relative ${hideBottomRightGradient ? "bg-gradient-hero-no-accent" : "bg-gradient-hero"} text-primary-foreground py-10 md:py-12 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-soft opacity-40 animate-fade-in" />
        {/* decorative glow orbs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        {!hideBottomRightGradient && (
          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        )}

        <div className="relative max-w-6xl mx-auto px-6 animate-fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center">

            {/* Left Column: Text Content */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-4">
              {logo && (
                <div className="mb-3 flex justify-center lg:justify-start">
                  <img
                    src={logo}
                    alt="Emblem"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full"
                  />
                </div>
              )}
              {eyebrow && (
                <span className="text-secondary font-semibold uppercase text-xs tracking-[0.3em] block mb-1">
                  {eyebrow}
                </span>
              )}
              {pageKey === "aboutFounder" ? (
                <>
                  {subtitle && (
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-tight">
                      {subtitle}
                    </p>
                  )}
                  <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight !mt-0">
                    {title}
                  </h1>
                </>
              ) : (
                <>
                  <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </>
              )}
              {children && (
                <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
                  {children}
                </div>
              )}
            </div>

            {/* Right Column: Hero Image (1350px * 1080px) */}
            <div className="lg:col-span-6 flex justify-center w-full">
              <div className="relative w-full rounded-3xl overflow-hidden group">
                <img
                  src={resolvedImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  style={{ aspectRatio: "1350 / 1080" }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative ${hideBottomRightGradient ? "bg-gradient-hero-no-accent" : "bg-gradient-hero"} text-primary-foreground py-12 md:py-16 overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-soft opacity-40 animate-fade-in" />
      <div className="relative max-w-5xl mx-auto px-6 text-center animate-fade-up">
        {logo && (
          <div className="mb-4 flex justify-center">
            <img
              src={logo}
              alt="Emblem"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full mx-auto"
            />
          </div>
        )}
        {eyebrow && <span className="text-secondary font-medium uppercase text-xs tracking-[0.3em]">{eyebrow}</span>}
        <h1 className="font-display font-bold text-4xl md:text-6xl mt-4">{title}</h1>
        {subtitle && <p className="mt-4 text-lg md:text-xl opacity-90 max-w-3xl mx-auto">{subtitle}</p>}
        {children && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
