import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createThread } from "@/lib/data";

type Search = { q?: string | undefined };

export const Route = createFileRoute("/_authenticated/chat/")({
  validateSearch: (s: Record<string, unknown>): Search => ({ q: typeof s["q"] === "string" ? s["q"].slice(0, 500) : undefined }),
  head: () => ({ meta: [{ title: "AI Study Buddy chat" }, { name: "description", content: "Chat with your Azure tutor." }] }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createThread()
      .then((id) => navigate({ to: "/chat/$threadId", params: { threadId: id }, search: q ? { q } : {}, replace: true }))
      .catch(() => toast.error("Couldn't start a chat"));
  }, [navigate, q]);
  return <p className="text-muted-foreground">Starting a new chat…</p>;
}
