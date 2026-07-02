import { useState } from "react";

export type WheelChapter = { sanskrit: string; english: string };

export default function ChapterWheel({ chapters }: { chapters: WheelChapter[] }) {
  const [active, setActive] = useState(0);
  const n = chapters.length || 1;

  // Geometry (viewBox 0..100). Marks sit on a ring.
  const cx = 50;
  const cy = 50;
  const r = 42;

  const pos = (i: number) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2; // start at top
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const current = chapters[active];

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8 lg:gap-12 items-center">
      {/* WHEEL */}
      <div className="relative mx-auto w-full max-w-[min(80vw,420px)] aspect-square">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* guide ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="0.4" className="opacity-60" />
          {/* connector to active */}
          {(() => {
            const p = pos(active);
            return <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--secondary)" strokeWidth="0.6" className="opacity-70" />;
          })()}
          {/* marks */}
          {chapters.map((c, i) => {
            const p = pos(i);
            const isActive = i === active;
            return (
              <g
                key={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                onTouchStart={() => setActive(i)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${i + 1}. ${c.sanskrit}`}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(i)}
              >
                {/* larger invisible hit area for touch */}
                <circle cx={p.x} cy={p.y} r={5.5} fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 3.4 : 2.1}
                  className="transition-all"
                  fill={isActive ? "var(--secondary)" : "var(--primary)"}
                  stroke={isActive ? "var(--secondary)" : "transparent"}
                  strokeWidth={isActive ? 1.6 : 0}
                  strokeOpacity={0.35}
                />
                <text
                  x={p.x}
                  y={p.y + (isActive ? 1.4 : 0.9)}
                  textAnchor="middle"
                  fontSize={isActive ? 3.4 : 2.4}
                  fontWeight="700"
                  fill="var(--primary-foreground)"
                  className="pointer-events-none select-none"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        {/* center hub */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center px-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Night</div>
            <div className="font-display font-bold text-4xl text-primary leading-none">{active + 1}</div>
          </div>
        </div>
      </div>

      {/* DETAIL */}
      <div key={active} className="animate-fade-up text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-primary text-xs font-medium">
          Chapter {active + 1} of {n}
        </div>
        <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mt-4">{current?.sanskrit}</h3>
        <p className="mt-2 text-lg text-muted-foreground">{current?.english}</p>
        <p className="mt-5 text-sm text-muted-foreground">Tap or hover any mark on the wheel to preview that night's chapter.</p>
      </div>
    </div>
  );
}
