// ============================================================
// SONGUESS - SUPABASE PERSISTENCE
// ============================================================

function getSupabaseEnv() {
  const envUrl = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_URL) || '';
  const envKey = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || '';
  const storageUrl = (typeof localStorage !== 'undefined') ? (localStorage.getItem('songuess_supabase_url') || '') : '';
  const storageKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('songuess_supabase_key') || '') : '';

  return { url: envUrl || storageUrl, anonKey: envKey || storageKey };
}

const SUPABASE_CONFIG = getSupabaseEnv();
let supabaseClient = null;
let realtimeChannel = null;
let supabaseAuthUser = null;
let supabaseAuthPromise = null;

function isSupabaseConfigured() {
  const cfg = getSupabaseEnv();
  return Boolean(cfg.url && cfg.anonKey && cfg.url.startsWith('https://') && cfg.anonKey.length > 20);
}

function initSupabase() {
  if (supabaseClient) return supabaseClient;
  const cfg = getSupabaseEnv();

  if (typeof window !== 'undefined' && window.supabase && isSupabaseConfigured()) {
    try {
      supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
        realtime: { params: { eventsPerSecond: 10 } }
      });
      console.log('[Supabase] Client initialized.');
    } catch (err) {
      console.warn('[Supabase] Init error:', err);
    }
  }
  return supabaseClient;
}

async function ensureSupabaseUser() {
  const client = initSupabase();
  if (!client) return null;
  if (supabaseAuthUser) return supabaseAuthUser;
  if (supabaseAuthPromise) return supabaseAuthPromise;

  supabaseAuthPromise = (async () => {
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session && data.session.user) {
        supabaseAuthUser = data.session.user;
        return supabaseAuthUser;
      }

      // Anonymous Auth gives this browser a stable owner ID for RLS-protected data.
      const result = await client.auth.signInAnonymously();
      if (result.error) throw result.error;
      supabaseAuthUser = result.data.user || (result.data.session && result.data.session.user) || null;
      return supabaseAuthUser;
    } catch (err) {
      console.warn('[Supabase] Sign-in unavailable. Local data will remain available:', err.message || err);
      return null;
    } finally {
      supabaseAuthPromise = null;
    }
  })();

  return supabaseAuthPromise;
}

function readLocalJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.warn('[Supabase] Could not read local data:', key, err);
    return fallback;
  }
}

function getLocalPlayerData() {
  return {
    username: (typeof currentUsername === 'string' && currentUsername) ? currentUsername : null,
    stats: readLocalJson('songuess_stats_v2', (typeof stats !== 'undefined' ? stats : {})) || {},
    custom_playlist: readLocalJson('songuess_custom_playlist'),
    apple_playlist: readLocalJson('songuess_apple_playlist'),
    artist_mode: readLocalJson('songuess_artist_mode')
  };
}

function applyRemotePlayerData(row) {
  if (!row) return;
  if (row.username && typeof currentUsername !== 'undefined') {
    currentUsername = row.username;
    localStorage.setItem('songuess_username', row.username);
  }

  const fields = [
    ['stats', 'songuess_stats_v2'],
    ['custom_playlist', 'songuess_custom_playlist'],
    ['apple_playlist', 'songuess_apple_playlist'],
    ['artist_mode', 'songuess_artist_mode']
  ];

  for (const [field, key] of fields) {
    if (row[field] !== null && row[field] !== undefined) {
      localStorage.setItem(key, JSON.stringify(row[field]));
    }
  }
}

