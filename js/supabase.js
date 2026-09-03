// ============================================================
// SONGUESS - SUPABASE REALTIME POSTGRES LEADERBOARD
// ============================================================

// Credentials are read dynamically from protected env.js, .env, or localStorage
function getSupabaseEnv() {
  const envUrl = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_URL) || '';
  const envKey = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || '';

  const storageUrl = (typeof localStorage !== 'undefined') ? (localStorage.getItem('songuess_supabase_url') || '') : '';
  const storageKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('songuess_supabase_key') || '') : '';

  return {
    url: envUrl || storageUrl,
    anonKey: envKey || storageKey
  };
}

const SUPABASE_CONFIG = getSupabaseEnv();

let supabaseClient = null;
let realtimeChannel = null;

function isSupabaseConfigured() {
  const cfg = getSupabaseEnv();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('https://') &&
    cfg.anonKey.length > 20
  );
}

function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const cfg = getSupabaseEnv();
  if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && isSupabaseConfigured()) {
    try {
      supabaseClient = window.supabase.createClient(
        cfg.url,
        cfg.anonKey,
        {
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        }
      );
      console.log('[Supabase] Initialized real-time client successfully.');
    } catch (err) {
      console.warn('[Supabase] Init error:', err);
      supabaseClient = null;
    }
  }

  return supabaseClient;
}

/**
 * Syncs the current user's high score, win rate, and streak to Supabase Postgres.
 * If oldUsername is provided and different from currentUsername, cleans up the old record.
 */
async function syncUserScoreToSupabase(oldUsername = null) {
  if (!currentUsername || currentUsername === 'Guest' || currentUsername === 'אנונימי') {
    return;
  }

  const client = initSupabase();
  if (!client) return;

  try {
    // If the user changed their name, remove the old username record so no duplicates exist
    if (oldUsername && oldUsername !== currentUsername && oldUsername !== 'Guest' && oldUsername !== 'אנונימי') {
      try {
        await client.from('leaderboard').delete().eq('username', oldUsername);
      } catch (e) { }
    }

    const userScore = stats.totalScore || 0;
    const userStreak = stats.currentStreak || 0;
    const maxStreak = stats.maxStreak || 0;
    const wins = stats.wins || 0;
    const played = stats.played || 0;

    const { error } = await client
      .from('leaderboard')
      .upsert({
        username: currentUsername,
        score: userScore,
        streak: maxStreak > userStreak ? maxStreak : userStreak,
        wins: wins,
        played: played,
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (error) {
      console.warn('[Supabase] Error syncing score:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Sync failed:', err);
  }
}

async function removeUserFromLeaderboard(username) {
  if (!username || username === 'Guest' || username === 'אנונימי') return;
  const client = initSupabase();
  if (!client) return;
  try {
    await client.from('leaderboard').delete().eq('username', username);
  } catch (e) { }
}

/**
 * Fetches the Top 50 players from Supabase Postgres in real time
 */
async function fetchLeaderboardFromSupabase() {
  const client = initSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('leaderboard')
      .select('username, score, streak, wins, played, updated_at')
      .order('score', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[Supabase] Error loading leaderboard:', error.message);
      return null;
    }

    return (data || []).map(row => {
      const winRate = row.played > 0 ? Math.round((row.wins / row.played) * 100) + '%' : '0%';
      return {
        name: row.username,
        score: row.score || 0,
        winRate: winRate,
        streak: row.streak || 0,
        isCurrent: Boolean(currentUsername && row.username.toLowerCase() === currentUsername.toLowerCase())
      };
    });
  } catch (err) {
    console.warn('[Supabase] Fetch failed:', err);
    return null;
  }
}

/**
 * Subscribes to live Postgres table updates via WebSockets
 */
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        (payload) => {
          console.log('[Supabase Realtime] Leaderboard updated in database:', payload);
          if (typeof onChangeCallback === 'function') {
            onChangeCallback();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected and listening to live leaderboard updates.');
        }
      });
  } catch (err) {
    console.warn('[Supabase Realtime] Subscription error:', err);
  }
}

function unsubscribeLeaderboardRealtime() {
  const client = initSupabase();
  if (client && realtimeChannel) {
    client.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
