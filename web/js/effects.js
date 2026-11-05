// Fireworks/confetti canvas and the praise toast.
import { $ } from './utils.js';

const COLORS = ['#45d79c', '#f5b942', '#ff6b81', '#6ea8fe', '#ffffff'];

const PRAISE = [
  'Boom! Another one down 💥', 'Look at you go! 🚀', 'That’s how it’s done, champion 🏆',
  'Discipline looks good on you 😎', 'Crushed it! 💪', 'Unstoppable today 🔥',
  'Your future self says thank you 🙌', 'Legend behavior right there ⭐', 'One step closer to the top 📈',
  'Nailed it. Keep that energy! ⚡', 'Proud of you. Seriously. 💚', 'Smooth. Absolutely smooth. 😌',
];
let lastPraise = -1;

// `mini` = one small burst. Otherwise full fireworks + confetti + 100% banner.
export function celebrate(mini) {
  const canvas = $('#fx');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  let sparks = [], confetti = [];
  const end = performance.now() + (mini ? 1300 : 4600);

  const burst = () => {
    const cx = innerWidth * (0.15 + Math.random() * 0.7);
    const cy = innerHeight * (0.12 + Math.random() * 0.4);
    const col = COLORS[(Math.random() * 5) | 0];
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * 6.283, s = 1.5 + Math.random() * 5;
      sparks.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c: Math.random() < 0.3 ? '#fff' : col });
    }
  };

  for (let i = 0; i < (mini ? 1 : 8); i++) setTimeout(burst, i * 350);

  if (!mini) {
    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * innerWidth, y: -20 - Math.random() * 500,
        vx: Math.random() * 2 - 1, vy: 2 + Math.random() * 3,
        r: 0, vr: Math.random() * 0.3, c: COLORS[(Math.random() * 5) | 0],
      });
    }
    const banner = $('#bn');
    banner.classList.remove('show');
    void banner.offsetWidth; // restart animation
    banner.classList.add('show');
  }

  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter((p) => p.l > 0);
    confetti = confetti.filter((q) => q.y < innerHeight + 20);

    confetti.forEach((q) => {
      q.x += q.vx + Math.sin(q.y / 30);
      q.y += q.vy;
      q.r += q.vr;
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.r);
      ctx.fillStyle = q.c;
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    });

    sparks.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.vx *= 0.985;
      p.l -= 0.011;
      ctx.globalAlpha = Math.max(p.l, 0);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, 6.283);
      ctx.fill();
    });

    if (sparks.length || confetti.length || performance.now() < end) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

// Shows `message`, or a random praise line if none, with a small burst.
export function praise(message) {
  let i;
  do i = (Math.random() * PRAISE.length) | 0;
  while (i === lastPraise);
  lastPraise = i;

  const toast = $('#pt');
  toast.textContent = message || PRAISE[i];
  toast.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(() => toast.classList.remove('show'), 2300);
  celebrate(true);
}
