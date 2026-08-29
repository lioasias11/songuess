// ==========================================
// SONGUESS - APPLICATION ENTRY POINT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadArtworkCache();
  loadStats();
  updateHeaderStats();
  setupEvents();
  setupAutocomplete();

  if (!currentUsername) {
    showNameSetupModal(true);
  } else {
    startNewGame('white-girl-music');
  }
});

function setupEvents() {
  // Top Pills Navigation in Game Screen
  document.querySelectorAll('.genre-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      synth.playClick();
      const genre = pill.dataset.genre;
      if (genre === 'spotify' || genre === 'custom') {
        const spotifySongs = GENRE_SONGS['spotify'] || GENRE_SONGS['custom'] || [];
        if (spotifySongs.length === 0 || pill.classList.contains('active')) {
          openCustomModal();
          return;
        }
      }
      if (genre === 'apple-music') {
        const appleSongs = GENRE_SONGS['apple-music'] || [];
        if (appleSongs.length === 0 || pill.classList.contains('active')) {
          openAppleModal();
          return;
        }
      }
      startNewGame(genre);
    });
  });

  // Giant Center Play Button
  const playBtn = document.getElementById('btn-play');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (gameState.isFinished) {
        playFullPreview();
      } else {
        if (isAudioPlaying) {
          stopAudio();
        } else {
          playCurrentSnippet();
        }
      }
    });
  }

  // Guess Submission Controls
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitCurrentGuess();
    });
  }

  const skipBtn = document.getElementById('btn-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      if (gameState.isFinished) return;
      synth.playClick();
      logAttempt(null);
    });
  }

  const giveupBtn = document.getElementById('btn-giveup');
  if (giveupBtn) {
    giveupBtn.addEventListener('click', () => {
      if (gameState.isFinished) return;
      synth.playGiveUpSound();
      endGame(false);
    });
  }

  // Modal Controls
  const nextSongBtn = document.getElementById('btn-next-song');
  if (nextSongBtn) {
    nextSongBtn.addEventListener('click', () => {
      synth.playClick();
      startNewGame(gameState.activeGenre);
    });
  }

  const revealPlayBtn = document.getElementById('btn-reveal-play');
  if (revealPlayBtn) {
    revealPlayBtn.addEventListener('click', () => {
      playFullPreview();
    });
  }

  const statsBtn = document.getElementById('btn-stats-modal');
  if (statsBtn) statsBtn.addEventListener('click', showStatsModal);

  const leaderboardBtn = document.getElementById('btn-leaderboard-modal');
  if (leaderboardBtn) leaderboardBtn.addEventListener('click', showLeaderboardModal);

  const closeLbBtn = document.getElementById('btn-close-leaderboard');
  if (closeLbBtn) closeLbBtn.addEventListener('click', hideLeaderboardModal);
  const closeLbBottomBtn = document.getElementById('btn-close-leaderboard-bottom');
  if (closeLbBottomBtn) closeLbBottomBtn.addEventListener('click', hideLeaderboardModal);

  const switchProfileBtn = document.getElementById('btn-switch-profile');
  if (switchProfileBtn) {
    switchProfileBtn.addEventListener('click', () => {
      hideLeaderboardModal();
      showNameSetupModal(false);
    });
  }

  const playerPill = document.getElementById('player-name-span');
  if (playerPill) {
    playerPill.addEventListener('click', () => showNameSetupModal(false));
  }

  const submitNameBtn = document.getElementById('btn-submit-name');
  if (submitNameBtn) submitNameBtn.addEventListener('click', saveUsername);

  const nameInput = document.getElementById('username-input');
  if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveUsername();
    });
  }

  // SFX Toggle Button
  const sfxBtn = document.getElementById('btn-sfx-toggle');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      synth.sfxEnabled = !synth.sfxEnabled;
      sfxBtn.innerHTML = synth.sfxEnabled
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark"></i>';
      synth.playClick();
    });
  }

  // Spotify Custom Modal Controls
  loadSavedCustomPlaylist();

  const closeCustomBtn = document.getElementById('btn-close-custom-modal');
  if (closeCustomBtn) closeCustomBtn.addEventListener('click', hideCustomModal);

  const fetchSpotifyBtn = document.getElementById('btn-fetch-spotify');
  if (fetchSpotifyBtn) fetchSpotifyBtn.addEventListener('click', handleSpotifyImport);

  const searchAlbumBtn = document.getElementById('btn-search-album');
  if (searchAlbumBtn) searchAlbumBtn.addEventListener('click', handleAlbumSearch);
  const albumInput = document.getElementById('custom-album-query');
  if (albumInput) {
    albumInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAlbumSearch();
    });
  }

  const applyPastedBtn = document.getElementById('btn-apply-pasted-songs');
  if (applyPastedBtn) applyPastedBtn.addEventListener('click', handlePastedSongs);

  const startCustomBtn = document.getElementById('btn-start-custom-game');
  if (startCustomBtn) startCustomBtn.addEventListener('click', startCustomGameFromModal);

  document.querySelectorAll('.custom-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const tabName = tabBtn.dataset.tab;
      document.querySelectorAll('.custom-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.custom-tab-pane').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const targetPane = document.getElementById('tab-pane-' + tabName);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  document.querySelectorAll('.preset-pill-btn:not(.apple-preset-btn)').forEach(pBtn => {
    pBtn.addEventListener('click', () => {
      synth.playClick();
      applyCustomPreset(pBtn.dataset.preset);
    });
  });

  // Apple Music Custom Modal Controls
  loadSavedApplePlaylist();

  const closeAppleBtn = document.getElementById('btn-close-apple-modal');
  if (closeAppleBtn) closeAppleBtn.addEventListener('click', hideAppleModal);

  const fetchAppleBtn = document.getElementById('btn-fetch-apple');
  if (fetchAppleBtn) fetchAppleBtn.addEventListener('click', handleAppleLinkImport);

  const searchAppleBtn = document.getElementById('btn-search-apple-album');
  if (searchAppleBtn) searchAppleBtn.addEventListener('click', handleAppleAlbumSearch);
  const appleAlbumInput = document.getElementById('apple-album-query');
  if (appleAlbumInput) {
    appleAlbumInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAppleAlbumSearch();
    });
  }

  const applyApplePastedBtn = document.getElementById('btn-apply-apple-pasted');
  if (applyApplePastedBtn) applyApplePastedBtn.addEventListener('click', handleApplePastedSongs);

  const startAppleBtn = document.getElementById('btn-start-apple-game');
  if (startAppleBtn) startAppleBtn.addEventListener('click', startAppleGameFromModal);

  document.querySelectorAll('.apple-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const tabName = tabBtn.dataset.tab;
      document.querySelectorAll('.apple-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.apple-tab-pane').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const targetPane = document.getElementById('tab-pane-' + tabName);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  document.querySelectorAll('.apple-preset-btn').forEach(pBtn => {
    pBtn.addEventListener('click', () => {
      synth.playClick();
      applyApplePreset(pBtn.dataset.applePreset);
    });
  });

  // Keyboard spacebar listener to toggle snippet playback
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (gameState.isFinished) {
        playFullPreview();
      } else {
        if (isAudioPlaying) {
          stopAudio();
        } else {
          playCurrentSnippet();
        }
      }
    }
  });
}
