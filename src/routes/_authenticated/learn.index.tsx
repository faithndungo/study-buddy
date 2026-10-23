import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Server, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AREAS } from "@/lib/content";
import { lessonsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({ meta: [{ title: "Learn Azure — AI Study Buddy" }, { name: "description", content: "AZ-900 lessons by skill area." }] }),
  component: LearnIndex,
});

const ICONS = { "cloud-concepts": Cloud, architecture: Server, governance: ShieldCheck } as const;

function LearnIndex() {
  const lessons = useQuery(lessonsQuery);
  const done = new Set((lessons.data ?? []).map((l) => l.lesson_id));
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold">Learn Azure</h1>
        <p className="mt-1 text-muted-foreground">Organised around the three areas of the AZ-900 skills outline.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {AREAS.map((a) => {
          const Icon = ICONS[a.id];
          const n = a.lessons.filter((l) => done.has(l.id)).length;
          return (
            <Link key={a.id} to="/learn/$areaId" params={{ areaId: a.id }} className="card-lift flex flex-col rounded-2xl border bg-card p-6 shadow-card">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-soft"><Icon className="h-5 w-5 text-primary" /></span>
              <h2 className="mt-4 text-lg font-semibold">{a.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{a.blurb}</p>
              <p className="mt-4 text-xs text-muted-foreground">{n}/{a.lessons.length} lessons · weight {a.weight}</p>
              <Progress value={(n / a.lessons.length) * 100} className="mt-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
