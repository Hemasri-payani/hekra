import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES } from "@/lib/admin.schemas";
import { updateOrderStatus } from "@/lib/admin.functions";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatINR,
} from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Codenova Studio" },
      {
        name: "description",
        content: "Internal console for reviewing orders, payments and project delivery status.",
      },
      { property: "og:title", content: "Admin console — Codenova Studio" },
      { property: "og:description", content: "Internal order and delivery management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user);
  const runUpdate = useServerFn(updateOrderStatus);

  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [status, setStatus] = useState<string>("order_confirmed");
  const [progress, setProgress] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin-login", replace: true });
  }, [loading, user, navigate]);

  const enabled = Boolean(isAdmin);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total_amount, created_at, packages(name), projects(project_name, contact_name, contact_email, progress)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          "id, amount, status, gateway, gateway_order_id, gateway_payment_id, paid_at, created_at, orders(order_number)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["admin-projects"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, project_name, software_type, platform, progress, contact_name, contact_email, contact_phone, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function onSubmitStatus(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedOrder) {
      toast.error("Choose an order first.");
      return;
    }
    setSaving(true);
    try {
      const result = await runUpdate({
        data: {
          orderId: selectedOrder,
          status: status as (typeof ORDER_STATUSES)[number],
          notify: true,
          ...(progress.trim() ? { progress: Number(progress) } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      });
      toast.success(
        `Order ${result.orderNumber} updated${result.smsSent ? " — SMS sent" : " — in-app confirmation sent"}.`,
      );
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-projects"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the order.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground mt-2">
          This area is restricted to administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Admin console</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Orders, payments, projects and delivery updates.
      </p>

      <Card className="shadow-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Update order status &amp; send confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4" onSubmit={onSubmitStatus}>
            <div className="grid gap-2 md:col-span-2">
              <Label>Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {ordersQuery.data?.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} — {order.projects?.project_name ?? "Project"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>New status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ORDER_STATUS_LABELS[value] ?? value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress">Progress %</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
                placeholder="optional"
              />
            </div>
            <div className="grid gap-2 md:col-span-3">
              <Label htmlFor="note">Message to the customer (optional)</Label>
              <Textarea
                id="note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Leave blank to send the default status update."
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Update & notify"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              {ordersQuery.isLoading ? (
                <Skeleton className="h-40 rounded-lg" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersQuery.data?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{order.projects?.contact_name ?? "—"}</TableCell>
                        <TableCell>{order.packages?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                        </TableCell>
                        <TableCell>{order.projects?.progress ?? 0}%</TableCell>
                        <TableCell className="text-right">
                          {formatINR(order.total_amount)}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    {ordersQuery.data && ordersQuery.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-muted-foreground text-center">
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              {paymentsQuery.isLoading ? (
                <Skeleton className="h-40 rounded-lg" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Gateway payment ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Paid at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.orders?.order_number ?? "—"}
                        </TableCell>
                        <TableCell className="capitalize">{payment.gateway}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {payment.gateway_payment_id ?? payment.gateway_order_id ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatINR(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.paid_at ? formatDateTime(payment.paid_at) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {paymentsQuery.data && paymentsQuery.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-muted-foreground text-center">
                          No payments yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              {projectsQuery.isLoading ? (
                <Skeleton className="h-40 rounded-lg" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsQuery.data?.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.project_name}</TableCell>
                        <TableCell>{project.software_type}</TableCell>
                        <TableCell>{project.platform}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {project.contact_name}
                          <br />
                          {project.contact_email}
                        </TableCell>
                        <TableCell>{project.progress ?? 0}%</TableCell>
                        <TableCell>{formatDate(project.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    {projectsQuery.data && projectsQuery.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-muted-foreground text-center">
                          No projects yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
