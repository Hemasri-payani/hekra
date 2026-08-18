export function formatINR(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  payment_pending: "Payment Pending",
  payment_successful: "Payment Successful",
  order_confirmed: "Order Confirmed",
  requirements_review: "Requirements Review",
  development_started: "Development Started",
  development_in_progress: "Development in Progress",
  testing: "Testing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const TRACKING_STEPS = [
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "requirements_review", label: "Requirements Review" },
  { key: "development_in_progress", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "completed", label: "Completed" },
] as const;

export function trackingIndex(status: string): number {
  switch (status) {
    case "payment_pending":
      return -1;
    case "payment_successful":
    case "order_confirmed":
      return 0;
    case "requirements_review":
      return 1;
    case "development_started":
    case "development_in_progress":
      return 2;
    case "testing":
      return 3;
    case "completed":
      return 4;
    default:
      return -1;
  }
}
