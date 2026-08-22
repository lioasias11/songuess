const fs = require('fs');
const verified = JSON.parse(fs.readFileSync('clean_previews.json', 'utf8'));

const jsContent = `// index.js - Clean, Minimalist Spotify-Style Heardle Engine (Direct Game View)

const DURATIONS = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0];
const MAX_ATTEMPTS = 6;
const SCORE_TIERS = [1000, 800, 600, 400, 200, 100];

// Verified Preloaded High-Resolution Song Library (Guaranteed Instant Audio)
const LOCAL_SONG_DATABASE = ${JSON.stringify(verified, null, 2)};

// Game State
let gameState = {
  currentCategory: 'white-girl-music',
  currentSong: null,
  attemptsUsed: 0,
  guesses: [],
  isFinished: false,
  hasWon: false,
  score: 0
};

// Player Profiles & Username State
let currentUsername = '';
let profiles = {};

const DEFAULT_STATS = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalScore: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0]
};

let stats = Object.assign({}, DEFAULT_STATS);

// Cloud Database configuration
const DB_APP_KEY = 'dkcnoc7h';
const DB_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

function encodeSafe(str) {
  const b64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
  return b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
}

function decodeSafe(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

const audioEl = document.getElementById('game-audio');
let sfxEnabled = true;
let isAudioPlaying = false;
let audioCheckInterval = null;
let stopTimer = null;
let currentHighlightedIndex = -1;
let currentSuggestions = [];

// Audio Synth SFX
class SimpleAudioSynth {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playClick() {
    if (!sfxEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch(e){}
  }
  playWin() {
    if (!sfxEnabled) return;
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch(e){}
  }
  playError() {
    if (!sfxEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch(e){}
  }
  playSkip() {
    if (!sfxEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch(e){}
  }
}

const synth = new SimpleAudioSynth();

function loadStats() {
  currentUsername = localStorage.getItem('songuess_v3_current_username') || '';
  
  const savedProfiles = localStorage.getItem('songuess_v3_profiles');
  if (savedProfiles) {
    try {
      profiles = JSON.parse(savedProfiles);
    } catch (e) {
      profiles = {};
    }
  }

  const legacyStats = localStorage.getItem('songuess_v3_stats');
  let legacyData = null;
  if (legacyStats) {
    try {
      legacyData = JSON.parse(legacyStats);
    } catch (e) {}
  }

  if (currentUsername) {
    if (!profiles[currentUsername]) {
      profiles[currentUsername] = legacyData || Object.assign({}, DEFAULT_STATS);
    }
    stats = profiles[currentUsername];
  } else {
    stats = Object.assign({}, DEFAULT_STATS);
  }

  updateStatsDisplay();
}

function saveStats() {
  if (currentUsername) {
    profiles[currentUsername] = stats;
    localStorage.setItem('songuess_v3_profiles', JSON.stringify(profiles));
    localStorage.setItem('songuess_v3_current_username', currentUsername);
    
    // Sync with cloud in background
    syncLeaderboardWithCloud();
  }
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const nameEl = document.getElementById('player-name-val');
  const scoreEl = document.getElementById('score-val');
  const streakEl = document.getElementById('streak-val');
  if (nameEl) nameEl.textContent = currentUsername || 'Guest';
  if (scoreEl) scoreEl.textContent = stats.totalScore || 0;
  if (streakEl) streakEl.textContent = stats.currentStreak || 0;
}

// Live Autocomplete Search (Local Instant + JSONP/Fetch Fallback)
async function searchItunes(query, limit = 8) {
  const qClean = query.toLowerCase().trim();
  const localMatches = LOCAL_SONG_DATABASE.filter(item => 
    item.title.toLowerCase().includes(qClean) || 
    item.artist.toLowerCase().includes(qClean)
  ).slice(0, limit).map(item => ({
    trackName: item.title,
    artistName: item.artist,
    collectionName: item.album,
    artworkUrl60: item.artwork || 'https://placehold.co/60x60/181818/22c55e?text=♫',
    previewUrl: item.previewUrl
  }));

  try {
    const liveData = await fetchJsonp('https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&limit=' + limit + '&media=music');
    if (liveData && liveData.results && liveData.results.length > 0) {
      const combined = [...liveData.results];
      localMatches.forEach(lm => {
        if (!combined.some(c => c.trackName.toLowerCase() === lm.trackName.toLowerCase() && c.artistName.toLowerCase() === lm.artistName.toLowerCase())) {
          combined.push(lm);
        }
      });
      return combined.slice(0, limit);
    }
  } catch (err) {}

  return localMatches;
}

function fetchJsonp(url, timeout = 3500) {
  return new Promise((resolve, reject) => {
    const callbackName = 'itunes_cb_' + Math.round(1000000 * Math.random());
    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    
    let timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, timeout);

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
      if (timer) clearTimeout(timer);
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP failed'));
    };

    document.body.appendChild(script);
  });
}

// Init DOM Events
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  setupEvents();
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
      startNewGame(genre);
    });
  });

  // Giant Center Play Button
  const playBtn = document.getElementById('btn-play');
  playBtn.addEventListener('click', () => {
    if (gameState.isFinished) {
      playFullPreview();
    } else {
      if (isAudioPlaying) {
        stopAudio();
      } else {
        playUnlockedSnippet();
      }
    }
  });

  // Skip Button
  document.getElementById('btn-skip').addEventListener('click', () => {
    synth.playSkip();
    handleSkip();
  });

  // Give Up Button
  document.getElementById('btn-giveup').addEventListener('click', () => {
    if (gameState.isFinished) return;
    synth.playError();
    endGame(false);
  });

  // SFX Toggle
  document.getElementById('btn-sfx-toggle').addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    document.getElementById('btn-sfx-toggle').innerHTML = sfxEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark"></i>';
    synth.playClick();
  });

  // View Stats Button in Header
  document.getElementById('btn-stats-modal').addEventListener('click', () => {
    synth.playClick();
    showStatsModalOnly();
  });

  // Search Input & Autocomplete Keyboard Navigation
  const guessInput = document.getElementById('guess-input');
  const clearBtn = document.getElementById('btn-clear-input');

  guessInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    handleAutocompleteSearch(val);
  });

  clearBtn.addEventListener('click', () => {
    guessInput.value = '';
    clearBtn.style.display = 'none';
    hideDropdown();
    guessInput.focus();
  });

  guessInput.addEventListener('keydown', (e) => {
    const dropdown = document.getElementById('autocomplete-dropdown');
    const items = dropdown.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        currentHighlightedIndex = (currentHighlightedIndex + 1) % items.length;
        updateHighlightedItem(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        currentHighlightedIndex = (currentHighlightedIndex - 1 + items.length) % items.length;
        updateHighlightedItem(items);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentHighlightedIndex >= 0 && items[currentHighlightedIndex]) {
        items[currentHighlightedIndex].click();
      } else {
        submitGuess();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  // Submit button
  document.getElementById('btn-submit').addEventListener('click', () => {
    submitGuess();
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-input-wrapper')) {
      hideDropdown();
    }
  });

  // Spacebar hotkey
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement !== guessInput) {
      e.preventDefault();
      playBtn.click();
    }
  });

  // Modal interactions
  document.getElementById('modal-x').addEventListener('click', hideModal);

  document.getElementById('btn-next-song').addEventListener('click', () => {
    hideModal();
    startNewGame(gameState.currentCategory);
  });

  document.getElementById('btn-reveal-play').addEventListener('click', () => {
    playFullPreview();
  });

  // Name Setup Event Listeners
  document.getElementById('btn-submit-name').addEventListener('click', submitName);
  document.getElementById('username-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitName();
    }
  });

  // Header Username Click
  document.getElementById('player-name-span').addEventListener('click', () => {
    synth.playClick();
    showNameSetupModal(false);
  });

  // Leaderboard Modal Event Listeners
  document.getElementById('btn-leaderboard-modal').addEventListener('click', () => {
    synth.playClick();
    showLeaderboardModal();
  });

  document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
    synth.playClick();
    hideLeaderboardModal();
  });

  document.getElementById('btn-close-leaderboard-bottom').addEventListener('click', () => {
    synth.playClick();
    hideLeaderboardModal();
  });

  document.getElementById('btn-switch-profile').addEventListener('click', () => {
    synth.playClick();
    hideLeaderboardModal();
    showNameSetupModal(false);
  });

  // Click outside modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      if (e.target.id === 'leaderboard-modal') {
        hideLeaderboardModal();
      } else if (e.target.id === 'name-setup-modal' && !e.target.classList.contains('force-modal')) {
        hideNameSetupModal();
      }
    }
  });
}

function updateHighlightedItem(items) {
  items.forEach((it, idx) => {
    if (idx === currentHighlightedIndex) {
      it.classList.add('selected');
      it.scrollIntoView({ block: 'nearest' });
    } else {
      it.classList.remove('selected');
    }
  });
}

// Start New Game Loop (Instant Audio Loading)
function startNewGame(genre) {
  gameState.currentCategory = genre;
  gameState.attemptsUsed = 0;
  gameState.guesses = [];
  gameState.isFinished = false;
  gameState.hasWon = false;

  // Update active genre pill
  document.querySelectorAll('.genre-pill-btn').forEach(pill => {
    if (pill.dataset.genre === genre) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  
  resetGameUI();

  // Pick song directly from verified instant preloaded database
  const genreSongs = LOCAL_SONG_DATABASE.filter(s => s.genre === genre);
  const target = genreSongs.length > 0 
    ? genreSongs[Math.floor(Math.random() * genreSongs.length)]
    : LOCAL_SONG_DATABASE[Math.floor(Math.random() * LOCAL_SONG_DATABASE.length)];

  gameState.currentSong = {
    title: target.title,
    artist: target.artist,
    album: target.album || '',
    artwork: target.artwork || 'https://placehold.co/400x400/181818/22c55e?text=♫',
    previewUrl: target.previewUrl,
    link: target.link || '#'
  };

  // Load Audio Immediately
  audioEl.src = gameState.currentSong.previewUrl;
  audioEl.load();
}

// Reset UI
function resetGameUI() {
  stopAudio();
  updateTimeline(0.1);
  updateActiveSegment(0);
  updateSkipButtonText();

  document.getElementById('guess-input').value = '';
  document.getElementById('guess-input').disabled = false;
  document.getElementById('btn-submit').disabled = false;
  document.getElementById('btn-skip').disabled = false;
  document.getElementById('btn-giveup').disabled = false;

  const feedback = document.getElementById('game-feedback-text');
  if (feedback) {
    feedback.textContent = "Listen to snippet and guess the song";
    feedback.style.color = "var(--text-secondary)";
  }
}

function updateActiveSegment(step) {
  document.querySelectorAll('.c-segment').forEach((seg, idx) => {
    if (idx <= step) {
      seg.classList.add('active');
    } else {
      seg.classList.remove('active');
    }
  });
}

function updateTimeline(seconds) {
  const percent = (seconds / 10.0) * 100;
  const progressEl = document.getElementById('capsule-progress');
  if (progressEl) {
    progressEl.style.width = Math.max(percent, 1.0) + '%';
  }
  const durationEl = document.getElementById('snippet-duration');
  if (durationEl) {
    durationEl.textContent = seconds.toFixed(1) + 's';
  }
}

function updateSkipButtonText() {
  const nextStep = gameState.attemptsUsed + 1;
  const skipBtn = document.getElementById('btn-skip');
  if (nextStep < DURATIONS.length) {
    skipBtn.style.display = 'inline-flex';
    skipBtn.innerHTML = '<i class="fa-solid fa-forward-step"></i> Skip';
  } else {
    skipBtn.style.display = 'none';
  }
}

// Snippet Playback with Exact Stop
function playUnlockedSnippet() {
  if (!gameState.currentSong || !gameState.currentSong.previewUrl) return;

  stopAudio();
  const maxDuration = DURATIONS[gameState.attemptsUsed];

  audioEl.currentTime = 0;
  audioEl.play().then(() => {
    isAudioPlaying = true;
    updatePlaybackUI(true);

    const checkStartTime = performance.now();

    audioCheckInterval = setInterval(() => {
      const elapsed = (performance.now() - checkStartTime) / 1000;
      
      const currentPercent = (Math.min(elapsed, maxDuration) / 10.0) * 100;
      const progressEl = document.getElementById('capsule-progress');
      if (progressEl) {
        progressEl.style.width = Math.max(currentPercent, 1.0) + '%';
      }

      if (elapsed >= maxDuration || audioEl.ended) {
        stopAudio();
      }
    }, 16);

    stopTimer = setTimeout(() => {
      stopAudio();
    }, maxDuration * 1000 + 40);

  }).catch(e => {
    console.log("Audio playback deferred or interrupted", e);
  });
}

function playFullPreview() {
  if (!gameState.currentSong) return;
  stopAudio();

  audioEl.currentTime = 0;
  audioEl.play().then(() => {
    isAudioPlaying = true;
    updatePlaybackUI(true);

    audioCheckInterval = setInterval(() => {
      if (audioEl.paused || audioEl.ended) {
        stopAudio();
      }
    }, 50);
  }).catch(e => console.log(e));
}

function stopAudio() {
  if (stopTimer) clearTimeout(stopTimer);
  if (audioCheckInterval) clearInterval(audioCheckInterval);
  
  audioEl.pause();
  isAudioPlaying = false;
  updatePlaybackUI(false);

  const curDuration = gameState.isFinished ? 10.0 : DURATIONS[gameState.attemptsUsed];
  updateTimeline(curDuration);
}

function updatePlaybackUI(playing) {
  const playBtn = document.getElementById('btn-play');
  const icon = document.getElementById('play-btn-icon');
  const modalPlayBtn = document.getElementById('btn-reveal-play');

  if (playing) {
    if (playBtn) playBtn.classList.add('playing');
    if (icon) {
      icon.className = 'fa-solid fa-pause';
    }
    if (modalPlayBtn) modalPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    if (playBtn) playBtn.classList.remove('playing');
    if (icon) {
      icon.className = 'fa-solid fa-play';
    }
    if (modalPlayBtn) modalPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

// Autocomplete Engine
let searchDebounceTimer = null;

function handleAutocompleteSearch(query) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  if (!query || query.trim().length < 2) {
    hideDropdown();
    return;
  }

  // Instant local suggestions (0ms)
  renderAutocompleteMatches(query);

  // Debounced live search
  searchDebounceTimer = setTimeout(async () => {
    const results = await searchItunes(query, 8);
    renderAutocompleteDropdown(results);
  }, 160);
}

function renderAutocompleteMatches(query) {
  const qClean = query.toLowerCase().trim();
  const matches = LOCAL_SONG_DATABASE.filter(s => 
    s.title.toLowerCase().includes(qClean) || 
    s.artist.toLowerCase().includes(qClean)
  ).slice(0, 6).map(s => ({
    trackName: s.title,
    artistName: s.artist,
    collectionName: s.album,
    artworkUrl60: s.artwork || 'https://placehold.co/60x60/181818/22c55e?text=♫'
  }));

  if (matches.length > 0) {
    renderAutocompleteDropdown(matches);
  }
}

function renderAutocompleteDropdown(results) {
  const dropdown = document.getElementById('autocomplete-dropdown');
  dropdown.innerHTML = '';
  currentSuggestions = results;
  currentHighlightedIndex = -1;

  if (!results || results.length === 0) {
    hideDropdown();
    return;
  }

  results.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.dataset.index = index;

    const artUrl = item.artworkUrl60 || item.artworkUrl100 || 'https://placehold.co/40x40/181818/22c55e?text=♫';
    const albumInfo = item.collectionName ? ('• ' + item.collectionName) : '';

    div.innerHTML = '<img class="suggestion-artwork" src="' + artUrl + '" alt="Artwork">' +
      '<div class="suggestion-info">' +
        '<span class="suggestion-title">' + item.trackName + '</span>' +
        '<span class="suggestion-artist">' + item.artistName + '</span>' +
        '<span class="suggestion-meta">' + albumInfo + '</span>' +
      '</div>';

    div.addEventListener('click', () => {
      synth.playClick();
      selectSongSuggestion(item);
    });

    dropdown.appendChild(div);
  });

  dropdown.style.display = 'block';
}

function hideDropdown() {
  const dropdown = document.getElementById('autocomplete-dropdown');
  dropdown.style.display = 'none';
  currentHighlightedIndex = -1;
}

function selectSongSuggestion(item) {
  document.getElementById('guess-input').value = item.trackName + ' - ' + item.artistName;
  hideDropdown();
  submitGuess();
}

function handleSkip() {
  if (gameState.isFinished) return;
  logAttempt(null);
}

function submitGuess() {
  if (gameState.isFinished) return;

  const guessVal = document.getElementById('guess-input').value.trim();
  if (!guessVal) return;

  logAttempt(guessVal);
  document.getElementById('guess-input').value = '';
  document.getElementById('btn-clear-input').style.display = 'none';
  hideDropdown();
}

function logAttempt(guessText) {
  const attemptIdx = gameState.attemptsUsed;
  const isSkip = (guessText === null);

  let isCorrect = false;

  if (!isSkip && gameState.currentSong) {
    const userGuess = cleanStr(guessText);
    const targetTitle = cleanStr(gameState.currentSong.title);
    const targetArtist = cleanStr(gameState.currentSong.artist);

    const hasTitle = userGuess.includes(targetTitle) || targetTitle.includes(userGuess);
    const hasArtist = userGuess.includes(targetArtist) || targetArtist.includes(userGuess);

    if (hasTitle && (hasArtist || userGuess.length > 5)) {
      isCorrect = true;
    } else if (userGuess === (targetTitle + targetArtist) || userGuess === (targetArtist + targetTitle)) {
      isCorrect = true;
    }
  }

  const feedback = document.getElementById('game-feedback-text');
  
  if (isCorrect) {
    synth.playWin();
    if (feedback) {
      feedback.textContent = 'Correct! ' + gameState.currentSong.title + ' — ' + gameState.currentSong.artist;
      feedback.style.color = "var(--green)";
    }
    
    gameState.hasWon = true;
    gameState.score = SCORE_TIERS[attemptIdx] || 100;
    endGame(true);
  } else {
    synth.playError();
    if (feedback) {
      feedback.textContent = isSkip ? 'Skipped (+time unlocked)' : 'Incorrect guess. Try again!';
      feedback.style.color = isSkip ? "#eab308" : "#ef4444";
    }
    
    gameState.attemptsUsed++;

    if (gameState.attemptsUsed >= MAX_ATTEMPTS) {
      endGame(false);
    } else {
      updateActiveSegment(gameState.attemptsUsed);
      updateTimeline(DURATIONS[gameState.attemptsUsed]);
      updateSkipButtonText();
    }
  }
}

function cleanStr(str) {
  return str.toLowerCase()
    .replace(/[^\\w\\s]/gi, '')
    .replace(/\\s+/g, '')
    .replace(/feat|ft|featuring|remix|edit|prod/g, '');
}

function endGame(hasWon) {
  gameState.isFinished = true;
  stopAudio();

  document.getElementById('guess-input').disabled = true;
  document.getElementById('btn-submit').disabled = true;
  document.getElementById('btn-skip').disabled = true;
  document.getElementById('btn-giveup').disabled = true;

  stats.played++;
  if (hasWon) {
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.totalScore = (stats.totalScore || 0) + gameState.score;
    stats.guessDistribution[gameState.attemptsUsed]++;
    
    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ffffff', '#1ed760', '#eab308']
      });
    }
  } else {
    stats.currentStreak = 0;
  }

  saveStats();

  const modalTitle = document.getElementById('modal-title');
  const modalSub = document.getElementById('modal-subtitle');
  
  if (hasWon) {
    modalTitle.textContent = "Track Decrypted!";
    modalSub.textContent = 'UNLOCKED IN ' + DURATIONS[gameState.attemptsUsed] + 's • +' + gameState.score + ' PTS';
  } else {
    modalTitle.textContent = "Track Lost";
    modalSub.textContent = "BETTER LUCK NEXT ROUND • 0 PTS";
  }

  document.getElementById('reveal-artwork').src = gameState.currentSong.artwork;
  document.getElementById('reveal-title').textContent = gameState.currentSong.title;
  document.getElementById('reveal-artist').textContent = gameState.currentSong.artist;
  document.getElementById('reveal-album').textContent = gameState.currentSong.album;
  document.getElementById('itunes-link').href = gameState.currentSong.link;
  document.getElementById('youtube-link').href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(gameState.currentSong.artist + ' ' + gameState.currentSong.title);

  document.getElementById('stat-played').textContent = stats.played;
  document.getElementById('stat-winrate').textContent = Math.round((stats.wins / stats.played) * 100) + '%';
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

  renderStatsChart();
  setTimeout(showModal, 700);
}

function renderStatsChart() {
  const max = Math.max(...stats.guessDistribution, 1);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const val = stats.guessDistribution[i];
    const pct = (val / max) * 100;
    const bar = document.getElementById('dist-' + i);
    
    bar.style.width = Math.max(pct, 10) + '%';
    bar.textContent = val;
    
    if (gameState.hasWon && gameState.attemptsUsed === i) {
      bar.classList.add('current');
    } else {
      bar.classList.remove('current');
    }
  }
}

function showModal() {
  document.getElementById('results-modal').classList.add('active');
}

function hideModal() {
  document.getElementById('results-modal').classList.remove('active');
}

function showStatsModalOnly() {
  document.getElementById('modal-title').textContent = "PLAYER RECORDS";
  document.getElementById('modal-subtitle').textContent = 'TOTAL SCORE: ' + (stats.totalScore || 0) + ' PTS';
  
  document.getElementById('stat-played').textContent = stats.played;
  document.getElementById('stat-winrate').textContent = stats.played > 0 ? (Math.round((stats.wins / stats.played) * 100) + '%') : "0%";
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

  renderStatsChart();
  showModal();
}

function showNameSetupModal(force) {
  const modal = document.getElementById('name-setup-modal');
  const input = document.getElementById('username-input');
  const validationMsg = document.getElementById('name-validation-msg');
  
  input.value = currentUsername;
  validationMsg.textContent = '';
  
  modal.classList.add('active');
  
  if (force) {
    modal.classList.add('force-modal');
  } else {
    modal.classList.remove('force-modal');
  }
  
  setTimeout(() => { input.focus(); }, 50);
}

function hideNameSetupModal() {
  document.getElementById('name-setup-modal').classList.remove('active');
}

async function submitName() {
  const input = document.getElementById('username-input');
  const validationMsg = document.getElementById('name-validation-msg');
  const name = input.value.trim();
  
  if (!name) {
    validationMsg.textContent = 'Please enter a name!';
    return;
  }
  
  if (name.length < 2) {
    validationMsg.textContent = 'Name must be at least 2 characters!';
    return;
  }

  // Display validation check state
  validationMsg.textContent = 'Checking availability...';
  validationMsg.style.color = '#eab308';
  
  let cloudList = [];
  try {
    const res = await fetch(DB_URL + '/GetValue/' + DB_APP_KEY + '/leaderboard');
    const cloudVal = await res.json();
    if (cloudVal && cloudVal !== 'TIMEOUT' && cloudVal !== 'null') {
      try {
        cloudList = JSON.parse(decodeSafe(cloudVal));
      } catch (e) {
        console.error("Error parsing cloud leaderboard", e);
      }
    }
  } catch (err) {
    console.warn("Could not check username online. Playing offline mode.", err);
  }

  const existsInCloud = cloudList.some(p => p.name.toLowerCase() === name.toLowerCase());
  const existsLocally = profiles[name] !== undefined;
  
  if (existsInCloud && !existsLocally) {
    validationMsg.textContent = 'Stage name already taken by another player! Please choose a different name.';
    validationMsg.style.color = '#ef4444';
    return;
  }

  const isNewUser = (currentUsername === '');
  const oldUsername = currentUsername;
  currentUsername = name;
  
  if (isNewUser) {
    const legacyStats = localStorage.getItem('songuess_v3_stats');
    if (legacyStats && !profiles[name]) {
      try {
        profiles[name] = JSON.parse(legacyStats);
        localStorage.removeItem('songuess_v3_stats');
      } catch (e) {}
    }
  } else if (oldUsername !== name) {
    if (profiles[oldUsername] && !profiles[name]) {
      const shouldRename = confirm('Do you want to RENAME your current profile "' + oldUsername + '" to "' + name + '" (keeps your stats)?\\n\\nClick Cancel to switch/create a new profile.');
      if (shouldRename) {
        profiles[name] = Object.assign({}, profiles[oldUsername]);
        delete profiles[oldUsername];
      }
    }
  }
  
  if (!profiles[name]) {
    profiles[name] = Object.assign({}, DEFAULT_STATS);
  }
  
  stats = profiles[name];
  
  saveStats();
  hideNameSetupModal();

  // Sync immediately
  syncLeaderboardWithCloud();
  
  if (!gameState.currentSong) {
    startNewGame('white-girl-music');
  }
}

async function syncLeaderboardWithCloud() {
  try {
    const res = await fetch(DB_URL + '/GetValue/' + DB_APP_KEY + '/leaderboard');
    const cloudVal = await res.json();
    let cloudList = [];
    
    if (cloudVal && cloudVal !== 'TIMEOUT' && cloudVal !== 'null') {
      try {
        cloudList = JSON.parse(decodeSafe(cloudVal));
      } catch (e) {}
    }
    
    const mergedMap = {};
    
    cloudList.forEach(p => {
      mergedMap[p.name] = p;
    });
    
    Object.keys(profiles).forEach(name => {
      const localP = profiles[name];
      const cloudP = mergedMap[name];
      
      if (!cloudP || (localP.totalScore || 0) > (cloudP.totalScore || 0)) {
        mergedMap[name] = {
          name: name,
          totalScore: localP.totalScore || 0,
          played: localP.played || 0,
          wins: localP.wins || 0
        };
      } else {
        profiles[name].totalScore = cloudP.totalScore;
        profiles[name].played = Math.max(profiles[name].played, cloudP.played);
        profiles[name].wins = Math.max(profiles[name].wins, cloudP.wins);
      }
    });
    
    localStorage.setItem('songuess_v3_profiles', JSON.stringify(profiles));
    
    const mergedList = Object.keys(mergedMap).map(k => mergedMap[k]);
    const base64Data = encodeSafe(JSON.stringify(mergedList));
    
    await fetch(DB_URL + '/UpdateValue/' + DB_APP_KEY + '/leaderboard/' + base64Data, {
      method: 'POST'
    });
    
    updateStatsDisplay();
    return mergedList;
  } catch (err) {
    console.error("Cloud synchronization failed", err);
    return null;
  }
}

function showLeaderboardModal() {
  renderLeaderboardList(null);
  document.getElementById('leaderboard-modal').classList.add('active');
  
  syncLeaderboardWithCloud().then(mergedList => {
    if (mergedList) {
      renderLeaderboardList(mergedList);
    }
  });
}

function hideLeaderboardModal() {
  document.getElementById('leaderboard-modal').classList.remove('active');
}

function renderLeaderboardList(listToRender) {
  const container = document.getElementById('leaderboard-entries-container');
  container.innerHTML = '';
  
  let sortedList = [];
  if (listToRender) {
    sortedList = [...listToRender].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  } else {
    sortedList = Object.keys(profiles)
      .map(name => Object.assign({ name: name }, profiles[name]))
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }
  
  if (sortedList.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">No profiles found yet. Start playing to rank!</div>';
    return;
  }
  
  sortedList.forEach((profile, index) => {
    const rank = index + 1;
    const isCurrent = profile.name === currentUsername;
    
    let rankClass = '';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';
    
    const rankIconOrNum = rank <= 3 
      ? '<i class="fa-solid fa-trophy ' + rankClass + '"></i>' 
      : rank;
      
    const winRate = profile.played > 0 
      ? Math.round((profile.wins / profile.played) * 100) 
      : 0;
      
    const entry = document.createElement('div');
    entry.className = 'leaderboard-item' + (isCurrent ? ' current-user' : '');
    
    entry.innerHTML = '<div class="leaderboard-left">' +
        '<span class="leaderboard-rank">' + rankIconOrNum + '</span>' +
        '<span class="leaderboard-name" title="' + profile.name + '">' + profile.name + '</span>' +
      '</div>' +
      '<div class="leaderboard-right">' +
        '<span class="leaderboard-score">' + (profile.totalScore || 0) + ' PTS</span>' +
        '<span class="leaderboard-stats-summary">' + profile.wins + '/' + profile.played + ' Wins (' + winRate + '%)</span>' +
      '</div>';
    
    container.appendChild(entry);
  });
}
`;

fs.writeFileSync('index.js', jsContent);
console.log('BUILD_SUCCESS');
