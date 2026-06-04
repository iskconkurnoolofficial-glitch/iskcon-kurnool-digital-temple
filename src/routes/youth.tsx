import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import { useAdmin } from "@/context/AdminContext";
import { MessageCircle, Star, Instagram, MapPin, Calendar, Settings } from "lucide-react";

export const Route = createFileRoute("/youth")({
  head: () => ({ meta: [
    { title: "Youth Festival — ISKCON Kurnool" },
    { name: "description", content: "Youth Festival at ISKCON Kurnool — every Saturday for boys. Bhagavad Gita, kirtan, music, dance and prasadam." },
    { property: "og:title", content: "Youth Festival — ISKCON Kurnool" },
    { property: "og:description", content: "Join the ISKCON Kurnool Youth every Saturday 6:30–8:30 PM for kirtan, Gita wisdom and prasadam." },
  ]}),
  component: YouthPage,
});

function YouthPage() {
  const { youth } = useAdmin();
  const visibleReviews = youth.reviews.filter((r) => r.visible);

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* WhatsApp banner */}
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-display text-xl md:text-2xl font-bold text-green-800 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" /> Join Our Whatsapp Group
            </h2>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold tracking-wide">
              ISKCON KURNOOL YOUTH
            </span>
          </div>
          <a
            href={youth.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition shrink-0"
          >
            <MessageCircle className="h-5 w-5" /> Join
          </a>
        </div>

        {/* Hero card */}
        <div className="rounded-3xl bg-gradient-soft border border-border shadow-elegant overflow-hidden p-6 md:p-10">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium">ISKCON Kurnool</span>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold">
                <Calendar className="h-3.5 w-3.5" /> Every Saturday
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl text-primary mt-4">Youth Festival</h1>
            <p className="mt-3 text-muted-foreground font-medium">{youth.schedule}</p>
          </div>

          {/* 2x2 feature grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-5 mt-8">
            {youth.features.map((ft, i) => (
              <div key={i} className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
                <div className="aspect-square bg-muted grid place-items-center">
                  {ft.image ? (
                    <img src={ft.image} alt={ft.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-sm">{ft.title}</span>
                  )}
                </div>
                <div className="p-3 text-center font-semibold text-primary text-sm md:text-base">{ft.title}</div>
              </div>
            ))}
          </div>

          <p className="text-center italic text-muted-foreground mt-8">
            "Engage the youth in Krishna's service and the world will transform."
          </p>

          <div className="mt-6 rounded-2xl bg-[#3a2417] text-amber-50 p-5 flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
            <p className="whitespace-pre-line text-sm leading-relaxed">{youth.venue}</p>
          </div>

          <p className="text-center mt-6 font-display font-bold text-accent">#ISKCONKurnoolYouth</p>
        </div>

        {/* Auto-scrolling gallery */}
        {youth.gallery.length > 0 && <AutoGallery images={youth.gallery} />}

        {/* Reviews */}
        {visibleReviews.length > 0 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-6">What Youth Say</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleReviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white border border-border shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instagram */}
        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 grid place-items-center mx-auto mb-3">
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-primary">Follow us on Instagram</h2>
          <p className="text-muted-foreground text-sm mt-1">@{youth.instagramHandle}</p>
          <a
            href={`https://instagram.com/${youth.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-secondary text-primary font-semibold hover:scale-105 transition"
          >
            Follow
          </a>
        </div>

        {/* Admin card */}
        <Link
          to="/admin"
          className="block rounded-2xl bg-[#3a2417] text-amber-50 p-5 hover:opacity-95 transition"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-secondary" />
            <span className="font-semibold">Admin Panel</span>
          </div>
          <p className="text-sm opacity-80 mt-1">Manage settings, gallery and reviews</p>
        </Link>
      </div>
    </SiteLayout>
  );
}

function AutoGallery({ images }: { images: { id: string; url: string; label: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        track.scrollLeft += 0.6;
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) track.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [images.length]);

  const loop = [...images, ...images];

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-6">Gallery</h2>
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-hidden"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {loop.map((img, i) => (
          <div key={img.id + "-" + i} className="shrink-0 w-56 md:w-64">
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-white">
              <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" />
            </div>
            {img.label && <p className="text-center text-xs text-muted-foreground mt-2">{img.label}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
