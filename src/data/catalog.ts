export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

export type Genre = 'Sci-Fi' | 'Thriller' | 'Drama' | 'Action' | 'Animation' | 'Documentary';

export interface MovieReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface VJTranslationInfo {
  vjName: 'VJ Junior' | 'VJ Emmy' | 'VJ Ice P' | 'VJ Jingo';
  language: 'Luganda' | 'Swahili' | 'Luganda & Swahili';
  trackLabel: string;
  narrationSample: string;
}

export interface MovieItem {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  year: number;
  runtimeMinutes: number;
  genres: Genre[];
  rating: MaturityRating;
  score: number;
  director: string;
  cast: string[];
  backdropUrl: string;
  posterUrl: string;
  videoFormats: string[];
  audioFormats: string[];
  vjTranslation?: VJTranslationInfo;
  trailerDurationSec: number;
  continueProgress?: number;
  downloadSizes: {
    uhd4k: string;
    hd1080: string;
    sd720: string;
  };
  featured?: boolean;
  reviews: MovieReview[];
}

export const MOVIES_CATALOG: MovieItem[] = [
  {
    id: 'mov_aether',
    title: 'The Aether Protocol',
    tagline: 'Orbit is silent when telemetry stops answering.',
    synopsis:
      'When an automated cryosphere relay above Kepler-442b transmits an impossible acoustic pattern, systems engineer Linnea Lindqvist boards a skeletal orbital tether to recover the black box before atmospheric decay erases the evidence.',
    year: 2026,
    runtimeMinutes: 138,
    genres: ['Sci-Fi', 'Thriller'],
    rating: 'PG-13',
    score: 8.9,
    director: 'Soren Lindqvist',
    cast: ['Rebecca Ferguson', 'Dev Patel', 'Stellan Skarsgard', 'Gugu Mbatha-Raw'],
    backdropUrl: '/src/assets/images/movie_aether_protocol_1794855219854.jpg',
    posterUrl: '/src/assets/images/movie_aether_protocol_1794855219854.jpg',
    videoFormats: ['4K UHD', 'Dolby Vision', 'HDR10+'],
    audioFormats: ['Dolby Atmos', 'English 5.1', 'VJ Junior (Luganda)'],
    vjTranslation: {
      vjName: 'VJ Junior',
      language: 'Luganda',
      trackLabel: 'VJ Junior · Luganda Commentary',
      narrationSample: '“Mukwano gwe, obubaka bujja okuva mu bwengula tebulina sipiidi ya bulijjo!”',
    },
    trailerDurationSec: 132,
    continueProgress: 42,
    downloadSizes: {
      uhd4k: '6.8 GB',
      hd1080: '2.4 GB',
      sd720: '1.1 GB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_1',
        author: 'Marcus Vance',
        rating: 5,
        date: '2026-11-04',
        comment:
          'Breathtaking sound design in Dolby Atmos. The orbital EVA sequence alone justifies watching in 4K.',
      },
      {
        id: 'rev_2',
        author: 'Elena Rostova',
        rating: 4,
        date: '2026-10-29',
        comment:
          'Patient hard science fiction with extraordinary visual depth.',
      },
    ],
  },
  {
    id: 'mov_velvet',
    title: 'Velvet Meridian',
    tagline: 'Every border in Vienna has two sets of keys.',
    synopsis:
      'A retired cryptographic courier is pulled back into a single winter night in Vienna after an analog tape reel surfaces containing the voices of three diplomats who supposedly never met.',
    year: 2025,
    runtimeMinutes: 124,
    genres: ['Thriller', 'Drama'],
    rating: 'R',
    score: 8.6,
    director: 'Claire Denis-Moreau',
    cast: ['Franz Rogowski', 'Lea Seydoux', 'Mads Mikkelsen'],
    backdropUrl: '/src/assets/images/movie_velvet_meridian_1794855220515.jpg',
    posterUrl: '/src/assets/images/movie_velvet_meridian_1794855220515.jpg',
    videoFormats: ['4K UHD', 'HDR10'],
    audioFormats: ['Dolby Atmos', 'German / English Dual', 'VJ Jingo (Luganda)'],
    vjTranslation: {
      vjName: 'VJ Jingo',
      language: 'Luganda',
      trackLabel: 'VJ Jingo · Luganda Voiceover',
      narrationSample: '“Enkuba etonya e Vienna, naye akakodyo ka kasitaali tekakyuka.”',
    },
    trailerDurationSec: 118,
    continueProgress: 76,
    downloadSizes: {
      uhd4k: '5.9 GB',
      hd1080: '2.1 GB',
      sd720: '940 MB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_3',
        author: 'Jonas Richter',
        rating: 5,
        date: '2026-11-01',
        comment: 'Rain-soaked neo-noir perfection. Shot on 35mm and mastered cleanly.',
      },
    ],
  },
  {
    id: 'mov_solaris',
    title: 'Solaris Trench',
    tagline: 'Four kilometers below sunlight, the bedrock remembers.',
    synopsis:
      'An oceanography crew piloting an experimental titanium bathyscaphe discovers geometric basalt spires emitting rhythmic magnetic pulses along the Kermadec subduction zone.',
    year: 2026,
    runtimeMinutes: 131,
    genres: ['Sci-Fi', 'Documentary'],
    rating: 'PG-13',
    score: 8.4,
    director: 'Denis Takahata',
    cast: ['Jodie Comer', 'Oscar Isaac', 'Hiroyuki Sanada'],
    backdropUrl: '/src/assets/images/movie_solaris_drift_1794855220957.jpg',
    posterUrl: '/src/assets/images/movie_solaris_drift_1794855220957.jpg',
    videoFormats: ['4K UHD', 'Dolby Vision'],
    audioFormats: ['Dolby Atmos', '5.1 Surround', 'VJ Emmy (Swahili)'],
    vjTranslation: {
      vjName: 'VJ Emmy',
      language: 'Swahili',
      trackLabel: 'VJ Emmy · Swahili Narration',
      narrationSample: '“Chini ya bahari kuu, mwamba huu unatoa sauti za ajabu kabisa.”',
    },
    trailerDurationSec: 105,
    downloadSizes: {
      uhd4k: '6.2 GB',
      hd1080: '2.2 GB',
      sd720: '980 MB',
    },
    reviews: [
      {
        id: 'rev_4',
        author: 'Priya Nair',
        rating: 4,
        date: '2026-10-18',
        comment: 'Claustrophobic and hypnotic. Saved offline for a transatlantic flight and looked razor sharp.',
      },
    ],
  },
  {
    id: 'mov_symphony',
    title: 'Glass Symphony',
    tagline: 'Architecture is frozen music until the fjord answers back.',
    synopsis:
      'Over one turbulent autumn rehearsal week, a world-renowned acoustician and an uncompromising conductor clash inside a cantilevered Norwegian concert hall built directly into a sheer granite cliff.',
    year: 2025,
    runtimeMinutes: 116,
    genres: ['Drama'],
    rating: 'PG-13',
    score: 8.7,
    director: 'Joachim Trier-Berg',
    cast: ['Renate Reinsve', 'Cate Blanchett', 'Anders Danielsen Lie'],
    backdropUrl: '/src/assets/images/movie_glass_symphony_1794855221505.jpg',
    posterUrl: '/src/assets/images/movie_glass_symphony_1794855221505.jpg',
    videoFormats: ['4K UHD', 'HDR10+'],
    audioFormats: ['Dolby Atmos', '24-bit Stereo'],
    trailerDurationSec: 94,
    downloadSizes: {
      uhd4k: '5.4 GB',
      hd1080: '1.9 GB',
      sd720: '860 MB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_5',
        author: 'Clara Lind',
        rating: 5,
        date: '2026-10-22',
        comment: 'Every architectural frame belongs in a gallery.',
      },
    ],
  },
  {
    id: 'mov_kestrel',
    title: 'Kestrel Run',
    tagline: 'Mach 1.8 through a shrinking alpine corridor.',
    synopsis:
      'Following a mid-winter transponder blackout over the Bernese Alps, two test pilots fly a stripped prototype reconnaissance airframe into storm turbulence to intercept a rogue telemetry drone.',
    year: 2026,
    runtimeMinutes: 119,
    genres: ['Action', 'Thriller'],
    rating: 'R',
    score: 8.2,
    director: 'Joseph Kosinski-Vane',
    cast: ['Glen Powell', 'Aldis Hodge', 'Florence Pugh'],
    backdropUrl: '/src/assets/images/movie_kestrel_run_1794855221145.jpg',
    posterUrl: '/src/assets/images/movie_kestrel_run_1794855221145.jpg',
    videoFormats: ['4K UHD', 'IMAX Enhanced', 'Dolby Vision'],
    audioFormats: ['Dolby Atmos', '5.1 Surround', 'VJ Ice P (Luganda)'],
    vjTranslation: {
      vjName: 'VJ Ice P',
      language: 'Luganda',
      trackLabel: 'VJ Ice P · Luganda Action Track',
      narrationSample: '“Ennyonyi ekyuse ku misinde gya Mach 1.8 wakati w’ensozi ezirimu omuzira!”',
    },
    trailerDurationSec: 128,
    continueProgress: 19,
    downloadSizes: {
      uhd4k: '6.1 GB',
      hd1080: '2.3 GB',
      sd720: '1.0 GB',
    },
    reviews: [
      {
        id: 'rev_6',
        author: 'Theo Callahan',
        rating: 4,
        date: '2026-11-08',
        comment: 'Practical cockpit photography makes every banking turn feel visceral.',
      },
    ],
  },
  {
    id: 'mov_lanterns',
    title: 'Valley of Paper Lanterns',
    tagline: 'Some lights are meant to find their way home.',
    synopsis:
      'During the night of the autumn equinox, a young bridge-keeper sets off across mist-draped mountain terraces to return a stray ember lantern before the valley winds go quiet for winter.',
    year: 2025,
    runtimeMinutes: 102,
    genres: ['Animation'],
    rating: 'G',
    score: 9.1,
    director: 'Makoto Miyazaki-Lin',
    cast: ['Aoi Yuki', 'Brian Tyree Henry', 'Michelle Yeoh'],
    backdropUrl: '/src/assets/images/movie_paper_lanterns_1794855221815.jpg',
    posterUrl: '/src/assets/images/movie_paper_lanterns_1794855221815.jpg',
    videoFormats: ['4K UHD', 'Dolby Vision'],
    audioFormats: ['Dolby Atmos', 'Japanese / English'],
    trailerDurationSec: 98,
    downloadSizes: {
      uhd4k: '4.7 GB',
      hd1080: '1.7 GB',
      sd720: '780 MB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_7',
        author: 'Hannah Cho',
        rating: 5,
        date: '2026-11-11',
        comment: 'Warm, luminous storytelling the whole family can watch together.',
      },
    ],
  },
  {
    id: 'mov_kampala',
    title: 'Kampala Express',
    tagline: 'One midnight highway run across the city lights.',
    synopsis:
      'When a courier intercepts an encrypted hard drive on the Entebbe-Kampala expressway during a monsoon downpour, he has until dawn to cross seven checkpoints before a syndicate locks down the bridges.',
    year: 2026,
    runtimeMinutes: 114,
    genres: ['Action', 'Thriller'],
    rating: 'PG-13',
    score: 9.0,
    director: 'Dilman Dila',
    cast: ['Michael Wawuyo Jr.', 'Joanita Bewulira-Wandera', 'Rehema Nanfuka'],
    backdropUrl: '/src/assets/images/movie_kampala_express_1794856759262.jpg',
    posterUrl: '/src/assets/images/movie_kampala_express_1794856759262.jpg',
    videoFormats: ['4K UHD', 'HDR10+'],
    audioFormats: ['VJ Junior (Luganda)', 'English / Luganda 5.1'],
    vjTranslation: {
      vjName: 'VJ Junior',
      language: 'Luganda',
      trackLabel: 'VJ Junior · Luganda Full Translation',
      narrationSample: '“Toli mu lugezigezi, vuga emotoka tuyite ku lutindo nga tebanaba kuggala kkubo!”',
    },
    trailerDurationSec: 112,
    continueProgress: 64,
    downloadSizes: {
      uhd4k: '5.6 GB',
      hd1080: '2.0 GB',
      sd720: '910 MB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_8',
        author: 'Samuel Kigozi',
        rating: 5,
        date: '2026-11-14',
        comment: 'VJ Junior brings unmatched energy to every chase scene on the expressway.',
      },
    ],
  },
  {
    id: 'mov_nairobi',
    title: 'Nairobi Mirage',
    tagline: 'High above the savannah skyline, every reflection hides a vault.',
    synopsis:
      'An architectural security designer and a rogue acoustic engineer team up inside a glass-bridged financial tower overlooking the national park to recover stolen climate-bond blueprints before sunset.',
    year: 2026,
    runtimeMinutes: 122,
    genres: ['Sci-Fi', 'Drama'],
    rating: 'PG-13',
    score: 8.8,
    director: 'Wanuri Kahiu-Moraa',
    cast: ['Lupita Nyongo', 'Edi Gathegi', 'Biko Nyongesa'],
    backdropUrl: '/src/assets/images/movie_nairobi_mirage_1794856760135.jpg',
    posterUrl: '/src/assets/images/movie_nairobi_mirage_1794856760135.jpg',
    videoFormats: ['4K UHD', 'Dolby Vision'],
    audioFormats: ['VJ Emmy (Luganda & Swahili)', 'Dolby Atmos'],
    vjTranslation: {
      vjName: 'VJ Emmy',
      language: 'Luganda & Swahili',
      trackLabel: 'VJ Emmy · Luganda & Swahili Dual Track',
      narrationSample: '“Angalia juu ya daraja la kioo—wakati unayoyoma kabla jua halijatua.”',
    },
    trailerDurationSec: 120,
    downloadSizes: {
      uhd4k: '6.0 GB',
      hd1080: '2.2 GB',
      sd720: '960 MB',
    },
    featured: true,
    reviews: [
      {
        id: 'rev_9',
        author: 'Amina Hassan',
        rating: 5,
        date: '2026-11-15',
        comment: 'Dual Luganda and Swahili VJ narration with crystal clear 4K visuals.',
      },
    ],
  },
];
