import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the Codenova Studio assistant. Tell me what you'd like to build and I'll help you shape the requirements, suggest a package and explain how we work.",
};

const SUGGESTIONS = [
  "Which package fits a small booking website?",
  "What's the status of my order?",
  "What do you need from me to start?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const next = [...messages, { role: "user" as const, content: question }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "");
        throw new Error(detail || "The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) {
        setMessages([
          ...next,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't put an answer together. Could you rephrase, or reach us at hemasripayani@gmail.com?",
          },
        ]);
      }
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            error instanceof Error && error.message
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Chat with us"}
        className="fixed right-5 bottom-5 z-50 size-14 rounded-full p-0 shadow-elevated"
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </Button>

      {open ? (
        <div className="fixed right-5 bottom-24 z-50 flex h-[min(70vh,540px)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
          <div className="surface-hero px-4 py-3">
            <p className="text-sm font-semibold">Codenova assistant</p>
            <p className="text-xs text-ink-muted">Ask about packages, scope or timelines</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-xl bg-primary px-3 py-2 text-primary-foreground"
                    : "max-w-[95%] text-foreground",
                )}
              >
                {message.content ||
                  (busy && index === messages.length - 1 ? (
                    <span className="text-muted-foreground">Thinking…</span>
                  ) : null)}
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask anything about your project…"
              className="max-h-28 min-h-10 resize-none text-sm"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
