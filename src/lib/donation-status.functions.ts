import { createServerFn } from "@tanstack/react-start";

/**
 * Finalizes a donation enquiry's status server-side.
 * The caller must prove ownership of the enquiry by supplying the same email and
 * phone that were submitted with it, and the enquiry must still be fresh and
 * un-finalized. Anonymous clients can no longer update rows directly.
 */
export const finalizeDonationStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; email: string; phone: string; status: "paid" | "failed"; paymentRef?: string }) => {
    if (
      !data ||
      typeof data.id !== "string" ||
      typeof data.email !== "string" ||
      typeof data.phone !== "string" ||
      (data.status !== "paid" && data.status !== "failed")
    ) {
      throw new Error("Invalid input");
    }
    return {
      id: data.id.trim().slice(0, 64),
      email: data.email.trim().toLowerCase().slice(0, 200),
      phone: data.phone.trim().slice(0, 20),
      status: data.status,
      paymentRef: typeof data.paymentRef === "string" ? data.paymentRef.trim().slice(0, 120) : null,
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("donation_enquiries")
      .select("id,email,phone,status,created_at")
      .eq("id", data.id)
      .maybeSingle();

    if (error || !row) return { ok: false as const };

    const fresh = Date.now() - new Date(row.created_at).getTime() < 2 * 60 * 60 * 1000;
    const owns =
      (row.email || "").trim().toLowerCase() === data.email && (row.phone || "").trim() === data.phone;

    if (!fresh || !owns || row.status !== "initiated") return { ok: false as const };

    const { error: updateError } = await supabaseAdmin
      .from("donation_enquiries")
      .update({ status: data.status, payment_ref: data.paymentRef })
      .eq("id", data.id)
      .eq("status", "initiated");

    if (updateError) return { ok: false as const };
    return { ok: true as const };
  });
