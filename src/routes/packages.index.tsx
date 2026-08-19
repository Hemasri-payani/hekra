import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/packages/")({
  head: () => ({
    meta: [
      { title: "Packages & Pricing — Codenova Studio" },
      {
        name: "description",
        content:
          "Five transparent software development packages starting at ₹1,000 — from a single landing page to an advanced custom platform.",
      },
      { property: "og:title", content: "Packages & Pricing — Codenova Studio" },
      {
        property: "og:description",
        content: "Fixed-price custom software packages with clear scope and support.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, slug, name, tagline, price_inr, features, support")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHero
        eyebrow="Packages"
        title="Transparent pricing, from ₹1,000"
        body="Choose the package that matches your scope. Upgrade any time — amounts already paid are adjusted."
      />
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))
            : packages?.map((pkg) => (
                <Card key={pkg.id} className="flex flex-col shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
                    <p className="pt-2 text-3xl font-semibold">{formatINR(pkg.price_inr)}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="text-primary mt-0.5 size-4 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {pkg.support ? (
                      <p className="mt-4 text-xs text-muted-foreground">Support: {pkg.support}</p>
                    ) : null}
                    <Button asChild className="mt-6 w-full">
                      <Link to="/packages/$slug" params={{ slug: pkg.slug }}>
                        View details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>
    </div>
  );
}
