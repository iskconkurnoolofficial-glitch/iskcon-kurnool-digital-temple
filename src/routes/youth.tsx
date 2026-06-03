import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Youtube, Facebook, MessageCircle, MapPin, Star } from "lucide-react";

// ===== ADMIN CONFIG — Edit these values =====
const WHATSAPP_LINK = "https://chat.whatsapp.com/YOUR_LINK_HERE";
const MAPS_LINK = "https://maps.google.com/?q=ISKCON+Kurnool";

const HIGHLIGHT_IMAGES = [
  { src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800", caption: "Bhagavad Gita Session" },
  { src: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800", caption: "Kirtan Night" },
  { src: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800", caption: "Festival of Lights" },
  { src: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=800", caption: "Drama & Dance" },
  { src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800", caption: "Youth Gathering" },
  { src: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800", caption: "Prasadam Feast" },
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=600",
  "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=600",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600",
  "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=600",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600",
  "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600",
];

const WEEKLY_SCHEDULE = [
  { week: 1, theme: "Bhagavad Gita Study", description: "Dive deep into Krishna's timeless wisdom with guided discussion.", icon: "📖" },
  { week: 2, theme: "Kirtan & Music", description: "Experience pure bliss through devotional chanting and music.", icon: "🎵" },
  { week: 3, theme: "Drama & Dance", description: "Express devotion through performance, drama and dance.", icon: "💃" },
  { week: 4, theme: "Feast & Fellowship", description: "Enjoy delicious prasadam and connect with fellow youth.", icon: "🍽️" },
];

const TESTIMONIALS = [
  { quote: "This program changed how I see life.", name: "Arjun", meta: "21, Kurnool", rating: 5 },
  { quote: "Kirtan here is pure bliss!", name: "Priya", meta: "19, Kurnool", rating: 5 },
  { quote: "I found my purpose through Bhagavad Gita sessions.", name: "Rahul", meta: "23, Kurnool", rating: 5 },
];
// ============================================

const NAVY = "#0D1B2A";
const SAFFRON = "#FF6B1A";
const GOLD = "#FFD700";
const IVORY = "#FFF8EE";

export const Route = createFileRoute("/youth")({
  head: () => ({
    meta: [
      { title: "Youth Festival 2026 — ISKCON Kurnool" },
      { name: "description", content: "Join ISKCON Kurnool's Youth Program every Saturday — kirtan, Bhagavad Gita, drama and prasadam. Youth Festival 2026." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;700&display=swap" },
    ],
  }),
  component: YouthPage,
});

function nextSaturday(): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  let diff = (6 - day + 7) % 7;
  d.setHours(18, 30, 0, 0);
  if (diff === 0 && now.getTime() > d.getTime()) diff = 7;
  d.setDate(d.getDate() + diff);
  d.setHours(18, 30, 0, 0);
  return d;
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("yf-in"); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function YouthPage() {
  useReveal();
  const target = useMemo(() => nextSaturday(), []);
  const { days, hours, mins, secs } = useCountdown(target);

  const currentWeek = useMemo(() => {
    const w = Math.ceil(new Date().getDate() / 7);
    return Math.min(4, Math.max(1, w));
  }, []);

  const [activeT, setActiveT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveT((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: NAVY, color: IVORY, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }} className="yf-root">
      <YouthStyles />

      {/* Mandala watermark */}
      <div className="yf-mandala" aria-hidden />

      {/* TOP BANNER */}
      <section className="yf-banner" data-reveal>
        <div className="yf-sparkles" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${(i % 6) * 0.4}s` }} />)}
        </div>
        <div className="yf-banner-inner">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="yf-title">Youth Festival – 2026</h1>
          <p className="yf-subtitle">Every Saturday &nbsp;|&nbsp; 6:30 PM – 8:30 PM</p>

          <div className="yf-countdown">
            {[["Days", days], ["Hours", hours], ["Mins", mins], ["Secs", secs]].map(([label, val]) => (
              <div key={label as string} className="yf-cd-box">
                <span className="yf-cd-num">{String(val).padStart(2, "0")}</span>
                <span className="yf-cd-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="yf-banner-actions">
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="yf-loc">
              <MapPin size={18} /> ISKCON Kurnool — View on Maps
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="yf-wa-btn">
              Join Our WhatsApp Group 🙏
            </a>
          </div>
        </div>
      </section>

      {/* PROGRAM HIGHLIGHTS */}
      <section className="yf-section" data-reveal>
        <h2 className="yf-h2">Program Highlights</h2>
        <div className="yf-masonry">
          {HIGHLIGHT_IMAGES.map((img, i) => (
            <figure key={i} className="yf-mfig">
              <img src={img.src} alt={img.caption} loading="lazy" />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
          <div className="yf-add-slot">+ Add new image</div>
        </div>
      </section>

      {/* WEEKLY SCHEDULE */}
      <section className="yf-section" data-reveal>
        <h2 className="yf-h2">What Happens Every Saturday</h2>
        <div className="yf-weekly">
          {WEEKLY_SCHEDULE.map((w) => (
            <div key={w.week} className={`yf-week-card ${w.week === currentWeek ? "yf-week-active" : ""}`}>
              <div className="yf-week-icon">{w.icon}</div>
              <div className="yf-week-tag">Week {w.week}{w.week === currentWeek ? " · This Week" : ""}</div>
              <h3 className="yf-week-theme">{w.theme}</h3>
              <p className="yf-week-desc">{w.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAST EVENTS MARQUEE */}
      <section className="yf-section" data-reveal>
        <h2 className="yf-h2">Memories of Joy</h2>
        <div className="yf-marquee">
          <div className="yf-marquee-track">
            {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
              <div key={i} className="yf-marquee-item"><img src={src} alt="Past youth event" loading="lazy" /></div>
            ))}
          </div>
        </div>
        <p className="yf-marquee-cta">Want to see more? Join us this Saturday! 🌸</p>
      </section>

      {/* TESTIMONIALS */}
      <section className="yf-section" data-reveal>
        <h2 className="yf-h2">What Youth Say</h2>
        <div className="yf-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className={`yf-tcard ${i === activeT ? "yf-tcard-on" : ""}`}>
              <div className="yf-lotus" aria-hidden>🪷</div>
              <div className="yf-stars">{Array.from({ length: t.rating }).map((_, s) => <Star key={s} size={18} fill={GOLD} color={GOLD} />)}</div>
              <blockquote style={{ fontFamily: "'Cormorant Garamond', serif" }}>“{t.quote}”</blockquote>
              <figcaption>— {t.name}, {t.meta}</figcaption>
            </figure>
          ))}
        </div>
        <div className="yf-dots">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} aria-label={`Testimonial ${i + 1}`} onClick={() => setActiveT(i)} className={i === activeT ? "on" : ""} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="yf-footer" data-reveal>
        <div className="yf-divider"><span>🪷</span></div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="yf-foot-name">Sri Sri Sri Puri Jagannath Temple</h3>
        <p className="yf-foot-addr">Bhagirathi Complex, 2nd Floor, Door No. 40 384,<br />Opposite Kids World Park Road, Kurnool – 518001</p>
        <p className="yf-foot-phone">95053 77520 · 96689 47723 · 78935 67029</p>
        <div className="yf-foot-social">
          <a href="https://instagram.com/iskcon_kurnool" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
          <a href="https://youtube.com/@iskconkurnool" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={20} /></a>
          <a href="https://facebook.com/iskconkurnool" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
          <a href="https://wa.me/919505377520" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
        </div>
        <p className="yf-hashtag">#IskconyouthFest2026</p>
        <div className="yf-foot-logo">IK</div>
      </footer>

      {/* STICKY MOBILE WHATSAPP */}
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="yf-sticky-wa" aria-label="Join WhatsApp group">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

function YouthStyles() {
  return (
    <style>{`
      .yf-root { position: relative; overflow-x: hidden; scroll-behavior: smooth; }
      .yf-mandala { position: fixed; inset: 0; pointer-events: none; opacity: 0.05; z-index: 0;
        background-image: radial-gradient(circle at 50% 50%, ${GOLD} 0, transparent 2px), radial-gradient(circle at 0 0, ${SAFFRON} 0, transparent 2px);
        background-size: 60px 60px; }
      [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
      [data-reveal].yf-in { opacity: 1; transform: none; }

      .yf-banner { position: relative; z-index: 1; padding: 72px 20px 56px; text-align: center;
        background: radial-gradient(ellipse at top, rgba(255,107,26,.22), transparent 60%); overflow: hidden; }
      .yf-banner-inner { position: relative; z-index: 2; max-width: 820px; margin: 0 auto; }
      .yf-title { font-size: clamp(2.4rem, 7vw, 4.5rem); font-weight: 700; line-height: 1.05;
        background: linear-gradient(90deg, ${GOLD}, ${SAFFRON}); -webkit-background-clip: text; background-clip: text; color: transparent;
        text-shadow: 0 0 40px rgba(255,215,0,.25); }
      .yf-subtitle { margin-top: 12px; font-size: clamp(1rem,2.6vw,1.35rem); letter-spacing: .04em; color: ${IVORY}; opacity: .9; }
      .yf-countdown { display: flex; justify-content: center; gap: 12px; margin: 32px auto 28px; flex-wrap: wrap; }
      .yf-cd-box { background: rgba(255,255,255,.06); border: 1px solid rgba(255,215,0,.3); border-radius: 16px;
        padding: 14px 18px; min-width: 78px; backdrop-filter: blur(8px); }
      .yf-cd-num { display: block; font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 700; color: ${GOLD}; font-variant-numeric: tabular-nums; }
      .yf-cd-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .14em; opacity: .75; }
      .yf-banner-actions { display: flex; flex-direction: column; align-items: center; gap: 14px; }
      .yf-loc { display: inline-flex; align-items: center; gap: 8px; color: ${GOLD}; font-weight: 500; text-decoration: none; }
      .yf-loc:hover { text-decoration: underline; }
      .yf-wa-btn { display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #04241a; font-weight: 700;
        padding: 14px 28px; border-radius: 999px; text-decoration: none; box-shadow: 0 0 0 0 rgba(37,211,102,.6); animation: yf-pulse 2s infinite; }
      @keyframes yf-pulse { 0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)} 70%{box-shadow:0 0 0 18px rgba(37,211,102,0)} 100%{box-shadow:0 0 0 0 rgba(37,211,102,0)} }

      .yf-sparkles { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
      .yf-sparkles span { position: absolute; top: -10px; width: 6px; height: 6px; border-radius: 50%;
        background: ${GOLD}; box-shadow: 0 0 8px ${GOLD}; animation: yf-fall 4s linear infinite; opacity: .8; }
      @keyframes yf-fall { to { transform: translateY(420px) scale(.4); opacity: 0; } }

      .yf-section { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 56px 20px; }
      .yf-h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,5vw,2.8rem); font-weight: 700;
        text-align: center; margin-bottom: 32px; color: ${IVORY}; }
      .yf-h2::after { content: ""; display: block; width: 70px; height: 3px; margin: 14px auto 0;
        background: linear-gradient(90deg, ${SAFFRON}, ${GOLD}); border-radius: 2px; }

      .yf-masonry { columns: 3; column-gap: 16px; }
      .yf-mfig { break-inside: avoid; margin: 0 0 16px; position: relative; border-radius: 16px; overflow: hidden;
        border: 1px solid rgba(255,215,0,.2); }
      .yf-mfig img { width: 100%; display: block; transition: transform .5s ease; }
      .yf-mfig:hover img { transform: scale(1.06); }
      .yf-mfig figcaption { position: absolute; inset: auto 0 0 0; padding: 14px 12px 10px; font-weight: 600;
        background: linear-gradient(transparent, rgba(13,27,42,.92)); color: ${GOLD};
        opacity: 0; transform: translateY(8px); transition: .3s; }
      .yf-mfig:hover { box-shadow: 0 0 0 2px ${GOLD}; }
      .yf-mfig:hover figcaption { opacity: 1; transform: none; }
      .yf-add-slot { break-inside: avoid; border: 2px dashed rgba(255,215,0,.35); border-radius: 16px;
        min-height: 130px; display: grid; place-items: center; color: rgba(255,248,238,.5); font-weight: 500; }

      .yf-weekly { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
      .yf-week-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 18px;
        padding: 22px 18px; text-align: center; backdrop-filter: blur(6px); }
      .yf-week-active { border-color: ${GOLD}; box-shadow: 0 0 28px rgba(255,215,0,.3); background: rgba(255,107,26,.12); }
      .yf-week-icon { font-size: 2rem; }
      .yf-week-tag { margin-top: 8px; font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; color: ${SAFFRON}; font-weight: 700; }
      .yf-week-theme { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 700; margin: 6px 0 8px; color: ${IVORY}; }
      .yf-week-desc { font-size: .9rem; opacity: .8; line-height: 1.5; }

      .yf-marquee { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
      .yf-marquee-track { display: flex; gap: 16px; width: max-content; animation: yf-scroll 32s linear infinite; }
      .yf-marquee:hover .yf-marquee-track { animation-play-state: paused; }
      .yf-marquee-item { width: 240px; height: 160px; border-radius: 14px; overflow: hidden; flex: 0 0 auto;
        border: 1px solid rgba(255,255,255,.08); transition: .3s; }
      .yf-marquee-item img { width: 100%; height: 100%; object-fit: cover; }
      .yf-marquee-item:hover { box-shadow: 0 0 0 2px ${GOLD}; }
      @keyframes yf-scroll { to { transform: translateX(-50%); } }
      .yf-marquee-cta { text-align: center; margin-top: 22px; color: ${GOLD}; font-weight: 500; }

      .yf-testimonials { position: relative; max-width: 640px; margin: 0 auto; min-height: 230px; }
      .yf-tcard { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(255,215,0,.1), rgba(255,107,26,.06));
        border: 1px solid rgba(255,215,0,.3); border-radius: 22px; padding: 34px 28px; text-align: center;
        opacity: 0; transform: scale(.96); transition: opacity .6s, transform .6s; pointer-events: none; }
      .yf-tcard-on { opacity: 1; transform: none; pointer-events: auto; }
      .yf-lotus { font-size: 1.8rem; }
      .yf-stars { display: flex; justify-content: center; gap: 4px; margin: 8px 0 14px; }
      .yf-tcard blockquote { font-size: clamp(1.2rem,3vw,1.6rem); line-height: 1.4; color: ${IVORY}; margin: 0 0 14px; }
      .yf-tcard figcaption { color: ${GOLD}; font-weight: 600; }
      .yf-dots { display: flex; justify-content: center; gap: 8px; margin-top: 18px; }
      .yf-dots button { width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer;
        background: rgba(255,255,255,.25); }
      .yf-dots button.on { background: ${GOLD}; width: 26px; border-radius: 6px; }

      .yf-footer { position: relative; z-index: 1; text-align: center; padding: 48px 20px 110px; }
      .yf-divider { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 26px; }
      .yf-divider::before, .yf-divider::after { content: ""; height: 2px; width: min(34%,260px);
        background: linear-gradient(90deg, transparent, ${SAFFRON}); }
      .yf-divider::after { background: linear-gradient(90deg, ${SAFFRON}, transparent); }
      .yf-divider span { font-size: 1.5rem; }
      .yf-foot-name { font-size: 1.6rem; font-weight: 700; color: ${GOLD}; }
      .yf-foot-addr { margin-top: 10px; opacity: .85; line-height: 1.6; }
      .yf-foot-phone { margin-top: 8px; opacity: .85; }
      .yf-foot-social { display: flex; justify-content: center; gap: 14px; margin: 20px 0; }
      .yf-foot-social a { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center;
        background: rgba(255,255,255,.06); border: 1px solid rgba(255,215,0,.3); color: ${GOLD}; transition: .3s; }
      .yf-foot-social a:hover { background: ${SAFFRON}; color: #04241a; transform: translateY(-3px); }
      .yf-hashtag { color: ${SAFFRON}; font-weight: 700; letter-spacing: .03em; }
      .yf-foot-logo { width: 56px; height: 56px; border-radius: 50%; margin: 18px auto 0;
        background: linear-gradient(135deg, ${SAFFRON}, ${GOLD}); color: ${NAVY}; font-weight: 800;
        display: grid; place-items: center; font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; }

      .yf-sticky-wa { position: fixed; right: 18px; bottom: 18px; z-index: 50; width: 58px; height: 58px;
        border-radius: 50%; background: #25D366; color: #04241a; display: none; place-items: center;
        box-shadow: 0 8px 24px rgba(0,0,0,.4); animation: yf-pulse 2s infinite; }

      @media (max-width: 900px) { .yf-masonry { columns: 2; } .yf-weekly { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 600px) {
        .yf-masonry { columns: 1; } .yf-weekly { grid-template-columns: 1fr; }
        .yf-sticky-wa { display: grid; }
      }
    `}</style>
  );
}
