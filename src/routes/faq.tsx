import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Codenova Studio" },
      {
        name: "description",
        content:
          "Answers about packages, pricing, payments, timelines, source-code ownership and project tracking.",
      },
      { property: "og:title", content: "FAQ — Codenova Studio" },
      {
        property: "og:description",
        content: "Common questions about working with Codenova Studio.",
      },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "How do the packages work?",
    a: "Pick a package, share your project requirements, review the order summary and pay securely. Requirements review begins within one working day.",
  },
  {
    q: "What does pricing include?",
    a: "Every package price covers development, testing and deployment support for the listed scope. Anything outside scope is quoted separately before work starts.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. Any amount already paid is adjusted against the higher package when you upgrade during the engagement.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Payments are processed through Razorpay — UPI, cards, net banking and wallets. Every payment is verified server-side before your order is confirmed.",
  },
  {
    q: "Do I own the source code?",
    a: "You do. Full source, database schema and deployment instructions are handed over on completion.",
  },
  {
    q: "How do I track progress?",
    a: "Every order has a live tracking view in your dashboard covering confirmation, requirements review, development, testing and completion.",
  },
  {
    q: "What about support after launch?",
    a: "Each package includes a support window. Extended maintenance retainers are available on request.",
  },
];

function FaqPage() {
  return (
    <div>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        body="Everything about scope, pricing, payments and delivery — in plain language."
      />
      <section className="container-page max-w-3xl py-16">
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact">Still have a question?</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/packages">See packages</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
