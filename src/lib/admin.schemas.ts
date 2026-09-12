import { z } from "zod";

export const ORDER_STATUSES = [
  "payment_pending",
  "payment_successful",
  "order_confirmed",
  "requirements_review",
  "development_started",
  "development_in_progress",
  "testing",
  "completed",
  "cancelled",
] as const;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
  progress: z.number().int().min(0).max(100).optional(),
  notify: z.boolean().default(true),
  note: z.string().max(500).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
