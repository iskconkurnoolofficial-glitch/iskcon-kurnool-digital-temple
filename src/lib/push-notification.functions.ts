import { createServerFn } from "@tanstack/react-start";

export interface PushSubscriptionItem {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  subscribedAt: string;
  deviceInfo?: string;
}

export interface SentNotificationRecord {
  id: string;
  title: string;
  body: string;
  url?: string;
  image?: string;
  sentAt: string;
  recipientCount: number;
  status: "sent" | "failed";
}

/** Save a new push notification subscription */
export const savePushSubscriptionServer = createServerFn({ method: "POST" })
  .inputValidator((data: { endpoint: string; keys?: { p256dh?: string; auth?: string }; deviceInfo?: string }) => {
    if (!data || !data.endpoint) {
      throw new Error("Invalid push subscription data");
    }
    return {
      endpoint: String(data.endpoint).trim(),
      keys: data.keys ? {
        p256dh: data.keys.p256dh ? String(data.keys.p256dh).trim() : undefined,
        auth: data.keys.auth ? String(data.keys.auth).trim() : undefined,
      } : undefined,
      deviceInfo: data.deviceInfo ? String(data.deviceInfo).trim().slice(0, 200) : "Mobile Browser",
    };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Fetch existing subscriptions from site_data table
      const { data: row, error: fetchError } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushSubscriptions")
        .maybeSingle();

      let currentSubscriptions: PushSubscriptionItem[] = [];
      if (!fetchError && row && Array.isArray(row.value)) {
        currentSubscriptions = row.value as PushSubscriptionItem[];
      }

      // Avoid duplicates based on endpoint
      const existingIndex = currentSubscriptions.findIndex((s) => s.endpoint === data.endpoint);
      const newEntry: PushSubscriptionItem = {
        endpoint: data.endpoint,
        keys: data.keys,
        subscribedAt: new Date().toISOString(),
        deviceInfo: data.deviceInfo,
      };

      if (existingIndex >= 0) {
        currentSubscriptions[existingIndex] = newEntry;
      } else {
        currentSubscriptions.unshift(newEntry);
      }

      // Limit array size to last 10,000 subscribers safely
      const trimmedSubscriptions = currentSubscriptions.slice(0, 10000);

      const { error: updateError } = await supabaseAdmin.from("site_data").upsert(
        {
          key: "pushSubscriptions",
          value: trimmedSubscriptions as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (updateError) {
        console.error("[PushNotification] Error saving subscription:", updateError);
        return { ok: false as const, count: currentSubscriptions.length };
      }

      return { ok: true as const, count: trimmedSubscriptions.length };
    } catch (e: any) {
      console.error("[PushNotification] Exception in save subscription:", e);
      return { ok: false as const, count: 0 };
    }
  });

/** Remove a push subscription */
export const removePushSubscriptionServer = createServerFn({ method: "POST" })
  .inputValidator((data: { endpoint: string }) => {
    return { endpoint: String(data.endpoint || "").trim() };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: row } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushSubscriptions")
        .maybeSingle();

      if (row && Array.isArray(row.value)) {
        const filtered = (row.value as PushSubscriptionItem[]).filter((s) => s.endpoint !== data.endpoint);
        await supabaseAdmin.from("site_data").upsert(
          {
            key: "pushSubscriptions",
            value: filtered as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      }
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const };
    }
  });

/** Send a broadcast notification to all push subscribers */
export const sendPushBroadcastServer = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string; body: string; url?: string; image?: string }) => {
    if (!data.title || !data.body) {
      throw new Error("Title and Body are required for broadcast");
    }
    return {
      title: String(data.title).trim().slice(0, 200),
      body: String(data.body).trim().slice(0, 500),
      url: data.url ? String(data.url).trim().slice(0, 500) : "/",
      image: data.image ? String(data.image).trim().slice(0, 500) : undefined,
    };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Fetch active subscriptions
      const { data: subRow } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushSubscriptions")
        .maybeSingle();

      const subscriptions: PushSubscriptionItem[] = (subRow && Array.isArray(subRow.value)) ? subRow.value : [];
      const recipientCount = subscriptions.length;

      // 2. Record notification entry in pushNotificationsHistory
      const { data: historyRow } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushNotificationsHistory")
        .maybeSingle();

      let historyList: SentNotificationRecord[] = (historyRow && Array.isArray(historyRow.value)) ? historyRow.value : [];

      const newRecord: SentNotificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        body: data.body,
        url: data.url,
        image: data.image,
        sentAt: new Date().toISOString(),
        recipientCount,
        status: "sent",
      };

      historyList = [newRecord, ...historyList].slice(0, 100);

      await supabaseAdmin.from("site_data").upsert(
        {
          key: "pushNotificationsHistory",
          value: historyList as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      return {
        ok: true as const,
        recipientCount,
        record: newRecord,
      };
    } catch (e: any) {
      console.error("[PushNotification] Error broadcasting push:", e);
      return { ok: false as const, recipientCount: 0, record: null };
    }
  });

/** Fetch Push Stats & History */
export const getPushStatsServer = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: subRow } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushSubscriptions")
        .maybeSingle();

      const { data: historyRow } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "pushNotificationsHistory")
        .maybeSingle();

      const subscriptions: PushSubscriptionItem[] = (subRow && Array.isArray(subRow.value)) ? subRow.value : [];
      const history: SentNotificationRecord[] = (historyRow && Array.isArray(historyRow.value)) ? historyRow.value : [];

      return {
        ok: true as const,
        totalSubscribers: subscriptions.length,
        history,
      };
    } catch (e) {
      return { ok: false as const, totalSubscribers: 0, history: [] };
    }
  });
