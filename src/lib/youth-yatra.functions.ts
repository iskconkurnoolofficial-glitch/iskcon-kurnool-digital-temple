import { createServerFn } from "@tanstack/react-start";
import type { YatraRegistration, YouthYatraState } from "@/context/AdminContext";
import { defaultYouthYatra } from "@/context/AdminContext";

export const submitYatraRegistrationServer = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<YatraRegistration, "id" | "registeredAt" | "read" | "status" | "paymentStatus" | "checkedIn"> & { status?: YatraRegistration["status"]; paymentStatus?: YatraRegistration["paymentStatus"]; checkedIn?: boolean }) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid registration data");
    }
    return {
      eventId: String(data.eventId || "").trim(),
      fullName: String(data.fullName || "").trim().slice(0, 100),
      age: Number(data.age || 18),
      gender: (data.gender === "Female" || data.gender === "Other" ? data.gender : "Male") as YatraRegistration["gender"],
      phone: String(data.phone || "").trim().slice(0, 20),
      email: String(data.email || "").trim().slice(0, 200),
      city: String(data.city || "").trim().slice(0, 100),
      emergencyContactName: String(data.emergencyContactName || "").trim().slice(0, 100),
      emergencyContactRelation: String(data.emergencyContactRelation || "").trim().slice(0, 50),
      emergencyContactPhone: String(data.emergencyContactPhone || "").trim().slice(0, 20),
      accommodationRequired: Boolean(data.accommodationRequired),
      foodPreference: String(data.foodPreference || "Satvik Prasadam").trim().slice(0, 100),
      specialRequirements: data.specialRequirements ? String(data.specialRequirements).trim().slice(0, 500) : undefined,
      registrationCategory: String(data.registrationCategory || "Youth").trim().slice(0, 100),
      paymentMode: (data.paymentMode === "qr" || data.paymentMode === "razorpay" ? data.paymentMode : "free") as YatraRegistration["paymentMode"],
      amountPaid: Number(data.amountPaid || 0),
      transactionId: data.transactionId ? String(data.transactionId).trim().slice(0, 100) : undefined,
      paymentScreenshotUrl: data.paymentScreenshotUrl ? String(data.paymentScreenshotUrl).trim().slice(0, 500) : undefined,
      batch: data.batch ? String(data.batch).trim() : undefined,
      seatNumber: data.seatNumber ? String(data.seatNumber).trim() : undefined,
      status: data.status,
      paymentStatus: data.paymentStatus,
      checkedIn: data.checkedIn,
    };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Fetch current youthYatra object from site_data table
      const { data: row, error: fetchError } = await supabaseAdmin
        .from("site_data")
        .select("value")
        .eq("key", "youthYatra")
        .maybeSingle();

      let currentData: YouthYatraState = defaultYouthYatra;
      if (!fetchError && row && row.value && typeof row.value === "object") {
        currentData = { ...defaultYouthYatra, ...(row.value as any) };
      }

      const regYear = currentData.events.find(e => e.id === data.eventId)?.year || new Date().getFullYear();
      const shortYear = String(regYear).slice(-2);
      const count = (currentData.registrations || []).filter(r => r.eventId === data.eventId).length + 1;
      const regId = `YY${shortYear}-${String(count).padStart(5, "0")}`;
      const boardingPassId = `BP${shortYear}-${String(count).padStart(5, "0")}`;

      const newEntry: YatraRegistration = {
        ...data,
        id: regId,
        boardingPassId,
        batch: data.batch || (data.gender === "Female" ? "Batch B (Coach 2 - Girls)" : "Batch A (Coach 1 - Boys)"),
        seatNumber: data.seatNumber || String(count),
        checkedIn: false,
        status: data.status || "confirmed",
        paymentStatus: data.paymentStatus || (data.paymentMode === "free" ? "completed" : "pending"),
        registeredAt: new Date().toISOString(),
        read: false,
      };

      const updatedRegs = [newEntry, ...(currentData.registrations || [])];
      const updatedData: YouthYatraState = {
        ...currentData,
        registrations: updatedRegs,
      };

      // Persist to site_data via admin client (bypasses RLS safely)
      const { error: updateError } = await supabaseAdmin
        .from("site_data")
        .upsert(
          {
            key: "youthYatra",
            value: updatedData as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (updateError) {
        console.error("[YouthYatra] Server upsert failed:", updateError);
        return { ok: false as const, regId: "" };
      }

      return { ok: true as const, regId };
    } catch (e: any) {
      console.error("[YouthYatra] Exception in server submit:", e);
      return { ok: false as const, regId: "" };
    }
  });
