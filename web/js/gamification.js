// XP, levels, badges, daily quests and mystery bonuses.
import { S, save } from './state.js';
import { items, pct, streaks } from './goals.js';
import { today } from './utils.js';

const LEVEL_XP = [0, 100, 300, 600, 1000, 1600, 2400];
const LEVEL_NAMES = ['Rookie', 'Focused', 'Grinder', 'Warrior', 'Master', 'Legend', 'Mythic'];

export function level(xp) {
  let i = 0;
  while (i < LEVEL_XP.length - 1 && xp >= LEVEL_XP[i + 1]) i++;
  const next = LEVEL_XP[i + 1];
  return {
    n: i + 1,
    name: LEVEL_NAMES[i],
    nx: next,
    p: next ? Math.round(((xp - LEVEL_XP[i]) / (next - LEVEL_XP[i])) * 100) : 100,
  };
}

export function computeStats() {
  let done = 0, perfect = 0, xp = 0, early = 0, comeback = false, prev = null;

  Object.keys(S.days).sort().forEach((k) => {
    const p = pct(k);
    items(k).forEach((g) => {
      if (!g.done) return;
      done++;
      xp += g.p * 10;
      if (g.at > 1) {
        const h = new Date(g.at).getHours();
        if (h >= 4 && h < 9) early = 1;
      }
    });
    if (p === 100) {
      perfect++;
      xp += 50;
      if (prev !== null && prev < 100) comeback = true;
    }
    if (p !== null) prev = p;
  });

  xp += S.bonus || 0;
  const st = streaks();
  return { done, perfect, xp, early, comeback, best: st.best, cur: st.cur, st, lv: level(xp).n };
}

// [id, icon, name, description, unlocked(stats)]
export const BADGES = [
  ['fs', '🌱', 'First Step', 'Complete 1 goal', (s) => s.done >= 1],
  ['s3', '🔥', '3-Day Spark', '3-day streak', (s) => s.best >= 3],
  ['s7', '🗓️', 'Week Warrior', '7-day streak', (s) => s.best >= 7],
  ['s14', '🏅', 'Fortnight', '14-day streak', (s) => s.best >= 14],
  ['s30', '👑', 'Monthly Legend', '30-day streak', (s) => s.best >= 30],
  ['d50', '🎯', 'Half Century', '50 goals done', (s) => s.done >= 50],
  ['d100', '💯', 'Centurion', '100 goals done', (s) => s.done >= 100],
  ['p5', '⭐', 'Perfectionist', '5 perfect days', (s) => s.perfect >= 5],
  ['eb', '🌅', 'Early Bird', 'Finish a goal before 9am', (s) => s.early],
  ['ck', '🦸', 'Comeback Kid', 'Perfect day after a miss', (s) => s.comeback],
  ['l3', '🚀', 'Grinder', 'Reach level 3', (s) => s.lv >= 3],
];

// [description, isComplete(todaysGoals)]
const QUESTS = [
  ['Complete 3 goals today', (a) => a.filter((g) => g.done).length >= 3],
  ['Finish 2 High priority goals', (a) => a.filter((g) => g.done && g.p === 3).length >= 2],
  ['Complete a goal before 10am', (a) => a.some((g) => g.done && g.at > 1 && new Date(g.at).getHours() < 10)],
  ['Reach 75% today', () => (pct(today()) || 0) >= 75],
  ['Finish every High priority goal', (a) => {
    const high = a.filter((g) => g.p === 3);
    return high.length > 0 && high.every((g) => g.done);
  }],
];

export const todaysQuest = () => QUESTS[+today().replace(/-/g, '') % QUESTS.length];

// Runs after a goal is completed. Awards quest/bonus XP, badges and levels,
// and returns a message to show (or null).
export function checkUp() {
  let msg = null;
  const k = today();

  if (!(S.qd || {})[k] && todaysQuest()[1](items(k))) {
    (S.qd = S.qd || {})[k] = 1;
    S.bonus = (S.bonus || 0) + 25;
    msg = '🎯 Daily quest complete! +25 XP';
  } else if (Math.random() < 0.15) {
    const x = 5 + ((Math.random() * 20) | 0);
    S.bonus = (S.bonus || 0) + x;
    msg = '🎁 Mystery bonus! +' + x + ' XP';
  }

  const s = computeStats();
  S.sb = S.sb || [];
  BADGES.forEach((b) => {
    if (b[4](s) && !S.sb.includes(b[0])) {
      S.sb.push(b[0]);
      msg = '🏅 Badge unlocked: ' + b[2];
    }
  });

  const L = level(s.xp);
  if (L.n > (S.lv || 1)) msg = '⬆️ Level up! You’re now ' + L.name;
  S.lv = Math.max(S.lv || 1, L.n);

  save();
  return msg;
}
