import { ui } from '../state.js';
import { items, pct } from '../goals.js';
import { esc, pad, parseKey, today } from '../utils.js';
import { header } from './shared.js';

export function calendarView() {
  const y = ui.month.getFullYear(), m = ui.month.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const t = today();

  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="dw">${d}</div>`).join('')
    + '<div></div>'.repeat(firstWeekday);

  for (let i = 1; i <= daysInMonth; i++) {
    const k = y + '-' + pad(m + 1) + '-' + pad(i), p = pct(k), future = k > t;
    const cls = [
      p !== null && !future ? 'v' : '',
      p === 100 ? 'full' : '',
      k === t ? 't' : '',
      k === ui.selected ? 'sel' : '',
    ].join(' ');
    const label = future || p === null ? '' : p === 100 ? '✓' : p + '%';
    cells += `<button class="c ${cls}" style="--a:${p || 0}" data-act="sel" data-k="${k}">${i}<small>${label}</small></button>`;
  }

  const goals = items(ui.selected), sp = pct(ui.selected);
  const monthName = ui.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const dayName = parseKey(ui.selected).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  return `${header('Your history', 'Calendar')}
    <div class="card">
      <div class="cn"><button class="ib" data-act="prev">‹</button><h2 style="margin:0">${monthName}</h2><button class="ib" data-act="next">›</button></div>
      <div class="cal">${cells}</div>
    </div>
    <div class="card">
      <h2>${dayName} ${sp === null ? '' : '· ' + sp + '%'}</h2>
      ${goals.length
        ? goals.map((g) => `<div class="mut" style="padding:4px 0;font-size:15px">${g.done ? '✅' : '⬜'} ${esc(g.t)}</div>`).join('')
        : '<div class="mut">No goals on this day.</div>'}
    </div>`;
}
