import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdmin, defaultPrivacy } from "@/context/AdminContext";
import SiteLayout from "@/components/SiteLayout";
import { Calendar, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ISKCON Kurnool" },
      {
        name: "description",
        content: "Official Privacy Policy for ISKCON Kurnool digital temple services, donations, programme registrations, and communications.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { privacy, settings } = useAdmin();
  const currentPrivacy = privacy || defaultPrivacy;

  const phone = settings.phone || "+91 95053 77520";
  const email = settings.email || "iskconkurnool@gmail.com";
  const address = settings.address || "Sri Sri Puri Jagannath Temple, Kurnool, Andhra Pradesh, India";
  const website = typeof window !== "undefined" ? window.location.origin : "https://iskconkurnool.org";

  // Helper for inline **bold** parsing
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render lines, lists, subheadings, and contact details
  const renderSectionContent = (content: string, isContactSection: boolean) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-3 text-slate-700 text-base leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Subheadings (e.g. ### Heading or **Registration Information**)
          const isStandaloneBoldHeading = /^(\*\*)([^*]+)(\*\*)$/.test(trimmed);
          if (trimmed.startsWith("### ") || isStandaloneBoldHeading) {
            const headingText = isStandaloneBoldHeading
              ? trimmed.slice(2, -2).trim()
              : trimmed.replace(/^###\s*/, "").trim();
            return (
              <h3 key={idx} className="font-display font-bold text-lg text-[#5b2c9b] pt-3 pb-0.5">
                {headingText}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const cleanText = trimmed.replace(/^[•\-*]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-3 pl-4">
                <span className="text-[#5b2c9b] font-bold text-lg leading-none mt-0.5">•</span>
                <span className="flex-1 text-slate-700">
                  {renderInlineFormatting(cleanText)}
                </span>
              </div>
            );
          }

          // Numbered items (1. 2.)
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-3 pl-4">
                <span className="text-[#5b2c9b] font-bold text-sm min-w-[20px]">
                  {numMatch[1]}.
                </span>
                <span className="flex-1 text-slate-700">
                  {renderInlineFormatting(numMatch[2])}
                </span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-700">
              {renderInlineFormatting(trimmed)}
            </p>
          );
        })}

        {/* Dynamic Contact Details for Section 25 */}
        {isContactSection && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm text-slate-800">
            <p><strong className="text-[#5b2c9b]">Address:</strong> {address}</p>
            <p><strong className="text-[#5b2c9b]">Phone:</strong> <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:underline text-slate-900">{phone}</a></p>
            <p><strong className="text-[#5b2c9b]">Email:</strong> <a href={`mailto:${email}`} className="hover:underline text-slate-900">{email}</a></p>
            <p><strong className="text-[#5b2c9b]">Website:</strong> <a href={website} target="_blank" rel="noreferrer" className="hover:underline text-[#5b2c9b]">{website}</a></p>
          </div>
        )}
      </div>
    );
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white font-sans py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-8">
          
          {/* Top Bar with Back Link */}
          <div className="border-b border-slate-200 pb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#5b2c9b] transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Title Header */}
          <header className="space-y-4">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#5b2c9b] tracking-tight">
              {currentPrivacy.introTitle || "Privacy Policy"}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span><strong>Last Updated:</strong> {currentPrivacy.lastUpdated || "24 August 2026"}</span>
            </div>

            <div className="text-base sm:text-lg text-slate-700 leading-relaxed pt-2 space-y-3">
              {(currentPrivacy.introText ||
                "**ISKCON Kurnool / ISKCON Kurnool Temple** respects your privacy and is committed to protecting the personal information you provide while using our website.\n\nThis Privacy Policy explains what information we may collect, why we collect it, how it may be used, how it may be shared, and the choices available to you.\n\nBy using the ISKCON Kurnool website, you acknowledge that you have read and understood this Privacy Policy."
              )
                .split("\n\n")
                .map((para, i) => (
                  <p key={i}>{renderInlineFormatting(para)}</p>
                ))}
            </div>
          </header>

          <hr className="border-slate-200" />

          {/* Clean Sequential Sections Display */}
          <main className="space-y-10">
            {currentPrivacy.sections.map((sec) => {
              const isContactSec = sec.number === "25" || sec.title.toLowerCase().includes("contact us");
              return (
                <section key={sec.id} id={sec.id} className="space-y-3 scroll-mt-24">
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[#5b2c9b] tracking-tight">
                    {sec.number}. {sec.title}
                  </h2>

                  {renderSectionContent(sec.content, isContactSec)}
                </section>
              );
            })}
          </main>

          <hr className="border-slate-200 pt-6" />

          {/* Footer Note */}
          <footer className="text-center text-xs text-slate-400 pb-8">
            © {new Date().getFullYear()} ISKCON Kurnool. All Rights Reserved.
          </footer>

        </div>
      </div>
    </SiteLayout>
  );
}
