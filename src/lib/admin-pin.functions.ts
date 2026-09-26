import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { supabase } from "@/integrations/supabase/client";

const PIN_SALT = "iskcon_kurnool_admin_pin_salt_2026_v1";

// Helper to get a working Supabase client (tries admin service client if present, else standard client)
async function getDbClient() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (supabaseAdmin) return supabaseAdmin;
  } catch {}
  return supabase;
}

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin.trim() + PIN_SALT).digest("hex");
}

function generateRandom6DigitPin(): string {
  const pinNum = crypto.randomInt(100000, 1000000);
  return pinNum.toString();
}

/** Check if an admin PIN is currently configured in Supabase database */
export const hasAdminPinConfiguredServer = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const client = await getDbClient();
      const { data, error } = await client
        .from("site_data")
        .select("value")
        .eq("key", "admin_security_pin_hash")
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === "object" && "hash" in (data.value as any)) {
        return { configured: true };
      }
    } catch (e) {
      console.error("[admin-pin] hasConfigured error:", e);
    }
    return { configured: false };
  });

/** Fetch the currently active generated 6-digit PIN from Supabase database for display on /bank-pin */
export const getActiveAdminPinServer = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const client = await getDbClient();
      const { data, error } = await client
        .from("site_data")
        .select("value")
        .eq("key", "admin_active_raw_pin")
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === "object" && "pin" in (data.value as any)) {
        return { 
          pin: (data.value as any).pin as string, 
          generatedAt: (data.value as any).generatedAt as string 
        };
      }
    } catch (e) {
      console.error("[admin-pin] getActivePin error:", e);
    }
    return { pin: null, generatedAt: null };
  });

/** Generate a new 6-digit PIN securely in Supabase cloud database so any logged in admin account can access it */
export const generateAdminPinServer = createServerFn({ method: "POST" })
  .handler(async () => {
    const rawPin = generateRandom6DigitPin();
    const pinHash = hashPin(rawPin);
    const updatedAt = new Date().toISOString();

    const hashRecord = { hash: pinHash, updatedAt };
    const rawRecord = { pin: rawPin, generatedAt: updatedAt };

    let saved = false;
    try {
      const client = await getDbClient();
      const [resHash, resRaw] = await Promise.all([
        client.from("site_data").upsert(
          { key: "admin_security_pin_hash", value: hashRecord, updated_at: updatedAt },
          { onConflict: "key" }
        ),
        client.from("site_data").upsert(
          { key: "admin_active_raw_pin", value: rawRecord, updated_at: updatedAt },
          { onConflict: "key" }
        ),
      ]);
      if (!resHash.error && !resRaw.error) {
        saved = true;
      } else {
        console.error("[admin-pin] upsert error:", resHash.error || resRaw.error);
      }
    } catch (e) {
      console.error("[admin-pin] generate error:", e);
    }

    return {
      success: true,
      pin: rawPin,
      updatedAt,
      persisted: saved,
    };
  });

/** Verify a submitted 6-digit PIN against Supabase cloud database */
export const verifyAdminPinServer = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => {
    const pinStr = String(data?.pin || "").trim();
    if (!/^\d{6}$/.test(pinStr)) {
      throw new Error("PIN must be exactly 6 numeric digits");
    }
    return { pin: pinStr };
  })
  .handler(async ({ data }) => {
    const inputHash = hashPin(data.pin);
    let storedHash: string | null = null;

    try {
      const client = await getDbClient();
      const { data: dbData, error } = await client
        .from("site_data")
        .select("value")
        .eq("key", "admin_security_pin_hash")
        .maybeSingle();

      if (!error && dbData && dbData.value && typeof dbData.value === "object" && "hash" in (dbData.value as any)) {
        storedHash = (dbData.value as any).hash;
      }
    } catch (e) {
      console.error("[admin-pin] verify error:", e);
    }

    if (!storedHash) {
      return {
        ok: false,
        error: "This PIN has already been used or has expired. Please click 'Generate PIN' in the Admin Panel.",
        needsGeneration: true,
      };
    }

    if (inputHash === storedHash) {
      // ONE-TIME USE PIN: Invalidate & delete PIN hash & raw pin immediately upon successful authentication in cloud DB
      try {
        const client = await getDbClient();
        await Promise.all([
          client.from("site_data").delete().eq("key", "admin_security_pin_hash"),
          client.from("site_data").delete().eq("key", "admin_active_raw_pin"),
        ]);
      } catch (e) {
        console.error("[admin-pin] invalidate error:", e);
      }

      return { ok: true, verifiedAt: Date.now() };
    } else {
      return { ok: false, error: "Incorrect 6-digit Security PIN. Please try again." };
    }
  });
