// ==========================================
// SONGUESS - CUSTOM SPOTIFY & APPLE MUSIC MODALS
// ==========================================

let stagedCustomPlaylist = {
  title: '',
  tracks: []
};

let stagedApplePlaylist = {
  title: '',
  tracks: []
};

// --- SPOTIFY CUSTOM MODE ---

function loadSavedCustomPlaylist() {
  try {
    const saved = localStorage.getItem('songuess_custom_playlist');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        GENRE_SONGS['custom'] = parsed.tracks;
        GENRE_SONGS['spotify'] = parsed.tracks;
        stagedCustomPlaylist = parsed;
        updateCustomModalPreview();
      }
    }
  } catch (e) { }
}

function openCustomModal() {
  const modal = document.getElementById('modal-custom-playlist');
  if (modal) {
    modal.classList.add('active');
    updateCustomModalPreview();
  }
}

function hideCustomModal() {
  const modal = document.getElementById('modal-custom-playlist');
  if (modal) modal.classList.remove('active');
}

function updateCustomModalPreview() {
  const titleEl = document.getElementById('custom-playlist-title');
  const countEl = document.getElementById('custom-playlist-count');
  const listEl = document.getElementById('custom-tracks-preview');
  const startBtn = document.getElementById('btn-start-custom-game');

  const tracks = stagedCustomPlaylist.tracks || [];
  const defaultTitle = (typeof t === 'function') ? (tracks.length > 0 ? t('custom_tracklist_title') || 'Custom Tracklist' : t('no_playlist_loaded')) : 'No playlist loaded';
  const title = stagedCustomPlaylist.title || defaultTitle;

  if (titleEl) titleEl.textContent = title;
  if (countEl) {
    countEl.textContent = (typeof t === 'function') ? t('loaded_badge', { count: tracks.length }) : tracks.length + ' tracks';
  }

  if (listEl) {
    if (tracks.length === 0) {
      listEl.style.display = 'none';
      listEl.innerHTML = '';
    } else {
      listEl.style.display = 'flex';
      listEl.innerHTML = tracks.map((t, idx) => {
        const str = typeof t === 'string' ? t : ((t.artistName || t.artist || '') + ' - ' + (t.trackName || t.title || ''));
        return '<div class="custom-track-item"><strong>' + (idx + 1) + '.</strong> ' + str + '</div>';
      }).join('');
    }
  }

  if (startBtn) {
    startBtn.disabled = (tracks.length === 0);
  }
}

