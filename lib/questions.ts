// Clinician Diagnostic Workflow Survey — question model.
// A "screen" (Question) has a main input plus optional follow-up sub-inputs,
// so compound doc questions (a choice + a text follow-up, etc.) map to one
// screen each.

export type Field =
  | { t: "single"; choices: string[] }
  | { t: "multi"; choices: string[]; limit?: number }
  | { t: "text"; long?: boolean; placeholder?: string }
  | { t: "num"; unit?: string; placeholder?: string }
  | { t: "rank"; count: number; itemLabel: string }
  | { t: "percent"; rows: string[] }
  | { t: "group"; items: GroupItem[] };

export type GroupItem =
  | { label: string; t: "text"; long?: boolean }
  | { label: string; t: "num"; unit?: string }
  | { label: string; t: "single"; choices: string[] };

export type Sub = { prompt: string; field: Field };

export type Question = {
  id: string;
  section: string;
  no: string; // "1".."15" for numbered questions; "" for info/profile screens
  title: string;
  help?: string;
  info?: boolean; // informational screen, no input
  field?: Field; // main input
  subs?: Sub[]; // follow-up sub-inputs shown under the main input
  optionalMain?: boolean; // main input not required to advance
};

const freq = ["Never", "Rarely", "Sometimes", "Often", "Very often"];

