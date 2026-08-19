import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, BrainCircuit, Database, Globe, Smartphone, Workflow } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Codenova Studio" },
      {
        name: "description",
        content:
          "Web apps, mobile apps, AI/ML, database engineering and business automation delivered by one senior team.",
      },
      { property: "og:title", content: "Services — Codenova Studio" },
      {
        property: "og:description",
        content: "Full-stack software services from discovery to deployment.",
      },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  {
    icon: Boxes,
    title: "Custom Software Development",
    body: "Bespoke systems designed around your workflows, with clean architecture and full source handover.",
    points: ["Requirements workshops", "Domain modelling", "Iterative delivery"],
  },
  {
    icon: Globe,
    title: "Web Applications",
    body: "Fast, secure, SEO-ready web apps with modern React front-ends and hardened APIs.",
    points: ["React + TypeScript", "Server-side rendering", "Role-based access"],
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    body: "Cross-platform mobile experiences sharing one codebase and one design language.",
    points: ["iOS & Android", "Offline-first data", "Push notifications"],
  },
  {
    icon: BrainCircuit,
    title: "AI / ML Solutions",
    body: "Assistants, document intelligence, recommendations and forecasting wired into your own data.",
    points: ["RAG assistants", "Model integration", "Evaluation & guardrails"],
  },
  {
    icon: Database,
    title: "Database Solutions",
    body: "Normalised schemas, indexing, migrations and query tuning for reliable, quick reads.",
    points: ["PostgreSQL design", "Migrations & backups", "Performance tuning"],
  },
  {
    icon: Workflow,
    title: "Business Automation",
    body: "Replace manual spreadsheets and follow-ups with dependable automated pipelines.",
    points: ["Workflow engines", "Third-party integrations", "Scheduled jobs"],
  },
];

function ServicesPage() {
  return (
    <div>
      <PageHero
        eyebrow="Services"
        title="Engineering services that cover the whole delivery lifecycle"
        body="Discovery, design, build, test and deploy — handled by the same team from day one."
      />
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card key={service.title} className="shadow-card">
              <CardHeader>
                <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
                  <service.icon className="size-5" />
                </span>
                <CardTitle className="pt-3 text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{service.body}</p>
                <ul className="mt-4 space-y-1">
                  {service.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/packages">View packages</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Discuss your project</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
