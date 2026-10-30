export const previewChoices = [
  "The remote destination host itself",
  "The host’s configured default gateway on its local network",
  "Any DNS server listed in its configuration",
  "Every router on the complete path simultaneously",
] as const;

export const previewCorrectIndex = 1;

export const previewExplanation =
  "The first local frame goes to the local gateway. The datagram can still name the remote IP destination.";

export type PreviewPhase = "answering" | "wrong" | "correct";
export type FirstCheck = "unrecorded" | "correct" | "incorrect";

export type PreviewModel = {
  selected: number | null;
  phase: PreviewPhase;
  explanationOpen: boolean;
  firstCheck: FirstCheck;
  movedOn: boolean;
};

export const initialPreview: PreviewModel = {
  selected: null,
  phase: "answering",
  explanationOpen: false,
  firstCheck: "unrecorded",
  movedOn: false,
};

export type PreviewAction =
  | { type: "select"; index: number }
  | { type: "check" }
  | { type: "try-again" }
  | { type: "toggle-explanation" }
  | { type: "next" }
  | { type: "jump"; state: PreviewModel };

export const previewSteps: { id: string; label: string; state: PreviewModel }[] =
  [
    { id: "default", label: "Before a choice", state: initialPreview },
    {
      id: "selected",
      label: "Choice selected",
      state: {
        selected: 0,
        phase: "answering",
        explanationOpen: false,
        firstCheck: "unrecorded",
        movedOn: false,
      },
    },
    {
      id: "wrong",
      label: "Wrong check",
      state: {
        selected: 0,
        phase: "wrong",
        explanationOpen: false,
        firstCheck: "incorrect",
        movedOn: false,
      },
    },
    {
      id: "explanation",
      label: "Explanation",
      state: {
        selected: 0,
        phase: "wrong",
        explanationOpen: true,
        firstCheck: "incorrect",
        movedOn: false,
      },
    },
    {
      id: "correct",
      label: "Right check",
      state: {
        selected: previewCorrectIndex,
        phase: "correct",
        explanationOpen: false,
        firstCheck: "correct",
        movedOn: false,
      },
    },
  ];

export function reducePreview(
  state: PreviewModel,
  action: PreviewAction,
): PreviewModel {
  switch (action.type) {
    case "jump":
      return action.state;
    case "select": {
      if (state.phase === "correct" || state.movedOn) return state;
      if (action.index < 0 || action.index >= previewChoices.length) return state;
      return {
        ...state,
        selected: action.index,
        phase: "answering",
        explanationOpen: false,
      };
    }
    case "check": {
      if (state.phase !== "answering" || state.selected === null) return state;
      const correct = state.selected === previewCorrectIndex;
      return {
        ...state,
        phase: correct ? "correct" : "wrong",
        explanationOpen: false,
        firstCheck:
          state.firstCheck === "unrecorded"
            ? correct
              ? "correct"
              : "incorrect"
            : state.firstCheck,
      };
    }
    case "try-again":
      if (state.phase !== "wrong") return state;
      return { ...state, phase: "answering", explanationOpen: false };
    case "toggle-explanation":
      if (state.phase === "answering") return state;
      return { ...state, explanationOpen: !state.explanationOpen };
    case "next":
      if (state.phase !== "correct") return state;
      return { ...state, movedOn: true, explanationOpen: false };
  }
}