export const questions: Question[] = [
  // ---------------- SECTION A ----------------
  {
    id: "q1",
    section: "Current workflow",
    no: "1",
    title:
      "Think about the last five patients who required laboratory testing. For how many were the results available while the patient was still with you?",
    help: "Same-visit diagnostic availability.",
    field: {
      t: "single",
      choices: ["0 of 5", "1 of 5", "2 of 5", "3 of 5", "4 of 5", "5 of 5"],
    },
    subs: [
      { prompt: "Which tests were you most often waiting for?", field: { t: "text" } },
    ],
  },
  {
    id: "q2",
    section: "Current workflow",
    no: "2",
    title:
      "Think about the most recent patient for whom an important test was unavailable or slower than you wanted. What happened to the patient's management?",
    help: "The most recent diagnostic delay. Select all that apply.",
    field: {
      t: "multi",
      choices: [
        "Treatment was delayed",
        "Treatment was started before confirmation",
        "Medication was prescribed empirically",
        "The patient was referred elsewhere",
        "The patient had to return later",
        "The patient was observed or admitted while waiting",
        "Additional testing was ordered",
        "The patient did not return / follow-up was lost",
        "There was no important effect",
        "Other",
      ],
    },
    subs: [
      { prompt: "What test or result were you waiting for?", field: { t: "text" } },
    ],
  },
  {
    id: "q3",
    section: "Current workflow",
    no: "3",
    title:
      "How often do you have to start, continue or modify treatment before receiving the diagnostic result you would ideally want?",
    help: "Treatment before complete diagnostic information.",
    field: { t: "single", choices: freq },
    subs: [
      {
        prompt: "In which conditions or clinical situations does this happen most frequently?",
        field: { t: "text" },
      },
    ],
  },
  {
    id: "q4",
    section: "Current workflow",
    no: "4",
    title:
      "Which diagnostic results do you most frequently wish you could obtain immediately, rather than sending the patient to a laboratory?",
    help: "Rank up to five, most important first.",
    field: { t: "rank", count: 5, itemLabel: "Test or diagnostic result" },
    subs: [
      {
        prompt: "How would having these results immediately change your clinical decision?",
        field: { t: "text", long: true },
      },
    ],
  },
  {
    id: "q5",
    section: "Current workflow",
    no: "5",
    title:
      "When a patient has to leave your clinic for laboratory testing, what commonly happens?",
    help: "Enter an approximate percentage for each (optional).",
    field: {
      t: "percent",
      rows: [
        "Patient completes the test and returns promptly",
        "Patient returns later or on another day",
        "Patient sends or shares the report digitally",
        "Your team has to follow up repeatedly",
        "Patient does not complete the test / is lost to follow-up",
      ],
    },
    optionalMain: true,
    subs: [
      { prompt: "What is the biggest problem created by this process?", field: { t: "text" } },
    ],
  },
  {
    id: "q6",
    section: "Current workflow",
    no: "6",
    title:
      "From deciding a test is required until you have a result you can act on, how long does it normally take for routine tests?",
    help: "Actual turnaround time.",
    field: {
      t: "single",
      choices: [
        "Less than 10 minutes",
        "10 to 30 minutes",
        "30 to 60 minutes",
        "1 to 3 hours",
        "Same day",
        "Next day",
        "More than one day",
      ],
    },
    subs: [
      {
        prompt: "For urgent tests, what turnaround time do you typically experience?",
        field: { t: "text" },
      },
      {
        prompt: "Which tests currently have an unacceptable turnaround time in your practice?",
        field: { t: "text" },
      },
    ],
  },
  {
    id: "q7",
    section: "Current workflow",
    no: "7",
    title:
      "How often do you receive a result you do not fully trust — because it doesn't fit the clinical picture or you're unsure about the testing process?",
    help: "Confidence in diagnostic results.",
    field: { t: "single", choices: freq },
    subs: [
      {
        prompt: "When this happens, what are your main concerns? Select all that apply.",
        field: {
          t: "multi",
          choices: [
            "Sample collection or pre-analytical error",
            "Sample transport or storage",
            "Instrument performance",
            "Calibration",
            "Reagent quality",
            "Laboratory-to-laboratory variability",
            "Operator error",
            "Biological variation",
            "Result or reporting error",
            "Uncertain reference range",
            "Other",
          ],
        },
      },
      {
        prompt: "What do you normally do when you do not trust a result?",
        field: { t: "text" },
      },
    ],
  },
  {
    id: "q8",
    section: "Current workflow",
    no: "8",
    title:
      "How often does the patient's ability to pay influence whether you order a diagnostic test you'd otherwise consider clinically useful?",
    help: "Cost as a barrier to testing.",
    field: { t: "single", choices: freq },
    subs: [
      {
        prompt: "Which useful tests are most commonly postponed, avoided or replaced because of cost?",
        field: { t: "text" },
      },
      {
        prompt: "Approximately what price per test or panel becomes difficult for your typical patient?",
        field: { t: "text", placeholder: "Amount and currency" },
      },
    ],
  },
  {
    id: "q9",
    section: "Current workflow",
    no: "9",
    title:
      "What currently prevents you from performing more diagnostic tests close to the point of consultation?",
    help: "Select your three most important barriers.",
    field: {
      t: "multi",
      limit: 3,
      choices: [
        "Equipment cost",
        "Cost per test",
        "Insufficient accuracy or clinical confidence",
        "Need for trained laboratory staff",
        "Complicated sample preparation",
        "Too many separate instruments",
        "Calibration requirements",
        "Quality-control requirements",
        "Reagent storage requirements",
        "Short reagent shelf life",
        "Maintenance and service requirements",
        "Consumable availability",
        "Biohazard and waste management",
        "Limited space",
        "Electricity or infrastructure limitations",
        "Low throughput",
        "Slow testing",
        "Data or software integration",
        "Regulatory or medico-legal concerns",
        "Other",
      ],
    },
  },
  {
    id: "q10",
    section: "Current workflow",
    no: "10",
    title:
      "If you could permanently eliminate one diagnostic problem from your practice tomorrow, what would you eliminate?",
    help: "The single biggest diagnostic problem.",
    field: { t: "text", long: true, placeholder: "The one problem you'd remove…" },
    subs: [
      { prompt: "Why is this the most important problem?", field: { t: "text" } },
      {
        prompt: "What would change for your patients or decisions if it were solved?",
        field: { t: "text", long: true },
      },
    ],
  },

  // ---------------- SECTION B ----------------
  {
    id: "concept",
    section: "Point-of-care concept",
    no: "",
    info: true,
    title: "A point-of-care concept to evaluate",
    help:
      "Please consider a compact diagnostic platform that performs multiple tests from a small biological sample, close to the patient. It would automate much of the process, include quality-control checks, and provide results during or close to the same clinical encounter. The next questions ask whether such a system would be clinically useful, and what it would need to meet.",
  },
  {
    id: "q11",
    section: "Point-of-care concept",
    no: "11",
    title:
      "For which patients, conditions or situations would multiple reliable results during the same visit actually change what you do?",
    help: "Rank your top three clinical use cases.",
    field: { t: "rank", count: 3, itemLabel: "Clinical use case" },
    subs: [
      {
        prompt: "Approximately how many of your patients per day might benefit from such testing?",
        field: { t: "num", unit: "patients / day" },
      },
    ],
  },
  {
    id: "q12",
    section: "Point-of-care concept",
    no: "12",
    title:
      "Before making a treatment decision using a new point-of-care platform, what evidence or safeguards would you need?",
    help: "Select the most important items.",
    field: {
      t: "multi",
      choices: [
        "Comparison with established central laboratory methods",
        "Clinical sensitivity and specificity",
        "Analytical precision and reproducibility",
        "Independent clinical validation",
        "Regulatory approval",
        "Internal quality controls",
        "Automatic calibration and system checks",
        "Detection of invalid samples or invalid results",
        "Evidence from independent hospitals or laboratories",
        "Performance data from real clinical settings",
        "Peer-reviewed published evidence",
        "Other",
      ],
    },
    subs: [
      {
        prompt: "What would make you comfortable acting on the result without routinely confirming it elsewhere?",
        field: { t: "text", long: true },
      },
    ],
  },
  {
    id: "q13",
    section: "Point-of-care concept",
    no: "13",
    title:
      "If the first version could perform only a limited number of tests, which five would be essential for you to use it routinely?",
    help: "Rank the five essential tests or test groups.",
    field: { t: "rank", count: 5, itemLabel: "Essential test or test group" },
    subs: [
      {
        prompt: "Which additional tests would make the system significantly more valuable?",
        field: { t: "text" },
      },
    ],
  },
  {
    id: "q14",
    section: "Point-of-care concept",
    no: "14",
    title: "What would the ideal clinical workflow look like?",
    help: "The practical requirements to make it workable in your setting.",
    optionalMain: true,
    field: {
      t: "group",
      items: [
        { label: "Maximum acceptable result time", t: "num", unit: "minutes" },
        { label: "Maximum acceptable hands-on preparation time", t: "num", unit: "minutes" },
        { label: "Preferred sample type", t: "text" },
        { label: "Preferred or acceptable sample volume", t: "text" },
        { label: "Required patients per hour / simultaneous capacity", t: "text" },
        {
          label: "Preferred operator",
          t: "single",
          choices: [
            "Doctor",
            "Nurse",
            "Clinic assistant",
            "Laboratory technician",
            "Any trained healthcare worker",
          ],
        },
        { label: "Other workflow requirement", t: "text" },
      ],
    },
  },
  {
    id: "q15",
    section: "Point-of-care concept",
    no: "15",
    title: "Would it become part of your routine practice?",
    help:
      "Assume the system meets the accuracy, reliability and turnaround-time requirements you specified.",
    optionalMain: true,
    field: {
      t: "group",
      items: [
        { label: "Realistic volume — per day", t: "num" },
        { label: "Realistic volume — per month", t: "num" },
        { label: "What the patient currently pays (typical amount + currency)", t: "text" },
        { label: "Reasonable price for an immediate result (amount + currency)", t: "text" },
        { label: "Price above which you'd probably stop using it (amount + currency)", t: "text" },
        {
          label: "Preferred commercial model",
          t: "single",
          choices: [
            "Purchase the analyzer",
            "Monthly rental",
            "Lease",
            "Analyzer provided with a commitment to buy cartridges / tests",
            "Pay per test",
            "Revenue sharing",
            "Hospital or clinic subscription",
            "Not sure",
          ],
        },
        { label: "Single strongest reason you WOULD adopt it", t: "text", long: true },
        { label: "Single strongest reason you would REJECT it", t: "text", long: true },
      ],
    },
  },

  // ---------------- PROFILE ----------------
  {
    id: "profile",
    section: "About you",
    no: "",
    title: "About you",
    help: "Used only to compare diagnostic needs across settings. All optional.",
    optionalMain: true,
    field: {
      t: "group",
      items: [
        { label: "Primary specialty", t: "text" },
        { label: "Secondary specialty (if any)", t: "text" },
        {
          label: "Practice setting",
          t: "single",
          choices: [
            "Private clinic",
            "Nursing home",
            "Private hospital",
            "Government hospital",
            "PHC",
            "CHC",
            "District hospital",
            "Medical college",
            "Other",
          ],
        },
        { label: "Approximate patients seen per day", t: "num" },
        { label: "Years in clinical practice", t: "num" },
        { label: "Approximate diagnostic tests ordered per day", t: "num" },
        { label: "Location (city / state / country)", t: "text" },
        { label: "Respondent ID (optional)", t: "text" },
        { label: "Additional comments", t: "text", long: true },
      ],
    },
  },
];