async function handleSpotifyImport() {
  const input = document.getElementById('custom-spotify-url');
  const btn = document.getElementById('btn-fetch-spotify');
  const rawInput = (input.value || '').trim();

  if (!rawInput) return;

  // Extract clean URL from mobile shared text
  const urlMatch = rawInput.match(/https?:\/\/[^\s"'<>]+/i);
  const cleanUrl = urlMatch ? urlMatch[0] : rawInput;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';

  try {
    // 1. Spotify URL (playlist, album, artist)
    if (cleanUrl.includes('spotify.com')) {
      const spData = await fetchSpotifyPlaylistTracks(cleanUrl);
      if (spData && spData.tracks.length > 0) {
        stagedCustomPlaylist = spData;
        updateCustomModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + spData.tracks.length + ' tracks!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      }
    }

    // 2. Apple Music Playlist / Album URL
    if (cleanUrl.includes('apple.com')) {
      if (cleanUrl.includes('playlist/') || cleanUrl.includes('pl.u-') || cleanUrl.includes('pl.')) {
        const plData = await fetchApplePlaylistTracks(cleanUrl);
        if (plData && plData.tracks.length > 0) {
          stagedCustomPlaylist = plData;
          updateCustomModalPreview();
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + plData.tracks.length + ' tracks!';
          setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
          return;
        }
      }

      const appleMatch = cleanUrl.match(/apple\.com\/.*\/album\/([^\/]+)\/(\d+)/i) || cleanUrl.match(/id=(\d+)/i) || cleanUrl.match(/\/(\d{6,12})/);
      if (appleMatch) {
        const collectionId = appleMatch[2] || appleMatch[1];
        if (/^\d+$/.test(collectionId)) {
          const lookupUrl = 'https://itunes.apple.com/lookup?id=' + collectionId + '&entity=song';
          const lookupData = await fetchJsonp(lookupUrl, 5000);
          if (lookupData && lookupData.results && lookupData.results.length > 0) {
            const albumInfo = lookupData.results[0];
            const songs = lookupData.results.filter(r => r.wrapperType === 'track');
            const tracks = songs.map(s => s.artistName + ' - ' + s.trackName);
            if (tracks.length > 0) {
              stagedCustomPlaylist = {
                title: (albumInfo.collectionName || 'Album') + ' by ' + (albumInfo.artistName || ''),
                tracks: tracks
              };
              updateCustomModalPreview();
              btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + tracks.length + ' tracks!';
              setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
              return;
            }
          }
        }
      }
    }

    // 3. Search Apple Music / iTunes for this album or artist text if not a URL
    if (!cleanUrl.startsWith('http')) {
      const searchData = await fetchAlbumTracksFromItunes(rawInput);
      if (searchData && searchData.tracks.length > 0) {
        stagedCustomPlaylist = searchData;
        updateCustomModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + searchData.tracks.length + ' tracks!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      }

      // If direct auto-lookup didn't find exact matches, switch to Search Album tab
      const searchTabBtn = document.querySelector('.custom-tab-btn[data-tab="search-album"]');
      const searchInput = document.getElementById('custom-album-query');
      if (searchTabBtn && searchInput) {
        searchInput.value = rawInput;
        searchTabBtn.click();
        handleAlbumSearch();
      }
    } else {
      btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Playlist not loaded';
      setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 2000);
    }
  } catch (err) {
    console.error('Import error:', err);
  } finally {
    if (btn.innerHTML.includes('Importing')) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import';
    }
  }
}

async function handleAlbumSearch() {
  const query = (document.getElementById('custom-album-query').value || '').trim();
  const resultsContainer = document.getElementById('album-search-results');
  const btn = document.getElementById('btn-search-album');

  if (!query) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1rem;">Searching albums...</div>';

  try {
    const searchUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=album&limit=8&media=music';
    const data = await fetchJsonp(searchUrl, 3500);

    if (data && data.results && data.results.length > 0) {
      resultsContainer.innerHTML = '';
      data.results.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card-result';
        const art = (album.artworkUrl100 || '').replace('100x100bb', '200x200bb');
        card.innerHTML = '<img src="' + art + '" alt="Album Art">' +
          '<span class="album-card-title">' + album.collectionName + '</span>' +
          '<span class="album-card-artist">' + album.artistName + ' (' + (album.trackCount || '?') + ' tracks)</span>';

        card.addEventListener('click', async () => {
          card.style.opacity = '0.5';
          const lookupUrl = 'https://itunes.apple.com/lookup?id=' + album.collectionId + '&entity=song';
          const lookupData = await fetchJsonp(lookupUrl, 3500);
          if (lookupData && lookupData.results) {
            const songs = lookupData.results.filter(r => r.wrapperType === 'track');
            const tracks = songs.map(s => s.artistName + ' - ' + s.trackName);
            stagedCustomPlaylist = {
              title: album.collectionName + ' by ' + album.artistName,
              tracks: tracks
            };
            updateCustomModalPreview();
            card.style.opacity = '1';
            card.style.borderColor = 'var(--green)';
          }
        });

        resultsContainer.appendChild(card);
      });
    } else {
      resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 1rem;">No albums found. Try another search!</div>';
    }
  } catch (err) {
    resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 1rem;">Search failed. Check your internet connection!</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search';
  }
}

