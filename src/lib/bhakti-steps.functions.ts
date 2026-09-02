import { createServerFn } from "@tanstack/react-start";
import type { BhaktiStepsRegistration, BhaktiStepsData } from "@/context/AdminContext";
import { defaultBhaktiSteps } from "@/context/AdminContext";

export const submitBhaktiStepsRegistrationServer = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<BhaktiStepsRegistration, "id" | "submittedAt" | "read">) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid registration data");
    }
    return {
      fullName: String(data.fullName || "").trim().slice(0, 100),
      phone: String(data.phone || "").trim().slice(0, 20),
      email: String(data.email || "").trim().slice(0, 200),
      currentLevelId: String(data.currentLevelId || "").trim(),
      targetLevelId: String(data.targetLevelId || "").trim(),
      roundsChantedDaily: Number(data.roundsChantedDaily || 0),
      fourRegulativePrinciples: Boolean(data.fourRegulativePrinciples),
      cityArea: String(data.cityArea || "").trim().slice(0, 100),
      preferredLanguage: String(data.preferredLanguage || "English").trim().slice(0, 50),
      mentorPreference: data.mentorPreference ? String(data.mentorPreference).trim().slice(0, 100) : undefined,
      notes: data.notes ? String(data.notes).trim().slice(0, 500) : undefined,
    };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Fetch current bhaktiSteps object from site_data table
      const { data: row, error: fetchError } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "bhaktiSteps")
        .maybeSingle();

      let currentData: BhaktiStepsData = defaultBhaktiSteps;
      if (!fetchError && row && row.value && typeof row.value === "object") {
        currentData = { ...defaultBhaktiSteps, ...(row.value as any) };
      }

      const count = (currentData.registrations || []).length + 1;
      const regId = `BS-${1000 + count}`;
      const newEntry: BhaktiStepsRegistration = {
        ...data,
        id: regId,
        submittedAt: new Date().toISOString(),
        read: false,
      };

      const updatedRegs = [newEntry, ...(currentData.registrations || [])];
      const updatedData: BhaktiStepsData = {
        ...currentData,
        registrations: updatedRegs,
      };

      // Persist to site_data via admin client (bypasses RLS safely)
      const { error: updateError } = await supabaseAdmin
        .from("site_data")
        .upsert(
          {
            key: "bhaktiSteps",
            value: updatedData as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (updateError) {
        console.error("[BhaktiSteps] Server upsert failed:", updateError);
        return { ok: false as const, regId: "" };
      }

      return { ok: true as const, regId };
    } catch (e: any) {
      console.error("[BhaktiSteps] Exception in server submit:", e);
      return { ok: false as const, regId: "" };
    }
  });
