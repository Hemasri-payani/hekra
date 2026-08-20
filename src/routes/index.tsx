import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Check,
  Database,
  Globe,
  Quote,
  Smartphone,
  Workflow,
  ShieldCheck,
  Rocket,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Codenova Studio — Custom Software Development Company" },
      {
        name: "description",
        content:
          "Custom software development packages from ₹1,000. Web apps, mobile apps, AI/ML, databases and business automation built for your business.",
      },
      { property: "og:title", content: "Codenova Studio — Custom Software Development" },
      {
        property: "og:description",
        content:
          "Professional custom software development solutions designed around your business, ideas and requirements.",
      },
      { property: "og:url", content: "https://hekra.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://hekra.lovable.app/" }],
  }),
  component: HomePage,
});

const SERVICES = [
  {
    icon: Boxes,
    title: "Custom Software Development",
    body: "Bespoke systems designed around your workflows instead of forcing you into someone else's product.",
  },
  {
    icon: Globe,
    title: "Web Applications",
    body: "Fast, secure, SEO-ready web apps with modern React front-ends and hardened APIs.",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    body: "Cross-platform mobile experiences that share one codebase and one design language.",
  },
  {
    icon: BrainCircuit,
    title: "AI / ML Solutions",
    body: "Assistants, document intelligence, recommendations and forecasting wired into your data.",
  },
  {
    icon: Database,
    title: "Database Solutions",
    body: "Normalised schemas, indexing, migrations and query tuning for reliable, quick reads.",
  },
  {
    icon: Workflow,
    title: "Business Automation",
    body: "Replace manual spreadsheets and follow-ups with dependable automated pipelines.",
  },
];

const PROCESS = [
  { step: "01", title: "Discovery", body: "We map your requirements, users and success criteria." },
  { step: "02", title: "Design", body: "Wireframes, data model and architecture agreed up front." },
  { step: "03", title: "Build", body: "Weekly increments you can review, not a black box." },
  { step: "04", title: "Test", body: "Functional, security and performance checks before release." },
  { step: "05", title: "Deploy", body: "Production setup, monitoring and handover documentation." },
];

const REVIEWS = [
  {
    name: "Anitha R.",
    role: "Founder, Retail startup",
    body: "They shipped our ordering portal in three weeks and the admin dashboard alone saves us a day of work every week.",
  },
  {
    name: "Karthik S.",
    role: "Operations Head",
    body: "Clear scope, clear pricing, no surprises. The tracking page meant I always knew what stage we were at.",
  },
  {
    name: "Meera J.",
    role: "Clinic Owner",
    body: "Our appointment system finally fits how we actually work. Support after launch was genuinely responsive.",
  },
];

const FAQS = [
  {
    q: "How do the packages work?",
    a: "Pick a package, share your project requirements, review the order summary and pay securely. We start the requirements review within one working day.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. Any amount already paid is adjusted against the higher package when you upgrade during the engagement.",
  },
  {
    q: "Do I own the source code?",
    a: "You do. Full source, database schema and deployment instructions are handed over on completion.",
  },
  {
    q: "How do I track progress?",
    a: "Every order has a live tracking view in your dashboard covering confirmation, requirements review, development, testing and completion.",
  },
];

