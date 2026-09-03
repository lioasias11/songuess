// ==========================================
// SONGUESS - DATA & CONSTANTS
// ==========================================

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

function normalizeSearchStr(str) {
  return normalizeUnicode(str);
}

const DURATIONS = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0];
const SCORE_TIERS = [1000, 800, 600, 400, 200, 100];
const MAX_ATTEMPTS = 6;

let currentLanguage = localStorage.getItem('songuess_lang') || 'en';

const TRANSLATIONS = {
  en: {
    app_title: "SONGUESS // Heardle Music Guessing Game",
    brand_name: "SONGUESS",
    tagline: "Guess the song from short snippets!",
    guest_name: "Guest",
    pts: "PTS",
    streak: "STREAK",
    best: "Best",
    played: "Played",
    win_rate: "Win Rate",
    listen_prompt: "Listen to snippet and guess the song",
    search_placeholder: "Search songs...",
    skip_btn: "Skip",
    giveup_title: "Give up & reveal track",
    correct_title: "Track Decrypted!",
    correct_sub: "Unlocked in {time}s • +{pts} PTS",
    gameover_title: "Game Over",
    gameover_sub: "The song was {title} by {artist}",
    next_song: "Next Song",
    skip_diff: "Skip (+{diff}s)",
    skip_final: "Skip (Final Attempt)",
    clear_input: "Clear input",
    submit_guess: "Submit guess",
    name_modal_title: "CHOOSE YOUR STAGE NAME",
    name_modal_sub: "Enter your name to track stats and compete on the leaderboard",
    name_input_placeholder: "e.g. DJ Spark, SynthwaveFan",
    start_playing_btn: "Start Playing",
    play_anonymous_btn: "Play Anonymously",
    select_language: "Select Language / בחר שפה",
    edit_switch_name: "Edit / Switch Name",
    close: "Close",
    leaderboard_title: "SONGUESS LEADERBOARD",
    leaderboard_sub: "Top players ranked by total points",
    leaderboard_you: "(You)",
    win_rate_label: "Win Rate",
    streak_label: "Streak",
    pts_label: "PTS",
    stats_title: "YOUR STATISTICS",
    stats_sub: "Performance and guess distribution",
    guess_distribution: "Guess Distribution",
    spotify_modal_title: "CUSTOM PLAYLIST & ALBUM",
    spotify_modal_sub: "Play any Spotify playlist, album, or custom tracklist",
    apple_modal_title: "APPLE MUSIC PLAYLISTS",
    apple_modal_sub: "Play Israeli and international Apple Music playlists or albums",
    tab_link: "Link",
    tab_search_album: "Search Album",
    tab_paste_list: "Paste List",
    tab_featured: "Featured",
    paste_link_label: "Paste Music Link or Album / Artist Name",
    paste_link_placeholder: "e.g. Apple Music link, Spotify link, or 'Peer Tasi רדיו שטח 2'...",
    import_btn: "Import",
    play_playlist_btn: "Play This Playlist",
    loaded_badge: "{count} tracks",
    no_playlist_loaded: "No playlist loaded",
    validation_min_chars: "Name must be at least 2 characters.",
    validation_name_taken: "Username is already taken. Please choose another name.",
    checking_name_btn: "Checking...",
    genres: {
      "white-girl-music": "White Girl Music",
      "pop": "Pop",
      "rock": "Rock",
      "hiphop": "Hip-Hop",
      "electronic": "EDM",
      "80s": "80s",
      "90s": "90s",
      "2000s": "2000s",
      "spotify": "Spotify",
      "apple-music": "Apple Music"
    }
  },
  he: {
    app_title: "גלהשיר // משחק ניחוש שירים",
    brand_name: "גלהשיר",
    tagline: "נחש את השיר מתוך קטעי שמע קצרים!",
    guest_name: "אנונימי",
    pts: "נקודות",
    streak: "רצף",
    best: "שיא",
    played: "משחקים",
    win_rate: "אחוזי ניצחון",
    listen_prompt: "האזן לקטע ונחש את השיר",
    search_placeholder: "חפש שיר או אמן...",
    skip_btn: "דלג",
    giveup_title: "וותר וחשוף את השיר",
    correct_title: "פיצחת את השיר!",
    correct_sub: "נפתח ב-{time} שנ' • +{pts} נקודות",
    gameover_title: "המשחק הסתיים",
    gameover_sub: "השיר היה {title} מאת {artist}",
    next_song: "שיר הבא",
    skip_diff: "דלג (+{diff} שנ')",
    skip_final: "דלג (ניסיון אחרון)",
    clear_input: "נקה חיפוש",
    submit_guess: "שלח ניחוש",
    name_modal_title: "בחר כינוי לשחקן",
    name_modal_sub: "הזן שם למעקב אחר הסטטיסטיקה והטבלאות",
    name_input_placeholder: "למשל: מלך הפופ, רוקר 99",
    start_playing_btn: "התחל לשחק",
    play_anonymous_btn: "שחק כאנונימי",
    select_language: "בחר שפה / Select Language",
    edit_switch_name: "שנה שם משתמש",
    close: "סגור",
    leaderboard_title: "טבלת המובילים - גלהשיר",
    leaderboard_sub: "השחקנים המובילים לפי ניקוד מצטבר",
    leaderboard_you: "(את/ה)",
    win_rate_label: "אחוזי ניצחון",
    streak_label: "רצף",
    pts_label: "נקודות",
    stats_title: "הסטטיסטיקה שלך",
    stats_sub: "ביצועים והתפלגות ניחושים",
    guess_distribution: "התפלגות ניחושים",
    spotify_modal_title: "פלייליסט ואלבומים מספוטיפיי",
    spotify_modal_sub: "שחק עם כל פלייליסט, אלבום או רשימת שירים",
    apple_modal_title: "פלייליסטים מאפל מיוזיק",
    apple_modal_sub: "שחק עם פלייליסטים ישראליים ולועזיים מאפל מיוזיק",
    tab_link: "קישור",
    tab_search_album: "חיפוש אלבום",
    tab_paste_list: "הדבקת רשימה",
    tab_featured: "מומלצים",
    paste_link_label: "הדבק קישור למוזיקה או שם אלבום / אמן",
    paste_link_placeholder: "למשל: קישור לספוטיפיי, אפל מיוזיק, או 'פאר טסי רדיו שטח 2'...",
    import_btn: "ייבוא",
    play_playlist_btn: "שחק עם הפלייליסט",
    loaded_badge: "{count} שירים",
    no_playlist_loaded: "לא נטען פלייליסט",
    validation_min_chars: "השם חייב להכיל לפחות 2 תווים.",
    validation_name_taken: "שם המשתמש כבר תפוס. אנא בחר שם אחר.",
    checking_name_btn: "בודק זמינות...",
    genres: {
      "white-girl-music": "להיטי פופ מוכרים",
      "pop": "פופ",
      "rock": "רוק",
      "hiphop": "היפ-הופ",
      "electronic": "אלקטרוני",
      "80s": "שנות ה-80",
      "90s": "שנות ה-90",
      "2000s": "שנות ה-2000",
      "spotify": "ספוטיפיי",
      "apple-music": "אפל מיוזיק"
    }
  }
};

