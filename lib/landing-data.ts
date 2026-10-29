export type PreviewQuestion = {
  id: string;
  topic: string;
  type: "single" | "multiple" | "boolean";
  prompt: string;
  answers: readonly string[];
  correct: readonly number[];
  explanation: string;
};

export const previewQuestions: readonly PreviewQuestion[] = [
  {
    id: "cell-atp",
    topic: "Cell biology",
    type: "single",
    prompt: "Which organelle produces most of a cell’s ATP?",
    answers: ["Nucleus", "Mitochondrion", "Ribosome", "Golgi apparatus"],
    correct: [1],
    explanation:
      "Mitochondria produce most ATP in a typical aerobic eukaryotic cell through oxidative phosphorylation. ATP stores energy that powers cellular processes.",
  },
  {
    id: "cell-structures",
    topic: "Cell biology",
    type: "multiple",
    prompt: "Which structures occur in both plant and animal cells?",
    answers: ["Cell membrane", "Chloroplast", "Mitochondrion", "Cell wall"],
    correct: [0, 2],
    explanation:
      "Plant and animal cells both have a cell membrane and mitochondria. Chloroplasts and cellulose cell walls are characteristic of plant cells, not animal cells.",
  },
  {
    id: "dna-pairing",
    topic: "Genetics",
    type: "boolean",
    prompt: "In double-stranded DNA, adenine pairs with thymine.",
    answers: ["True", "False"],
    correct: [0],
    explanation:
      "Adenine pairs with thymine through two hydrogen bonds. Guanine pairs with cytosine through three hydrogen bonds, helping maintain DNA’s double-helix structure.",
  },
];

export function isPreviewAnswerCorrect(
  question: PreviewQuestion,
  selected: readonly number[],
) {
  return (
    selected.length === question.correct.length &&
    question.correct.every((answer) => selected.includes(answer))
  );
}

export const subjectLibrary = [
  {
    name: "Mathematics",
    category: "Mathematics",
    theme: "math",
    description: "Find the logic. Connect the dots.",
    topics: ["Algebra", "Calculus", "Geometry", "Statistics"],
  },
  {
    name: "Biology",
    category: "Science",
    theme: "biology",
    description: "Get curious about the living world.",
    topics: ["Cell biology", "Genetics", "Ecology", "Human physiology"],
  },
  {
    name: "Physics",
    category: "Science",
    theme: "physics",
    description: "Make sense of how things work.",
    topics: ["Mechanics", "Electricity", "Waves", "Thermodynamics"],
  },
  {
    name: "Computer Science",
    category: "Technology",
    theme: "computing",
    description: "Build a better way to think.",
    topics: ["Algorithms", "Data structures", "Networks", "Databases"],
  },
  {
    name: "Chemistry",
    category: "Science",
    theme: "chemistry",
    description: "Explore what everything is made of.",
    topics: ["Atomic structure", "Bonding", "Reactions", "Organic chemistry"],
  },
  {
    name: "English",
    category: "Humanities",
    theme: "english",
    description: "Understand more. Express it clearly.",
    topics: ["Grammar", "Literature", "Comprehension", "Composition"],
  },
] as const;

export const sampleTopicResults = [
  { topic: "Cell biology", correct: 5, total: 5 },
  { topic: "Genetics", correct: 4, total: 5 },
  { topic: "Ecology", correct: 4, total: 5 },
  { topic: "Human physiology", correct: 3, total: 5 },
] as const;
