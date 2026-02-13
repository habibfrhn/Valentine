(() => {
  const KEY_TIME = 'valentine_audio_time';
  const KEY_ALLOWED = 'valentine_audio_allowed';
  const KEY_MODE = 'valentine_audio_mode';
  const KEY_SHOULD_PLAY = 'valentine_audio_should_play';
  const AUDIO_CANDIDATES = [
    'audio/baby-blue.mp3',
    './audio/baby-blue.mp3',
    '/audio/baby-blue.mp3',
    'baby-blue.mp3'
  ];

  let audio;
  let audioCtx;
  let activeCandidateIndex = -1;

  function getAudioCandidates() {
    const inline = document.body?.dataset?.audioSrc || document.documentElement?.dataset?.audioSrc;
    const fromMeta = document.querySelector('meta[name="valentine-audio-src"]')?.content;
    const custom = [inline, fromMeta].filter(Boolean);
    return [...new Set([...custom, ...AUDIO_CANDIDATES])];
  }

  function saveTime() {
    if (!audio || Number.isNaN(audio.currentTime)) return;
    try {
      localStorage.setItem(KEY_TIME, String(audio.currentTime));
      localStorage.setItem(KEY_SHOULD_PLAY, String(!audio.paused));
    } catch (e) {}
  }

  function resumeTime() {
    if (!audio) return;
    const raw = localStorage.getItem(KEY_TIME);
    const t = raw ? parseFloat(raw) : 0;
    if (!Number.isFinite(t) || t < 0) return;
    const seek = () => {
      try { audio.currentTime = t; } catch (e) {}
    };
    if (audio.readyState > 0) seek();
    else audio.addEventListener('loadedmetadata', seek, { once: true });
  }

  function ensureAudioContext() {
    if (audioCtx) return audioCtx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
    return audioCtx;
  }

  function markAllowed() {
    try { localStorage.setItem(KEY_ALLOWED, 'yes'); } catch (e) {}
  }

  function tryAudioElementPlayback() {
    if (!audio) return Promise.resolve(false);
    return Promise.race([
      audio.play().then(() => {
        markAllowed();
        try {
          localStorage.setItem(KEY_MODE, 'file');
          localStorage.setItem(KEY_SHOULD_PLAY, 'true');
        } catch (e) {}
        return true;
      }).catch(() => false),
      new Promise((resolve) => window.setTimeout(() => resolve(false), 700))
    ]);
  }

  function tryPlayAudio() {
    return tryAudioElementPlayback().then((ok) => {
      if (!ok) {
        try { localStorage.setItem(KEY_MODE, 'file-error'); } catch (e) {}
      }
      return ok;
    });
  }

  function unlockAndPlay() {
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return tryPlayAudio();
  }

  function playFromGesture() {
    try {
      localStorage.setItem(KEY_SHOULD_PLAY, 'true');
      localStorage.setItem(KEY_ALLOWED, 'yes');
    } catch (e) {}
    return unlockAndPlay();
  }

  function handleAudioError() {
    const candidates = getAudioCandidates();
    const nextIndex = activeCandidateIndex + 1;
    if (nextIndex < candidates.length) {
      activeCandidateIndex = nextIndex;
      audio.src = candidates[activeCandidateIndex];
      audio.load();
      if (shouldAutoPlay()) {
        tryPlayAudio();
      }
      return;
    }

    try { localStorage.setItem(KEY_MODE, 'file-error'); } catch (e) {}
    console.warn(`[valentine-audio] Missing audio file. Tried: ${candidates.join(', ')}.`);
    markAllowed();
  }

  function shouldAutoPlay() {
    const shouldPlay = localStorage.getItem(KEY_SHOULD_PLAY);
    return shouldPlay !== 'false';
  }

  function init() {
    audio = document.createElement('audio');
    audio.id = 'global-romance-audio';
    audio.loop = true;
    audio.preload = 'auto';
    audio.autoplay = true;
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';

    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('stalled', handleAudioError);
    audio.addEventListener('suspend', () => {
      if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) handleAudioError();
    });

    document.body.appendChild(audio);

    activeCandidateIndex = -1;
    handleAudioError();
    resumeTime();

    if (localStorage.getItem(KEY_ALLOWED) === 'yes') {
      unlockAndPlay();
    }

    const unlockEvents = ['pointerdown', 'touchstart', 'keydown', 'click'];
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay);
    });

    window.valentineStartAudio = playFromGesture;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && shouldAutoPlay()) unlockAndPlay();
    });

    window.addEventListener('pageshow', () => {
      if (shouldAutoPlay()) unlockAndPlay();
    });

    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);
    audio.addEventListener('timeupdate', () => {
      if (Math.random() < 0.12) saveTime();
    });
    audio.addEventListener('pause', saveTime);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