export const sections = [
  "Current workflow",
  "Point-of-care concept",
  "About you",
];

// Number of numbered questions (used for progress + counter).
export const CORE = questions.filter((q) => q.no !== "").length;

/* ---- Flattening: turn the nested schema + answers into a flat labeled list
   (used for storage, the admin table, and CSV export). Keys are stable. ---- */
export type Atom = { key: string; label: string; kind: string };

function addFieldAtoms(
  out: Atom[],
  base: string,
  prefix: string,
  label: string,
  field: Field
) {
  switch (field.t) {
    case "single":
    case "multi":
    case "text":
    case "num":
      out.push({ key: base, label, kind: field.t });
      break;
    case "rank":
      for (let n = 1; n <= field.count; n++) {
        out.push({
          key: `${base}~r${n}`,
          label: `${prefix} — ${field.itemLabel} #${n}`,
          kind: "text",
        });
      }
      break;
    case "percent":
      field.rows.forEach((r, i) =>
        out.push({ key: `${base}~p${i}`, label: `${prefix} — ${r} (%)`, kind: "num" })
      );
      break;
    case "group":
      field.items.forEach((it, i) =>
        out.push({ key: `${base}~g${i}`, label: `${prefix} — ${it.label}`, kind: it.t })
      );
      break;
  }
}

export function schemaAtoms(): Atom[] {
  const out: Atom[] = [];
  for (const q of questions) {
    if (q.info) continue;
    const prefix = q.no ? `Q${q.no}` : q.section;
    if (q.field) addFieldAtoms(out, q.id, prefix, q.title, q.field);
    q.subs?.forEach((s, j) =>
      addFieldAtoms(out, `${q.id}~s${j}`, prefix, s.prompt, s.field)
    );
  }
  return out;
}

const nonEmpty = (v: unknown) =>
  Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : v != null;

export function flattenAnswers(answers: Record<string, unknown>) {
  return schemaAtoms()
    .map((a) => ({ id: a.key, question: a.label, answer: answers[a.key] ?? null }))
    .filter((e) => nonEmpty(e.answer));
}

export function schemaColumns() {
  return schemaAtoms().map((a) => ({ key: a.key, label: a.label }));
}
