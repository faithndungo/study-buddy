import type { AreaId } from "./content";

export interface AttemptLike {
  topic: string;
  score: number;
  total: number;
}

export function percent(score: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function averageScore(attempts: AttemptLike[]) {
  const total = attempts.reduce((s, a) => s + a.total, 0);
  const score = attempts.reduce((s, a) => s + a.score, 0);
  return percent(score, total);
}

/** Per-area accuracy from attempts. Attempts with topic "all" are ignored here. */
export function areaAccuracy(attempts: AttemptLike[]) {
  const map = new Map<string, { score: number; total: number }>();
  for (const a of attempts) {
    if (a.topic === "all") continue;
    const m = map.get(a.topic) ?? { score: 0, total: 0 };
    m.score += a.score;
    m.total += a.total;
    map.set(a.topic, m);
  }
  return [...map.entries()].map(([topic, v]) => ({ topic: topic as AreaId, pct: percent(v.score, v.total), total: v.total }));
}

/** Recommend revision only once there's enough history: at least 2 attempts. Areas under 70% need revision. */
export function needsRevision(attempts: AttemptLike[]) {
  if (attempts.length < 2) return [];
  return areaAccuracy(attempts)
    .filter((a) => a.pct < 70)
    .sort((a, b) => a.pct - b.pct)
    .map((a) => a.topic);
}
