"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Bell, BookOpen, Bot, CalendarDays, Check,
  CheckCircle2, ChevronDown, Clock3, FileText, GraduationCap,
  LayoutDashboard, Lightbulb, ListChecks, Menu, MoreHorizontal,
  Paperclip, Search, Send, Settings, Sparkles, Target,
  Upload, X, Zap,
} from "lucide-react";
import {
  demoQuestion, gradeSingleChoice, masteryStatus, nextReviewDate,
  updateMastery, type Confidence,
} from "@/lib/adaptive-question-bank";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { StudyLibrary } from "@/components/study-library";

type View = "dashboard" | "courses" | "study" | "bank" | "insights" | "materials";

const navigation: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Today", icon: LayoutDashboard },
  { id: "courses", label: "Study Sets", icon: BookOpen },
  { id: "study", label: "Study", icon: GraduationCap },
  { id: "bank", label: "Question bank", icon: ListChecks },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

const courses = [
  { code: "CS 204", name: "Data Structures", color: "#10a37f", progress: 68, next: "Trees & traversal" },
  { code: "MATH 218", name: "Linear Algebra", color: "#d9784b", progress: 51, next: "Eigenvalues" },
  { code: "STAT 201", name: "Probability", color: "#2c8b73", progress: 76, next: "Bayes' theorem" },
];

const initialTasks = [
  { id: 1, title: "Complete AVL tree exercises", course: "CS 204", due: "Today · 6:00 PM", done: false, priority: "high" },
  { id: 2, title: "Review eigenvector lecture", course: "MATH 218", due: "Today · 8:30 PM", done: false, priority: "medium" },
  { id: 3, title: "Submit probability worksheet", course: "STAT 201", due: "Tomorrow · 11:59 PM", done: true, priority: "normal" },
];

const topics = [
  { name: "Binary search trees", course: "CS 204", score: 82, trend: "+8%", color: "bg-emerald-500" },
  { name: "Matrix transformations", course: "MATH 218", score: 61, trend: "+3%", color: "bg-amber-500" },
  { name: "Conditional probability", course: "STAT 201", score: 74, trend: "+5%", color: "bg-emerald-500" },
  { name: "Eigenvalues", course: "MATH 218", score: 38, trend: "Review", color: "bg-rose-500" },
];

