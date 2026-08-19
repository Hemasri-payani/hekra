import { createHmac, timingSafeEqual } from "node:crypto";

import type { CheckoutInput, VerifyInput } from "@/lib/checkout.schemas";
import { sendSms } from "@/lib/notify.server";

function razorpayCredentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    throw new Error(
      "Payments are not configured yet. Add the Razorpay key ID and secret to enable checkout.",
    );
  }
  return { keyId, keySecret };
}

export async function createOrderForUser(data: CheckoutInput, userId: string) {
  const { keyId, keySecret } = razorpayCredentials();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: pkg, error: pkgError } = await supabaseAdmin
    .from("packages")
    .select("id, name, price_inr, slug")
    .eq("slug", data.packageSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (pkgError) throw pkgError;
  if (!pkg) throw new Error("That package is no longer available.");

  // Price always comes from the database, never from the client.
  const baseAmount = Number(pkg.price_inr);
  const taxAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + taxAmount;

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .insert({
      user_id: userId,
      package_id: pkg.id,
      project_name: data.projectName,
      software_type: data.softwareType,
      platform: data.platform,
      description: data.description,
      required_features: data.requiredFeatures ?? null,
      technologies: data.technologies ?? null,
      reference_url: data.referenceUrl ? data.referenceUrl : null,
      delivery_preference: data.deliveryPreference ?? null,
      additional_requirements: data.additionalRequirements ?? null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      company: data.company ?? null,
    })
    .select("id")
    .single();
  if (projectError) throw projectError;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      package_id: pkg.id,
      project_id: project.id,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    })
    .select("id, order_number, total_amount")
    .single();
  if (orderError) throw orderError;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: order.order_number,
      notes: { order_id: order.id, package: pkg.slug },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[razorpay] order create failed", res.status, detail);
    throw new Error("Could not start the payment. Please try again in a moment.");
  }

  const rzpOrder = (await res.json()) as { id: string; amount: number; currency: string };

  const { error: paymentError } = await supabaseAdmin.from("payments").insert({
    user_id: userId,
    order_id: order.id,
    amount: totalAmount,
    gateway: "razorpay",
    gateway_order_id: rzpOrder.id,
  });
  if (paymentError) throw paymentError;

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    razorpayKeyId: keyId,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    packageName: pkg.name,
    baseAmount,
    taxAmount,
    totalAmount,
  };
}

export async function verifyPaymentForUser(data: VerifyInput, userId: string) {
  const { keySecret } = razorpayCredentials();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, order_number, total_amount, project_id")
    .eq("id", data.orderId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order || order.user_id !== userId) throw new Error("Order not found.");

  const expected = createHmac("sha256", keySecret)
    .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
    .digest("hex");
  const given = Buffer.from(data.razorpaySignature);
  const want = Buffer.from(expected);
  const valid = given.length === want.length && timingSafeEqual(given, want);

  if (!valid) {
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", failure_reason: "signature_mismatch" })
      .eq("order_id", order.id)
      .eq("gateway_order_id", data.razorpayOrderId);
    await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    throw new Error("Payment verification failed. You have not been charged for this attempt.");
  }

  const paidAt = new Date().toISOString();
  await supabaseAdmin
    .from("payments")
    .update({
      status: "successful",
      gateway_payment_id: data.razorpayPaymentId,
      gateway_signature: data.razorpaySignature,
      paid_at: paidAt,
    })
    .eq("order_id", order.id)
    .eq("gateway_order_id", data.razorpayOrderId);

  await supabaseAdmin
    .from("orders")
    .update({ payment_status: "successful", status: "confirmed" })
    .eq("id", order.id);

  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: `Order ${order.order_number} confirmed`,
    message: `We have received your payment of ₹${order.total_amount.toLocaleString("en-IN")}. Requirements review starts within one working day.`,
  });

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("contact_phone, project_name")
    .eq("id", order.project_id ?? "")
    .maybeSingle();

  if (project?.contact_phone) {
    await sendSms(
      project.contact_phone,
      `Codenova Studio: payment received for order ${order.order_number} (${project.project_name}). Track progress in your dashboard.`,
    );
  }

  return { ok: true, orderNumber: order.order_number };
}
