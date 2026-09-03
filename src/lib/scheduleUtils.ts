/** Returns current Date representation of IST (Indian Standard Time). */
export function getCurrentTimeIST(): Date {
  const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(s);
}

/**
 * Parses time strings into minutes from midnight (0 to 1439).
 * Handles formats like: "11:00 AM", "11 AM", "11", "12 PM", "12", "1 PM", "1", "2", "3", "07:30 AM", "7:30 AM – 8:30 AM"
 */
export function parseTimeStrToMinutes(rawStr: string): number | null {
  if (!rawStr) return null;
  const s = rawStr.toLowerCase().replace(/[\u2013\u2014]/g, "-").trim();
  
  const isPM = s.includes("pm");
  const isAM = s.includes("am");

  // Remove am/pm and keep time digits
  const clean = s.replace(/(am|pm)/g, "").trim();
  const firstPart = clean.split("-")[0].trim();
  const parts = firstPart.split(":");
  
  if (!parts[0]) return null;
  let hrs = parseInt(parts[0], 10);
  let mins = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(hrs)) return null;
  if (isNaN(mins)) mins = 0;

  if (isPM) {
    if (hrs < 12) hrs += 12;
  } else if (isAM) {
    if (hrs === 12) hrs = 0;
  } else {
    // Standard 12-hour convention when AM/PM is omitted:
    // 1, 2, 3, 4, 5, 6 -> PM (13:00 to 18:00) e.g., 1 PM, 2 PM, 3 PM
    // 7, 8, 9, 10, 11 -> AM (07:00 to 11:00) e.g., 7 AM, 8 AM, 11 AM
    // 12 -> 12 PM (noon)
    if (hrs >= 1 && hrs <= 6) {
      hrs += 12;
    } else if (hrs === 12) {
      hrs = 12;
    }
  }

  return (hrs % 24) * 60 + mins;
}

/** 
 * Checks if a Daily Class is live right now in IST based on its start & end times or schedule.
 */
export function isDailyClassLive(c: any): boolean {
  if (!c || c.active === false) return false;

  const istDate = getCurrentTimeIST();
  const currentMin = istDate.getHours() * 60 + istDate.getMinutes();

  // If specific single event date and not everyday
  if (!c.everyday && c.startAt) {
    try {
      const classDate = new Date(c.startAt);
      const isSameDay =
        classDate.getFullYear() === istDate.getFullYear() &&
        classDate.getMonth() === istDate.getMonth() &&
        classDate.getDate() === istDate.getDate();
      if (!isSameDay) return false;
    } catch {}
  }

  let startMin: number | null = null;
  let endMin: number | null = null;

  // 1. Try parsing startTimeStr & endTimeStr
  if (c.startTimeStr) {
    const norm = c.startTimeStr.replace(/[\u2013\u2014]/g, "-").trim();
    if (norm.includes("-")) {
      const parts = norm.split("-");
      startMin = parseTimeStrToMinutes(parts[0]);
      endMin = parseTimeStrToMinutes(parts[1]);
    } else {
      startMin = parseTimeStrToMinutes(c.startTimeStr);
    }
  }

  if (endMin === null && c.endTimeStr) {
    endMin = parseTimeStrToMinutes(c.endTimeStr);
  }

  // 2. Fallback to startAt ISO date
  if (startMin === null && c.startAt) {
    try {
      const dt = new Date(c.startAt);
      if (!isNaN(dt.getTime())) {
        startMin = dt.getHours() * 60 + dt.getMinutes();
      }
    } catch {}
  }

  if (startMin === null) return false;

  // Calculate endMin if missing or <= startMin
  if (endMin === null || endMin <= startMin) {
    const duration = Number(c.durationMin) || 60;
    endMin = startMin + duration;
  }

  if (endMin > 1440) {
    return currentMin >= startMin || currentMin <= (endMin % 1440);
  }

  return currentMin >= startMin && currentMin <= endMin;
}

/** 
 * Checks if the current time in IST falls within a specified time range or single event time.
 * @param timeStr - e.g., "11:00 AM – 11:30 AM", "After 12:30 PM", "4:30 AM", "5:15 AM – 7:00 AM", "11", "12", "1"
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

  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    const startMin = parseTimeStrToMinutes(parts[0]);
    const endMin = parseTimeStrToMinutes(parts[1]);
    if (startMin !== null && endMin !== null) {
      if (endMin < startMin) {
        // Spans across midnight
        return currentMinutes >= startMin || currentMinutes <= endMin;
      }
      return currentMinutes >= startMin && currentMinutes <= endMin;
    }
  } else if (normalized.startsWith("after")) {
    const timePart = normalized.replace("after", "").trim();
    const startMin = parseTimeStrToMinutes(timePart);
    if (startMin !== null) {
      // "After X PM" -> assume live for 2 hours (120 minutes)
      return currentMinutes >= startMin && currentMinutes <= startMin + 120;
    }
  } else {
    // Single time like "4:30 AM" or "12:00 PM" or "11"
    const startMin = parseTimeStrToMinutes(normalized);
    if (startMin !== null) {
      // Assume live for 60 minutes
      return currentMinutes >= startMin && currentMinutes <= startMin + 60;
    }
  }

  return false;
}
