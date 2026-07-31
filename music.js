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
  const ICON_PLAY = '\u25B6';
  let needsInteraction = false;
  let interactionCleanup = null;

  const savedTime = Number.parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
  const shouldPlay = sessionStorage.getItem(SHOULD_PLAY_KEY) !== '0';
  const btn = document.getElementById('mute-btn');
  let prompt = null;

  audio.muted = sessionStorage.getItem(MUTE_KEY) === '1';
  audio.preload = 'auto';
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');

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

  function updateButton() {
    if (!btn) return;

    if (needsInteraction || audio.paused) {
      btn.textContent = ICON_PLAY;
      btn.setAttribute('aria-label', 'Play music');
      btn.classList.add('needs-play');
      return;
    }

    btn.textContent = audio.muted ? ICON_MUTED : ICON_UNMUTED;
    btn.setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music');
    btn.classList.remove('needs-play');
  }

  function removePrompt() {
    if (prompt) {
      prompt.remove();
      prompt = null;
    }
  }

  function showPrompt() {
    if (prompt) return;

    prompt = document.createElement('button');
    prompt.type = 'button';
    prompt.className = 'music-start-prompt';
    prompt.textContent = 'Tap to play song';
    prompt.addEventListener('click', () => {
      startPlaybackFromInteraction();
    });
    document.body.appendChild(prompt);
  }

  function clearInteractionListeners() {
    if (interactionCleanup) {
      interactionCleanup();
      interactionCleanup = null;
    }
  }

  function startPlaybackFromInteraction() {
    needsInteraction = false;
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');

    const playback = audio.play();
    if (playback !== undefined) {
      playback
        .then(() => {
          clearInteractionListeners();
          removePrompt();
          updateButton();
        })
        .catch(() => {
          needsInteraction = true;
          showPrompt();
          updateButton();
        });
    }
  }

  function enablePlaybackOnFirstInteraction() {
    if (interactionCleanup) return;

    needsInteraction = true;
    showPrompt();
    updateButton();

    const resume = () => {
      startPlaybackFromInteraction();
    };

    const options = { capture: true, once: true };
    const touchOptions = { capture: true, once: true, passive: true };

    document.addEventListener('pointerdown', resume, options);
    document.addEventListener('touchstart', resume, touchOptions);
    document.addEventListener('keydown', resume, options);

    interactionCleanup = () => {
      document.removeEventListener('pointerdown', resume, options);
      document.removeEventListener('touchstart', resume, touchOptions);
      document.removeEventListener('keydown', resume, options);
    };
  }

  function tryPlay() {
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');

    const playback = audio.play();
    if (playback !== undefined) {
      playback
        .then(() => {
          needsInteraction = false;
          removePrompt();
          updateButton();
        })
        .catch(() => {
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
    needsInteraction = false;
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');
    clearInteractionListeners();
    removePrompt();
    updateButton();
  });

  audio.addEventListener('pause', () => {
    if (!audio.ended) {
      savePlaybackState();
    }

    updateButton();
  });

  audio.addEventListener('timeupdate', savePlaybackState);

  audio.addEventListener('ended', () => {
    sessionStorage.setItem(TIME_KEY, '0');
    sessionStorage.setItem(SHOULD_PLAY_KEY, '1');
    updateButton();
  });

  window.addEventListener('pagehide', savePlaybackState);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      savePlaybackState();
    }
  });

  if (btn) {
    btn.addEventListener('click', () => {
      if (needsInteraction || audio.paused) {
        startPlaybackFromInteraction();
        return;
      }

      audio.muted = !audio.muted;
      sessionStorage.setItem(MUTE_KEY, audio.muted ? '1' : '0');
      updateButton();
    });
  }

  updateButton();
})();
