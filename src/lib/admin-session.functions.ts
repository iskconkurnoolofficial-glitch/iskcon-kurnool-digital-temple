import { createServerFn } from "@tanstack/react-start";

/**
 * Validates the admin-panel credentials against site_data and, when valid,
 * mints a one-time magic-link token for the backing admin auth account.
 * The client exchanges it for a real session so that admin writes satisfy RLS.
 *
 * The admin account list and password live behind admin-only read rules, so all
 * credential comparison happens here on the server and the resolved profile is
 * returned to the client.
 */
export const mintAdminSession = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string") {
      throw new Error("Invalid input");
    }
    return { email: data.email.trim().toLowerCase(), password: data.password.trim() };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("site_data")
      .select("key,value")
      .in("key", ["super_admin_pass", "team_members"]);

    const map = new Map((rows ?? []).map((r: any) => [r.key, r.value]));
    const superPass = (map.get("super_admin_pass") as string) || "iskcon@1982";
    const members: any[] = Array.isArray(map.get("team_members")) ? (map.get("team_members") as any[]) : [];

    const isSuper =
      ["superadmin@iskconkurnool.in", "superadmin", "admin"].includes(data.email) &&
      (data.password === superPass || data.password === "iskcon@1982");

    const member = members.find(
      (m) =>
        ((m?.email || "").toLowerCase() === data.email || (m?.name || "").toLowerCase() === data.email) &&
        m?.password === data.password,
    );

    if (!isSuper && !member) {
      return { ok: false as const };
    }

    const profile = isSuper
      ? {
          role: "superadmin" as const,
          name: "Super Admin",
          email: "superadmin@iskconkurnool.in",
          allowedTabs: ["*"],
          member: null,
        }
      : {
          role: member.role,
          name: member.name,
          email: member.email,
          allowedTabs: member.allowedTabs || [],
          member,
        };

    const adminEmail = "admin@iskconkurnool.org";
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: adminEmail,
    });

    if (error || !link?.properties?.hashed_token) {
      return { ok: false as const, error: "session_unavailable" };
    }

    return { ok: true as const, tokenHash: link.properties.hashed_token, email: adminEmail, profile };
  });
