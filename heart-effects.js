(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
<<<<<<< HEAD
  if (reduce) return;

  function makeRain() {
    const wrap = document.createElement('div');
    wrap.className = 'heart-rain';

    for (let i = 0; i < 20; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'drop-heart';
      heart.textContent = Math.random() > 0.35 ? '❤' : '💖';
      const size = 14 + Math.random() * 18;
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${size}px`;
      heart.style.animationDuration = `${7 + Math.random() * 8}s`;
      heart.style.animationDelay = `${-Math.random() * 12}s`;
      heart.style.setProperty('--drift', `${-55 + Math.random() * 110}px`);
      heart.style.opacity = `${0.35 + Math.random() * 0.45}`;
=======

  function makeRain() {
    const wrap = document.createElement('div');
    wrap.className = `heart-rain${reduce ? ' reduced' : ''}`;

    const total = reduce ? 10 : 28;
    for (let i = 0; i < total; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'drop-heart';
      heart.textContent = Math.random() > 0.5 ? '❤' : '💖';

      const size = 18 + Math.random() * 22;
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${size}px`;
      heart.style.animationDuration = `${6 + Math.random() * 7}s`;
      heart.style.animationDelay = `${-Math.random() * 10}s`;
      heart.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);

      if (reduce) {
        heart.style.bottom = `${6 + Math.random() * 84}vh`;
        heart.style.opacity = `${0.3 + Math.random() * 0.45}`;
      }

>>>>>>> codex/enhance-website-with-animations-for-valentine-q90r5u
      wrap.appendChild(heart);
    }

    document.body.appendChild(wrap);
  }

  function makeOrbitHeart() {
    const layer = document.createElement('div');
<<<<<<< HEAD
    layer.className = 'orbit-heart';
=======
    layer.className = `orbit-heart${reduce ? ' reduced' : ''}`;
>>>>>>> codex/enhance-website-with-animations-for-valentine-q90r5u

    const core = document.createElement('div');
    core.className = 'heart-core';
    core.textContent = '💗';
    layer.appendChild(core);
    document.body.appendChild(layer);

<<<<<<< HEAD
    let t = Math.random() * Math.PI * 2;

    function tick() {
      t += 0.012;
=======
    if (reduce) {
      core.style.left = '86vw';
      core.style.top = '14vh';
      return;
    }

    let t = Math.random() * Math.PI * 2;

    function tick() {
      t += 0.015;
>>>>>>> codex/enhance-website-with-animations-for-valentine-q90r5u
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5;
      const cy = h * 0.42;
<<<<<<< HEAD
      const rx = Math.max(120, w * 0.24);
      const ry = Math.max(90, h * 0.15);

      const x = cx + Math.cos(t) * rx;
      const y = cy + Math.sin(t * 1.3) * ry;
=======
      const rx = Math.max(160, w * 0.28);
      const ry = Math.max(110, h * 0.2);

      const x = cx + Math.cos(t) * rx;
      const y = cy + Math.sin(t * 1.35) * ry;
>>>>>>> codex/enhance-website-with-animations-for-valentine-q90r5u
      core.style.left = `${x}px`;
      core.style.top = `${y}px`;

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

<<<<<<< HEAD
  window.addEventListener('DOMContentLoaded', () => {
    makeRain();
    makeOrbitHeart();
  });
=======
  function init() {
    if (!document.body) return;
    makeRain();
    makeOrbitHeart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
>>>>>>> codex/enhance-website-with-animations-for-valentine-q90r5u
})();
