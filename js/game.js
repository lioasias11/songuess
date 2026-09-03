// ==========================================
// SONGUESS - GAMEPLAY LOGIC & STATE
// ==========================================

let currentUsername = localStorage.getItem('songuess_username') || '';

let gameState = {
  activeGenre: 'white-girl-music',
  currentSong: null,
  attemptsUsed: 0,
  isFinished: false,
  hasWon: false,
  score: 0
};

let playedSongsPerGenre = {};

let stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalScore: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0]
};

function loadStats() {
  try {
    const saved = localStorage.getItem('songuess_stats_v2');
    if (saved) {
      stats = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Stats parse error:", e);
  }
}

function saveStats() {
  try {
    localStorage.setItem('songuess_stats_v2', JSON.stringify(stats));
  } catch (e) {
    console.error("Stats save error:", e);
  }
}

function normalizeSearchStr(str) {
  return normalizeUnicode(str);
}

function normalizeUnicode(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSongTitle(title) {
  if (!title) return '';
  return title
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\[feat\..*?\]/gi, '')
    .replace(/\(with.*?\)/gi, '')
    .replace(/\(remix.*?\)/gi, '')
    .replace(/\(official.*?\)/gi, '')
    .replace(/\(live.*?\)/gi, '')
    .replace(/feat\..*$/gi, '')
    .trim();
}

function isGuessCorrect(guessText, currentSong) {
  if (!guessText || !currentSong) return false;

  const guessNorm = normalizeUnicode(guessText);
  if (!guessNorm || guessNorm.length < 2) return false;

  const targetTitleClean = cleanSongTitle(currentSong.title);
  const targetTitleNorm = normalizeUnicode(targetTitleClean);
  const targetArtistNorm = normalizeUnicode(currentSong.artist);

  if (!targetTitleNorm || targetTitleNorm.length < 2) return false;

  const fullTarget1 = normalizeUnicode(currentSong.artist + ' ' + targetTitleClean);
  const fullTarget2 = normalizeUnicode(targetTitleClean + ' ' + currentSong.artist);

  // 1. Exact full string match
  if (guessNorm === fullTarget1 || guessNorm === fullTarget2) {
    return true;
  }

  // 2. If user guess is structured "Artist - Title" or "Title - Artist"
  if (guessText.includes('-')) {
    const parts = guessText.split('-').map(p => normalizeUnicode(p));
    if (parts.length >= 2) {
      const p1 = parts[0];
      const p2 = parts.slice(1).join(' ').trim();
      
      const p1MatchesArtist = targetArtistNorm && (p1 === targetArtistNorm || targetArtistNorm.includes(p1) || p1.includes(targetArtistNorm));
      const p2MatchesTitle = (p2 === targetTitleNorm || targetTitleNorm.includes(p2) || p2.includes(targetTitleNorm));
      if (p1MatchesArtist && p2MatchesTitle) return true;

      const p2MatchesArtist = targetArtistNorm && (p2 === targetArtistNorm || targetArtistNorm.includes(p2) || p2.includes(targetArtistNorm));
      const p1MatchesTitle = (p1 === targetTitleNorm || targetTitleNorm.includes(p1) || p1.includes(targetTitleNorm));
      if (p2MatchesArtist && p1MatchesTitle) return true;
    }
  }

  // 3. Exact title match
  if (guessNorm === targetTitleNorm) {
    return true;
  }

  // 4. Strong containment check
  if (guessNorm.length >= 4 && targetTitleNorm.length >= 4) {
    if (guessNorm.includes(targetTitleNorm) && (targetArtistNorm ? guessNorm.includes(targetArtistNorm) : true)) {
      return true;
    }
  }

  return false;
}

function getLocalMatches(query) {
  const normQuery = normalizeUnicode(query);
  if (!normQuery) return [];

  const queryAliases = (typeof getArtistAliases === 'function') ? getArtistAliases(query) : [query];
  const normQueryAliases = queryAliases.map(a => normalizeUnicode(a));

  const matched = [];
  const seen = new Set();

  function matchesAnyQuery(text) {
    if (!text) return false;
    const norm = normalizeUnicode(text);
    return normQueryAliases.some(q => norm.includes(q) || q.includes(norm));
  }

  // Search local genre / playlist songs
  for (const [genre, list] of Object.entries(GENRE_SONGS)) {
    for (const songStr of list) {
      const parts = songStr.split(' - ');
      let artist = 'Various';
      let title = songStr;
      if (parts.length >= 2) {
        artist = parts[0];
        title = parts.slice(1).join(' - ');
      }

      const songArtistAliases = (typeof getArtistAliases === 'function') ? getArtistAliases(artist) : [artist];
      const isSongMatch = songArtistAliases.some(a => matchesAnyQuery(a)) || matchesAnyQuery(title) || matchesAnyQuery(songStr);

      if (isSongMatch) {
        const key = normalizeSearchStr(title + ' ' + artist);
        if (!seen.has(key)) {
          seen.add(key);
          matched.push({
            trackName: title,
            artistName: artist,
            artwork: songArtworkCache[key] || DEFAULT_ARTWORK_SVG
          });
        }
      }
    }
  }

  return matched.slice(0, 15);
}

function getCleanTrackTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*[\(\[][^\)\]]*(?:feat\.?|featuring|with|prod\.?|remix|acoustic|live|radio|deluxe|bonus|edit|mix|version|explicit|clean|khea|audio|video|instrumental|cover|orchestral|extended|רמיקס|לייב|הופעה|בהופעה|אקוסטי|אקוסטית|שקטה|גרסה|קאבר|אירוח|מארח|מארחת|מארחים|בהשתתפות|דואט|אודיו|קליפ|רשמי|הפקה|קיסריה|מנורה)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*[-–—]\s*(?:feat\.?|featuring|with|prod\.?|remix|acoustic|live|radio|deluxe|bonus|edit|mix|version|explicit|clean|רמיקס|לייב|הופעה|בהופעה|אקוסטי|אקוסטית|שקטה|גרסה|קאבר|אירוח|מארח|מארחת|מארחים|בהשתתפות|דואט|אודיו|קליפ|רשמי|הפקה|קיסריה|מנורה|live[^\-–—]*|prod[^\-–—]*)[^-–—]*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPrimaryArtist(artist) {
  if (!artist) return '';
  const parts = artist.split(/,|\bfeat\.?\b|\bft\.?\b|\bfeaturing\b|&|\band\b|\bx\b|\bwith\b|\s+עם\s+|\s+מארח\s+|\s+מארחת\s+|\s+מארחים\s+|\s+בהשתתפות\s+/i);
  return parts[0].trim();
}

function getCanonicalArtist(artist) {
  if (!artist) return '';
  const primary = getPrimaryArtist(artist);
  const norm = (typeof normalizeSearchStr === 'function') ? normalizeSearchStr(primary) : primary.toLowerCase().trim();

  if (typeof HEBREW_ARTIST_MAP === 'object' && HEBREW_ARTIST_MAP) {
    for (const [hebKey, aliases] of Object.entries(HEBREW_ARTIST_MAP)) {
      const normHeb = (typeof normalizeSearchStr === 'function') ? normalizeSearchStr(hebKey) : hebKey.toLowerCase().trim();
      const aliasList = Array.isArray(aliases) ? aliases : [aliases];
      const normAliases = aliasList.map(a => (typeof normalizeSearchStr === 'function') ? normalizeSearchStr(a) : a.toLowerCase().trim());

      if (norm === normHeb || normAliases.includes(norm) || normHeb.includes(norm) || norm.includes(normHeb) || normAliases.some(a => norm.includes(a) || a.includes(norm))) {
        return normHeb;
      }
    }
  }

  return norm;
}

function getSongCanonicalKey(trackName, artistName) {
  const cleanTitle = getCleanTrackTitle(trackName);
  const normTitle = (typeof normalizeSearchStr === 'function') ? normalizeSearchStr(cleanTitle) : cleanTitle.toLowerCase();
  const normArtist = getCanonicalArtist(artistName);
  return `${normTitle}__${normArtist}`;
}

function mergeSuggestions(localMatches, apiMatches, query, currentSong) {
  const normQuery = normalizeUnicode(query);
  const valAliases = (typeof getArtistAliases === 'function') ? getArtistAliases(query) : [query];
  const normValAliases = valAliases.map(v => normalizeUnicode(v));

  const list = [];
  const seenCanonicalKeys = new Map();

  function add(item) {
    if (!item || !item.trackName || !item.artistName) return;
    const canKey = getSongCanonicalKey(item.trackName, item.artistName);

    if (seenCanonicalKeys.has(canKey)) {
      const existingIdx = seenCanonicalKeys.get(canKey);
      const existing = list[existingIdx];
      const existingHasModifier = /\b(remix|acoustic|live|mix|edit|version|deluxe)\b/i.test(existing.trackName);
      const itemHasModifier = /\b(remix|acoustic|live|mix|edit|version|deluxe)\b/i.test(item.trackName);
      if (existingHasModifier && !itemHasModifier) {
        list[existingIdx] = item;
      }
    } else {
      seenCanonicalKeys.set(canKey, list.length);
      list.push(item);
    }
  }

  // 1. Add local playlist matches first
  localMatches.forEach(add);

  // 2. Add API matches
  apiMatches.forEach(add);

  // 3. Ensure current round's song is included in the suggestions if matching
  if (currentSong) {
    const curArtist = currentSong.artist || '';
    const curTitle = currentSong.title || '';
    const curArtistAliases = (typeof getArtistAliases === 'function') ? getArtistAliases(curArtist) : [curArtist];
    const normCurTitle = normalizeUnicode(curTitle);
    const curCanonicalKey = getSongCanonicalKey(curTitle, curArtist);

    // Exact full title match (user typed the full/exact song name)
    const isExactTitleMatch = (normCurTitle.length >= 2 && (
      normCurTitle === normQuery || 
      normCurTitle.replace(/\s+/g, '') === normQuery.replace(/\s+/g, '')
    ));

    // Partial title match (user typed 2+ letters or prefix/substring)
    const isPartialTitleMatch = (!isExactTitleMatch && normQuery.length >= 2 && (
      normCurTitle.includes(normQuery) || normQuery.includes(normCurTitle)
    ));

    // Check if user searched the artist name
    const isArtistMatch = curArtistAliases.some(ca => {
      const caNorm = normalizeUnicode(ca);
      return normValAliases.some(va => va.length >= 2 && (caNorm.includes(va) || va.includes(caNorm)));
    });

    const currentItem = {
      trackName: curTitle,
      artistName: curArtist,
      artwork: currentSong.artwork || DEFAULT_ARTWORK_SVG
    };

    // Remove any duplicate or remix of the current round's song
    if (seenCanonicalKeys.has(curCanonicalKey)) {
      const existingIdx = seenCanonicalKeys.get(curCanonicalKey);
      list.splice(existingIdx, 1);
      seenCanonicalKeys.clear();
      list.forEach((it, idx) => seenCanonicalKeys.set(getSongCanonicalKey(it.trackName, it.artistName), idx));
    }

    if (isExactTitleMatch) {
      // User specifically typed the full exact title: show at top
      list.unshift(currentItem);
    } else if ((isPartialTitleMatch || isArtistMatch) && list.length > 0) {
      // User typed partial title or artist: place at a completely random position in the list
      const randIdx = Math.floor(Math.random() * Math.min(list.length + 1, 15));
      list.splice(randIdx, 0, currentItem);
    }
  }

  return list.slice(0, 15);
}

let activeDropdownIndex = -1;
let currentDropdownResults = [];
let autocompleteTimeout = null;

function setupAutocomplete() {
  const input = document.getElementById('guess-input');
  const clearBtn = document.getElementById('btn-clear-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const val = input.value.trim();
    if (clearBtn) clearBtn.style.display = val.length > 0 ? 'flex' : 'none';

    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);

    if (val.length < 1) {
      hideDropdown();
      return;
    }

    autocompleteTimeout = setTimeout(async () => {
      const searchVal = input.value.trim();
      if (!searchVal || searchVal !== val) return;

      const localMatches = getLocalMatches(searchVal);
      const apiMatches = await searchItunes(searchVal);
      if (input.value.trim() !== searchVal) return;

      const finalMerged = mergeSuggestions(localMatches, apiMatches, searchVal, gameState.currentSong);
      renderAutocompleteDropdown(finalMerged);
    }, 90);
  });

  input.addEventListener('keydown', (e) => {
    const dropdown = document.getElementById('autocomplete-dropdown');
    if (!dropdown || dropdown.style.display === 'none') {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitCurrentGuess();
      }
      return;
    }

    const items = dropdown.querySelectorAll('.suggestion-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeDropdownIndex = (activeDropdownIndex + 1) % items.length;
      updateDropdownSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeDropdownIndex = (activeDropdownIndex - 1 + items.length) % items.length;
      updateDropdownSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
        items[activeDropdownIndex].click();
      } else {
        submitCurrentGuess();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      hideDropdown();
      input.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-input-wrapper')) {
      hideDropdown();
    }
  });
}

