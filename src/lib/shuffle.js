import { WEEKS, ALL_QUESTIONS } from '../data/questions.js';

// Remembers the last order used for each test and each question's options,
// so a new attempt never repeats the previous one. Cleared on page reload.
const lastQuestionOrder = {};
const lastOptionOrder = {};

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sameOrder = (a, b) => !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Shuffle so the result matches none of the orders in `avoid`.
// The first entry in `avoid` (the original order) has priority if both can't be avoided.
function shuffleAvoiding(arr, avoid) {
  if (arr.length < 2) return [...arr];
  for (let t = 0; t < 50; t++) {
    const s = fisherYates(arr);
    if (!avoid.some((a) => sameOrder(s, a))) return s;
  }
  for (let t = 0; t < 50; t++) {
    const s = fisherYates(arr);
    if (!sameOrder(s, avoid[0])) return s;
  }
  return fisherYates(arr);
}

function shuffleOptions(q) {
  const base = q.options.map((_, i) => i);
  const perm = shuffleAvoiding(base, [base, lastOptionOrder[q.id]].filter(Boolean));
  lastOptionOrder[q.id] = perm;
  return { ...q, shuffled: perm.map((i) => ({ text: q.options[i], orig: i })) };
}

export function buildWeekTest(week) {
  const { questions } = WEEKS.find((w) => w.week === week);
  const key = `week-${week}`;
  const ids = questions.map((q) => q.id);
  const order = shuffleAvoiding(ids, [ids, lastQuestionOrder[key]].filter(Boolean));
  lastQuestionOrder[key] = order;
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  return order.map((id) => shuffleOptions(byId[id]));
}

export function buildMixedTest(count) {
  const prev = new Set(lastQuestionOrder.mixed || []);
  // Prefer questions not seen in the previous mixed test.
  const fresh = fisherYates(ALL_QUESTIONS.filter((q) => !prev.has(q.id)));
  const picked = fresh.slice(0, count);
  if (picked.length < count) {
    picked.push(...fisherYates(ALL_QUESTIONS.filter((q) => prev.has(q.id))).slice(0, count - picked.length));
  }
  const ordered = fisherYates(picked);
  lastQuestionOrder.mixed = ordered.map((q) => q.id);
  return ordered.map(shuffleOptions);
}
