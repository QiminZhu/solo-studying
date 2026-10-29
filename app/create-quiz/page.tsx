import { redirect } from "next/navigation";
import { lectureFolder } from "@/lib/quiz-navigation";

/** Keep earlier links working while the custom quiz builder is on hold. */
export default function CreateQuizPage() {
  redirect(lectureFolder.href);
}
