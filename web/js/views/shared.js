// Page header with subtitle, title, optional extras, and the theme button.
export function header(subtitle, title, extra = '') {
  const themeBtn = '<button class="ib" data-act="theme">◐</button>';
  const right = extra ? `<div class="hr">${extra}${themeBtn}</div>` : themeBtn;
  return `<div class="hd"><div><div class="mut">${subtitle}</div><h1>${title}</h1></div>${right}</div>`;
}
