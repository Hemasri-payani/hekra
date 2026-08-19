import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Codenova Studio" },
      {
        name: "description",
        content:
          "Tell us about your software project. We reply within one working day with scope and pricing guidance.",
      },
      { property: "og:title", content: "Contact — Codenova Studio" },
      {
        property: "og:description",
        content: "Get in touch with the Codenova Studio engineering team.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Thanks — we'll reply within one working day.");
      event.currentTarget?.reset?.();
    }, 500);
  }

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Tell us about your project"
        body="Share your idea, timeline and budget. We'll come back with a clear scope and price."
      />
      <section className="container-page grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Project enquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Project details</Label>
                <Textarea id="message" name="message" rows={6} required />
              </div>
              <Button type="submit" disabled={sending} className="w-fit">
                {sending ? "Sending…" : "Send enquiry"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Reach us directly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-3">
              <Mail className="text-primary size-4" /> hello@codenova.studio
            </p>
            <p className="flex items-center gap-3">
              <Phone className="text-primary size-4" /> +91 90000 00000
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="text-primary size-4" /> Chennai, India
            </p>
            <p>Mon–Fri, 10:00–19:00 IST. We reply within one working day.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
