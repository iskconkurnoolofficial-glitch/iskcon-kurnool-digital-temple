/** Returns current Date representation of IST (Indian Standard Time). */
export function getCurrentTimeIST(): Date {
  const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(s);
}

/** 
 * Checks if the current time in IST falls within a specified time range or single event time.
 * @param timeStr - e.g., "11:00 AM – 11:30 AM", "After 12:30 PM", "4:30 AM", "5:15 AM – 7:00 AM"
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday). If undefined, checks every day.
 */
export function isTimeStrLive(timeStr: string, dayOfWeek?: number): boolean {
  if (!timeStr) return false;

  const istDate = getCurrentTimeIST();
  const istDayOfWeek = istDate.getDay();

  // If a day is specified and it's not today, it is not live
  if (dayOfWeek !== undefined && istDayOfWeek !== dayOfWeek) {
    return false;
  }

  const hour = istDate.getHours();
  const minute = istDate.getMinutes();
  const currentMinutes = hour * 60 + minute;

  // Normalize timeStr: replace en-dash/em-dash with standard dash, trim
  const normalized = timeStr.replace(/[\u2013\u2014]/g, "-").toLowerCase().trim();

  // Helper to parse time strings like "11:00 am", "12:00 pm", "4:30 am"
  function parseTime(t: string): number | null {
    t = t.trim();
    const pm = t.includes("pm");
    const am = t.includes("am");
    const clean = t.replace(/(am|pm)/g, "").trim();
    const parts = clean.split(":");
    if (parts.length === 0 || !parts[0]) return null;
    
    let hrs = parseInt(parts[0], 10);
    let mins = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(hrs) || isNaN(mins)) return null;

    if (pm && hrs < 12) hrs += 12;
    if (am && hrs === 12) hrs = 0;

    return hrs * 60 + mins;
  }

  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    const startMin = parseTime(parts[0]);
    const endMin = parseTime(parts[1]);
    if (startMin !== null && endMin !== null) {
      if (endMin < startMin) {
        // Spans across midnight
        return currentMinutes >= startMin || currentMinutes <= endMin;
      }
      return currentMinutes >= startMin && currentMinutes <= endMin;
    }
  } else if (normalized.startsWith("after")) {
    const timePart = normalized.replace("after", "").trim();
    const startMin = parseTime(timePart);
    if (startMin !== null) {
      // "After X PM" -> assume live for 2 hours (120 minutes)
      return currentMinutes >= startMin && currentMinutes <= startMin + 120;
    }
  } else {
    // Single time like "4:30 AM" or "12:00 PM"
    const startMin = parseTime(normalized);
    if (startMin !== null) {
      // Assume live for 45 minutes
      return currentMinutes >= startMin && currentMinutes <= startMin + 45;
    }
  }

  return false;
}
