import { S } from '../state.js';
import { items, pct, streaks } from '../goals.js';
import { BADGES, computeStats } from '../gamification.js';
import { dateKey, esc } from '../utils.js';
import { header } from './shared.js';

// Average % over 7 days, starting `offset` days ago.
function weekAverage(offset) {
  let sum = 0, count = 0;
  for (let i = offset; i < offset + 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const p = pct(dateKey(d));
    if (p !== null) { sum += p; count++; }
  }
  return count ? Math.round(sum / count) : 0;
}

function last7DaysCard() {
  let bars = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const p = pct(dateKey(d));
    bars += `<div class="bc"><div class="mut">${p === null ? '' : p}</div><div class="b" style="height:${p || 0}%"></div><div class="mut">${d.toLocaleDateString(undefined, { weekday: 'narrow' })}</div></div>`;
  }
  return `<div class="card"><h2>Last 7 days</h2><div class="bars">${bars}</div></div>`;
}

function totalsGrid() {
  const st = streaks(), keys = Object.keys(S.days);
  let perfect = 0, done = 0;
  keys.forEach((k) => {
    if (pct(k) === 100) perfect++;
    done += items(k).filter((g) => g.done).length;
  });
  const tile = (n, label) => `<div class="card st"><b>${n}</b><span class="mut">${label}</span></div>`;
  return `<div class="grid">${tile(st.cur, 'Current streak')}${tile(st.best, 'Best streak')}${tile(perfect, 'Perfect days')}${tile(done, 'Goals completed')}</div>`;
}

function weeklyAverageCard() {
  return `<div class="card"><h2>Weekly average</h2><div class="big" style="color:var(--acc)">${weekAverage(0)}%</div><div class="mut">A day counts toward your streak only at 100%.</div></div>`;
}

function reportCard() {
  const a = weekAverage(0), diff = a - weekAverage(7);
  const grade = a >= 90 ? 'A+' : a >= 80 ? 'A' : a >= 70 ? 'B' : a >= 60 ? 'C' : a >= 40 ? 'D' : 'F';
  return `<div class="card"><h2>Weekly report card</h2><div class="cn">
    <div><div class="big" style="font-size:32px;color:var(--acc)">${a}%</div><div class="mut">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)}% vs last week</div></div>
    <div class="chip" style="font-size:28px">${grade}</div>
  </div></div>`;
}

function badgesCard() {
  const s = computeStats(), unlocked = BADGES.filter((b) => b[4](s)).length;
  const tiles = BADGES.map((b) =>
    `<div class="bd ${b[4](s) ? '' : 'lk'}"><div style="font-size:30px">${b[1]}</div><b>${b[2]}</b><small>${b[3]}</small></div>`
  ).join('');
  return `<div class="card"><div class="cn"><h2 style="margin:0">Badges</h2><span class="chip">${unlocked}/${BADGES.length}</span></div><div class="grid" style="grid-template-columns:repeat(3,1fr)">${tiles}</div></div>`;
}

function rewardsCard() {
  const s = computeStats();
  const rows = (S.rw || []).map((r) => {
    const status = s.perfect >= r.n
      ? '🎁 <b>' + esc(r.t) + '</b> unlocked!'
      : '🔒 ' + esc(r.t) + ' <span class="mut">· ' + s.perfect + '/' + r.n + ' perfect days</span>';
    return `<div class="lg">${status} <button class="x" data-act="rdel" data-id="${r.id}">✕</button></div>`;
  }).join('');
  return `<div class="card">
    <h2>My rewards</h2>
    <div class="mut" style="margin-bottom:10px">Set a real treat and unlock it with perfect days.</div>
    ${rows}
    <input id="rt" type="text" placeholder="e.g. Watch a movie" maxlength="50" style="margin-top:8px">
    <div class="seg"><input id="rn" class="num" type="number" min="1" max="100" value="7"><button data-act="radd">Add reward (perfect days)</button></div>
  </div>`;
}

function backupCard() {
  return `<div class="card">
    <h2>Backup</h2>
    <div class="mut" style="margin-bottom:10px">Data lives only in this browser. Copy a backup to keep it safe, or paste one to restore.</div>
    <textarea id="bk" rows="3" placeholder="Paste a backup here to restore"></textarea>
    <div class="seg"><button data-act="copy">Copy backup</button><button data-act="restore">Restore</button></div>
  </div>`;
}

export function statsView() {
  return header('Your progress', 'Stats')
    + last7DaysCard() + totalsGrid() + weeklyAverageCard()
    + reportCard() + badgesCard() + rewardsCard() + backupCard();
}
