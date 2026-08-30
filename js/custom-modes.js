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
  const title = stagedCustomPlaylist.title || (tracks.length > 0 ? 'Custom Tracklist' : 'No custom playlist loaded');

  if (titleEl) titleEl.textContent = title;
  if (countEl) countEl.textContent = tracks.length + ' tracks';

  if (listEl) {
    if (tracks.length === 0) {
      listEl.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 4px 0;">No tracks loaded yet. Import a link, search an album, or choose a featured preset above.</div>';
    } else {
      listEl.innerHTML = tracks.map((t, idx) => '<div class="custom-track-item"><strong>' + (idx + 1) + '.</strong> ' + t + '</div>').join('');
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
  const preset = CUSTOM_PRESETS[presetKey];
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
      listEl.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 4px 0;">No tracks loaded yet. Import an Apple Music link, search an album, or pick an Apple Hits preset.</div>';
    } else {
      listEl.innerHTML = tracks.map((t, idx) => '<div class="custom-track-item"><strong>' + (idx + 1) + '.</strong> ' + t + '</div>').join('');
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
  resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1rem;">Searching Apple Music...</div>';

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

  hideAppleModal();
  startNewGame('apple-music');
}
