import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 md:pt-24 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomNav />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-soft opacity-40" />
      <div className="relative max-w-5xl mx-auto px-6 text-center animate-fade-up">
        {eyebrow && <span className="text-secondary font-medium uppercase text-xs tracking-[0.3em]">{eyebrow}</span>}
        <h1 className="font-display font-bold text-4xl md:text-6xl mt-4">{title}</h1>
        {subtitle && <p className="mt-4 text-lg md:text-xl opacity-90 max-w-3xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
