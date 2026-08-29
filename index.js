// index.js - Clean, Minimalist Spotify-Style Heardle Engine (Direct Game View)

const DURATIONS = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0];
const MAX_ATTEMPTS = 6;
const SCORE_TIERS = [1000, 800, 600, 400, 200, 100];

// ==========================================
// SONG COLLECTIONS (Easy to edit & add songs)
// ==========================================
const GENRE_SONGS = {
  "white-girl-music": [
    "Natasha Bedingfield - Unwritten",
    "Carly Rae Jepsen - Call Me Maybe",
    "Vanessa Carlton - A Thousand Miles",
    "Miley Cyrus - Party In the U.S.A.",
    "Taylor Swift - Cruel Summer",
    "Taylor Swift - Blank Space (Taylor's Version)",
    "Taylor Swift - Shake It Off",
    "Taylor Swift - Love Story (Taylor’s Version)",
    "Taylor Swift - You Belong With Me (Taylor’s Version)",
    "Taylor Swift - I Knew You Were Trouble",
    "Taylor Swift - 22",
    "Taylor Swift - We Are Never Ever Getting Back Together",
    "Taylor Swift - Style (Taylor's Version)",
    "Katy Perry - California Gurls (feat. Snoop Dogg)",
    "Katy Perry - Teenage Dream",
    "Katy Perry - Firework",
    "Katy Perry - Last Friday Night (T.G.I.F.)",
    "Katy Perry - Hot n Cold",
    "Katy Perry - I Kissed a Girl",
    "Katy Perry - Roar",
    "Katy Perry - Dark Horse (feat. Juicy J)",
    "Katy Perry - The One That Got Away",
    "Britney Spears - Toxic",
    "Britney Spears - ...Baby One More Time",
    "Britney Spears - Oops!…I Did It Again",
    "Britney Spears - Womanizer",
    "Britney Spears - Gimme More (Remastered)",
    "Britney Spears - Circus",
    "Kesha - TiK ToK",
    "Kesha - Die Young",
    "Kesha - Your Love Is My Drug",
    "Kesha - Blow",
    "Pitbull & Kesha - Timber",
    "Lady Gaga - Bad Romance",
    "Lady Gaga - Poker Face",
    "Lady Gaga - Just Dance (feat. Colby O'Donis)",
    "Lady Gaga - Paparazzi",
    "Lady Gaga - Born This Way",
    "Lady Gaga - Telephone (feat. Beyoncé)",
    "Miley Cyrus - Flowers",
    "Miley Cyrus - Wrecking Ball",
    "Miley Cyrus - The Climb",
    "Miley Cyrus - 7 Things",
    "Avril Lavigne - Girlfriend (Radio Edit)",
    "Avril Lavigne - Complicated",
    "Avril Lavigne - Sk8er Boi",
    "Avril Lavigne - What the Hell",
    "Avril Lavigne - I'm with You",
    "Gwen Stefani - Hollaback Girl",
    "Gwen Stefani - The Sweet Escape (feat. Akon)",
    "Gwen Stefani - Rich Girl (feat. Eve) [Remastered 2019]",
    "Kelly Clarkson - Since U Been Gone",
    "Kelly Clarkson - Stronger (What Doesn't Kill You)",
    "Kelly Clarkson - Behind These Hazel Eyes",
    "Kelly Clarkson - Because of You",
    "Fergie - Big Girls Don't Cry (Personal)",
    "Fergie - Glamorous (feat. Ludacris)",
    "Fergie - Fergalicious (feat. will.i.am)",
    "Fergie - Clumsy",
    "Cascada - Everytime We Touch",
    "Cascada - Evacuate the Dancefloor",
    "Nelly Furtado - Promiscuous (feat. Timbaland)",
    "Nelly Furtado - Maneater",
    "Nelly Furtado - Say It Right",
    "Nelly Furtado - I'm Like a Bird",
    "Natasha Bedingfield - Pocketful of Sunshine",
    "Icona Pop - I Love It (feat. Charli XCX) [I Don’t Care 2022 Re-Edit]",
    "Charli xcx - Boom Clap",
    "Charli xcx - 360",
    "Charli xcx - Apple",
    "Iggy Azalea - Fancy (feat. Charli XCX)",
    "Sabrina Carpenter - Espresso (On Vacation Version)",
    "Sabrina Carpenter & Dolly Parton - Please Please Please",
    "Sabrina Carpenter - Feather",
    "Sabrina Carpenter - Nonsense",
    "Chappell Roan - Good Luck, Babe!",
    "Chappell Roan - HOT TO GO!",
    "Chappell Roan - Pink Pony Club",
    "Chappell Roan - Red Wine Supernova",
    "Olivia Rodrigo - good 4 u",
    "Olivia Rodrigo - drivers license",
    "Olivia Rodrigo - vampire",
    "Olivia Rodrigo - deja vu",
    "Dua Lipa - Levitating",
    "Dua Lipa - Don't Start Now",
    "Dua Lipa - New Rules",
    "Dua Lipa - Dance The Night",
    "Ariana Grande - 7 rings",
    "Ariana Grande - thank u, next",
    "Ariana Grande - Side To Side (feat. Nicki Minaj)",
    "Ariana Grande - Problem (feat. Iggy Azalea)",
    "Ariana Grande - Break Free (feat. Zedd)",
    "Nicki Minaj - Starships",
    "Nicki Minaj - Super Bass",
    "Jessie J, Ariana Grande & Nicki Minaj - Bang Bang",
    "Meghan Trainor - All About That Bass",
    "Meghan Trainor - Made You Look",
    "Ellie Goulding - Lights",
    "Ellie Goulding - Love Me Like You Do (From \"Fifty Shades of Grey\")",
    "The Killers - Mr. Brightside"
  ],
  "pop": [
    "The Weeknd - Call Out My Name",
    "The Weeknd - Blinding Lights",
    "The Weeknd - Die For You",
    "The Weeknd, JENNIE & Lily Rose Depp - One Of The Girls",
    "The Weeknd - I Feel It Coming (feat. Daft Punk)",
    "The Weeknd - Coming Down",
    "The Weeknd - What You Need",
    "The Weeknd & Gesaffelstein - I Was Never There",
    "The Weeknd - Can't Feel My Face",
    "The Weeknd & Ariana Grande - Save Your Tears (Remix)",
    "The Weeknd - The Birds Pt. 1",
    "Swedish House Mafia & The Weeknd - Moth To A Flame",
    "Ariana Grande & The Weeknd - Love Me Harder",
    "The Weeknd - Try Me",
    "The Weeknd - Stargirl Interlude (feat. Lana Del Rey)",
    "The Weeknd - Earned It",
    "Lana Del Rey - Lust for Life (feat. The Weeknd)",
    "The Weeknd - Secrets",
    "The Weeknd - After Hours",
    "The Weeknd - High For This",
    "The Weeknd - Valerie",
    "The Weeknd - A Lonely Night",
    "The Weeknd - Out of Time",
    "The Weeknd & Ariana Grande - Die For You (Remix)",
    "Dua Lipa - Levitating",
    "Dua Lipa - New Rules",
    "Dua Lipa - Dance The Night",
    "Dua Lipa - Don't Start Now",
    "Dua Lipa - Houdini",
    "Calvin Harris, Dua Lipa - One Kiss",
    "Elton John & Dua Lipa - Cold Heart (PNAU Remix)",
    "Dua Lipa - Break My Heart",
    "Dua Lipa - Love Again",
    "Dua Lipa - Levitating (feat. DaBaby)",
    "Dua Lipa - Training Season",
    "Dua Lipa - Physical",
    "Dua Lipa - We're Good",
    "Silk City, Dua Lipa - Electricity (feat. Diplo & Mark Ronson)",
    "Dua Lipa - Illusion",
    "J Balvin, Dua Lipa, Bad Bunny & Tainy - UN DIA (ONE DAY)",
    "Jack Harlow - Dua Lipa",
    "Martin Garrix & Dua Lipa - Scared to Be Lonely",
    "Sean Paul - No Lie (feat. Dua Lipa)",
    "Dua Lipa - Be the One",
    "Dua Lipa - Hallucinate",
    "Miley Cyrus - Prisoner (feat. Dua Lipa)",
    "Harry Styles - Sign of the Times",
    "Harry Styles - As It Was",
    "Harry Styles - American Girls",
    "Harry Styles - Watermelon Sugar",
    "Harry Styles - Adore You",
    "Harry Styles - Aperture",
    "Harry Styles - Golden",
    "Harry Styles - Falling",
    "Harry Styles - Satellite",
    "Harry Styles - Matilda",
    "Harry Styles - Late Night Talking",
    "Harry Styles - Music For a Sushi Restaurant",
    "Harry Styles - Daylight",
    "Harry Styles - Sweet Creature",
    "Harry Styles - Daydreaming",
    "Malcolm Todd - Harry Styles",
    "Harry Styles - Coming Up Roses",
    "Harry Styles - Kiwi",
    "Harry Styles - Fine Line",
    "Harry Styles - Two Ghosts",
    "Harry Styles - Lights Up",
    "Harry Styles - Cherry",
    "Harry Styles - She",
    "Harry Styles - Love Of My Life",
    "Billie Eilish - WILDFLOWER",
    "Billie Eilish - BIRDS OF A FEATHER",
    "Billie Eilish - ocean eyes",
    "Billie Eilish & Khalid - lovely",
    "Billie Eilish - bad guy",
    "Billie Eilish - What Was I Made For? (From The Motion Picture \"Barbie\")",
    "Billie Eilish - when the party's over",
    "Billie Eilish - CHIHIRO",
    "Billie Eilish - everything i wanted",
    "Billie Eilish - idontwannabeyouanymore",
    "Billie Eilish - i love you",
    "Billie Eilish - TV",
    "Billie Eilish - you should see me in a crown",
    "Armani White - BILLIE EILISH.",
    "Billie Eilish - The 30th",
    "Billie Eilish - bellyache",
    "Billie Eilish - bury a friend",
    "Billie Eilish - L’AMOUR DE MA VIE",
    "Billie Eilish - COPYCAT",
    "Billie Eilish - hostage",
    "Billie Eilish - my boy",
    "Billie Eilish - THE GREATEST",
    "Billie Eilish - all the good girls go to hell",
    "Billie Eilish - LUNCH",
    "Billie Eilish - listen before i go",
    "Bruno Mars - Risk It All",
    "Bruno Mars - Just the Way You Are",
    "Lady Gaga & Bruno Mars - Die With A Smile",
    "Bruno Mars - I Just Might",
    "Bruno Mars - 24K Magic"
  ],
  "rock": [
    "Guns N' Roses - Sweet Child O' Mine",
    "Guns N' Roses - November Rain",
    "Guns N' Roses - Knockin' On Heaven's Door",
    "Guns N' Roses - Welcome To The Jungle",
    "Guns N' Roses - Paradise City",
    "Guns N' Roses - Patience",
    "Guns N' Roses - Don't Cry",
    "Guns N' Roses - Used to Love Her",
    "Guns N' Roses - Live and Let Die",
    "Guns N' Roses - Civil War",
    "Guns N' Roses - Nothin'",
    "Jay Sean - Guns N Roses",
    "Guns N' Roses - Rocket Queen",
    "Guns N' Roses - You Could Be Mine",
    "Guns N' Roses - Estranged",
    "Guns N' Roses - Nightrain",
    "Guns N' Roses - Hard Skool",
    "Bhalwaan & Signature by SB - Guns N' Roses",
    "Guns N' Roses - Atlas",
    "Guns N' Roses - You Could Be Mine (2022 Remaster)",
    "Guns N' Roses - My Michelle",
    "The Killers - Mr. Brightside",
    "The Killers - Somebody Told Me",
    "The Killers - When You Were Young",
    "The Killers - All These Things That I've Done",
    "The Killers - Human",
    "The Killers - Read My Mind",
    "The Killers - Smile Like You Mean It",
    "The Killers - Jenny Was a Friend of Mine",
    "The Killers - Spaceman",
    "The Killers - The Man",
    "The Killers - Runaways",
    "The Killers - Change Your Mind",
    "The Killers - Miss Atomic Bomb",
    "The Killers - Run for Cover",
    "The Killers - Caution",
    "Aitana - The Killers",
    "The Killers - Shot At the Night",
    "The Killers - Here With Me",
    "The Killers - For Reasons Unknown",
    "The Killers - My Own Soul's Warning",
    "Piano Covers - The Killers - When You Were Young - Piano Cover",
    "The Killers - The Man (Duke Dumont Remix)",
    "Red Hot Chili Peppers - Scar Tissue",
    "Red Hot Chili Peppers - Under the Bridge",
    "Red Hot Chili Peppers - Can't Stop",
    "Red Hot Chili Peppers - Californication",
    "Red Hot Chili Peppers - Otherside",
    "Red Hot Chili Peppers - Snow (Hey Oh)",
    "Red Hot Chili Peppers - Soul to Squeeze",
    "Red Hot Chili Peppers - Dani California",
    "Red Hot Chili Peppers - By the Way",
    "Red Hot Chili Peppers - Dark Necessities",
    "Red Hot Chili Peppers - Give It Away",
    "Red Hot Chili Peppers - The Zephyr Song",
    "Red Hot Chili Peppers - Subway to Venus (Remastered 2003)",
    "Orli Anrow - Red Hot Chili Peppers",
    "Red Hot Chili Peppers - Otherside (Mixed)",
    "Antonovvi & Erma - Red Hot Chili Peppers",
    "Red Hot Chili Peppers - Under the Bridge (Mixed)",
    "Red Hot Chili Peppers - Higher Ground (Remastered 2003)",
    "Red Hot Chili Peppers - Tell Me Baby",
    "Green Day - Basket Case",
    "Green Day - When I Come Around",
    "Green Day - Wake Me Up When September Ends",
    "Green Day - Holiday",
    "Green Day - 21 Guns",
    "Green Day - Welcome to Paradise",
    "Green Day - She",
    "Green Day - In the End",
    "Green Day - Still Breathing",
    "Green Day - Last Night On Earth",
    "Green Day - Know Your Enemy",
    "Green Day - Green Day",
    "Green Day - Give Me Novacaine",
    "Green Day - Bang Bang",
    "Green Day - Whatsername",
    "Green Day - Waiting",
    "Green Day - Hitchin' a Ride",
    "Green Day - Oh Yeah!",
    "Green Day - Pulling Teeth",
    "Green Day - Dilemma",
    "Green Day - She's a Rebel",
    "blink-182 - All the Small Things",
    "blink-182 - I Miss You",
    "blink-182 - Adam's Song",
    "blink-182 - First Date",
    "blink-182 - ONE MORE TIME",
    "blink-182 - She's Out of Her Mind",
    "blink-182 - Always",
    "blink-182 - Stay Together for the Kids",
    "blink-182 - Bored to Death",
    "Your Broken Hero - Blink-182",
    "Half an Orange - Blink 182",
    "blink-182 - What's My Age Again?",
    "blink-182 - Every Time I Look for You",
    "blink-182 - Aliens Exist",
    "blink-182 - Down",
    "blink-182 - Josie",
    "blink-182 - Darkside"
  ],
  "hiphop": [
    "DJ Khaled - USE THIS GOSPEL (feat. Kanye West & Eminem) [REMIX]",
    "Eminem - Lose Yourself",
    "Eminem - Without Me",
    "Eminem - The Real Slim Shady",
    "Eminem - Rap God",
    "Eminem - Mockingbird",
    "Eminem - Godzilla (feat. Juice WRLD)",
    "Eminem - Houdini",
    "Eminem - The Monster (feat. Rihanna)",
    "Dr. Dre - Forgot About Dre (feat. Eminem)",
    "Joeyy - Eminem",
    "Eminem - 'Till I Collapse (feat. Nate Dogg)",
    "Eminem - Not Afraid",
    "Eminem - Lucky You (feat. Joyner Lucas)",
    "Eminem - Lose Yourself (Soundtrack Version) [Edited Version]",
    "Fat Joe - Lean Back (Remix) [feat. Lil Jon, Eminem, Mase & Remy Martin]",
    "Eminem - Venom (Music from the Motion Picture)",
    "Dr. Dre - I Need a Doctor (feat. Eminem & Skylar Grey)",
    "Eminem - Love the Way You Lie (feat. Rihanna)",
    "Akon featuring Eminem - Smack That (feat. Eminem)",
    "Rihanna - Love the Way You Lie, Pt. II (feat. Eminem)",
    "Eminem - River (feat. Ed Sheeran)",
    "Eminem - '97 Bonnie & Clyde",
    "The Game - Hate It or Love It (feat. 50 Cent)",
    "50 Cent - P.I.M.P.",
    "Jeremih & 50 Cent - Down On Me (feat. 50 Cent)",
    "Jeremih - Down On Me (feat. 50 Cent)",
    "Ciara - Can't Leave 'Em Alone (feat. 50 Cent)",
    "50 Cent - In da Club",
    "Olivia & 50 Cent - Best Friend (Remix)",
    "Wisin & Yandel & 50 Cent - Mujeres In the Club",
    "50 Cent - Best Friend (Remix) [feat. Olivia]",
    "Mary J. Blige - MJB Da MVP (feat. 50 Cent)",
    "50 Cent - 21 Questions (feat. Nate Dogg)",
    "50 Cent - Just a Lil Bit",
    "50 Cent - If I Can't",
    "50 Cent - Disco Inferno",
    "50 Cent - Candy Shop (feat. Olivia)",
    "50 Cent - What Up Gangsta",
    "The Game - How We Do (feat. 50 Cent)",
    "50 Cent - Many Men (Wish Death)",
    "50 Cent - Patiently Waiting (feat. Eminem)",
    "Abraham Mateo, 50 Cent & Austin Mahone - Háblame Bajito",
    "Wisin & Yandel - No Dejemos Que Se Apague (feat. 50 Cent & T-Pain)",
    "50 Cent - I'm the Man (feat. Sonny Digital)",
    "Joe - Ride Wit U (feat. G-Unit)",
    "Unk featuring OutKast & Jim Jones - Walk It Out (Remix) [feat. OutKast & Jim Jones]",
    "Outkast - Behold a Lady",
    "Montanaa - Outkast",
    "P.O.D. - Outkast (Live - Clean)",
    "Outkast - Prototype",
    "Outkast - The Love Below (Intro)",
    "Outkast - Ms. Jackson (Radio Mix)",
    "Outkast - The Way You Move (feat. Sleepy Brown) [Radio Mix]",
    "Outkast - Hey Ya!",
    "Outkast - The Way You Move (Radio Mix) [feat. Sleepy Brown]",
    "Latto - Outkast",
    "P.O.D. - Outkast (New Version + Hidden Track \"Tambura\")",
    "Belly - Outkast (feat. Ty Dolla $ign)",
    "Outkast - Hold On Be Strong",
    "Outkast - Funky Ride",
    "Outkast - Pink & Blue",
    "Outkast - You May Die (Intro)",
    "Yung Citizen - OutKast (feat. Moonlander & Rob Flo)",
    "J Doze & Kojo a. - Outkast",
    "Outkast - Dracula's Wedding (feat. Kelis)",
    "Outkast - Spread",
    "Outkast - God (Interlude)",
    "P.O.D. - Outkast (Live)",
    "Kanye West - Heartless",
    "Kanye West - Praise God",
    "Chance the Rapper - All We Got (feat. Kanye West & Chicago Children's Choir)",
    "Kanye West - God Is",
    "Rihanna and Kanye West and Paul McCartney - FourFiveSeconds",
    "Kanye West - Love Lockdown",
    "T-Pain - Buy U A Drank (Shawty Snappin') [feat. Kanye West] [Remix]",
    "Kanye West - Follow God",
    "Kanye West - Homecoming (feat. Chris Martin)",
    "Kanye West - Amazing (feat. Young Jeezy)",
    "Kanye West & XXXTENTACION - True Love",
    "Kanye West - Stronger",
    "Kanye West - Moon",
    "Kanye West - Closed on Sunday",
    "Kanye West - On God",
    "Kanye West - Selah",
    "Kanye West - I Wonder",
    "Katy Perry - E.T. (feat. Kanye West)",
    "Kanye West - Good Life (feat. T-Pain)",
    "Kanye West - Hurricane",
    "Kanye West - Gold Digger (feat. Jamie Foxx)",
    "Kanye West - Jail",
    "Kanye West & JAŸ-Z - Ni**as in Paris",
    "Kendrick Lamar - luther",
    "Kendrick Lamar - LOVE. (feat. Zacari)",
    "Maroon 5 - Don't Wanna Know (feat. Kendrick Lamar) [BRAVVO Remix]",
    "Kendrick Lamar - Not Like Us",
    "Kendrick Lamar - peekaboo (feat. AZ Chike)",
    "Kendrick Lamar - tv off (feat. Lefty Gunplay)",
    "Kendrick Lamar - squabble up",
    "Kendrick Lamar - HUMBLE."
  ],
  "electronic": [
    "Daft Punk - One More Time",
    "Daft Punk, Pharrell Williams & Nile Rodgers - Get Lucky",
    "Daft Punk - Around the World",
    "Daft Punk - Harder Better Faster Stronger",
    "Daft Punk & Julian Casablancas - Instant Crush",
    "Daft Punk & Pharrell Williams - Lose Yourself to Dance",
    "The Weeknd - I Feel It Coming (feat. Daft Punk)",
    "Daft Punk - Digital Love",
    "Daft Punk - Something About Us",
    "Daft Punk - Veridis Quo",
    "Daft Punk & Panda Bear - Doin' it Right",
    "Daft Punk - Giorgio by Moroder",
    "Pentatonix - Daft Punk",
    "The Weeknd - Starboy (feat. Daft Punk)",
    "Daft Punk - Technologic",
    "Daft Punk - Robot Rock",
    "Daft Punk - End of Line",
    "Daft Punk - Face to Face",
    "Daft Punk - Voyager",
    "Daft Punk & Paul Williams - Touch",
    "Daft Punk - Da Funk",
    "Avicii - Wake Me Up",
    "Avicii - Levels",
    "Avicii - The Nights",
    "Avicii - Hey Brother",
    "Avicii - Waiting For Love",
    "Avicii - Heaven",
    "Avicii - Levels (Radio Edit)",
    "Avicii - SOS (feat. Aloe Blacc)",
    "Avicii - For a Better Day",
    "Avicii & Nicky Romero - I Could Be the One (Avicii vs. Nicky Romero) [Nicktim Radio Edit]",
    "Avicii - The Days",
    "Avicii - Silhouettes (Radio Edit)",
    "Avicii - Lonely Together (feat. Rita Ora)",
    "Avicii - The Nights (Felix Jaehn Remix)",
    "Avicii - Addicted To You",
    "Avicii - Feeling Good",
    "Avicii - Broken Arrows",
    "Avicii - Tough Love (feat. Agnes & Vargas & Lagola)",
    "Avicii - Gonna Love Ya",
    "Avicii - What Would I Change It To (feat. Aluna)",
    "Avicii - Friend of Mine (feat. Vargas & Lagola)",
    "Avicii - You Make Me",
    "Calvin Harris - Summer",
    "Calvin Harris - Feel So Close (Radio Edit)",
    "Calvin Harris - Sweet Nothing (feat. Florence Welch)",
    "Calvin Harris & Rihanna - This Is What You Came For",
    "Calvin Harris, Disciples - How Deep Is Your Love",
    "Calvin Harris - Outside (feat. Ellie Goulding)",
    "Calvin Harris - I Need Your Love (feat. Ellie Goulding)",
    "Rihanna - We Found Love (feat. Calvin Harris)",
    "Calvin Harris - Blame (feat. John Newman)",
    "Calvin Harris - Thinking About You (feat. Ayah Marar)",
    "Calvin Harris, Dua Lipa - One Kiss",
    "Calvin Harris - My Way",
    "Calvin Harris, Sam Smith - Promises",
    "Calvin Harris - Let's Go (feat. Ne-Yo)",
    "Calvin Harris - I Need Your Love (feat. Ellie Goulding) [Remix] [Mixed]",
    "Calvin Harris & Clementine Douglas - Blessings",
    "SZA & Calvin Harris - The Weekend (Funk Wav Remix)",
    "Calvin Harris & Alesso - Under Control (feat. Hurts)",
    "Calvin Harris & Jessie Reyez - Ocean",
    "Calvin Harris - Pray to God (feat. HAIM)",
    "Calvin Harris - Bounce (feat. Kelis) [Radio Edit]",
    "Calvin Harris, Rag’n’Bone Man - Giant",
    "The Chainsmokers - Closer (feat. Halsey)",
    "The Chainsmokers - Roses (feat. ROZES)",
    "The Chainsmokers - Don't Let Me Down (feat. Daya)",
    "The Chainsmokers & Coldplay - Something Just Like This",
    "BUNT., The Chainsmokers & Izzy Bizu - Spaces",
    "The Chainsmokers - Paris",
    "John Summit, The Chainsmokers & Ilsey - ALL THE TIME",
    "The Chainsmokers - Call You Mine (feat. Bebe Rexha)",
    "The Chainsmokers - This Feeling (feat. Kelsea Ballerini)",
    "The Chainsmokers - All We Know (feat. Phoebe Ryan)",
    "The Chainsmokers & Coldplay - Something Just Like This (Alesso Remix)",
    "The Chainsmokers - Hope (feat. Winona Oak)",
    "The Chainsmokers & ILLENIUM - Takeaway (feat. Lennon Stella)",
    "The Chainsmokers - Closer (feat. Halsey) [R3hab Remix]",
    "The Chainsmokers - Side Effects (feat. Emily Warren)",
    "The Chainsmokers - Young",
    "The Chainsmokers - #SELFIE",
    "The Chainsmokers - Honest",
    "The Chainsmokers & Drew Love - Somebody",
    "The Chainsmokers - Don't Let Me Down (feat. Daya) [Illenium Remix]",
    "The Chainsmokers - Kanye (feat. sirenxx)",
    "The Chainsmokers - My Type (feat. Emily Warren)",
    "The Chainsmokers & XYLØ - Setting Fires",
    "The Chainsmokers - Sick Boy",
    "David Guetta - Titanium (feat. Sia)",
    "David Guetta - Without You (feat. Usher)",
    "David Guetta - Memories (feat. Kid Cudi)",
    "David Guetta - Play Hard (feat. Akon & Ne-Yo)",
    "David Guetta - Turn Me On (feat. Nicki Minaj)",
    "David Guetta - Hey Mama (feat. Nicki Minaj, Bebe Rexha & Afrojack)",
    "David Guetta - When Love Takes Over (feat. Kelly Rowland)",
    "David Guetta & OneRepublic - I Don't Wanna Wait",
    "David Guetta, Alphaville & Ava Max - Forever Young",
    "David Guetta, Anne-Marie & Coi Leray - Baby Don't Hurt Me",
    "David Guetta & MORTEN - Dreams (feat. Lanie Gardner)"
  ],
  "80s": [
    "Michael Jackson - Beat It",
    "Michael Jackson - Smooth Criminal",
    "Michael Jackson - Human Nature",
    "Michael Jackson - Dirty Diana",
    "Michael Jackson - Billie Jean",
    "Michael Jackson - Rock with You (Single Version)",
    "Michael Jackson - Don't Stop 'Til You Get Enough",
    "Michael Jackson - Man In the Mirror",
    "Michael Jackson - Chicago",
    "Michael Jackson - P.Y.T. (Pretty Young Thing)",
    "Michael Jackson - Thriller",
    "Michael Jackson - Remember the Time",
    "Michael Jackson - You Rock My World",
    "Michael Jackson - Bad (2012 Remaster)",
    "Michael Jackson - They Don't Care About Us",
    "Michael Jackson - Wanna Be Startin' Somethin'",
    "Michael Jackson - Heaven Can Wait",
    "Michael Jackson - The Way You Make Me Feel (Single Version)",
    "Drake & Michael Jackson - Don’t Matter To Me",
    "Michael Jackson - Black or White",
    "Michael Jackson - The Way You Make Me Feel (2012 Remaster)",
    "Michael Jackson - Liberian Girl",
    "Cyndi Lauper - Time After Time",
    "Cyndi Lauper - Girls Just Want to Have Fun",
    "Cyndi Lauper - True Colors",
    "Cyndi Lauper - All Through the Night",
    "Cyndi Lauper - She Bop",
    "Cyndi Lauper - The Goonies 'R' Good Enough (From \"The Goonies\" Soundtrack)",
    "Cyndi Lauper - I Drove All Night",
    "Cyndi Lauper - When You Were Mine",
    "Cyndi Lauper - Change of Heart",
    "Cyndi Lauper - Money Changes Everything",
    "Cyndi Lauper featuring Sarah McLachlan - Time After Time (feat. Sarah McLachlan)",
    "Cyndi Lauper - Unchained Melody",
    "Cyndi Lauper - The Goonies 'R' Good Enough",
    "Cyndi Lauper - Girls Just Wanna Have Fun",
    "Cyndi Lauper - Iko Iko",
    "Whitney Houston - I Wanna Dance with Somebody (Who Loves Me)",
    "Whitney Houston - I Will Always Love You",
    "Whitney Houston - I Have Nothing",
    "Whitney Houston - Saving All My Love for You",
    "Whitney Houston - I'm Your Baby Tonight",
    "Whitney Houston - It's Not Right But It's Okay",
    "Whitney Houston - How Will I Know",
    "Whitney Houston - Run to You",
    "Whitney Houston - Greatest Love of All",
    "Whitney Houston - Exhale (Shoop Shoop) [from \"Waiting to Exhale\" - Original Soundtrack]",
    "Whitney Houston - Where Do Broken Hearts Go",
    "Whitney Houston - You Give Good Love",
    "Whitney Houston - I'm Every Woman",
    "Kygo & Whitney Houston - Higher Love",
    "Whitney Houston - Heartbreak Hotel (feat. Faith Evans & Kelly Price)",
    "Whitney Houston - My Love Is Your Love",
    "Whitney Houston & CeCe Winans - Count On Me (from \"Waiting to Exhale\" - Original Soundtrack)",
    "Whitney Houston - All the Man That I Need",
    "Whitney Houston - I Look to You",
    "Whitney Houston - I Didn't Know My Own Strength",
    "Whitney Houston - Didn't We Almost Have It All",
    "Whitney Houston - I Will Always Love You (Film Version)",
    "Whitney Houston - So Emotional",
    "Wham! - Wake Me Up Before You Go-Go",
    "Wham! - Everything She Wants",
    "George Michael - Careless Whisper",
    "Wham! - Last Christmas (Single Version)",
    "Wham! - Freedom",
    "George Michael - Faith",
    "Wham! - Last Christmas",
    "Stevie Ray Vaughan & Double Trouble - Wham!",
    "Wham! - Last Christmas (Pudding Mix)",
    "Lonnie Mack - Wham!",
    "Santana - Wham!",
    "Stevie Ray Vaughan & Double Trouble - Wham! (Live at The El Mocambo, 1983)",
    "Mildred Bailey - Wham (Re Bop Boom Bam)",
    "Naomi & Her Handsome Devils - Wham (Re-Bop-Boom-Bam)",
    "Silver - Wham Bam Shang-a-Lang",
    "DRAM - WHAM",
    "Myaap - Wham (feat. Lilrb)",
    "Wham! - I'm Your Man",
    "CAIO & Prince - dopamina",
    "Prince & The Revolution - Purple Rain",
    "Prince - I Wanna Be Your Lover",
    "Prince - Little Red Corvette",
    "Prince & The Revolution - Kiss",
    "Prince & The Revolution - I Would Die 4 U",
    "Prince - When Doves Cry",
    "Prince & The Revolution - Raspberry Beret",
    "Prince & The Revolution - Let's Go Crazy",
    "Prince - 1999",
    "Prince & The New Power Generation - Diamonds and Pearls",
    "Prince - Do Me, Baby",
    "Prince - Nothing Compares 2 U",
    "Deftones - Prince",
    "Prince & The Revolution - Darling Nikki",
    "Vanessa Carlton - Prince",
    "Prince & The New Power Generation - Cream",
    "Prince - U Got the Look",
    "Prince - Adore (2020 Remaster)",
    "Prince & The Revolution - When Doves Cry",
    "GENER8ION - PRINCE (Les princes de la ville)",
    "Rick Astley - Never Gonna Give You Up"
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
  "custom": []
};

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

// In-memory & LocalStorage artwork cache for instant, crisp autocomplete images
const songArtworkCache = new Map();
const DEFAULT_ARTWORK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' rx='8' fill='%23222222'/%3E%3Ccircle cx='30' cy='30' r='12' fill='%23333333'/%3E%3Cpath d='M33 22v11.5a3.5 3.5 0 1 1-3-3.46V25h-5v-3h8z' fill='%2322c55e'/%3E%3C/svg%3E";

function loadArtworkCache() {
  try {
    const saved = localStorage.getItem('songuess_art_cache');
    if (saved) {
      const obj = JSON.parse(saved);
      for (const [k, v] of Object.entries(obj)) {
        songArtworkCache.set(k, v);
      }
    }
  } catch (e) { }
}

function saveArtworkCache() {
  try {
    const obj = {};
    let count = 0;
    for (const [k, v] of songArtworkCache.entries()) {
      if (count++ > 600) break;
      obj[k] = v;
    }
    localStorage.setItem('songuess_art_cache', JSON.stringify(obj));
  } catch (e) { }
}

async function getOrFetchArtwork(trackName, artistName) {
  const key = normalizeSearchStr(trackName) + '::' + normalizeSearchStr(artistName);
  if (songArtworkCache.has(key)) {
    return songArtworkCache.get(key);
  }

  try {
    const query = `${artistName} ${trackName}`;
    const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=1&media=music';
    const data = await fetchJsonp(url, 3000);
    if (data && data.results && data.results.length > 0) {
      const r = data.results[0];
      const art = r.artworkUrl60 || r.artworkUrl100;
      if (art) {
        songArtworkCache.set(key, art);
        saveArtworkCache();
        return art;
      }
    }
  } catch (e) { }

  return null;
}

// Live Track Metadata & Preview Audio Fetcher
async function fetchTrackData(query) {
  try {
    const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=5&media=music';
    const data = await fetchJsonp(url, 4000);
    if (data && data.results && data.results.length > 0) {
      for (const r of data.results) {
        if (r.previewUrl && r.trackName && r.artistName) {
          const artwork600 = (r.artworkUrl100 || r.artworkUrl60 || '').replace('100x100bb', '600x600bb');
          const artThumbnail = r.artworkUrl60 || r.artworkUrl100 || artwork600;
          const key = normalizeSearchStr(r.trackName) + '::' + normalizeSearchStr(r.artistName);
          songArtworkCache.set(key, artThumbnail);
          songArtworkCache.set(normalizeSearchStr(query), artThumbnail);
          saveArtworkCache();

          return {
            title: r.trackName,
            artist: r.artistName,
            album: r.collectionName || '',
            artwork: artwork600,
            previewUrl: r.previewUrl,
            link: r.trackViewUrl || r.collectionViewUrl || '#'
          };
        }
      }
    }
  } catch (err) {
    console.warn('Live track fetch failed for query:', query, err);
  }
  return null;
}
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
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
  }

  if (currentUsername) {
    if (!profiles[currentUsername]) {
      profiles[currentUsername] = legacyData || Object.assign({}, DEFAULT_STATS);
    }
    stats = profiles[currentUsername];
  } else {
    stats = Object.assign({}, DEFAULT_STATS);
  }

  loadPlayedHistory();
  loadArtworkCache();
  updateStatsDisplay();
}