export function AcademicDashboard({ startInCourses = false }: { startInCourses?: boolean }) {
  const [view, setView] = useState<View>(startInCourses ? "courses" : "dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [studyOpen, setStudyOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [confidence, setConfidence] = useState<Confidence>("medium");
  const [hintUsed, setHintUsed] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof gradeSingleChoice> | null>(null);
  const [mastery, setMastery] = useState(0.68);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I’m grounded in your Data Structures lecture. What would you like to unpack?" },
  ]);

  const completed = tasks.filter((task) => task.done).length;
  const todayProgress = Math.round((completed / tasks.length) * 100);

  const activeContent = useMemo(() => {
    if (view === "materials" || view === "courses") return <StudyLibrary />;
    if (view === "study") return <StudyView onStart={() => setStudyOpen(true)} />;
    if (view === "bank") return <QuestionBankView onStart={() => setStudyOpen(true)} />;
    if (view === "insights") return <InsightsView />;
    return <DashboardView tasks={tasks} todayProgress={todayProgress}
      onToggleTask={(id) => setTasks((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item))}
      onStudy={() => setStudyOpen(true)} onUpload={() => setView("courses")} />;
  }, [view, tasks, todayProgress]);

  function submitAnswer() {
    if (!selectedAnswer || result) return;
    const graded = gradeSingleChoice(demoQuestion, selectedAnswer);
    setResult(graded);
    setMastery((current) => updateMastery(current, graded.score, hintUsed));
  }

  function nextQuestion() {
    setSelectedAnswer(""); setHintUsed(false); setResult(null);
  }

  function sendMessage() {
    const message = chatInput.trim();
    if (!message) return;
    setMessages((items) => [...items, { role: "user", text: message }, {
      role: "assistant",
      text: "Think of the tree as a set of ordering promises. At each node, smaller values live to the left and larger values to the right. Which part of that promise makes searching efficient?",
    }]);
    setChatInput("");
  }

  return (
    <div className="app-shell min-h-screen bg-[#f6f7fb] text-[#18202d] dark:bg-[#171717] dark:text-[#ececec]">
      <aside className={`app-sidebar fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#e5e5e5] bg-[#f9f9f9] px-4 py-5 text-[#2d2d2d] transition-transform dark:border-[#303030] dark:bg-[#171717] dark:text-[#ececec] lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <button onClick={() => setView("dashboard")} className="flex items-center gap-3 text-left">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#19c39b] to-[#0d8f70] text-white shadow-sm"><Sparkles className="size-5" /></span>
            <span><strong className="block text-[15px] tracking-tight">Solo Studying</strong><span className="text-xs text-[#6f6f6f] dark:text-[#9b9b9b]">Academic command center</span></span>
          </button>
          <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X className="size-5" /></button>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => { const Icon = item.icon; return (
            <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${view === item.id ? "bg-[#ececec] font-medium text-[#212121] dark:bg-[#2f2f2f] dark:text-white" : "text-[#6f6f6f] hover:bg-[#ececec] hover:text-[#212121] dark:text-[#9b9b9b] dark:hover:bg-[#2f2f2f] dark:hover:text-white"}`}>
              <Icon className="size-[18px]" />{item.label}
              {item.id === "study" && <span className="ml-auto rounded-full bg-[#10a37f] px-2 py-0.5 text-[10px] font-semibold text-white">4 due</span>}
            </button> ); })}
        </nav>

        <div className="mt-8 px-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e8e8e]">Active term</p><button className="mt-3 flex w-full items-center justify-between text-left text-sm text-[#444] dark:text-[#cdcdcd]">Fall 2026 <ChevronDown className="size-4" /></button></div>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[#e5e5e5] bg-white p-3.5 dark:border-[#383838] dark:bg-[#212121]">
          <div className="flex items-center justify-between text-xs"><span className="text-[#6f6f6f] dark:text-[#9b9b9b]">Weekly focus</span><span className="font-semibold text-[#087f64] dark:text-[#5ee0bd]">7.5 / 10h</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ececec] dark:bg-[#3b3b3b]"><div className="h-full w-3/4 rounded-full bg-[#10a37f]" /></div>
          <button className="mt-4 flex items-center gap-2 text-xs text-[#6f6f6f] hover:text-[#212121] dark:text-[#9b9b9b] dark:hover:text-white"><Settings className="size-4" /> Preferences</button>
        </div>
      </aside>
      {mobileNav && <button className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu overlay" />}

      <div className="lg:pl-[248px]">
        <header className="app-header sticky top-0 z-20 flex h-[72px] items-center border-b border-[#e5e8ef] bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <button onClick={() => setMobileNav(true)} className="mr-3 rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
          <div className="relative hidden w-full max-w-md sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-xl border border-slate-200 bg-[#f8f9fc] pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Search courses, topics, assignments…" /></div>
          <div className="ml-auto flex items-center gap-2"><ThemeSwitcher /><button className="surface-hover relative rounded-xl p-2.5 text-slate-500 dark:text-[#b4b4b4]" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#212121]" /></button><button className="surface-hover ml-1 flex items-center gap-2 rounded-xl p-1.5 pr-2"><span className="grid size-8 place-items-center rounded-xl bg-[#e8f8f3] text-xs font-bold text-[#10a37f] dark:bg-[#123d32]">AS</span><span className="hidden text-left sm:block"><span className="block text-xs font-semibold">Anker</span><span className="block text-[10px] text-slate-500 dark:text-[#9b9b9b]">Student</span></span><ChevronDown className="size-3.5 text-slate-400" /></button></div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 lg:px-10 lg:py-8">{(view === "study" || view === "bank") && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950"><p>Study your uploaded sources using accepted concepts and source-linked recall prompts.</p><button className="secondary-button" onClick={() => { setView("courses"); }}>Open your study sets <ArrowRight className="size-4" /></button></div>}{activeContent}</main>
      </div>

      {studyOpen && <StudyPanel selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} confidence={confidence} setConfidence={setConfidence} hintUsed={hintUsed} setHintUsed={setHintUsed} result={result} mastery={mastery} onSubmit={submitAnswer} onNext={nextQuestion} onClose={() => setStudyOpen(false)} messages={messages} chatInput={chatInput} setChatInput={setChatInput} onSend={sendMessage} />}
    </div>
  );
}

