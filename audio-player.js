(() => {
  const KEY_TIME = 'valentine_audio_time';
  const KEY_ALLOWED = 'valentine_audio_allowed';
  const KEY_MODE = 'valentine_audio_mode';
  const SOURCES = ['audio/baby-blue.mp3', '/audio/baby-blue.mp3', './audio/baby-blue.mp3'];

  let audio;
  let audioCtx;
  let synthTimer = null;

  function saveTime() {
    if (!audio || Number.isNaN(audio.currentTime)) return;
    try { localStorage.setItem(KEY_TIME, String(audio.currentTime)); } catch (e) {}
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

  function stopSynth() {
    if (synthTimer) {
      clearTimeout(synthTimer);
      synthTimer = null;
    }
  }

  function ensureAudioContext() {
    if (audioCtx) return audioCtx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
    return audioCtx;
  }

  function runSynthLoop() {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
    const beat = 0.33;

    const playPhrase = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      const now = audioCtx.currentTime + 0.02;
      notes.forEach((freq, i) => {
        const t = now + i * beat;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.025, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.92);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + beat);
      });
      synthTimer = setTimeout(playPhrase, notes.length * beat * 1000);
    };

    stopSynth();
    playPhrase();
    try { localStorage.setItem(KEY_MODE, 'synth'); } catch (e) {}
  }

  function markAllowed() {
    try { localStorage.setItem(KEY_ALLOWED, 'yes'); } catch (e) {}
  }

  function tryAudioElementPlayback() {
    if (!audio) return Promise.resolve(false);
    return audio.play().then(() => {
      markAllowed();
      try { localStorage.setItem(KEY_MODE, 'file'); } catch (e) {}
      stopSynth();
      return true;
    }).catch(() => false);
  }

  function tryPlayWithFallback() {
    return tryAudioElementPlayback().then((ok) => {
      if (ok) return;
      runSynthLoop();
      markAllowed();
    });
  }

  function unlockAndPlay() {
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    tryPlayWithFallback();
  }

  function handleAudioError() {
    runSynthLoop();
    markAllowed();
  }

  function init() {
    audio = document.createElement('audio');
    audio.id = 'global-romance-audio';
    audio.loop = true;
    audio.preload = 'auto';
    audio.autoplay = true;
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';

    SOURCES.forEach((src) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = 'audio/mpeg';
      audio.appendChild(source);
    });

    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('stalled', handleAudioError);
    audio.addEventListener('suspend', () => {
      if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) handleAudioError();
    });

    document.body.appendChild(audio);

    resumeTime();
    if (localStorage.getItem(KEY_ALLOWED) === 'yes' || localStorage.getItem(KEY_MODE) === 'synth') {
      unlockAndPlay();
    } else {
      tryPlayWithFallback();
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