// Played History Tracker to Prevent Repeating Songs
let playedHistoryByCategory = {};

function loadPlayedHistory() {
  try {
    const saved = localStorage.getItem('songuess_played_history');
    if (saved) {
      playedHistoryByCategory = JSON.parse(saved);
    } else {
      playedHistoryByCategory = {};
    }
  } catch (e) {
    playedHistoryByCategory = {};
  }
}

function savePlayedHistory() {
  try {
    localStorage.setItem('songuess_played_history', JSON.stringify(playedHistoryByCategory));
  } catch (e) { }
}

function getSongUniqueKey(song) {
  return normalizeSearchStr(song.title) + '::' + normalizeSearchStr(song.artist);
}

function pickNextNonRepeatingSong(genre) {
  const pool = GENRE_SONGS[genre] || GENRE_SONGS['white-girl-music'] || [];
  if (pool.length === 0) return 'Taylor Swift - Cruel Summer';

  if (!playedHistoryByCategory[genre]) {
    playedHistoryByCategory[genre] = [];
  }

  const playedSet = new Set(playedHistoryByCategory[genre]);
  let available = pool.filter(s => !playedSet.has(normalizeSearchStr(s)));

  // If all songs in this genre have been played, reset history but keep the last 5 to prevent immediate repeats
  if (available.length === 0) {
    const recent5 = playedHistoryByCategory[genre].slice(-5);
    playedHistoryByCategory[genre] = recent5;
    const recentSet = new Set(recent5);
    available = pool.filter(s => !recentSet.has(normalizeSearchStr(s)));
    if (available.length === 0) available = pool;
  }

  // Pick random from remaining unplayed pool
  const chosen = available[Math.floor(Math.random() * available.length)];
  const chosenKey = normalizeSearchStr(chosen);

  // Record into played history
  playedHistoryByCategory[genre].push(chosenKey);
  savePlayedHistory();

  return chosen;
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

// Search Helper: Normalize strings for fuzzy comparison
function normalizeSearchStr(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Get prioritized instant matches from local database (always preserved at top)
function getLocalMatches(query, max = 8) {
  const qClean = query.toLowerCase().trim();
  const qNorm = normalizeSearchStr(query);
  if (!qNorm) return [];

  const scored = [];
  const seenKeys = new Set();

  for (const genre of Object.keys(GENRE_SONGS)) {
    for (const songStr of GENRE_SONGS[genre]) {
      const key = normalizeSearchStr(songStr);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const parts = songStr.split(' - ');
      const artist = parts[0] ? parts[0].trim() : '';
      const title = parts[1] ? parts[1].trim() : songStr;
      const lowerStr = songStr.toLowerCase();

      let score = 0;
      if (lowerStr.startsWith(qClean) || title.toLowerCase().startsWith(qClean) || artist.toLowerCase().startsWith(qClean)) {
        score = 4;
      } else if (lowerStr.includes(qClean)) {
        score = 2;
      } else if (normalizeSearchStr(lowerStr).includes(qNorm)) {
        score = 1;
      }

      if (score > 0) {
        const songKey = normalizeSearchStr(title) + '::' + normalizeSearchStr(artist);
        const cachedArt = songArtworkCache.get(songKey) || songArtworkCache.get(normalizeSearchStr(songStr)) || DEFAULT_ARTWORK_SVG;

        scored.push({
          score,
          item: {
            trackName: title,
            artistName: artist,
            collectionName: '',
            artworkUrl60: cachedArt
          }
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score || a.item.trackName.length - b.item.trackName.length);
  return scored.slice(0, max).map(x => x.item);
}

// Live Autocomplete Search (Local Instant + JSONP/Fetch Fallback with Artwork Enrichment)
async function searchItunes(query, limit = 8) {
  const localMatches = getLocalMatches(query, limit);

  try {
    const liveData = await fetchJsonp('https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&limit=12&media=music');
    if (liveData && liveData.results && liveData.results.length > 0) {
      // 1. Cache all live artwork received
      for (const r of liveData.results) {
        if (r.trackName && r.artistName) {
          const key = normalizeSearchStr(r.trackName) + '::' + normalizeSearchStr(r.artistName);
          const art = r.artworkUrl60 || r.artworkUrl100;
          if (art) songArtworkCache.set(key, art);
        }
      }

      // 2. Enrich local matches with real artwork from live data or cache
      for (const lm of localMatches) {
        const lmKey = normalizeSearchStr(lm.trackName) + '::' + normalizeSearchStr(lm.artistName);
        if (songArtworkCache.has(lmKey)) {
          lm.artworkUrl60 = songArtworkCache.get(lmKey);
        } else {
          const liveMatch = liveData.results.find(r => 
            normalizeSearchStr(r.trackName) === normalizeSearchStr(lm.trackName) ||
            (normalizeSearchStr(r.trackName).includes(normalizeSearchStr(lm.trackName)) && normalizeSearchStr(r.artistName).includes(normalizeSearchStr(lm.artistName)))
          );
          if (liveMatch && (liveMatch.artworkUrl60 || liveMatch.artworkUrl100)) {
            const art = liveMatch.artworkUrl60 || liveMatch.artworkUrl100;
            lm.artworkUrl60 = art;
            if (liveMatch.collectionName) lm.collectionName = liveMatch.collectionName;
            songArtworkCache.set(lmKey, art);
          }
        }
      }

      // 3. Combine local matches (with updated real artwork) + new unique live matches
      const combined = [...localMatches];
      const seen = new Set(localMatches.map(lm => normalizeSearchStr(lm.trackName) + '::' + normalizeSearchStr(lm.artistName)));

      for (const r of liveData.results) {
        if (!r.trackName || !r.artistName) continue;
        const key = normalizeSearchStr(r.trackName) + '::' + normalizeSearchStr(r.artistName);
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(r);
        }
      }
      return combined.slice(0, Math.max(limit, localMatches.length));
    }
  } catch (err) { }

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


// ==========================================
// CUSTOM PLAYLIST & ALBUM ENGINE
// ==========================================
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

let stagedCustomPlaylist = {
  title: '',
  tracks: []
};

function loadSavedCustomPlaylist() {
  try {
    const saved = localStorage.getItem('songuess_custom_playlist');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        GENRE_SONGS['custom'] = parsed.tracks;
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
      listEl.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 4px 0;">No tracks loaded yet. Import a Spotify link, search an album, or choose a featured preset above.</div>';
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

  if (!rawInput) {
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';

  try {
    // 1. Apple Music URL
    const appleMatch = rawInput.match(/apple\.com\/.*\/album\/([^\/]+)\/(\d+)/i) || rawInput.match(/id=(\d+)/i);
    if (appleMatch) {
      const collectionId = appleMatch[2] || appleMatch[1];
      if (/^\d+$/.test(collectionId)) {
        const lookupUrl = 'https://itunes.apple.com/lookup?id=' + collectionId + '&entity=song';
        const lookupData = await fetchJsonp(lookupUrl, 4000);
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
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded!';
            setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
            return;
          }
        }
      }
    }

    // 2. Extract slug or title from Spotify / web URL
    let extractedQuery = rawInput;
    if (rawInput.includes('spotify.com') || rawInput.startsWith('http')) {
      const cleanUrl = rawInput.split('?')[0].replace(/\/$/, '');
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1] || '';
      
      if (lastPart.includes('-')) {
        extractedQuery = decodeURIComponent(lastPart.replace(/^[a-zA-Z0-9]{22}-?/, '').replace(/-/g, ' '));
      } else {
        try {
          const oembedRes = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(rawInput));
          if (oembedRes.ok) {
            const oembedJson = await oembedRes.json();
            if (oembedJson && oembedJson.title) {
              extractedQuery = oembedJson.title;
            }
          }
        } catch (e) { }
      }
    }

    // 3. Search Apple Music / iTunes for this album or artist
    if (extractedQuery && !extractedQuery.startsWith('http')) {
      const searchData = await fetchAlbumTracksFromItunes(extractedQuery);
      if (searchData && searchData.tracks.length > 0) {
        stagedCustomPlaylist = searchData;
        updateCustomModalPreview();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded!';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import'; }, 1500);
        return;
      }
    }

    // 4. If direct auto-lookup didn't find exact matches, switch to the Search Album tab pre-filled with the query
    const searchTabBtn = document.querySelector('.custom-tab-btn[data-tab="search-album"]');
    const searchInput = document.getElementById('custom-album-query');
    if (searchTabBtn && searchInput) {
      searchInput.value = (extractedQuery && !extractedQuery.startsWith('http')) ? extractedQuery : '';
      searchTabBtn.click();
      if (searchInput.value) handleAlbumSearch();
    }
  } catch (err) {
    console.error('Import error:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Import';
  }
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
  try {
    localStorage.setItem('songuess_custom_playlist', JSON.stringify(stagedCustomPlaylist));
  } catch (e) { }

  hideCustomModal();
  startNewGame('custom');
}

function setupEvents() {

  // Custom Playlist Modal Controls
  loadSavedCustomPlaylist();

  const closeCustomBtn = document.getElementById('btn-close-custom-modal');
  if (closeCustomBtn) closeCustomBtn.addEventListener('click', hideCustomModal);

  const fetchSpotifyBtn = document.getElementById('btn-fetch-spotify');
  if (fetchSpotifyBtn) fetchSpotifyBtn.addEventListener('click', handleSpotifyImport);

  const searchAlbumBtn = document.getElementById('btn-search-album');
  if (searchAlbumBtn) searchAlbumBtn.addEventListener('click', handleAlbumSearch);
  const albumInput = document.getElementById('custom-album-query');
  if (albumInput) {
    albumInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAlbumSearch();
    });
  }

  const applyPastedBtn = document.getElementById('btn-apply-pasted-songs');
  if (applyPastedBtn) applyPastedBtn.addEventListener('click', handlePastedSongs);

  const startCustomBtn = document.getElementById('btn-start-custom-game');
  if (startCustomBtn) startCustomBtn.addEventListener('click', startCustomGameFromModal);

  // Tabs switching
  document.querySelectorAll('.custom-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const tabName = tabBtn.dataset.tab;
      document.querySelectorAll('.custom-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.custom-tab-pane').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const targetPane = document.getElementById('tab-pane-' + tabName);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Presets buttons
  document.querySelectorAll('.preset-pill-btn').forEach(pBtn => {
    pBtn.addEventListener('click', () => {
      synth.playClick();
      applyCustomPreset(pBtn.dataset.preset);
    });
  });

  // Top Pills Navigation in Game Screen
  document.querySelectorAll('.genre-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      synth.playClick();
      const genre = pill.dataset.genre;
      if (genre === 'custom') {
        const customSongs = GENRE_SONGS['custom'] || [];
        if (customSongs.length === 0 || pill.classList.contains('active')) {
          openCustomModal();
          return;
        }
      }
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
let currentGameLoadToken = 0;

async function startNewGame(genre) {
  const loadToken = ++currentGameLoadToken;
  gameState.currentCategory = genre;
  gameState.attemptsUsed = 0;
  gameState.guesses = [];
  gameState.isFinished = false;
  gameState.hasWon = false;
  gameState.currentSong = null;

  // Update active genre pill
  document.querySelectorAll('.genre-pill-btn').forEach(pill => {
    if (pill.dataset.genre === genre) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  resetGameUI();

  const feedback = document.getElementById('game-feedback-text');
  if (feedback) {
    feedback.textContent = "Loading song snippet...";
    feedback.style.color = "var(--text-secondary)";
  }

  // Pick song query string using non-repeating deck algorithm
  const songQuery = pickNextNonRepeatingSong(genre);

  // Fetch live audio preview and artwork from Apple Music on the fly
  let trackData = await fetchTrackData(songQuery);

  if (loadToken !== currentGameLoadToken) return;

  if (!trackData) {
    const fallbackQuery = songQuery.split('-')[0].trim();
    trackData = await fetchTrackData(fallbackQuery);
  }

  if (loadToken !== currentGameLoadToken) return;

  if (trackData) {
    gameState.currentSong = trackData;
    audioEl.src = gameState.currentSong.previewUrl;
    audioEl.load();

    if (feedback) {
      feedback.textContent = "Listen to snippet and guess the song";
      feedback.style.color = "var(--text-secondary)";
    }
  } else {
    // If Apple API failed, fallback to next song
    if (feedback) {
      feedback.textContent = "Loading next song...";
    }
    setTimeout(() => {
      if (loadToken === currentGameLoadToken) startNewGame(genre);
    }, 400);
  }
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
let latestSearchQuery = '';

function handleAutocompleteSearch(query) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  const trimmed = query ? query.trim() : '';
  latestSearchQuery = trimmed;

  if (trimmed.length < 2) {
    hideDropdown();
    return;
  }

  // 1. Instant local suggestions (0ms) - Never flicker or get pushed off
  const instantMatches = getLocalMatches(trimmed, 8);
  if (instantMatches.length > 0) {
    renderAutocompleteDropdown(instantMatches, trimmed);
  }

  // 2. Debounced live search to augment if needed
  searchDebounceTimer = setTimeout(async () => {
    // Only proceed if this search query is still the latest one user typed
    if (latestSearchQuery !== trimmed) return;
    const currentInputVal = (document.getElementById('guess-input').value || '').trim();
    if (currentInputVal !== trimmed) return;

    const results = await searchItunes(trimmed, 8);

    // Double check after async fetch that user hasn't changed query
    if (latestSearchQuery === trimmed) {
      renderAutocompleteDropdown(results, trimmed);
    }
  }, 180);
}

function renderAutocompleteDropdown(results, forQuery) {
  const currentInputVal = (document.getElementById('guess-input').value || '').trim();
  if (forQuery && currentInputVal !== forQuery) {
    // Stale results from a previous keystroke; do not overwrite
    return;
  }

  const dropdown = document.getElementById('autocomplete-dropdown');
  dropdown.innerHTML = '';
  currentSuggestions = results || [];
  currentHighlightedIndex = -1;

  if (!results || results.length === 0) {
    hideDropdown();
    return;
  }

  results.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.dataset.index = index;

    const itemKey = normalizeSearchStr(item.trackName) + '::' + normalizeSearchStr(item.artistName);
    const cachedArt = songArtworkCache.get(itemKey);
    const artUrl = (item.artworkUrl60 && item.artworkUrl60.startsWith('http')) ? item.artworkUrl60 : (cachedArt || DEFAULT_ARTWORK_SVG);
    const albumInfo = item.collectionName ? ('• ' + item.collectionName) : '';
    const imgId = 'sug-art-' + index + '-' + Math.round(Math.random() * 100000);

    div.innerHTML = '<img id="' + imgId + '" class="suggestion-artwork" src="' + artUrl + '" alt="Artwork" onerror="this.onerror=null;this.src=\'' + DEFAULT_ARTWORK_SVG + '\'">' +
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

    // Asynchronously resolve real album art if not yet loaded
    if (!artUrl.startsWith('http') || artUrl === DEFAULT_ARTWORK_SVG) {
      getOrFetchArtwork(item.trackName, item.artistName).then(realArt => {
        if (realArt) {
          const img = document.getElementById(imgId);
          if (img) img.src = realArt;
          item.artworkUrl60 = realArt;
        }
      });
    }
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
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '')
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
      } catch (e) { }
    }
  } else if (oldUsername !== name) {
    if (profiles[oldUsername] && !profiles[name]) {
      const shouldRename = confirm('Do you want to RENAME your current profile "' + oldUsername + '" to "' + name + '" (keeps your stats)?\n\nClick Cancel to switch/create a new profile.');
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
      } catch (e) { }
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
