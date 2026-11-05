// Shared helpers for the API functions. Files starting with "_" are not routes on Vercel.
// Works with Upstash Redis added from the Vercel Marketplace (env vars are injected automatically).
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Day boundaries for the stats. Override with STATS_TZ (e.g. "Asia/Kolkata").
const TZ = process.env.STATS_TZ || 'UTC';

// Runs several Redis commands in one HTTP request and returns their results in order.
async function redis(commands) {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error('Redis is not configured');
  const r = await fetch(REDIS_URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('Redis HTTP ' + r.status);
  return (await r.json()).map((x) => {
    if (x.error) throw new Error(x.error);
    return x.result;
  });
}

// "YYYY-MM-DD" for a date, in the stats time zone.
const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: TZ });

// The last `n` day keys, oldest first, ending today.
function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(Date.now() - i * 86400000)));
  return out;
}

module.exports = { redis, dayKey, lastDays };
