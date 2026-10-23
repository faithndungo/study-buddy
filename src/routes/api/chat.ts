import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";

const SYSTEM = `You are "AI Study Buddy", a friendly tutor that ONLY helps students prepare for the Microsoft Azure Fundamentals (AZ-900) exam.

When explaining a concept, use clear beginner-friendly language and markdown with these short sections where they fit:
1. **Simple definition**
2. **In everyday language**
3. **Real-life example**
4. **Analogy** (when helpful)
5. **How it works in Azure**
6. **Key points** (short bullet summary)
7. **Try this** — one optional practice question (multiple choice, answer hidden until the student replies)

Rules:
- Stay focused on Azure and AZ-900. Politely redirect unrelated questions back to Azure.
- Never invent Azure features. If unsure, say so and suggest checking Microsoft Learn (learn.microsoft.com).
- Use current product names (e.g. Microsoft Entra ID, formerly Azure Active Directory).
- Follow-ups like "explain more simply", "another example", or "test me" refer to the current conversation topic.
- When asked for practice questions, write ORIGINAL questions; never claim they are official exam questions.
- Keep answers concise — usually under 350 words.`;

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json" } });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return json(401, "Please sign in.");

        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              h.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: u, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !u.user) return json(401, "Please sign in again.");
        const userId = u.user.id;

        let body: { messages?: UIMessage[]; threadId?: string };
        try {
          body = await request.json();
        } catch {
          return json(400, "Invalid request");
        }
        const messages = body.messages;
        const threadId = body.threadId;
        if (!Array.isArray(messages) || !messages.length || typeof threadId !== "string") return json(400, "Invalid request");

        const { data: thread } = await supabase.from("chat_threads").select("id, title").eq("id", threadId).maybeSingle();
        if (!thread) return json(404, "Conversation not found");

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return json(500, "AI is not configured.");

        const last = messages[messages.length - 1]!;
        if (last.role === "user") {
          const { error } = await supabase
            .from("chat_messages")
            .insert({ thread_id: threadId, user_id: userId, sdk_id: last.id, role: "user", parts: last.parts as never });
          if (error) console.error("save user message failed", error);
          const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
          await supabase
            .from("chat_threads")
            .update({ updated_at: new Date().toISOString(), ...(thread.title === "New chat" && text ? { title: text.slice(0, 60) } : {}) })
            .eq("id", threadId);
        }

        const { createResponsesCall } = await import("@/lib/ai/responses.server");
        const { withLovableAiGatewayRunIdHeader, createLovableAiGatewayRunIdFetch } = await import("@/lib/ai/run-id.server");
        void createLovableAiGatewayRunIdFetch;
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          SYSTEM,
        );
        void withLovableAiGatewayRunIdHeader;

        return call.result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onError: (err) => {
            console.error("chat error", err);
            const msg = String((err as { message?: string })?.message ?? "");
            if (msg.includes("402")) return "AI credits have run out. Please add credits to continue.";
            if (msg.includes("429")) return "Too many requests — please wait a moment and try again.";
            return "Sorry, the AI couldn't respond. Please try again.";
          },
          onFinish: async ({ responseMessage }) => {
            const { error } = await supabase.from("chat_messages").insert({
              thread_id: threadId,
              user_id: userId,
              sdk_id: responseMessage.id,
              role: "assistant",
              parts: responseMessage.parts.filter((p) => p.type === "text") as never,
            });
            if (error) console.error("save assistant message failed", error);
          },
        });
      },
    },
  },
});