function HomePage() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, slug, name, tagline, price_inr, features")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <section className="surface-hero relative overflow-hidden">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="fade-up">
            <Badge variant="secondary" className="mb-5 bg-white/10 text-ink-foreground">
              Custom software, delivered end to end
            </Badge>
            <h1 className="text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Build Your Software.
              <br />
              Bring Your Idea to Life.
            </h1>
            <p className="mt-6 max-w-xl text-base text-ink-muted sm:text-lg">
              Professional custom software development solutions designed around your business,
              ideas, and requirements.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/packages">View Packages</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-ink-foreground hover:bg-white/10"
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                ["120+", "Projects delivered"],
                ["4.9/5", "Client rating"],
                ["₹1,000", "Starting price"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-semibold">{value}</dt>
                  <dd className="text-xs text-ink-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="fade-up hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:block">
            <p className="text-sm font-medium">What you get in every engagement</p>
            <ul className="mt-5 space-y-3 text-sm text-ink-muted">
              {[
                "Fixed, transparent pricing from the first conversation",
                "Secure authentication and role-based access built in",
                "Production database design with migrations",
                "Server-verified payments and audit trails",
                "Deployment support and complete handover docs",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About us"
              title="A senior engineering team, not a template shop"
              body="Codenova Studio is a custom software studio building production systems for founders, clinics, retailers and operations teams across India. Every engagement is architected, reviewed and handed over by senior engineers."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/about">
                  More about us <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/services">Explore services</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["8+ years", "Average engineering experience on every project"],
              ["120+", "Products shipped to production"],
              ["1 working day", "Typical response time on new enquiries"],
              ["100% ownership", "Source code, schema and docs handed to you"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-primary text-xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need under one engineering team"
          body="From a first landing page to a scaled internal platform, we cover the full delivery lifecycle."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card key={service.title} className="shadow-card transition-shadow hover:shadow-elevated">
              <CardHeader>
                <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
                  <service.icon className="size-5" />
                </span>
                <CardTitle className="pt-3 text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{service.body}</CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/services">
              View all services <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>


      <section className="bg-muted/50 border-y border-border py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why choose us"
            title="Engineering discipline, startup speed"
            body="We work in short, reviewable increments so you always know where your money went."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Security first",
                body: "Hashed credentials, row-level data isolation, server-side payment verification and audit logging.",
              },
              {
                icon: Timer,
                title: "Predictable delivery",
                body: "Milestones, weekly demos and a live tracker so timelines never become a mystery.",
              },
              {
                icon: Rocket,
                title: "Built to scale",
                body: "Indexed databases, clean architecture and deployment pipelines ready for production traffic.",
              },
            ].map((item) => (
              <Card key={item.title} className="shadow-card">
                <CardHeader>
                  <item.icon className="text-primary size-6" />
                  <CardTitle className="pt-3 text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Process"
          title="A development process you can follow"
          body="Five stages, each with a clear output you sign off on."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-5">
          {PROCESS.map((item) => (
            <li key={item.step} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <span className="text-primary text-sm font-semibold">{item.step}</span>
              <h3 className="mt-2 font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="packages" className="bg-muted/50 border-y border-border py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Packages"
            title="Transparent pricing, from ₹1,000"
            body="Five packages covering everything from a single landing page to an advanced platform."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
              : packages?.map((pkg) => (
                  <Card key={pkg.id} className="flex flex-col shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
                      <p className="pt-2 text-3xl font-semibold">{formatINR(pkg.price_inr)}</p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                        {pkg.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex gap-2">
                            <Check className="text-primary mt-0.5 size-4 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="mt-6 w-full">
                        <Link to="/packages/$slug" params={{ slug: pkg.slug }}>
                          Choose Package
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/packages">Compare all packages</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Reviews" title="What our clients say" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <Card key={review.name} className="shadow-card">
              <CardContent className="pt-6">
                <Quote className="text-primary size-6" />
                <p className="mt-4 text-sm">{review.body}</p>
                <p className="mt-6 text-sm font-medium">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 border-y border-border py-20">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Tell us what you want to build"
              body="Share your idea, timeline and budget. You get a written scope and a fixed price back — no obligation."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">
                  Send an enquiry <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/faq">Read the FAQ</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Email", "hello@codenovastudio.in"],
              ["Phone", "+91 90000 00000"],
              ["Hours", "Mon–Sat, 10:00–19:00 IST"],
              ["Location", "Chennai, India (remote-first)"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">

        <div className="surface-hero rounded-2xl px-8 py-14 text-center shadow-elevated">
          <h2 className="text-3xl font-semibold">Ready to start your project?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            Create your account, choose a package and share your requirements. We reply within one
            working day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-muted-foreground">{body}</p> : null}
    </div>
  );
}
