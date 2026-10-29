import { AcademicDashboard } from "@/components/academic-dashboard";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  if (!user)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f7f1] p-6 text-stone-900">
        <div className="max-w-md rounded-3xl border border-stone-200 bg-white p-8">
          <h1 className="text-3xl font-semibold">Your study sets</h1>
          <p className="mt-4 text-stone-500">
            Sign in to open your study sets and learning materials.
          </p>
          <a
            href="/signin-with-chatgpt?return_to=%2Fdashboard"
            target="_top"
            className="primary-button mt-6"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  return <AcademicDashboard startInCourses />;
}
