(() => {
  const supportsMatchMedia = typeof window.matchMedia === 'function';
  const reduce = supportsMatchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raf = window.requestAnimationFrame || ((cb) => window.setTimeout(cb, 16));
  const supportsCssAnimations = typeof window.CSS !== 'undefined'
    && typeof window.CSS.supports === 'function'
    && (window.CSS.supports('animation-name:heartFall') || window.CSS.supports('-webkit-animation-name:heartFall'));

  const floatingHearts = [];
  let popLayer;

  function makeRain() {
    const wrap = document.createElement('div');
    const classes = ['heart-rain'];
    if (reduce) classes.push('reduced');
    if (!supportsCssAnimations) classes.push('no-css-anim');
    wrap.className = classes.join(' ');

    const total = reduce ? 12 : 34;
    for (let i = 0; i < total; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'drop-heart';
      heart.textContent = Math.random() > 0.5 ? '♥' : '❤';

      const size = 20 + Math.random() * 26;
      const left = Math.random() * 100;
      const drift = -90 + Math.random() * 180;
      heart.style.left = `${left}%`;
      heart.style.fontSize = `${size}px`;
      heart.style.animationDuration = `${6 + Math.random() * 7}s`;
      heart.style.webkitAnimationDuration = heart.style.animationDuration;
      heart.style.animationDelay = `${-Math.random() * 10}s`;
      heart.style.webkitAnimationDelay = heart.style.animationDelay;
      heart.style.setProperty('--drift', `${drift}px`);

      if (reduce) {
        heart.style.top = 'auto';
        heart.style.bottom = `${6 + Math.random() * 84}vh`;
        heart.style.opacity = `${0.45 + Math.random() * 0.4}`;
      }

      if (!supportsCssAnimations && !reduce) {
        floatingHearts.push({
          el: heart,
          x: left,
          y: -10 - Math.random() * 90,
          vx: drift / (7 + Math.random() * 8),
          vy: 9 + Math.random() * 8,
          rot: Math.random() * 280,
          vr: 30 + Math.random() * 30,
        });
      }

      wrap.appendChild(heart);
    }

    document.body.appendChild(wrap);
  }

  function runRainFallback() {
    if (!floatingHearts.length) return;
    function tick() {
      for (let i = 0; i < floatingHearts.length; i += 1) {
        const item = floatingHearts[i];
        item.x += item.vx * 0.02;
        item.y += item.vy * 0.03;
        item.rot += item.vr * 0.02;
        if (item.y > 110) {
          item.y = -12;
          item.x = Math.random() * 100;
        }
        item.el.style.left = `${item.x}%`;
        item.el.style.transform = `translate3d(0, ${item.y}vh, 0) rotate(${item.rot}deg)`;
        item.el.style.opacity = item.y < 5 ? String(item.y / 5) : String(Math.max(0, (110 - item.y) / 16));
      }
      raf(tick);
    }
    raf(tick);
  }

  function makeOrbitHeart() {
    const layer = document.createElement('div');
    layer.className = `orbit-heart${reduce ? ' reduced' : ''}`;

    const core = document.createElement('div');
    core.className = 'heart-core';
    core.textContent = '💗';
    layer.appendChild(core);
    document.body.appendChild(layer);

    if (reduce) {
      core.style.left = '86vw';
      core.style.top = '14vh';
      return;
    }

    let t = Math.random() * Math.PI * 2;
    function tick() {
      t += 0.015;
      const w = window.innerWidth || document.documentElement.clientWidth || 1024;
      const h = window.innerHeight || document.documentElement.clientHeight || 768;
      const cx = w * 0.5;
      const cy = h * 0.4;
      const rx = Math.max(160, w * 0.3);
      const ry = Math.max(110, h * 0.2);

      core.style.left = `${cx + Math.cos(t) * rx}px`;
      core.style.top = `${cy + Math.sin(t * 1.35) * ry}px`;
      raf(tick);
    }

    raf(tick);
  }

  function ensurePopLayer() {
    popLayer = document.createElement('div');
    popLayer.className = 'romance-pop-layer';
    document.body.appendChild(popLayer);
  }

  function popRomance(x, y, count = 1) {
    if (!popLayer) return;
    const emojis = ['💖', '💘', '💕', '✨', '🫶'];
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = 'romance-pop';
      el.textContent = emojis[(Math.random() * emojis.length) | 0];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      popLayer.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 36;
      const tx = Math.cos(angle) * dist;
      const ty = -24 - Math.random() * 26 + Math.sin(angle) * 10;
      const rotate = Math.random() * 90 - 45;

      if (el.animate) {
        el.animate(
          [
            { transform: 'translate3d(-50%, -50%, 0) scale(0.7)', opacity: 0 },
            { transform: 'translate3d(-50%, -50%, 0) scale(1)', opacity: 0.95, offset: 0.2 },
            { transform: `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0) scale(0.3) rotate(${rotate}deg)`, opacity: 0 }
          ],
          { duration: 780 + Math.random() * 200, easing: 'ease-out' }
        );
      } else {
        el.style.transition = 'transform 820ms ease-out, opacity 820ms ease-out';
        el.style.opacity = '0.9';
        window.setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0) scale(.3) rotate(${rotate}deg)`;
        }, 20);
      }

      window.setTimeout(() => el.remove(), 1100);
    }
  }

  function wireInteractions() {
    let last = 0;
    function moveHandler(event) {
      const now = Date.now();
      if (now - last < 120) return;
      last = now;
      popRomance(event.clientX, event.clientY, 1);
    }

    window.addEventListener('pointermove', moveHandler, { passive: true });
    window.addEventListener('click', (event) => {
      popRomance(event.clientX, event.clientY, 5);
    }, { passive: true });

    const romanticTargets = document.querySelectorAll('.card, .stage, .grid');
    romanticTargets.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        const rect = el.getBoundingClientRect();
        popRomance(rect.left + rect.width * 0.5, rect.top + Math.min(60, rect.height * 0.3), 4);
      }, { passive: true });
    });
  }

  function init() {
    if (!document.body || document.querySelector('.heart-rain')) return;
    makeRain();
    makeOrbitHeart();
    ensurePopLayer();
    wireInteractions();
    runRainFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
