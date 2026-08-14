import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "admin@iskconkurnool.org";
const ADMIN_PASSWORD = "iskcon2026";

/**
 * Validates the single admin credential pair on the server and mints a one-time
 * magic-link token for the backing admin auth account. The client exchanges it
 * for a real session so that admin writes satisfy the database rules.
 */
export const mintAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string") {
      throw new Error("Invalid input");
    }
    return { email: data.email.trim().toLowerCase(), password: data.password.trim() };
  })
  .handler(async ({ data }) => {
    if (data.email !== ADMIN_EMAIL || data.password !== ADMIN_PASSWORD) {
      return { ok: false as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: ADMIN_EMAIL,
    });

    if (error || !link?.properties?.hashed_token) {
      return { ok: false as const, error: "session_unavailable" };
    }

    return {
      ok: true as const,
      tokenHash: link.properties.hashed_token,
      email: ADMIN_EMAIL,
      profile: {
        role: "superadmin" as const,
        name: "Admin",
        email: ADMIN_EMAIL,
        allowedTabs: ["*"],
        member: null,
      },
    };
  });

