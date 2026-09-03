import { useEffect, useState } from "react";
import { useAdmin, DailyClass } from "@/context/AdminContext";
import { isDailyClassLive } from "@/lib/scheduleUtils";

export function useLiveClass(): DailyClass | null {
  const { classes } = useAdmin();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5_000);
    return () => clearInterval(t);
  }, []);

  // Re-evaluate on tick
  void tick;
  for (const c of classes) {
    if (isDailyClassLive(c)) {
      return c;
    }
  }
  return null;
}