function updateDropdownSelection(items) {
  items.forEach((it, idx) => {
    if (idx === activeDropdownIndex) {
      it.classList.add('selected');
      it.scrollIntoView({ block: 'nearest' });
    } else {
      it.classList.remove('selected');
    }
  });
}

function renderAutocompleteDropdown(results) {
  const dropdown = document.getElementById('autocomplete-dropdown');
  if (!dropdown) return;
  if (!results || results.length === 0) {
    hideDropdown();
    return;
  }

  currentDropdownResults = results;
  activeDropdownIndex = -1;

  dropdown.innerHTML = '';
  results.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'suggestion-item';

    const img = document.createElement('img');
    img.className = 'suggestion-artwork';
    img.src = item.artwork || DEFAULT_ARTWORK_SVG;
    img.alt = 'Cover';

    const info = document.createElement('div');
    info.className = 'suggestion-info';

    const titleBox = document.createElement('div');
    titleBox.className = 'suggestion-marquee-box';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'suggestion-title marquee-content';
    titleSpan.textContent = item.trackName;
    titleBox.appendChild(titleSpan);

    const artistBox = document.createElement('div');
    artistBox.className = 'suggestion-marquee-box';
    const artistSpan = document.createElement('span');
    artistSpan.className = 'suggestion-artist marquee-content';
    artistSpan.textContent = item.artistName;
    artistBox.appendChild(artistSpan);

    info.appendChild(titleBox);
    info.appendChild(artistBox);

    el.appendChild(img);
    el.appendChild(info);

    el.addEventListener('click', () => {
      const formatted = `${item.artistName} - ${item.trackName}`;
      const input = document.getElementById('guess-input');
      const clearBtn = document.getElementById('btn-clear-input');
      if (input) input.value = formatted;
      if (clearBtn) clearBtn.style.display = 'flex';
      hideDropdown();
      submitCurrentGuess();
    });

    dropdown.appendChild(el);
  });

  dropdown.style.display = 'block';

  // Apply Spotify-style slow shifting marquee on long song and artist names
  requestAnimationFrame(() => {
    dropdown.querySelectorAll('.suggestion-marquee-box').forEach(box => {
      const content = box.querySelector('.marquee-content');
      if (!content) return;
      const overflow = content.scrollWidth - box.clientWidth;
      if (overflow > 4) {
        content.classList.add('is-overflowing');
        content.style.setProperty('--marquee-shift', `${overflow + 8}px`);
        const duration = Math.min(10, Math.max(3.5, (overflow / 22) + 2));
        content.style.setProperty('--marquee-duration', `${duration.toFixed(1)}s`);
      } else {
        content.classList.remove('is-overflowing');
      }
    });
  });

  results.forEach(async (item, index) => {
    if (!item.artwork || item.artwork === DEFAULT_ARTWORK_SVG) {
      const art = await getOrFetchArtwork(item.trackName, item.artistName);
      if (art && art !== DEFAULT_ARTWORK_SVG) {
        const itemEls = dropdown.querySelectorAll('.suggestion-item');
        if (itemEls[index]) {
          const img = itemEls[index].querySelector('.suggestion-artwork');
          if (img) img.src = art;
        }
      }
    }
  });
}

