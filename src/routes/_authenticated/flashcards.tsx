import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AREAS, FLASHCARDS, type AreaId } from "@/lib/content";
import { cardsQuery, setCardStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({ meta: [{ title: "Flashcards — AI Study Buddy" }, { name: "description", content: "Revise Azure terms with flashcards." }] }),
  component: Flashcards,
});

function Flashcards() {
  const qc = useQueryClient();
  const cards = useQuery(cardsQuery);
  const [area, setArea] = useState<AreaId | "all">("all");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const list = FLASHCARDS.filter((c) => area === "all" || c.area === area);
  const card = list[i % list.length]!;
  const status = new Map((cards.data ?? []).map((c) => [c.card_id, c.status]));
  const understood = list.filter((c) => status.get(c.id) === "understood").length;

  function go(d: number) {
    setFlipped(false);
    setI((i + d + list.length) % list.length);
  }
  async function mark(s: "understood" | "revise") {
    try {
      await setCardStatus(card.id, s);
      await qc.invalidateQueries({ queryKey: ["cards"] });
      go(1);
    } catch {
      toast.error("Couldn't save");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="mt-1 text-muted-foreground">{understood}/{list.length} understood in this set</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[["all", "All"], ...AREAS.map((a) => [a.id, a.title])].map(([v, l]) => (
          <button key={v} onClick={() => { setArea(v as AreaId | "all"); setI(0); setFlipped(false); }} className={cn("rounded-full border px-4 py-1.5 text-sm", area === v ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>{l}</button>
        ))}
      </div>
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => setFlipped(!flipped)}
          aria-label="Flip card"
          className={cn("card-lift flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border p-8 text-center shadow-card", flipped ? "bg-soft" : "bg-card")}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{flipped ? "Definition" : "Term"} · {i % list.length + 1}/{list.length}</span>
          <span className={cn("mt-4", flipped ? "text-lg" : "font-display text-3xl font-bold")}>{flipped ? card.back : card.front}</span>
          {status.get(card.id) && <span className="mt-4 rounded-full bg-secondary px-3 py-1 text-xs">{status.get(card.id) === "understood" ? "Understood" : "Needs revision"}</span>}
          <span className="mt-6 flex items-center gap-1 text-xs text-muted-foreground"><RotateCw className="h-3 w-3" /> Tap to flip</span>
        </button>
        <div className="mt-5 flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => go(-1)}><ChevronLeft /></Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => mark("revise")}>Needs revision</Button>
            <Button variant="brand" onClick={() => mark("understood")}><Check /> Understood</Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Next" onClick={() => go(1)}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}
