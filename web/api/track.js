// POST /api/track  { id, e }  — records one anonymous usage event.
// `id` is a random per-browser id; no goal text or personal data is ever sent.
const { redis, dayKey } = require('./_lib');

const EVENTS = new Set(['open', 'goal_add', 'goal_done', 'perfect_day']);
const TTL = 60 * 60 * 24 * 400; // keep daily data ~13 months

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  const id = body && body.id, event = body && body.e;
  if (typeof id !== 'string' || !/^[\w-]{8,64}$/.test(id) || !EVENTS.has(event)) {
    return res.status(400).end();
  }

  try {
    const day = dayKey();
    const [isNew] = await redis([
      ['SADD', 'users:all', id],             // every browser ever seen (exact count)
      ['PFADD', `users:${day}`, id],         // active browsers per day (HyperLogLog)
      ['EXPIRE', `users:${day}`, TTL],
      ['HINCRBY', `events:${day}`, event, 1],
      ['EXPIRE', `events:${day}`, TTL],
    ]);
    if (isNew === 1) await redis([['HINCRBY', `events:${day}`, 'new_user', 1]]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
