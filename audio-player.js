(() => {
  const KEY_TIME = 'valentine_audio_time';
  const KEY_ENABLED = 'valentine_audio_enabled';
  const KEY_INTENT = 'valentine_audio_intent';
  const AUDIO_FILES = ['audio/baby-blue.mp3', 'audio/baby-blue.wav'];

  let audio = null;
  let srcIndex = 0;
  let restoredOnce = false;

  function pickProjectPrefixedCandidates() {
    const host = window.location.hostname;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const isGithubProjectPage = host.endsWith('github.io') && parts.length > 0;
    const prefix = isGithubProjectPage ? `/${parts[0]}/` : '/';

    const defaults = AUDIO_FILES.flatMap((file) => [
      `${prefix}${file}`,
      `./${file}`,
      file
    ]);

    const customFromBody = document.body?.dataset?.audioSrc;
    const customFromHtml = document.documentElement?.dataset?.audioSrc;
    const customFromMeta = document.querySelector('meta[name="valentine-audio-src"]')?.content;

    return [...new Set([customFromBody, customFromHtml, customFromMeta, ...defaults].filter(Boolean))];
  }

  function shouldKeepPlaying() {
    return localStorage.getItem(KEY_INTENT) !== 'false';
  }

  function savePlaybackState() {
    if (!audio || Number.isNaN(audio.currentTime)) return;

    try {
      localStorage.setItem(KEY_TIME, String(audio.currentTime));

      // Keep intent true while navigating between pages so autoplay continues seamlessly.
      if (!audio.paused) {
        localStorage.setItem(KEY_INTENT, 'true');
      } else if (!document.hidden) {
        localStorage.setItem(KEY_INTENT, 'false');
      }
    } catch (error) {
      // ignore storage failures
    }
  }

  function restorePlaybackPosition() {
    if (!audio || restoredOnce) return;

    const saved = parseFloat(localStorage.getItem(KEY_TIME) || '0');
    if (!Number.isFinite(saved) || saved <= 0) {
      restoredOnce = true;
      return;
    }

    const seek = () => {
      try {
        audio.currentTime = saved;
      } catch (error) {
        // ignore seek issues
      }
      restoredOnce = true;
    };

    if (audio.readyState > 0) {
      seek();
    } else {
      audio.addEventListener('loadedmetadata', seek, { once: true });
    }
  }

  function setSource(index) {
    const candidates = pickProjectPrefixedCandidates();
    if (index >= candidates.length) return false;

    srcIndex = index;
    restoredOnce = false;
    audio.src = candidates[index];
    audio.load();
    return true;
  }

  async function playIfPossible() {
    if (!audio || !audio.src) return false;

    restorePlaybackPosition();

    try {
      await audio.play();
      localStorage.setItem(KEY_ENABLED, 'yes');
      localStorage.setItem(KEY_INTENT, 'true');
      return true;
    } catch (error) {
      return false;
    }
  }

  async function startFromGesture() {
    localStorage.setItem(KEY_ENABLED, 'yes');
    localStorage.setItem(KEY_INTENT, 'true');
    return playIfPossible();
  }

  function attachGestureUnlock() {
    const events = ['pointerdown', 'click', 'touchstart', 'keydown'];
    const onceHandler = () => {
      startFromGesture().finally(() => {
        events.forEach((eventName) => window.removeEventListener(eventName, onceHandler, true));
      });
    };

    events.forEach((eventName) => window.addEventListener(eventName, onceHandler, { capture: true, once: false }));
  }

  function attachNavigationStateSync() {
    const syncAndKeepIntent = () => {
      savePlaybackState();
      localStorage.setItem(KEY_INTENT, 'true');
    };

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const activatesNavigation = target.closest('a[href], button, [role="button"]');
      if (activatesNavigation) {
        syncAndKeepIntent();
      }
    }, true);
  }

  function initAudioElement() {
    audio = document.createElement('audio');
    audio.id = 'global-romance-audio';
    audio.preload = 'auto';
    audio.loop = true;
    audio.playsInline = true;
    audio.style.display = 'none';

    audio.addEventListener('error', () => {
      const moved = setSource(srcIndex + 1);
      if (moved && shouldKeepPlaying()) {
        playIfPossible();
      }
    });

    audio.addEventListener('pause', savePlaybackState);
    audio.addEventListener('timeupdate', () => {
      if (Math.random() < 0.1) savePlaybackState();
    });

    document.body.appendChild(audio);
    setSource(0);
    restorePlaybackPosition();
  }

  function init() {
    initAudioElement();
    attachGestureUnlock();
    attachNavigationStateSync();

    const wasEnabled = localStorage.getItem(KEY_ENABLED) === 'yes';
    const canAutoplayFromEntryClick = document.userActivation?.hasBeenActive || performance.getEntriesByType('navigation')[0]?.type === 'navigate';

    if ((wasEnabled || canAutoplayFromEntryClick) && shouldKeepPlaying()) {
      playIfPossible();
    }

    window.valentineStartAudio = startFromGesture;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && shouldKeepPlaying()) {
        playIfPossible();
      }
    });

    window.addEventListener('pageshow', () => {
      if (shouldKeepPlaying()) {
        playIfPossible();
      }
    });

    window.addEventListener('beforeunload', savePlaybackState);
    window.addEventListener('pagehide', savePlaybackState);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
