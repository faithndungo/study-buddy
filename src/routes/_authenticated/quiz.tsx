import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AREAS, QUESTIONS, areaTitle, type AreaId, type Difficulty } from "@/lib/content";
import { saveAttempt } from "@/lib/data";
import { percent } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Search = { area?: AreaId | undefined };

export const Route = createFileRoute("/_authenticated/quiz")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    area: AREAS.some((a) => a.id === s["area"]) ? (s["area"] as AreaId) : undefined,
  }),
  head: () => ({ meta: [{ title: "Practice Quizzes — AI Study Buddy" }, { name: "description", content: "Original AZ-900 practice questions with explanations." }] }),
  component: QuizPage,
});

function QuizPage() {
  const search = Route.useSearch();
  const [area, setArea] = useState<AreaId | "all">(search.area ?? "all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [started, setStarted] = useState(false);
  const [key, setKey] = useState(0);

  const qs = useMemo(
    () => QUESTIONS.filter((q) => (area === "all" || q.area === area) && (diff === "all" || q.difficulty === diff)),
    [area, diff],
  );

  if (!started) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold">Practice Quizzes</h1>
          <p className="mt-1 text-muted-foreground">Original questions based on the AZ-900 skills outline — not official exam questions.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-5">
          <Picker label="Topic" value={area} onChange={(v) => setArea(v as AreaId | "all")} options={[["all", "All topics"], ...AREAS.map((a) => [a.id, a.title] as [string, string])]} />
          <Picker label="Difficulty" value={diff} onChange={(v) => setDiff(v as Difficulty | "all")} options={[["all", "Any"], ["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]]} />
          <p className="text-sm text-muted-foreground">{qs.length} question{qs.length === 1 ? "" : "s"} available</p>
          <Button variant="brand" size="lg" disabled={!qs.length} onClick={() => setStarted(true)}>Start quiz</Button>
        </div>
      </div>
    );
  }
  return (
    <QuizRunner
      key={key}
      questions={qs}
      topic={area}
      difficulty={diff}
      onRetry={() => setKey((k) => k + 1)}
      onExit={() => setStarted(false)}
    />
  );
}

function Picker({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)} className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors", value === v ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function QuizRunner({ questions, topic, difficulty, onRetry, onExit }: { questions: typeof QUESTIONS; topic: string; difficulty: string; onRetry: () => void; onExit: () => void }) {
  const qc = useQueryClient();
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const q = questions[i]!;
  const score = answers.filter((a, idx) => a === questions[idx]!.answer).length;

  async function finish(all: number[]) {
    setFinished(true);
    const s = all.filter((a, idx) => a === questions[idx]!.answer).length;
    try {
      await saveAttempt({ topic, difficulty, score: s, total: questions.length, answers: all });
      qc.invalidateQueries({ queryKey: ["attempts"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Quiz result saved");
    } catch {
      toast.error("Couldn't save your result");
    }
  }

  if (finished) {
    const pct = percent(score, questions.length);
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="rounded-3xl bg-brand p-8 text-center text-primary-foreground shadow-glow">
          <Trophy className="mx-auto h-10 w-10" />
          <h1 className="mt-3 text-3xl font-bold">You scored {score}/{questions.length}</h1>
          <p className="mt-1 opacity-90">{pct}% · {pct >= 70 ? "Great work — you're on track!" : "Keep practising — review the explanations below."}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="secondary" onClick={onRetry}><RotateCcw /> Retry quiz</Button>
            <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={onExit}>New quiz</Button>
          </div>
        </div>
        <h2 className="text-lg font-semibold">Review</h2>
        {questions.map((qq, idx) => {
          const right = answers[idx] === qq.answer;
          return (
            <div key={qq.id} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex gap-2">{right ? <CheckCircle2 className="shrink-0 text-success" /> : <XCircle className="shrink-0 text-destructive" />}<p className="font-medium">{qq.question}</p></div>
              <p className="mt-2 text-sm"><span className="font-semibold">Correct: </span>{qq.options[qq.answer]} — {qq.explanation}</p>
              {!right && <p className="mt-1 text-sm text-muted-foreground"><span className="font-semibold">Your answer: </span>{qq.options[answers[idx]!]} — {qq.wrongWhy[answers[idx]!]}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  const correct = selected === q.answer;
  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-up">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {i + 1} of {questions.length}</span>
        <span>{areaTitle(q.area)} · {q.difficulty}</span>
      </div>
      <Progress value={(i / questions.length) * 100} />
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="text-xl font-semibold">{q.question}</h2>
        <div className="mt-5 space-y-2.5" role="radiogroup">
          {q.options.map((o, idx) => (
            <button
              key={o}
              role="radio"
              aria-checked={selected === idx}
              disabled={submitted}
              onClick={() => setSelected(idx)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                !submitted && selected === idx && "border-primary bg-secondary",
                !submitted && selected !== idx && "hover:bg-muted",
                submitted && idx === q.answer && "border-success bg-success/10",
                submitted && selected === idx && idx !== q.answer && "border-destructive bg-destructive/10",
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>
              {o}
            </button>
          ))}
        </div>
        {submitted && (
          <div className={cn("mt-5 rounded-xl p-4 text-sm", correct ? "bg-success/10" : "bg-destructive/10")}>
            <p className="font-semibold">{correct ? "Correct!" : "Not quite."}</p>
            <p className="mt-1">{q.explanation}</p>
            {!correct && selected !== null && <p className="mt-1 text-muted-foreground">Why your answer is wrong: {q.wrongWhy[selected]}</p>}
          </div>
        )}
        <div className="mt-5 flex justify-end">
          {!submitted ? (
            <Button variant="brand" disabled={selected === null} onClick={() => { setSubmitted(true); setAnswers([...answers, selected!]); }}>Submit answer</Button>
          ) : (
            <Button variant="brand" onClick={() => {
              if (i + 1 >= questions.length) finish(answers);
              else { setI(i + 1); setSelected(null); setSubmitted(false); }
            }}>{i + 1 >= questions.length ? "See results" : "Next question"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
