import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const createUserInput = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  full_name: z.string().min(1).max(255),
  role: z.enum(["admin", "user"]),
});

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createUserInput.parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc(
      "has_role",
      { _user_id: context.userId, _role: "admin" },
    );
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Accès refusé : admin requis");

    // Create auth user (auto-confirm so they can log in immediately)
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name },
      });
    if (createErr) throw new Error(createErr.message);
    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Échec de création de l'utilisateur");

    // Ensure profile row (trigger should handle, but be safe)
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: newUserId, email: data.email, full_name: data.full_name });

    // Set role (trigger inserts 'admin' by default — replace with chosen role)
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId);
    const { error: roleInsertErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: data.role });
    if (roleInsertErr) throw new Error(roleInsertErr.message);

    return { id: newUserId };
  });
