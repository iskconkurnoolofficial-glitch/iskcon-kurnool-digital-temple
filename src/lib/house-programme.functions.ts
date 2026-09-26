import { createServerFn } from "@tanstack/react-start";
import type { HouseProgrammeRequest } from "@/context/AdminContext";

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
      const createdAt = new Date().toISOString();
      const { data: row, error } = await supabaseAdmin
        .from("contact_messages")
        .insert({
          name: data.name,
          email: "houseprogramme@iskconkurnool.in",
          phone: data.phone,
          message: JSON.stringify({
            isHouseProgramme: true,
            locationArea: data.locationArea,
            preferredDate: data.preferredDate,
            preferredTime: data.preferredTime,
            participantsCount: data.participantsCount,
            fullAddress: data.fullAddress,
            googleMapsUrl: data.googleMapsUrl,
            latitude: data.latitude,
            longitude: data.longitude,
            message: data.message,
            status: "pending",
          }),
          read: false,
        })
        .select("id,created_at")
        .single();

      if (error || !row) {
        console.error("[HouseProgramme] Contact message insert failed:", error);
        return { ok: false as const, message: error?.message || "Could not save your request" };
      }

      const request: HouseProgrammeRequest = {
        ...data,
        id: row.id,
        status: "pending",
        createdAt: row.created_at || createdAt,
        read: false,
      };
      return { ok: true as const, request };
    } catch (e: any) {
      console.error("[HouseProgramme] Exception in server submit:", e);
      return { ok: false as const, message: e?.message || "Failed to submit request" };
    }
  });
