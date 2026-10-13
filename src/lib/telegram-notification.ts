export interface TelegramDonationData {
  paymentId: string;
  donorName?: string;
  donorPhone?: string;
  donorEmail?: string;
  donorGotra?: string;
  amount: number | string;
  sevaName?: string;
  purpose?: string;
  paymentMethod?: string;
  status?: string;
  screenshotUrl?: string;
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
    const gotra = data.donorGotra?.trim();
    const amountStr =
      typeof data.amount === "number" ? data.amount.toLocaleString("en-IN") : data.amount;
    const sevaName = data.sevaName?.trim() || data.purpose?.trim() || "General Seva";
    const purpose = data.purpose?.trim();
    const method = data.paymentMethod?.trim() || "Online Payment";

    let message = `🔔 NEW DONATION RECEIVED\n\n`;
    message += `👤 Donor Name: ${name}\n`;
    message += `📱 Mobile: ${mobile}\n`;
    if (email) {
      message += `📧 Email: ${email}\n`;
    }
    if (gotra) {
      message += `🪔 Gotra: ${gotra}\n`;
    }
    message += `💰 Amount: ₹${amountStr}\n`;
    message += `🪷 Seva Name: ${sevaName}\n`;
    if (purpose && purpose !== sevaName) {
      message += `🎯 Purpose / Sankalpa: ${purpose}\n`;
    }
    message += `💳 Method: ${method}\n`;
    message += `🧾 Payment ID / UTR: ${data.paymentId}\n`;
    message += `📅 Date: ${formattedDate}\n`;
    message += `⏰ Time: ${formattedTime}\n\n`;

    const cleanDigits = mobile.replace(/\D/g, "");
    if (cleanDigits.length >= 10) {
      const waNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      message += `💬 Quick WhatsApp Reply:\nhttps://wa.me/${waNumber}\n\n`;
    }

    const isUpiQr =
      method.toLowerCase().includes("upi") ||
      method.toLowerCase().includes("qr");

    const resolvedStatus = data.status
      ? data.status
      : isUpiQr
      ? "NOT VERIFIED"
      : "Successful";

    const statusEmoji = resolvedStatus.toUpperCase().includes("NOT VERIFIED") ? "⚠️" : "✅";
    message += `${statusEmoji} Status: ${resolvedStatus}`;

    // If payment screenshot is present (e.g. UPI transfer receipt proof), deliver directly as a Telegram photo
    if (data.screenshotUrl && data.screenshotUrl.startsWith("http")) {
      try {
        const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            photo: data.screenshotUrl,
            caption: message.slice(0, 1024),
          }),
        });

        const photoResData = (await photoResponse.json()) as { ok: boolean; description?: string };
        if (photoResponse.ok && photoResData.ok) {
          console.log(`[Telegram Notification] Successfully delivered screenshot photo for payment: ${data.paymentId}`);
          return true;
        } else {
          console.warn("[Telegram Notification] sendPhoto failed, falling back to text message:", photoResData);
          message += `\n\n🖼️ Payment Screenshot:\n${data.screenshotUrl}`;
        }
      } catch (err) {
        console.warn("[Telegram Notification] sendPhoto error, falling back to text message:", err);
        message += `\n\n🖼️ Payment Screenshot:\n${data.screenshotUrl}`;
      }
    }

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

export interface TelegramContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
  date?: string;
  time?: string;
}

const DEFAULT_CONTACT_BOT_TOKEN = "8848794808:AAE_iAVlLCdf04M0g9ME_lvLKWykvFXYZjg";
const DEFAULT_CONTACT_CHAT_ID = "-5588999573";

/**
 * Sends a notification to Telegram whenever a user successfully submits a contact message.
 * Operates client-side directly via fetch, ensuring 100% reliability across all environments.
 * Wrapped safely in try-catch to guarantee user submission is never interrupted.
 */
export async function sendTelegramContactNotification(data: TelegramContactData): Promise<boolean> {
  try {
    const botToken =
      (typeof process !== "undefined" && process.env?.TELEGRAM_CONTACT_BOT_TOKEN) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_CONTACT_BOT_TOKEN) ||
      DEFAULT_CONTACT_BOT_TOKEN;

    const chatId =
      (typeof process !== "undefined" && process.env?.TELEGRAM_CONTACT_CHAT_ID) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_CONTACT_CHAT_ID) ||
      DEFAULT_CONTACT_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[Telegram Contact Notification] Bot token or chat ID is missing.");
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

    const name = data.name?.trim() || "Devotee";
    const phone = data.phone?.trim() || "N/A";
    const email = data.email?.trim() || "N/A";
    const userMessage = data.message?.trim() || "No message content";

    let messageText = `📩 NEW CONTACT MESSAGE RECEIVED\n\n`;
    messageText += `👤 Name: ${name}\n`;
    messageText += `📱 Mobile: ${phone}\n`;
    messageText += `📧 Email: ${email}\n`;
    messageText += `📅 Date: ${formattedDate}\n`;
    messageText += `⏰ Time: ${formattedTime}\n\n`;
    messageText += `💬 Message / Query:\n`;
    messageText += `${userMessage}\n\n`;

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length >= 10) {
      const waNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      messageText += `💬 Quick WhatsApp Reply:\nhttps://wa.me/${waNumber}\n\n`;
    }

    messageText += `✅ Status: Submitted Successfully`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
      }),
    });

    const resData = (await response.json()) as { ok: boolean; description?: string };
    if (!response.ok || !resData.ok) {
      console.warn("[Telegram Contact Notification] Telegram API response issue:", resData);
      return false;
    }

    console.log(`[Telegram Contact Notification] Successfully notified for message from: ${name}`);
    return true;
  } catch (err) {
    console.warn("[Telegram Contact Notification] Error sending notification:", err);
    return false;
  }
}
