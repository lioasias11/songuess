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

async function fetchApplePlaylistTracks(rawUrl) {
  const urlMatch = (rawUrl || '').match(/https?:\/\/[^\s"'<>]+/i);
  const targetUrl = urlMatch ? urlMatch[0] : (rawUrl || '').trim();
  if (!targetUrl) return null;

  function extractFromSerializedServerData(text) {
    if (!text) return null;
    try {
      const match = text.match(/<script[^>]*id=["']serialized-server-data["'][^>]*>([\s\S]*?)<\/script>/i);
      if (!match) return null;
      const parsed = JSON.parse(match[1]);
      const root = parsed.data && parsed.data[0];
      if (!root || !root.data || !root.data.sections) return null;

      let playlistTitle = 'Apple Music Playlist';
      const headerSection = root.data.sections.find(s => s.itemKind === 'containerDetailHeaderLockup' || (s.items && s.items[0] && s.items[0].title));
      if (headerSection && headerSection.items && headerSection.items[0] && headerSection.items[0].title) {
        playlistTitle = headerSection.items[0].title;
      }

      const trackSection = root.data.sections.find(s => s.itemKind === 'trackLockup' || (s.items && s.items.length > 5));
      if (trackSection && trackSection.items) {
        const tracks = [];
        for (const item of trackSection.items) {
          const title = item.title || (item.attributes && item.attributes.name);
          const artist = item.artistName || item.subtitle || (item.attributes && item.attributes.artistName);
          if (title && artist) {
            tracks.push(`${artist} - ${title}`);
          } else if (title) {
            tracks.push(title);
          }
        }
        if (tracks.length > 0) {
          return { title: playlistTitle, tracks };
        }
      }
    } catch (e) {
      console.warn('Error extracting from serialized-server-data:', e);
    }
    return null;
  }

  function extractSongIds(text) {
    const songIds = new Set();
    if (!text) return [];
    
    // Isolate main tracklist section before recommendations/shelf-grid footer
    const mainSection = text.split(/class="[^"]*(?:shelf-grid|shelf-component|containerDetailTracklistFooter)[^"]*"/i)[0];

    // Pattern 1: /song/name/id or /song/id
    const songUrlRegex = /\/song\/(?:[^\/]+\/)?(\d{6,14})/g;
    let m;
    while ((m = songUrlRegex.exec(mainSection)) !== null) {
      if (m[1]) songIds.add(m[1]);
    }
    
    // Pattern 2: standard music.apple.com song urls
    const stdRegex = /music\.apple\.com\/[^\/]+\/song\/[^\/]+\/(\d+)/g;
    while ((m = stdRegex.exec(mainSection)) !== null) {
      if (m[1]) songIds.add(m[1]);
    }

    return Array.from(songIds);
  }

  function extractTitle(text) {
    if (!text) return 'Apple Music Playlist';
    const m = text.match(/<title>([^<]+)<\/title>/i) ||
              text.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
              text.match(/Title:\s*‎?([^\n\r]+)/i) ||
              text.match(/##\s*([^\n\r]+)/);
    if (m && m[1]) {
      return m[1].replace(/by .* - Apple Music|- Apple Music|on Apple Music/gi, '').trim();
    }
    return 'Apple Music Playlist';
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  let html = null;
  let title = 'Apple Music Playlist';
  let songIds = [];

  // Strategy 1: Jina with HTML mode (super fast, full HTML)
  try {
    const res = await fetchWithTimeout('https://r.jina.ai/' + targetUrl, {
      headers: {
        'X-Return-Format': 'html',
        'X-Target-Selector': 'body'
      }
    }, 6000);
    if (res.ok) {
      const text = await res.text();
      // First check direct structured data
      const directData = extractFromSerializedServerData(text);
      if (directData && directData.tracks.length > 0) {
        return directData;
      }
      const ids = extractSongIds(text);
      if (ids.length > 0) {
        html = text;
        songIds = ids;
        title = extractTitle(text);
      }
    }
  } catch (e) {
    console.warn('Jina proxy attempt failed, falling back:', e);
  }

  // Strategy 2: Allorigins fallback proxy
  if (songIds.length === 0) {
    try {
      const res = await fetchWithTimeout('https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl), {}, 6000);
      if (res.ok) {
        const json = await res.json();
        const text = json.contents || '';
        const directData = extractFromSerializedServerData(text);
        if (directData && directData.tracks.length > 0) {
          return directData;
        }
        const ids = extractSongIds(text);
        if (ids.length > 0) {
          songIds = ids;
          title = extractTitle(text);
        }
      }
    } catch (e) {
      console.warn('Allorigins proxy failed:', e);
    }
  }

  // Strategy 3: Codetabs fallback proxy
  if (songIds.length === 0) {
    try {
      const res = await fetchWithTimeout('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(targetUrl), {}, 6000);
      if (res.ok) {
        const text = await res.text();
        const directData = extractFromSerializedServerData(text);
        if (directData && directData.tracks.length > 0) {
          return directData;
        }
        const ids = extractSongIds(text);
        if (ids.length > 0) {
          songIds = ids;
          title = extractTitle(text);
        }
      }
    } catch (e) {
      console.warn('Codetabs proxy failed:', e);
    }
  }

  if (songIds.length === 0) {
    return null;
  }

  // Detect storefront country code from URL (e.g. 'il', 'us', 'gb', etc.)
  const countryMatch = targetUrl.match(/music\.apple\.com\/([a-z]{2})\//i);
  const storefront = countryMatch ? countryMatch[1].toLowerCase() : 'il';

  // Fetch track details with regional storefront support & chunking
  try {
    const allResults = [];
    const chunkSize = 70;
    const missingIds = [];

    for (let i = 0; i < songIds.length; i += chunkSize) {
      const chunk = songIds.slice(i, i + chunkSize);
      try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${chunk.join(',')}&country=${storefront}`;
        const lookupData = await fetchJsonp(lookupUrl, 7000);
        if (lookupData && lookupData.results) {
          const found = lookupData.results.filter(s => s.wrapperType === 'track' && s.artistName && s.trackName);
          allResults.push(...found);

          const foundIds = new Set(found.map(s => String(s.trackId)));
          chunk.forEach(id => {
            if (!foundIds.has(String(id))) missingIds.push(id);
          });
        }
      } catch (e) {
        console.warn('Storefront lookup chunk error:', e);
      }
    }

    // If any tracks were missing and primary storefront wasn't US, fallback to US storefront
    if (missingIds.length > 0 && storefront !== 'us') {
      for (let i = 0; i < missingIds.length; i += chunkSize) {
        const chunk = missingIds.slice(i, i + chunkSize);
        try {
          const usUrl = `https://itunes.apple.com/lookup?id=${chunk.join(',')}&country=us`;
          const usData = await fetchJsonp(usUrl, 5000);
          if (usData && usData.results) {
            const found = usData.results.filter(s => s.wrapperType === 'track' && s.artistName && s.trackName);
            allResults.push(...found);
          }
        } catch (e) { }
      }
    }

    // Deduplicate while preserving order
    const seenTracks = new Set();
    const tracks = [];
    for (const s of allResults) {
      const name = `${s.artistName} - ${s.trackName}`;
      const key = name.toLowerCase().trim();
      if (!seenTracks.has(key)) {
        seenTracks.add(key);
        tracks.push(name);
      }
    }

    if (tracks.length > 0) {
      return { title, tracks };
    }
  } catch (e) {
    console.error('Error fetching iTunes lookup details:', e);
  }

  return null;
}

