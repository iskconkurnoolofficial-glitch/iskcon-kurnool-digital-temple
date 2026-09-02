import { createServerFn } from "@tanstack/react-start";
import type { HouseProgrammeRequest, HouseProgrammeData } from "@/context/AdminContext";
import { defaultHouseProgramme } from "@/context/AdminContext";

export const submitHouseProgrammeRequestServer = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<HouseProgrammeRequest, "id" | "createdAt" | "read" | "status">) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid request data");
    }
    return {
      name: String(data.name || "").trim().slice(0, 100),
      phone: String(data.phone || "").trim().slice(0, 20),
      locationArea: String(data.locationArea || "").trim().slice(0, 100),
      preferredDate: String(data.preferredDate || "").trim().slice(0, 50),
      preferredTime: String(data.preferredTime || "").trim().slice(0, 50),
      participantsCount: String(data.participantsCount || "").trim().slice(0, 50),
      fullAddress: String(data.fullAddress || "").trim().slice(0, 500),
      googleMapsUrl: data.googleMapsUrl ? String(data.googleMapsUrl).trim().slice(0, 500) : undefined,
      latitude: typeof data.latitude === "number" ? data.latitude : undefined,
      longitude: typeof data.longitude === "number" ? data.longitude : undefined,
      message: data.message ? String(data.message).trim().slice(0, 1000) : undefined,
    };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Fetch current houseProgrammes object from site_data table
      const { data: row, error: fetchError } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "houseProgrammes")
        .maybeSingle();

      let currentData: HouseProgrammeData = defaultHouseProgramme;
      if (!fetchError && row && row.value && typeof row.value === "object") {
        currentData = { ...defaultHouseProgramme, ...(row.value as any) };
      }

      const newEntry: HouseProgrammeRequest = {
        ...data,
        id: "hp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        status: "pending",
        createdAt: new Date().toISOString(),
        read: false,
      };

      const updatedRequests = [newEntry, ...(currentData.requests || [])];
      const updatedData: HouseProgrammeData = {
        ...currentData,
        requests: updatedRequests,
      };

      // Persist to site_data via admin client (bypasses RLS safely)
      const { error: updateError } = await supabaseAdmin
        .from("site_data")
        .upsert(
          {
            key: "houseProgrammes",
            value: updatedData as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (updateError) {
        console.error("[HouseProgramme] Server upsert failed:", updateError);
        return { ok: false as const, message: updateError.message };
      }

      return { ok: true as const, request: newEntry };
    } catch (e: any) {
      console.error("[HouseProgramme] Exception in server submit:", e);
      return { ok: false as const, message: e?.message || "Failed to submit request" };
    }
  });
