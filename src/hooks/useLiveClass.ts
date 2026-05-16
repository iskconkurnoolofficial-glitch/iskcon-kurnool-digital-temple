import { useEffect, useState } from "react";
import { useAdmin, DailyClass } from "@/context/AdminContext";

/** Returns current IST timestamp in ms (using wall-clock IST). */
function nowIST(): number {
  const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(s).getTime();
}

/** Parse the admin's `startAt` (a "YYYY-MM-DDTHH:mm" local IST string) into ms. */
function parseIST(startAt: string): number {
  // Treat the naive string as IST wall-clock; new Date(localString) returns ms in local TZ,
  // but since we also convert "now" via same wall-clock trick, the comparison stays consistent.
  return new Date(startAt).getTime();
}

export function useLiveClass(): DailyClass | null {
  const { classes } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // Re-evaluate on tick
  void tick;
  const now = nowIST();
  for (const c of classes) {
    if (!c.active || !c.startAt) continue;
    const start = parseIST(c.startAt);
    const end = start + (c.durationMin || 60) * 60_000;
    if (now >= start && now <= end) return c;
  }
  return null;
}
