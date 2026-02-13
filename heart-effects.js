(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      wrap.appendChild(heart);
    }

    document.body.appendChild(wrap);
  }

  function makeOrbitHeart() {
    const layer = document.createElement('div');
    layer.className = 'orbit-heart';

    const core = document.createElement('div');
    core.className = 'heart-core';
    core.textContent = '💗';
    layer.appendChild(core);
    document.body.appendChild(layer);

    let t = Math.random() * Math.PI * 2;

    function tick() {
      t += 0.012;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5;
      const cy = h * 0.42;
      const rx = Math.max(120, w * 0.24);
      const ry = Math.max(90, h * 0.15);

      const x = cx + Math.cos(t) * rx;
      const y = cy + Math.sin(t * 1.3) * ry;
      core.style.left = `${x}px`;
      core.style.top = `${y}px`;

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('DOMContentLoaded', () => {
    makeRain();
    makeOrbitHeart();
  });
})();
