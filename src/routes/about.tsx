import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Codenova Studio — Our Team & Approach" },
      {
        name: "description",
        content:
          "Codenova Studio is a custom software development team building web, mobile, AI and automation products with transparent pricing and disciplined delivery.",
      },
      { property: "og:title", content: "About Codenova Studio" },
      {
        property: "og:description",
        content: "A custom software development team focused on transparent, production-grade delivery.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title="A small team that ships production software"
        body="We build software the way we'd want it built for our own business: scoped honestly, priced clearly, delivered in reviewable increments."
      />
      <div className="container-page grid gap-6 py-16 md:grid-cols-3">
        {[
          {
            title: "Our mission",
            body: "Make well-engineered custom software accessible to small businesses and founders who have been priced out of it.",
          },
          {
            title: "How we work",
            body: "Fixed-scope packages, weekly increments, one point of contact and a live tracker for every order.",
          },
          {
            title: "What we value",
            body: "Security, clarity and maintainable code. No lock-in, no hidden charges, full handover on completion.",
          },
        ].map((item) => (
          <Card key={item.title} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
          </Card>
        ))}
      </div>
      <div className="container-page pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-semibold">Capabilities</h2>
          <div className="mt-6 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            {[
              "React, TypeScript & modern front-end architecture",
              "Node/serverless APIs and server functions",
              "PostgreSQL schema design, indexing and migrations",
              "Authentication, roles and access control",
              "Payment gateway integration and reconciliation",
              "AI/ML features, embeddings and assistants",
              "CI/CD pipelines and production deployment",
              "Monitoring, logging and incident response",
              "Accessibility and responsive design",
            ].map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
