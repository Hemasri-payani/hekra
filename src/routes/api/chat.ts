import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the Codenova Studio assistant, a helpful assistant on the website of a custom software development studio.

About Codenova Studio:
- Builds custom software: web apps, mobile apps, AI/ML solutions, database solutions and business automation.
- Fixed-scope, fixed-price packages starting at Rs. 1,000, purchased online with secure payment.
- Process: Discovery, Design, Build (weekly reviewable increments), Test, Deploy.
- Customers get a dashboard with live order/project tracking, and full ownership of source code, database schema and deployment docs.
- Contact: hello@codenovastudio.in, +91 90000 00000, Mon-Sat 10:00-19:00 IST, Chennai, India (remote-first).
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

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions: SYSTEM_PROMPT,
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
