import { S } from '../state.js';
import { items, pct } from '../goals.js';
import { esc, parseKey, today } from '../utils.js';
import { header } from './shared.js';

function dayCard(k) {
  const goals = items(k).sort((x, y) => y.done - x.done || x.at - y.at), p = pct(k);
  const title = parseKey(k).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const rows = goals.map((g) => {
    const time = g.at > 1
      ? `<span class="mut"> · ${new Date(g.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>`
      : '';
    return `<div class="lg ${g.done ? '' : 'no'}">${g.done ? '✅' : '⬜'} ${esc(g.t)}${time}</div>`;
  }).join('');

  return `<div class="card">
    <div class="cn"><h2 style="margin:0">${title}</h2><span class="chip">${p}%</span></div>
    <div class="b2"><i style="width:${p}%"></i></div>
    ${rows}
  </div>`;
}

export function journalView() {
  const keys = [...new Set(Object.keys(S.days).concat(today()))]
    .filter((k) => items(k).length)
    .sort()
    .reverse();

  return header('Everything you did', 'Journal') + (keys.length
    ? keys.map(dayCard).join('')
    : '<div class="card mut">Nothing recorded yet. Complete a goal and it will show up here.</div>');
}
