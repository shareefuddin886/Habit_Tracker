// `S` is the saved data (localStorage). `ui` is temporary screen state.
import { today } from './utils.js';

const STORAGE_KEY = 'goals.tracker.v1';
const defaults = () => ({ fixed: [], days: {}, theme: '' });

export const S = defaults();

try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) Object.assign(S, JSON.parse(raw));
} catch (e) {}

export const ui = {
  tab: 'today',
  priority: 2,
  selected: today(),
  month: new Date(),
};

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {}
}

// Replaces all saved data (used by "Restore backup").
export function replaceState(data) {
  Object.keys(S).forEach((k) => delete S[k]);
  Object.assign(S, defaults(), data);
  save();
}

export function applyTheme() {
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  else delete document.documentElement.dataset.theme;
}

// auto -> dark -> light -> auto
export function cycleTheme() {
  S.theme = S.theme === '' ? 'dark' : S.theme === 'dark' ? 'light' : '';
  save();
}
