import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

function supabaseFor(accessToken?: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
        else headers.delete("Authorization");
        return fetch(input, { ...init, headers });
      },
    },
  });
}

async function buildLiveContext(accessToken?: string): Promise<string> {
  const parts: string[] = [];
  try {
    const anon = supabaseFor();
    const { data: packages } = await anon
      .from("packages")
      .select("name, slug, tagline, price_inr, scope, support, features")
      .eq("is_active", true)
      .order("sort_order");
    if (packages?.length) {
      parts.push(
        "Live packages (prices in INR, 18% GST added at checkout):\n" +
          packages
            .map(
              (p) =>
                `- ${p.name} (/packages/${p.slug}) — Rs. ${p.price_inr}. ${p.tagline}. Scope: ${p.scope}. Support: ${p.support}. Includes: ${(p.features ?? []).join("; ")}`,
            )
            .join("\n"),
      );
    }
  } catch {
    // live package data unavailable; continue without it
  }

  if (accessToken) {
    try {
      const user = supabaseFor(accessToken);
      const { data: orders } = await user
        .from("orders")
        .select(
          "order_number, status, payment_status, total_amount, created_at, packages(name), projects(project_name, progress)",
        )
        .order("created_at", { ascending: false })
        .limit(10);
      if (orders?.length) {
        parts.push(
          "The signed-in visitor's own orders (share these freely with them):\n" +
            orders
              .map(
                (o) =>
                  `- ${o.order_number}: ${o.packages?.name ?? "package"}, order status ${o.status}, payment ${o.payment_status}, total Rs. ${o.total_amount}, placed ${new Date(o.created_at).toDateString()}${o.projects ? `, project "${o.projects.project_name}" ${o.projects.progress}% complete` : ""}`,
              )
              .join("\n"),
        );
      } else {
        parts.push("The visitor is signed in but has no orders yet.");
      }
    } catch {
      // order lookup failed; continue without it
    }
  } else {
    parts.push(
      "The visitor is NOT signed in, so you cannot see any orders. If they ask about order status, ask them to sign in at /login and reopen the chat.",
    );
  }

  return parts.join("\n\n");
}

const SYSTEM_PROMPT = `You are the Codenova Studio assistant, a helpful assistant on the website of a custom software development studio.

About Codenova Studio:
- Builds custom software: web apps, mobile apps, AI/ML solutions, database solutions and business automation.
- Fixed-scope, fixed-price packages starting at Rs. 1,000, purchased online with secure payment.
- Process: Discovery, Design, Build (weekly reviewable increments), Test, Deploy.
- Customers get a dashboard with live order/project tracking, and full ownership of source code, database schema and deployment docs.
- Contact: hemasripayani@gmail.com, +91 94407 76913, Mon-Sat 10:00-19:00 IST, Chennai, India (remote-first).
- Site pages: /packages, /services, /about, /faq, /contact, /register, /login, /dashboard.

Guidance:
- Help visitors clarify their project requirements, suggest a suitable package, explain the process, timelines, pricing and technology choices.
- You may answer general questions too, including technical ones, but keep answers concise and useful.
- This is a newly launched studio: never invent client counts, ratings, testimonials, years of experience or delivered project numbers.
- If you do not know something specific (exact timeline or price for a bespoke scope), say so and point them to /contact.
- Keep replies short (under 150 words) unless asked for detail. Use plain markdown.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : null;
        if (!messages || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured", { status: 500 });
        }

        const authHeader = request.headers.get("Authorization") ?? "";
        const accessToken = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : undefined;
        const liveContext = await buildLiveContext(accessToken);

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions: `${SYSTEM_PROMPT}\n\nLIVE DATA (authoritative, from the live database — prefer it over anything else):\n${liveContext}`,
            input: messages.map((m) => ({
              role: m.role,
              content: [
                {
                  type: m.role === "assistant" ? "output_text" : "input_text",
                  text: String(m.content ?? ""),
                },
              ],
            })),
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const status = upstream.status || 500;
          const message =
            status === 429
              ? "Too many requests right now. Please try again in a moment."
              : status === 402
                ? "The assistant is temporarily unavailable (AI credits exhausted)."
                : `The assistant could not respond. ${detail.slice(0, 300)}`;
          return new Response(message, { status });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const event = JSON.parse(payload) as { type?: string; delta?: string };
                    if (event.type === "response.output_text.delta" && event.delta) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    // ignore keep-alive / partial frames
                  }
                }
              }
            } catch (error) {
              console.error("chat stream error", error);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