function DashboardView({ tasks, todayProgress, onToggleTask, onStudy, onUpload }: { tasks: typeof initialTasks; todayProgress: number; onToggleTask: (id: number) => void; onStudy: () => void; onUpload: () => void }) {
  const progressAreas = [
    { label: "Lectures", detail: "19 of 27 complete", value: 70, icon: BookOpen, tone: "bg-[#e7f5ef] text-[#087f64] dark:bg-[#123d32] dark:text-[#5ee0bd]" },
    { label: "Assignments", detail: "7 of 10 submitted", value: 70, icon: FileText, tone: "bg-[#eef2ff] text-[#5b62c9] dark:bg-[#292b46] dark:text-[#aeb4ff]" },
    { label: "Projects", detail: "2 active milestones", value: 46, icon: Target, tone: "bg-[#fff1e8] text-[#b85f31] dark:bg-[#42291d] dark:text-[#f2aa82]" },
    { label: "Mastery", detail: "Across 24 topics", value: 64, icon: Sparkles, tone: "bg-[#f4edff] text-[#7957b6] dark:bg-[#352846] dark:text-[#cbb0f4]" },
  ];
  const masteryRows = [
    { topic: "Binary trees", course: "CS 204", values: [86, 80, 72] },
    { topic: "Transformations", course: "MATH 218", values: [78, 61, 55] },
    { topic: "Bayes’ theorem", course: "STAT 201", values: [82, 74, 68] },
    { topic: "Eigenvalues", course: "MATH 218", values: [54, 38, 31] },
  ];

  return <div className="mx-auto max-w-[1180px]">
    <section className="px-1 pb-8 pt-3 text-center sm:pb-10 sm:pt-6">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f5ef] text-[#10a37f] dark:bg-[#123d32] dark:text-[#5ee0bd]"><Sparkles className="size-5" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#787878] dark:text-[#9b9b9b]">Thursday, October 22</p>
      <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-[#202123] dark:text-[#f1f1f1] sm:text-[40px] sm:leading-[1.12]">What should we focus on today?</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6f6f6f] dark:text-[#b4b4b4]">Your academic work is moving. One focused review and two small wins will keep the week on track.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={onStudy} className="primary-button"><Zap className="size-4" /> Start focused study</button><button onClick={onUpload} className="secondary-button"><Upload className="size-4" /> Add material</button></div>
    </section>

    <section className="rounded-[24px] border border-[#e5e5e5] bg-white px-5 py-5 dark:border-[#383838] dark:bg-[#212121] sm:px-7 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold text-[#10a37f]">A quick read on your week</p><h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">You’re steady, with one topic asking for attention.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6f6f] dark:text-[#b4b4b4]">You completed {tasks.filter((task) => task.done).length} of {tasks.length} priority tasks. Eigenvalues remains the clearest opportunity to turn study time into a stronger result.</p></div>
        <div className="grid shrink-0 grid-cols-3 gap-5 border-t border-[#ececec] pt-5 text-left dark:border-[#383838] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"><QuickStat value={`${todayProgress}%`} label="Today" /><QuickStat value="12" label="Day streak" /><QuickStat value="3.72" label="GPA" /></div>
      </div>
    </section>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {progressAreas.map(({ label, detail, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-[#e5e5e5] bg-white p-5 dark:border-[#383838] dark:bg-[#212121]"><div className="flex items-start justify-between"><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-[17px]" /></span><strong className="text-sm font-semibold">{value}%</strong></div><h3 className="mt-5 text-sm font-semibold">{label}</h3><p className="mt-1 text-xs text-[#818181] dark:text-[#9b9b9b]">{detail}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ededed] dark:bg-[#3b3b3b]"><div className="h-full rounded-full bg-[#10a37f]" style={{ width: `${value}%` }} /></div></div>)}
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <div className="rounded-[24px] border border-[#e5e5e5] bg-white p-5 dark:border-[#383838] dark:bg-[#212121] sm:p-6">
        <div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#10a37f]">Priority queue</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight">What deserves attention next</h2></div><button className="text-xs font-medium text-[#6f6f6f] hover:text-[#202123] dark:text-[#9b9b9b] dark:hover:text-white">Calendar</button></div>
        <div className="mt-5 divide-y divide-[#ececec] dark:divide-[#383838]">{tasks.map((task, index) => <div key={task.id} className="group flex items-center gap-3 py-4 first:pt-1 last:pb-1"><button onClick={() => onToggleTask(task.id)} className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${task.done ? "border-[#10a37f] bg-[#10a37f] text-white" : "border-[#b7b7b7] hover:border-[#10a37f] dark:border-[#666]"}`} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>{task.done && <Check className="size-3.5" />}</button><span className="w-5 text-center text-[11px] font-semibold text-[#9b9b9b]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className={`truncate text-sm font-medium ${task.done ? "text-[#9b9b9b] line-through" : ""}`}>{task.title}</p><p className="mt-1 text-[11px] text-[#818181] dark:text-[#9b9b9b]">{task.course} · {task.due}</p></div>{task.priority === "high" && !task.done && <span className="rounded-full bg-[#fff0ed] px-2 py-1 text-[10px] font-semibold text-[#b84d3c] dark:bg-[#48251f] dark:text-[#f2a092]">Do first</span>}<ArrowRight className="size-4 text-[#aaa] opacity-0 transition group-hover:opacity-100" /></div>)}</div>
        <button onClick={onStudy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4f4f4] px-4 py-3 text-sm font-semibold transition hover:bg-[#ececec] dark:bg-[#2f2f2f] dark:hover:bg-[#383838]">Review eigenvalues for 12 minutes <ArrowRight className="size-4" /></button>
      </div>

      <div className="rounded-[24px] border border-[#e5e5e5] bg-white p-5 dark:border-[#383838] dark:bg-[#212121] sm:p-6">
        <div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#10a37f]">Mastery matrix</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight">Where knowledge is holding</h2></div><span className="rounded-full bg-[#f4f4f4] px-2.5 py-1 text-[10px] font-medium text-[#6f6f6f] dark:bg-[#2f2f2f] dark:text-[#b4b4b4]">Independent evidence</span></div>
        <div className="mt-5 overflow-x-auto"><div className="min-w-[510px]"><div className="grid grid-cols-[1.5fr_repeat(3,.55fr)] gap-2 border-b border-[#ececec] pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8e8e8e] dark:border-[#383838]"><span>Topic</span><span className="text-center">Recall</span><span className="text-center">Apply</span><span className="text-center">Transfer</span></div>{masteryRows.map((row) => <div key={row.topic} className="grid grid-cols-[1.5fr_repeat(3,.55fr)] items-center gap-2 border-b border-[#f0f0f0] py-3.5 last:border-0 dark:border-[#333]"><div><p className="text-sm font-medium">{row.topic}</p><p className="mt-0.5 text-[10px] text-[#8e8e8e]">{row.course}</p></div>{row.values.map((value, index) => <div key={index} className={`mx-auto grid size-9 place-items-center rounded-lg text-[11px] font-semibold ${value >= 75 ? "bg-[#e7f5ef] text-[#087f64] dark:bg-[#123d32] dark:text-[#5ee0bd]" : value >= 55 ? "bg-[#fff5df] text-[#9a651f] dark:bg-[#40331e] dark:text-[#e8ba70]" : "bg-[#fff0ed] text-[#b84d3c] dark:bg-[#48251f] dark:text-[#f2a092]"}`}>{value}</div>)}</div>)}</div></div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-[#818181] dark:text-[#9b9b9b]"><MatrixKey className="bg-[#e7f5ef] dark:bg-[#123d32]" label="Strong" /><MatrixKey className="bg-[#fff5df] dark:bg-[#40331e]" label="Developing" /><MatrixKey className="bg-[#fff0ed] dark:bg-[#48251f]" label="Review" /></div>
      </div>
    </section>
  </div>;
}

function QuickStat({ value, label }: { value: string; label: string }) { return <div><strong className="block text-xl font-semibold tracking-tight">{value}</strong><span className="mt-1 block whitespace-nowrap text-[10px] text-[#818181] dark:text-[#9b9b9b]">{label}</span></div>; }

function MatrixKey({ className, label }: { className: string; label: string }) { return <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${className}`} />{label}</span>; }

function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action: string }) { return <div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-bold tracking-tight">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><button className="shrink-0 text-xs font-semibold text-[#10a37f] hover:text-[#087f64]">{action}</button></div>; }


function StudyView({ onStart }: { onStart: () => void }) {
  return <div><PageHeading eyebrow="Adaptive learning" title="Study workspace" description="Practice what matters, with every answer updating an explainable learning record." action={<button onClick={onStart} className="primary-button"><Zap className="size-4" /> Start session</button>} /><div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="panel"><span className="tag">Recommended</span><h2 className="mt-4 text-xl font-bold">Eigenvalues: focused remediation</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Five varied questions will test geometric meaning, calculation, and transfer. Your recent misconception is still suspected—not confirmed.</p><div className="mt-6 grid grid-cols-3 gap-3">{[["5","questions"],["12 min","estimate"],["38%","mastery"]].map(([value,label]) => <div key={label} className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-lg">{value}</strong><span className="text-[10px] text-slate-500">{label}</span></div>)}</div><button onClick={onStart} className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-600">Begin now <ArrowRight className="size-4" /></button></div><div className="panel"><h2 className="font-bold">Review queue</h2><div className="mt-4 space-y-3">{topics.slice(1).map((topic, index) => <button key={topic.name} onClick={onStart} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-emerald-200"><span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">{index + 1}</span><span className="flex-1"><strong className="block text-sm">{topic.name}</strong><span className="text-[10px] text-slate-500">{index === 0 ? "Due now" : `Due in ${index} day${index > 1 ? "s" : ""}`}</span></span><ArrowRight className="size-4 text-slate-400" /></button>)}</div></div></div></div>;
}

function QuestionBankView({ onStart }: { onStart: () => void }) {
  const [approved, setApproved] = useState(false);
  return <div><PageHeading eyebrow="Skill-backed generator" title="Question bank" description="Validated questions across recall, concepts, application, calculation, and tracing." action={<button onClick={onStart} className="primary-button"><Sparkles className="size-4" /> Generate questions</button>} /><div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]"><div className="panel"><div className="flex items-center justify-between"><div><span className="tag">Pending approval</span><h2 className="mt-3 font-bold">Binary search · Conceptual · Medium</h2></div><FileText className="size-6 text-emerald-500" /></div><p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6">{demoQuestion.prompt}</p><div className="mt-4 space-y-2">{demoQuestion.options?.map((option) => <div key={option.id} className="flex gap-3 rounded-lg border border-slate-100 px-3 py-2 text-xs"><span className="font-bold text-slate-400">{option.id.toUpperCase()}</span>{option.label}</div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setApproved(true)} className={`rounded-xl px-4 py-2 text-sm font-bold ${approved ? "bg-emerald-50 text-emerald-700" : "bg-emerald-600 text-white"}`}>{approved ? "Approved" : "Approve question"}</button><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Edit</button><button className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-600">Reject</button></div></div><div className="space-y-4"><BankStat value="148" label="Validated questions" icon={CheckCircle2} /><BankStat value="12" label="Pending approval" icon={Clock3} /><BankStat value="5" label="Cognitive types" icon={Lightbulb} /><div className="rounded-2xl bg-[#171f30] p-5 text-white"><p className="text-xs font-semibold text-emerald-300">Generator health</p><p className="mt-2 text-2xl font-bold">96%</p><p className="mt-1 text-xs leading-5 text-slate-400">Questions passing schema and source validation.</p></div></div></div></div>;
}

function BankStat({ value, label, icon: Icon }: { value: string; label: string; icon: typeof CheckCircle2 }) { return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="size-5" /></span><div><strong className="block text-xl">{value}</strong><span className="text-xs text-slate-500">{label}</span></div></div>; }

function InsightsView() {
  return <div><PageHeading eyebrow="Evidence, not guesswork" title="Learning insights" description="See where your time produces durable understanding." /><div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="panel"><SectionHeader title="Mastery over time" subtitle="Independent evidence across all active courses" action="Last 8 weeks" /><div className="mt-8 flex h-52 items-end gap-3 border-b border-l border-slate-200 px-4">{[28,36,43,41,55,63,67,74].map((height,index) => <div key={index} className="group relative flex h-full flex-1 items-end"><div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition hover:from-emerald-700" style={{ height: `${height}%` }} /><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">W{index+1}</span></div>)}</div></div><div className="panel"><h2 className="font-bold">Mastery profile</h2><div className="mt-6 space-y-5">{[["Recall",88],["Conceptual",72],["Application",64],["Calculation",59],["Tracing",78]].map(([label,value]) => <div key={label as string}><div className="flex justify-between text-xs"><span className="font-medium">{label}</span><strong>{value}%</strong></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} /></div></div>)}</div></div></div></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">{eyebrow}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</div>; }

function StudyPanel({ selectedAnswer, setSelectedAnswer, confidence, setConfidence, hintUsed, setHintUsed, result, mastery, onSubmit, onNext, onClose, messages, chatInput, setChatInput, onSend }: { selectedAnswer: string; setSelectedAnswer: (value: string) => void; confidence: Confidence; setConfidence: (value: Confidence) => void; hintUsed: boolean; setHintUsed: (value: boolean) => void; result: ReturnType<typeof gradeSingleChoice> | null; mastery: number; onSubmit: () => void; onNext: () => void; onClose: () => void; messages: { role: string; text: string }[]; chatInput: string; setChatInput: (value: string) => void; onSend: () => void }) {
  const [mode, setMode] = useState<"practice" | "tutor">("practice");
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f5f6fa]"><header className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6"><button onClick={onClose} className="mr-3 rounded-lg p-2 hover:bg-slate-100" aria-label="Close study session"><X className="size-5" /></button><div><p className="text-xs font-bold text-emerald-600">CS 204 · Data Structures</p><p className="text-sm font-semibold">Binary search trees</p></div><div className="ml-auto flex rounded-xl bg-slate-100 p-1"><button onClick={() => setMode("practice")} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === "practice" ? "bg-white shadow-sm" : "text-slate-500"}`}>Practice</button><button onClick={() => setMode("tutor")} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === "tutor" ? "bg-white shadow-sm" : "text-slate-500"}`}>AI tutor</button></div></header>{mode === "practice" ? <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_270px] lg:py-10"><main className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"><div className="flex items-center justify-between"><div className="flex gap-2"><span className="tag">Conceptual</span><span className="tag-muted">Medium</span></div><span className="text-xs font-semibold text-slate-400">Question 2 of 5</span></div><h1 className="mt-7 max-w-2xl text-xl font-bold leading-8 sm:text-2xl">{demoQuestion.prompt}</h1><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><FileText className="size-3.5" /> Lecture 04 · {demoQuestion.source.locator}</p><div className="mt-7 space-y-3">{demoQuestion.options?.map((option) => <button key={option.id} disabled={!!result} onClick={() => setSelectedAnswer(option.id)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm transition ${selectedAnswer === option.id ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"} ${result && option.id === demoQuestion.correctAnswer ? "!border-emerald-500 !bg-emerald-50" : ""}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${selectedAnswer === option.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{option.id.toUpperCase()}</span>{option.label}</button>)}</div>{hintUsed && !result && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Hint:</strong> Think about what a comparison tells you about all values on one side of the midpoint.</div>}{result && <div className={`mt-5 rounded-xl border p-4 text-sm ${result.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}><strong>{result.isCorrect ? "Correct" : "Needs another look"}</strong><p className="mt-1 leading-6">{result.feedback}</p></div>}<div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-xs"><span className="text-slate-500">Confidence</span>{(["low","medium","high"] as Confidence[]).map((level) => <button key={level} onClick={() => setConfidence(level)} className={`rounded-lg px-2.5 py-1.5 font-semibold capitalize ${confidence === level ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}>{level}</button>)}</div><div className="ml-auto flex gap-2">{!result && <button onClick={() => setHintUsed(true)} className="secondary-button"><Lightbulb className="size-4" />Hint</button>}{result ? <button onClick={onNext} className="primary-button">Next question <ArrowRight className="size-4" /></button> : <button disabled={!selectedAnswer} onClick={onSubmit} className="primary-button disabled:cursor-not-allowed disabled:opacity-40">Submit answer</button>}</div></div></main><aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold text-slate-500">Topic mastery</p><div className="mt-3 flex items-end gap-2"><strong className="text-3xl">{Math.round(mastery * 100)}</strong><span className="pb-1 text-sm text-slate-400">/ 100</span></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${mastery * 100}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-500">Status: <strong className="capitalize text-slate-700">{masteryStatus(mastery)}</strong></p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold text-slate-500">Evidence policy</p><ul className="mt-3 space-y-3 text-xs leading-5 text-slate-600"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />First attempts stay separate from retries.</li><li className="flex gap-2"><Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />Hints reduce mastery weight.</li><li className="flex gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-emerald-500" />Next review: {new Date(nextReviewDate(2)).toLocaleDateString()}</li></ul></div></aside></div> : <div className="mx-auto flex h-[calc(100vh-64px)] max-w-4xl flex-col px-4 py-6"><div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><Bot className="size-5" /></span><div><h2 className="font-bold">Topic tutor</h2><p className="text-xs text-slate-500">Explain mode · grounded in Lecture 04</p></div></div><div className="space-y-4">{messages.map((message,index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{message.text}{message.role === "assistant" && index > 0 && <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] text-slate-400">Source: Lecture 04, pages 16–19</p>}</div></div>)}</div></div><div className="mt-3 flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"><button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"><Paperclip className="size-5" /></button><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} rows={1} placeholder="Ask about binary search trees…" className="max-h-28 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm outline-none" /><button onClick={onSend} className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white"><Send className="size-4" /></button></div></div>}</div>;
}
