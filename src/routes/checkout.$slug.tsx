import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/$slug")({
  head: () => ({
    meta: [
      { title: "Secure checkout — Codenova Studio" },
      {
        name: "description",
        content:
          "Share your project requirements and pay securely for your custom software package.",
      },
      { property: "og:title", content: "Secure checkout — Codenova Studio" },
      { property: "og:description", content: "Project requirements and secure Razorpay payment." },
    ],
  }),
  component: CheckoutPage,
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useSession();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, company")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const createOrder = useServerFn(createCheckoutOrder);
  const verifyPayment = useServerFn(verifyCheckoutPayment);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, slug, name, tagline, price_inr, features")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const base = pkg?.price_inr ?? 0;
  const tax = Math.round(base * 0.18);
  const total = base + tax;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);

    try {
      const created = await createOrder({
        data: {
          packageSlug: slug,
          projectName: String(form.get("projectName") ?? ""),
          softwareType: String(form.get("softwareType") ?? ""),
          platform: String(form.get("platform") ?? ""),
          description: String(form.get("description") ?? ""),
          requiredFeatures: String(form.get("requiredFeatures") ?? ""),
          technologies: String(form.get("technologies") ?? ""),
          referenceUrl: String(form.get("referenceUrl") ?? ""),
          deliveryPreference: String(form.get("deliveryPreference") ?? ""),
          additionalRequirements: String(form.get("additionalRequirements") ?? ""),
          contactName: String(form.get("contactName") ?? ""),
          contactEmail: String(form.get("contactEmail") ?? ""),
          contactPhone: String(form.get("contactPhone") ?? ""),
          company: String(form.get("company") ?? ""),
        },
      });

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        toast.error("Could not load the payment window. Check your connection and retry.");
        setSubmitting(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: created.razorpayKeyId,
        amount: created.amount,
        currency: created.currency,
        name: "Codenova Studio",
        description: `${created.packageName} — ${created.orderNumber}`,
        order_id: created.razorpayOrderId,
        prefill: {
          name: String(form.get("contactName") ?? ""),
          email: String(form.get("contactEmail") ?? ""),
          contact: String(form.get("contactPhone") ?? ""),
        },
        theme: { color: "#0f766e" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.message("Payment cancelled", {
              description: `Order ${created.orderNumber} is saved as pending.`,
            });
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({
              data: {
                orderId: created.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            toast.success(`Payment confirmed — order ${created.orderNumber}`);
            navigate({ to: "/dashboard" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
      });

      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-semibold">Package not found</h1>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Checkout — {pkg.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your requirements, then pay securely. Payments are verified on our server before an
        order is confirmed.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Project requirements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="Project name" name="projectName" required />
            <Field label="Software type" name="softwareType" placeholder="Web app, CRM, portal" required />
            <Field label="Platform" name="platform" placeholder="Web, Android, iOS" required />
            <Field label="Preferred technologies" name="technologies" placeholder="React, PostgreSQL" />
            <Field label="Reference URL" name="referenceUrl" type="url" placeholder="https://" />
            <Field label="Delivery preference" name="deliveryPreference" placeholder="Standard / Priority" />

            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="description">Project description</Label>
              <Textarea id="description" name="description" rows={5} required minLength={20} />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="requiredFeatures">Required features</Label>
              <Textarea id="requiredFeatures" name="requiredFeatures" rows={3} />
            </div>
            <div className="sm:col-span-2 grid gap-2">
              <Label htmlFor="additionalRequirements">Anything else we should know?</Label>
              <Textarea id="additionalRequirements" name="additionalRequirements" rows={3} />
            </div>

            <Field
              label="Contact name"
              name="contactName"
              defaultValue={profile?.full_name ?? ""}
              required
            />
            <Field
              label="Contact email"
              name="contactEmail"
              type="email"
              defaultValue={user?.email ?? ""}
              required
            />
            <Field
              label="Contact phone"
              name="contactPhone"
              defaultValue={profile?.phone ?? ""}
              placeholder="+91 90000 00000"
              required
            />
            <Field label="Company (optional)" name="company" defaultValue={profile?.company ?? ""} />
          </CardContent>
        </Card>

        <Card className="h-fit shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <Row label={pkg.name} value={formatINR(base)} />
            <Row label="GST (18%)" value={formatINR(tax)} />
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Secured by Razorpay. Cards, UPI, net banking and wallets supported.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
