import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";

const PIN_SALT = "iskcon_kurnool_admin_pin_salt_2026_v1";

// In-memory fallback if Supabase is unavailable in local dev
let memoryPinHash: { hash: string; updatedAt: string } | null = null;
let memoryActiveRawPin: { pin: string; generatedAt: string } | null = null;

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin.trim() + PIN_SALT).digest("hex");
}

function generateRandom6DigitPin(): string {
  const pinNum = crypto.randomInt(100000, 1000000);
  return pinNum.toString();
}

/** Check if an admin PIN is currently configured on the server */
export const hasAdminPinConfiguredServer = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "admin_security_pin_hash")
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === "object" && "hash" in (data.value as any)) {
        return { configured: true };
      }
    } catch {
      // Fallback check
    }
    return { configured: !!memoryPinHash };
  });

/** Fetch the currently active generated 6-digit PIN for display on /bank-pin (if not yet consumed) */
export const getActiveAdminPinServer = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
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
    } catch {
      // Fallback
    }
    return { 
      pin: memoryActiveRawPin?.pin || null, 
      generatedAt: memoryActiveRawPin?.generatedAt || null 
    };
  });

/** Generate a new 6-digit PIN securely on the server and store its SHA-256 hash */
export const generateAdminPinServer = createServerFn({ method: "POST" })
  .handler(async () => {
    const rawPin = generateRandom6DigitPin();
    const pinHash = hashPin(rawPin);
    const updatedAt = new Date().toISOString();

    const hashRecord = { hash: pinHash, updatedAt };
    const rawRecord = { pin: rawPin, generatedAt: updatedAt };

    let saved = false;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await Promise.all([
        supabaseAdmin.from("site_data").upsert(
          { key: "admin_security_pin_hash", value: hashRecord, updated_at: updatedAt },
          { onConflict: "key" }
        ),
        supabaseAdmin.from("site_data").upsert(
          { key: "admin_active_raw_pin", value: rawRecord, updated_at: updatedAt },
          { onConflict: "key" }
        ),
      ]);
      saved = true;
    } catch {
      // Ignore Supabase error and rely on in-memory fallback
    }

    memoryPinHash = hashRecord;
    memoryActiveRawPin = rawRecord;

    return {
      success: true,
      pin: rawPin,
      updatedAt,
      persisted: saved || true,
    };
  });

/** Verify a submitted 6-digit PIN against the server's hashed PIN */
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

    let storedHash: string | null = memoryPinHash?.hash || null;

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: dbData, error } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "admin_security_pin_hash")
        .maybeSingle();

      if (!error && dbData && dbData.value && typeof dbData.value === "object" && "hash" in (dbData.value as any)) {
        storedHash = (dbData.value as any).hash;
      }
    } catch {
      // Use fallback
    }

    if (!storedHash) {
      return {
        ok: false,
        error: "This PIN has already been used or has expired. Please click 'Generate PIN' in the Admin Panel.",
        needsGeneration: true,
      };
    }

    if (inputHash === storedHash) {
      // ONE-TIME USE PIN: Invalidate & delete PIN hash & raw pin immediately upon successful authentication
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await Promise.all([
          supabaseAdmin.from("site_data").delete().eq("key", "admin_security_pin_hash"),
          supabaseAdmin.from("site_data").delete().eq("key", "admin_active_raw_pin"),
        ]);
      } catch {
        // Fallback
      }
      memoryPinHash = null;
      memoryActiveRawPin = null;

      return { ok: true, verifiedAt: Date.now() };
    } else {
      return { ok: false, error: "Incorrect 6-digit Security PIN. Please try again." };
    }
  });
