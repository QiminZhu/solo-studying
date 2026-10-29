import { redirect } from "next/navigation";
import { lectureFolder } from "@/lib/quiz-navigation";

/** Preserve bookmarks while quiz selection lives in its lecture folder. */
export default function QuizzesPage() {
  redirect(lectureFolder.href);
}
