import { $ } from './utils.js';

let onConfirm = null;

export function ask(title, text, yesLabel, cb) {
  const m = $('#modal');
  m.innerHTML = `<div class="mb"><h2>${title}</h2><p>${text}</p><div class="seg"><button data-act="no">Not yet</button><button class="on" data-act="yes">${yesLabel}</button></div></div>`;
  m.classList.add('show');
  onConfirm = cb;
}

export function closeModal() {
  $('#modal').classList.remove('show');
}

export function confirmModal() {
  const cb = onConfirm;
  onConfirm = null;
  closeModal();
  if (cb) cb();
}
