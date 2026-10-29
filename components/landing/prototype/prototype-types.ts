export const landingVariants = [
  { key: "A", name: "Subject atlas", focus: "Directory-first discovery" },
  {
    key: "B",
    name: "Study workspace",
    focus: "Mode comparison and topic selection",
  },
  {
    key: "C",
    name: "Guided journey",
    focus: "A sequential path from practice to insight",
  },
] as const;

export type LandingVariant = (typeof landingVariants)[number]["key"];
export type LandingPrototypeView = LandingVariant | "original";
