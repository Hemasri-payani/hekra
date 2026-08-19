import { z } from "zod";

export const checkoutInputSchema = z.object({
  packageSlug: z.string().min(1).max(80),
  projectName: z.string().min(2).max(120),
  softwareType: z.string().min(2).max(80),
  platform: z.string().min(2).max(80),
  description: z.string().min(20).max(4000),
  requiredFeatures: z.string().max(4000).optional().nullable(),
  technologies: z.string().max(500).optional().nullable(),
  referenceUrl: z.string().url().max(500).optional().or(z.literal("")).nullable(),
  deliveryPreference: z.string().max(120).optional().nullable(),
  additionalRequirements: z.string().max(4000).optional().nullable(),
  contactName: z.string().min(2).max(120),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().min(8).max(20),
  company: z.string().max(160).optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const verifyInputSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(4).max(120),
  razorpayPaymentId: z.string().min(4).max(120),
  razorpaySignature: z.string().min(10).max(256),
});

export type VerifyInput = z.infer<typeof verifyInputSchema>;
