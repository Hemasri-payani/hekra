import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { updateOrderStatusSchema } from "@/lib/admin.schemas";

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateOrderStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: adminRow, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw error;
    if (!adminRow) throw new Error("Forbidden");

    const { updateOrderStatusAsAdmin } = await import("@/lib/admin.server");
    return updateOrderStatusAsAdmin(data);
  });
