import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUS_LABELS, formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Codenova Studio" },
      {
        name: "description",
        content: "Track your orders, payments and live project progress in one place.",
      },
      { property: "og:title", content: "Dashboard — Codenova Studio" },
      { property: "og:description", content: "Your orders and project tracking." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total_amount, created_at, packages(name), projects(project_name, progress)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders, payments and live project progress.
          </p>
        </div>
        <Button asChild>
          <Link to="/packages">New order</Link>
        </Button>
      </div>

      <div className="mt-10 space-y-4">
        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : orders && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="shadow-card">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {order.packages?.name} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                  <p className="mt-2 font-semibold">{formatINR(order.total_amount)}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {order.projects?.project_name ?? "Project details pending"}
                </p>
                <Progress value={order.projects?.progress ?? 0} className="mt-4" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {order.projects?.progress ?? 0}% complete
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You don't have any orders yet.</p>
              <Button asChild className="mt-6">
                <Link to="/packages">Browse packages</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
