// GET /api/stats  (header "x-admin-key: <ADMIN_PASSWORD>") — usage numbers for the admin page.
const crypto = require('crypto');
const { redis, lastDays } = require('./_lib');

const DAYS = 30;

// Constant-time password comparison.
function same(a, b) {
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server.' });
  if (!same(req.headers['x-admin-key'] || '', password)) return res.status(401).json({ error: 'Wrong password.' });

  try {
    const days = lastDays(DAYS);
    const results = await redis([
      ['SCARD', 'users:all'],
      ['PFCOUNT', ...days.slice(-7).map((d) => `users:${d}`)],
      ['PFCOUNT', ...days.map((d) => `users:${d}`)],
      ...days.map((d) => ['PFCOUNT', `users:${d}`]),
      ...days.map((d) => ['HGETALL', `events:${d}`]),
    ]);

    const [total, active7, active30] = results;
    const counts = results.slice(3, 3 + DAYS);
    const events = results.slice(3 + DAYS);

    res.status(200).json({
      total,
      active7,
      active30,
      days: days.map((d, i) => {
        const flat = events[i] || [], ev = {};
        for (let j = 0; j < flat.length; j += 2) ev[flat[j]] = +flat[j + 1];
        return { day: d, users: counts[i], ...ev };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not read stats. Is the Redis database connected?' });
  }
};
