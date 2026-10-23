import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bot, ListChecks, ArrowRight, Target, Activity, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BuddyMark } from "@/components/Logo";
import { AREAS, ALL_LESSONS } from "@/lib/content";
import { activityQuery, attemptsQuery, lessonsQuery, profileQuery } from "@/lib/data";
import { averageScore } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AI Study Buddy" }, { name: "description", content: "Your AZ-900 study dashboard." }] }),
  component: Dashboard,
});

const DEMO = { topics: 4, quizzes: 3, avg: 72 };

function Dashboard() {
  const profile = useQuery(profileQuery);
  const lessons = useQuery(lessonsQuery);
  const attempts = useQuery(attemptsQuery);
  const activity = useQuery(activityQuery);

  const done = new Set((lessons.data ?? []).map((l) => l.lesson_id));
  const hasReal = done.size > 0 || (attempts.data?.length ?? 0) > 0;
  const stats = hasReal
    ? { topics: done.size, quizzes: attempts.data!.length, avg: averageScore(attempts.data ?? []) }
    : DEMO;
  const next = ALL_LESSONS.find((l) => !done.has(l.id)) ?? ALL_LESSONS[0]!;
  const today = (activity.data ?? []).filter((a) => new Date(a.created_at).toDateString() === new Date().toDateString()).length;
  const goal = 3;

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-primary-foreground shadow-glow md:p-8">
        <p className="text-sm opacity-90">Hi {profile.data?.display_name ?? "there"} 👋</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Welcome to AI Study Buddy</h1>
        <p className="mt-2 max-w-xl opacity-90">
          Understand Microsoft Azure in simpler terms. Learn at your own pace and prepare confidently for AZ-900.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="lg"><Link to="/chat"><Bot /> Ask AI Study Buddy</Link></Button>
          <Button asChild variant="outline" size="lg" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/quiz"><ListChecks /> Start Practice Quiz</Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold">Your stats</h2>
          {!hasReal && <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-foreground">Demonstration data</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Lessons completed" value={`${stats.topics}/${ALL_LESSONS.length}`} />
          <Stat label="Quizzes attempted" value={String(stats.quizzes)} />
          <Stat label="Average quiz score" value={`${stats.avg}%`} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link to="/chat" className="card-lift rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-start gap-4">
            <BuddyMark size={48} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Chat with your AI Study Buddy</h3>
              <p className="mt-1 text-sm text-muted-foreground">Ask anything about Azure — get a simple definition, real-life example, analogy and a practice question.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["What is cloud computing?", "IaaS vs PaaS vs SaaS", "Explain Azure VMs"].map((p) => (
                  <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-violet" /><h3 className="font-semibold">Daily goal</h3></div>
          <p className="mt-3 text-3xl font-bold">{Math.min(today, goal)}<span className="text-base text-muted-foreground">/{goal} activities</span></p>
          <Progress value={(Math.min(today, goal) / goal) * 100} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">Complete lessons or quizzes to reach today's goal.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Continue learning</h3>
          <p className="mt-3 text-sm text-muted-foreground">Next up</p>
          <p className="font-semibold">{next.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{next.summary}</p>
          <Button asChild variant="link" className="mt-2 px-0">
            <Link to="/learn/$areaId" params={{ areaId: next.areaId }}>Open lesson <ArrowRight /></Link>
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Learning progress</h3>
          <div className="mt-4 space-y-4">
            {AREAS.map((a) => {
              const n = a.lessons.filter((l) => done.has(l.id)).length;
              return (
                <div key={a.id}>
                  <div className="flex justify-between text-sm"><span>{a.title}</span><span className="text-muted-foreground">{n}/{a.lessons.length}</span></div>
                  <Progress value={(n / a.lessons.length) * 100} className="mt-1.5" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /><h3 className="font-semibold">Recent activity</h3></div>
          {activity.data?.length ? (
            <ul className="mt-3 space-y-2.5 text-sm">
              {activity.data.slice(0, 5).map((a) => (
                <li key={a.id} className="flex justify-between gap-2"><span>{a.label}</span><span className="shrink-0 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span></li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No activity yet — finish a lesson or quiz and it'll show here.</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Azure topics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {AREAS.map((a) => (
            <Link key={a.id} to="/learn/$areaId" params={{ areaId: a.id }} className="card-lift rounded-2xl border bg-card p-5 shadow-card">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.blurb}</p>
              <p className="mt-3 text-xs font-semibold text-accent-foreground">Exam weight {a.weight}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