async function syncPlayerDataToSupabase() {
  const client = initSupabase();
  if (!client) return false;
  const user = await ensureSupabaseUser();
  if (!user) return false;

  try {
    const playerData = getLocalPlayerData();
    const { error } = await client.from('player_data').upsert({
      user_id: user.id,
      username: playerData.username,
      stats: playerData.stats,
      custom_playlist: playerData.custom_playlist,
      apple_playlist: playerData.apple_playlist,
      artist_mode: playerData.artist_mode,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] Player data sync failed:', err.message || err);
    return false;
  }
}

async function loadPlayerDataFromSupabase() {
  const client = initSupabase();
  if (!client) return false;
  const user = await ensureSupabaseUser();
  if (!user) return false;

  try {
    const { data, error } = await client
      .from('player_data')
      .select('username, stats, custom_playlist, apple_playlist, artist_mode')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      applyRemotePlayerData(data);
    } else {
      // Import this browser's existing localStorage data on first sign-in.
      await syncPlayerDataToSupabase();
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Player data load failed:', err.message || err);
    return false;
  }
}

/**
 * Sync the public score row by username. RLS on player_data separately protects
 * private per-browser game state using the anonymous Auth user ID.
 */
async function syncUserScoreToSupabase(oldUsername = null) {
  if (!currentUsername || currentUsername === 'Guest' || currentUsername === 'אנונימי') {
    await syncPlayerDataToSupabase();
    return;
  }

  const client = initSupabase();
  if (!client) return;

  try {
    const userScore = stats.totalScore || 0;
    const userStreak = stats.currentStreak || 0;
    const maxStreak = stats.maxStreak || 0;
    const wins = stats.wins || 0;
    const played = stats.played || 0;

    if (oldUsername && oldUsername !== currentUsername && oldUsername !== 'Guest' && oldUsername !== 'אנונימי') {
      const { data, error } = await client
        .from('leaderboard')
        .update({
          username: currentUsername,
          score: userScore,
          streak: Math.max(maxStreak, userStreak),
          wins,
          played,
          updated_at: new Date().toISOString()
        })
        .eq('username', oldUsername)
        .select();

      if (!error && data && data.length > 0) {
        await syncPlayerDataToSupabase();
        return;
      }
    }

    const { error } = await client
      .from('leaderboard')
      .upsert({
        username: currentUsername,
        score: userScore,
        streak: Math.max(maxStreak, userStreak),
        wins,
        played,
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (error) {
      console.warn('[Supabase] Error syncing score:', error.message);
    } else {
      await syncPlayerDataToSupabase();
    }
  } catch (err) {
    console.warn('[Supabase] Score sync failed:', err.message || err);
  }
}

async function removeUserFromLeaderboard(username) {
  if (!username || username === 'Guest' || username === 'אנונימי') return;
  const client = initSupabase();
  if (!client) return;
  try {
    await client.from('leaderboard').delete().eq('username', username);
  } catch (err) {
    console.warn('[Supabase] Could not remove leaderboard row:', err.message || err);
  }
}

async function isUsernameTakenInSupabase(desiredName, currentName = null) {
  if (!desiredName) return false;
  const client = initSupabase();
  if (!client) return false;

  try {
    const trimmed = desiredName.trim();
    if (currentName && trimmed.toLowerCase() === currentName.trim().toLowerCase()) return false;
    const { data, error } = await client
      .from('leaderboard')
      .select('username')
      .ilike('username', trimmed)
      .limit(1);

    if (error) {
      console.warn('[Supabase] Username lookup failed:', error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err) {
    console.warn('[Supabase] Username lookup failed:', err.message || err);
    return false;
  }
}

async function fetchLeaderboardFromSupabase() {
  const client = initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('leaderboard')
      .select('username, score, streak, wins, played, updated_at')
      .order('score', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(row => ({
      name: row.username,
      score: row.score || 0,
      winRate: row.played > 0 ? Math.round((row.wins / row.played) * 100) + '%' : '0%',
      streak: row.streak || 0,
      isCurrent: Boolean(currentUsername && row.username.toLowerCase() === currentUsername.toLowerCase())
    }));
  } catch (err) {
    console.warn('[Supabase] Leaderboard fetch failed:', err.message || err);
    return null;
  }
}

function subscribeToLeaderboardRealtime(onChangeCallback) {
  const client = initSupabase();
  if (!client) return;

  if (realtimeChannel) {
    client.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  try {
    realtimeChannel = client
      .channel('public:leaderboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leaderboard'
      }, () => {
        if (typeof onChangeCallback === 'function') onChangeCallback();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Leaderboard subscription active.');
        }
      });
  } catch (err) {
    console.warn('[Supabase Realtime] Subscription error:', err.message || err);
  }
}

function unsubscribeLeaderboardRealtime() {
  const client = initSupabase();
  if (client && realtimeChannel) {
    client.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
