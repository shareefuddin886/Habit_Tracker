// Entry point: rendering, tab navigation and all click handling.
import { S, ui, save, replaceState, applyTheme, cycleTheme } from './state.js';
import { items, pct, addGoal, deleteGoal, toggleGoal } from './goals.js';
import { checkUp } from './gamification.js';
import { celebrate, praise } from './effects.js';
import { ask, closeModal, confirmModal } from './modal.js';
import { $, esc, today, uid } from './utils.js';
import { track } from './track.js';
import { todayView } from './views/today.js';
import { calendarView } from './views/calendar.js';
import { journalView } from './views/journal.js';
import { statsView } from './views/stats.js';

const TABS = [
  ['today', '✅ Today', todayView],
  ['cal', '📅 Month', calendarView],
  ['log', '📝 Journal', journalView],
  ['stats', '📊 Stats', statsView],
];

function render() {
  applyTheme();
  const view = TABS.find((t) => t[0] === ui.tab)[2];
  $('#app').innerHTML = view();
  $('#tabs').innerHTML = TABS
    .map(([id, label]) => `<button class="${ui.tab === id ? 'on' : ''}" data-act="tab" data-t="${id}">${label}</button>`)
    .join('');
}

function onToggle(id, fixed) {
  const k = today(), before = pct(k);
  const nowDone = toggleGoal(id, fixed);
  const msg = nowDone ? checkUp() : null;
  save();
  render();
  if (!nowDone) return;
  track('goal_done');
  const justFinished = pct(k) === 100 && before !== 100;
  if (justFinished) track('perfect_day');
  if (justFinished) celebrate();
  if (!justFinished || msg) praise(msg);
}

function onAddGoal() {
  const text = $('#gt').value.trim();
  if (!text) { $('#gt').focus(); return; }
  addGoal(text, ui.priority, $('#rep').checked);
  track('goal_add');
  render();
}

function onRestore() {
  try {
    const data = JSON.parse($('#bk').value);
    if (!data.days || !data.fixed) throw 0;
    replaceState(data);
    render();
  } catch (err) {
    $('#bk').value = '';
    $('#bk').placeholder = 'That backup didn’t look right. Try again.';
  }
}

const actions = {
  yes: () => confirmModal(),
  no: () => closeModal(),
  tab: (D) => { ui.tab = D.t; render(); },
  theme: () => { cycleTheme(); render(); },
  pri: (D) => {
    ui.priority = +D.p;
    document.querySelectorAll('.seg [data-act=pri]').forEach((b) => b.classList.toggle('on', +b.dataset.p === ui.priority));
  },
  add: onAddGoal,
  chk: (D) => {
    const fixed = D.fx === '1', g = items(today()).find((x) => x.id === D.id);
    if (g.done) onToggle(D.id, fixed);
    else ask('Are you sure?', 'Did you really complete “' + esc(g.t) + '”? Be honest with yourself 😉', 'Yes, I did it', () => onToggle(D.id, fixed));
  },
  del: (D) => {
    const fixed = D.fx === '1';
    ask('Delete goal?', fixed ? 'This daily goal will stop appearing from now on.' : 'This goal will be removed.', 'Delete', () => {
      deleteGoal(D.id, fixed);
      render();
    });
  },
  radd: () => {
    const t = $('#rt').value.trim(), n = Math.max(1, +$('#rn').value || 7);
    if (!t) return;
    (S.rw = S.rw || []).push({ id: uid(), t, n });
    save();
    render();
  },
  rdel: (D) => { S.rw = (S.rw || []).filter((r) => r.id !== D.id); save(); render(); },
  sel: (D) => { ui.selected = D.k; render(); },
  prev: () => { ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() - 1, 1); render(); },
  next: () => { ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() + 1, 1); render(); },
  copy: () => {
    const t = $('#bk');
    t.value = JSON.stringify(S);
    t.select();
    try { navigator.clipboard.writeText(t.value); } catch (err) {}
  },
  restore: onRestore,
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && actions[el.dataset.act]) actions[el.dataset.act](el.dataset);
});

render();
track('open');
