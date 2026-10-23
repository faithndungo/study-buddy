import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, BookOpen, ListChecks, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer, Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Study Buddy — Learn Azure AZ-900 in simple terms" },
      { name: "description", content: "An AI tutor that explains Microsoft Azure simply, with quizzes, flashcards and progress tracking for AZ-900." },
      { property: "og:title", content: "AI Study Buddy — Learn Azure AZ-900 in simple terms" },
      { property: "og:description", content: "AI explanations, practice quizzes and flashcards for the Azure Fundamentals exam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Bot, title: "AI tutor", text: "Plain-language explanations, real-life examples and analogies." },
  { icon: BookOpen, title: "Structured lessons", text: "Follows the AZ-900 skills outline, area by area." },
  { icon: ListChecks, title: "Practice quizzes", text: "Instant feedback explaining right and wrong answers." },
  { icon: Layers, title: "Flashcards", text: "Quick revision of key Azure terms." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Button asChild variant="outline">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <section className="animate-fade-up max-w-3xl">
          <span className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-semibold text-accent-foreground shadow-card">
            Microsoft Azure Fundamentals · AZ-900
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
            Understand Azure in <span className="text-brand">simpler terms.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Learn at your own pace with an AI study buddy that explains cloud concepts like a friend would — then test yourself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="lg">
              <Link to="/auth">Start learning free</Link>
            </Button>
          </div>
        </section>
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card-lift rounded-2xl border bg-card p-5 shadow-card">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
        <Disclaimer className="mt-12" />
      </main>
    </div>
  );
}