function handlePastedSongs() {
  const textarea = document.getElementById('custom-songs-textarea');
  const text = (textarea.value || '').trim();
  if (!text) {
    alert('Please enter some song names!');
    return;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  if (lines.length === 0) {
    alert('No valid songs found!');
    return;
  }

  stagedCustomPlaylist = {
    title: 'Custom Tracklist (' + lines.length + ' songs)',
    tracks: lines
  };

  updateCustomModalPreview();
}

function applyCustomPreset(presetKey) {
  const preset = CUSTOM_PRESETS[presetKey] || (typeof APPLE_PRESETS !== 'undefined' && APPLE_PRESETS[presetKey]);
  if (preset) {
    stagedCustomPlaylist = {
      title: preset.title,
      tracks: [...preset.tracks]
    };
    updateCustomModalPreview();
  }
}

function startCustomGameFromModal() {
  if (!stagedCustomPlaylist.tracks || stagedCustomPlaylist.tracks.length === 0) return;

  GENRE_SONGS['custom'] = [...stagedCustomPlaylist.tracks];
  GENRE_SONGS['spotify'] = [...stagedCustomPlaylist.tracks];
  try {
    localStorage.setItem('songuess_custom_playlist', JSON.stringify(stagedCustomPlaylist));
  } catch (e) { }
  if (typeof syncPlayerDataToSupabase === 'function') {
    void syncPlayerDataToSupabase();
  }

  hideCustomModal();
  startNewGame('spotify');
}


// --- APPLE MUSIC CUSTOM MODE ---

function loadSavedApplePlaylist() {
  try {
    const saved = localStorage.getItem('songuess_apple_playlist');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        GENRE_SONGS['apple-music'] = parsed.tracks;
        stagedApplePlaylist = parsed;
        updateAppleModalPreview();
      }
    }
  } catch (e) { }
}

function openAppleModal() {
  const modal = document.getElementById('modal-apple-music');
  if (modal) {
    modal.classList.add('active');
    updateAppleModalPreview();
  }
}

function hideAppleModal() {
  const modal = document.getElementById('modal-apple-music');
  if (modal) modal.classList.remove('active');
}

function updateAppleModalPreview() {
  const titleEl = document.getElementById('apple-playlist-title');
  const countEl = document.getElementById('apple-playlist-count');
  const listEl = document.getElementById('apple-tracks-preview');
  const startBtn = document.getElementById('btn-start-apple-game');

  const tracks = stagedApplePlaylist.tracks || [];
  const title = stagedApplePlaylist.title || (tracks.length > 0 ? 'Apple Music Tracklist' : 'No Apple Music playlist loaded');

  if (titleEl) titleEl.textContent = title;
  if (countEl) countEl.textContent = tracks.length + ' tracks';

  if (listEl) {
    if (tracks.length === 0) {
      listEl.style.display = 'none';
      listEl.innerHTML = '';
    } else {
      listEl.style.display = 'flex';
      listEl.innerHTML = tracks.map((t, idx) => {
        const str = typeof t === 'string' ? t : ((t.artistName || t.artist || '') + ' - ' + (t.trackName || t.title || ''));
        return '<div class="custom-track-item"><strong>' + (idx + 1) + '.</strong> ' + str + '</div>';
      }).join('');
    }
  }

  if (startBtn) {
    startBtn.disabled = (tracks.length === 0);
  }
}