function hideDropdown() {
  const dropdown = document.getElementById('autocomplete-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  activeDropdownIndex = -1;
}

function submitCurrentGuess() {
  const input = document.getElementById('guess-input');
  const clearBtn = document.getElementById('btn-clear-input');
  if (!input) return;
  const guessVal = input.value.trim();
  if (!guessVal) return;

  logAttempt(guessVal);
  input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  hideDropdown();
}

function logAttempt(guessText) {
  const attemptIdx = gameState.attemptsUsed;
  const isSkip = (guessText === null);

  const isCorrect = (!isSkip && gameState.currentSong) ? isGuessCorrect(guessText, gameState.currentSong) : false;

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

function endGame(hasWon) {
  gameState.isFinished = true;
  stopAudio();

  const guessInput = document.getElementById('guess-input');
  const submitBtn = document.getElementById('btn-submit');
  const skipBtn = document.getElementById('btn-skip');
  const giveupBtn = document.getElementById('btn-giveup');

  if (guessInput) guessInput.disabled = true;
  if (submitBtn) submitBtn.disabled = true;
  if (skipBtn) skipBtn.disabled = true;
  if (giveupBtn) giveupBtn.disabled = true;

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
  updateHeaderStats();
  if (typeof syncUserScoreToSupabase === 'function') {
    syncUserScoreToSupabase();
  }

  const modalTitle = document.getElementById('modal-title');
  const modalSub = document.getElementById('modal-subtitle');

  if (modalTitle) {
    modalTitle.textContent = hasWon ? t('correct_title') : t('gameover_title');
  }
  if (modalSub) {
    if (hasWon) {
      modalSub.innerHTML = `<span style="color: var(--green); font-weight: 700;">${t('correct_sub', { time: DURATIONS[gameState.attemptsUsed], pts: gameState.score })}</span>`;
    } else {
      const songTitle = (gameState.currentSong && gameState.currentSong.title) || '';
      const songArtist = (gameState.currentSong && gameState.currentSong.artist) || '';
      modalSub.innerHTML = `<span style="color: var(--text-secondary);">${t('gameover_sub', { title: songTitle, artist: songArtist })}</span>`;
    }
  }

  if (gameState.currentSong) {
    const titleEl = document.getElementById('reveal-title');
    const artistEl = document.getElementById('reveal-artist');
    const albumEl = document.getElementById('reveal-album');
    const artworkEl = document.getElementById('reveal-artwork');

    if (titleEl) titleEl.textContent = gameState.currentSong.title;
    if (artistEl) artistEl.textContent = gameState.currentSong.artist;
    if (albumEl) albumEl.textContent = gameState.currentSong.album || '';
    if (artworkEl) artworkEl.src = gameState.currentSong.artwork || DEFAULT_ARTWORK_SVG;

    const query = encodeURIComponent(`${gameState.currentSong.artist} ${gameState.currentSong.title}`);
    const itunesLink = document.getElementById('itunes-link');
    const ytLink = document.getElementById('youtube-link');
    if (itunesLink) itunesLink.href = `https://music.apple.com/search?term=${query}`;
    if (ytLink) ytLink.href = `https://www.youtube.com/results?search_query=${query}`;
  }

  updateStatsModalUI();
  showResultModal();
}

function updateHeaderStats() {
  const scoreVal = document.getElementById('score-val');
  const streakVal = document.getElementById('streak-val');
  const nameVal = document.getElementById('player-name-val');

  if (scoreVal) scoreVal.textContent = (stats.totalScore || 0).toLocaleString();
  if (streakVal) streakVal.textContent = stats.currentStreak || 0;
  if (nameVal) nameVal.textContent = currentUsername || t('guest_name');
}

function showResultModal() {
  const modal = document.getElementById('results-modal');
  if (modal) modal.classList.add('active');
}

function hideResultModal() {
  const modal = document.getElementById('results-modal');
  if (modal) modal.classList.remove('active');
}

function updateStatsModalUI() {
  const playedEl = document.getElementById('stat-played');
  const winrateEl = document.getElementById('stat-winrate');
  const streakEl = document.getElementById('stat-streak');
  const maxstreakEl = document.getElementById('stat-maxstreak');

  if (playedEl) playedEl.textContent = stats.played;
  const rate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  if (winrateEl) winrateEl.textContent = `${rate}%`;
  if (streakEl) streakEl.textContent = stats.currentStreak;
  if (maxstreakEl) maxstreakEl.textContent = stats.maxStreak;

  const maxGuesses = Math.max(...stats.guessDistribution, 1);
  for (let i = 0; i < 6; i++) {
    const count = stats.guessDistribution[i] || 0;
    const bar = document.getElementById(`dist-${i}`);
    if (bar) {
      const pct = Math.max((count / maxGuesses) * 100, count > 0 ? 10 : 0);
      bar.style.width = `${pct}%`;
      bar.textContent = count > 0 ? count : '';
    }
  }
}

function showStatsModal() {
  loadStats();
  updateStatsModalUI();
  showResultModal();
}

async function showLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  if (!modal) return;

  renderLeaderboardRows(null);
  modal.classList.add('active');

  if (typeof fetchLeaderboardFromSupabase === 'function' && typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
    const liveUsers = await fetchLeaderboardFromSupabase();
    if (liveUsers && liveUsers.length > 0) {
      renderLeaderboardRows(liveUsers);
    }
    if (typeof subscribeToLeaderboardRealtime === 'function') {
      subscribeToLeaderboardRealtime(async () => {
        const updated = await fetchLeaderboardFromSupabase();
        if (updated && updated.length > 0) {
          renderLeaderboardRows(updated);
        }
      });
    }
  }
}

function renderLeaderboardRows(users) {
  const container = document.getElementById('leaderboard-entries-container');
  if (!container) return;
  container.innerHTML = '';

  let list = users;
  if (!list || list.length === 0) {
    list = [
      { name: "DJ Spark", score: 14500, winRate: "88%", streak: 12 },
      { name: "BeatMaster", score: 12200, winRate: "79%", streak: 9 },
      { name: "SynthWave99", score: 9800, winRate: "72%", streak: 6 },
      { name: "HeardlePro", score: 8400, winRate: "65%", streak: 5 },
      { name: "MelodyQueen", score: 6900, winRate: "58%", streak: 4 }
    ];

    if (currentUsername && currentUsername !== 'Guest' && currentUsername !== 'אנונימי') {
      const userScore = stats.totalScore || 0;
      const userWinRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '0%';
      const userStreak = stats.maxStreak || 0;

      list.push({
        name: currentUsername + " (You)",
        score: userScore,
        winRate: userWinRate,
        streak: userStreak,
        isCurrent: true
      });
    }
  }

  list.sort((a, b) => b.score - a.score);

  list.forEach((u, idx) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row' + (u.isCurrent ? ' current-user' : '');

    let rankBadge = `#${idx + 1}`;
    if (idx === 0) rankBadge = '🥇';
    if (idx === 1) rankBadge = '🥈';
    if (idx === 2) rankBadge = '🥉';

    const displayName = u.isCurrent && !u.name.includes('(You)') ? `${u.name} (You)` : u.name;

    row.innerHTML = `
      <span class="leaderboard-rank">${rankBadge}</span>
      <div class="leaderboard-player-info">
        <strong>${displayName}</strong>
        <span>${u.winRate} Win Rate • ${u.streak} Streak</span>
      </div>
      <span class="leaderboard-score">${u.score.toLocaleString()} PTS</span>
    `;
    container.appendChild(row);
  });
}

function hideLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  if (modal) modal.classList.remove('active');
  if (typeof unsubscribeLeaderboardRealtime === 'function') {
    unsubscribeLeaderboardRealtime();
  }
}

function showNameSetupModal(isRequired = false) {
  const modal = document.getElementById('name-setup-modal');
  const input = document.getElementById('username-input');
  if (input) input.value = currentUsername || '';
  if (modal) modal.classList.add('active');
  if (input) setTimeout(() => input.focus(), 100);
}

function hideNameSetupModal() {
  const modal = document.getElementById('name-setup-modal');
  if (modal) modal.classList.remove('active');
}

function playAnonymously() {
  const previousName = currentUsername;
  currentUsername = t('guest_name');
  localStorage.setItem('songuess_username', currentUsername);

  updateHeaderStats();
  hideNameSetupModal();
  synth.playWin();

  if (previousName && typeof removeUserFromLeaderboard === 'function') {
    removeUserFromLeaderboard(previousName);
  }

  if (!gameState.currentSong) {
    startNewGame('white-girl-music');
  }
}

function saveUsername() {
  const input = document.getElementById('username-input');
  const msg = document.getElementById('name-validation-msg');
  if (!input) return;
  const val = (input.value || '').trim();

  if (val.length < 2) {
    if (msg) msg.textContent = t('validation_min_chars');
    return;
  }

  const previousName = currentUsername;
  currentUsername = val;
  localStorage.setItem('songuess_username', val);

  updateHeaderStats();
  hideNameSetupModal();
  synth.playWin();

  if (typeof syncUserScoreToSupabase === 'function') {
    syncUserScoreToSupabase(previousName);
  }

  if (!gameState.currentSong) {
    startNewGame('white-girl-music');
  }
}

