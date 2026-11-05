export const $ = (sel) => document.querySelector(sel);

export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const pad = (n) => String(n).padStart(2, '0');

// Dates are stored as "YYYY-MM-DD" keys in local time.
export const dateKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

export const parseKey = (k) => {
  const [y, m, d] = k.split('-');
  return new Date(+y, m - 1, +d);
};

export const today = () => dateKey(new Date());

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
