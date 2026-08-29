import { useEffect, useState } from "react";
import { Type, Minus, Plus, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentSizeAdjuster({
  className = "",
  layout = "horizontal"
}: {
  className?: string;
  layout?: "horizontal" | "vertical-sticky";
}) {
  const [scale, setScale] = useState<number>(1.0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem("content-scale");
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0.9 && val <= 1.25) {
        setScale(val);
        document.documentElement.style.fontSize = `${val * 16}px`;
      }
    }
  }, []);

  const updateScale = (newScale: number) => {
    const clamped = Math.max(0.9, Math.min(1.25, Math.round(newScale * 100) / 100));
    setScale(clamped);
    document.documentElement.style.fontSize = `${clamped * 16}px`;
    localStorage.setItem("content-scale", clamped.toString());
  };

  const handleReset = () => {
    updateScale(1.0);
  };

  const increase = () => {
    updateScale(scale + 0.05);
  };

  const decrease = () => {
    updateScale(scale - 0.05);
  };

  const percentage = Math.round(scale * 100);

  if (layout === "vertical-sticky") {
    return (
      <div
        className="fixed right-0 z-50 hidden lg:flex items-center"
        style={{ top: "calc(50vh - 22px)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Sliding Panel */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="mr-2 bg-white/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-xl flex flex-col gap-2.5 w-48 text-foreground"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Text Size</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="hover:text-primary transition-colors p-0.5 rounded hover:bg-slate-100"
                  title="Reset to 100%"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={decrease}
                  disabled={scale <= 0.9}
                  className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  aria-label="Decrease font size"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <span className="text-sm font-bold w-12 text-center select-none">
                  {percentage}%
                </span>

                <button
                  type="button"
                  onClick={increase}
                  disabled={scale >= 1.25}
                  className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  aria-label="Increase font size"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Slider Input */}
              <div className="px-1 py-0.5">
                <input
                  type="range"
                  min="0.9"
                  max="1.25"
                  step="0.05"
                  value={scale}
                  onChange={(e) => updateScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  aria-label="Content scale slider"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <motion.div
          animate={{
            backgroundColor: hovered ? "#fbe9cf" : "#ffffff",
            borderColor: hovered ? "#f5c518" : "#ece6f5",
          }}
          transition={{ duration: 0.2 }}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-l-2xl border border-r-0 bg-white shadow-md"
        >
          <Type className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Horizontal layout for mobile / standard settings pages
  return (
    <div className={`flex flex-col gap-2 p-3 bg-white/50 border border-slate-100 rounded-2xl w-full text-foreground ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Type className="h-4 w-4 text-primary" />
          <span>Content Size Adjuster</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 hover:text-primary transition-colors text-[10px] uppercase font-bold p-1 rounded hover:bg-slate-100/50"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          disabled={scale <= 0.9}
          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all border border-slate-200/50"
          aria-label="Decrease font size"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Slider Input */}
        <div className="flex-1 px-1 flex items-center">
          <input
            type="range"
            min="0.9"
            max="1.25"
            step="0.05"
            value={scale}
            onChange={(e) => updateScale(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            aria-label="Content scale slider"
          />
        </div>

        <button
          type="button"
          onClick={increase}
          disabled={scale >= 1.25}
          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all border border-slate-200/50"
          aria-label="Increase font size"
        >
          <Plus className="h-4 w-4" />
        </button>

        <span className="text-xs font-extrabold w-10 text-right select-none text-slate-800">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
