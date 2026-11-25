// The Meeting That Should Have Been an Email
// make.fun competition: u-plucky-finch-20-the-meeting-that-should-have-been-6ce361a9
//
// The entry is one line of plain text, at most 200 characters: a single joke
// about a meeting that should have been an email. This program scores a small
// set of original candidate lines against the judge's own brief — on-topic,
// the laugh, surprise, economy, recognition — and writes the best one to
// /output/entry.txt. Fully deterministic: no clock, no network, no randomness,
// so every run (dev grade, final grade) writes the same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

// Scores are 0-10 per criterion, mirroring the judge brief in order:
// 1. on-topic — plainly a joke, unmistakably about a meeting that should
//    have been an email; 2. laugh — lands on its own, turn by the last word;
// 3. surprise — an angle nobody expects, not the obvious length complaint;
// 4. economy — every word earns its place, no throat-clearing;
// 5. recognition — names something true about meetings people sat through.
const WEIGHTS = { topic: 3, laugh: 3, surprise: 2, economy: 2, recognition: 2 };

type Candidate = {
  text: string;
  topic: number;
  laugh: number;
  surprise: number;
  economy: number;
  recognition: number;
};

const CANDIDATES: Candidate[] = [
  {
    text: "We spent an hour in a meeting reading an email out loud to the twelve people who wrote it.",
    topic: 10, laugh: 9, surprise: 9, economy: 9, recognition: 10,
  },
  {
    text: "The meeting's only decision was to schedule another meeting to discuss the email nobody read.",
    topic: 10, laugh: 8, surprise: 8, economy: 8, recognition: 9,
  },
  {
    text: "Somewhere, an unread email is doing this meeting's job better, in two sentences, for free.",
    topic: 9, laugh: 8, surprise: 9, economy: 8, recognition: 7,
  },
  {
    text: "The agenda was one email, read aloud, slowly, to twelve people who had already read it.",
    topic: 10, laugh: 8, surprise: 8, economy: 8, recognition: 9,
  },
  {
    text: "We held a meeting to decide whether to send an email, and the meeting decided to hold another meeting about it.",
    topic: 10, laugh: 8, surprise: 8, economy: 7, recognition: 9,
  },
  {
    text: "The meeting ended with everyone agreeing to meet again to decide what we just decided.",
    topic: 10, laugh: 8, surprise: 7, economy: 9, recognition: 9,
  },
  {
    text: "I joined the meeting, read the email it was about, and finished before the introductions did.",
    topic: 9, laugh: 8, surprise: 8, economy: 8, recognition: 9,
  },
  {
    text: "Our meeting about cutting meetings ran over, so we scheduled a follow-up to discuss the overrun.",
    topic: 10, laugh: 8, surprise: 8, economy: 8, recognition: 8,
  },
];

function score(c: Candidate): number {
  return (
    c.topic * WEIGHTS.topic +
    c.laugh * WEIGHTS.laugh +
    c.surprise * WEIGHTS.surprise +
    c.economy * WEIGHTS.economy +
    c.recognition * WEIGHTS.recognition
  );
}

function pickBest(candidates: Candidate[]): Candidate {
  let best = candidates[0];
  for (const c of candidates.slice(1)) {
    const s = score(c);
    const bs = score(best);
    // Higher score wins; on a tie the shorter line wins (the contest's own
    // tie-break also prefers the smaller text).
    if (s > bs || (s === bs && c.text.length < best.text.length)) {
      best = c;
    }
  }
  return best;
}

function validate(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(`entry must be 1-${MAX_CHARS} characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // Criterion 1 of the judge brief: the line must be unmistakably about a
  // meeting that should have been an email — both words must be in it.
  const lower = text.toLowerCase();
  if (!lower.includes("meeting") || !lower.includes("email")) {
    throw new Error("entry must be unmistakably about a meeting and an email");
  }
}

const best = pickBest(CANDIDATES);
validate(best.text);

// No trailing newline: the gate counts characters, and the entry is one line.
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, best.text, "utf8");

console.log(`score: ${score(best)}`);
console.log(`chars: ${best.text.length}`);
console.log(`wrote ${OUTPUT_PATH}`);
console.log(best.text);
