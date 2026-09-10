import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ALL = "all";

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user);

  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [paymentFilter, setPaymentFilter] = useState<string>(ALL);
  const [packageFilter, setPackageFilter] = useState<string>(ALL);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  const enabled = Boolean(isAdmin);

  const { data: packages } = useQuery({
    queryKey: ["admin-packages"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total_amount, created_at, package_id, packages(name), projects(project_name, contact_name, contact_email, progress)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          "id, amount, status, gateway, gateway_payment_id, paid_at, created_at, orders(order_number, package_id, packages(name))",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["admin-projects"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, project_name, contact_name, contact_email, contact_phone, platform, software_type, progress, created_at, package_id, packages(name), orders(status)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredOrders = useMemo(
    () =>
      (orders ?? []).filter(
        (order) =>
          (statusFilter === ALL || order.status === statusFilter) &&
          (paymentFilter === ALL || order.payment_status === paymentFilter) &&
          (packageFilter === ALL || order.package_id === packageFilter),
      ),
    [orders, statusFilter, paymentFilter, packageFilter],
  );

  const filteredPayments = useMemo(
    () =>
      (payments ?? []).filter(
        (payment) =>
          (paymentFilter === ALL || payment.status === paymentFilter) &&
          (packageFilter === ALL || payment.orders?.package_id === packageFilter),
      ),
    [payments, paymentFilter, packageFilter],
  );

  const filteredProjects = useMemo(
    () =>
      (projects ?? []).filter((project) => {
        const orderStatus = Array.isArray(project.orders)
          ? project.orders[0]?.status
          : (project.orders as { status: string } | null)?.status;
        return (
          (statusFilter === ALL || orderStatus === statusFilter) &&
          (packageFilter === ALL || project.package_id === packageFilter)
        );
      }),
    [projects, statusFilter, packageFilter],
  );

  const revenue = useMemo(
    () =>
      (payments ?? [])
        .filter((payment) => payment.status === "successful")
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    [payments],
  );

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
      <p className="mt-1 text-sm text-muted-foreground">
        Orders, payments and delivery status across every customer.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={String(orders?.length ?? 0)} />
        <StatCard label="Projects" value={String(projects?.length ?? 0)} />
        <StatCard label="Payments" value={String(payments?.length ?? 0)} />
        <StatCard label="Collected" value={formatINR(revenue)} tone="success" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <FilterSelect
          label="Order status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(ORDER_STATUS_LABELS)}
        />
        <FilterSelect
          label="Payment status"
          value={paymentFilter}
          onChange={setPaymentFilter}
          options={Object.entries(PAYMENT_STATUS_LABELS)}
        />
        <FilterSelect
          label="Package"
          value={packageFilter}
          onChange={setPackageFilter}
          options={(packages ?? []).map((pkg) => [pkg.id, pkg.name] as [string, string])}
        />
      </div>

      <Tabs defaultValue="orders" className="mt-6">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {ordersLoading ? (
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
                    {filteredOrders.map((order) => (
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
                          <PaymentBadge status={order.payment_status} />
                        </TableCell>
                        <TableCell>{order.projects?.progress ?? 0}%</TableCell>
                        <TableCell className="text-right">
                          {formatINR(order.total_amount)}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    <EmptyRow count={filteredOrders.length} colSpan={8} label="No orders match these filters." />
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Payments ({filteredPayments.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {paymentsLoading ? (
                <Skeleton className="h-40 rounded-lg" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.orders?.order_number ?? "—"}
                        </TableCell>
                        <TableCell>{payment.orders?.packages?.name ?? "—"}</TableCell>
                        <TableCell className="capitalize">{payment.gateway}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {payment.gateway_payment_id ?? "—"}
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right">{formatINR(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.paid_at ? formatDateTime(payment.paid_at) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <EmptyRow
                      count={filteredPayments.length}
                      colSpan={7}
                      label="No payments match these filters."
                    />
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Projects ({filteredProjects.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {projectsLoading ? (
                <Skeleton className="h-40 rounded-lg" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.project_name}</TableCell>
                        <TableCell>
                          <div>{project.contact_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {project.contact_email}
                          </div>
                        </TableCell>
                        <TableCell>{project.packages?.name ?? "—"}</TableCell>
                        <TableCell>{project.software_type}</TableCell>
                        <TableCell>{project.platform}</TableCell>
                        <TableCell>{project.progress}%</TableCell>
                        <TableCell>{formatDate(project.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    <EmptyRow
                      count={filteredProjects.length}
                      colSpan={7}
                      label="No projects match these filters."
                    />
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={
          tone === "success"
            ? "mt-2 text-2xl font-semibold text-success"
            : "mt-2 text-2xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="w-full sm:w-56">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const variant =
    status === "successful" ? "default" : status === "failed" ? "destructive" : "outline";
  return <Badge variant={variant}>{PAYMENT_STATUS_LABELS[status] ?? status}</Badge>;
}

function EmptyRow({
  count,
  colSpan,
  label,
}: {
  count: number;
  colSpan: number;
  label: string;
}) {
  if (count > 0) return null;
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  );
}
