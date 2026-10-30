/** Titles for the four fixed Lecture 10 investigations. Question prompts carry the shared context. */
export const lecture10Scenarios = [
  { id: "l10-mystery-1", title: "The False Boundary", order: 1 },
  { id: "l10-mystery-2", title: "The Vanishing Frames", order: 2 },
  { id: "l10-mystery-3", title: "The Misread Conversation", order: 3 },
  { id: "l10-mystery-4", title: "The Silent High-Speed Link", order: 4 },
] as const;

export function scenarioFor(tags: readonly string[] | undefined) {
  const tag = tags?.find((item) => item.startsWith("scenario:"));
  return lecture10Scenarios.find(
    (scenario) => tag === `scenario:${scenario.id}`,
  );
}
