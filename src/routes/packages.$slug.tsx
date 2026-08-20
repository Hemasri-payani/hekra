import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/packages/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Package details — Codenova Studio" },
      {
        name: "description",
        content:
          "Full scope, deliverables, support terms and pricing for this Codenova Studio development package.",
      },
      { property: "og:title", content: "Package details — Codenova Studio" },
      {
        property: "og:description",
        content: "Scope, deliverables and pricing for this development package.",
      },
      { property: "og:url", content: `https://hekra.lovable.app/packages/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `https://hekra.lovable.app/packages/${params.slug}` }],
  }),
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { slug } = Route.useParams();
  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container-page py-20">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold">Package not found</h1>
        <p className="mt-2 text-muted-foreground">This package is no longer available.</p>
        <Button asChild className="mt-6">
          <Link to="/packages">Back to packages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHero eyebrow="Package" title={pkg.name} body={pkg.tagline} />
      <section className="container-page grid gap-8 py-16 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">What's included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Scope & support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{pkg.description}</p>
              {pkg.scope ? <p>{pkg.scope}</p> : null}
              {pkg.support ? <p>Support: {pkg.support}</p> : null}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit shadow-elevated">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Total price</p>
            <CardTitle className="text-3xl">{formatINR(pkg.price_inr)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/checkout/$slug" params={{ slug: pkg.slug }}>
                Get started
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/contact">Ask a question</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/packages">Compare packages</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
