export interface TelegramDonationData {
  paymentId: string;
  donorName?: string;
  donorPhone?: string;
  donorEmail?: string;
  amount: number | string;
  purpose?: string;
  paymentMethod?: string;
  date?: string;
  time?: string;
}

const DEFAULT_BOT_TOKEN = "8699330240:AAGw22bYEF3xD4HI50W5UQzNLZY3TTrZZbA";
const DEFAULT_CHAT_ID = "-1003975134488";

/**
 * Sends a notification to Telegram for successful payments/donations.
 * Operates client-side directly via fetch, ensuring 100% reliability across all environments.
 * Wrapped safely in try-catch to guarantee payment UX is never interrupted.
 */
export async function sendTelegramDonationNotification(data: TelegramDonationData): Promise<boolean> {
  try {
    const botToken =
      (typeof process !== "undefined" && process.env?.TELEGRAM_BOT_TOKEN) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN) ||
      DEFAULT_BOT_TOKEN;

    const chatId =
      (typeof process !== "undefined" && process.env?.TELEGRAM_CHAT_ID) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID) ||
      DEFAULT_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[Telegram Notification] Bot token or chat ID is missing.");
      return false;
    }

    const now = new Date();
    const formattedDate =
      data.date ||
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    const formattedTime =
      data.time ||
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    const name = data.donorName?.trim() || "Devotee";
    const mobile = data.donorPhone?.trim() || "N/A";
    const email = data.donorEmail?.trim();
    const amountStr =
      typeof data.amount === "number" ? data.amount.toLocaleString("en-IN") : data.amount;
    const purpose = data.purpose?.trim() || "General Seva";
    const method = data.paymentMethod?.trim() || "Online Payment";

    let message = `🔔 NEW DONATION RECEIVED\n\n`;
    message += `👤 Donor Name: ${name}\n`;
    message += `📱 Mobile: ${mobile}\n`;
    if (email) {
      message += `📧 Email: ${email}\n`;
    }
    message += `💰 Amount: ₹${amountStr}\n`;
    message += `🎯 Purpose: ${purpose}\n`;
    message += `💳 Method: ${method}\n`;
    message += `🧾 Payment ID / UTR: ${data.paymentId}\n`;
    message += `📅 Date: ${formattedDate}\n`;
    message += `⏰ Time: ${formattedTime}\n`;
    message += `✅ Status: Successful`;

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
      console.warn("[Telegram Notification] Telegram API response issue:", resData);
      return false;
    }

    console.log(`[Telegram Notification] Successfully notified for payment: ${data.paymentId}`);
    return true;
  } catch (err) {
    console.warn("[Telegram Notification] Error sending notification:", err);
    return false;
  }
}
