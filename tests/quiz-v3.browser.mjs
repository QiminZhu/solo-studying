import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

const { chromium } = await import(
  process.env.SOLO_PLAYWRIGHT_PATH || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SOLO_CHROME_PATH
    ? { executablePath: process.env.SOLO_CHROME_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const origin = process.env.SOLO_TEST_ORIGIN || "http://127.0.0.1:5173";
const lecturePath = "/subjects/itcs217/lectures/lecture-9";
const output =
  process.env.SOLO_TEST_OUTPUT || "/private/tmp/solo-quiz-v3-browser";
await mkdir(output, { recursive: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const fixtureFile = new URL("../public/quiz-v3-example.json", import.meta.url);
const bank = JSON.parse(await readFile(fixtureFile, "utf8"));

async function selection() {
  await page.goto(`${origin}${lecturePath}`);
  await page.getByRole("heading", { name: "Lecture 9", exact: true }).waitFor();
  await page
    .getByText("Loading saved progress…", { exact: true })
    .waitFor({ state: "hidden" });
}
async function open(title) {
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await card
    .getByRole("button", {
      name: /Start quiz|Resume quiz|New practice attempt/,
    })
    .first()
    .click();
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/quizzes/run");
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
}
async function next() {
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
}
async function check() {
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("region", { name: "Answer feedback", exact: true })
    .waitFor();
}
async function assertNoLeak() {
  assert.equal(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .count(),
    0,
  );
  const visible = await page.locator("body").innerText();
  assert.ok(!visible.includes("Answer key:"));
  for (const q of bank.filter((q) => q.id.startsWith("fixture-memory-")))
    assert.ok(!visible.includes(q.explanation), q.id);
}
async function noOverflow() {
  const dimensions = await page.evaluate(() => ({
    full: document.documentElement.scrollWidth,
    width: innerWidth,
  }));
  assert.ok(
    dimensions.full <= dimensions.width,
    `overflow ${JSON.stringify(dimensions)} at ${page.url()}`,
  );
}
async function settleLayout() {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
try {
  await page.goto(`${origin}/subjects/itcs217`);
  await page.getByRole("heading", { name: "ITCS217", exact: true }).waitFor();
  assert.equal(await page.getByRole("article").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Create quiz", exact: true })
      .count(),
    0,
  );
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow();
    await page.screenshot({
      path: `${output}/subject-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("link", { name: "Open Lecture 9", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === lecturePath);
  await page.getByRole("heading", { name: "Lecture 9", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Quiz selection", exact: true })
      .count(),
    0,
  );
  await page.goto(`${origin}/quizzes`);
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === lecturePath);
  await selection();
  assert.equal(
    await page
      .getByRole("region", { name: "Available quizzes", exact: true })
      .getByRole("article")
      .count(),
    4,
  );
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow();
    await page.screenshot({
      path: `${output}/selection-${width}.png`,
      fullPage: true,
    });
  }
  await open("The Slimekeeper’s Cellar");
  await page.getByRole("radio", { name: "B", exact: true }).focus();
  await page.keyboard.press("Space");
  assert.equal(
    await page.getByRole("radio", { name: "B", exact: true }).isChecked(),
    true,
  );
  const focusStyle = await page
    .getByRole("radio", { name: "B", exact: true })
    .evaluate((el) => ({
      style: getComputedStyle(el).outlineStyle,
      width: getComputedStyle(el).outlineWidth,
    }));
  assert.equal(focusStyle.style, "solid");
  assert.equal(focusStyle.width, "2px");
  await assertNoLeak();
  await check();
  assert.match(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .innerText(),
    /Incorrect · 0 \/ 1 point/,
  );
  await page
    .getByRole("button", { name: "Retry (first result kept)", exact: true })
    .click();
  await page.getByRole("radio", { name: "A", exact: true }).check();
  await check();
  assert.match(await page.locator("body").innerText(), /First check: 0 \/ 1/);
  await next();
  for (const name of ["AD", "AB", "AC"])
    await page.getByRole("checkbox", { name, exact: true }).check();
  await check();
  assert.match(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .innerText(),
    /Correct · 1 \/ 1 point/,
  );
  await next();
  await page.getByRole("radio", { name: "False", exact: true }).check();
  await check();
  await page
    .getByRole("button", { name: "Final submission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit attempt", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Attempt results", exact: true })
    .waitFor();
  assert.match(
    await page
      .getByRole("region", { name: "Attempt results", exact: true })
      .innerText(),
    /3 \/ 3/,
  );
  assert.match(
    await page
      .getByRole("region", { name: "Attempt results", exact: true })
      .innerText(),
    /2 \/ 3/,
  );
  const firstUrl = page.url();
  await page.reload();
  await page
    .getByRole("region", { name: "Attempt results", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Begin a new practice attempt", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "The Slimekeeper’s Cellar", exact: true })
    .waitFor();
  assert.notEqual(page.url(), firstUrl);
  assert.equal(
    await page.getByRole("radio", { name: "A", exact: true }).isChecked(),
    false,
  );
  await page.getByRole("radio", { name: "B", exact: true }).check();
  const resumedUrl = page.url();
  await page.getByRole("link", { name: "Save & return", exact: true }).click();
  await open("The Slimekeeper’s Cellar");
  assert.equal(page.url(), resumedUrl);
  assert.equal(
    await page.getByRole("radio", { name: "B", exact: true }).isChecked(),
    true,
  );
  await selection();
  await page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "The Slimekeeper’s Cellar",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Restart in new attempt", exact: true })
    .click();
  await page.waitForURL(
    (url) => url.pathname.replace(/\/$/, "") === "/quizzes/run" && url.href !== resumedUrl,
  );
  await page.getByRole("radio", { name: "B", exact: true }).waitFor();
  assert.notEqual(page.url(), resumedUrl);
  assert.equal(
    await page.getByRole("radio", { name: "B", exact: true }).isChecked(),
    false,
  );
  await selection();
  await open("The Webweaver’s Labyrinth");
  await page.getByLabel("Red", { exact: true }).selectOption("1");
  await page.getByLabel("Blue", { exact: true }).selectOption("2");
  await page.getByLabel("Green", { exact: true }).selectOption("0");
  await page.reload();
  await page.getByLabel("Red", { exact: true }).waitFor();
  assert.equal(await page.getByLabel("Red", { exact: true }).inputValue(), "1");
  await check();
  assert.match(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .innerText(),
    /Correct · 1 \/ 1 point/,
  );
  await next();
  await page.getByRole("button", { name: "Move 1 up", exact: true }).click();
  await page
    .getByRole("listitem", { name: "2, position 3", exact: true })
    .focus();
  await page.keyboard.press("Alt+ArrowUp");
  await check();
  assert.match(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .innerText(),
    /Correct · 1 \/ 1 point/,
  );
  await selection();
  await open("The Golem’s Proving Grounds");
  await page
    .getByRole("textbox", { name: "Blank 1", exact: true })
    .fill("  BLUE    SKY  ");
  await page
    .getByRole("textbox", { name: "Blank 2 (kg)", exact: true })
    .fill("2.5kg");
  assert.match(await page.getByRole("alert").innerText(), /finite number/);
  assert.equal(
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .isDisabled(),
    true,
  );
  await page
    .getByRole("textbox", { name: "Blank 2 (kg)", exact: true })
    .fill("2.51");
  await page.reload();
  await page
    .getByRole("textbox", { name: "Blank 2 (kg)", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Blank 2 (kg)", exact: true })
      .inputValue(),
    "2.51",
  );
  await check();
  assert.match(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .innerText(),
    /Correct · 1 \/ 1 point/,
  );
  await selection();
  await open("The Memory Eater");
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("radio", { name: "X", exact: true }).waitFor();
    await settleLayout();
    await noOverflow();
    await page.screenshot({
      path: `${output}/memory-${width}.png`,
      fullPage: true,
      caret: "initial",
    });
  }
  await page.getByRole("button", { name: "Fold", exact: true }).click();
  await noOverflow();
  await page.getByRole("button", { name: "Expand", exact: true }).click();
  await page.getByRole("radio", { name: "X", exact: true }).check();
  await next();
  await page.getByRole("checkbox", { name: "ZX", exact: true }).check();
  await assertNoLeak();
  await page
    .getByRole("button", { name: "Question 1, answered", exact: true })
    .click();
  await page.getByRole("radio", { name: "Z", exact: true }).check();
  await page.reload();
  await page.getByRole("radio", { name: "Z", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("radio", { name: "Z", exact: true }).isChecked(),
    true,
  );
  await assertNoLeak();
  await page
    .getByRole("button", { name: "Final submission", exact: true })
    .click();
  await assertNoLeak();
  await page
    .getByRole("button", {
      name: "Return to unanswered questions",
      exact: true,
    })
    .click();
  await page.getByRole("radio", { name: "True", exact: true }).waitFor();
  await page.getByRole("radio", { name: "True", exact: true }).check();
  await assertNoLeak();
  await next();
  await page.getByLabel("AX", { exact: true }).selectOption("1");
  await page.getByLabel("BX", { exact: true }).selectOption("1");
  await assertNoLeak();
  await next();
  await page.getByRole("button", { name: "Move 4 up", exact: true }).click();
  await page.getByRole("button", { name: "Move 4 up", exact: true }).click();
  await assertNoLeak();
  await next();
  await page.getByRole("textbox", { name: "Blank 1", exact: true }).fill(" n ");
  await page
    .getByRole("textbox", { name: "Blank 2 (m)", exact: true })
    .fill("4.5");
  await assertNoLeak();
  await page
    .getByRole("button", {
      name: "I don’t know — leave unanswered",
      exact: true,
    })
    .click();
  await assertNoLeak();
  await page
    .getByRole("button", { name: "Final submission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit with unanswered items", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Attempt results", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .count(),
    6,
  );
  assert.match(
    await page
      .getByRole("region", { name: "Attempt results", exact: true })
      .innerText(),
    /4 \/ 6/,
  );
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("region", { name: "Attempt results", exact: true })
      .waitFor();
    await settleLayout();
    await noOverflow();
    await page.screenshot({
      path: `${output}/results-${width}.png`,
      fullPage: true,
      caret: "initial",
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await noOverflow();
  await page
    .getByRole("button", { name: "Revisit missed questions", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("region", { name: "Answer feedback", exact: true })
      .count(),
    2,
  );
  await selection();
  const memoryCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "The Memory Eater", exact: true }),
  });
  const beforeReset = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solo.quiz-v3.attempts")),
  );
  await memoryCard
    .getByRole("button", { name: "Reset this quiz", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Keep progress", exact: true })
    .click();
  assert.equal(
    await memoryCard
      .getByRole("button", { name: "Reset this quiz", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await memoryCard
    .getByRole("button", { name: "Reset this quiz", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear this quiz’s attempts", exact: true })
    .click();
  const afterReset = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solo.quiz-v3.attempts")),
  );
  assert.equal(
    afterReset.length,
    beforeReset.filter((a) => a.bundle.quiz.id !== "memory-eater").length,
  );
  assert.ok(afterReset.every((a) => a.bundle.quiz.id !== "memory-eater"));
  await page
    .getByText("Author tools: import a six-format JSON bank", { exact: true })
    .click();
  await page
    .getByLabel("Quiz title", { exact: true })
    .fill("Imported fixture test");
  await page
    .getByLabel("BankQuestion v3 JSON array (maximum 1 MB)", { exact: true })
    .setInputFiles({
      name: "malformed.json",
      mimeType: "application/json",
      buffer: Buffer.from('[{"id":"bad"}]'),
    });
  await page.getByRole("alert").filter({ hasText: "Question data" }).waitFor();
  await page
    .getByLabel("BankQuestion v3 JSON array (maximum 1 MB)", { exact: true })
    .setInputFiles(fixtureFile.pathname);
  await page
    .getByRole("button", { name: "Save author preview", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Imported fixture test", exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByRole("heading", { name: "Imported fixture test", exact: true })
    .waitFor();
  await open("Imported fixture test");
  await page.getByRole("radio", { name: "A", exact: true }).check();
  await check();
  // Existing landing, folder, and legacy runner remain reachable.
  await page.goto(`${origin}/`);
  await page
    .getByRole("link", { name: /Start Practicing/ })
    .first()
    .click();
  await page.getByRole("heading", { name: "ITCS217", exact: true }).waitFor();
  await page.getByRole("link", { name: "Open Lecture 9", exact: true }).click();
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === lecturePath);
  await page
    .getByRole("button", {
      name: "Open quiz: Lecture 9 — Original questions",
      exact: true,
    })
    .click();
  await page
    .getByRole("heading", {
      name: "Lecture 9 — Original questions",
      exact: true,
    })
    .waitFor();
  await page.getByRole("radio").first().check();
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Lecture 9", exact: true })
    .click();
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === lecturePath);
  await page.getByRole("button", { name: "Create quiz", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Quiz name", exact: true })
    .fill("Saved in Lecture 9");
  await page.getByRole("checkbox", { name: /Select all 30 questions/ }).check();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create quiz", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Saved in Lecture 9", exact: true })
    .waitFor();
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "ITCS217", exact: true })
    .click();
  await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/subjects/itcs217");
  await page.getByRole("link", { name: "Open Lecture 9", exact: true }).click();
  await page
    .getByRole("heading", { name: "Saved in Lecture 9", exact: true })
    .waitFor();
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS: all six formats, keyboard ordering, immediate/deferred gating, retries, navigation, refresh, reset isolation, JSON author import, legacy flow, responsive layouts, reduced motion, and browser errors.",
  );
  console.log(`Screenshots: ${output}`);
} finally {
  await browser.close();
}
