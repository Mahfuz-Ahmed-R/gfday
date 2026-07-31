// Keeps the background song going across page navigations by remembering
// playback state and resuming from the previous timestamp on the next page.
(function () {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  const MUTE_KEY = 'gfday-muted';
  const TIME_KEY = 'gfday-music-time';
  const SHOULD_PLAY_KEY = 'gfday-should-play';
  const LOOP_RESET_THRESHOLD = 0.35;
  const ICON_MUTED = '\uD83D\uDD07';
  const ICON_UNMUTED = '\uD83D\uDD0A';

  const savedTime = Number.parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
  const shouldPlay = sessionStorage.getItem(SHOULD_PLAY_KEY) !== '0';

  audio.muted = sessionStorage.getItem(MUTE_KEY) === '1';
  audio.preload = 'auto';

  function savePlaybackState() {
    if (!Number.isFinite(audio.currentTime)) return;

    sessionStorage.setItem(
      TIME_KEY,
      audio.ended ? '0' : String(audio.currentTime)
    );
    sessionStorage.setItem(SHOULD_PLAY_KEY, audio.paused ? '0' : '1');
  }

  function restorePlaybackTime() {
    if (!Number.isFinite(savedTime) || savedTime <= 0) return;

    if (
      Number.isFinite(audio.duration) &&
      savedTime >= audio.duration - LOOP_RESET_THRESHOLD
    ) {
      sessionStorage.setItem(TIME_KEY, '0');
      audio.currentTime = 0;
      return;
    }

    audio.currentTime = savedTime;
  }

  function enablePlaybackOnFirstInteraction() {
    const resume = () => {
      sessionStorage.setItem(SHOULD_PLAY_KEY, '1');
      audio.play().catch(() => {});
    };

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
  }

  function tryPlay() {
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');

    const playback = audio.play();
    if (playback !== undefined) {
      playback.catch(() => {
        // Browsers may block autoplay with sound until the first interaction.
        enablePlaybackOnFirstInteraction();
      });
    }
  }

  if (audio.readyState >= 1) {
    restorePlaybackTime();
    if (shouldPlay) {
      tryPlay();
    }
  } else {
    audio.addEventListener(
      'loadedmetadata',
      () => {
        restorePlaybackTime();
        if (shouldPlay) {
          tryPlay();
        }
      },
      { once: true }
    );
  }

  audio.addEventListener('play', () => {
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');
  });

  audio.addEventListener('pause', () => {
    if (!audio.ended) {
      savePlaybackState();
    }
  });

  audio.addEventListener('timeupdate', savePlaybackState);

  audio.addEventListener('ended', () => {
    sessionStorage.setItem(TIME_KEY, '0');
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');
  });

  window.addEventListener('pagehide', savePlaybackState);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      savePlaybackState();
    }
  });

  const btn = document.getElementById('mute-btn');
  if (btn) {
    btn.textContent = audio.muted ? ICON_MUTED : ICON_UNMUTED;
    btn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      sessionStorage.setItem(MUTE_KEY, audio.muted ? '1' : '0');
      btn.textContent = audio.muted ? ICON_MUTED : ICON_UNMUTED;
    });
  }
})();