async function selectTrackForRound(genre) {
  const pool = GENRE_SONGS[genre] || GENRE_SONGS['white-girl-music'];
  if (!pool || pool.length === 0) return null;

  if (!playedSongsPerGenre[genre]) {
    playedSongsPerGenre[genre] = [];
  }

  const unplayed = pool.filter(s => !playedSongsPerGenre[genre].includes(s));
  const candidateList = unplayed.length > 0
    ? [...unplayed].sort(() => Math.random() - 0.5)
    : [...pool].sort(() => Math.random() - 0.5);

  for (const chosenStr of candidateList) {
    const parts = chosenStr.split(' - ');
    let artist = 'Various';
    let title = chosenStr;
    if (parts.length >= 2) {
      artist = parts[0];
      title = parts.slice(1).join(' - ');
    }

    const trackData = await fetchTrackData(chosenStr);
    if (trackData && trackData.previewUrl) {
      if (!playedSongsPerGenre[genre].includes(chosenStr)) {
        playedSongsPerGenre[genre].push(chosenStr);
      }
      return {
        title: title,
        artist: artist,
        album: trackData.collectionName || 'Single',
        artwork: trackData.artwork || DEFAULT_ARTWORK_SVG,
        previewUrl: trackData.previewUrl
      };
    }
  }

  // If initial batch failed, pick first with fallback fetch
  const fallbackStr = candidateList[0] || pool[0];
  const parts = fallbackStr.split(' - ');
  let artist = parts[0] || 'Various';
  let title = parts.slice(1).join(' - ') || fallbackStr;
  const trackData = await fetchTrackData(title + ' ' + artist);

  return {
    title: title,
    artist: artist,
    album: (trackData && trackData.collectionName) || 'Single',
    artwork: (trackData && trackData.artwork) || DEFAULT_ARTWORK_SVG,
    previewUrl: (trackData && trackData.previewUrl) || ''
  };
}

