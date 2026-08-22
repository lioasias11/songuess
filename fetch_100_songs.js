// fetch_100_songs.js - Robust, fast fetcher using top artist catalogs (100 songs per genre)

const fs = require('fs');
const https = require('https');

const GENRE_ARTISTS = {
  'white-girl-music': [
    'Taylor Swift', 'Britney Spears', 'Katy Perry', 'Miley Cyrus',
    'Avril Lavigne', 'Kesha', 'Carly Rae Jepsen', 'Gwen Stefani',
    'Kelly Clarkson', 'Fergie', 'Natasha Bedingfield', 'Hilary Duff',
    'Sabrina Carpenter', 'Chappell Roan', 'Charli XCX', 'Olivia Rodrigo'
  ],

  'pop': [
    'The Weeknd', 'Dua Lipa', 'Harry Styles', 'Billie Eilish',
    'Bruno Mars', 'Ed Sheeran', 'Ariana Grande', 'Justin Bieber',
    'Maroon 5', 'Adele', 'Post Malone', 'Lady Gaga',
    'Rihanna', 'Coldplay', 'Imagine Dragons', 'Doja Cat'
  ],

  'rock': [
    'Queen', 'Nirvana', 'AC/DC', 'Guns N Roses',
    'Linkin Park', 'The Killers', 'Red Hot Chili Peppers', 'Green Day',
    'Foo Fighters', 'Blink-182', 'Bon Jovi', 'Aerosmith',
    'Arctic Monkeys', 'The Rolling Stones', 'Metallica', 'Fall Out Boy'
  ],

  'hiphop': [
    'Eminem', '50 Cent', 'Outkast', 'Kanye West',
    'Dr. Dre', 'Snoop Dogg', 'Jay-Z', 'Drake',
    'Kendrick Lamar', 'J. Cole', '2Pac', 'The Notorious B.I.G.',
    'Travis Scott', 'Lil Wayne', 'Nelly', 'Cardi B'
  ],

  'electronic': [
    'Daft Punk', 'Avicii', 'Calvin Harris', 'The Chainsmokers',
    'David Guetta', 'Marshmello', 'Tiesto', 'Martin Garrix',
    'Swedish House Mafia', 'Skrillex', 'Zedd', 'Kygo',
    'Deadmau5', 'Major Lazer', 'Disclosure', 'Alan Walker'
  ],

  '80s': [
    'Michael Jackson', 'a-ha', 'Eurythmics', 'Cyndi Lauper',
    'Whitney Houston', 'Madonna', 'Wham!', 'Prince',
    'Rick Astley', 'Toto', 'Tears for Fears', 'Duran Duran',
    'Journey', 'The Police', 'Phil Collins', 'George Michael'
  ],

  '90s': [
    'Backstreet Boys', 'Spice Girls', 'TLC', 'Destiny\'s Child',
    '*NSYNC', 'No Doubt', 'Aqua', 'Smash Mouth',
    'Savage Garden', 'Goo Goo Dolls', 'Cher', 'Vengaboys',
    'Eiffel 65', 'Ace of Base', 'The Cranberries', 'Alanis Morissette'
  ],

  '2000s': [
    'Beyonce', 'Usher', 'Justin Timberlake', 'Black Eyed Peas',
    'Nelly Furtado', 'Alicia Keys', 'Akon', 'Ne-Yo',
    'Sean Paul', 'Pitbull', 'Timbaland', 'Flo Rida',
    'Pink', 'Shakira', 'Cascada', 'Taio Cruz'
  ]
};

function queryItunes(term) {
  return new Promise((resolve) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=25&media=music`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.error('Error fetching:', term, e.message);
      resolve([]);
    });
  });
}

function cleanTitle(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Fetching exactly 100 verified songs for each category...\n');
  const allSongs = [];

  for (const [genre, artists] of Object.entries(GENRE_ARTISTS)) {
    console.log(`\n=== Category: ${genre} ===`);
    const categorySongs = [];
    const seenInGenre = new Set();

    for (const artist of artists) {
      if (categorySongs.length >= 100) break;

      const results = await queryItunes(artist);
      for (const item of results) {
        if (!item.previewUrl || !item.trackName || !item.artistName) continue;
        
        // Skip karaoke, tribute, or generic covers
        const lowerTrack = item.trackName.toLowerCase();
        const lowerArtist = item.artistName.toLowerCase();
        if (lowerTrack.includes('tribute') || lowerTrack.includes('karaoke') || lowerArtist.includes('tribute') || lowerArtist.includes('karaoke')) {
          continue;
        }

        const key = cleanTitle(item.trackName) + '::' + cleanTitle(item.artistName);
        if (seenInGenre.has(key)) continue;
        seenInGenre.add(key);

        const songObj = {
          genre: genre,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || '',
          artwork: (item.artworkUrl100 || item.artworkUrl60 || '').replace('100x100bb', '600x600bb'),
          previewUrl: item.previewUrl,
          link: item.trackViewUrl || item.collectionViewUrl || '#'
        };

        categorySongs.push(songObj);
        if (categorySongs.length >= 100) break;
      }

      console.log(`- ${artist}: Total in category now ${categorySongs.length}/100`);
      // Gentle pause to avoid rate limiting
      await new Promise(r => setTimeout(r, 220));
    }

    console.log(`Finished ${genre}: ${categorySongs.length} songs.`);
    allSongs.push(...categorySongs);
  }

  console.log(`\n========================================`);
  console.log(`TOTAL SONGS COMPILED: ${allSongs.length}`);
  console.log(`========================================\n`);

  fs.writeFileSync('clean_previews.json', JSON.stringify(allSongs, null, 2));
  console.log('Saved to clean_previews.json successfully!');
}

run();