async function handleAppleLinkImport() {
  const input = document.getElementById('apple-music-url');
  const btn = document.getElementById('btn-fetch-apple');
  const rawInput = (input.value || '').trim();

  if (!rawInput) return;

  // Extract clean URL from mobile shared text (e.g. "Listen to ...: https://music.apple.com/...")
  const urlMatch = rawInput.match(/https?:\/\/[^\s"'<>]+/i);
  const cleanUrl = urlMatch ? urlMatch[0] : rawInput;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';

  try {
    // Check if this is a private iCloud library link (starts with /library/playlist/p.)
    if (cleanUrl.includes('library/playlist/p.')) {
      alert('This is a private iCloud library link (which requires your Apple ID password).\n\nTo import your playlist:\n1. In the Apple Music app, tap the 3 dots (···) on your playlist\n2. Tap "Share Playlist" ➔ "Copy Link" (it will start with /playlist/.../pl.u-)\n3. Paste the share link here!');
      return;
    }

    // 1. Check for Apple Music public playlist link: /playlist/ or pl.u- or pl.
    const isPlaylistLink = /playlist\/|pl\.u-|pl\./i.test(cleanUrl);
    if (isPlaylistLink) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading tracks...';
      const plData = await fetchApplePlaylistTracks(cleanUrl);
      if (plData && plData.tracks.length > 0) {
        stagedApplePlaylist = plData;
        updateAppleModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + plData.tracks.length + ' tracks!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      } else {
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Playlist not loaded';
        alert('Could not load tracks from this Apple Music playlist.\n\nPlease check that the playlist is public and that the link starts with /playlist/ or pl.u-');
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 2000);
        return;
      }
    }

    // 2. Check for Apple Music collection ID (Album)
    const appleMatch = cleanUrl.match(/apple\.com\/.*\/album\/([^\/]+)\/(\d+)/i) || cleanUrl.match(/id=(\d+)/i) || cleanUrl.match(/\/(\d{6,12})/);
    if (appleMatch) {
      const collectionId = appleMatch[2] || appleMatch[1];
      if (/^\d+$/.test(collectionId)) {
        const lookupUrl = 'https://itunes.apple.com/lookup?id=' + collectionId + '&entity=song';
        const lookupData = await fetchJsonp(lookupUrl, 5000);
        if (lookupData && lookupData.results && lookupData.results.length > 0) {
          const albumInfo = lookupData.results[0];
          const songs = lookupData.results.filter(r => r.wrapperType === 'track');
          const tracks = songs.map(s => s.artistName + ' - ' + s.trackName);
          if (tracks.length > 0) {
            stagedApplePlaylist = {
              title: (albumInfo.collectionName || 'Album') + ' by ' + (albumInfo.artistName || ''),
              tracks: tracks
            };
            updateAppleModalPreview();
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + tracks.length + ' tracks!';
            setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
            return;
          }
        }
      }
    }

    // 3. Direct search by text / album name if not a URL
    if (!cleanUrl.startsWith('http')) {
      const searchData = await fetchAlbumTracksFromItunes(rawInput);
      if (searchData && searchData.tracks.length > 0) {
        stagedApplePlaylist = searchData;
        updateAppleModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + searchData.tracks.length + ' tracks!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      }

      // 4. Fallback search by query songs
      const queryData = await fetchSongsByQueryFromItunes(rawInput);
      if (queryData && queryData.tracks.length > 0) {
        stagedApplePlaylist = queryData;
        updateAppleModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded ' + queryData.tracks.length + ' tracks!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      }

      // If text didn't parse, switch to search tab
      const searchTab = document.querySelector('.apple-tab-btn[data-tab="apple-search"]');
      const searchInput = document.getElementById('apple-album-query');
      if (searchTab && searchInput) {
        searchInput.value = rawInput;
        searchTab.click();
        handleAppleAlbumSearch();
      }
    } else {
      btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Invalid Link';
      setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 2000);
    }
  } catch (err) {
    console.error('Apple Music import error:', err);
  } finally {
    if (btn.innerHTML.includes('Importing')) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import';
    }
  }
}

