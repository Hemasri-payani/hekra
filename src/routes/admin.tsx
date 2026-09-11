import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUS_LABELS, formatDate, formatINR } from "@/lib/format";

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
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin-login", replace: true });
  }, [loading, user, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    enabled: Boolean(isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total_amount, created_at, packages(name), projects(project_name, contact_name, progress)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
        <p className="mt-2 text-muted-foreground">
          This area is restricted to administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Admin console</h1>
      <p className="mt-1 text-sm text-muted-foreground">All customer orders and delivery status.</p>

      <Card className="mt-8 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 rounded-lg" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.projects?.contact_name ?? "—"}</TableCell>
                    <TableCell>{order.packages?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.projects?.progress ?? 0}%</TableCell>
                    <TableCell className="text-right">{formatINR(order.total_amount)}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                  </TableRow>
                ))}
                {orders && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
