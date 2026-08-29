export type Choice = { label: string; value: string };

export type Question =
  | {
      id: number;
      kind: "single";
      layout?: "list" | "grid";
      section: string;
      title: string;
      help?: string;
      choices: Choice[];
    }
  | {
      id: number;
      kind: "multi";
      section: string;
      title: string;
      help?: string;
      choices: Choice[];
    }
  | {
      id: number;
      kind: "text";
      section: string;
      title: string;
      help?: string;
      placeholder?: string;
      optional?: boolean;
    }
  | {
      id: number;
      kind: "scale";
      section: string;
      title: string;
      help?: string;
      min: number;
      max: number;
      minLabel: string;
      maxLabel: string;
    };

const c = (...labels: string[]): Choice[] =>
  labels.map((label) => ({ label, value: label }));

export const questions: Question[] = [
  {
    id: 1,
    kind: "single",
    layout: "grid",
    section: "Your practice",
    title: "What is your primary medical specialty?",
    help: "Pick the one that best describes your day-to-day work.",
    choices: c(
      "General / Family Medicine",
      "Internal Medicine",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "Cardiology",
      "Diabetology / Endocrinology",
      "Emergency / Critical Care",
      "Surgery",
      "Orthopedics",
      "Pulmonology",
      "Gastroenterology",
      "Dermatology",
      "Other"
    ),
  },
  {
    id: 2,
    kind: "single",
    section: "Your practice",
    title: "Where do you mainly practice?",
    choices: c(
      "Private clinic",
      "Polyclinic / multispecialty clinic",
      "Private hospital",
      "Government hospital / PHC / CHC",
      "Medical college / teaching hospital",
      "Other"
    ),
  },
  {
    id: 3,
    kind: "single",
    section: "Your practice",
    title:
      "Approximately how many patients do you personally see on a typical working day?",
    choices: c(
      "Fewer than 10",
      "10–25",
      "26–50",
      "51–75",
      "76–100",
      "More than 100"
    ),
  },
  {
    id: 4,
    kind: "single",
    section: "Your practice",
    title:
      "On a typical working day, approximately how many of your patients require diagnostic testing?",
    choices: c(
      "Fewer than 5",
      "5–10",
      "11–20",
      "21–30",
      "31–50",
      "More than 50"
    ),
  },
  {
    id: 5,
    kind: "text",
    section: "The problem",
    title:
      "What is the single biggest problem you face with the current diagnostic process?",
    help: "Describe the problem in your own words.",
    placeholder:
      "e.g. Reports come back the next day, so patients leave before I can act on them…",
  },
  {
    id: 6,
    kind: "single",
    section: "The problem",
    title:
      "How often does this diagnostic problem affect your clinical decisions or patient management?",
    choices: c(
      "Several times every day",
      "About once every day",
      "Several times per week",
      "About once per week",
      "Occasionally",
      "Rarely"
    ),
  },
  {
    id: 7,
    kind: "multi",
    section: "The problem",
    title:
      "What consequences does the current diagnostic process most commonly create?",
    help: "Select all that apply.",
    choices: c(
      "Delay in diagnosis or treatment",
      "Clinical decisions made with incomplete information",
      "Empirical treatment or unnecessary medication",
      "Additional patient visits",
      "Patient fails to complete prescribed testing",
      "Patient loss to follow-up",
      "Extra travel or waiting time",
      "Higher cost for patients",
      "Unnecessary referrals",
      "Higher workload for the doctor / clinic",
      "Patient anxiety or dissatisfaction",
      "No significant problem",
      "Other"
    ),
  },
  {
    id: 8,
    kind: "text",
    section: "The problem",
    title:
      "If you could change one thing about the current diagnostic process, what would you change?",
    placeholder: "One change that would make the biggest difference…",
  },
  {
    id: 9,
    kind: "single",
    section: "Same-visit diagnostics",
    title:
      "What would make a same-visit diagnostic service financially attractive to you and your patients?",
    choices: c(
      "It should cost significantly less than current testing",
      "Slightly less than current testing would be sufficient",
      "A similar total cost is acceptable if results arrive during the same visit",
      "A slightly higher cost is acceptable if it improves speed and convenience",
      "Cost is less important than clinical reliability and availability",
      "It depends on the clinical situation"
    ),
  },
  {
    id: 10,
    kind: "single",
    section: "Same-visit diagnostics",
    title:
      "If the reports you routinely need could be reliably provided at your clinic during the same visit, in ~15–30 minutes, would you consider using this service?",
    choices: c(
      "Definitely yes",
      "Probably yes",
      "Maybe — I would first need to evaluate it",
      "Probably no",
      "Definitely no"
    ),
  },
  {
    id: 11,
    kind: "scale",
    section: "Same-visit diagnostics",
    title:
      "If one service could reliably provide most of the diagnostics you routinely require, with reports in ~15–30 minutes, how valuable would that be to your practice?",
    min: 0,
    max: 10,
    minLabel: "No meaningful value",
    maxLabel: "Practice-changing",
  },
  {
    id: 12,
    kind: "single",
    section: "Same-visit diagnostics",
    title:
      "If the service consistently met your expectations for accuracy, reliability, turnaround and affordability, how much of your current testing would you consider shifting to it?",
    choices: c(
      "Almost all eligible testing",
      "Most testing",
      "A significant portion",
      "Only selected testing",
      "Only when rapid results are particularly important",
      "Very little",
      "None",
      "Not sure"
    ),
  },
  {
    id: 13,
    kind: "multi",
    section: "Trust & adoption",
    title:
      "What would you need to see before you would trust and routinely use this service?",
    help: "Select all that apply.",
    choices: c(
      "Accuracy comparable with established laboratories",
      "Regulatory approval",
      "Independent clinical validation",
      "Reliable quality control and repeatability",
      "Affordable and transparent pricing",
      "Reliable service availability",
      "Simple workflow for clinic staff",
      "Strong technical / service support",
      "Successful evaluation in my own clinic",
      "Evidence or recommendation from trusted hospitals / doctors",
      "Other"
    ),
  },
  {
    id: 14,
    kind: "single",
    section: "Trust & adoption",
    title:
      "Who would normally make or influence the decision to introduce a new diagnostic service in your practice?",
    choices: c(
      "I make the decision myself",
      "I decide jointly with partners / other doctors",
      "Clinic / hospital management",
      "Procurement / administration",
      "Laboratory / diagnostic department",
      "Corporate / head office",
      "Government / health authority",
      "Other"
    ),
  },
  {
    id: 15,
    kind: "single",
    section: "Trust & adoption",
    title:
      "If the service demonstrated the required accuracy, reliability and regulatory compliance, would you be willing to evaluate it through a pilot in your own clinic?",
    choices: c(
      "Definitely yes",
      "Probably yes",
      "Maybe",
      "Probably no",
      "Definitely no"
    ),
  },
  {
    id: 16,
    kind: "text",
    section: "Final word",
    title:
      "What is the single most important thing we would need to prove or solve before you would adopt this service?",
    help: "Optional — the biggest reason you might NOT use it is just as useful to us.",
    placeholder: "The one thing that would make or break your decision…",
    optional: true,
  },
];

export const sections = [
  "Your practice",
  "The problem",
  "Same-visit diagnostics",
  "Trust & adoption",
  "Final word",
];
