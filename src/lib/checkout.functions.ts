import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutInputSchema, verifyInputSchema } from "@/lib/checkout.schemas";

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkoutInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { createOrderForUser } = await import("@/lib/checkout.server");
    return createOrderForUser(data, context.userId);
  });

export const verifyCheckoutPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => verifyInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { verifyPaymentForUser } = await import("@/lib/checkout.server");
    return verifyPaymentForUser(data, context.userId);
  });