async function handleAppleAlbumSearch() {
  const query = (document.getElementById('apple-album-query').value || '').trim();
  const resultsContainer = document.getElementById('apple-album-results');
  const btn = document.getElementById('btn-search-apple-album');

  if (!query) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1rem;">Searching music catalog...</div>';

  try {
    const searchUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=album&limit=8&media=music';
    const data = await fetchJsonp(searchUrl, 3500);

    if (data && data.results && data.results.length > 0) {
      resultsContainer.innerHTML = '';
      data.results.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card-result';
        const art = (album.artworkUrl100 || '').replace('100x100bb', '200x200bb');
        card.innerHTML = '<img src="' + art + '" alt="Album Art">' +
          '<span class="album-card-title">' + album.collectionName + '</span>' +
          '<span class="album-card-artist">' + album.artistName + ' (' + (album.trackCount || '?') + ' tracks)</span>';

        card.addEventListener('click', async () => {
          card.style.opacity = '0.5';
          const lookupUrl = 'https://itunes.apple.com/lookup?id=' + album.collectionId + '&entity=song';
          const lookupData = await fetchJsonp(lookupUrl, 3500);
          if (lookupData && lookupData.results) {
            const songs = lookupData.results.filter(r => r.wrapperType === 'track');
            const tracks = songs.map(s => s.artistName + ' - ' + s.trackName);
            stagedApplePlaylist = {
              title: album.collectionName + ' by ' + album.artistName,
              tracks: tracks
            };
            updateAppleModalPreview();
            card.style.opacity = '1';
            card.style.borderColor = '#fa2d48';
          }
        });

        resultsContainer.appendChild(card);
      });
    } else {
      resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 1rem;">No albums found on Apple Music. Try another search!</div>';
    }
  } catch (err) {
    resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 1rem;">Search failed. Check your internet connection!</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search';
  }
}

function handleApplePastedSongs() {
  const textarea = document.getElementById('apple-songs-textarea');
  const text = (textarea.value || '').trim();
  if (!text) return;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  if (lines.length === 0) return;

  stagedApplePlaylist = {
    title: 'Apple Custom Tracklist (' + lines.length + ' songs)',
    tracks: lines
  };

  updateAppleModalPreview();
}

function applyApplePreset(presetKey) {
  const preset = APPLE_PRESETS[presetKey];
  if (preset) {
    stagedApplePlaylist = {
      title: preset.title,
      tracks: [...preset.tracks]
    };
    updateAppleModalPreview();
  }
}

function startAppleGameFromModal() {
  if (!stagedApplePlaylist.tracks || stagedApplePlaylist.tracks.length === 0) return;

  GENRE_SONGS['apple-music'] = [...stagedApplePlaylist.tracks];
  try {
    localStorage.setItem('songuess_apple_playlist', JSON.stringify(stagedApplePlaylist));
  } catch (e) { }
  if (typeof syncPlayerDataToSupabase === 'function') {
    void syncPlayerDataToSupabase();
  }

  hideAppleModal();
  startNewGame('apple-music');
}

// ==========================================
// SINGLE ARTIST MODE (מצב זמר יחיד)
// ==========================================

let activeArtistData = {
  artistName: '',
  artistArtwork: '',
  tracks: []
};

let stagedArtistData = {
  artistName: '',
  artistArtwork: '',
  tracks: []
};

let artistSearchDebounceTimer = null;

function loadSavedArtistMode() {
  try {
    const saved = localStorage.getItem('songuess_artist_mode');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.artistName && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        activeArtistData = parsed;
        stagedArtistData = { ...parsed };
        GENRE_SONGS['artist'] = [...parsed.tracks];
        updateArtistPillBadge(parsed.artistName);
        updateArtistModalPreview();
      }
    }
  } catch (e) {
    console.warn('Error loading saved artist mode:', e);
  }
}

function updateArtistPillBadge(artistName) {
  const pill = document.getElementById('btn-artist-genre');
  if (!pill) return;
  const label = pill.querySelector('span') || pill;
  if (artistName) {
    label.textContent = artistName;
    pill.title = (typeof t === 'function' ? t('change_artist_btn') || 'Change Artist' : 'Change Artist') + ': ' + artistName;
  } else {
    label.textContent = (typeof t === 'function' ? t('artist_mode_genre') || 'Artist Mode' : 'Artist Mode');
  }
}

