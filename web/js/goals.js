import { S, save } from './state.js';
import { dateKey, parseKey, today, uid } from './utils.js';

export const PRIORITY_NAMES = { 3: 'High', 2: 'Medium', 1: 'Low' };

// Day record: one-off `goals` and `fd` (fixed goal id -> completion timestamp).
export const getDay = (k) => S.days[k] || (S.days[k] = { goals: [], fd: {} });

// All goals for a day: daily "fixed" goals created on/before that day, plus one-off goals.
export function items(k) {
  const d = S.days[k] || { goals: [], fd: {} };
  return S.fixed
    .filter((f) => f.c <= k)
    .map((f) => ({ id: f.id, t: f.t, p: f.p, fx: 1, done: !!d.fd[f.id], at: +d.fd[f.id] || 0 }))
    .concat(d.goals);
}

// Completion % weighted by priority, or null if the day has no goals.
export function pct(k) {
  const all = items(k);
  if (!all.length) return null;
  let total = 0, done = 0;
  all.forEach((g) => {
    total += g.p;
    if (g.done) done += g.p;
  });
  return Math.round((done / total) * 100);
}

// A day counts toward the streak only at 100%. One missed day per 7 is forgiven ("freeze").
export function streaks() {
  const t = today();
  let first = t;
  Object.keys(S.days).forEach((k) => { if (k < first) first = k; });
  S.fixed.forEach((f) => { if (f.c < first) first = f.c; });

  let best = 0, run = 0, i = 0, lastFreeze = -99;
  const frozen = {};
  for (const d = parseKey(first); dateKey(d) <= t; d.setDate(d.getDate() + 1), i++) {
    const k = dateKey(d);
    if (pct(k) === 100) {
      run++;
      best = Math.max(best, run);
    } else if (k !== t) {
      if (run > 0 && i - lastFreeze >= 7) {
        lastFreeze = i;
        frozen[k] = 1;
      } else {
        run = 0;
      }
    }
  }
  return { cur: run, best, fz: frozen, ready: i - lastFreeze >= 7 };
}

export const progressMessage = (p) =>
  p === null ? 'Add your first goal to begin.'
  : p === 0 ? 'A fresh day. Let’s go!'
  : p < 50 ? 'Good start. Keep moving.'
  : p < 100 ? 'Over halfway. Finish strong!'
  : 'Perfect day! You did it 🎉';

export function addGoal(text, priority, repeat) {
  const id = uid();
  if (repeat) S.fixed.push({ id, t: text, p: priority, c: today() });
  else getDay(today()).goals.push({ id, t: text, p: priority, done: false });
  save();
}

export function deleteGoal(id, fixed) {
  if (fixed) {
    S.fixed = S.fixed.filter((f) => f.id !== id);
  } else {
    const d = getDay(today());
    d.goals = d.goals.filter((g) => g.id !== id);
  }
  save();
}

// Flips a goal for today. Returns true if it is now done. Caller saves.
export function toggleGoal(id, fixed) {
  const d = getDay(today());
  if (fixed) {
    const now = !d.fd[id];
    d.fd[id] = now ? Date.now() : 0;
    return now;
  }
  const g = d.goals.find((x) => x.id === id);
  g.done = !g.done;
  g.at = g.done ? Date.now() : 0;
  return g.done;
}
