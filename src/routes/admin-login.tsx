import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Codenova Studio" },
      {
        name: "description",
        content: "Staff sign in for the Codenova Studio admin console.",
      },
      { property: "og:title", content: "Admin sign in — Codenova Studio" },
      { property: "og:description", content: "Staff access to orders, payments and projects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setBusy(false);
      toast.error(error?.message ?? "Sign in failed.");
      return;
    }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setBusy(false);

    if (!role) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access.");
      return;
    }

    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-2">
          <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
            <ShieldCheck className="size-5" />
          </span>
          <CardTitle className="text-xl">Admin sign in</CardTitle>
          <p className="text-muted-foreground text-sm">
            Staff access to orders, payments and project delivery.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to admin"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-sm">
            Customer account?{" "}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in here
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