function openArtistModal() {
  const modal = document.getElementById('modal-artist-mode');
  if (modal) {
    // If an artist is currently active, initialize staged preview with it
    if (activeArtistData && activeArtistData.artistName && activeArtistData.tracks && activeArtistData.tracks.length > 0) {
      stagedArtistData = { ...activeArtistData };
    }
    updateArtistModalPreview();
    modal.classList.add('active');
    const searchInput = document.getElementById('artist-search-input');
    if (searchInput) {
      searchInput.value = (stagedArtistData && stagedArtistData.artistName) ? stagedArtistData.artistName : '';
      setTimeout(() => searchInput.focus(), 150);
    }
  }
}

function hideArtistModal() {
  const modal = document.getElementById('modal-artist-mode');
  if (modal) modal.classList.remove('active');

  // Revert staged state to current active artist since user closed without starting
  if (activeArtistData && activeArtistData.artistName && activeArtistData.tracks && activeArtistData.tracks.length > 0) {
    stagedArtistData = { ...activeArtistData };
  } else {
    stagedArtistData = {
      artistName: '',
      artistArtwork: '',
      tracks: []
    };
  }

  const searchInput = document.getElementById('artist-search-input');
  if (searchInput) {
    searchInput.value = (activeArtistData && activeArtistData.artistName) ? activeArtistData.artistName : '';
  }
  const clearBtn = document.getElementById('btn-clear-artist-search');
  if (clearBtn) {
    clearBtn.style.display = (searchInput && searchInput.value) ? 'flex' : 'none';
  }

  // Ensure pill badge strictly shows the ACTIVE artist (or default), never the cancelled preview
  updateArtistPillBadge(activeArtistData && activeArtistData.artistName ? activeArtistData.artistName : '');
  updateArtistModalPreview();
}

function updateArtistModalPreview() {
  const nameEl = document.getElementById('artist-preview-name');
  const countEl = document.getElementById('artist-preview-count');
  const imgEl = document.getElementById('artist-preview-img');
  const listEl = document.getElementById('artist-tracks-preview');
  const startBtn = document.getElementById('btn-start-artist-game');
  const statusArea = document.getElementById('artist-preview-area');

  const tracks = stagedArtistData.tracks || [];
  const artistName = stagedArtistData.artistName || '';

  if (statusArea) {
    statusArea.style.display = (artistName && tracks.length > 0) ? 'block' : 'none';
  }

  if (nameEl) nameEl.textContent = artistName || (typeof t === 'function' ? t('no_artist_loaded') : 'No artist selected');
  if (countEl) {
    countEl.textContent = (typeof t === 'function')
      ? t('loaded_artist_tracks', { count: tracks.length })
      : `${tracks.length} top songs`;
  }
  if (imgEl && stagedArtistData.artistArtwork) {
    imgEl.src = stagedArtistData.artistArtwork;
  }

  if (listEl) {
    if (tracks.length === 0) {
      listEl.innerHTML = '';
    } else {
      listEl.innerHTML = tracks.slice(0, 50).map((t, idx) => {
        const title = t.includes(' - ') ? t.split(' - ').slice(1).join(' - ') : t;
        return `<div class="custom-track-item"><strong>${idx + 1}.</strong> ${title}</div>`;
      }).join('');
      if (tracks.length > 50) {
        listEl.innerHTML += `<div class="custom-track-item" style="color: var(--text-muted); font-style: italic;">+ ${tracks.length - 50} more popular songs</div>`;
      }
    }
  }

  if (startBtn) {
    startBtn.disabled = (tracks.length === 0);
  }
}

