// ==========================================
// SONGUESS - NETWORK & ITUNES / APPLE API
// ==========================================

const songArtworkCache = {};

function loadArtworkCache() {
  try {
    const saved = localStorage.getItem('songuess_art_cache');
    if (saved) Object.assign(songArtworkCache, JSON.parse(saved));
  } catch (e) { }
}

function saveArtworkCache() {
  try {
    const keys = Object.keys(songArtworkCache);
    if (keys.length > 500) {
      keys.slice(0, 100).forEach(k => delete songArtworkCache[k]);
    }
    localStorage.setItem('songuess_art_cache', JSON.stringify(songArtworkCache));
  } catch (e) { }
}

function fetchJsonp(url, timeoutMs = 3500) {
  return new Promise((resolve) => {
    const callbackName = 'itunes_cb_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const script = document.createElement('script');
    let timer = null;

    window[callbackName] = function (data) {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      if (timer) clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    document.head.appendChild(script);
  });
}

async function fetchTrackData(query) {
  if (!query) return null;

  // 1. Try iTunes search with original query and aliases
  const aliases = (typeof getArtistAliases === 'function') ? getArtistAliases(query) : [query];
  
  for (const q of aliases) {
    try {
      const itunesUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(q) + '&entity=song&limit=1&media=music';
      const data = await fetchJsonp(itunesUrl, 2500);
      if (data && data.results && data.results.length > 0) {
        const item = data.results[0];
        if (item.previewUrl) {
          let artwork = item.artworkUrl100 || '';
          artwork = artwork.replace('100x100bb', '600x600bb');

          return {
            previewUrl: item.previewUrl,
            artwork: artwork,
            trackName: item.trackName,
            artistName: item.artistName,
            collectionName: item.collectionName || 'Single'
          };
        }
      }
    } catch (e) { }
  }

  // 2. Fallback to Deezer API for preview audio
  for (const q of aliases) {
    try {
      const deezerUrl = 'https://api.deezer.com/search?q=' + encodeURIComponent(q) + '&limit=1&output=jsonp';
      const data = await fetchJsonp(deezerUrl, 2500);
      if (data && data.data && data.data.length > 0) {
        const item = data.data[0];
        if (item.preview) {
          return {
            previewUrl: item.preview,
            artwork: (item.album && (item.album.cover_big || item.album.cover_medium)) || DEFAULT_ARTWORK_SVG,
            trackName: item.title,
            artistName: (item.artist && item.artist.name) || 'Various',
            collectionName: (item.album && item.album.title) || 'Single'
          };
        }
      }
    } catch (e) { }
  }

  return null;
}

async function getOrFetchArtwork(trackName, artistName) {
  const key = normalizeSearchStr(trackName + ' ' + (artistName || ''));
  if (songArtworkCache[key]) {
    return songArtworkCache[key];
  }

  const query = (artistName ? artistName + ' ' : '') + trackName;
  const data = await fetchTrackData(query);
  if (data && data.artwork) {
    const thumb = data.artwork.replace('600x600bb', '100x100bb');
    songArtworkCache[key] = thumb;
    saveArtworkCache();
    return thumb;
  }

  return DEFAULT_ARTWORK_SVG;
}

const HEBREW_ARTIST_MAP = {
  "עומר אדם": ["Omer Adam"],
  "Omer Adam": ["עומר אדם"],
  "אייל גולן": ["Eyal Golan"],
  "Eyal Golan": ["אייל גולן"],
  "איתי לוי": ["Itay Levi", "Itay Levy", "Itai Levi", "Itai Levy"],
  "Itay Levi": ["איתי לוי", "Itay Levy", "Itai Levi", "Itai Levy"],
  "Itay Levy": ["איתי לוי", "Itay Levi", "Itai Levi", "Itai Levy"],
  "רינת בר": ["Rinat Bar"],
  "Rinat Bar": ["רינת בר"],
  "שילה בן סעדון": ["Shilo Ben Saadon", "Shilo Ben Sa'adon"],
  "Shilo Ben Saadon": ["שילה בן סעדון", "Shilo Ben Sa'adon"],
  "אושר כהן": ["Osher Cohen", "Osher Kohen"],
  "Osher Cohen": ["אושר כהן", "Osher Kohen"],
  "פאר טסי": ["Peer Tasi", "Pe'er Tasi", "Peer Tassi"],
  "Peer Tasi": ["פאר טסי", "Pe'er Tasi", "Peer Tassi"],
  "עדן חסון": ["Eden Hason", "Eden Hasson"],
  "Eden Hason": ["עדן חסון", "Eden Hasson"],
  "Eden Hasson": ["עדן חסון", "Eden Hason"],
  "נסרין קדרי": ["Nasrin Kadri", "Nasrin Qadri", "Nesrin Kadri"],
  "Nasrin Kadri": ["נסרין קדרי", "Nasrin Qadri"],
  "ליאור נרקיס": ["Lior Narkis"],
  "Lior Narkis": ["ליאור נרקיס"],
  "דודו אהרון": ["Dudu Aharon"],
  "Dudu Aharon": ["דודו אהרון"],
  "משה פרץ": ["Moshe Peretz"],
  "Moshe Peretz": ["משה פרץ"],
  "שרית חדד": ["Sarit Hadad"],
  "Sarit Hadad": ["שרית חדד"],
  "נועה קירל": ["Noa Kirel"],
  "Noa Kirel": ["נועה קירל"],
  "אנה זק": ["Anna Zak"],
  "Anna Zak": ["אנה זק"],
  "סטטיק": ["Static"],
  "בן אל": ["Ben El"],
  "טונה": ["Tuna"],
  "רביד פלוטניק": ["Ravid Plotnik"],
  "Ravid Plotnik": ["רביד פלוטניק"],
  "יסמין מועלם": ["Jasmin Moallem"],
  "חנן בן ארי": ["Hanan Ben Ari"],
  "Hanan Ben Ari": ["חנן בן ארי"],
  "בניה ברבי": ["Benaia Barabi", "Benaya Barabi"],
  "Benaia Barabi": ["בניה ברבי", "Benaya Barabi"],
  "עדן בן זקן": ["Eden Ben Zaken"],
  "Eden Ben Zaken": ["עדן בן זקן"],
  "ספיר מסיקה": ["Sapir Mesika", "Sapir Messika"],
  "Sapir Mesika": ["ספיר מסיקה", "Sapir Messika"],
  "ששון איפרם שאולוב": ["Sasson Ifram Shaulov"],
  "מרגי": ["Mergui"],
  "נתן גושן": ["Nathan Goshen"],
  "עידן רייכל": ["Idan Raichel"],
  "הפרויקט של רביבו": ["Revivo Project", "The Revivo Project"],
  "קובי פרץ": ["Kobi Peretz"],
  "מושיק עפיה": ["Moshik Afia"],
  "עמיר בניון": ["Amir Benayoun"],
  "זהר ארגוב": ["Zohar Argov"]
};

function getArtistAliases(artistOrQuery) {
  const norm = normalizeUnicode(artistOrQuery);
  const aliases = [artistOrQuery];

  for (const [key, valList] of Object.entries(HEBREW_ARTIST_MAP)) {
    const normKey = normalizeUnicode(key);
    const list = Array.isArray(valList) ? valList : [valList];

    if (norm.includes(normKey) || normKey.includes(norm)) {
      list.forEach(v => aliases.push(v));
      aliases.push(key);
    }
    for (const v of list) {
      const normV = normalizeUnicode(v);
      if (norm.includes(normV) || normV.includes(norm)) {
        aliases.push(key);
        list.forEach(item => aliases.push(item));
      }
    }
  }
  return [...new Set(aliases)];
}

async function searchDeezer(query) {
  try {
    const url = 'https://api.deezer.com/search?q=' + encodeURIComponent(query) + '&limit=25&output=jsonp';
    const data = await fetchJsonp(url, 3000);
    if (data && data.data && data.data.length > 0) {
      return data.data
        .filter(r => r.title && !/^\d{1,3}$/.test(r.title.trim()))
        .map(r => ({
          trackName: r.title,
          artistName: (r.artist && r.artist.name) ? r.artist.name : 'Unknown Artist',
          artwork: (r.album && r.album.cover_medium) ? r.album.cover_medium : DEFAULT_ARTWORK_SVG
        }));
    }
  } catch (e) { }
  return [];
}

async function searchItunes(query) {
  const allResults = [];
  const seen = new Set();

  function addResults(list) {
    if (!list) return;
    for (const item of list) {
      if (!item.trackName || !item.artistName) continue;
      if (/^\d{1,3}$/.test(item.trackName.trim())) continue; // filter untitled numbers like 06, 03
      const key = normalizeSearchStr(item.trackName + ' ' + item.artistName);
      if (!seen.has(key)) {
        seen.add(key);
        allResults.push(item);
      }
    }
  }

  const aliases = getArtistAliases(query);
  const promises = [];

  // Primary search in iTunes
  promises.push(
    (async () => {
      try {
        const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=30&media=music';
        const data = await fetchJsonp(url, 2500);
        if (data && data.results) {
          return data.results.map(r => ({
            trackName: r.trackName,
            artistName: r.artistName,
            artwork: (r.artworkUrl100 || '').replace('100x100bb', '100x100bb')
          }));
        }
      } catch (e) { }
      return [];
    })()
  );

  // Search transliterated aliases in iTunes (e.g. Itay Levi for itay levy)
  for (const alias of aliases) {
    if (alias !== query) {
      promises.push(
        (async () => {
          try {
            const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(alias) + '&entity=song&limit=30&media=music';
            const data = await fetchJsonp(url, 2500);
            if (data && data.results) {
              return data.results.map(r => ({
                trackName: r.trackName,
                artistName: r.artistName,
                artwork: (r.artworkUrl100 || '').replace('100x100bb', '100x100bb')
              }));
            }
          } catch (e) { }
          return [];
        })()
      );
    }
  }

  // Deezer native multilingual search for original query and all aliases
  for (const alias of aliases) {
    promises.push(searchDeezer(alias));
  }

  const resultArrays = await Promise.all(promises);
  resultArrays.forEach(arr => addResults(arr));

  // Prioritize tracks that match the searched artist
  const normAliases = aliases.map(normalizeUnicode);
  allResults.sort((a, b) => {
    const aMatch = normAliases.some(alias => alias.length >= 2 && (normalizeUnicode(a.artistName).includes(alias) || alias.includes(normalizeUnicode(a.artistName))));
    const bMatch = normAliases.some(alias => alias.length >= 2 && (normalizeUnicode(b.artistName).includes(alias) || alias.includes(normalizeUnicode(b.artistName))));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return allResults;
}

async function fetchAlbumTracksFromItunes(albumQuery) {
  try {
    const searchUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(albumQuery) + '&entity=album&limit=5&media=music';
    const data = await fetchJsonp(searchUrl, 3500);
    if (data && data.results && data.results.length > 0) {
      const album = data.results[0];
      const lookupUrl = 'https://itunes.apple.com/lookup?id=' + album.collectionId + '&entity=song';
      const lookupData = await fetchJsonp(lookupUrl, 3500);
      if (lookupData && lookupData.results) {
        const songs = lookupData.results.filter(r => r.wrapperType === 'track');
        const tracks = songs.map(s => s.artistName + ' - ' + s.trackName);
        return {
          title: album.collectionName + ' by ' + album.artistName,
          tracks: tracks
        };
      }
    } else {
      const songSearchUrl = 'https://itunes.apple.com/search?term=' + encodeURIComponent(albumQuery) + '&entity=song&limit=30&media=music';
      const songData = await fetchJsonp(songSearchUrl, 3500);
      if (songData && songData.results && songData.results.length > 0) {
        const tracks = [];
        const seen = new Set();
        for (const s of songData.results) {
          const str = s.artistName + ' - ' + s.trackName;
          if (!seen.has(normalizeSearchStr(str))) {
            seen.add(normalizeSearchStr(str));
            tracks.push(str);
          }
        }
        if (tracks.length > 0) {
          return {
            title: albumQuery,
            tracks: tracks
          };
        }
      }
    }
  } catch (e) { }
  return null;
}

async function fetchSongsByQueryFromItunes(query) {
  try {
    const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=50&media=music';
    const data = await fetchJsonp(url, 4000);
    if (data && data.results && data.results.length > 0) {
      const tracks = [];
      const seen = new Set();
      for (const s of data.results) {
        if (!s.trackName || !s.artistName) continue;
        const entry = s.artistName + ' - ' + s.trackName;
        const key = normalizeSearchStr(entry);
        if (!seen.has(key)) {
          seen.add(key);
          tracks.push(entry);
        }
      }
      if (tracks.length > 0) {
        return {
          title: query,
          tracks: tracks
        };
      }
    }
  } catch (e) { }
  return null;
}

async function fetchApplePlaylistTracks(playlistUrl) {
  try {
    const jinaUrl = 'https://r.jina.ai/' + playlistUrl;
    const res = await fetch(jinaUrl);
    if (res.ok) {
      const md = await res.text();
      const idRegex = /music\.apple\.com\/[^\/]+\/song\/[^\/]+\/(\d+)/g;
      let m;
      const songIds = [];
      const seenIds = new Set();
      while ((m = idRegex.exec(md)) !== null) {
        const id = m[1];
        if (!seenIds.has(id)) {
          seenIds.add(id);
          songIds.push(id);
        }
      }

      let title = 'Apple Music Playlist';
      const titleMatch = md.match(/Title:\s*‎?([^\n\r]+)/i) || md.match(/##\s*([^\n\r]+)/);
      if (titleMatch) {
        title = titleMatch[1].replace(/by .* - Apple Music|- Apple Music/gi, '').trim();
      }

      if (songIds.length > 0) {
        const batch = songIds.slice(0, 150);
        const lookupData = await fetchJsonp('https://itunes.apple.com/lookup?id=' + batch.join(','));
        if (lookupData && lookupData.results) {
          const tracks = lookupData.results
            .filter(s => s.artistName && s.trackName)
            .map(s => s.artistName + ' - ' + s.trackName);

          if (tracks.length > 0) {
            return { title, tracks };
          }
        }
      }
    }
  } catch (e) {
    console.error('Error fetching Apple playlist tracks:', e);
  }
  return null;
}
