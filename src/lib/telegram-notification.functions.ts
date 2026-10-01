import { createServerFn } from "@tanstack/react-start";

// In-memory set for deduplication within the server isolate
const inMemoryNotified = new Set<string>();

export interface TelegramDonationInput {
  paymentId: string;
  donorName?: string;
  donorPhone?: string;
  amount: number | string;
  purpose?: string;
  date?: string;
  time?: string;
}

export const sendTelegramDonationNotificationServer = createServerFn({ method: "POST" })
  .inputValidator((data: TelegramDonationInput) => {
    if (!data || !data.paymentId || typeof data.paymentId !== "string") {
      throw new Error("Invalid paymentId");
    }
    return {
      paymentId: data.paymentId.trim().slice(0, 120),
      donorName: typeof data.donorName === "string" ? data.donorName.trim().slice(0, 200) : "",
      donorPhone: typeof data.donorPhone === "string" ? data.donorPhone.trim().slice(0, 30) : "",
      amount: typeof data.amount === "number" ? data.amount : parseFloat(String(data.amount || 0)) || 0,
      purpose: typeof data.purpose === "string" ? data.purpose.trim().slice(0, 300) : "",
      date: typeof data.date === "string" ? data.date.trim() : "",
      time: typeof data.time === "string" ? data.time.trim() : "",
    };
  })
  .handler(async ({ data }) => {
    const { paymentId } = data;

    // Fast check: in-memory Set for current server isolate
    if (inMemoryNotified.has(paymentId)) {
      console.log(`[Telegram Notification] Skipped duplicate payment (in-memory): ${paymentId}`);
      return { ok: true, duplicate: true };
    }

    // Persistent check: Supabase site_data table (if configured)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const key = `tg_pay_${paymentId}`;

      const { data: existing } = await supabaseAdmin
        .from("site_data")
        .select("key")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        inMemoryNotified.add(paymentId);
        console.log(`[Telegram Notification] Skipped duplicate payment (database): ${paymentId}`);
        return { ok: true, duplicate: true };
      }

      await supabaseAdmin.from("site_data").insert({
        key,
        value: { notified_at: new Date().toISOString(), paymentId, amount: data.amount },
      });
    } catch (dbErr) {
      console.warn("[Telegram Notification] DB deduplication check skipped/failed:", dbErr);
    }

    // Mark as notified in-memory
    inMemoryNotified.add(paymentId);
    if (inMemoryNotified.size > 2000) {
      const firstItem = inMemoryNotified.values().next().value;
      if (firstItem) inMemoryNotified.delete(firstItem);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || "-1003975134488";

    if (!botToken) {
      console.error("[Telegram Notification] Error: TELEGRAM_BOT_TOKEN environment variable is missing.");
      return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };
    }

    const now = new Date();
    const formattedDate = data.date || now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const formattedTime = data.time || now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    const name = data.donorName || "Devotee";
    const mobile = data.donorPhone || "N/A";
    const amountStr = typeof data.amount === "number" ? data.amount.toLocaleString("en-IN") : data.amount;
    const purpose = data.purpose || "General Seva";

    const message = `🔔 NEW DONATION RECEIVED\n\n` +
      `👤 Name: ${name}\n` +
      `📱 Mobile: ${mobile}\n` +
      `💰 Amount: ₹${amountStr}\n` +
      `🎯 Purpose: ${purpose}\n` +
      `🧾 Payment ID: ${paymentId}\n` +
      `📅 Date: ${formattedDate}\n` +
      `⏰ Time: ${formattedTime}\n` +
      `✅ Status: Successful`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const resData = (await response.json()) as { ok: boolean; description?: string };
      if (!response.ok || !resData.ok) {
        console.error("[Telegram Notification] API response error:", resData);
        return { ok: false, error: resData.description || "Telegram API call failed" };
      }

      console.log(`[Telegram Notification] Successfully sent notification for payment: ${paymentId}`);
      return { ok: true, duplicate: false };
    } catch (err: any) {
      console.error("[Telegram Notification] Fetch error:", err);
      return { ok: false, error: err?.message || "Failed to call Telegram API" };
    }
  });
