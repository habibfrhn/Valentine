(() => {
  const KEY_TIME = 'valentine_audio_time';
  const KEY_ALLOWED = 'valentine_audio_allowed';
  const SOURCE = '/audio/baby-blue.mp3';
  let audio;

  function saveTime() {
    if (!audio || Number.isNaN(audio.currentTime)) return;
    try { localStorage.setItem(KEY_TIME, String(audio.currentTime)); } catch (e) {}
  }

  function resumeTime() {
    const raw = localStorage.getItem(KEY_TIME);
    const t = raw ? parseFloat(raw) : 0;
    if (!Number.isFinite(t) || t < 0) return;
    const seek = () => {
      try { audio.currentTime = t; } catch (e) {}
    };
    if (audio.readyState > 0) seek();
    else audio.addEventListener('loadedmetadata', seek, { once: true });
  }

  function tryPlay() {
    if (!audio) return;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        localStorage.setItem(KEY_ALLOWED, 'yes');
      }).catch(() => {});
    }
  }

  function unlockAndPlay() {
    localStorage.setItem(KEY_ALLOWED, 'yes');
    tryPlay();
  }

  function init() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // still allow manual play
    }
    audio = document.createElement('audio');
    audio.id = 'global-romance-audio';
    audio.src = SOURCE;
    audio.loop = true;
    audio.preload = 'auto';
    audio.autoplay = true;
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';
    document.body.appendChild(audio);

    resumeTime();
    if (localStorage.getItem(KEY_ALLOWED) === 'yes') {
      tryPlay();
    } else {
      tryPlay();
    }

    const unlockEvents = ['pointerdown', 'touchstart', 'keydown', 'click'];
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay, { passive: true });
    });

    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);
    audio.addEventListener('timeupdate', () => {
      if (Math.random() < 0.08) saveTime();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
