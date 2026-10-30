/** Throwaway runner preview. Not the quiz, and not saved. */
export const runnerVariants = [
  {
    key: "A",
    name: "Reading column",
    focus: "Title 20px · question 24px · answers 16px · 720px column",
  },
  {
    key: "B",
    name: "Question first",
    focus: "Question is the 32px title · number strip · actions under the options",
  },
  {
    key: "C",
    name: "Split desk",
    focus: "Options on the left · explanation and map on the right",
  },
] as const;

export type RunnerVariant = (typeof runnerVariants)[number]["key"];
export type RunnerPrototypeView = RunnerVariant | "original";
