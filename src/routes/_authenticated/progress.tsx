import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AREAS, ALL_LESSONS, areaTitle } from "@/lib/content";
import { activityQuery, attemptsQuery, cardsQuery, lessonsQuery } from "@/lib/data";
import { areaAccuracy, averageScore, needsRevision, percent } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "My Progress — AI Study Buddy" }, { name: "description", content: "Track your AZ-900 learning progress." }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const lessons = useQuery(lessonsQuery);
  const attempts = useQuery(attemptsQuery);
  const cards = useQuery(cardsQuery);
  const activity = useQuery(activityQuery);
  const done = new Set((lessons.data ?? []).map((l) => l.lesson_id));
  const att = attempts.data ?? [];
  const acc = areaAccuracy(att).sort((a, b) => b.pct - a.pct);
  const revise = needsRevision(att);
  const overall = percent(done.size, ALL_LESSONS.length);
  const chart = [...att].reverse().slice(-10).map((a, idx) => ({ name: `#${idx + 1}`, score: percent(a.score, a.total) }));
  const empty = !done.size && !att.length && !(cards.data?.length);

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-3xl font-bold">My Progress</h1>
      {empty && (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
          <p className="font-semibold">Nothing tracked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Complete a lesson or take a quiz and your real progress will appear here.</p>
          <div className="mt-4 flex justify-center gap-2"><Button asChild variant="brand"><Link to="/quiz">Take a quiz</Link></Button><Button asChild variant="outline"><Link to="/learn">Start learning</Link></Button></div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card label="Overall progress" value={`${overall}%`}><Progress value={overall} className="mt-2" /></Card>
        <Card label="Lessons completed" value={`${done.size}/${ALL_LESSONS.length}`} />
        <Card label="Quiz attempts" value={String(att.length)} />
        <Card label="Average score" value={att.length ? `${averageScore(att)}%` : "—"} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Recent quiz scores</h2>
          {chart.length ? (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}><XAxis dataKey="name" fontSize={12} /><YAxis domain={[0, 100]} fontSize={12} /><Tooltip /><Bar dataKey="score" fill="var(--chart-1)" radius={[8, 8, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="mt-3 text-sm text-muted-foreground">No quizzes yet.</p>}
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Lessons by area</h2>
          <div className="mt-4 space-y-4">
            {AREAS.map((a) => {
              const n = a.lessons.filter((l) => done.has(l.id)).length;
              return <div key={a.id}><div className="flex justify-between text-sm"><span>{a.title}</span><span>{n}/{a.lessons.length}</span></div><Progress value={(n / a.lessons.length) * 100} className="mt-1.5" /></div>;
            })}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Strongest topics</h2>
          {acc.length ? <ul className="mt-3 space-y-2 text-sm">{acc.slice(0, 3).map((a) => <li key={a.topic} className="flex justify-between"><span>{areaTitle(a.topic)}</span><span className="font-semibold text-success">{a.pct}%</span></li>)}</ul>
            : <p className="mt-3 text-sm text-muted-foreground">Take topic-specific quizzes to see your strengths.</p>}
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Recommended to revise next</h2>
          {att.length < 2 ? <p className="mt-3 text-sm text-muted-foreground">Complete at least 2 quizzes to get recommendations.</p>
            : revise.length ? <ul className="mt-3 space-y-2">{revise.map((t) => <li key={t}><Link to="/learn/$areaId" params={{ areaId: t }} className="text-sm font-medium text-primary hover:underline">{areaTitle(t)} →</Link></li>)}</ul>
            : <p className="mt-3 text-sm text-muted-foreground">You're scoring 70%+ everywhere you've practised. 🎉</p>}
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="font-semibold">Recent activity</h2>
        {activity.data?.length ? <ul className="mt-3 divide-y text-sm">{activity.data.map((a) => <li key={a.id} className="flex justify-between py-2"><span>{a.label}</span><span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span></li>)}</ul>
          : <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>}
      </div>
    </div>
  );
}

function Card({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-bold">{value}</p>{children}</div>;
}
