// ==========================================
// SONGUESS - APPLICATION ENTRY POINT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadArtworkCache();
  loadStats();
  applyLanguage(currentLanguage);
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
  // Language Toggle Button in Header
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      synth.playClick();
      const nextLang = (currentLanguage === 'he') ? 'en' : 'he';
      applyLanguage(nextLang);
    });
  }

  // Language choice buttons in Name Setup Modal
  document.querySelectorAll('.lang-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      const chosenLang = btn.dataset.lang;
      applyLanguage(chosenLang);
    });
  });

  // Play Anonymously button in Name Setup Modal
  const playAnonymousBtn = document.getElementById('btn-play-anonymous');
  if (playAnonymousBtn) {
    playAnonymousBtn.addEventListener('click', () => {
      playAnonymously();
    });
  }
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
      if (genre === 'artist') {
        const artistSongs = GENRE_SONGS['artist'] || [];
        if (artistSongs.length === 0 || pill.classList.contains('active')) {
          openArtistModal();
          return;
        }
      }
      startNewGame(genre);
    });
  });

  // Giant Center Play Button & Progress Bar Track Control
  function toggleSnippetPlayback() {
    if (gameState.isFinished) {
      if (isAudioPlaying) {
        stopAudio();
      } else {
        playFullPreview();
      }
    } else {
      if (isAudioPlaying) {
        stopAudio();
      } else {
        playCurrentSnippet();
      }
    }
  }

  const playBtn = document.getElementById('btn-play');
  if (playBtn) {
    playBtn.addEventListener('click', toggleSnippetPlayback);
  }

  const capsuleTrack = document.getElementById('capsule-track');
  if (capsuleTrack) {
    capsuleTrack.addEventListener('click', toggleSnippetPlayback);
    capsuleTrack.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleSnippetPlayback();
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
      if (isAudioPlaying) {
        stopAudio();
      } else {
        playFullPreview();
      }
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
    nameInput.addEventListener('input', () => {
      const msg = document.getElementById('name-validation-msg');
      if (msg) msg.textContent = '';
    });
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

  // Artist Mode Modal Controls
  loadSavedArtistMode();

  const closeArtistBtn = document.getElementById('btn-close-artist-modal');
  if (closeArtistBtn) closeArtistBtn.addEventListener('click', hideArtistModal);

  const artistSearchInput = document.getElementById('artist-search-input');
  if (artistSearchInput) {
    artistSearchInput.addEventListener('input', (e) => {
      handleArtistSearchInput(e.target.value);
    });
    artistSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstCard = document.querySelector('#artist-search-results .artist-result-card');
        if (firstCard) {
          firstCard.click();
        } else if (artistSearchInput.value.trim()) {
          selectArtistAndLoad(artistSearchInput.value.trim());
        }
      }
    });
  }

  const clearArtistSearchBtn = document.getElementById('btn-clear-artist-search');
  if (clearArtistSearchBtn) {
    clearArtistSearchBtn.addEventListener('click', () => {
      if (artistSearchInput) {
        artistSearchInput.value = '';
        artistSearchInput.focus();
      }
      handleArtistSearchInput('');
    });
  }

  document.querySelectorAll('.popular-artist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      const artistName = btn.dataset.artist;
      const itunesId = btn.dataset.itunesId || null;
      selectArtistAndLoad(artistName, itunesId);
    });
  });

  const startArtistBtn = document.getElementById('btn-start-artist-game');
  if (startArtistBtn) startArtistBtn.addEventListener('click', startArtistGameFromModal);

  const artistModal = document.getElementById('modal-artist-mode');
  if (artistModal) {
    artistModal.addEventListener('click', (e) => {
      if (e.target === artistModal) {
        hideArtistModal();
      }
    });
  }

  // Legal & Fair Use Modal
  const legalModal = document.getElementById('modal-legal');
  const openLegalModal = () => {
    if (legalModal) legalModal.classList.add('active');
  };
  const closeLegalModal = () => {
    if (legalModal) legalModal.classList.remove('active');
  };

  const btnLegalModal = document.getElementById('btn-legal-modal');
  if (btnLegalModal) btnLegalModal.addEventListener('click', openLegalModal);

  const linkOpenLegal = document.getElementById('link-open-legal');
  if (linkOpenLegal) {
    linkOpenLegal.addEventListener('click', (e) => {
      e.preventDefault();
      openLegalModal();
    });
  }

  const btnCloseLegalModal = document.getElementById('btn-close-legal-modal');
  if (btnCloseLegalModal) btnCloseLegalModal.addEventListener('click', closeLegalModal);

  const btnAgreeLegal = document.getElementById('btn-agree-legal');
  if (btnAgreeLegal) btnAgreeLegal.addEventListener('click', closeLegalModal);

  // Keyboard spacebar listener to toggle snippet playback and Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const artistModal = document.getElementById('modal-artist-mode');
      if (artistModal && artistModal.classList.contains('active')) {
        hideArtistModal();
        return;
      }
    }
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
