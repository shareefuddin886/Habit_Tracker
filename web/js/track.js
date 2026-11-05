// Anonymous usage tracking for the admin page. Sends only a random browser id + event name.
// Disabled when running locally so testing doesn't pollute the numbers.
const ID_KEY = 'goals.tracker.uid';
const LOCAL = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);

function browserId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch (e) {
    return null;
  }
}

export function track(event) {
  if (LOCAL) return;
  const id = browserId();
  if (!id) return;
  const body = JSON.stringify({ id, e: event });
  try {
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', body))) {
      fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch (e) {}
}
