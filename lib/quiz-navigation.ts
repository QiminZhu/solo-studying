/** Shared destinations keep lecture navigation independent of stored quiz and attempt IDs. */
export const lectureFolders = [
  {
    id: "lecture-9",
    title: "Lecture 9",
    subjectHref: "/subjects/itcs217",
    href: "/subjects/itcs217/lectures/lecture-9",
    bankId: "itcs217-lecture-09-progressive",
    summary:
      "Quiz collection, original test questions, and your saved quizzes.",
  },
  {
    id: "lecture-10",
    title: "Lecture 10",
    subjectHref: "/subjects/itcs217",
    href: "/subjects/itcs217/lectures/lecture-10",
    bankId: "itcs217-lecture-10-dragon",
    summary: "Four curated quizzes on flow control and error control.",
  },
] as const;

/** Existing guest entry points stay on Lecture 9. */
export const lectureFolder = lectureFolders[0];

export function lectureFolderForBank(bankId: string) {
  return (
    lectureFolders.find((folder) => folder.bankId === bankId) ?? lectureFolder
  );
}
