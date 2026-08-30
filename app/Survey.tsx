"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  questions,
  sections,
  CORE,
  flattenAnswers,
  type Field,
  type Question,
} from "../lib/questions";
import { ecgPath } from "../lib/ecg";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
type Val = string | string[];
type Answers = Record<string, Val>;
type Phase = "intro" | "survey" | "outro";

/* ---------------- icons ---------------- */
const Check = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Arrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------------- ECG monitor ---------------- */
function EcgMonitor({ progress }: { progress: number }) {
  const W = 280, H = 92;
  const d = useMemo(() => ecgPath(8, W, H), []);
  const [bpm, setBpm] = useState(72);
  useEffect(() => {
    const id = setInterval(() => setBpm(68 + Math.round(Math.abs(Math.sin(Date.now() / 900)) * 9)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="monitor">
      <div className="monitor__row">
        <span>Response signal</span>
        <span className="monitor__bpm">♥ {bpm} bpm</span>
      </div>
      <svg className="ecg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <path className="ecg__ghost" d={d} />
        <path className="ecg__trace" d={d} pathLength={100} strokeDasharray={100}
          strokeDashoffset={100 - progress * 100}
          style={{ transition: "stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
    </div>
  );
}

/* ---------------- INTRO ---------------- */
function Intro({ onStart }: { onStart: () => void }) {
  const d = useMemo(() => ecgPath(4, 420, 70), []);
  return (
    <div className="center">
      <motion.div className="intro" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className="intro__brand">Field <b>Study</b></div>
        <div className="intro__kicker">Clinician Diagnostic Workflow Survey · Confidential</div>
        <h1 className="intro__title">
          The diagnostic delay is invisible on paper.
          <br />
          <em>You feel it every single day.</em>
        </h1>
        <p className="intro__lede">
          A short study on the real diagnostic challenges of everyday practice — and where
          faster, reliable near-patient testing could help. Section A is about your current
          workflow; a point-of-care concept is introduced later. Please answer from your own
          experience, and include no patient identifiers.
        </p>
        <svg className="intro__ecg" viewBox="0 0 420 70" preserveAspectRatio="none">
          <motion.path d={d} pathLength={1} initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }} strokeDasharray="1" />
        </svg>
        <div className="intro__stats">
          <div className="intro__stat"><b>{CORE}</b><span>Questions</span></div>
          <div className="intro__stat"><b>8–12</b><span>Minutes</span></div>
          <div className="intro__stat"><b>0</b><span>Patient data</span></div>
        </div>
        <button className="cta" onClick={onStart}>Begin the survey<span className="cta__k">Enter ↵</span></button>
      </motion.div>
    </div>
  );
}

/* ---------------- field renderers ---------------- */
function ChoiceList({
  choices, value, multi, limit, letters, onPick,
}: {
  choices: string[]; value: Val | undefined; multi?: boolean; limit?: number;
  letters?: boolean; onPick: (choice: string) => void;
}) {
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  const atLimit = multi && limit ? arr.length >= limit : false;
  return (
    <div className="choices">
      {choices.map((choice, i) => {
        const on = arr.includes(choice);
        const disabled = !on && atLimit;
        return (
          <button key={choice} className="choice" data-selected={on} data-disabled={disabled}
            onClick={() => !disabled && onPick(choice)}>
            {letters && <span className="kbd">{LETTERS[i]}</span>}
            <span className="choice__label">{choice}</span>
            <Check className="choice__check" />
          </button>
        );
      })}
    </div>
  );
}

function FieldView({
  field, base, answers, set, letters,
}: {
  field: Field; base: string; answers: Answers;
  set: (key: string, v: Val) => void; letters?: boolean;
}) {
  if (field.t === "single") {
    return (
      <ChoiceList choices={field.choices} value={answers[base]} letters={letters}
        onPick={(c) => set(base, c)} />
    );
  }
  if (field.t === "multi") {
    const cur = (answers[base] as string[]) || [];
    return (
      <>
        {field.limit && <div className="limitnote">Select up to {field.limit}</div>}
        <ChoiceList choices={field.choices} value={cur} multi limit={field.limit} letters={letters}
          onPick={(c) => {
            if (cur.includes(c)) set(base, cur.filter((x) => x !== c));
            else if (!field.limit || cur.length < field.limit) set(base, [...cur, c]);
          }} />
      </>
    );
  }
  if (field.t === "text") {
    const v = (answers[base] as string) || "";
    return field.long ? (
      <textarea className="textinput" placeholder={field.placeholder} value={v} maxLength={1200}
        onChange={(e) => set(base, e.target.value)} />
    ) : (
      <input className="lineinput" placeholder={field.placeholder} value={v} maxLength={400}
        onChange={(e) => set(base, e.target.value)} />
    );
  }
  if (field.t === "num") {
    const v = (answers[base] as string) || "";
    return (
      <div className="numwrap">
        <input className="lineinput lineinput--num" inputMode="decimal" placeholder={field.placeholder || "—"}
          value={v} onChange={(e) => set(base, e.target.value)} />
        {field.unit && <span className="unit">{field.unit}</span>}
      </div>
    );
  }
  if (field.t === "rank") {
    return (
      <div className="rank">
        {Array.from({ length: field.count }, (_, i) => {
          const n = i + 1;
          const key = `${base}~r${n}`;
          return (
            <div className="rankrow" key={key}>
              <span className="rankrow__n">{n}</span>
              <input className="lineinput" placeholder={`${field.itemLabel}…`}
                value={(answers[key] as string) || ""} onChange={(e) => set(key, e.target.value)} />
            </div>
          );
        })}
      </div>
    );
  }
  if (field.t === "percent") {
    return (
      <div className="pct">
        {field.rows.map((row, i) => {
          const key = `${base}~p${i}`;
          return (
            <div className="pctrow" key={key}>
              <span className="pctrow__label">{row}</span>
              <div className="pctrow__in">
                <input className="lineinput lineinput--num" inputMode="numeric" placeholder="—"
                  value={(answers[key] as string) || ""} onChange={(e) => set(key, e.target.value)} />
                <span className="unit">%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  if (field.t === "group") {
    return (
      <div className="grp">
        {field.items.map((it, i) => {
          const key = `${base}~g${i}`;
          return (
            <div className="grp__item" key={key}>
              <div className="grp__label">{it.label}</div>
              {it.t === "single" ? (
                <div className="pills">
                  {it.choices.map((c) => (
                    <button key={c} className="pill" data-on={answers[key] === c}
                      onClick={() => set(key, answers[key] === c ? "" : c)}>{c}</button>
                  ))}
                </div>
              ) : it.t === "num" ? (
                <div className="numwrap">
                  <input className="lineinput lineinput--num" inputMode="decimal" placeholder="—"
                    value={(answers[key] as string) || ""} onChange={(e) => set(key, e.target.value)} />
                  {it.unit && <span className="unit">{it.unit}</span>}
                </div>
              ) : it.long ? (
                <textarea className="textinput textinput--sm" value={(answers[key] as string) || ""}
                  maxLength={1200} onChange={(e) => set(key, e.target.value)} />
              ) : (
                <input className="lineinput" value={(answers[key] as string) || ""}
                  maxLength={400} onChange={(e) => set(key, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

/* ---------------- CELEBRATION ---------------- */
const PETAL_COLORS = ["#2ee38c", "#14c78c", "#dc9b0a", "#e0552b", "#ff9ec7", "#f5f1e8", "#7ad9ff"];
function Celebration() {
  const pieces = useMemo(
    () => Array.from({ length: 54 }, (_, i) => {
      const petal = Math.random() > 0.4;
      const size = 8 + Math.random() * 9;
      return {
        left: Math.random() * 100, delay: Math.random() * 1.1, duration: 3 + Math.random() * 2.6,
        rot: Math.round((Math.random() - 0.5) * 900), drift: Math.round((Math.random() - 0.5) * 120),
        color: PETAL_COLORS[i % PETAL_COLORS.length], w: size, h: petal ? size * 1.5 : size, petal,
      };
    }), []);
  return (
    <div className="celebrate" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className={"confetti" + (p.petal ? " confetti--petal" : "")}
          style={{
            left: `${p.left}%`, background: p.color, width: `${p.w}px`, height: `${p.h}px`,
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
            ["--rot" as string]: `${p.rot}deg`, ["--drift" as string]: `${p.drift}px`,
          }} />
      ))}
    </div>
  );
}

/* ---------------- OUTRO ---------------- */
function Outro({ answered, saveState }: { answered: number; saveState: string }) {
  return (
    <div className="center">
      <Celebration />
      <motion.div className="report" initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <div className="report__seal"><Check /></div>
        <div className="report__kicker">Response recorded</div>
        <h2 className="report__title">Thank you, doctor.</h2>
        <p className="report__text">
          Your clinical experience is logged. Every answer helps identify which diagnostic
          problems matter most to solve in real practice.
        </p>
        <div className="report__grid">
          <div className="report__cell"><b>{answered}/{CORE}</b><span>Questions answered</span></div>
          <div className="report__cell">
            <b>{saveState === "saved" ? "Logged" : saveState === "saving" ? "Saving…" : saveState === "error" ? "Local only" : "Ready"}</b>
            <span>Submission status</span>
          </div>
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
  const [answers, setAnswers] = useState<Answers>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const total = questions.length;
  const q = questions[index];
  const isLast = index === total - 1;

  const set = useCallback((key: string, v: Val) => setAnswers((p) => ({ ...p, [key]: v })), []);

  const nonEmpty = (v: Val | undefined) =>
    Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : false;

  const hasAnyAnswer = useCallback(
    (qq: Question) =>
      Object.keys(answers).some((k) => (k === qq.id || k.startsWith(qq.id + "~")) && nonEmpty(answers[k])),
    [answers]
  );

  const canAdvance = useMemo(() => {
    if (q.info || q.optionalMain || !q.field) return true;
    const f = q.field;
    if (f.t === "single") return typeof answers[q.id] === "string" && !!answers[q.id];
    if (f.t === "multi") return Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length > 0;
    if (f.t === "text" || f.t === "num") return nonEmpty(answers[q.id]);
    if (f.t === "rank") return nonEmpty(answers[`${q.id}~r1`]);
    return true;
  }, [q, answers]);

  const answeredCount = useMemo(
    () => questions.filter((qq) => qq.no !== "" && hasAnyAnswer(qq)).length,
    [hasAnyAnswer]
  );

  // Reset the scroll position to the top whenever the question changes.
  useEffect(() => {
    const s = document.querySelector(".stage");
    if (s) s.scrollTop = 0;
  }, [index]);

  const submit = useCallback(async (final: Answers) => {
    setSaveState("saving");
    const payload = {
      submittedAt: new Date().toISOString(),
      answers: flattenAnswers(final),
      raw: final,
    };
    try { localStorage.setItem("survey_responses", JSON.stringify(payload)); } catch {}
    try {
      const res = await fetch("/api/submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch { setSaveState("error"); }
  }, []);

  const go = useCallback((delta: number) => {
    setDir(delta);
    if (delta > 0 && index === total - 1) { setPhase("outro"); submit(answers); return; }
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
  }, [index, total, answers, submit]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "intro") { if (e.key === "Enter") setPhase("survey"); return; }
      if (phase !== "survey") return;
      const el = e.target as HTMLElement;
      const inField = el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT");
      if (inField) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canAdvance) { e.preventDefault(); go(1); }
        return;
      }
      if (e.key === "Enter") { if (canAdvance) go(1); return; }
      if (e.key === "Backspace" || e.key === "ArrowLeft") { e.preventDefault(); if (index > 0) go(-1); return; }
      // letter select for a main single/multi field
      const f = q.field;
      if (f && (f.t === "single" || f.t === "multi")) {
        const idx = LETTERS.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < f.choices.length) {
          const c = f.choices[idx];
          if (f.t === "single") set(q.id, c);
          else {
            const cur = (answers[q.id] as string[]) || [];
            if (cur.includes(c)) set(q.id, cur.filter((x) => x !== c));
            else if (!f.limit || cur.length < f.limit) set(q.id, [...cur, c]);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, index, q, canAdvance, go, answers, set]);

  if (phase === "intro") return <Intro onStart={() => setPhase("survey")} />;
  if (phase === "outro") return <Outro answered={answeredCount} saveState={saveState} />;

  const progress = answeredCount / CORE;

  const sectionState = (name: string) => {
    const idxs = questions.map((qq, i) => (qq.section === name ? i : -1)).filter((i) => i >= 0);
    const maxI = Math.max(...idxs);
    if (name === q.section) return "active";
    if (index > maxI) return "done";
    return "todo";
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 42 : -42 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -42 : 42 }),
  };

  const eyebrow = q.info
    ? `${q.section} · Overview`
    : q.no
    ? `${q.section} · Q${q.no}`
    : q.section;

  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <span className="brand__mark">Field <b>Study</b></span>
          <span className="brand__tag">Confidential</span>
        </div>
        <div className="rec"><span className="rec__dot" />Recording session</div>
        <EcgMonitor progress={progress} />
        <div>
          <div className="counter">
            <span className="counter__big">{q.no ? String(q.no).padStart(2, "0") : "✦"}</span>
            <span className="counter__total">/ {CORE}</span>
          </div>
          <div className="counter__label">{q.info ? "Concept overview" : q.no ? "Question in progress" : "Respondent profile"}</div>
        </div>
        <div className="sections">
          {sections.map((s) => {
            const st = sectionState(s);
            return (
              <div key={s} className="sections__item" data-state={st}>
                <span className="sections__tick">{st === "done" && <Check />}</span>{s}
              </div>
            );
          })}
        </div>
        <div className="rail__foot">Confidential field study</div>
      </aside>

      <main className="stage">
        <div className="topbar">
          <div className="progressbar"><span style={{ width: `${Math.max(4, progress * 100)}%` }} /></div>
          <div className="topbar__meta">{answeredCount} of {CORE} answered</div>
        </div>

        <div className="stage__body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={q.id} className="qcard" custom={dir} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
              <div className="eyebrow">{eyebrow}</div>
              <h2 className="qtitle">{q.title}</h2>
              {q.help && <p className="qhelp">{q.help}</p>}

              {q.field && (
                <div className="mainfield">
                  <FieldView field={q.field} base={q.id} answers={answers} set={set} letters />
                </div>
              )}

              {q.subs?.map((s, j) => (
                <div className="subq" key={j}>
                  <div className="subq__prompt">{s.prompt}</div>
                  <FieldView field={s.field} base={`${q.id}~s${j}`} answers={answers} set={set} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="nav">
          <button className="btn btn--ghost" onClick={() => go(-1)} disabled={index === 0}>← Back</button>
          <div className="hint">
            {q.info ? "Read, then continue" :
              q.field?.t === "single" ? <>Press <b>A–{LETTERS[q.field.choices.length - 1]}</b> or click</> :
              q.field?.t === "multi" ? <>Select all that apply{q.field.limit ? ` · up to ${q.field.limit}` : ""}</> :
              q.optionalMain ? "All optional · Continue when ready" : "Fill in, then Continue"}
          </div>
          <div className="nav__spring" />
          <button className="btn btn--primary" onClick={() => go(1)} disabled={!canAdvance}>
            {isLast ? "Finish" : "Continue"}<Arrow />
          </button>
        </div>
      </main>
    </div>
  );
}
