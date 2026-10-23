import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    const { data: u } = await supabase.auth.getUser();
    return { ...data, email: u.user?.email ?? "" };
  },
});

export const lessonsQuery = queryOptions({
  queryKey: ["lessons"],
  queryFn: async () => {
    const { data, error } = await supabase.from("lesson_progress").select("lesson_id, completed_at");
    if (error) throw error;
    return data;
  },
});

export const attemptsQuery = queryOptions({
  queryKey: ["attempts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("id, topic, difficulty, score, total, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const cardsQuery = queryOptions({
  queryKey: ["cards"],
  queryFn: async () => {
    const { data, error } = await supabase.from("flashcard_progress").select("card_id, status");
    if (error) throw error;
    return data;
  },
});

export const activityQuery = queryOptions({
  queryKey: ["activity"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("learning_activity")
      .select("id, kind, label, created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data;
  },
});

export const threadsQuery = queryOptions({
  queryKey: ["threads"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export async function logActivity(kind: string, label: string) {
  const id = await uid();
  await supabase.from("learning_activity").insert({ user_id: id, kind, label });
}

export async function createThread(title = "New chat") {
  const id = await uid();
  const { data, error } = await supabase.from("chat_threads").insert({ user_id: id, title }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function setLessonDone(lessonId: string, done: boolean, title: string) {
  const id = await uid();
  if (done) {
    const { error } = await supabase.from("lesson_progress").upsert({ user_id: id, lesson_id: lessonId });
    if (error) throw error;
    await logActivity("lesson", `Completed lesson: ${title}`);
  } else {
    const { error } = await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId);
    if (error) throw error;
  }
}

export async function saveAttempt(a: { topic: string; difficulty: string; score: number; total: number; answers: unknown }) {
  const id = await uid();
  const { error } = await supabase.from("quiz_attempts").insert({ user_id: id, ...a, answers: a.answers as never });
  if (error) throw error;
  await logActivity("quiz", `Quiz scored ${a.score}/${a.total}`);
}

export async function setCardStatus(cardId: string, status: "understood" | "revise") {
  const id = await uid();
  const { error } = await supabase
    .from("flashcard_progress")
    .upsert({ user_id: id, card_id: cardId, status, updated_at: new Date().toISOString() });
  if (error) throw error;
}
