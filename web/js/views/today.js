import { S, ui } from '../state.js';
import { items, pct, streaks, progressMessage, PRIORITY_NAMES } from '../goals.js';
import { computeStats, level, todaysQuest } from '../gamification.js';
import { dateKey, esc, today } from '../utils.js';
import { header } from './shared.js';
import { mascot } from './mascot.js';

function xpCard() {
  const s = computeStats(), L = level(s.xp);
  return `<div class="card">
    <div class="cn"><h2 style="margin:0">Lv ${L.n} · ${L.name}</h2><span class="chip">⚡ ${s.xp} XP</span></div>
    <div class="mt"><i style="width:${L.p}%"></i></div>
    <div class="mut" style="margin-top:6px">${L.nx ? (L.nx - s.xp) + ' XP to Lv ' + (L.n + 1) : 'Max level reached'} · ${s.st.ready ? '❄️ Streak freeze ready' : '❄️ Freeze used recently'}</div>
  </div>`;
}

function questCard() {
  const q = todaysQuest(), done = !!(S.qd || {})[today()];
  return `<div class="card"><div class="mut">DAILY QUEST · +25 XP</div><div class="big" style="margin:4px 0 0">${done ? '✅' : '🎯'} ${q[0]}</div></div>`;
}

// Warning about yesterday if it wasn't a perfect day.
function yesterdayBanner() {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const k = dateKey(y);
  if (!items(k).length || pct(k) === 100) return '';
  return streaks().fz[k]
    ? `<div class="card warn">❄️ Your streak freeze saved you yesterday. Don’t waste it. Finish today!</div>`
    : `<div class="card warn">💔 You didn’t finish yesterday’s goals, so your streak reset. Today is your comeback.</div>`;
}

// 17-week consistency heatmap, one column per week.
function heatmap() {
  const now = new Date(), st = streaks(), start = new Date(now);
  start.setDate(start.getDate() - now.getDay() - 7 * 16);
  let cells = '';
  for (let i = 0; i < 119; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = dateKey(d);
    let cls = '', a = 0;
    if (d > now) cls = 'fu';
    else {
      const p = pct(k);
      if (st.fz[k]) cls = 'fr';
      else if (p === null) cls = '';
      else if (p === 0) cls = k === today() ? '' : 'ms';
      else { cls = 'v'; a = p; }
    }
    cells += `<i class="hc ${cls}" style="--a:${a}" title="${k}"></i>`;
  }
  return `<div class="card"><h2>Consistency</h2><div class="heat">${cells}</div><div class="mut" style="margin-top:8px">🟩 done · 🟥 missed · 🟦 freeze saved</div></div>`;
}

function goalRow(g) {
  return `<div class="g p${g.p} ${g.done ? 'done' : ''}">
    <button class="ck" data-act="chk" data-id="${g.id}" data-fx="${g.fx ? 1 : 0}">✓</button>
    <div class="gt">
      <div class="tx">${esc(g.t)}</div>
      <div class="tags"><span class="tag pr${g.p}">${PRIORITY_NAMES[g.p]}</span>${g.fx ? '<span class="tag">Daily</span>' : ''}</div>
    </div>
    <button class="x" data-act="del" data-id="${g.id}" data-fx="${g.fx ? 1 : 0}">✕</button>
  </div>`;
}

function addGoalCard() {
  const priorities = [3, 2, 1]
    .map((n) => `<button data-act="pri" data-p="${n}" class="${ui.priority === n ? 'on' : ''}">${PRIORITY_NAMES[n]}</button>`)
    .join('');
  return `<div class="card">
    <h2>Add a goal</h2>
    <input id="gt" type="text" placeholder="e.g. Study 2 hours" maxlength="80">
    <div class="seg">${priorities}</div>
    <label class="rp"><input type="checkbox" id="rep"> Repeat every day (fixed goal)</label>
    <button class="btn" data-act="add">Add goal</button>
  </div>`;
}

export function todayView() {
  const k = today();
  const goals = items(k).sort((x, y) => x.done - y.done || y.p - x.p);
  const p = pct(k);
  const doneCount = goals.filter((g) => g.done).length;
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return `${header(date, 'Today', `<span class="chip">🔥 ${streaks().cur}</span>`)}
    <div class="card hero ${p === 100 ? 'perfect' : ''}">
      <div class="mc">${mascot(p, level(computeStats().xp).n)}</div>
      <div class="hi">
        <div class="hrow">
          <div>
            <div class="big">${goals.length ? `${doneCount} of ${goals.length} goals` : 'No goals yet'}</div>
            <div class="mut">${progressMessage(p)}</div>
          </div>
          <div class="pc">${p ?? 0}<small>%</small></div>
        </div>
        <div class="mt hb"><i style="width:${p || 0}%"></i></div>
        <div class="hstats">
          <span>🔥 ${streaks().cur}-day streak</span>
          <span>✅ ${doneCount} done</span>
          <span>⏳ ${goals.length - doneCount} left</span>
        </div>
      </div>
    </div>
    ${yesterdayBanner()}${xpCard()}${questCard()}
    <div class="card"><h2>Today’s goals</h2>${goals.length ? goals.map(goalRow).join('') : '<div class="mut">No goals yet. Add one below.</div>'}</div>
    ${addGoalCard()}${heatmap()}`;
}