async function startNewGame(genre = 'white-girl-music') {
  stopAudio();
  hideResultModal();

  gameState.activeGenre = genre;
  gameState.attemptsUsed = 0;
  gameState.isFinished = false;
  gameState.hasWon = false;
  gameState.score = 0;

  document.querySelectorAll('.genre-pill-btn').forEach(btn => {
    if (btn.dataset.genre === genre) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const feedback = document.getElementById('game-feedback-text');
  if (feedback) {
    feedback.textContent = t('listen_prompt');
    feedback.style.color = 'var(--text-secondary)';
  }

  const input = document.getElementById('guess-input');
  const submitBtn = document.getElementById('btn-submit');
  const skipBtn = document.getElementById('btn-skip');
  const giveupBtn = document.getElementById('btn-giveup');
  const clearBtn = document.getElementById('btn-clear-input');

  if (input) {
    input.value = '';
    input.disabled = false;
  }
  if (submitBtn) submitBtn.disabled = false;
  if (skipBtn) skipBtn.disabled = false;
  if (giveupBtn) giveupBtn.disabled = false;
  if (clearBtn) clearBtn.style.display = 'none';

  updateActiveSegment(0);
  updateTimeline(DURATIONS[0]);
  updateSkipButtonText();

  const song = await selectTrackForRound(genre);
  gameState.currentSong = song;

  const audio = getAudioPlayer();
  if (song && song.previewUrl && audio) {
    audio.src = song.previewUrl;
    audio.load();
  }
}

function updateActiveSegment(attempt) {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const seg = document.querySelector(`.c-segment.seg-${i}`);
    if (!seg) continue;

    seg.classList.remove('active', 'used', 'correct', 'failed');
    if (i < attempt) {
      seg.classList.add('used');
    } else if (i === attempt) {
      seg.classList.add('active');
    }
  }
}

function updateTimeline(seconds) {
  const curTime = document.getElementById('snippet-duration');
  if (curTime) {
    curTime.textContent = seconds.toFixed(1) + 's';
  }
}

function updateSkipButtonText() {
  const btn = document.getElementById('btn-skip');
  if (!btn) return;

  const currentDuration = DURATIONS[gameState.attemptsUsed] || 0.1;
  const nextDuration = DURATIONS[gameState.attemptsUsed + 1] || 10.0;
  const diff = (nextDuration - currentDuration).toFixed(1);

  const iconHtml = `<i class="fa-solid fa-forward-step"></i>`;
  if (gameState.attemptsUsed >= MAX_ATTEMPTS - 1) {
    btn.innerHTML = `${iconHtml} ${t('skip_final')}`;
  } else {
    btn.innerHTML = `${iconHtml} ${t('skip_diff', { diff })}`;
  }
}
