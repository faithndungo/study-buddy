import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, Send, Square, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BuddyMark } from "@/components/Logo";
import { threadsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

type Search = { q?: string | undefined };

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  validateSearch: (s: Record<string, unknown>): Search => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("sdk_id, id, role, parts")
      .eq("thread_id", params.threadId)
      .order("created_at");
    if (error) throw error;
    return {
      messages: (data ?? []).map((m) => ({ id: m.sdk_id ?? m.id, role: m.role as UIMessage["role"], parts: m.parts as UIMessage["parts"] })),
    };
  },
  head: () => ({ meta: [{ title: "AI Study Buddy chat" }, { name: "description", content: "Chat with your Azure tutor." }] }),
  component: ChatPage,
});

const SUGGESTED = [
  "Explain cloud computing in simple terms.",
  "What is the difference between IaaS, PaaS, and SaaS?",
  "Explain Azure virtual machines using a real-life example.",
  "Teach me Azure security.",
  "Give me five practice questions.",
];

const QUICK = [
  ["Explain More Simply", "Explain that even more simply, like I'm completely new to tech."],
  ["Real-Life Example", "Give me another real-life example of that."],
  ["Compare", "Compare that with a closely related Azure concept so I can tell them apart."],
  ["Summarize", "Summarize this topic in 3–5 key bullet points for revision."],
  ["Practice Question", "Generate one practice multiple-choice question on this topic. Don't reveal the answer until I reply."],
] as const;

function ChatPage() {
  const { threadId } = Route.useParams();
  const { messages } = Route.useLoaderData();
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <ThreadList activeId={threadId} />
      <ChatWindow key={threadId} threadId={threadId} initial={messages} />
    </div>
  );
}

function ThreadList({ activeId }: { activeId: string }) {
  const threads = useQuery(threadsQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function remove(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't delete");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["threads"] });
    if (id === activeId) navigate({ to: "/chat" });
  }
  return (
    <aside className="hidden flex-col gap-2 lg:flex">
      <Button asChild variant="brand"><Link to="/chat"><Plus /> New chat</Link></Button>
      <div className="mt-2 space-y-1">
        {(threads.data ?? []).map((t) => (
          <div key={t.id} className={cn("group flex items-center rounded-xl", t.id === activeId ? "bg-secondary" : "hover:bg-muted")}>
            <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm">
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{t.title}</span>
            </Link>
            <button aria-label="Delete chat" onClick={() => remove(t.id)} className="p-2 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentQ = useRef(false);

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      },
    }),
    onError: (e) => toast.error(e.message || "Something went wrong"),
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      inputRef.current?.focus();
    },
  });
  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
    inputRef.current?.focus();
  }

  useEffect(() => {
    inputRef.current?.focus();
    if (q && !sentQ.current && initial.length === 0) {
      sentQ.current = true;
      send(q);
      navigate({ to: "/chat/$threadId", params: { threadId }, search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border bg-card shadow-card lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-3"><BuddyMark size={34} /><div><p className="font-semibold">AI Study Buddy</p><p className="text-xs text-muted-foreground">Your AZ-900 tutor · powered by Lovable AI</p></div></div>
        <Button asChild variant="outline" size="sm" className="lg:hidden"><Link to="/chat"><Plus /> New</Link></Button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg py-10 text-center">
            <BuddyMark size={56} />
            <h2 className="mt-4 text-xl font-semibold">What would you like to understand today?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ask anything about Azure — I'll keep it simple.</p>
          </div>
        )}
        {messages.map((m, idx) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          if (m.role === "user")
            return <div key={m.id} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">{text}</div></div>;
          const isLast = idx === messages.length - 1;
          return (
            <div key={m.id} className="flex gap-3">
              <BuddyMark size={30} />
              <div className="min-w-0 flex-1">
                <div className="prose-chat max-w-none text-[0.95rem] leading-relaxed [&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
                {isLast && !busy && text && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK.map(([label, prompt]) => (
                      <button key={label} onClick={() => send(prompt)} className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary">{label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex gap-3"><BuddyMark size={30} /><div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 150}ms` }} />)}</div></div>
        )}
        {error && !busy && <p className="text-sm text-destructive">The last message failed. You can send it again.</p>}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3 md:p-4">
        {messages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-accent">{s}</button>)}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about any Azure concept…"
            aria-label="Message"
            rows={1}
            className="max-h-40 min-h-11 resize-none rounded-2xl"
          />
          {busy ? (
            <Button type="button" size="icon" variant="outline" aria-label="Stop" onClick={() => stop()} className="h-11 w-11 shrink-0 rounded-2xl"><Square /></Button>
          ) : (
            <Button type="submit" size="icon" variant="brand" aria-label="Send" disabled={!input.trim()} className="h-11 w-11 shrink-0 rounded-2xl"><Send /></Button>
          )}
        </form>
      </div>
    </div>
  );
}
