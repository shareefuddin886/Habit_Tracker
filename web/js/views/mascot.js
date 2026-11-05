// Animated face whose mood follows today's progress. Wears a hat at higher levels.
export function mascot(p, lv) {
  const mood = p === null || p === 0 ? 0 : p < 50 ? 1 : p < 100 ? 2 : 3;
  const color = ['#8aa0b4', '#9ccfb4', '#45d79c', '#f5b942'][mood];
  const eyeR = mood === 2 ? 5 : 6;

  const eyes = mood === 3
    ? `<text x="45" y="58" font-size="20" text-anchor="middle">⭐</text><text x="75" y="58" font-size="20" text-anchor="middle">⭐</text>`
    : `<circle cx="45" cy="52" r="${eyeR}" fill="#1b2b24"/><circle cx="75" cy="52" r="${eyeR}" fill="#1b2b24"/>` +
      (mood === 0
        ? `<path d="M34 42L53 35M86 42L67 35" stroke="#1b2b24" stroke-width="3" stroke-linecap="round"/><ellipse cx="81" cy="68" rx="3" ry="5" fill="#6ec1ff"/>`
        : '');

  const mouth = ['M42 82Q60 66 78 82', 'M44 76Q60 82 76 76', 'M38 72Q60 96 82 72', 'M36 70Q60 106 84 70Z'][mood];

  const blush = mood > 1
    ? `<circle cx="33" cy="68" r="6" fill="#ff8aa5" opacity=".5"/><circle cx="87" cy="68" r="6" fill="#ff8aa5" opacity=".5"/>`
    : '';

  const sparkles = mood === 3
    ? `<text x="4" y="22" font-size="16">✨</text><text x="98" y="26" font-size="16">🎉</text>`
    : '';

  const hat = lv >= 5 ? '<text x="42" y="14" font-size="28">👑</text>'
    : lv >= 3 ? '<text x="42" y="14" font-size="28">🎓</text>'
    : '';

  return `<svg viewBox="0 0 120 120">
    <g class="bob ${mood === 3 ? 'fast' : ''}" ${mood < 1 ? 'style="animation:none"' : ''}>
      <ellipse cx="60" cy="110" rx="30" ry="5" fill="rgba(0,0,0,.2)"/>
      <circle cx="60" cy="60" r="50" fill="${color}"/>
      ${eyes}${blush}
      <path d="${mouth}" fill="${mood === 3 ? '#7a1f2e' : 'none'}" stroke="#1b2b24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>${sparkles}${hat}</svg>`;
}
