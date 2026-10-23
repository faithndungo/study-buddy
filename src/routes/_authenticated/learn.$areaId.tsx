import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Lightbulb, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AREAS, QUESTIONS } from "@/lib/content";
import { lessonsQuery, setLessonDone } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/learn/$areaId")({
  loader: ({ params }) => {
    const area = AREAS.find((a) => a.id === params.areaId);
    if (!area) throw notFound();
    return { area };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.area.title ?? "Lesson"} — AI Study Buddy` }, { name: "description", content: loaderData?.area.blurb ?? "AZ-900 lessons" }],
  }),
  component: AreaPage,
});

function AreaPage() {
  const { area } = Route.useLoaderData();
  const qc = useQueryClient();
  const lessons = useQuery(lessonsQuery);
  const done = new Set((lessons.data ?? []).map((l) => l.lesson_id));
  const practice = QUESTIONS.filter((q) => q.area === area.id).slice(0, 2);

  async function toggle(id: string, title: string) {
    try {
      await setLessonDone(id, !done.has(id), title);
      await qc.invalidateQueries({ queryKey: ["lessons"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      if (!done.has(id)) toast.success("Lesson marked as completed");
    } catch {
      toast.error("Couldn't save — please try again");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All topics</Link>
      <div>
        <h1 className="text-3xl font-bold">{area.title}</h1>
        <p className="mt-1 text-muted-foreground">{area.blurb} · Exam weight {area.weight}</p>
      </div>
      {area.lessons.map((l, i) => {
        const isDone = done.has(l.id);
        return (
          <article key={l.id} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-accent-foreground">Lesson {i + 1}</p>
                <h2 className="text-xl font-semibold">{l.title}</h2>
                <p className="text-sm text-muted-foreground">{l.summary}</p>
              </div>
              <Button variant={isDone ? "secondary" : "outline"} size="sm" onClick={() => toggle(l.id, l.title)}>
                {isDone ? <CheckCircle2 className="text-success" /> : <Circle />} {isDone ? "Completed" : "Mark as completed"}
              </Button>
            </div>
            <p className="mt-4 leading-relaxed">{l.explanation}</p>
            <div className="mt-4 flex gap-3 rounded-xl bg-soft p-4">
              <Lightbulb className="h-5 w-5 shrink-0 text-violet" />
              <p className="text-sm"><span className="font-semibold">Real-life example: </span>{l.example}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {l.keyTerms.map((k) => (
                <div key={k.term} className="rounded-xl border p-3 text-sm"><span className="font-semibold">{k.term}</span> — {k.meaning}</div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-2 px-0">
              <Link to="/chat" search={{ q: `Explain "${l.title}" from AZ-900 in simple terms with a real-life example.` }}>
                <MessageCircle /> Ask AI Study Buddy about this
              </Link>
            </Button>
          </article>
        );
      })}
      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold">Quick practice</h2>
        <div className="mt-3 space-y-3">
          {practice.map((q) => (
            <details key={q.id} className="rounded-xl border p-4">
              <summary className="cursor-pointer font-medium">{q.question}</summary>
              <p className="mt-2 text-sm"><span className="font-semibold text-success">Answer: {q.options[q.answer]}.</span> {q.explanation}</p>
            </details>
          ))}
        </div>
        <Button asChild variant="brand" className="mt-4"><Link to="/quiz" search={{ area: area.id }}>Take the {area.title} quiz</Link></Button>
      </section>
    </div>
  );
}
