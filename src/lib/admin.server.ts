import type { UpdateOrderStatusInput } from "@/lib/admin.schemas";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { sendSms } from "@/lib/notify.server";

export async function updateOrderStatusAsAdmin(data: UpdateOrderStatusInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, user_id, project_id")
    .eq("id", data.orderId)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new Error("Order not found.");

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: data.status })
    .eq("id", order.id);
  if (updateError) throw updateError;

  if (order.project_id && typeof data.progress === "number") {
    await supabaseAdmin
      .from("projects")
      .update({ progress: data.progress })
      .eq("id", order.project_id);
  }

  const label = ORDER_STATUS_LABELS[data.status] ?? data.status;
  let smsSent = false;

  if (data.notify) {
    await supabaseAdmin.from("notifications").insert({
      user_id: order.user_id,
      title: `Order ${order.order_number}: ${label}`,
      message: data.note?.trim()
        ? data.note.trim()
        : `Your order ${order.order_number} has moved to "${label}". You can follow progress in your dashboard.`,
    });

    if (order.project_id) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("contact_phone")
        .eq("id", order.project_id)
        .maybeSingle();
      if (project?.contact_phone) {
        const result = await sendSms(
          project.contact_phone,
          `Codenova Studio: order ${order.order_number} is now "${label}".`,
        );
        smsSent = result.sent;
      }
    }
  }

  return { ok: true, orderNumber: order.order_number, status: data.status, smsSent };
}
