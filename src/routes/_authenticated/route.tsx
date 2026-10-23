import { createFileRoute, redirect, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, Bot, BookOpen, ListChecks, Layers, LineChart, Settings, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Disclaimer, Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppShell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Study Buddy", icon: Bot },
  { to: "/learn", label: "Learn Azure", icon: BookOpen },
  { to: "/quiz", label: "Practice Quizzes", icon: ListChecks },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/progress", label: "My Progress", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppShell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((n) => {
        const active = pathname === n.to || pathname.startsWith(n.to + "/");
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted",
            )}
          >
            <n.icon className={cn("h-4.5 w-4.5", active && "text-primary")} />
            {n.label}
          </Link>
        );
      })}
      <button
        onClick={signOut}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <LogOut className="h-4.5 w-4.5" /> Sign out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 border-r bg-sidebar p-5 lg:flex">
        <Link to="/dashboard"><Logo /></Link>
        {nav}
        <Disclaimer />
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard"><Logo /></Link>
        <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-muted">
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[61px] z-20 flex flex-col gap-4 border-b bg-card p-4 shadow-card lg:hidden">
          {nav}
        </div>
      )}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
