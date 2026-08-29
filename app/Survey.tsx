"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions, sections, type Question } from "../lib/questions";
import { ecgPath } from "../lib/ecg";

const LETTERS = "ABCDEFGHIJKLMNOP";
type Answer = string | string[] | number | undefined;
type Phase = "intro" | "survey" | "outro";

/* ---------------- tiny inline icons ---------------- */
const Check = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Arrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12h14m-6-6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------------- ECG progress (rail monitor) ---------------- */
function EcgMonitor({ progress }: { progress: number }) {
  const W = 280;
  const H = 92;
  const beats = 8;
  const d = useMemo(() => ecgPath(beats, W, H), []);
  const [bpm, setBpm] = useState(72);
  useEffect(() => {
    const id = setInterval(
      () => setBpm(68 + Math.round(Math.abs(Math.sin(Date.now() / 900)) * 9)),
      900
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="monitor">
      <div className="monitor__row">
        <span>Response signal</span>
        <span className="monitor__bpm">♥ {bpm} bpm</span>
      </div>
      <svg
        className="ecg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path className="ecg__ghost" d={d} />
        <path
          className="ecg__trace"
          d={d}
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - progress * 100}
          style={{ transition: "stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
    </div>
  );
}

/* ---------------- INTRO ---------------- */
function Intro({ onStart }: { onStart: () => void }) {
  const d = useMemo(() => ecgPath(4, 420, 70), []);
  return (
    <div className="center">
      <motion.div
        className="intro"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="intro__brand">
          BIQAD<b>X</b>
        </div>
        <div className="intro__kicker">Clinical Field Study · Confidential</div>

        <h1 className="intro__title">
          The diagnostic delay is invisible on paper.
          <br />
          <em>You feel it every single day.</em>
        </h1>
        <p className="intro__lede">
          Fifteen questions on the diagnostic problems of everyday practice —
          and whether reliable, same-visit results would actually change how you
          work. Built by clinicians, answered like a conversation.
        </p>

        <svg className="intro__ecg" viewBox="0 0 420 70" preserveAspectRatio="none">
          <motion.path
            d={d}
            pathLength={1}
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
            strokeDasharray="1"
          />
        </svg>

        <div className="intro__stats">
          <div className="intro__stat">
            <b>15</b>
            <span>Questions</span>
          </div>
          <div className="intro__stat">
            <b>4–6</b>
            <span>Minutes</span>
          </div>
          <div className="intro__stat">
            <b>0</b>
            <span>Patient data</span>
          </div>
        </div>

        <button className="cta" onClick={onStart}>
          Begin the study
          <span className="cta__k">Enter ↵</span>
        </button>
      </motion.div>
    </div>
  );
}

/* ---------------- QUESTION VIEWS ---------------- */
function SingleView({
  q,
  value,
  onPick,
}: {
  q: Extract<Question, { kind: "single" }>;
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className={"choices" + (q.layout === "grid" ? " choices--grid" : "")}>
      {q.choices.map((choice, i) => (
        <button
          key={choice.value}
          className="choice"
          data-selected={value === choice.value}
          onClick={() => onPick(choice.value)}
        >
          <span className="kbd">{LETTERS[i]}</span>
          <span className="choice__label">{choice.label}</span>
          <Check className="choice__check" />
        </button>
      ))}
    </div>
  );
}

function MultiView({
  q,
  value,
  onToggle,
}: {
  q: Extract<Question, { kind: "multi" }>;
  value: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="choices">
      {q.choices.map((choice, i) => (
        <button
          key={choice.value}
          className="choice"
          data-selected={value.includes(choice.value)}
          onClick={() => onToggle(choice.value)}
        >
          <span className="kbd">{LETTERS[i]}</span>
          <span className="choice__label">{choice.label}</span>
          <Check className="choice__check" />
        </button>
      ))}
    </div>
  );
}

function TextView({
  q,
  value,
  onChange,
  inputRef,
}: {
  q: Extract<Question, { kind: "text" }>;
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="textwrap">
      <textarea
        ref={inputRef}
        className="textinput"
        placeholder={q.placeholder}
        value={value}
        maxLength={1200}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="counthint">{value.length}/1200</span>
    </div>
  );
}

const VERDICTS = [
  "No value",
  "Marginal",
  "Marginal",
  "Minor",
  "Useful",
  "Useful",
  "Valuable",
  "Valuable",
  "High value",
  "Major",
  "Practice-changing",
];
function scaleColor(n: number) {
  // red -> amber -> green across 0..10
  const hue = (n / 10) * 145; // 0 red-ish, 145 green
  return `hsl(${12 + hue}, 68%, 42%)`;
}
function ScaleView({
  q,
  value,
  onPick,
}: {
  q: Extract<Question, { kind: "scale" }>;
  value?: number;
  onPick: (n: number) => void;
}) {
  const has = typeof value === "number";
  const col = has ? scaleColor(value!) : "var(--ink-faint)";
  return (
    <div className="scale">
      <div className="scale__readout">
        <div className="scale__num" style={{ color: col }}>
          {has ? value : "—"}
        </div>
        <div className="scale__verdict" style={{ color: has ? col : undefined }}>
          {has ? VERDICTS[value!] : "Choose 0–10"}
        </div>
      </div>
      <div className="scale__ticks">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            className="tick"
            data-on={value === n}
            style={
              value === n
                ? { background: scaleColor(n), borderColor: scaleColor(n) }
                : undefined
            }
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="scale__legend">
        <span>0 · {q.minLabel}</span>
        <span>{q.maxLabel} · 10</span>
      </div>
    </div>
  );
}

/* ---------------- OUTRO ---------------- */
function Outro({
  answered,
  onDownload,
  saveState,
}: {
  answered: number;
  onDownload: () => void;
  saveState: "idle" | "saving" | "saved" | "error";
}) {
  return (
    <div className="center">
      <motion.div
        className="report"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="report__seal">
          <Check />
        </div>
        <div className="report__kicker">Response recorded</div>
        <h2 className="report__title">Thank you, doctor.</h2>
        <p className="report__text">
          Your field notes are logged. Every answer here helps us design a
          same-visit diagnostic service around how medicine is actually
          practised — not how a brochure imagines it.
        </p>
        <div className="report__grid">
          <div className="report__cell">
            <b>{answered}/15</b>
            <span>Questions answered</span>
          </div>
          <div className="report__cell">
            <b>
              {saveState === "saved"
                ? "Logged"
                : saveState === "saving"
                ? "Saving…"
                : saveState === "error"
                ? "Local only"
                : "Ready"}
            </b>
            <span>Submission status</span>
          </div>
        </div>
        <div className="report__actions">
          <button className="btn btn--primary" onClick={onDownload}>
            Download my responses
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */
export default function Survey() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const total = questions.length;
  const CORE = 15; // 15 numbered questions; the 16th screen is an optional note
  const q = questions[index];
  const isTail = index >= CORE; // the optional closing comment

  // completion is measured against the 15 core questions only
  const answeredCount = useMemo(
    () =>
      questions.slice(0, CORE).filter((qq) => {
        const a = answers[qq.id];
        if (Array.isArray(a)) return a.length > 0;
        if (typeof a === "number") return true;
        return typeof a === "string" && a.trim().length > 0;
      }).length,
    [answers]
  );

  const isAnswered = useCallback(
    (qq: Question) => {
      const a = answers[qq.id];
      if (qq.kind === "multi") return Array.isArray(a) && a.length > 0;
      if (qq.kind === "scale") return typeof a === "number";
      if (qq.kind === "text")
        return qq.optional || (typeof a === "string" && a.trim().length > 0);
      return typeof a === "string" && a.length > 0;
    },
    [answers]
  );

  const canAdvance = isAnswered(q);
  const isLast = index === total - 1;

  const setAnswer = (id: number, v: Answer) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const submit = useCallback(
    async (finalAnswers: Record<number, Answer>) => {
      setSaveState("saving");
      const payload = {
        submittedAt: new Date().toISOString(),
        answers: questions.map((qq) => ({
          id: qq.id,
          section: qq.section,
          question: qq.title,
          answer: finalAnswers[qq.id] ?? null,
        })),
      };
      try {
        localStorage.setItem("biqadx_survey", JSON.stringify(payload));
      } catch {}
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    []
  );

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      if (delta > 0 && index === total - 1) {
        setPhase("outro");
        submit(answers);
        return;
      }
      setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
    },
    [index, total, answers, submit]
  );

  // focus textarea when entering a text question
  useEffect(() => {
    if (phase === "survey" && q.kind === "text") {
      const t = setTimeout(() => textRef.current?.focus(), 380);
      return () => clearTimeout(t);
    }
  }, [phase, index, q.kind]);

  // keyboard control
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "intro") {
        if (e.key === "Enter") setPhase("survey");
        return;
      }
      if (phase !== "survey") return;

      const inText =
        e.target instanceof HTMLElement && e.target.tagName === "TEXTAREA";

      if (inText) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canAdvance) {
          e.preventDefault();
          go(1);
        }
        return;
      }

      if (e.key === "Enter") {
        if (canAdvance) go(1);
        return;
      }
      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (index > 0) go(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        if (canAdvance) go(1);
        return;
      }

      // letter selection
      if (q.kind === "single" || q.kind === "multi") {
        const idx = LETTERS.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < q.choices.length) {
          const val = q.choices[idx].value;
          if (q.kind === "single") {
            setAnswer(q.id, val);
            setTimeout(() => go(1), 240);
          } else {
            setAnswers((prev) => {
              const cur = (prev[q.id] as string[]) || [];
              const next = cur.includes(val)
                ? cur.filter((x) => x !== val)
                : [...cur, val];
              return { ...prev, [q.id]: next };
            });
          }
        }
      }
      if (q.kind === "scale") {
        if (/^[0-9]$/.test(e.key)) setAnswer(q.id, Number(e.key));
        if (e.key === "0" && e.shiftKey) setAnswer(q.id, 10);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, index, q, canAdvance, go]);

  const pickSingle = (v: string) => {
    setAnswer(q.id, v);
    setTimeout(() => go(1), 240);
  };
  const toggleMulti = (v: string) => {
    setAnswers((prev) => {
      const cur = (prev[q.id] as string[]) || [];
      const next = cur.includes(v)
        ? cur.filter((x) => x !== v)
        : [...cur, v];
      return { ...prev, [q.id]: next };
    });
  };

  const downloadResponses = () => {
    const payload = {
      submittedAt: new Date().toISOString(),
      answers: questions.map((qq) => ({
        id: qq.id,
        question: qq.title,
        answer: answers[qq.id] ?? null,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "biqadx-survey-responses.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase === "intro") return <Intro onStart={() => setPhase("survey")} />;
  if (phase === "outro")
    return (
      <Outro
        answered={answeredCount}
        onDownload={downloadResponses}
        saveState={saveState}
      />
    );

  const progress = answeredCount / CORE;
  const curSection = q.section;

  // section states for the rail
  const sectionState = (name: string) => {
    const idxs = questions
      .map((qq, i) => (qq.section === name ? i : -1))
      .filter((i) => i >= 0);
    const maxI = Math.max(...idxs);
    if (name === curSection) return "active";
    if (index > maxI) return "done";
    return "todo";
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 42 : -42 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -42 : 42 }),
  };

  return (
    <div className="app">
      {/* -------- rail -------- */}
      <aside className="rail">
        <div className="brand">
          <span className="brand__mark">
            BIQAD<b>X</b>
          </span>
          <span className="brand__tag">Field study</span>
        </div>

        <div className="rec">
          <span className="rec__dot" />
          Recording session
        </div>

        <EcgMonitor progress={progress} />

        <div>
          <div className="counter">
            <span className="counter__big">
              {isTail ? "✦" : String(index + 1).padStart(2, "0")}
            </span>
            <span className="counter__total">/ {CORE}</span>
          </div>
          <div className="counter__label">
            {isTail ? "Optional closing note" : "Question in progress"}
          </div>
        </div>

        <div className="sections">
          {sections.map((s) => {
            const st = sectionState(s);
            return (
              <div key={s} className="sections__item" data-state={st}>
                <span className="sections__tick">
                  {st === "done" && <Check />}
                </span>
                {s}
              </div>
            );
          })}
        </div>

        <div className="rail__foot">© BIQADX Diagnostics</div>
      </aside>

      {/* -------- stage -------- */}
      <main className="stage">
        <div className="topbar">
          <div className="progressbar">
            <span style={{ width: `${Math.max(4, progress * 100)}%` }} />
          </div>
          <div className="topbar__meta">
            {answeredCount} of {CORE} answered
          </div>
        </div>

        <div className="stage__body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={q.id}
              className="qcard"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="eyebrow">
                {isTail ? `${q.section} · Optional` : `${q.section} · Q${index + 1}`}
              </div>
              <h2 className="qtitle">{q.title}</h2>
              {q.help && <p className="qhelp">{q.help}</p>}

              {q.kind === "single" && (
                <SingleView
                  q={q}
                  value={answers[q.id] as string | undefined}
                  onPick={pickSingle}
                />
              )}
              {q.kind === "multi" && (
                <MultiView
                  q={q}
                  value={(answers[q.id] as string[]) || []}
                  onToggle={toggleMulti}
                />
              )}
              {q.kind === "text" && (
                <TextView
                  q={q}
                  value={(answers[q.id] as string) || ""}
                  onChange={(v) => setAnswer(q.id, v)}
                  inputRef={textRef}
                />
              )}
              {q.kind === "scale" && (
                <ScaleView
                  q={q}
                  value={answers[q.id] as number | undefined}
                  onPick={(n) => setAnswer(q.id, n)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="nav">
          <button
            className="btn btn--ghost"
            onClick={() => go(-1)}
            disabled={index === 0}
          >
            ← Back
          </button>
          <div className="hint">
            {q.kind === "single" && (
              <>
                Press <b>A–{LETTERS[q.choices.length - 1]}</b> or click
              </>
            )}
            {q.kind === "multi" && (
              <>
                Toggle with <b>keys</b> · select all that apply
              </>
            )}
            {q.kind === "scale" && (
              <>
                Press <b>0–9</b> or click a number
              </>
            )}
            {q.kind === "text" && (
              <>
                <b>Ctrl/⌘ + Enter</b> to continue
                {q.optional ? " · optional" : ""}
              </>
            )}
          </div>
          <div className="nav__spring" />
          <button
            className="btn btn--primary"
            onClick={() => go(1)}
            disabled={!canAdvance}
          >
            {isLast ? "Finish" : "Continue"}
            <Arrow />
          </button>
        </div>
      </main>
    </div>
  );
}