async function selectArtistAndLoad(artistName, artistId = null) {
  if (!artistName) return;

  const loadingIndicator = document.getElementById('artist-loading-spinner');
  const resultsGrid = document.getElementById('artist-search-results');
  const searchInput = document.getElementById('artist-search-input');
  const clearBtn = document.getElementById('btn-clear-artist-search');

  if (searchInput) {
    searchInput.value = artistName;
    if (clearBtn) clearBtn.style.display = 'flex';
  }

  if (loadingIndicator) loadingIndicator.style.display = 'flex';
  if (resultsGrid) resultsGrid.innerHTML = '';

  try {
    const data = await fetchArtistTopTracks(artistName, artistId);
    if (data && data.tracks && data.tracks.length > 0) {
      stagedArtistData = data;
      if (searchInput && data.artistName) {
        searchInput.value = data.artistName;
      }
      updateArtistModalPreview();
      // NOTE: Do not update pill badge here. Pill badge is updated only when starting game.

      // Scroll preview area into view
      const statusArea = document.getElementById('artist-preview-area');
      if (statusArea) {
        statusArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      alert((typeof t === 'function' ? t('no_tracks_found') || 'Could not find tracks for this artist.' : 'Could not find tracks for this artist. Please try another name.'));
    }
  } catch (err) {
    console.error('Error fetching artist top tracks:', err);
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

function handleArtistSearchInput(query) {
  if (artistSearchDebounceTimer) clearTimeout(artistSearchDebounceTimer);

  const resultsGrid = document.getElementById('artist-search-results');
  const clearBtn = document.getElementById('btn-clear-artist-search');
  const cleanQ = (query || '').trim();

  if (clearBtn) clearBtn.style.display = cleanQ ? 'flex' : 'none';

  if (!cleanQ || cleanQ.length < 2) {
    if (resultsGrid) resultsGrid.innerHTML = '';
    return;
  }

  artistSearchDebounceTimer = setTimeout(async () => {
    const loading = document.getElementById('artist-loading-spinner');
    if (loading) loading.style.display = 'flex';

    try {
      const results = await searchArtists(cleanQ);
      renderArtistSearchResults(results);
    } catch (e) {
      console.warn('Artist search error:', e);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  }, 250);
}

function renderArtistSearchResults(artists) {
  const grid = document.getElementById('artist-search-results');
  if (!grid) return;
  grid.innerHTML = '';

  if (!artists || artists.length === 0) {
    return;
  }

  artists.forEach(a => {
    const card = document.createElement('div');
    card.className = 'artist-result-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${a.artwork || DEFAULT_ARTWORK_SVG}" alt="${a.artistName}" class="artist-card-avatar">
      <div class="artist-card-info">
        <div class="artist-card-name">${a.artistName}</div>
        <div class="artist-card-genre">${a.genre || 'Artist'}</div>
      </div>
      <button class="artist-card-select-btn" title="Select artist"><i class="fa-solid fa-play"></i></button>
    `;

    card.addEventListener('click', () => {
      selectArtistAndLoad(a.artistName, a.artistId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectArtistAndLoad(a.artistName, a.artistId);
      }
    });

    grid.appendChild(card);
  });
}

function startArtistGameFromModal() {
  if (!stagedArtistData.tracks || stagedArtistData.tracks.length === 0) return;

  activeArtistData = {
    artistName: stagedArtistData.artistName,
    artistArtwork: stagedArtistData.artistArtwork,
    tracks: [...stagedArtistData.tracks]
  };

  GENRE_SONGS['artist'] = [...activeArtistData.tracks];
  try {
    localStorage.setItem('songuess_artist_mode', JSON.stringify(activeArtistData));
  } catch (e) { }
  if (typeof syncPlayerDataToSupabase === 'function') {
    void syncPlayerDataToSupabase();
  }

  updateArtistPillBadge(activeArtistData.artistName);
  
  const modal = document.getElementById('modal-artist-mode');
  if (modal) modal.classList.remove('active');

  startNewGame('artist');
}
