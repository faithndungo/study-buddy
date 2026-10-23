import { describe, expect, it } from "vitest";
import { averageScore, needsRevision } from "./scoring";

describe("scoring", () => {
  it("averages scores across attempts by questions answered", () => {
    expect(averageScore([{ topic: "all", score: 3, total: 5 }, { topic: "all", score: 5, total: 5 }])).toBe(80);
  });
  it("does not recommend revision with fewer than 2 attempts", () => {
    expect(needsRevision([{ topic: "governance", score: 0, total: 5 }])).toEqual([]);
  });
  it("flags areas under 70% once enough history exists", () => {
    expect(
      needsRevision([
        { topic: "governance", score: 1, total: 5 },
        { topic: "architecture", score: 5, total: 5 },
      ]),
    ).toEqual(["governance"]);
  });
});