function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  let text = dict[key] || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
  for (const [pKey, pVal] of Object.entries(params)) {
    text = text.replace(new RegExp('\\{' + pKey + '\\}', 'g'), pVal);
  }
  return text;
}

function applyLanguage(lang) {
  currentLanguage = (lang === 'he') ? 'he' : 'en';
  localStorage.setItem('songuess_lang', currentLanguage);

  const isRtl = (currentLanguage === 'he');
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLanguage;
  if (isRtl) {
    document.body.classList.add('rtl-mode');
  } else {
    document.body.classList.remove('rtl-mode');
  }

  // Update title
  document.title = t('app_title');

  // Update brand name
  const brandName = document.querySelector('.brand-name');
  if (brandName) brandName.textContent = t('brand_name');

  // Update language toggle button in header
  const langToggleText = document.getElementById('lang-toggle-text');
  if (langToggleText) {
    langToggleText.textContent = isRtl ? 'EN 🇺🇸' : 'עב 🇮🇱';
  }

  // Update genre pills
  document.querySelectorAll('.genre-pill-btn').forEach(btn => {
    const genre = btn.dataset.genre;
    const dictGenres = (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage].genres) || {};
    if (dictGenres[genre]) {
      if (genre === 'spotify') {
        btn.innerHTML = `<i class="fa-brands fa-spotify"></i> ${dictGenres[genre]}`;
      } else if (genre === 'apple-music') {
        btn.innerHTML = `<i class="fa-brands fa-apple"></i> ${dictGenres[genre]}`;
      } else {
        btn.textContent = dictGenres[genre];
      }
    }
  });

  // Update search input placeholder
  const guessInput = document.getElementById('guess-input');
  if (guessInput) {
    guessInput.placeholder = t('search_placeholder');
  }

  // Update skip button
  if (typeof updateSkipButtonText === 'function') {
    updateSkipButtonText();
  }

  // Update game feedback text if idle
  const feedback = document.getElementById('game-feedback-text');
  if (feedback && (!gameState || !gameState.isFinished)) {
    feedback.textContent = t('listen_prompt');
  }

  // Update stats labels in results modal
  const lblPlayed = document.querySelector('#stat-played + .stat-lbl');
  if (lblPlayed) lblPlayed.textContent = t('played');
  const lblWinrate = document.querySelector('#stat-winrate + .stat-lbl');
  if (lblWinrate) lblWinrate.textContent = t('win_rate');
  const lblStreak = document.querySelector('#stat-streak + .stat-lbl');
  if (lblStreak) lblStreak.textContent = t('streak');
  const lblMaxstreak = document.querySelector('#stat-maxstreak + .stat-lbl');
  if (lblMaxstreak) lblMaxstreak.textContent = t('best');

  const distTitle = document.querySelector('.guess-distribution-container h4');
  if (distTitle) distTitle.textContent = t('guess_distribution');

  // Update Next Song button
  const nextSongBtn = document.getElementById('btn-next-song');
  if (nextSongBtn) {
    nextSongBtn.innerHTML = `${t('next_song')} <i class="fa-solid fa-arrow-${isRtl ? 'left' : 'right'}"></i>`;
  }

  // Update player name if guest
  const nameVal = document.getElementById('player-name-val');
  if (nameVal && (!currentUsername || currentUsername === 'Guest' || currentUsername === 'אנונימי')) {
    currentUsername = t('guest_name');
    nameVal.textContent = currentUsername;
  }

  // Update static elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update language choice buttons in name modal
  document.querySelectorAll('.lang-choice-btn').forEach(btn => {
    if (btn.dataset.lang === currentLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update header stats text (PTS, STREAK)
  if (typeof updateHeaderStats === 'function') {
    updateHeaderStats();
  }
}

const DEFAULT_ARTWORK_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">' +
  '<rect width="100" height="100" rx="12" fill="#18181b"/>' +
  '<circle cx="50" cy="50" r="30" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>' +
  '<circle cx="50" cy="50" r="10" fill="#18181b" stroke="#22c55e" stroke-width="2"/>' +
  '<path d="M46 42 L58 50 L46 58 Z" fill="#22c55e"/>' +
  '</svg>'
);

const GENRE_SONGS = {
  "white-girl-music": [
    "Katy Perry - California Gurls",
    "Miley Cyrus - Party In The U.S.A.",
    "Carly Rae Jepsen - Call Me Maybe",
    "Taylor Swift - Love Story",
    "Avril Lavigne - Girlfriend",
    "Pitbull - Give Me Everything (feat. Ne-Yo, Afrojack & Nayer)",
    "Ke$ha - TiK ToK",
    "Britney Spears - Toxic",
    "Lady Gaga - Bad Romance",
    "Vanessa Carlton - A Thousand Miles",
    "Katy Perry - Teenage Dream",
    "Macklemore & Ryan Lewis - Thrift Shop (feat. Wanz)",
    "Taylor Swift - You Belong With Me",
    "Natasha Bedingfield - Unwritten",
    "Gwen Stefani - Hollaback Girl",
    "Fergie - Big Girls Don't Cry",
    "Kelly Clarkson - Since U Been Gone",
    "Rihanna - Umbrella",
    "ABBA - Dancing Queen",
    "Cascada - Everytime We Touch",
    "The Black Eyed Peas - I Gotta Feeling",
    "Taylor Swift - Blank Space",
    "Flo Rida - Low (feat. T-Pain)",
    "Justin Bieber - Baby",
    "Usher - DJ Got Us Fallin' In Love (feat. Pitbull)",
    "Cyndi Lauper - Girls Just Want to Have Fun",
    "Taio Cruz - Dynamite",
    "Shakira - Hips Don't Lie",
    "Avril Lavigne - Sk8er Boi",
    "Katy Perry - Firework",
    "Outkast - Hey Ya!",
    "One Direction - What Makes You Beautiful",
    "Spice Girls - Wannabe",
    "Miley Cyrus - We Can't Stop",
    "Taylor Swift - Shake It Off",
    "The Killers - Mr. Brightside",
    "Bruno Mars - Uptown Funk",
    "Sean Kingston - Beautiful Girls",
    "Ellie Goulding - Lights",
    "Pitbull - Timber (feat. Ke$ha)",
    "Kesha - Die Young",
    "Lady Gaga - Poker Face",
    "Britney Spears - ...Baby One More Time",
    "P!nk - So What",
    "Meghan Trainor - All About That Bass",
    "The Chainsmokers - Closer (feat. Halsey)",
    "Hilary Duff - What Dreams Are Made Of",
    "Beyoncé - Single Ladies (Put a Ring on It)",
    "Charli XCX - Boom Clap",
    "Lorde - Royals",
    "Fifth Harmony - Worth It (feat. Kid Ink)",
    "Iggy Azalea - Fancy (feat. Charli XCX)",
    "Ariana Grande - Problem",
    "Whitney Houston - I Wanna Dance with Somebody",
    "Demi Lovato - Heart Attack",
    "Icona Pop - I Love It (feat. Charli XCX)",
    "Little Mix - Black Magic",
    "Selena Gomez & The Scene - Naturally",
    "Jessie J - Price Tag (feat. B.o.B)",
    "Nelly Furtado - Promiscuous (feat. Timbaland)",
    "Colbie Caillat - Bubbly",
    "Sara Bareilles - Love Song",
    "Michelle Branch - Everywhere",
    "Alicia Keys - No One",
    "Cher - Believe",
    "Spice Girls - Stop",
    "Shania Twain - Man! I Feel Like A Woman!",
    "Britney Spears - Oops!...I Did It Again",
    "Kelly Clarkson - Stronger (What Doesn't Kill You)",
    "Madonna - Material Girl",
    "Kylie Minogue - Can't Get You Out Of My Head",
    "Leona Lewis - Bleeding Love",
    "P!nk - Raise Your Glass",
    "Avril Lavigne - Complicated",
    "Adele - Rolling in the Deep",
    "Dua Lipa - Levitating",
    "Olivia Rodrigo - good 4 u",
    "Sabrina Carpenter - Espresso",
    "Chappell Roan - HOT TO GO!",
    "Charli xcx - Apple",
    "Billie Eilish - bad guy",
    "Lizzo - Juice",
    "Carly Rae Jepsen - I Really Like You",
    "Taylor Swift - Cruel Summer",
    "Katy Perry - Roar",
    "Sia - Cheap Thrills",
    "Camila Cabello - Havana (feat. Young Thug)",
    "Alessia Cara - Scars To Your Beautiful",
    "Hailee Steinfeld - Love Myself",
    "DNCE - Cake By The Ocean",
    "Shawn Mendes - Treat You Better",
    "Charlie Puth - Attention",
    "Maroon 5 - Sugar",
    "OneRepublic - Counting Stars",
    "Jason Derulo - Want to Want Me",
    "Clean Bandit - Rather Be (feat. Jess Glynne)",
    "Zedd - Clarity (feat. Foxes)",
    "Calvin Harris - Summer",
    "Avicii - Wake Me Up",
    "Swedish House Mafia - Don't You Worry Child"
  ],
  "pop": [
    "Taylor Swift - Cruel Summer",
    "Dua Lipa - Levitating",
    "The Weeknd - Blinding Lights",
    "Harry Styles - As It Was",
    "Olivia Rodrigo - vampire",
    "Billie Eilish - bad guy",
    "Ed Sheeran - Shape of You",
    "Ariana Grande - 7 rings",
    "Bruno Mars - 24K Magic",
    "Katy Perry - Roar",
    "Lady Gaga - Shallow",
    "Shawn Mendes - Señorita",
    "Post Malone - Circles",
    "Justin Bieber - Peaches",
    "Miley Cyrus - Flowers",
    "Doja Cat - Say So",
    "Lizzo - About Damn Time",
    "Sam Smith - Unholy",
    "Selena Gomez - Lose You to Love Me",
    "Sia - Chandelier",
    "Sabrina Carpenter - Please Please Please",
    "Chappell Roan - Good Luck, Babe!",
    "Billie Eilish - BIRDS OF A FEATHER",
    "Charli xcx - 360",
    "Lady Gaga & Bruno Mars - Die With A Smile"
  ],
  "rock": [
    "Queen - Bohemian Rhapsody",
    "Nirvana - Smells Like Teen Spirit",
    "AC/DC - Back In Black",
    "Guns N' Roses - Sweet Child O' Mine",
    "Led Zeppelin - Stairway to Heaven",
    "The Rolling Stones - Paint It, Black",
    "Pink Floyd - Comfortably Numb",
    "The Eagles - Hotel California",
    "Bon Jovi - Livin' On A Prayer",
    "Aerosmith - Dream On",
    "Linkin Park - In the End",
    "Red Hot Chili Peppers - Californication",
    "Foo Fighters - Everlong",
    "Green Day - Boulevard of Broken Dreams",
    "Radiohead - Creep",
    "The Killers - When You Were Young",
    "Arctic Monkeys - Do I Wanna Know?",
    "Fleetwood Mac - Dreams",
    "The White Stripes - Seven Nation Army",
    "Oasis - Wonderwall"
  ],
  "hiphop": [
    "Eminem - Lose Yourself",
    "Drake - God's Plan",
    "Kendrick Lamar - HUMBLE.",
    "Travis Scott - SICKO MODE",
    "Post Malone - rockstar",
    "Cardi B - Bodak Yellow",
    "Juice WRLD - Lucid Dreams",
    "XXXTENTACION - SAD!",
    "J. Cole - No Role Modelz",
    "50 Cent - In Da Club",
    "Dr. Dre - Still D.R.E.",
    "Snoop Dogg - Drop It Like It's Hot",
    "Kanye West - Stronger",
    "Jay-Z - Empire State of Mind",
    "Lil Nas X - Old Town Road",
    "Roddy Ricch - The Box",
    "Future - Mask Off",
    "Kendrick Lamar - Not Like Us",
    "Jack Harlow - Lovin On Me",
    "Tommy Richman - MILLION DOLLAR BABY"
  ],
  "electronic": [
    "Daft Punk - One More Time",
    "Avicii - Levels",
    "Calvin Harris - Summer",
    "David Guetta - Titanium",
    "The Chainsmokers - Closer",
    "Marshmello - Happier",
    "Zedd - Clarity",
    "Swedish House Mafia - Don't You Worry Child",
    "Martin Garrix - Animals",
    "Skrillex - Bangarang",
    "Major Lazer - Lean On",
    "Kygo - Firestone",
    "DJ Snake - Turn Down for What",
    "Tiësto - The Business",
    "Fisher - Losing It",
    "Peggy Gou - (It Goes Like) Nanana",
    "Fred again.. - adore u",
    "Disclosure - Latch",
    "Deadmau5 - Ghosts 'n' Stuff",
    "Fatboy Slim - Praise You"
  ],
  "80s": [
    "Michael Jackson - Billie Jean",
    "A-ha - Take On Me",
    "Whitney Houston - I Wanna Dance with Somebody",
    "Cyndi Lauper - Girls Just Want to Have Fun",
    "Bon Jovi - Livin' on a Prayer",
    "Toto - Africa",
    "Journey - Don't Stop Believin'",
    "Eurythmics - Sweet Dreams (Are Made of This)",
    "Wham! - Wake Me Up Before You Go-Go",
    "Rick Astley - Never Gonna Give You Up",
    "Queen - Another One Bites the Dust",
    "The Police - Every Breath You Take",
    "Earth, Wind & Fire - Let's Groove",
    "Madonna - Like a Virgin",
    "George Michael - Careless Whisper"
  ],
  "90s": [
    "Nirvana - Smells Like Teen Spirit",
    "Oasis - Wonderwall",
    "Britney Spears - ...Baby One More Time",
    "Backstreet Boys - I Want It That Way",
    "TLC - No Scrubs",
    "No Doubt - Don't Speak",
    "Red Hot Chili Peppers - Under the Bridge",
    "The Cranberries - Zombie",
    "Radiohead - Creep",
    "Green Day - Basket Case",
    "Coolio - Gangsta's Paradise",
    "Smash Mouth - All Star",
    "blink-182 - All the Small Things",
    "Alanis Morissette - Ironic",
    "Spice Girls - Wannabe",
    "Natalie Imbruglia - Torn",
    "Goo Goo Dolls - Iris",
    "The Verve - Bitter Sweet Symphony",
    "Third Eye Blind - Semi-Charmed Life",
    "Fugees - Killing Me Softly With His Song",
    "Eagle-Eye Cherry - Save Tonight",
    "Cher - Believe",
    "Weezer - Say It Ain't So",
    "Aqua - Barbie Girl",
    "Sixpence None the Richer - Kiss Me",
    "Chumbawamba - Tubthumping",
    "Santana & Rob Thomas - Smooth",
    "Sublime - Santeria",
    "TLC - Waterfalls",
    "Blind Melon - No Rain"
  ],
  "2000s": [
    "The Killers - Mr. Brightside",
    "Outkast - Hey Ya!",
    "Eminem - Lose Yourself",
    "Beyoncé & JAY-Z - Crazy In Love",
    "Linkin Park - In the End",
    "Coldplay - Viva La Vida",
    "Avril Lavigne - Complicated",
    "The Black Eyed Peas - I Gotta Feeling",
    "Lady Gaga - Poker Face",
    "Rihanna & JAY-Z - Umbrella",
    "Usher - Yeah! (feat. Lil Jon & Ludacris)",
    "Maroon 5 - This Love",
    "Kelly Clarkson - Since U Been Gone",
    "Green Day - Boulevard of Broken Dreams",
    "Evanescence - Bring Me To Life",
    "Britney Spears - Toxic",
    "Fall Out Boy - Sugar, We're Goin Down",
    "Gwen Stefani - Hollaback Girl",
    "Franz Ferdinand - Take Me Out",
    "Katy Perry - I Kissed a Girl",
    "Gorillaz - Feel Good Inc.",
    "Justin Timberlake - SexyBack",
    "Cascada - Everytime We Touch",
    "Nelly Furtado & Timbaland - Promiscuous",
    "Kanye West - Stronger",
    "Coldplay - The Scientist",
    "The All-American Rejects - Dirty Little Secret",
    "Alicia Keys - No One",
    "Avril Lavigne - Sk8er Boi",
    "Kings of Leon - Use Somebody"
  ],
  "custom": [],
  "spotify": [],
  "apple-music": []
};

const CUSTOM_PRESETS = {
  tth: {
    title: "Today's Top Hits",
    tracks: [
      "Sabrina Carpenter - Espresso",
      "Chappell Roan - Good Luck, Babe!",
      "Billie Eilish - BIRDS OF A FEATHER",
      "Post Malone & Morgan Wallen - I Had Some Help",
      "Shaboozey - A Bar Song (Tipsy)",
      "Kendrick Lamar - Not Like Us",
      "Tommy Richman - MILLION DOLLAR BABY",
      "Taylor Swift - Cruel Summer",
      "Dua Lipa - Houdini",
      "Ariana Grande - we can't be friends",
      "Teddy Swims - Lose Control",
      "Benson Boone - Beautiful Things",
      "Hozier - Too Sweet",
      "Charli xcx - 360",
      "Charli xcx - Apple",
      "Sabrina Carpenter - Please Please Please",
      "Chappell Roan - HOT TO GO!",
      "Chappell Roan - Pink Pony Club",
      "Billie Eilish - LUNCH",
      "Billie Eilish - CHIHIRO",
      "Billie Eilish - WILDFLOWER",
      "Lady Gaga & Bruno Mars - Die With A Smile",
      "Gracie Abrams - I Love You, I'm Sorry",
      "Olivia Rodrigo - vampire",
      "Dua Lipa - Illusion"
    ]
  },
  billie: {
    title: "Billie Eilish - HIT ME HARD AND SOFT",
    tracks: [
      "Billie Eilish - SKINNY",
      "Billie Eilish - LUNCH",
      "Billie Eilish - CHIHIRO",
      "Billie Eilish - BIRDS OF A FEATHER",
      "Billie Eilish - WILDFLOWER",
      "Billie Eilish - THE GREATEST",
      "Billie Eilish - L’AMOUR DE MA VIE",
      "Billie Eilish - THE DINER",
      "Billie Eilish - BITTERSUITE",
      "Billie Eilish - BLUE"
    ]
  },
  taylor: {
    title: "Taylor Swift - 1989 (Taylor's Version)",
    tracks: [
      "Taylor Swift - Welcome To New York (Taylor's Version)",
      "Taylor Swift - Blank Space (Taylor's Version)",
      "Taylor Swift - Style (Taylor's Version)",
      "Taylor Swift - Out Of The Woods (Taylor's Version)",
      "Taylor Swift - All You Had To Do Was Stay (Taylor's Version)",
      "Taylor Swift - Shake It Off (Taylor's Version)",
      "Taylor Swift - I Wish You Would (Taylor's Version)",
      "Taylor Swift - Bad Blood (Taylor's Version)",
      "Taylor Swift - Wildest Dreams (Taylor's Version)",
      "Taylor Swift - How You Get The Girl (Taylor's Version)",
      "Taylor Swift - This Love (Taylor's Version)",
      "Taylor Swift - I Know Places (Taylor's Version)",
      "Taylor Swift - Clean (Taylor's Version)",
      "Taylor Swift - Wonderland (Taylor's Version)",
      "Taylor Swift - You Are In Love (Taylor's Version)",
      "Taylor Swift - New Romantics (Taylor's Version)"
    ]
  },
  chappell: {
    title: "Chappell Roan - Midwest Princess",
    tracks: [
      "Chappell Roan - Femininomenon",
      "Chappell Roan - Red Wine Supernova",
      "Chappell Roan - After Midnight",
      "Chappell Roan - Coffee",
      "Chappell Roan - Casual",
      "Chappell Roan - Super Graphic Ultra Modern Girl",
      "Chappell Roan - HOT TO GO!",
      "Chappell Roan - My Kink Is Karma",
      "Chappell Roan - Picture You",
      "Chappell Roan - Pink Pony Club",
      "Chappell Roan - Good Luck, Babe!"
    ]
  },
  sabrina: {
    title: "Sabrina Carpenter - Short n' Sweet",
    tracks: [
      "Sabrina Carpenter - Taste",
      "Sabrina Carpenter - Please Please Please",
      "Sabrina Carpenter - Good Graces",
      "Sabrina Carpenter - Sharpest Tool",
      "Sabrina Carpenter - Coincidence",
      "Sabrina Carpenter - Bed Chem",
      "Sabrina Carpenter - Espresso",
      "Sabrina Carpenter - Dumb & Poetic",
      "Sabrina Carpenter - Juno",
      "Sabrina Carpenter - Lie to Girls"
    ]
  },
  charli: {
    title: "Charli xcx - BRAT",
    tracks: [
      "Charli xcx - 360",
      "Charli xcx - Club classics",
      "Charli xcx - Sympathy is a knife",
      "Charli xcx - Talk talk",
      "Charli xcx - Von dutch",
      "Charli xcx - Everything is romantic",
      "Charli xcx - Apple",
      "Charli xcx - B2b",
      "Charli xcx - 365"
    ]
  },
  weeknd: {
    title: "The Weeknd - After Hours",
    tracks: [
      "The Weeknd - Alone Again",
      "The Weeknd - Too Late",
      "The Weeknd - Hardest To Love",
      "The Weeknd - Scared To Live",
      "The Weeknd - Snowchild",
      "The Weeknd - Escape From LA",
      "The Weeknd - Heartless",
      "The Weeknd - Faith",
      "The Weeknd - Blinding Lights",
      "The Weeknd - In Your Eyes",
      "The Weeknd - Save Your Tears",
      "The Weeknd - After Hours"
    ]
  },
  oasis: {
    title: "Oasis - (What's the Story) Morning Glory?",
    tracks: [
      "Oasis - Hello",
      "Oasis - Roll With It",
      "Oasis - Wonderwall",
      "Oasis - Don't Look Back In Anger",
      "Oasis - Hey Now!",
      "Oasis - Some Might Say",
      "Oasis - Cast No Shadow",
      "Oasis - She's Electric",
      "Oasis - Morning Glory",
      "Oasis - Champagne Supernova"
    ]
  }
};

const APPLE_PRESETS = {
  today_hits: {
    title: "Today's Hits (Apple Music)",
    tracks: [
      "Sabrina Carpenter - Espresso",
      "Chappell Roan - Good Luck, Babe!",
      "Billie Eilish - BIRDS OF A FEATHER",
      "Lady Gaga & Bruno Mars - Die With A Smile",
      "Post Malone & Morgan Wallen - I Had Some Help",
      "Shaboozey - A Bar Song (Tipsy)",
      "Kendrick Lamar - Not Like Us",
      "Tommy Richman - MILLION DOLLAR BABY",
      "Taylor Swift - Cruel Summer",
      "Dua Lipa - Houdini",
      "Ariana Grande - we can't be friends",
      "Teddy Swims - Lose Control",
      "Benson Boone - Beautiful Things",
      "Hozier - Too Sweet",
      "Charli xcx - 360",
      "Charli xcx - Apple",
      "Sabrina Carpenter - Please Please Please",
      "Chappell Roan - HOT TO GO!",
      "Billie Eilish - LUNCH",
      "Gracie Abrams - I Love You, I'm Sorry"
    ]
  },
  alist_pop: {
    title: "A-List Pop (Apple Music)",
    tracks: [
      "Dua Lipa - Levitating",
      "Taylor Swift - Blank Space (Taylor's Version)",
      "Harry Styles - As It Was",
      "Olivia Rodrigo - vampire",
      "Billie Eilish - bad guy",
      "The Weeknd - Blinding Lights",
      "Ariana Grande - thank u, next",
      "Katy Perry - Teenage Dream",
      "Lady Gaga - Bad Romance",
      "Britney Spears - Toxic",
      "Miley Cyrus - Flowers",
      "Bruno Mars - 24K Magic",
      "Ed Sheeran - Shape of You",
      "Justin Bieber - Peaches",
      "Selena Gomez - Lose You to Love Me"
    ]
  },
  rap_life: {
    title: "Rap Life (Apple Music)",
    tracks: [
      "Kendrick Lamar - Not Like Us",
      "Kendrick Lamar - HUMBLE.",
      "Drake - God's Plan",
      "Travis Scott - SICKO MODE",
      "Eminem - Houdini",
      "Eminem - Lose Yourself",
      "Future & Metro Boomin - Like That",
      "Gunna - fukumean",
      "Lil Baby - Drip Too Hard",
      "21 Savage - redrum",
      "J. Cole - No Role Modelz",
      "Jack Harlow - Lovin On Me",
      "50 Cent - In da Club",
      "Kanye West - Stronger"
    ]
  },
  dance_xl: {
    title: "Dance XL (Apple Music)",
    tracks: [
      "Calvin Harris & Dua Lipa - One Kiss",
      "Daft Punk - One More Time",
      "Avicii - Wake Me Up",
      "Avicii - Levels",
      "David Guetta & Bebe Rexha - I'm Good (Blue)",
      "The Chainsmokers - Closer",
      "Calvin Harris - Summer",
      "Tiësto - The Business",
      "Swedish House Mafia - Don't You Worry Child",
      "Peggy Gou - (It Goes Like) Nanana",
      "Fred again.. & Baby Keem - leavemealone",
      "Fisher - Losing It"
    ]
  },
  taylor_essentials: {
    title: "Taylor Swift: Essentials (Apple Music)",
    tracks: [
      "Taylor Swift - Cruel Summer",
      "Taylor Swift - Blank Space (Taylor's Version)",
      "Taylor Swift - Style (Taylor's Version)",
      "Taylor Swift - Shake It Off (Taylor's Version)",
      "Taylor Swift - Love Story (Taylor’s Version)",
      "Taylor Swift - You Belong With Me (Taylor’s Version)",
      "Taylor Swift - Anti-Hero",
      "Taylor Swift - Karma",
      "Taylor Swift - cardigan",
      "Taylor Swift - Lover",
      "Taylor Swift - All Too Well (10 Minute Version)",
      "Taylor Swift - Wildest Dreams (Taylor's Version)",
      "Taylor Swift - I Knew You Were Trouble",
      "Taylor Swift - 22"
    ]
  },
  billie_essentials: {
    title: "Billie Eilish: Essentials (Apple Music)",
    tracks: [
      "Billie Eilish - BIRDS OF A FEATHER",
      "Billie Eilish - LUNCH",
      "Billie Eilish - CHIHIRO",
      "Billie Eilish - WILDFLOWER",
      "Billie Eilish - bad guy",
      "Billie Eilish - ocean eyes",
      "Billie Eilish - when the party's over",
      "Billie Eilish - everything i wanted",
      "Billie Eilish - lovely",
      "Billie Eilish - What Was I Made For?",
      "Billie Eilish - idontwannabeyouanymore",
      "Billie Eilish - bury a friend"
    ]
  },
  weeknd_essentials: {
    title: "The Weeknd: Essentials (Apple Music)",
    tracks: [
      "The Weeknd - Blinding Lights",
      "The Weeknd - Starboy",
      "The Weeknd - The Hills",
      "The Weeknd - Can't Feel My Face",
      "The Weeknd - Save Your Tears",
      "The Weeknd - Die For You",
      "The Weeknd - I Feel It Coming",
      "The Weeknd - Call Out My Name",
      "The Weeknd - Heartless",
      "The Weeknd - After Hours",
      "The Weeknd - Out of Time",
      "The Weeknd - In Your Eyes"
    ]
  },
  kendrick_essentials: {
    title: "Kendrick Lamar: Essentials (Apple Music)",
    tracks: [
      "Kendrick Lamar - Not Like Us",
      "Kendrick Lamar - HUMBLE.",
      "Kendrick Lamar - DNA.",
      "Kendrick Lamar - Alright",
      "Kendrick Lamar - Swimming Pools (Drank)",
      "Kendrick Lamar - Money Trees",
      "Kendrick Lamar - LOVE. (feat. Zacari)",
      "Kendrick Lamar - King Kunta",
      "Kendrick Lamar - Poetic Justice",
      "Kendrick Lamar - Bitch, Don't Kill My Vibe"
    ]
  }
};
